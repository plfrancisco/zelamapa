from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Numeric, Text, func
from sqlalchemy.orm import relationship
from ..db.base_class import Base

class Ocorrencia(Base):
    __tablename__ = "ocorrencias"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    tipo_id = Column(Integer, ForeignKey("tipos_ocorrencia.id"))
    cpf = Column(String(14))
    telefone = Column(String(15))
    cep = Column(String(9))
    endereco = Column(String(255))
    numero = Column(String(20))
    bairro = Column(String(100))
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)
    descricao = Column(Text)
    imagem_path = Column(String(255))
    status = Column(Enum("PENDENTE", "EM_ANDAMENTO", "CONCLUIDO", name="status_ocorrencia"), default="PENDENTE")
    criado_em = Column(DateTime, server_default=func.now())

    usuario = relationship("Usuario")
    tipo = relationship("TipoOcorrencia")
