from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from decimal import Decimal

class LocalizacaoBase(BaseModel):
    motorista_id: int
    ordem_id: Optional[int] = None
    latitude: Decimal
    longitude: Decimal
    velocidade: Optional[Decimal] = None
    heading: Optional[Decimal] = None
    precisao_meters: Optional[Decimal] = None
    altitude: Optional[Decimal] = None
    bateria_restante: Optional[int] = None
    modulo_tipo: Optional[str] = "APP"
    device_info: Optional[Any] = None

class LocalizacaoCreate(LocalizacaoBase):
    pass

class Localizacao(LocalizacaoBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
