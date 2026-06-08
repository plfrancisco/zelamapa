from sqlalchemy import Column, Integer, String
from ..db.base_class import Base

class TipoOcorrencia(Base):
    __tablename__ = "tipos_ocorrencia"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    icone = Column(String(255))
