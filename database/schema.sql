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
