from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class TipoOcorrenciaBase(BaseModel):
    nome: str
    icone: Optional[str] = None

class TipoOcorrencia(TipoOcorrenciaBase):
    id: int

    class Config:
        from_attributes = True

class OcorrenciaBase(BaseModel):
    usuario_id: Optional[int] = None
    tipo_id: int
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    cep: Optional[str] = None
    endereco: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    latitude: Decimal
    longitude: Decimal
    descricao: Optional[str] = None
    status: Optional[str] = "PENDENTE"

class OcorrenciaCreate(OcorrenciaBase):
    pass

class OcorrenciaUpdate(BaseModel):
    status: Optional[str] = None
    descricao: Optional[str] = None

class Ocorrencia(OcorrenciaBase):
    id: int
    criado_em: datetime
    imagem_path: Optional[str] = None

    class Config:
        from_attributes = True
