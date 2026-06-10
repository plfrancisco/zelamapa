from sqlalchemy import Column, Integer, String, Enum, DateTime, func
from ..db.base_class import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, index=True, server_default=func.uuid())
    nome = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    papel = Column(Enum("ADMIN", "MOTORISTA", "CADASTRADOR", name="user_role"), nullable=False)
    created_at = Column(DateTime, name="created_at", server_default=func.now())
    updated_at = Column(DateTime, name="updated_at", server_default=func.now(), onupdate=func.now())
