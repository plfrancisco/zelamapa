from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..database import get_db_connection
from geopy.distance import geodesic

router = APIRouter()

class OcorrenciaCreate(BaseModel):
    usuario_id: int
    tipo_id: int
    latitude: float
    longitude: float
    descricao: Optional[str] = None
    imagem_path: Optional[str] = None

@router.post("/")
def criar_ocorrencia(oc: OcorrenciaCreate):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    cursor = conn.cursor(dictionary=True)
    try:
        # Inserir Ocorrência no Banco
        sql = """
            INSERT INTO ocorrencias (usuario_id, tipo_id, latitude, longitude, descricao, imagem_path)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (oc.usuario_id, oc.tipo_id, oc.latitude, oc.longitude, oc.descricao, oc.imagem_path))
        conn.commit()
        nova_id = cursor.lastrowid
        
        # Inteligência / Regra de Negócio GovTech: Geoprocessamento
        # Requisita ocorrencias não resolvidas
        cursor.execute("SELECT id, latitude, longitude FROM ocorrencias WHERE status = 'PENDENTE' AND id != %s", (nova_id,))
        pendentes = cursor.fetchall()
        
        proximas = 0
        ponto_atual = (oc.latitude, oc.longitude)
        
        for p in pendentes:
            distancia = geodesic(ponto_atual, (p['latitude'], p['longitude'])).meters
            if distancia <= 500:
                proximas += 1
                
        # Regra de aproximação: Se existem 4 próximas + atual = 5 num raio delimitado.
        alerta_ativado = proximas >= 4
        
        if alerta_ativado:
            # Gerar Ordem de Serviço (OS) automaticamente
            sql_os = "INSERT INTO ordens_servico (ocorrencia_id, motorista_id) VALUES (%s, NULL)"
            cursor.execute(sql_os, (nova_id,))
            conn.commit()
            
        return {
            "id": nova_id, 
            "status": "Criada", 
            "alerta_os_gerada": alerta_ativado,
            "ocorrencias_proximas": proximas
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/pendentes")
def listar_pendentes():
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor(dictionary=True)
    try:
        # Pega ocorrencias não resolvidas incluindo o nome do tipo
        cursor.execute("""
            SELECT o.id, o.latitude, o.longitude, o.descricao, o.imagem_path, o.status, 
                   t.nome as wasteType
            FROM ocorrencias o
            LEFT JOIN tipos_ocorrencia t ON o.tipo_id = t.id
            WHERE o.status = 'PENDENTE'
        """)
        pendentes = cursor.fetchall()
        return pendentes
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
        cursor.execute("UPDATE ocorrencias SET status = 'CONCLUIDO' WHERE id = %s", (ocorrencia_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Ocorrência não encontrada")
        return {"status": "success", "message": "Ocorrência concluída."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
