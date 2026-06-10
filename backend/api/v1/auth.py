import unicodedata
import re
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ...db.session import get_db
from ...database import get_db_connection
from ...services import usuario as usuario_service
from ...utils import security
from ...core.config import settings
from ...schemas.usuario import Token, Usuario, UsuarioCreate, UsuarioUpdatePassword
from ..deps import get_current_user
from ...models.usuario import Usuario as UsuarioModel
from ...models.motorista import Motorista as MotoristaModel

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    usuario = usuario_service.authenticate(
        db, email=form_data.username, senha=form_data.password
    )
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = security.create_access_token(
        usuario.id, expires_delta=access_token_expires
    )

    # Registrar Login na Auditoria e Iniciar Jornada
    conn = get_db_connection()
    cursor = conn.cursor()
    is_sqlite = not hasattr(conn, "ping")
    try:
        log_msg = f"Usuário {usuario.nome} realizou login no sistema"
        mes_ref = datetime.now().strftime("%Y-%m")
        
        if is_sqlite:
            cursor.execute("INSERT INTO audit_logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)", (usuario.id, "USER_LOGIN", log_msg))
            cursor.execute("INSERT INTO jornadas_trabalho (usuario_id, login_at, mes_referencia) VALUES (?, ?, ?)", (usuario.id, datetime.now(), mes_ref))
            if usuario.papel == "MOTORISTA":
                cursor.execute("UPDATE motoristas SET disponibilidade = 'DISPONIVEL' WHERE usuario_id = ?", (usuario.id,))
        else: # MySQL
            cursor.execute("INSERT INTO audit_logs (usuario_id, acao, detalhes) VALUES (%s, %s, %s)", (usuario.id, "USER_LOGIN", log_msg))
            cursor.execute("INSERT INTO jornadas_trabalho (usuario_id, login_at, mes_referencia) VALUES (%s, %s, %s)", (usuario.id, datetime.now(), mes_ref))
            if usuario.papel == "MOTORISTA":
                cursor.execute("UPDATE motoristas SET disponibilidade = 'DISPONIVEL' WHERE usuario_id = %s", (usuario.id,))
        
        conn.commit()

        # Emitir status real-time se for motorista
        if usuario.papel == "MOTORISTA":
            from ...websocket import sio, manager_namespace
            placeholder = "?" if is_sqlite else "%s"
            cursor.execute(f"SELECT id FROM motoristas WHERE usuario_id = {placeholder}", (usuario.id,))
            m_row = cursor.fetchone()
            if m_row:
                m_id = m_row['id'] if not isinstance(m_row, tuple) else m_row[0]
                await sio.emit('motorista_status', {
                    'motorista_id': m_id,
                    'motorista_nome': usuario.nome,
                    'disponibilidade': 'DISPONIVEL'
                }, room='managers', namespace=manager_namespace)
    finally:
        cursor.close()
        conn.close()

    return {
        "access_token": token,
        "token_type": "bearer",
    }

@router.get("/me", response_model=Usuario)
def read_user_me(
    current_user: UsuarioModel = Depends(get_current_user),
):
    """
    Retorna o usuário atual logado.
    """
    return current_user

@router.post("/logout")
async def logout_user(
    current_user: UsuarioModel = Depends(get_current_user),
):
    """
    Encerra a jornada de trabalho e audita a saída.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True) if hasattr(conn, "ping") else conn.cursor()
    is_sqlite = not hasattr(conn, "ping")
    placeholder = "?" if is_sqlite else "%s"
    
    try:
        # 1. Localizar última jornada aberta
        cursor.execute(f"SELECT id, login_at FROM jornadas_trabalho WHERE usuario_id = {placeholder} AND logout_at IS NULL ORDER BY login_at DESC LIMIT 1", (current_user.id,))
        row = cursor.fetchone()
        
        logout_at = datetime.now()
        
        if row:
            jornada_id = row['id'] if not isinstance(row, tuple) else row[0]
            login_at = row['login_at'] if not isinstance(row, tuple) else row[1]
            
            # Calcular duração em segundos para precisão total
            diff = logout_at - login_at
            duracao_segundos = int(diff.total_seconds())
            duracao_minutos = int(duracao_segundos / 60)
            
            # Atualizar jornada (Adicionando duracao_segundos se a coluna existir, ou mantendo minutos)
            if is_sqlite:
                cursor.execute("UPDATE jornadas_trabalho SET logout_at = ?, duracao_minutos = ? WHERE id = ?", (logout_at, duracao_minutos, jornada_id))
            else:
                cursor.execute("UPDATE jornadas_trabalho SET logout_at = %s, duracao_minutos = %s WHERE id = %s", (logout_at, duracao_minutos, jornada_id))
        
        # 1.5 Se for motorista, forçar status OFFLINE e disponibilidade no banco
        if current_user.papel == "MOTORISTA":
            if is_sqlite:
                cursor.execute("UPDATE motoristas SET disponibilidade = 'OFFLINE' WHERE usuario_id = ?", (current_user.id,))
            else:
                cursor.execute("UPDATE motoristas SET disponibilidade = 'OFFLINE' WHERE usuario_id = %s", (current_user.id,))

        # 2. Auditar Saída
        log_msg = f"Usuário {current_user.nome} saiu do sistema (Encerrar Turno)"
        if is_sqlite:
            cursor.execute("INSERT INTO audit_logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)", (current_user.id, "USER_LOGOUT", log_msg))
        else:
            cursor.execute("INSERT INTO audit_logs (usuario_id, acao, detalhes) VALUES (%s, %s, %s)", (current_user.id, "USER_LOGOUT", log_msg))
            
        conn.commit()

        # Emitir status real-time se for motorista
        if current_user.papel == "MOTORISTA":
            from ...websocket import sio, manager_namespace
            cursor.execute(f"SELECT id FROM motoristas WHERE usuario_id = {placeholder}", (current_user.id,))
            m_row = cursor.fetchone()
            if m_row:
                m_id = m_row['id'] if not isinstance(m_row, tuple) else m_row[0]
                await sio.emit('motorista_status', {
                    'motorista_id': m_id,
                    'motorista_nome': current_user.nome,
                    'disponibilidade': 'OFFLINE'
                }, room='managers', namespace=manager_namespace)

        return {"success": True}
    finally:
        cursor.close()
        conn.close()

class UserRegister(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    papel: str
    caminhao_id: Optional[str] = None

@router.post("/register")
async def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserRegister,
    current_user: UsuarioModel = Depends(get_current_user),
):
    """
    Cadastra um novo usuário (Apenas Admin).
    """
    if current_user.papel != "ADMIN":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    # Sanitização de e-mail (Sem acentos)
    normalized_email = unicodedata.normalize('NFD', user_in.email)
    normalized_email = "".join([c for c in normalized_email if unicodedata.category(c) != 'Mn'])
    normalized_email = normalized_email.lower().strip()
    # Remove qualquer caractere que não seja a-z, 0-9, @, ., _, -
    normalized_email = re.sub(r'[^a-z0-9@._-]', '', normalized_email)
    
    user = usuario_service.get_usuario_by_email(db, email=normalized_email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="O usuário com este e-mail já existe no sistema.",
        )
    
    # Criar Usuário
    new_user_in = UsuarioCreate(
        nome=user_in.nome,
        email=normalized_email,
        senha=user_in.senha,
        papel=user_in.papel
    )
    user = usuario_service.create_usuario(db, obj_in=new_user_in)
    
    # Se for motorista, criar registro na tabela motoristas
    if user_in.papel == "MOTORISTA":
        db_motorista = MotoristaModel(
            usuario_id=user.id,
            placa_caminhao=user_in.caminhao_id,
            modelo_caminhao="Caminhão Padrão",
            disponibilidade="OFFLINE"
        )
        db.add(db_motorista)
        db.commit()
        db.refresh(db_motorista)

    # Registrar Auditoria
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        log_msg = f"Usuário {current_user.nome} criou a conta de {user.nome} ({user.papel})"
        if not hasattr(conn, "ping"): # SQLite
            cursor.execute("INSERT INTO audit_logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)", (current_user.id, "CREATE_USER", log_msg))
        else: # MySQL
            cursor.execute("INSERT INTO audit_logs (usuario_id, acao, detalhes) VALUES (%s, %s, %s)", (current_user.id, "CREATE_USER", log_msg))
        conn.commit()
    finally:
        cursor.close()
        conn.close()
        
    return {"success": True, "user_id": user.id}

@router.get("/usuarios")
def list_usuarios(
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_user),
):
    """
    Lista todos os usuários (Apenas para Admin).
    """
    if current_user.papel != "ADMIN":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    usuarios = db.query(UsuarioModel).all()
    return {"usuarios": usuarios}

@router.delete("/usuarios/{usuario_id}")
def delete_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_user),
):
    """
    Remove um usuário do sistema (Apenas para Admin).
    """
    if current_user.papel != "ADMIN":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    usuario = usuario_service.get_usuario(db, usuario_id=usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    if usuario.id == current_user.id:
        raise HTTPException(status_code=400, detail="Você não pode remover seu próprio usuário")
    
    # Nome para o log antes de deletar
    deleted_user_name = usuario.nome
    deleted_user_role = usuario.papel
        
    db.delete(usuario)
    db.commit()

    # Registrar Auditoria
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        log_msg = f"Usuário {current_user.nome} removeu a conta de {deleted_user_name} ({deleted_user_role})"
        if not hasattr(conn, "ping"): # SQLite
            cursor.execute("INSERT INTO audit_logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)", (current_user.id, "DELETE_USER", log_msg))
        else: # MySQL
            cursor.execute("INSERT INTO audit_logs (usuario_id, acao, detalhes) VALUES (%s, %s, %s)", (current_user.id, "DELETE_USER", log_msg))
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return {"success": True}

@router.post("/update-password")
def update_password(
    *,
    db: Session = Depends(get_db),
    password_in: UsuarioUpdatePassword,
    current_user: UsuarioModel = Depends(get_current_user),
):
    """
    Atualiza a senha do usuário logado.
    """
    if not security.verify_password(password_in.senha_atual, current_user.senha_hash):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")
    
    current_user.senha_hash = security.get_password_hash(password_in.nova_senha)
    db.add(current_user)
    db.commit()

    # Auditoria
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        log_msg = f"Usuário {current_user.nome} alterou sua própria senha"
        if not hasattr(conn, "ping"): # SQLite
            cursor.execute("INSERT INTO audit_logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)", (current_user.id, "UPDATE_PASSWORD", log_msg))
        else: # MySQL
            cursor.execute("INSERT INTO audit_logs (usuario_id, acao, detalhes) VALUES (%s, %s, %s)", (current_user.id, "UPDATE_PASSWORD", log_msg))
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return {"success": True}
