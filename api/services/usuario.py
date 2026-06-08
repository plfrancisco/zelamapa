from sqlalchemy.orm import Session
from ..models.usuario import Usuario
from ..schemas.usuario import UsuarioCreate, UsuarioUpdate
from ..utils.security import get_password_hash, verify_password

def get_usuario(db: Session, usuario_id: int):
    return db.query(Usuario).filter(Usuario.id == usuario_id).first()

def get_usuario_by_email(db: Session, email: str):
    return db.query(Usuario).filter(Usuario.email == email).first()

def create_usuario(db: Session, obj_in: UsuarioCreate):
    db_obj = Usuario(
        email=obj_in.email,
        senha_hash=get_password_hash(obj_in.senha),
        nome=obj_in.nome,
        papel=obj_in.papel,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def authenticate(db: Session, email: str, senha: str):
    usuario = get_usuario_by_email(db, email)
    if not usuario:
        return None
    if not verify_password(senha, usuario.senha_hash):
        return None
    return usuario
