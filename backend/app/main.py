from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.routers import ocorrencias, limpeza

os.makedirs("uploads", exist_ok=True)

app = FastAPI(title="ZelaMapa GovTech API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(ocorrencias.router, prefix="/api/ocorrencias", tags=["Ocorrências"])
app.include_router(limpeza.router, prefix="/api/limpeza", tags=["Limpeza Interna"])

@app.get("/")
def read_root():
    return {"message": "ZelaMapa GovTech API Operacional (via FastAPI)"}
