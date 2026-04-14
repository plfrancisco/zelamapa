import os
import sqlite3
import mysql.connector
from mysql.connector import pooling


def get_db_connection():
    """
    Retorna conexão com o banco de dados.
    - No ambiente Vercel/renderخدام MySQL via DATABASE_URL
    - Localmente usa SQLite como fallback rápido
    """
    db_url = os.getenv("DATABASE_URL")

    if db_url:
        # MySQL connection (Vitess, Planetscale, ClearDB, etc.)
        try:
            config = {
                "host": os.getenv("DB_HOST", "localhost"),
                "port": int(os.getenv("DB_PORT", 3306)),
                "user": os.getenv("DB_USER", "root"),
                "password": os.getenv("DB_PASSWORD", ""),
                "database": os.getenv("DB_NAME", "zelamapa"),
                "autocommit": False,
            }
            # Use connection pooling if available
            connection_pool = pooling.MySQLConnectionPool(pool_name="zelamapa_pool", pool_size=5, **config)
            conn = connection_pool.get_connection()
            conn.cursor_factory = mysql.connector.MySQLCursorDict
            return conn
        except Exception as e:
            print(f"[DB] MySQL connection failed, falling back to SQLite: {e}")
            # Fall through to SQLite

    # SQLite fallback (local development, /tmp)
    try:
        base_dir = os.path.dirname(os.path.dirname(__file__))
        db_path = os.path.join(base_dir, "zelamapa.db")
        if not os.path.exists(db_path):
            print(f"[DB] SQLite DB not found at {db_path}, using /tmp fallback")
            db_path = "/tmp/zelamapa.db"
        connection = sqlite3.connect(db_path, check_same_thread=False)
        connection.row_factory = sqlite3.Row
        return connection
    except sqlite3.Error as e:
        print(f"Erro ao conectar ao SQLite: {e}")
        return None
