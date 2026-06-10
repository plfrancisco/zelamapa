from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .api.v1.api import api_router
from .core.config import settings
from .websocket import create_socket_app

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configuração de CORS
origins = settings.ALLOWED_ORIGINS
if "*" in origins:
    # Se for '*', mas allow_credentials=True, precisamos ser mais específicos ou usar regex
    # Para desenvolvimento, vamos permitir localhost e IPs locais comuns
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Arquivos estáticos para uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Incluir roteador da API v1
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "message": f"{settings.PROJECT_NAME} API Operacional",
        "version": settings.VERSION,
        "docs": "/docs",
        "websocket": "/ws/driver"
    }

# Integrar Socket.IO
app = create_socket_app(app)
