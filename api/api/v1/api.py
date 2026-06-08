from fastapi import APIRouter
from . import auth, ocorrencias, ordens, motorista, localizacao, bi, configuracoes

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
api_router.include_router(ocorrencias.router, prefix="/ocorrencias", tags=["Ocorrências"])
api_router.include_router(ordens.router, prefix="/ordens", tags=["Ordens"])
api_router.include_router(motorista.router, prefix="/motorista", tags=["Motorista"])
api_router.include_router(localizacao.router, prefix="/localizacao", tags=["Localização"])
api_router.include_router(bi.router, prefix="/bi", tags=["BI"])
api_router.include_router(configuracoes.router, prefix="/configuracoes", tags=["Configurações"])
