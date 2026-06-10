from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OrdemServicoBase(BaseModel):
    ocorrencia_id: int
    motorista_id: int
    status: Optional[str] = "ABERTA"

class OrdemServicoCreate(OrdemServicoBase):
    pass

class OrdemServicoUpdate(BaseModel):
    status: Optional[str] = None

class OrdemServico(OrdemServicoBase):
    id: int
    criada_em: datetime
    finalizada_em: Optional[datetime] = None

    class Config:
        from_attributes = True
