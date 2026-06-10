import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Constrói a URL do Banco de Dados
DB_TYPE = os.getenv("DB_TYPE", "mysql")
DB_USER = os.getenv("DB_USER", "zelamapa")
DB_PASSWORD = os.getenv("DB_PASSWORD", "2307")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3307")
DB_NAME = os.getenv("DB_NAME", "zelamapa")

if DB_TYPE == "mysql":
    SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
else:
    # Fallback para SQLite
    SQLALCHEMY_DATABASE_URL = "sqlite:///./zelamapa.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    # Necessário apenas para SQLite para permitir múltiplas threads
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
