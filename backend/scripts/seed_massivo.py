#!/usr/bin/env python3
import os
import sys
import bcrypt
import uuid
import random
from datetime import datetime, timedelta

# Adicionar o diretório da API ao path para importar a conexão
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'api'))
from database import get_db_connection

def hash_password(senha_plana: str) -> str:
    senha_bytes = senha_plana.encode('utf-8')[:72]
    return bcrypt.hashpw(senha_bytes, bcrypt.gensalt(rounds=12)).decode('utf-8')

def clear_tables(cursor):
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
    tabelas = [
        'notificacoes_push', 'sessions', 'audit_logs', 'localizacoes',
        'ordens_servico', 'ocorrencias', 'motoristas', 'usuarios',
        'tipos_ocorrencia'
    ]
    for tabela in tabelas:
        cursor.execute(f"TRUNCATE TABLE {tabela}")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")

def seed_massivo():
    conn = get_db_connection()
    if not conn:
        print("❌ Falha ao conectar ao banco")
        sys.exit(1)
    cursor = conn.cursor(dictionary=True)
    
    try:
        print("🧹 Limpando dados antigos...")
        clear_tables(cursor)
        
        # 1. Tipos de Ocorrência
        tipos = [('Entulho', 'trash'), ('Poda', 'tree'), ('Lixo', 'dumpster'), ('Móveis', 'sofa')]
        for nome, icone in tipos:
            cursor.execute("INSERT INTO tipos_ocorrencia (nome, icone) VALUES (%s, %s)", (nome, icone))
        
        # Pegar IDs dos tipos
        cursor.execute("SELECT id, nome FROM tipos_ocorrencia")
        tipo_ids = {row['nome']: row['id'] for row in cursor.fetchall()}
        
        # 2. Usuários e Motoristas (10 unidades)
        print("👤 Criando 10 contas de motoristas...")
        nomes = ["Ricardo", "Felipe", "Bruno", "Thiago", "Gustavo", "André", "Lucas", "Rafael", "Diego", "Rodrigo"]
        sobrenomes = ["Oliveira", "Souza", "Lima", "Pereira", "Ferreira", "Costa", "Rodrigues", "Almeida", "Nascimento", "Carvalho"]
        senha_admin_hash = hash_password("admin")
        senha_motorista_hash = hash_password("123")
        
        # Criar Admin primeiro
        print("  🔑 Criando Admin...")
        cursor.execute("INSERT INTO usuarios (uuid, email, senha_hash, nome, papel) VALUES (UUID(), %s, %s, %s, %s)",
                       ('admin', senha_admin_hash, 'Admin Master', 'ADMIN'))
        
        motorista_ids = []
        for i in range(10):
            nome_completo = f"{nomes[i]} {sobrenomes[i]}"
            email = "motorista" if i == 0 else f"motorista{i+1}"
            print(f"  🚛 Criando {email}...")
            
            # Criar Usuário
            cursor.execute("INSERT INTO usuarios (uuid, email, senha_hash, nome, papel) VALUES (UUID(), %s, %s, %s, %s)",
                           (email, senha_motorista_hash, nome_completo, 'MOTORISTA'))
            user_id = cursor.lastrowid
            
            # Criar Motorista
            cursor.execute("""
                INSERT INTO motoristas 
                (usuario_id, cnh, cnh_validade, cnh_categoria, placa_caminhao, modelo_caminhao, disponibilidade)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (user_id, f"CNH-{random.randint(10000000, 99999999)}", "2028-01-01", "D", 
                  f"ABC-{random.randint(1000, 9999)}", "Caminhão Coletor Volvo", "DISPONIVEL"))
            motorista_ids.append(cursor.lastrowid)

        # 3. Ocorrências e Chamados de 1 Mês (Simular ~150 registros)
        print("🗺️ Gerando chamados dos últimos 30 dias...")
        bairros = ["Centro", "Jardim Alvorada", "Vila Nova", "Distrito Industrial", "Paraíso", "Tuiuti"]
        status_list = ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDO"]
        
        # Coordenadas base de Pompéia
        base_lat, base_lng = -22.1062, -50.1740
        
        agora = datetime.now()
        for d in range(30):
            data_chamado = agora - timedelta(days=d)
            # Gerar entre 3 e 8 chamados por dia
            for _ in range(random.randint(3, 8)):
                lat = base_lat + random.uniform(-0.015, 0.015)
                lng = base_lng + random.uniform(-0.015, 0.015)
                tipo_nome = random.choice(list(tipo_ids.keys()))
                status = random.choice(status_list)
                if d > 7: status = "CONCLUIDO" # Mais antigos tendem a estar concluídos
                
                print(f"  📍 Ocorrência {d+1}/{30}...")
                cursor.execute("""
                    INSERT INTO ocorrencias 
                    (uuid, tipo_id, endereco, bairro, latitude, longitude, descricao, status, criado_em)
                    VALUES (UUID(), %s, %s, %s, %s, %s, %s, %s, %s)
                """, (int(tipo_ids[tipo_nome]), f"Rua Teste, {random.randint(1, 1000)}", 
                      str(random.choice(bairros)), float(lat), float(lng), f"Coleta de {tipo_nome.lower()} solicitada",
                      str(status), data_chamado))
                
                occ_id = cursor.lastrowid
                
                    # Se estiver CONCLUÍDO ou EM_ANDAMENTO, criar uma Ordem de Serviço
                if status != "PENDENTE":
                    mot_id = random.choice(motorista_ids)
                    data_conclusao = data_chamado + timedelta(hours=random.randint(2, 48)) if status == "CONCLUIDO" else None
                    dist = random.uniform(1.5, 12.0)
                    gas_ref = 5.89
                    cons_ref = 3.5
                    valor_os = (dist / cons_ref) * gas_ref if status == "CONCLUIDO" else 0
                    
                    cursor.execute("""
                        INSERT INTO ordens_servico 
                        (uuid, numero_os, ocorrencia_id, motorista_id, status, created_at, data_conclusao, distancia_km,
                         origem_lat, origem_lng, destino_lat, destino_lng, origem_endereco, destino_endereco,
                         preco_combustivel_snapshot, valor_total_os)
                        VALUES (UUID(), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (f"OS-{data_chamado.strftime('%Y%m%d')}-{occ_id}", occ_id, mot_id, 
                          "CONCLUIDA" if status == "CONCLUIDO" else "EM_ROTA", 
                          data_chamado, data_conclusao, dist,
                          lat, lng, base_lat, base_lng, "Endereço Origem Teste", "Aterro Sanitário Pompéia",
                          gas_ref if status == "CONCLUIDO" else None, valor_os if status == "CONCLUIDO" else None))

        # 4. Configurações
        print("⚙️ Atualizando configurações...")
        configs = [
            ("preco_gasolina", "5.89"),
            ("consumo_medio_km_l", "3.5"),
            ("nome_instituicao", "ZelaMapa Pompéia"),
            ("sla_inatividade_min", "15")
        ]
        for chave, valor in configs:
            cursor.execute("DELETE FROM configuracoes WHERE chave = %s", (chave,))
            cursor.execute("INSERT INTO configuracoes (chave, valor) VALUES (%s, %s)", (chave, valor))

        conn.commit()
        print("\n✅ BANCO POPULADO COM SUCESSO!")
        print(f"   - 10 Motoristas criados (motorista1 a motorista10)")
        print(f"   - ~150 Chamados gerados cobrindo 30 dias")
        print(f"   - Todas as senhas são: senha123")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ ERRO: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    seed_massivo()
