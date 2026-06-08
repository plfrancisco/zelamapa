from sqlalchemy import Column, Integer, BigInteger, String, Enum, DateTime, ForeignKey, Numeric, Boolean, JSON, CHAR, func
from ..db.base_class import Base

class Localizacao(Base):
    __tablename__ = "localizacoes"

    id = Column(BigInteger, primary_key=True, index=True)
    motorista_id = Column(Integer, ForeignKey("motoristas.id", ondelete="CASCADE"), nullable=False)
    ordem_id = Column(Integer, ForeignKey("ordens_servico.id", ondelete="SET NULL"))
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)
    velocidade = Column(Numeric(5, 2))
    heading = Column(Numeric(5, 2))
    precisao_meters = Column(Numeric(5, 2))
    altitude = Column(Numeric(8, 2))
    bateria_restante = Column(Integer)
    modulo_tipo = Column(Enum("APP", "GPS_EXTERNO", "TELEMETRIA", name="mod_tipo"), default="APP")
    batch_id = Column(CHAR(36))
    enviado = Column(Boolean, default=False)
    enviado_em = Column(DateTime)
    device_info = Column(JSON)
    ip_address = Column(String(45))
    timestamp = Column(DateTime, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())
