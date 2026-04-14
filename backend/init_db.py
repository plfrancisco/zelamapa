#!/usr/bin/env python3
"""
Script para inicializar o banco de dados no ambiente Vercel.
Executa automaticamente no primeiro deploy.
"""
import os
import sqlite3

def init_sqlite():
    """Cria o banco SQLite com schema se não existir."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, "zelamapa.db")

    schema_path = os.path.join(os.path.dirname(base_dir), "database", "schema.sql")
    with open(schema_path, "r") as f:
        schema = f.read()

    conn = sqlite3.connect(db_path)
    try:
        conn.executescript(schema)
        conn.commit()
        print(f"✅ Banco SQLite inicializado em {db_path}")
    finally:
        conn.close()

if __name__ == "__main__":
    init_sqlite()
