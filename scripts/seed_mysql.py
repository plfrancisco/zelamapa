#!/usr/bin/env python3
"""
Seed database MySQL with test data for driver app.
Limpa tabelas existentes e reinsere.
"""
import os
import sys
import bcrypt
import uuid
from datetime import datetime, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))
from database import get_db_connection

def hash_password(senha_plana: str) -> str:
    senha_bytes = senha_plana.encode('utf-8')[:72]
    return bcrypt.hashpw(senha_bytes, bcrypt.gensalt(rounds=12)).decode('utf-8')

def clear_tables(cursor):
    """Limpa tabelas na ordem de dependência usando TRUNCATE (reseta auto_increment)."""
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
    tabelas = [
        'notificacoes_push',
        'sessions',
        'audit_log',
        'localizacoes',
        'ordens_servico',
        'ocorrencias',
        'motoristas',
        'usuarios',
        'tipos_ocorrencia',
        'historico_limpeza'
    ]
    for tabela in tabelas:
        try:
            cursor.execute(f"TRUNCATE TABLE {tabela}")
            print(f"  🗑️  Limpou {tabela}")
        except Exception as e:
            print(f" ⚠️  Erro ao limpar {tabela}: {e}")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")

def seed():
    conn = get_db_connection()
    if not conn:
        print("❌ Falha ao conectar ao banco")
        sys.exit(1)
    cursor = conn.cursor()
    try:
        print("🌱 Iniciando seed MySQL (limpeza + insert)...")
        
        # Limpar dados existentes
        print("🧹 Limpando tabelas...")
        clear_tables(cursor)
        conn.commit()
        print("✅ Tabelas limpas")
        
        # 1. Tipos de ocorrência
        print("\n📦 Inserindo tipos de ocorrência...")
        tipos = [('Entulho', 'trash'), ('Poda', 'tree'), ('Lixo', 'dumpster'), ('Móveis', 'sofa')]
        for nome, icone in tipos:
            cursor.execute("INSERT INTO tipos_ocorrencia (nome, icone) VALUES (%s, %s)", (nome, icone))
        print(f"  ✅ {cursor.rowcount} tipos inseridos")
        
        # 2. Usuários
        print("\n👤 Inserindo usuários...")
        senha_hash = hash_password("senha123")
        usuarios = [
            (1, 'admin@zelamapa.com', 'Admin', 'ADMIN'),
            (2, 'motorista1@zelamapa.com', 'João Silva', 'MOTORISTA'),
            (3, 'motorista2@zelamapa.com', 'Maria Santos', 'MOTORISTA'),
        ]
        for id, email, nome, papel in usuarios:
            cursor.execute("""
                INSERT INTO usuarios (id, uuid, email, senha_hash, nome, papel)
                VALUES (%s, UUID(), %s, %s, %s, %s)
            """, (id, email, senha_hash, nome, papel))
        print(f"  ✅ {cursor.rowcount} usuários inseridos (senha: senha123)")
        
        # 3. Motoristas
        print("\n🚛 Inserindo motoristas...")
        motoristas = [
            (2, 'CNH-12345678', '2027-12-31', 'C', 'ABC-1234', 'Volvo FH 540'),
            (3, 'CNH-87654321', '2026-06-15', 'B', 'DEF-5678', 'Mercedes Actros'),
        ]
        for usuario_id, cnh, validade, categoria, placa, modelo in motoristas:
            cursor.execute("""
                INSERT INTO motoristas 
                (usuario_id, cnh, cnh_validade, cnh_categoria, placa_caminhao, modelo_caminhao, disponibilidade)
                VALUES (%s, %s, %s, %s, %s, %s, 'DISPONIVEL')
            """, (usuario_id, cnh, validade, categoria, placa, modelo))
        print(f"  ✅ {cursor.rowcount} motoristas inseridos")
        
        # 4. Ocorrências
        print("\n🗺️  Inserindo ocorrências...")
        locais = [
            (-22.1062, -50.1740, 'Rua das Flores, 123', 'Centro'),
            (-22.1080, -50.1800, 'Av. Brasil, 456', 'Jardim Alvorada'),
            (-22.1040, -50.1700, 'Rua XV, 789', 'Vila Nova'),
        ]
        for i, (lat, lng, endereco, bairro) in enumerate(locais, 1):
            cursor.execute("""
                INSERT INTO ocorrencias 
                (uuid, tipo_id, cpf, telefone, cep, endereco, numero, bairro, latitude, longitude, descricao, status)
                VALUES (UUID(), 1, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'PENDENTE')
            """, (f'123.456.789-{i:02d}', f'1998765432{i}', '19000-000', endereco, 'S/N', bairro, lat, lng, f'Coleta de resíduo #{i}'))
        print(f"  ✅ {cursor.rowcount} ocorrências inseridas")
        
        # 5. Ordem de Serviço
        print("\n📋 Inserindo ordem de serviço...")
        cursor.execute("SELECT id FROM ocorrencias LIMIT 1")
        occ_id = cursor.fetchone()[0]
        cursor.execute("SELECT id FROM motoristas WHERE usuario_id = 2")
        mot_id = cursor.fetchone()[0]
        
        destino_lat, destino_lng, destino_end = -22.1100, -50.1900, 'Aterro Sanitário Municipal'
        
        cursor.execute("""
            INSERT INTO ordens_servico 
            (uuid, numero_os, ocorrencia_id, motorista_id, status,
             origem_lat, origem_lng, origem_endereco,
             destino_lat, destino_lng, destino_endereco)
            VALUES (%s, %s, %s, %s, 'ABERTA',
                    (SELECT latitude FROM ocorrencias WHERE id = %s),
                    (SELECT longitude FROM ocorrencias WHERE id = %s),
                    (SELECT CONCAT(endereco, ', ', numero, ' - ', bairro) FROM ocorrencias WHERE id = %s),
                    %s, %s, %s)
        """, (str(uuid.uuid4()), 'OS-2024-0001', occ_id, mot_id,
              occ_id, occ_id, occ_id,
              destino_lat, destino_lng, destino_end))
        print(f"  ✅ Ordem de serviço criada (id: {cursor.lastrowid})")
        
        # Commit tudo
        conn.commit()
        print("\n🎉 Seed concluído com sucesso!")
        print("\n📌 Credenciais de teste:")
        print("   Admin:      admin@zelamapa.com      / senha123")
        print("   Motorista:  motorista1@zelamapa.com / senha123")
        print("   Motorista:  motorista2@zelamapa.com / senha123")
        
    except Exception as e:
        conn.rollback()
        print(f"\n❌ Erro no seed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    seed()
