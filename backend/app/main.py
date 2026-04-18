from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
import os

# Import routers
from app.routers import ocorrencias, limpeza, auth, ordens, motorista, localizacao, test_ws

# Import WebSocket
from app.websocket import create_socket_app

app = FastAPI(title="ZelaMapa GovTech API")

# CORS: Liberado para desenvolvimento
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static files
upload_dir = os.path.join(os.getcwd(), "backend", "uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Include routers
app.include_router(ocorrencias.router, prefix="/api/ocorrencias", tags=["Ocorrências"])
app.include_router(limpeza.router, tags=["Limpeza Interna"])
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticação"])
app.include_router(ordens.router, prefix="/api/ordens", tags=["Ordens Motorista"])
app.include_router(motorista.router, prefix="/api/motorista", tags=["Motorista"])
app.include_router(localizacao.router, prefix="/api/localizacao", tags=["Localização GPS"])
app.include_router(test_ws.router, prefix="/api/test", tags=["Teste WebSocket"])

@app.get("/")
def read_root():
    return {
        "message": "ZelaMapa GovTech API Operacional",
        "version": "1.0.0",
        "docs": "/docs",
        "websocket": "/ws/driver"
    }

# ============================================
# WEBSOCKET: Montar Socket.IO sobre FastAPI
# ============================================
# O app final é um ASGI composto: Socket.IO + FastAPI
app = create_socket_app(app)
