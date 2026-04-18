from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Optional
from ..websocket import emitir_nova_ordem, emitir_ordem_cancelada
from ..database import get_db_connection
from .auth import get_current_user

router = APIRouter()

class TestEmitPayload(BaseModel):
    motorista_id: int
    ordem_id: int
    acao: str  # 'nova_ordem' ou 'ordem_cancelada'

@router.post("/test/emit")
async def test_emit_event(payload: TestEmitPayload, current_user: dict = Depends(get_current_user)):
    """
    Endpoint de TESTE: emite eventos WebSocket para motoristas.
    Apenas ADMIN em desenvolvimento.
    """
    if current_user['papel'] != 'ADMIN':
        raise HTTPException(status_code=403, detail="Apenas admin")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="DB connection failed")
    cursor = conn.cursor(dictionary=True)
    try:
        # Buscar dados da ordem
        cursor.execute("""
            SELECT os.*, o.descricao, o.imagem_path, t.nome as tipo_nome
            FROM ordens_servico os
            JOIN ocorrencias o ON os.ocorrencia_id = o.id
            LEFT JOIN tipos_ocorrencia t ON o.tipo_id = t.id
            WHERE os.id = %s
        """, (payload.ordem_id,))
        ordem = cursor.fetchone()
        if not ordem:
            raise HTTPException(status_code=404, detail="Ordem não encontrada")

        ordem_dict = {k: v for k, v in ordem.items()}

        if payload.acao == 'nova_ordem':
            await emitir_nova_ordem(payload.motorista_id, {'ordem': ordem_dict, 'tipo': 'nova_ordem'})
        elif payload.acao == 'ordem_cancelada':
            await emitir_ordem_cancelada(payload.motorista_id, payload.ordem_id)
        else:
            raise HTTPException(status_code=400, detail="Ação inválida. Use: nova_ordem, ordem_cancelada")

        return {"success": True, "message": f"Evento '{payload.acao}' emitido para motorista {payload.motorista_id}"}
    finally:
        cursor.close()
        conn.close()
