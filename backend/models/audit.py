from sqlalchemy import Column, Integer, BigInteger, String, Enum, DateTime, JSON, CHAR, func
from ..db.base_class import Base

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(BigInteger, primary_key=True, index=True)
    tabela_nome = Column(String(100), nullable=False)
    registro_id = Column(Integer, nullable=False)
    operacao = Column(Enum("INSERT", "UPDATE", "DELETE", "TRUNCATE", "SELECT", name="audit_op"), nullable=False)
    dados_antigos = Column(JSON)
    dados_novos = Column(JSON)
    usuario_id = Column(Integer)
    motorista_id = Column(Integer)
    ip_address = Column(String(45), nullable=False)
    user_agent = Column(String)
    session_id = Column(CHAR(36))
    created_at = Column(DateTime, server_default=func.now())
