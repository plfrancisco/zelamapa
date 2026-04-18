CREATE DATABASE IF NOT EXISTS zelamapa;
USE zelamapa;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    papel ENUM('ADMIN', 'MOTORISTA', 'CADASTRADOR') NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tipos_ocorrencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    icone VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS ocorrencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    tipo_id INT,
    cpf VARCHAR(14),
    telefone VARCHAR(15),
    cep VARCHAR(9),
    endereco VARCHAR(255),
    numero VARCHAR(20),
    bairro VARCHAR(100),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    descricao TEXT,
    imagem_path VARCHAR(255),
    status ENUM('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO') DEFAULT 'PENDENTE',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (tipo_id) REFERENCES tipos_ocorrencia(id)
);

CREATE TABLE IF NOT EXISTS ordens_servico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ocorrencia_id INT,
    motorista_id INT,
    status ENUM('ABERTA', 'EM_ROTA', 'CONCLUIDA') DEFAULT 'ABERTA',
    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finalizada_em TIMESTAMP NULL,
    FOREIGN KEY (ocorrencia_id) REFERENCES ocorrencias(id),
    FOREIGN KEY (motorista_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS historico_limpeza (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ocorrencia_id INT,
    removido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    caminho_imagem_removida VARCHAR(255),
    FOREIGN KEY (ocorrencia_id) REFERENCES ocorrencias(id)
);

-- ============================================
-- 7. MOTORISTAS (dados específicos)
-- ============================================
CREATE TABLE IF NOT EXISTS motoristas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNIQUE NOT NULL,
    cnh VARCHAR(255) NULL,
    cnh_validade DATE NULL,
    cnh_categoria ENUM('A','B','C','D','E','AB','AC','AD','AE') DEFAULT 'B',
    placa_caminhao VARCHAR(255) NULL,
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
-- 8. LOCALIZACOES (rastreamento GPS)
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
    INDEX idx_batch (batch_id, enviado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. SESSOES (JWT revogação)
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
    INDEX idx_sessions_motorista (motorista_id, revoked, expires_at),
    INDEX idx_sessions_token_hash (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. AUDIT_LOG (logs de segurança)
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
-- 11. NOTIFICACOES_PUSH
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
-- 12. VIEW para motorista (dados públicos sem PII)
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
