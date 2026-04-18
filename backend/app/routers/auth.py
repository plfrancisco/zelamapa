from fastapi import APIRouter, HTTPException, Depends, status, Request
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
import bcrypt
from datetime import datetime, timedelta
from jose import JWTError, jwt
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Configurações JWT
SECRET_KEY = os.getenv("JWT_SECRET", "zelamapa_secret_key_change_in_production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 dias

# Modelos Pydantic
class UserLogin(BaseModel):
    email: EmailStr
    senha: str

class UserRegister(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    papel: str = "MOTORISTA"
    caminhao_id: Optional[str] = None

# Funções auxiliares
def hash_password(senha_plana: str) -> str:
    senha_bytes = senha_plana.encode('utf-8')
    hashed = bcrypt.hashpw(senha_bytes, bcrypt.gensalt(rounds=12))
    return hashed.decode('utf-8')

def verify_password(senha_plana: str, senha_hash: str) -> bool:
    return bcrypt.checkpw(senha_plana.encode('utf-8'), senha_hash.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(request: Request):
    from ..database import get_db_connection
    auth = request.headers.get("Authorization")
    if not auth: raise HTTPException(status_code=401, detail="Não autorizado")
    
    token = auth.split(" ")[1] if " " in auth else auth
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None: raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError: raise HTTPException(status_code=401, detail="Token expirado")

    conn = get_db_connection()
    is_sqlite = not hasattr(conn, "ping")
    cursor = conn.cursor(dictionary=not is_sqlite)
    try:
        placeholder = "?" if is_sqlite else "%s"
        cursor.execute(f"SELECT id, nome, email, papel FROM usuarios WHERE id = {placeholder}", (user_id,))
        user = cursor.fetchone()
        if not user: raise HTTPException(status_code=401, detail="Usuário inexistente")
        return dict(user) if is_sqlite else user
    finally:
        cursor.close()
        conn.close()

# ENDPOINTS

@router.post("/register")
async def register(user_data: UserRegister):
    from ..database import get_db_connection
    conn = get_db_connection()
    if not conn: raise HTTPException(status_code=500, detail="Erro DB")
    is_sqlite = not hasattr(conn, "ping")
    placeholder = "?" if is_sqlite else "%s"
    cursor = conn.cursor()
    try:
        cursor.execute(f"SELECT id FROM usuarios WHERE email = {placeholder}", (user_data.email,))
        if cursor.fetchone(): raise HTTPException(status_code=400, detail="Email já existe")
        
        pw_hash = hash_password(user_data.senha)
        cursor.execute(f"""
            INSERT INTO usuarios (email, senha_hash, nome, papel, ativo)
            VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, 1)
        """, (user_data.email, pw_hash, user_data.nome, user_data.papel))
        
        user_id = cursor.lastrowid
        if user_data.papel == "MOTORISTA":
            cursor.execute(f"""
                INSERT INTO motoristas 
                (usuario_id, placa_caminhao, cnh, cnh_categoria, cnh_validade, disponibilidade)
                VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, 'OFFLINE')
            """, (user_id, user_data.caminhao_id or "", "N/A", "B", "2099-12-31"))
        
        conn.commit()
        return {"success": True, "message": "Criado"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/usuarios")
async def listar_usuarios(papel: Optional[str] = None):
    from ..database import get_db_connection
    conn = get_db_connection()
    is_sqlite = not hasattr(conn, "ping")
    cursor = conn.cursor(dictionary=not is_sqlite)
    try:
        query = "SELECT id, email, nome, papel, created_at FROM usuarios"
        params = []
        if papel:
            query += " WHERE papel = ?" if is_sqlite else " WHERE papel = %s"
            params.append(papel)
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return {"usuarios": [dict(r) if is_sqlite else r for r in rows]}
    finally:
        cursor.close()
        conn.close()

@router.delete("/usuarios/{user_id}")
async def deletar_usuario(user_id: int):
    from ..database import get_db_connection
    conn = get_db_connection()
    if not conn: raise HTTPException(status_code=500, detail="Erro DB")
    is_sqlite = not hasattr(conn, "ping")
    placeholder = "?" if is_sqlite else "%s"
    cursor = conn.cursor()
    try:
        # A exclusão na tabela motoristas ocorre automaticamente devido ao ON DELETE CASCADE no BD
        cursor.execute(f"DELETE FROM usuarios WHERE id = {placeholder}", (user_id,))
        conn.commit()
        if cursor.rowcount == 0: raise HTTPException(status_code=404, detail="Não encontrado")
        return {"success": True}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.post("/login")
def login(user_login: UserLogin):
    from ..database import get_db_connection
    conn = get_db_connection()
    is_sqlite = not hasattr(conn, "ping")
    cursor = conn.cursor(dictionary=not is_sqlite)
    try:
        placeholder = "?" if is_sqlite else "%s"
        cursor.execute(f"SELECT id, nome, email, senha_hash, papel FROM usuarios WHERE email = {placeholder}", (user_login.email,))
        user = cursor.fetchone()
        if is_sqlite and user: user = dict(user)
        
        if not user or not verify_password(user_login.senha, user['senha_hash']):
            raise HTTPException(status_code=401, detail="Credenciais inválidas")
            
        token = create_access_token(data={"sub": str(user['id']), "papel": user['papel']})
        return {
            "success": True, "access_token": token, "token_type": "bearer",
            "user": {"id": user['id'], "nome": user['nome'], "email": user['email'], "papel": user['papel']}
        }
    finally:
        cursor.close()
        conn.close()

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {"success": True, "user": current_user}
