from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from ..core.config import settings
from ..db.session import get_db
from ..models.usuario import Usuario
from ..schemas.usuario import TokenPayload
from ..services import usuario as usuario_service

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> Usuario:
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        print(f"[AUTH DEBUG] Token sub: {token_data.sub}")
    except (jwt.JWTError, ValidationError) as e:
        print(f"[AUTH DEBUG] JWT Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Não foi possível validar as credenciais",
        )
    usuario = usuario_service.get_usuario(db, usuario_id=token_data.sub)
    if not usuario:
        print(f"[AUTH DEBUG] User not found for ID: {token_data.sub}")
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    print(f"[AUTH DEBUG] User found: {usuario.email}, Papel: {usuario.papel}, Tipo: {type(usuario.papel)}")
    return usuario
