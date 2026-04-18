#!/usr/bin/env python3
"""
Inicializa banco SQLite com schema completo.
"""
import os
import sqlite3

def init_sqlite():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, "zelamapa.db")
    schema_path = os.path.join(base_dir, "schema_sqlite.sql")

    with open(schema_path, "r") as f:
        schema = f.read()

    conn = sqlite3.connect(db_path)
    try:
        conn.executescript(schema)
        conn.commit()
        print(f"✅ Banco SQLite inicializado em {db_path}")

        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"📊 Tabelas criadas: {tables}")

        # Contar registros em cada tabela (deve estar vazio)
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"   {table}: {count} registros")
    finally:
        conn.close()

if __name__ == "__main__":
    init_sqlite()
