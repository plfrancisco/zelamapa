from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from ...database import get_db_connection
from ..deps import get_current_user
from ...models.usuario import Usuario as UsuarioModel

router = APIRouter()

class ConfigUpdate(BaseModel):
    preco_gasolina: float
    consumo_medio: float
    nome_instituicao: str
    sla_inatividade_min: int

@router.get("/")
async def get_configs():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True) if hasattr(conn, "ping") else conn.cursor()
    try:
        cursor.execute("SELECT chave, valor FROM configuracoes")
        rows = cursor.fetchall()
        configs = {row["chave"] if isinstance(row, dict) else row[0]: row["valor"] if isinstance(row, dict) else row[1] for row in rows}
        return configs
    finally:
        cursor.close()
        conn.close()

@router.get("/audit")
async def get_audit_logs():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True) if hasattr(conn, "ping") else conn.cursor()
    try:
        cursor.execute("""
            SELECT al.*, u.nome as usuario_nome 
            FROM audit_logs al 
            LEFT JOIN usuarios u ON al.usuario_id = u.id 
            ORDER BY al.created_at DESC LIMIT 20
        """)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.post("/")
async def update_configs(data: ConfigUpdate, current_user: UsuarioModel = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    is_sqlite = not hasattr(conn, "ping")
    user_id = current_user.id
    try:
        updates = [
            ("preco_gasolina", str(data.preco_gasolina)),
            ("consumo_medio_km_l", str(data.consumo_medio)),
            ("nome_instituicao", data.nome_instituicao),
            ("sla_inatividade_min", str(data.sla_inatividade_min))
        ]
        
        for chave, valor in updates:
            if is_sqlite:
                cursor.execute("INSERT OR REPLACE INTO configuracoes (chave, valor) VALUES (?, ?)", (chave, valor))
            else:
                cursor.execute("INSERT INTO configuracoes (chave, valor) VALUES (%s, %s) ON DUPLICATE KEY UPDATE valor = %s", (chave, valor, valor))
        
        # Registrar Auditoria
        log_msg = f"Usuário {current_user.nome} atualizou as diretrizes: {data.nome_instituicao}, Gasolina R${data.preco_gasolina}"
        if is_sqlite:
            cursor.execute("INSERT INTO audit_logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)", (user_id, "UPDATE_CONFIG", log_msg))
        else:
            cursor.execute("INSERT INTO audit_logs (usuario_id, acao, detalhes) VALUES (%s, %s, %s)", (user_id, "UPDATE_CONFIG", log_msg))

        conn.commit()
        return {"success": True}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
