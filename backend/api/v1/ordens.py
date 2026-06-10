from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from ...database import get_db_connection
from ..deps import get_current_user
from ...websocket import sio, manager_namespace, driver_namespace

from ...models.usuario import Usuario as UsuarioModel
from ...models.motorista import Motorista as MotoristaModel

router = APIRouter()

# ============================================
# SCHEMAS
# ============================================
class OrdemResponse(BaseModel):
    id: int
    uuid: str
    numero_os: str
    status: str
    prioridade: str
    origem_endereco: str
    origem_lat: float
    origem_lng: float
    destino_endereco: str
    destino_lat: float
    destino_lng: float
    data_inicio: Optional[datetime] = None
    distancia_km: Optional[float] = None
    ocorrencia_id: int
    descricao: Optional[str] = None
    imagem_path: Optional[str] = None
    tipo_nome: Optional[str] = None

# ============================================
# HELPERS
# ============================================
def get_cursor(conn):
    """Retorna um cursor que sempre entrega dicionários."""
    try:
        # Se for MySQL (mysql-connector)
        return conn.cursor(dictionary=True)
    except:
        # Se for SQLite
        def dict_factory(cursor, row):
            d = {}
            for idx, col in enumerate(cursor.description):
                d[col[0]] = row[idx]
            return d
        conn.row_factory = dict_factory
        return conn.cursor()

# ============================================
# ENDPOINTS
# ============================================

@router.get("/pendentes", response_model=List[OrdemResponse])
async def listar_ordens_pendentes(current_user: UsuarioModel = Depends(get_current_user)):
    # Normalização robusta do papel
    user_role = current_user.papel
    if hasattr(user_role, 'value'):
        user_role = user_role.value
    user_role = str(user_role).upper().strip()
    
    with open("debug_auth.log", "a") as f:
        f.write(f"[{datetime.now()}] User: {current_user.email}, Role: {user_role}\n")

    if user_role not in ["MOTORISTA", "ADMIN"]:
        raise HTTPException(status_code=403, detail=f"Acesso negado para o papel: {user_role}")
    
    conn = get_db_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute("""
            SELECT os.*, o.descricao, o.imagem_path, t.nome as tipo_nome
            FROM ordens_servico os
            JOIN ocorrencias o ON os.ocorrencia_id = o.id
            LEFT JOIN tipos_ocorrencia t ON o.tipo_id = t.id
            WHERE os.status = 'ABERTA' AND os.motorista_id IS NULL
            ORDER BY os.created_at ASC LIMIT 50
        """)
        rows = cursor.fetchall()
        return rows
    finally:
        cursor.close()
        conn.close()

@router.get("/minhas", response_model=List[OrdemResponse])
async def listar_minhas_ordens(current_user: UsuarioModel = Depends(get_current_user)):
    user_role = current_user.papel
    if hasattr(user_role, 'value'):
        user_role = user_role.value
    user_role = str(user_role).upper().strip()

    if user_role != "MOTORISTA":
        raise HTTPException(status_code=403, detail=f"Acesso apenas motoristas. Papel atual: {user_role}")

    conn = get_db_connection()
    is_sqlite = not hasattr(conn, "ping")
    placeholder = "?" if is_sqlite else "%s"
    
    cursor = get_cursor(conn)
    try:
        # Buscar motorista_id
        cursor.execute(f"SELECT id FROM motoristas WHERE usuario_id = {placeholder}", (current_user.id,))
        m = cursor.fetchone()
        if not m: raise HTTPException(status_code=404, detail="Motorista não encontrado")
        motorista_id = m['id']

        cursor.execute(f"""
            SELECT os.*, o.descricao, o.imagem_path, t.nome as tipo_nome
            FROM ordens_servico os
            JOIN ocorrencias o ON os.ocorrencia_id = o.id
            LEFT JOIN tipos_ocorrencia t ON o.tipo_id = t.id
            WHERE os.motorista_id = {placeholder} AND os.status NOT IN ('CONCLUIDA', 'CANCELADA')
            ORDER BY os.created_at DESC
        """, (motorista_id,))
        rows = cursor.fetchall()
        return rows
    finally:
        cursor.close()
        conn.close()

@router.put("/{ordem_id}/aceitar")
async def aceitar_ordem(ordem_id: int, current_user: UsuarioModel = Depends(get_current_user)):
    if current_user.papel != "MOTORISTA":
        raise HTTPException(status_code=403, detail="Acesso apenas motoristas")

    conn = get_db_connection()
    is_sqlite = not hasattr(conn, "ping")
    placeholder = "?" if is_sqlite else "%s"
    cursor = get_cursor(conn)
    try:
        cursor.execute(f"SELECT id FROM motoristas WHERE usuario_id = {placeholder}", (current_user.id,))
        m = cursor.fetchone()
        motorista_id = m['id']

        cursor.execute(f"UPDATE ordens_servico SET motorista_id = {placeholder}, status = 'ACEITA', data_inicio_efetivo = {placeholder} WHERE id = {placeholder}", (motorista_id, datetime.utcnow(), ordem_id))
        conn.commit()
        await sio.emit('ordem_atualizada', {'ordem_id': ordem_id, 'status': 'ACEITA'}, room='managers', namespace=manager_namespace)
        return {"success": True}
    finally:
        cursor.close()
        conn.close()

@router.put("/{ordem_id}/iniciar")
async def iniciar_rota(ordem_id: int, current_user: UsuarioModel = Depends(get_current_user)):
    if current_user.papel != "MOTORISTA":
        raise HTTPException(status_code=403, detail="Acesso apenas motoristas")

    conn = get_db_connection()
    is_sqlite = not hasattr(conn, "ping")
    placeholder = "?" if is_sqlite else "%s"
    cursor = conn.cursor()
    try:
        cursor.execute(f"UPDATE ordens_servico SET status = 'EM_ROTA', data_inicio = {placeholder} WHERE id = {placeholder}", (datetime.utcnow(), ordem_id))
        conn.commit()
        await sio.emit('ordem_atualizada', {'ordem_id': ordem_id, 'status': 'EM_ROTA'}, room='managers', namespace=manager_namespace)
        return {"success": True}
    finally:
        cursor.close()
        conn.close()

@router.put("/{ordem_id}/concluir")
async def concluir_ordem(ordem_id: int, current_user: UsuarioModel = Depends(get_current_user)):
    if current_user.papel != "MOTORISTA":
        raise HTTPException(status_code=403, detail="Acesso apenas motoristas")

    conn = get_db_connection()
    is_sqlite = not hasattr(conn, "ping")
    placeholder = "?" if is_sqlite else "%s"
    cursor = get_cursor(conn)
    try:
        # 1. Obter dados para snapshot (Preço e Distância)
        cursor.execute(f"SELECT ocorrencia_id, distancia_km FROM ordens_servico WHERE id = {placeholder}", (ordem_id,))
        occ = cursor.fetchone()
        occ_id = occ['ocorrencia_id']
        distancia = float(occ['distancia_km'] or 0)

        # 2. Obter configurações atuais
        cursor.execute("SELECT chave, valor FROM configuracoes WHERE chave IN ('preco_gasolina', 'consumo_medio_km_l')")
        configs = {row['chave']: row['valor'] for row in cursor.fetchall()}
        gas = float(configs.get('preco_gasolina', 5.89))
        cons = float(configs.get('consumo_medio_km_l', 3.5))
        
        valor_total = (distancia / cons) * gas

        # 3. Finalizar Ordem com Snapshots
        cursor.execute(f"""
            UPDATE ordens_servico 
            SET status = 'CONCLUIDA', 
                data_conclusao = {placeholder},
                preco_combustivel_snapshot = {placeholder},
                valor_total_os = {placeholder}
            WHERE id = {placeholder}
        """, (datetime.utcnow(), gas, valor_total, ordem_id))
        
        cursor.execute(f"UPDATE ocorrencias SET status = 'CONCLUIDO' WHERE id = {placeholder}", (occ_id,))
        conn.commit()
        await sio.emit('ordem_atualizada', {'ordem_id': ordem_id, 'status': 'CONCLUIDA'}, room='managers', namespace=manager_namespace)
        return {"success": True}
    finally:
        cursor.close()
        conn.close()

@router.get("/{ordem_id}/rota")
async def obter_rota(ordem_id: int, current_user: UsuarioModel = Depends(get_current_user)):
    if current_user.papel != "MOTORISTA":
        raise HTTPException(status_code=403, detail="Acesso apenas motoristas")

    conn = get_db_connection()
    is_sqlite = not hasattr(conn, "ping")
    placeholder = "?" if is_sqlite else "%s"
    cursor = get_cursor(conn)
    try:
        cursor.execute(f"SELECT origem_lat, origem_lng, destino_lat, destino_lng FROM ordens_servico WHERE id = {placeholder}", (ordem_id,))
        r = cursor.fetchone()
        if not r: raise HTTPException(status_code=404)
        return {
            "osrm_url": f"https://router.project-osrm.org/route/v1/driving/{r['origem_lng']},{r['origem_lat']};{r['destino_lng']},{r['destino_lat']}?overview=full&geometries=geojson&steps=true",
            "origin": {"lat": float(r['origem_lat']), "lng": float(r['origem_lng'])},
            "destination": {"lat": float(r['destino_lat']), "lng": float(r['destino_lng'])}
        }
    finally:
        cursor.close()
        conn.close()
