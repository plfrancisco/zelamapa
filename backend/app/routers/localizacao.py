from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from ..database import get_db_connection
from .auth import get_current_user
from ..websocket import emitir_movimentacao

router = APIRouter()

class LocalizacaoCreate(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    velocidade: Optional[float] = Field(None, ge=0)
    heading: Optional[float] = Field(None, ge=0, le=360)
    precisao_meters: Optional[float] = None
    altitude: Optional[float] = None
    bateria_restante: Optional[int] = Field(None, ge=0, le=100)
    modulo_tipo: str = 'APP'
    device_info: Optional[dict] = None
    ip_address: Optional[str] = None
    timestamp: Optional[datetime] = None
    ordem_id: Optional[int] = None

class LocalizacaoBatch(BaseModel):
    localizacoes: List[LocalizacaoCreate]

@router.post("/batch")
async def create_batch(
    payload: LocalizacaoBatch,
    current_user: dict = Depends(get_current_user)
):
    """
    Recebe um batch de localizações GPS do motorista.
    Salva todas as coordenadas para histórico e atualiza o motorista.
    """
    if current_user['papel'] != 'MOTORISTA':
        raise HTTPException(status_code=403, detail="Acesso apenas motoristas")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="DB connection failed")
    
    cursor = conn.cursor()
    # Detectar se é SQLite ou MySQL para o placeholder
    # SQLite usa ?, MySQL usa %s
    is_sqlite = not hasattr(conn, "ping") 
    placeholder = "?" if is_sqlite else "%s"
    
    try:
        # Buscar motorista_id
        cursor.execute(f"SELECT id FROM motoristas WHERE usuario_id = {placeholder}", (current_user['id'],))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Motorista não encontrado")
        motorista_id = row[0]

        # Preparar dados para inserção em lote
        batch_data = []
        for loc in payload.localizacoes:
            ts = loc.timestamp or datetime.utcnow()
            batch_data.append((
                motorista_id, loc.ordem_id, loc.latitude, loc.longitude,
                loc.velocidade, loc.heading, loc.precisao_meters, loc.altitude,
                loc.bateria_restante, loc.modulo_tipo,
                str(loc.device_info) if loc.device_info else None,
                loc.ip_address, ts
            ))

        if batch_data:
            # Inserção eficiente em lote
            cursor.executemany(f"""
                INSERT INTO localizacoes
                (motorista_id, ordem_id, latitude, longitude, velocidade,
                 heading, precisao_meters, altitude, bateria_restante,
                 modulo_tipo, device_info, ip_address, timestamp)
                VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, 
                        {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, 
                        {placeholder}, {placeholder}, {placeholder})
            """, batch_data)

            # Registrar atividade na tabela motoristas
            cursor.execute(f"""
                UPDATE motoristas 
                SET updated_at = {placeholder}
                WHERE id = {placeholder}
            """, (datetime.utcnow(), motorista_id))

        conn.commit()

        # Notificar gestores em tempo real sobre o último ponto do batch
        if batch_data:
            ultima_loc = payload.localizacoes[-1].dict()
            await emitir_movimentacao(motorista_id, ultima_loc)

        return {
            "success": True,
            "inserted": len(batch_data)
        }
    except HTTPException:
        raise
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao processar batch: {str(e)}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()

@router.get("/ultima/{motorista_id}")
def get_ultima_localizacao(
    motorista_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Retorna a última localização de um motorista.
    """
    if current_user['papel'] not in ['MOTORISTA', 'ADMIN', 'CADASTRADOR']:
        raise HTTPException(status_code=403, detail="Acesso negado")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="DB connection failed")
    
    # Detectar tipo de cursor e placeholder
    is_sqlite = not hasattr(conn, "ping")
    placeholder = "?" if is_sqlite else "%s"
    
    try:
        # SQLite usa Row, MySQL usamos dictionary=True
        if is_sqlite:
            cursor = conn.cursor()
        else:
            cursor = conn.cursor(dictionary=True)

        if current_user['papel'] == 'MOTORISTA':
            cursor.execute(f"SELECT usuario_id FROM motoristas WHERE id = {placeholder}", (motorista_id,))
            m = cursor.fetchone()
            # No SQLite acessamos por índice se não for dict-like, mas aqui m[0] ou m['usuario_id']
            u_id = m[0] if is_sqlite else m['usuario_id']
            if not m or u_id != current_user['id']:
                raise HTTPException(status_code=403, detail="Só pode acessar própria localização")

        cursor.execute(f"""
            SELECT id, latitude, longitude, velocidade, heading,
                   timestamp, ordem_id, modulo_tipo
            FROM localizacoes
            WHERE motorista_id = {placeholder}
            ORDER BY timestamp DESC
            LIMIT 1
        """, (motorista_id,))
        
        loc = cursor.fetchone()
        if not loc:
            raise HTTPException(status_code=404, detail="Nenhuma localização encontrada")
            
        return {"success": True, "localizacao": dict(loc) if is_sqlite else loc}
    finally:
        cursor.close()
        conn.close()

@router.get("/historico/{motorista_id}")
def get_historico_localizacao(
    motorista_id: int,
    ordem_id: Optional[int] = None,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    """
    Retorna o histórico de localizações de um motorista.
    Útil para desenhar o rastro no mapa.
    """
    if current_user['papel'] not in ['ADMIN', 'CADASTRADOR', 'MOTORISTA']:
        raise HTTPException(status_code=403, detail="Acesso negado")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="DB connection failed")
    
    is_sqlite = not hasattr(conn, "ping")
    placeholder = "?" if is_sqlite else "%s"
    
    try:
        if is_sqlite:
            cursor = conn.cursor()
        else:
            cursor = conn.cursor(dictionary=True)

        query = f"SELECT * FROM localizacoes WHERE motorista_id = {placeholder}"
        params = [motorista_id]

        if ordem_id:
            query += f" AND ordem_id = {placeholder}"
            params.append(ordem_id)

        query += f" ORDER BY timestamp DESC LIMIT {placeholder}"
        params.append(limit)

        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        history = [dict(row) if is_sqlite else row for row in rows]
        return {"success": True, "count": len(history), "historico": history}
    finally:
        cursor.close()
        conn.close()
