-- ============================================
-- ZELAMAPA — Schema Completo MySQL 8.0
-- App Motorista Production-Ready
-- ============================================

USE zelamapa;

-- ============================================
-- 1. USUARIOS
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    papel ENUM('ADMIN', 'MOTORISTA', 'CADASTRADOR') NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_papel (papel),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. MOTORISTAS
-- ============================================
CREATE TABLE IF NOT EXISTS motoristas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNIQUE NOT NULL,
    cnh VARCHAR(255) NOT NULL,
    cnh_validade DATE NOT NULL,
    cnh_categoria ENUM('A','B','C','D','E','AB','AC','AD','AE') DEFAULT 'B',
    placa_caminhao VARCHAR(255) NOT NULL,
    modelo_caminhao VARCHAR(100),
    disponibilidade ENUM('DISPONIVEL','EM_ROTA','OFFLINE','EM_PAUSA') DEFAULT 'OFFLINE',
    ultima_posicao_id INT NULL,
    total_entregas INT DEFAULT 0,
    avaliacao_media DECIMAL(3,2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_disponibilidade (disponibilidade)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. TIPOS_OCORRENCIA
-- ============================================
CREATE TABLE IF NOT EXISTS tipos_ocorrencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    icone VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. OCORRENCIAS
-- ============================================
CREATE TABLE IF NOT EXISTS ocorrencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    usuario_id INT NULL,
    tipo_id INT NOT NULL,
    cpf VARCHAR(255) NULL,
    telefone VARCHAR(255) NULL,
    cep VARCHAR(9),
    endereco TEXT NOT NULL,
    numero VARCHAR(20),
    bairro VARCHAR(100),
    complemento TEXT,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    descricao TEXT,
    imagem_path VARCHAR(255),
    status ENUM('PENDENTE','EM_ANDAMENTO','CONCLUIDO','CANCELADO') DEFAULT 'PENDENTE',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (tipo_id) REFERENCES tipos_ocorrencia(id),
    INDEX idx_status (status),
    INDEX idx_criado (criado_em DESC),
    INDEX idx_localizacao (latitude, longitude),
    INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. ORDENS_SERVICO
-- ============================================
CREATE TABLE IF NOT EXISTS ordens_servico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    numero_os VARCHAR(50) UNIQUE NOT NULL,
    ocorrencia_id INT NOT NULL,
    motorista_id INT NULL,
    status ENUM('ABERTA','ACEITA','EM_ROTA','CONCLUIDA','RECUSADA','CANCELADA') DEFAULT 'ABERTA',
    prioridade ENUM('BAIXA','MEDIA','ALTA','URGENTE') DEFAULT 'MEDIA',
    origem_lat DECIMAL(10,8) NOT NULL,
    origem_lng DECIMAL(11,8) NOT NULL,
    origem_endereco TEXT NOT NULL,
    destino_lat DECIMAL(10,8) NOT NULL,
    destino_lng DECIMAL(11,8) NOT NULL,
    destino_endereco TEXT NOT NULL,
    data_inicio DATETIME NULL,
    data_fim_previsto DATETIME NULL,
    data_inicio_efetivo DATETIME NULL,
    data_conclusao DATETIME NULL,
    motivo_recusa TEXT NULL,
    observacoes TEXT NULL,
    feedback_nota INT NULL,
    feedback_comentario TEXT NULL,
    distancia_km DECIMAL(8,2) NULL,
    tempo_estimado_min INT NULL,
    tempo_real_min INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ocorrencia_id) REFERENCES ocorrencias(id) ON DELETE CASCADE,
    FOREIGN KEY (motorista_id) REFERENCES motoristas(id) ON DELETE SET NULL,
    UNIQUE KEY uniq_ocorrencia (ocorrencia_id),
    INDEX idx_motorista (motorista_id),
    INDEX idx_status (status),
    INDEX idx_prioridade (prioridade),
    INDEX idx_data_inicio (data_inicio),
    INDEX idx_numero_os (numero_os),
    CONSTRAINT chk_feedback_nota CHECK (feedback_nota IS NULL OR (feedback_nota BETWEEN 1 AND 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. LOCALIZACOES (rastreamento GPS)
-- ============================================
CREATE TABLE IF NOT EXISTS localizacoes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    motorista_id INT NOT NULL,
    ordem_id INT NULL,
    latitude DECIMAL(10,8) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude DECIMAL(11,8) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    velocidade DECIMAL(5,2) CHECK (velocidade >= 0),
    heading DECIMAL(5,2) CHECK (heading BETWEEN 0 AND 360),
    precisao_meters DECIMAL(5,2),
    altitude DECIMAL(8,2) NULL,
    bateria_restante INT CHECK (bateria_restante BETWEEN 0 AND 100),
    modulo_tipo ENUM('APP','GPS_EXTERNO','TELEMETRIA') DEFAULT 'APP',
    batch_id CHAR(36) NULL,
    enviado BOOLEAN DEFAULT FALSE,
    enviado_em DATETIME NULL,
    device_info JSON NULL,
    ip_address VARCHAR(45) NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (motorista_id) REFERENCES motoristas(id) ON DELETE CASCADE,
    FOREIGN KEY (ordem_id) REFERENCES ordens_servico(id) ON DELETE SET NULL,
    INDEX idx_motorista_timestamp (motorista_id, timestamp DESC),
    INDEX idx_ordem (ordem_id),
    INDEX idx_batch (batch_id, enviado),
    INDEX idx_timestamp_envio (enviado, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. SESSOES (JWT revogação)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    motorista_id INT NULL,
    usuario_id INT NULL,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NULL,
    device_info JSON NULL,
    expires_at DATETIME NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (motorista_id) REFERENCES motoristas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_sessions_user (usuario_id, revoked, expires_at),
    INDEX idx_sessions_motorista (motorista_id, revoked, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices adicionais para sessions
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_revoked ON sessions(revoked);

-- ============================================
-- 8. AUDIT_LOG (logs de segurança)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tabela_nome VARCHAR(100) NOT NULL,
    registro_id INT NOT NULL,
    operacao ENUM('INSERT','UPDATE','DELETE','TRUNCATE','SELECT') NOT NULL,
    dados_antigos JSON NULL,
    dados_novos JSON NULL,
    usuario_id INT NULL,
    motorista_id INT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NULL,
    session_id CHAR(36) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tabela_registro (tabela_nome, registro_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_motorista (motorista_id),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. NOTIFICACOES_PUSH
-- ============================================
CREATE TABLE IF NOT EXISTS notificacoes_push (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    motorista_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    corpo TEXT NOT NULL,
    tipo ENUM('NOVA_ORDEM','ORDEM_CANCELADA','ALERTA_GPS','LEMBRETE') DEFAULT 'NOVA_ORDEM',
    prioridade ENUM('BAIXA','NORMAL','ALTA') DEFAULT 'NORMAL',
    dados_extras JSON NULL,
    lida BOOLEAN DEFAULT FALSE,
    lida_em DATETIME NULL,
    enviada_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivered BOOLEAN DEFAULT FALSE,
    delivered_em DATETIME NULL,
    FOREIGN KEY (motorista_id) REFERENCES motoristas(id) ON DELETE CASCADE,
    INDEX idx_motorista_lida (motorista_id, lida, enviada_em DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. HISTORICO_LIMPEZA
-- ============================================
CREATE TABLE IF NOT EXISTS historico_limpeza (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ocorrencia_id INT NULL,
    removido_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    caminho_imagem_removida VARCHAR(255),
    FOREIGN KEY (ocorrencia_id) REFERENCES ocorrencias(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. VIEW — v_motoristas_public
-- ============================================
CREATE OR REPLACE VIEW v_motoristas_public AS
SELECT
    m.id,
    m.disponibilidade,
    m.avaliacao_media,
    m.total_entregas,
    CONCAT('****-', RIGHT(m.placa_caminhao, 4)) as placa_mascarada,
    u.nome as motorista_nome
FROM motoristas m
JOIN usuarios u ON u.id = m.usuario_id
WHERE u.ativo = TRUE;

-- ============================================
-- FIM DO SCHEMA
-- ============================================
