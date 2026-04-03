import sqlite3
import os

SCHEMA = """
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    papel VARCHAR(50) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tipos_ocorrencia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    icone VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS ocorrencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    tipo_id INTEGER,
    cpf VARCHAR(14),
    telefone VARCHAR(15),
    cep VARCHAR(9),
    endereco VARCHAR(255),
    numero VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    descricao TEXT,
    imagem_path VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PENDENTE',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (tipo_id) REFERENCES tipos_ocorrencia(id)
);

CREATE TABLE IF NOT EXISTS ordens_servico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ocorrencia_id INTEGER,
    motorista_id INTEGER,
    status VARCHAR(50) DEFAULT 'ABERTA',
    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finalizada_em TIMESTAMP NULL,
    FOREIGN KEY (ocorrencia_id) REFERENCES ocorrencias(id),
    FOREIGN KEY (motorista_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS historico_limpeza (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ocorrencia_id INTEGER,
    removido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    caminho_imagem_removida VARCHAR(255),
    FOREIGN KEY (ocorrencia_id) REFERENCES ocorrencias(id)
);
"""

def seed_db():
    try:
        db_path = os.path.join(os.path.dirname(__file__), "zelamapa.db")
        if os.path.exists(db_path):
            os.remove(db_path) # Limpa tudo recriando
            
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Executa schema
        cursor.executescript(SCHEMA)
        
        # Tipos
        tipos = [
            ("Entulho", "mdi-debris"),
            ("Móveis", "mdi-sofa"),
            ("Poda", "mdi-tree")
        ]
        for t in tipos:
            cursor.execute("INSERT INTO tipos_ocorrencia (nome, icone) VALUES (?, ?)", t)
            
        # Usuarios
        usuarios = [
            ("Gestor", "gestor@pompeia.sp.gov.br", "hash", "ADMIN"),
            ("João Silva", "joao.silva@pompeia.sp.gov.br", "hash", "MOTORISTA"),
            ("Maria Santos", "maria.santos@pompeia.sp.gov.br", "hash", "MOTORISTA"),
            ("Pedro Costa", "pedro.costa@pompeia.sp.gov.br", "hash", "MOTORISTA"),
            ("Cidadão Anônimo", "fake@pompeia.sp.gov.br", "hash", "CADASTRADOR")
        ]
        for u in usuarios:
            cursor.execute("INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES (?, ?, ?, ?)", u)
        
        # Ocorrencias simuladas Pompeia
        ocorrencias = [
            (5, 1, "123.456.789-00", "(14) 98888-1111", "17580-000", "Rua Sen. Eurico Ribeiro", "10", -22.102, -50.176, "Entulho na calçada", "CONCLUIDO"),
            (5, 2, "123.456.789-00", "(14) 98888-1111", "17580-000", "Rua Luiz Cunha", "20", -22.106, -50.170, "Sofá abandonado", "EM_ANDAMENTO"),
            (5, 3, "123.456.789-00", "(14) 98888-1111", "17580-000", "Rua Rodolfo Miranda", "30", -22.110, -50.178, "Galhos cortados de árvore", "PENDENTE"),
            (5, 1, "123.456.789-00", "(14) 98888-1111", "17580-000", "Rua Getúlio Vargas", "40", -22.115, -50.165, "Resto de obra bloqueando rua", "PENDENTE"),
            (5, 2, "123.456.789-00", "(14) 98888-1111", "17580-000", "Rua Dr. Luiz Miranda", "50", -22.100, -50.160, "Colchão velho e estante", "PENDENTE"),
            (5, 1, "123.456.789-00", "(14) 98888-1111", "17580-000", "Avenida Expedicionários", "60", -22.105, -50.175, "Tijolos soltos na praça", "PENDENTE"),
        ]
        for oc in ocorrencias:
            cursor.execute("""
                INSERT INTO ocorrencias (usuario_id, tipo_id, cpf, telefone, cep, endereco, numero, latitude, longitude, descricao, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, oc)
            
        # Ordens de Servico
        os_data = [
            (1, 2, 'CONCLUIDA'), # Oco 1, João
            (2, 2, 'EM_ROTA')    # Oco 2, João
        ]
        for o in os_data:
            cursor.execute("INSERT INTO ordens_servico (ocorrencia_id, motorista_id, status) VALUES (?, ?, ?)", o)
            
        conn.commit()
        cursor.close()
        conn.close()
        print("Banco SQLite populado com sucesso (Seed)!")
    except sqlite3.Error as e:
        print(f"Erro ao seedar banco SQLite: {e}")

if __name__ == "__main__":
    seed_db()
