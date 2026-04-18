import sqlite3
import os
import bcrypt
import uuid
from datetime import datetime, timedelta

SCHEMA = """
-- SQLite schema completo ZelaMapa

CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    nome TEXT NOT NULL,
    papel TEXT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    email_verificado BOOLEAN DEFAULT FALSE,
    ultimo_login DATETIME NULL,
    tentativas_login INTEGER DEFAULT 0,
    bloqueado_ate DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS motoristas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER UNIQUE NOT NULL,
    cnh TEXT,
    cnh_validade DATE NULL,
    cnh_categoria TEXT DEFAULT 'B',
    placa_caminhao TEXT,
    modelo_caminhao TEXT,
    disponibilidade TEXT DEFAULT 'OFFLINE',
    ultima_posicao_id INTEGER NULL,
    total_entregas INTEGER DEFAULT 0,
    avaliacao_media REAL DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tipos_ocorrencia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    icone TEXT
);

CREATE TABLE IF NOT EXISTS ocorrencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    usuario_id INTEGER NULL,
    tipo_id INTEGER NOT NULL,
    cpf TEXT NULL,
    telefone TEXT NULL,
    cep TEXT,
    endereco TEXT NOT NULL,
    numero TEXT,
    bairro TEXT,
    complemento TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    descricao TEXT,
    imagem_path TEXT,
    status TEXT DEFAULT 'PENDENTE',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (tipo_id) REFERENCES tipos_ocorrencia(id)
);

CREATE TABLE IF NOT EXISTS ordens_servico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    numero_os TEXT UNIQUE NOT NULL,
    ocorrencia_id INTEGER NOT NULL,
    motorista_id INTEGER NULL,
    status TEXT DEFAULT 'ABERTA',
    prioridade TEXT DEFAULT 'MEDIA',
    origem_lat REAL NOT NULL,
    origem_lng REAL NOT NULL,
    origem_endereco TEXT NOT NULL,
    destino_lat REAL NOT NULL,
    destino_lng REAL NOT NULL,
    destino_endereco TEXT NOT NULL,
    data_inicio DATETIME NULL,
    data_fim_previsto DATETIME NULL,
    data_inicio_efetivo DATETIME NULL,
    data_conclusao DATETIME NULL,
    motivo_recusa TEXT NULL,
    observacoes TEXT NULL,
    feedback_nota INTEGER NULL,
    feedback_comentario TEXT NULL,
    distancia_km REAL NULL,
    tempo_estimado_min INTEGER NULL,
    tempo_real_min INTEGER NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ocorrencia_id) REFERENCES ocorrencias(id) ON DELETE CASCADE,
    FOREIGN KEY (motorista_id) REFERENCES motoristas(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS localizacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    motorista_id INTEGER NOT NULL,
    ordem_id INTEGER NULL,
    latitude REAL NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude REAL NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    velocidade REAL CHECK (velocidade >= 0),
    heading REAL CHECK (heading BETWEEN 0 AND 360),
    precisao_meters REAL,
    altitude REAL NULL,
    bateria_restante INTEGER CHECK (bateria_restante BETWEEN 0 AND 100),
    modulo_tipo TEXT DEFAULT 'APP',
    batch_id TEXT NULL,
    enviado BOOLEAN DEFAULT FALSE,
    enviado_em DATETIME NULL,
    device_info TEXT NULL,
    ip_address TEXT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (motorista_id) REFERENCES motoristas(id) ON DELETE CASCADE,
    FOREIGN KEY (ordem_id) REFERENCES ordens_servico(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    motorista_id INTEGER NULL,
    usuario_id INTEGER NULL,
    token_hash TEXT NOT NULL,
    refresh_token_hash TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT NULL,
    device_info TEXT NULL,
    expires_at DATETIME NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (motorista_id) REFERENCES motoristas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tabela_nome TEXT NOT NULL,
    registro_id INTEGER NOT NULL,
    operacao TEXT NOT NULL,
    dados_antigos TEXT NULL,
    dados_novos TEXT NULL,
    usuario_id INTEGER NULL,
    motorista_id INTEGER NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT NULL,
    session_id TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notificacoes_push (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    motorista_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    corpo TEXT NOT NULL,
    tipo TEXT DEFAULT 'NOVA_ORDEM',
    prioridade TEXT DEFAULT 'NORMAL',
    dados_extras TEXT NULL,
    lida BOOLEAN DEFAULT FALSE,
    lida_em DATETIME NULL,
    enviada_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivered BOOLEAN DEFAULT FALSE,
    delivered_em DATETIME NULL,
    FOREIGN KEY (motorista_id) REFERENCES motoristas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS historico_limpeza (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ocorrencia_id INTEGER NULL,
    removido_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    caminho_imagem_removida TEXT,
    FOREIGN KEY (ocorrencia_id) REFERENCES ocorrencias(id)
);

CREATE VIEW IF NOT EXISTS v_motoristas_public AS
SELECT
    m.id,
    m.disponibilidade,
    m.avaliacao_media,
    m.total_entregas,
    '****-' || SUBSTR(m.placa_caminhao, -4) as placa_mascarada,
    u.nome as motorista_nome
FROM motoristas m
JOIN usuarios u ON u.id = m.usuario_id
WHERE u.ativo = TRUE;
"""

def hash_password(senha_plana: str) -> str:
    senha_bytes = senha_plana.encode('utf-8')[:72]
    return bcrypt.hashpw(senha_bytes, bcrypt.gensalt(rounds=12)).decode('utf-8')


def seed_db(force=False):
    try:
        base_dir = os.path.dirname(__file__)
        db_path = os.path.join(base_dir, "zelamapa.db")

        if os.path.exists(db_path) and not force:
            print(f"[Seed] Banco já existe em {db_path}. Use --force para recriar.")
            return

        if force and os.path.exists(db_path):
            os.remove(db_path)
            print(f"[Seed] Banco removido: {db_path}")

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Executa schema completo
        cursor.executescript(SCHEMA)

        # Tipos de ocorrência
        tipos = [
            ("Entulho", "trash"),
            ("Poda", "tree"),
            ("Lixo", "dumpster"),
            ("Móveis", "sofa")
        ]
        for nome, icone in tipos:
            cursor.execute("INSERT INTO tipos_ocorrencia (nome, icone) VALUES (?, ?)", (nome, icone))

        # Usuarios
        senha_hash = hash_password("senha123")
        usuarios = [
            (1, 'admin@zelamapa.com', 'Admin', 'ADMIN', True),
            (2, 'motorista1@zelamapa.com', 'João Silva', 'MOTORISTA', True),
            (3, 'motorista2@zelamapa.com', 'Maria Santos', 'MOTORISTA', True),
        ]
        for id, email, nome, papel, ativo in usuarios:
            cursor.execute("""
                INSERT INTO usuarios (id, uuid, email, senha_hash, nome, papel, ativo)
                VALUES (?, lower(hex(randomblob(16))), ?, ?, ?, ?, ?)
            """, (id, email, senha_hash, nome, papel, ativo))

        # Motoristas (vinculados aos usuarios MOTORISTA)
        motoristas = [
            (2, 'CNH-12345678', '2027-12-31', 'C', 'ABC-1234', 'Volvo FH 540', 'DISPONIVEL'),
            (3, 'CNH-87654321', '2026-06-15', 'B', 'DEF-5678', 'Mercedes Actros', 'DISPONIVEL'),
        ]
        for usuario_id, cnh, validade, categoria, placa, modelo, disp in motoristas:
            cursor.execute("""
                INSERT INTO motoristas
                (usuario_id, cnh, cnh_validade, cnh_categoria, placa_caminhao, modelo_caminhao, disponibilidade)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (usuario_id, cnh, validade, categoria, placa, modelo, disp))

        # Ocorrencias
        locais = [
            (-22.1062, -50.1740, 'Rua das Flores, 123', 'Centro'),
            (-22.1080, -50.1800, 'Av. Brasil, 456', 'Jardim Alvorada'),
            (-22.1040, -50.1700, 'Rua XV, 789', 'Vila Nova'),
        ]
        for i, (lat, lng, endereco, bairro) in enumerate(locais, 1):
            cursor.execute("""
                INSERT INTO ocorrencias
                (uuid, tipo_id, cpf, telefone, cep, endereco, numero, bairro, latitude, longitude, descricao, status)
                VALUES (lower(hex(randomblob(16))), 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDENTE')
            """, (f'123.456.789-{i:02d}', f'1998765432{i}', '19000-000', endereco, 'S/N', bairro, lat, lng, f'Coleta de resíduo #{i}'))

        # Ordens de Servico
        cursor.execute("SELECT id FROM ocorrencias LIMIT 1")
        occ_id = cursor.fetchone()[0]
        cursor.execute("SELECT id FROM motoristas WHERE usuario_id = 2")
        mot_id = cursor.fetchone()[0]

        destino_lat, destino_lng, destino_end = -22.1100, -50.1900, 'Aterro Sanitário Municipal'

        # Ordem 1: atribuída ao João (ACEITA depois)
        cursor.execute("""
            INSERT INTO ordens_servico
            (uuid, numero_os, ocorrencia_id, motorista_id, status,
             origem_lat, origem_lng, origem_endereco,
             destino_lat, destino_lng, destino_endereco)
            VALUES (lower(hex(randomblob(16))), ?, ?, ?, 'ACEITA',
                    (SELECT latitude FROM ocorrencias WHERE id = ?),
                    (SELECT longitude FROM ocorrencias WHERE id = ?),
                    (SELECT endereco || ', ' || numero || ' - ' || bairro FROM ocorrencias WHERE id = ?),
                    ?, ?, ?)
        """, ('OS-2024-0001', occ_id, mot_id, occ_id, occ_id, occ_id,
              destino_lat, destino_lng, destino_end))

        # Ordem 2: ABERTA (disponível para qualquer motorista aceitar)
        cursor.execute("""
            INSERT INTO ordens_servico
            (uuid, numero_os, ocorrencia_id, motorista_id, status,
             origem_lat, origem_lng, origem_endereco,
             destino_lat, destino_lng, destino_endereco)
            VALUES (lower(hex(randomblob(16))), ?, ?, NULL, 'ABERTA',
                    (SELECT latitude FROM ocorrencias WHERE id = ?),
                    (SELECT longitude FROM ocorrencias WHERE id = ?),
                    (SELECT endereco || ', ' || numero || ' - ' || bairro FROM ocorrencias WHERE id = ?),
                    ?, ?, ?)
        """, ('OS-2024-0002', occ_id, occ_id, occ_id, occ_id,
              destino_lat, destino_lng, destino_end))

        # Localizacoes de exemplo
        cursor.execute("SELECT id FROM motoristas LIMIT 1")
        motorista_id = cursor.fetchone()[0]
        cursor.execute("SELECT id FROM ordens_servico LIMIT 1")
        ordem_id = cursor.fetchone()[0]

        cursor.execute("""
            INSERT INTO localizacoes
            (motorista_id, ordem_id, latitude, longitude, velocidade, timestamp)
            VALUES (?, ?, -22.1080, -50.1750, 45.5, datetime('now'))
        """, (motorista_id, ordem_id))

        # Sessions de exemplo
        expira = datetime.now() + timedelta(days=7)
        cursor.execute("""
            INSERT INTO sessions
            (id, motorista_id, token_hash, refresh_token_hash, ip_address, expires_at)
            VALUES (lower(hex(randomblob(16))), ?, 'tokenhash123', 'refreshtoken456', '192.168.1.100', ?)
        """, (motorista_id, expira.isoformat()))

        # Notificacao push de exemplo
        cursor.execute("""
            INSERT INTO notificacoes_push
            (motorista_id, titulo, corpo, tipo)
            VALUES (?, 'Nova Ordem Disponivel', 'Voce tem uma nova ordem de servico aguardando', 'NOVA_ORDEM')
        """, (motorista_id,))

        conn.commit()
        cursor.close()
        conn.close()
        print(f"\n✅ Banco SQLite populado! DB: {db_path}")
        print("\n📌 Credenciais de teste:")
        print("   Admin:      admin@zelamapa.com      / senha123")
        print("   Motorista:  motorista1@zelamapa.com / senha123")
        print("   Motorista:  motorista2@zelamapa.com / senha123")
    except sqlite3.Error as e:
        print(f"Erro ao seedar banco SQLite: {e}")
        import traceback; traceback.print_exc()


if __name__ == "__main__":
    import sys
    force = '--force' in sys.argv
    seed_db(force=force)
