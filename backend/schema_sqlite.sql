-- SQLite schema completo para ZelaMapa
-- Convertido de MySQL schema (init_schema.sql)

-- ============================================
-- 1. USUARIOS
-- ============================================
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

CREATE INDEX IF NOT EXISTS idx_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_papel ON usuarios(papel);
CREATE INDEX IF NOT EXISTS idx_ativo ON usuarios(ativo);

-- ============================================
-- 2. MOTORISTAS
-- ============================================
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

CREATE INDEX IF NOT EXISTS idx_usuario ON motoristas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_disponibilidade ON motoristas(disponibilidade);

-- ============================================
-- 3. TIPOS_OCORRENCIA
-- ============================================
CREATE TABLE IF NOT EXISTS tipos_ocorrencia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    icone TEXT
);

-- ============================================
-- 4. OCORRENCIAS
-- ============================================
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

CREATE INDEX IF NOT EXISTS idx_status ON ocorrencias(status);
CREATE INDEX IF NOT EXISTS idx_criado ON ocorrencias(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_localizacao ON ocorrencias(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_usuario ON ocorrencias(usuario_id);

-- ============================================
-- 5. ORDENS_SERVICO
-- ============================================
CREATE TABLE IF NOT EXISTS ordens_servico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    numero_os TEXT UNIQUE NOT NULL,
    ocorrencia_id INTEGER NOT NULL,
    motorista_id INTEGER NULL,
    status TEXT DEFAULT 'ABERTA',
    prioridade TEXT DEFAULT 'MEDIA',

    -- Dados da rota (duplicados para auditoria)
    origem_lat REAL NOT NULL,
    origem_lng REAL NOT NULL,
    origem_endereco TEXT NOT NULL,
    destino_lat REAL NOT NULL,
    destino_lng REAL NOT NULL,
    destino_endereco TEXT NOT NULL,

    -- Cronograma
    data_inicio DATETIME NULL,
    data_fim_previsto DATETIME NULL,
    data_inicio_efetivo DATETIME NULL,
    data_conclusao DATETIME NULL,

    -- Decisões
    motivo_recusa TEXT NULL,
    observacoes TEXT NULL,
    feedback_nota INTEGER NULL,
    feedback_comentario TEXT NULL,

    -- Métricas
    distancia_km REAL NULL,
    tempo_estimado_min INTEGER NULL,
    tempo_real_min INTEGER NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (ocorrencia_id) REFERENCES ocorrencias(id) ON DELETE CASCADE,
    FOREIGN KEY (motorista_id) REFERENCES motoristas(id) ON DELETE SET NULL,
    UNIQUE(ocorrencia_id)
);

CREATE INDEX IF NOT EXISTS idx_motorista ON ordens_servico(motorista_id);
CREATE INDEX IF NOT EXISTS idx_status ON ordens_servico(status);
CREATE INDEX IF NOT EXISTS idx_prioridade ON ordens_servico(prioridade);
CREATE INDEX IF NOT EXISTS idx_data_inicio ON ordens_servico(data_inicio);
CREATE INDEX IF NOT EXISTS idx_numero_os ON ordens_servico(numero_os);

-- ============================================
-- 6. LOCALIZACOES (rastreamento GPS)
-- ============================================
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

CREATE INDEX IF NOT EXISTS idx_motorista_timestamp ON localizacoes(motorista_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ordem ON localizacoes(ordem_id);
CREATE INDEX IF NOT EXISTS idx_batch ON localizacoes(batch_id, enviado);

-- ============================================
-- 7. SESSOES (JWT revogação)
-- ============================================
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

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(usuario_id, revoked, expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_motorista ON sessions(motorista_id, revoked, expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);

-- ============================================
-- 8. AUDIT_LOG (logs de segurança)
-- ============================================
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

CREATE INDEX IF NOT EXISTS idx_tabela_registro ON audit_log(tabela_nome, registro_id);
CREATE INDEX IF NOT EXISTS idx_usuario ON audit_log(usuario_id);
CREATE INDEX IF NOT EXISTS idx_motorista ON audit_log(motorista_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON audit_log(created_at DESC);

-- ============================================
-- 9. NOTIFICACOES_PUSH
-- ============================================
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

CREATE INDEX IF NOT EXISTS idx_notificacoes_motorista ON notificacoes_push(motorista_id, lida, enviada_em DESC);

-- ============================================
-- 10. HISTORICO_LIMPEZA
-- ============================================
CREATE TABLE IF NOT EXISTS historico_limpeza (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ocorrencia_id INTEGER NULL,
    removido_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    caminho_imagem_removida TEXT,
    FOREIGN KEY (ocorrencia_id) REFERENCES ocorrencias(id)
);

-- ============================================
-- 11. VIEW para motorista (dados públicos sem PII)
-- ============================================
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
