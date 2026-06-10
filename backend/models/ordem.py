from sqlalchemy import Column, Integer, Enum, DateTime, ForeignKey, func, Numeric
from sqlalchemy.orm import relationship
from ..db.base_class import Base

class OrdemServico(Base):
    __tablename__ = "ordens_servico"

    id = Column(Integer, primary_key=True, index=True)
    ocorrencia_id = Column(Integer, ForeignKey("ocorrencias.id"))
    motorista_id = Column(Integer, ForeignKey("usuarios.id"))
    status = Column(Enum("ABERTA", "ACEITA", "EM_ROTA", "CONCLUIDA", "RECUSADA", "CANCELADA", name="status_ordem"), default="ABERTA")
    prioridade = Column(Enum("BAIXA", "MEDIA", "ALTA", "URGENTE", name="prioridade_ordem"), default="MEDIA")
    origem_lat = Column(Numeric(10, 8))
    origem_lng = Column(Numeric(11, 8))
    destino_lat = Column(Numeric(10, 8))
    destino_lng = Column(Numeric(11, 8))
    distancia_km = Column(Numeric(8, 2))
    preco_combustivel_snapshot = Column(Numeric(10, 2))
    valor_total_os = Column(Numeric(12, 2))
    created_at = Column(DateTime, server_default=func.now())
    data_conclusao = Column(DateTime)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    ocorrencia = relationship("Ocorrencia")
    motorista = relationship("Usuario")
