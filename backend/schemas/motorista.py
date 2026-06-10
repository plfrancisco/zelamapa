from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from decimal import Decimal

class MotoristaBase(BaseModel):
    usuario_id: int
    cnh: Optional[str] = None
    cnh_validade: Optional[date] = None
    cnh_categoria: Optional[str] = "B"
    placa_caminhao: Optional[str] = None
    modelo_caminhao: Optional[str] = None
    disponibilidade: Optional[str] = "OFFLINE"

class MotoristaCreate(MotoristaBase):
    pass

class MotoristaUpdate(BaseModel):
    disponibilidade: Optional[str] = None
    placa_caminhao: Optional[str] = None

class Motorista(MotoristaBase):
    id: int
    total_entregas: int
    avaliacao_media: Decimal
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
