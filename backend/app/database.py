import sqlite3
import os

def get_db_connection():
    try:
        # Resolve to backend/ database file
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "zelamapa.db")
        connection = sqlite3.connect(db_path, check_same_thread=False)
        connection.row_factory = sqlite3.Row
        return connection
    except sqlite3.Error as e:
        print(f"Erro ao conectar ao SQLite: {e}")
        return None
