from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Date, Numeric, func
from sqlalchemy.orm import relationship
from ..db.base_class import Base

class Motorista(Base):
    __tablename__ = "motoristas"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), unique=True, nullable=False)
    cnh = Column(String(255))
    cnh_validade = Column(Date)
    cnh_categoria = Column(Enum("A", "B", "C", "D", "E", "AB", "AC", "AD", "AE", name="cnh_cat"), default="B")
    placa_caminhao = Column(String(255))
    modelo_caminhao = Column(String(100))
    disponibilidade = Column(Enum("DISPONIVEL", "EM_ROTA", "OFFLINE", "EM_PAUSA", name="disp_motorista"), default="OFFLINE")
    ultima_posicao_id = Column(Integer)
    total_entregas = Column(Integer, default=0)
    avaliacao_media = Column(Numeric(3, 2), default=0.00)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    usuario = relationship("Usuario")
