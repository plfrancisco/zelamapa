from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from ..database import get_db_connection
from .auth import get_current_user
from ..websocket import sio, manager_namespace, driver_namespace

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
async def listar_ordens_pendentes(current_user: dict = Depends(get_current_user)):
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
async def listar_minhas_ordens(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    is_sqlite = not hasattr(conn, "ping")
    placeholder = "?" if is_sqlite else "%s"
    
    cursor = get_cursor(conn)
    try:
        # Buscar motorista_id
        cursor.execute(f"SELECT id FROM motoristas WHERE usuario_id = {placeholder}", (current_user['id'],))
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
async def aceitar_ordem(ordem_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    is_sqlite = not hasattr(conn, "ping")
    placeholder = "?" if is_sqlite else "%s"
    cursor = get_cursor(conn)
    try:
        cursor.execute(f"SELECT id FROM motoristas WHERE usuario_id = {placeholder}", (current_user['id'],))
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
async def iniciar_rota(ordem_id: int, current_user: dict = Depends(get_current_user)):
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
async def concluir_ordem(ordem_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    is_sqlite = not hasattr(conn, "ping")
    placeholder = "?" if is_sqlite else "%s"
    cursor = get_cursor(conn)
    try:
        cursor.execute(f"SELECT ocorrencia_id FROM ordens_servico WHERE id = {placeholder}", (ordem_id,))
        occ = cursor.fetchone()
        occ_id = occ['ocorrencia_id']

        cursor.execute(f"UPDATE ordens_servico SET status = 'CONCLUIDA', data_conclusao = {placeholder} WHERE id = {placeholder}", (datetime.utcnow(), ordem_id))
        cursor.execute(f"UPDATE ocorrencias SET status = 'CONCLUIDO' WHERE id = {placeholder}", (occ_id,))
        conn.commit()
        await sio.emit('ordem_atualizada', {'ordem_id': ordem_id, 'status': 'CONCLUIDA'}, room='managers', namespace=manager_namespace)
        return {"success": True}
    finally:
        cursor.close()
        conn.close()

@router.get("/{ordem_id}/rota")
async def obter_rota(ordem_id: int, current_user: dict = Depends(get_current_user)):
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
