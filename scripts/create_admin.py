#!/usr/bin/env python3
"""
Adiciona usuário ADMIN ao banco MySQL.
"""
import os
import sys
import bcrypt

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))
from database import get_db_connection

def hash_password(senha: str) -> str:
    senha_bytes = senha.encode('utf-8')[:72]
    return bcrypt.hashpw(senha_bytes, bcrypt.gensalt(rounds=12)).decode('utf-8')

def create_admin(email: str, senha: str, nome: str = "Administrador"):
    conn = get_db_connection()
    if not conn:
        print("❌ Falha conexão")
        sys.exit(1)
    cursor = conn.cursor()
    try:
        # Verifica se já existe
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
        if cursor.fetchone():
            print(f"ℹ️  Usuário {email} já existe")
            return

        senha_hash = hash_password(senha)
        cursor.execute("""
            INSERT INTO usuarios (uuid, email, senha_hash, nome, papel)
            VALUES (UUID(), %s, %s, %s, 'ADMIN')
        """, (email, senha_hash, nome))

        conn.commit()
        print(f"✅ Admin criado: {email} / {senha}")
        print("   Papel: ADMIN (acesso total)")
    except Exception as e:
        conn.rollback()
        print(f"❌ Erro: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    # CONFIGURE AQUI:
    EMAIL = "admin"
    SENHA = "admin"  # mudar para "admin" se preferir
    NOME = "Administrador"

    create_admin(EMAIL, SENHA, NOME)
