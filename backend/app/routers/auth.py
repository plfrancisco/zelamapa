from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
import bcrypt
import re

router = APIRouter()


class UserRegister(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    papel: str  # "MOTORISTA" ou "ADMIN"
    caminhao_id: Optional[str] = None

    @field_validator('nome')
    @classmethod
    def nome_nao_vazio(cls, v):
        if not v or not v.strip():
            raise ValueError('Nome não pode estar vazio')
        return v.strip()

    @field_validator('senha')
    @classmethod
    def senha_valida(cls, v):
        if len(v) < 6:
            raise ValueError('Senha deve ter pelo menos 6 caracteres')
        return v

    @field_validator('papel')
    @classmethod
    def papel_valido(cls, v):
        v = v.upper()
        if v not in ['MOTORISTA', 'ADMIN']:
            raise ValueError('Papel deve ser MOTORISTA ou ADMIN')
        return v


def hash_password(senha_plana: str) -> str:
    """Gera hash bcrypt para a senha."""
    # Bcrypt tem limite de 72 bytes, então codificamos e truncamos se necessário
    senha_bytes = senha_plana.encode('utf-8')
    if len(senha_bytes) > 72:
        senha_bytes = senha_bytes[:72]
    hashed = bcrypt.hashpw(senha_bytes, bcrypt.gensalt(rounds=12))
    return hashed.decode('utf-8')


@router.post("/register")
def register_user(user: UserRegister):
    """
    Cadastra um novo usuário (motorista ou gestor/admin).
    O email deve ser único no sistema.
    A senha é armazenada com hash bcrypt.
    """
    from ..database import get_db_connection

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com banco de dados")

    cursor = conn.cursor()
    try:
        # Verificar se email já existe
        cursor.execute("SELECT id FROM usuarios WHERE email = ?", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=409, detail="Email já cadastrado")

        # Gerar hash da senha
        senha_hash = hash_password(user.senha)

        # Inserir usuário
        cursor.execute(
            """
            INSERT INTO usuarios (nome, email, senha_hash, papel)
            VALUES (?, ?, ?, ?)
            """,
            (user.nome, user.email, senha_hash, user.papel)
        )
        user_id = cursor.lastrowid
        conn.commit()

        return {
            "success": True,
            "userId": user_id,
            "message": f"Usuário '{user.nome}' cadastrado com sucesso como {user.papel}"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao cadastrar usuário: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.get("/usuarios")
def list_users(papel: Optional[str] = None):
    """
    Lista todos os usuários cadastrados.
    Opcionalmente filtra por papel (MOTORISTA ou ADMIN).
    """
    from ..database import get_db_connection

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com banco de dados")

    cursor = conn.cursor()
    try:
        if papel:
            papel = papel.upper()
            if papel not in ['MOTORISTA', 'ADMIN', 'CADASTRADOR']:
                raise HTTPException(status_code=400, detail="Papel inválido")
            cursor.execute(
                "SELECT id, nome, email, papel, criado_em FROM usuarios WHERE papel = ? ORDER BY nome",
                (papel,)
            )
        else:
            cursor.execute("SELECT id, nome, email, papel, criado_em FROM usuarios ORDER BY nome")

        rows = cursor.fetchall()
        usuarios = [dict(row) for row in rows]
        return {"usuarios": usuarios}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar usuários: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.delete("/usuarios/{user_id}")
def delete_user(user_id: int):
    """
    Remove um usuário do sistema.
    Não permite remover o último admin.
    """
    from ..database import get_db_connection

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com banco de dados")

    cursor = conn.cursor()
    try:
        # Verificar se usuário existe e é motorista (não pode deletar admin)
        cursor.execute("SELECT nome, papel FROM usuarios WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")

        if user['papel'] == 'ADMIN':
            # Contar quantos admins restantes
            cursor.execute("SELECT COUNT(*) as count FROM usuarios WHERE papel = 'ADMIN'")
            admin_count = cursor.fetchone()['count']
            if admin_count <= 1:
                raise HTTPException(status_code=400, detail="Não é possível remover o último administrador")

        cursor.execute("DELETE FROM usuarios WHERE id = ?", (user_id,))
        conn.commit()

        return {"success": True, "message": f"Usuário '{user['nome']}' removido com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao remover usuário: {str(e)}")
    finally:
        cursor.close()
        conn.close()
