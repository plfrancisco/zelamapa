from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, status
import os
from pydantic import BaseModel
from typing import Optional, List
import shutil
import uuid
from datetime import datetime, timedelta
from ..database import get_db_connection
from .auth import get_current_user

router = APIRouter()
UPLOAD_DIR = os.path.join(os.getcwd(), "backend", "uploads")

def get_cursor(conn):
    try: return conn.cursor(dictionary=True)
    except:
        def dict_factory(cursor, row):
            d = {}
            for idx, col in enumerate(cursor.description): d[col[0]] = row[idx]
            return d
        conn.row_factory = dict_factory
        return conn.cursor()

@router.get("/dashboard-stats")
async def dashboard_stats():
    conn = get_db_connection()
    is_sqlite = not hasattr(conn, "ping")
    placeholder = "?" if is_sqlite else "%s"
    cursor = get_cursor(conn)
    
    try:
        # 1. Coletas recentes com imagem
        cursor.execute("""
            SELECT o.id, o.latitude, o.longitude, o.descricao, o.status, o.imagem_path,
                   t.nome as type, o.endereco, o.created_at
            FROM ocorrencias o
            LEFT JOIN tipos_ocorrencia t ON o.tipo_id = t.id
            ORDER BY o.created_at DESC LIMIT 15
        """)
        recent = cursor.fetchall()

        # 2. Tempo Médio de Resolução (Horas)
        # SQLite usa julianday, MySQL usa TIMESTAMPDIFF
        time_query = """
            SELECT AVG(
                (julianday(os.data_conclusao) - julianday(os.created_at)) * 24
            ) as avg_hours 
            FROM ordens_servico os WHERE status = 'CONCLUIDA' AND data_conclusao IS NOT NULL
        """ if is_sqlite else """
            SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, data_conclusao)) as avg_hours 
            FROM ordens_servico WHERE status = 'CONCLUIDA' AND data_conclusao IS NOT NULL
        """
        cursor.execute(time_query)
        avg_time = cursor.fetchone()
        avg_hours = round(float(avg_time['avg_hours'] or 0), 1)

        # 3. Crescimento Semanal (%)
        one_week_ago = (datetime.utcnow() - timedelta(days=7)).strftime('%Y-%m-%d')
        cursor.execute(f"SELECT COUNT(*) as count FROM ocorrencias WHERE created_at >= {placeholder}", (one_week_ago,))
        this_week = cursor.fetchone()
        
        # 4. Caminhões e Posições (mantendo o que funciona)
        cursor.execute(f"""
            SELECT 
                m.id as motorista_id, u.nome as driver_name, m.disponibilidade,
                (SELECT COUNT(*) FROM ordens_servico WHERE motorista_id = m.id AND status = 'CONCLUIDA') as completed,
                (SELECT COUNT(*) FROM ordens_servico WHERE motorista_id = m.id) as total,
                l.latitude, l.longitude
            FROM motoristas m
            JOIN usuarios u ON m.usuario_id = u.id
            LEFT JOIN localizacoes l ON l.id = (
                SELECT id FROM localizacoes WHERE motorista_id = m.id ORDER BY timestamp DESC LIMIT 1
            )
            WHERE m.disponibilidade != 'OFFLINE'
        """)
        trucks = cursor.fetchall()

        # 5. Distribuição por Bairro e Categorias
        cursor.execute("SELECT COALESCE(bairro, 'Centro') as name, COUNT(*) as value FROM ocorrencias GROUP BY bairro ORDER BY value DESC")
        neighborhoods = cursor.fetchall()
        
        cursor.execute("SELECT t.nome as name, COUNT(o.id) as value FROM tipos_ocorrencia t LEFT JOIN ocorrencias o ON t.id = o.tipo_id GROUP BY t.nome")
        waste = cursor.fetchall()

        return {
            "recentCollections": [dict(r) if is_sqlite else r for r in recent],
            "activeTrucks": [dict(r) if is_sqlite else r for r in trucks],
            "wasteCategories": [dict(r) if is_sqlite else r for r in waste],
            "neighborhoodData": [dict(r) if is_sqlite else r for r in neighborhoods],
            "intelligence": {
                "avgResolutionTime": avg_hours,
                "weeklyCount": this_week['count'] if is_sqlite else this_week['count'],
                "criticalScore": len([r for r in recent if r['status'] == 'PENDENTE'])
            }
        }
    finally:
        cursor.close()
        conn.close()

# Os endpoints de POST permanecem iguais para manter compatibilidade
@router.post("/")
async def criar_ocorrencia(
    tipo_id: int = Form(...),
    endereco: str = Form(...),
    numero: str = Form(...),
    bairro: str = Form("Centro"),
    descricao: Optional[str] = Form(None),
    latitude: float = Form(-22.1062),
    longitude: float = Form(-50.1740),
    foto: UploadFile = File(None)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    is_sqlite = not hasattr(conn, "ping")
    placeholder = "?" if is_sqlite else "%s"
    try:
        imagem_path = None
        if foto:
            nome_arquivo = f"{uuid.uuid4()}_{foto.filename}"
            with open(os.path.join(UPLOAD_DIR, nome_arquivo), "wb") as buffer:
                shutil.copyfileobj(foto.file, buffer)
            imagem_path = nome_arquivo

        cursor.execute(f"""
            INSERT INTO ocorrencias (uuid, tipo_id, endereco, numero, bairro, latitude, longitude, descricao, imagem_path, status, created_at)
            VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, 'PENDENTE', {placeholder})
        """, (str(uuid.uuid4()), tipo_id, endereco, numero, bairro, latitude, longitude, descricao, imagem_path, datetime.utcnow()))
        conn.commit()
        return {"success": True, "id": cursor.lastrowid}
    finally:
        cursor.close()
        conn.close()
