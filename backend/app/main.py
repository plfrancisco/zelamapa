from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ocorrencias, limpeza

app = FastAPI(title="ZelaMapa GovTech API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ocorrencias.router, prefix="/api/ocorrencias", tags=["Ocorrências"])
app.include_router(limpeza.router, prefix="/api/limpeza", tags=["Limpeza Interna"])

@app.get("/")
def read_root():
    return {"message": "ZelaMapa GovTech API Operacional (via FastAPI)"}
