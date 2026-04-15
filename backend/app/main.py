from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
import os

# Import routers
from app.routers import ocorrencias, limpeza, auth

app = FastAPI(title="ZelaMapa GovTech API")

# CORS: em produção, restrinja os origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static files
upload_dir = os.path.join(os.getcwd(), "backend", "uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Include routers
app.include_router(ocorrencias.router, tags=["Ocorrências"])
app.include_router(limpeza.router, tags=["Limpeza Interna"])
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticação"])

@app.get("/")
def read_root():
    return {
        "message": "ZelaMapa GovTech API Operacional",
        "version": "1.0.0",
        "docs": "/docs"
    }
