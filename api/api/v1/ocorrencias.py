from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
import shutil

from ...db.session import get_db
from ...services import ocorrencia as ocorrencia_service
from ...schemas.ocorrencia import Ocorrencia, OcorrenciaCreate
from ..deps import get_current_user
from ...models.usuario import Usuario
from ...core.config import settings

router = APIRouter()

@router.get("/dashboard-stats")
def get_stats(db: Session = Depends(get_db)):
    return ocorrencia_service.get_dashboard_stats(db)

@router.post("/", response_model=Ocorrencia)
async def create_ocorrencia(
    db: Session = Depends(get_db),
    tipo_id: int = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    descricao: Optional[str] = Form(None),
    endereco: Optional[str] = Form(None),
    bairro: Optional[str] = Form(None),
    imagem: Optional[UploadFile] = File(None),
    current_user: Usuario = Depends(get_current_user)
):
    imagem_path = None
    if imagem:
        file_ext = os.path.splitext(imagem.filename)[1]
        file_name = f"{uuid.uuid4()}{file_ext}"
        imagem_path = file_name
        
        file_path = os.path.join(settings.UPLOAD_DIR, file_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(imagem.file, buffer)

    from decimal import Decimal
    
    ocorrencia_in = OcorrenciaCreate(
        tipo_id=tipo_id,
        latitude=Decimal(str(latitude)),
        longitude=Decimal(str(longitude)),
        descricao=descricao,
        endereco=endereco,
        bairro=bairro,
        status="PENDENTE"
    )
    
    db_obj = ocorrencia_service.create_ocorrencia(db, obj_in=ocorrencia_in, usuario_id=current_user.id)
    if imagem_path:
        db_obj.imagem_path = imagem_path
        db.commit()
        db.refresh(db_obj)
        
    return db_obj
