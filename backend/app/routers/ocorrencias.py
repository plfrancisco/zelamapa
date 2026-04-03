from fastapi import APIRouter, HTTPException, UploadFile, File, Form
import os
from pydantic import BaseModel
from typing import Optional
import shutil
import uuid
from ..database import get_db_connection
from geopy.distance import geodesic
from geopy.geocoders import Nominatim

router = APIRouter()

def validate_cpf(cpf: str) -> bool:
    numbers = [int(digit) for digit in cpf if digit.isdigit()]
    if len(numbers) != 11 or len(set(numbers)) == 1:
        return False
    sum_of_products = sum(a * b for a, b in zip(numbers[0:9], range(10, 1, -1)))
    expected_digit1 = (sum_of_products * 10 % 11) % 10
    if numbers[9] != expected_digit1:
        return False
    sum_of_products = sum(a * b for a, b in zip(numbers[0:10], range(11, 1, -1)))
    expected_digit2 = (sum_of_products * 10 % 11) % 10
    if numbers[10] != expected_digit2:
        return False
    return True

@router.get("/validar-cpf/{cpf}")
def validar_cpf_api(cpf: str):
    return {"valid": validate_cpf(cpf)}

# Pasta de uploads
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/")
async def criar_ocorrencia(
    usuario_id: Optional[int] = Form(None),
    tipo_id: int = Form(...),
    cpf: str = Form(...),
    telefone: str = Form(...),
    cep: str = Form(...),
    endereco: str = Form(...),
    numero: str = Form(...),
    descricao: Optional[str] = Form(None),
    foto: UploadFile = File(None)
):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    cursor = conn.cursor()
    try:
        imagem_path = None
        if foto:
            ext = foto.filename.split('.')[-1]
            nome_arquivo = f"{uuid.uuid4()}.{ext}"
            caminho_completo = os.path.join(UPLOAD_DIR, nome_arquivo)
            with open(caminho_completo, "wb") as buffer:
                shutil.copyfileobj(foto.file, buffer)
            imagem_path = f"/uploads/{nome_arquivo}"

        latitude = -22.1062
        longitude = -50.1740
        try:
            geolocator = Nominatim(user_agent="zelamapa_govtech")
            query = f"{endereco}, {numero}, Pompeia, SP, Brazil"
            location = geolocator.geocode(query, timeout=5)
            if location:
                latitude = location.latitude
                longitude = location.longitude
        except Exception as err:
            print(f"Erro no Geocoding: {err}")

        sql = """
            INSERT INTO ocorrencias (usuario_id, tipo_id, cpf, telefone, cep, endereco, numero, latitude, longitude, descricao, imagem_path, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDENTE')
        """
        cursor.execute(sql, (usuario_id, tipo_id, cpf, telefone, cep, endereco, numero, latitude, longitude, descricao, imagem_path))
        nova_id = cursor.lastrowid
        conn.commit()
        
        alerta_ativado = False
        
        cursor.execute("SELECT motorista_id FROM ordens_servico WHERE status = 'EM_ROTA' LIMIT 1")
        em_rota = cursor.fetchone()
        
        if em_rota:
            cursor.execute("INSERT INTO ordens_servico (ocorrencia_id, motorista_id, status) VALUES (?, ?, 'EM_ROTA')", (nova_id, em_rota['motorista_id']))
            cursor.execute("UPDATE ocorrencias SET status = 'EM_ANDAMENTO' WHERE id = ?", (nova_id,))
            conn.commit()
            alerta_ativado = True
        else:
            cursor.execute("SELECT id FROM ocorrencias WHERE status = 'PENDENTE'")
            pendentes = cursor.fetchall()
            if len(pendentes) >= 3:
                cursor.execute("SELECT id FROM usuarios WHERE papel = 'MOTORISTA' LIMIT 1")
                mot = cursor.fetchone()
                if mot:
                    for p in pendentes:
                        cursor.execute("INSERT INTO ordens_servico (ocorrencia_id, motorista_id, status) VALUES (?, ?, 'EM_ROTA')", (p['id'], mot['id']))
                        cursor.execute("UPDATE ocorrencias SET status = 'EM_ANDAMENTO' WHERE id = ?", (p['id'],))
                    conn.commit()
                    alerta_ativado = True

        return {
            "id": nova_id, 
            "status": "Criada", 
            "alerta_os_gerada": alerta_ativado,
            "veiculo_rota": bool(em_rota)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/pendentes")
def listar_pendentes(motorista_id: Optional[int] = None):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor()
    try:
        if motorista_id:
            cursor.execute("""
                SELECT o.id, o.latitude, o.longitude, o.descricao, o.imagem_path, o.status, 
                       t.nome as wasteType
                FROM ocorrencias o
                LEFT JOIN tipos_ocorrencia t ON o.tipo_id = t.id
                JOIN ordens_servico os ON os.ocorrencia_id = o.id
                WHERE (o.status = 'PENDENTE' OR o.status = 'EM_ANDAMENTO')
                AND os.motorista_id = ?
            """, (motorista_id,))
        else:
            cursor.execute("""
                SELECT o.id, o.latitude, o.longitude, o.descricao, o.imagem_path, o.status, 
                       t.nome as wasteType
                FROM ocorrencias o
                LEFT JOIN tipos_ocorrencia t ON o.tipo_id = t.id
                WHERE o.status = 'PENDENTE' OR o.status = 'EM_ANDAMENTO'
            """)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.get("/dashboard-stats")
def dashboard_stats():
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor()
    try:
        # Pega coletas recentes
        cursor.execute("""
            SELECT o.id, o.latitude, o.longitude, o.descricao, o.status, 
                   t.nome as type
            FROM ocorrencias o
            LEFT JOIN tipos_ocorrencia t ON o.tipo_id = t.id
            ORDER BY o.id DESC LIMIT 10
        """)
        recent_collections = [dict(row) for row in cursor.fetchall()]

        cursor.execute("""
            SELECT u.id as driver_id, u.nome as driver_name, COUNT(CASE WHEN o.status='CONCLUIDO' THEN 1 END) as completed, COUNT(*) as total
            FROM ordens_servico os
            JOIN ocorrencias o ON os.ocorrencia_id = o.id
            JOIN usuarios u ON os.motorista_id = u.id
            WHERE os.status = 'EM_ROTA' OR os.status = 'CONCLUIDA'
            GROUP BY u.id
            LIMIT 5
        """)
        trucks = [dict(row) for row in cursor.fetchall()]

        return {
            "recentCollections": recent_collections,
            "activeTrucks": trucks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.put("/{ocorrencia_id}/concluir")
def concluir_ocorrencia(ocorrencia_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE ocorrencias SET status = 'CONCLUIDO' WHERE id = ?", (ocorrencia_id,))
        cursor.execute("UPDATE ordens_servico SET status = 'CONCLUIDA', finalizada_em = CURRENT_TIMESTAMP WHERE ocorrencia_id = ?", (ocorrencia_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Ocorrência não encontrada")
        return {"status": "success", "message": "Ocorrência e OS concluídas."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
