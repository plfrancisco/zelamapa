import os
import mysql.connector
from mysql.connector import pooling
import sqlite3
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

def get_db_connection():
    """
    Retorna conexão com o banco de dados.
    - Prioriza MySQL via variáveis de ambiente
    - Fallback para SQLite
    """
    try:
        config = {
            "host": os.getenv("DB_HOST", "localhost"),
            "port": int(os.getenv("DB_PORT", 3307)),
            "user": os.getenv("DB_USER", "zelamapa"),
            "password": os.getenv("DB_PASSWORD", "2307"),
            "database": os.getenv("DB_NAME", "zelamapa"),
            "autocommit": False,
            "charset": "utf8mb4",
            "collation": "utf8mb4_unicode_ci",
        }
        
        connection_pool = pooling.MySQLConnectionPool(
            pool_name="zelamapa_pool",
            pool_size=10,
            **config
        )
        conn = connection_pool.get_connection()
        return conn
    except Exception as e:
        print(f"[DB] MySQL connection failed: {e}")
        try:
            base_dir = os.path.dirname(os.path.dirname(__file__))
            db_path = os.path.join(base_dir, "zelamapa.db")
            if not os.path.exists(db_path):
                return None
            connection = sqlite3.connect(db_path, check_same_thread=False)
            connection.row_factory = sqlite3.Row
            return connection
        except sqlite3.Error as e2:
            print(f"[DB] SQLite also failed: {e2}")
            return None
