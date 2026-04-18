from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..database import get_db_connection
from .auth import get_current_user
from ..websocket import sio, manager_namespace

router = APIRouter()

class StatusUpdate(BaseModel):
    disponibilidade: str  # DISPONIVEL, EM_ROTA, OFFLINE, EM_PAUSA

@router.put("/status")
async def update_status(payload: StatusUpdate, current_user: dict = Depends(get_current_user)):
    """
    Atualiza a disponibilidade do motorista logado e notifica gestores via WebSocket.
    """
    if current_user['papel'] != 'MOTORISTA':
        raise HTTPException(status_code=403, detail="Acesso apenas motoristas")

    valid_statuses = ['DISPONIVEL', 'EM_ROTA', 'OFFLINE', 'EM_PAUSA']
    if payload.disponibilidade not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status inválido. Use: {valid_statuses}")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="DB connection failed")
    
    is_sqlite = not hasattr(conn, "ping")
    placeholder = "?" if is_sqlite else "%s"
    
    cursor = conn.cursor()
    try:
        # Buscar motorista pelo usuario_id
        cursor.execute(f"SELECT id FROM motoristas WHERE usuario_id = {placeholder}", (current_user['id'],))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Motorista não encontrado")

        motorista_id = row[0]
        cursor.execute(
            f"UPDATE motoristas SET disponibilidade = {placeholder}, updated_at = {placeholder} WHERE id = {placeholder}",
            (payload.disponibilidade, datetime.utcnow(), motorista_id)
        )
        conn.commit()

        # Notificar Gestores em tempo real
        await sio.emit('motorista_status', {
            'motorista_id': motorista_id,
            'motorista_nome': current_user['nome'],
            'disponibilidade': payload.disponibilidade
        }, room='managers', namespace=manager_namespace)

        return {"success": True, "disponibilidade": payload.disponibilidade}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/perfil")
def get_perfil(current_user: dict = Depends(get_current_user)):
    """
    Retorna dados completos do perfil do motorista logado.
    """
    if current_user['papel'] != 'MOTORISTA':
        raise HTTPException(status_code=403, detail="Acesso apenas motoristas")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="DB connection failed")
    
    is_sqlite = not hasattr(conn, "ping")
    placeholder = "?" if is_sqlite else "%s"
    
    cursor = conn.cursor(dictionary=not is_sqlite)
    try:
        cursor.execute(f"""
            SELECT 
                m.id, m.disponibilidade, m.avaliacao_media, m.total_entregas,
                m.placa_caminhao, m.modelo_caminhao, m.cnh, m.cnh_validade,
                m.cnh_categoria, u.nome, u.email
            FROM motoristas m
            JOIN usuarios u ON u.id = m.usuario_id
            WHERE m.usuario_id = {placeholder}
        """, (current_user['id'],))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Perfil não encontrado")
            
        perfil = dict(row) if is_sqlite else row
        return {"success": True, "perfil": perfil}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
