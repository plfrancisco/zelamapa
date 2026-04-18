# 🗄️ Banco de Dados — Plano Robusto e Seguro

## 🎯 Objetivo
Modelo seguro, escalável e auditável para app motorista com **postgreSQL + camadas de segurança**.

---

## 🔐 Skills de Segurança Recomendadas

### **Core (obrigatórias)**
1. **`password-hash`** — bcrypt/argon2 para senhas
2. **`pg-crypto`** — criptografia de dados sensíveis no banco
3. **`audit-log`** — log automático de mudanças críticas
4. **`row-level-security`** — RLS PostgreSQL (isolamento por motorista_id)
5. **`rate-limiter-redis`** — limite de requisições por IP/user

### **Complementares**
6. **`pii-encryption`** — criptografia de CPF/CNH/placa
7. **`db-migration-safe`** — migrações com rollback automático
8. **`connection-pool`** — gerenciamento seguro de conexões
9. **`sql-injection-protection`** — validação de queries parametrizadas
10. **`backup-encrypted`** — backups criptografados

---

## 📊 Modelo Relacional (PostgreSQL)

### **Tabelas Principais**

```sql
-- 1. USUARIOS (base)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL, -- argon2id
    tipo ENUM('MOTORISTA', 'GESTOR', 'ADMIN') DEFAULT 'MOTORISTA',
    ativo BOOLEAN DEFAULT TRUE,
    email_verificado BOOLEAN DEFAULT FALSE,
    ultimo_login TIMESTAMP,
    tentativas_login INT DEFAULT 0,
    bloqueado_ate TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_ativo ON usuarios(ativo);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo);

-- Row Level Security (RLS)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_usuarios_read ON usuarios
    FOR SELECT USING (
        auth.uid() = id OR
        EXISTS (SELECT 1 FROM motoristas WHERE usuario_id = auth.uid())
    );
```

---

```sql
-- 2. MOTORISTAS (dados específicos)
CREATE TABLE motoristas (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    cnh VARCHAR(20) UNIQUE, -- criptografado
    cnh_validade DATE NOT NULL,
    cnh_categoria CHAR(2) CHECK (cnh_categoria IN ('A','B','C','D','E','AB','AC','AD','AE')),
    placa_caminhao VARCHAR(8) NOT NULL, -- criptografado
    modelo_caminhao VARCHAR(100),
    disponibilidade ENUM('DISPONIVEL','EM_ROTA','OFFLINE','EM_PAUSA') DEFAULT 'OFFLINE',
    ultima_posicao_id INT NULL,
    total_entregas INT DEFAULT 0,
    avaliacao_media DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_motoristas_usuario ON motoristas(usuario_id);
CREATE INDEX idx_motoristas_disponibilidade ON motoristas(disponibilidade);
CREATE INDEX idx_motoristas_ultima_posicao ON motoristas(ultima_posicao_id);

-- RLS: Motorista só vê próprio registro
ALTER TABLE motoristas ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_motoristas_self ON motoristas
    FOR ALL USING (auth.uid() = usuario_id);
```

---

```sql
-- 3. ORDENS_SERVICO (fluxo completo)
CREATE TABLE ordens_servico (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    numero_os VARCHAR(50) UNIQUE NOT NULL,
    cliente_id INT NOT NULL,
    motorista_id INT NULL, -- atribuído ao aceitar
    status ENUM('ABERTA','ACEITA','EM_ROTA','CONCLUIDA','RECUSADA','CANCELADA') DEFAULT 'ABERTA',
    prioridade ENUM('BAIXA','MEDIA','ALTA','URGENTE') DEFAULT 'MEDIA',

    -- Dados da coleta
    origem_logradouro TEXT NOT NULL,
    origem_numero VARCHAR(20),
    origem_complemento TEXT,
    origem_bairro VARCHAR(100),
    origem_cidade VARCHAR(100) NOT NULL,
    origem_estado CHAR(2) NOT NULL,
    origem_cep VARCHAR(8) NOT NULL,
    origem_lat DECIMAL(10,8) NOT NULL,
    origem_lng DECIMAL(11,8) NOT NULL,

    -- Dados da entrega
    destino_logradouro TEXT NOT NULL,
    destino_numero VARCHAR(20),
    destino_complemento TEXT,
    destino_bairro VARCHAR(100),
    destino_cidade VARCHAR(100) NOT NULL,
    destino_estado CHAR(2) NOT NULL,
    destino_cep VARCHAR(8) NOT NULL,
    destino_lat DECIMAL(10,8) NOT NULL,
    destino_lng DECIMAL(11,8) NOT NULL,

    -- Cronograma
    data_inicio DATETIME NOT NULL,
    data_fim_previsto DATETIME NOT NULL,
    data_inicio_efetivo DATETIME NULL,
    data_conclusao DATETIME NULL,

    -- Decisões
    motivo_recusa TEXT NULL,
    observacoes TEXT NULL,
    feedback_nota INT NULL CHECK (feedback_nota BETWEEN 1 AND 5),
    feedback_comentario TEXT NULL,

    -- Métricas
    distancia_km DECIMAL(8,2) NULL,
    tempo_estimado_min INT NULL,
    tempo_real_min INT NULL,

    -- Auditoria
    versao INT DEFAULT 1,
    created_by INT NOT NULL,
    updated_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL, -- soft delete

    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (motorista_id) REFERENCES motoristas(id),
    FOREIGN KEY (created_by) REFERENCES usuarios(id),
    FOREIGN KEY (updated_by) REFERENCES usuarios(id)
);

-- Índices para performance
CREATE INDEX idx_ordens_status ON ordens_servico(status);
CREATE INDEX idx_ordens_motorista ON ordens_servico(motorista_id);
CREATE INDEX idx_ordens_cliente ON ordens_servico(cliente_id);
CREATE INDEX idx_ordens_data_inicio ON ordens_servico(data_inicio);
CREATE INDEX idx_ordens_prioridade ON ordens_servico(prioridade);
CREATE INDEX idx_ordens_deleted_at ON ordens_servico(deleted_at) WHERE deleted_at IS NULL;

-- GIN index para full-text search (endereços)
CREATE INDEX idx_ordens_enderecos_gin ON ordens_servico
    USING GIN (to_tsvector('portuguese',
        coalesce(origem_logradouro,'') || ' ' ||
        coalesce(origem_bairro,'') || ' ' ||
        coalesce(destino_logradouro,'') || ' ' ||
        coalesce(destino_bairro,'')
    ));

-- RLS: Motorista só vê próprias ordens
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_ordens_self ON ordens_servico
    FOR ALL USING (
        motorista_id = auth.uid() OR
        EXISTS (SELECT 1 FROM motoristas WHERE usuario_id = auth.uid() AND id = ordens_servico.motorista_id)
    );
```

---

```sql
-- 4. LOCALIZACOES (rastreamento GPS)
CREATE TABLE localizacoes (
    id BIGSERIAL PRIMARY KEY,
    motorista_id INT NOT NULL,
    ordem_id INT NULL, -- ordem associada (se estiver em rota)
    latitude DECIMAL(10,8) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude DECIMAL(11,8) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    velocidade DECIMAL(5,2) CHECK (velocidade >= 0), -- km/h
    heading DECIMAL(5,2) CHECK (heading BETWEEN 0 AND 360), -- direção graus
    precisao_meters DECIMAL(5,2), -- accuracy GPS
    altitude DECIMAL(8,2) NULL,
    bateria_restante INT CHECK (bateria_restante BETWEEN 0 AND 100),
    modulo_tipo ENUM('APP','GPS_EXTERNO','TELEMETRIA') DEFAULT 'APP',

    -- Controle de batch
    batch_id UUID DEFAULT gen_random_uuid(),
    enviado BOOLEAN DEFAULT FALSE,
    enviado_em TIMESTAMP NULL,

    -- Metadata
    device_info JSONB NULL, -- {model, os, app_version}
    ip_address INET NULL,

    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (motorista_id) REFERENCES motoristas(id) ON DELETE CASCADE,
    FOREIGN KEY (ordem_id) REFERENCES ordens_servico(id) ON DELETE SET NULL
);

-- Índices compostos para queries eficientes
CREATE INDEX idx_localizacoes_motorista_timestamp ON localizacoes(motorista_id, timestamp DESC);
CREATE INDEX idx_localizacoes_ordem ON localizacoes(ordem_id) WHERE ordem_id IS NOT NULL;
CREATE INDEX idx_localizacoes_batch ON localizacoes(batch_id) WHERE enviado = FALSE;
CREATE INDEX idx_localizacoes_geo ON localizacoes USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);

-- Particionamento por mês (opcional para volume alto)
-- CREATE TABLE localizacoes_2026_04 PARTITION OF localizacoes
--     FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

-- RLS: Isolamento absoluto por motorista
ALTER TABLE localizacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_localizacoes_self ON localizacoes
    FOR ALL USING (motorista_id = auth.motorista_id());
```

---

```sql
-- 5. SESSÕES (JWT revogação)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    motorista_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL, -- sha256 do JWT
    refresh_token_hash VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT NULL,
    device_info JSONB NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (motorista_id) REFERENCES motoristas(id) ON DELETE CASCADE,
    UNIQUE(motorista_id, token_hash)
);

CREATE INDEX idx_sessions_motorista ON sessions(motorista_id, revoked, expires_at);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash) WHERE revoked = FALSE;
```

---

```sql
-- 6. AUDIT_LOG (tabela universal de auditoria)
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    tabela_nome VARCHAR(100) NOT NULL,
    registro_id INT NOT NULL,
    operacao ENUM('INSERT','UPDATE','DELETE','TRUNCATE','SELECT') NOT NULL,
    dados_antigos JSONB NULL,
    dados_novos JSONB NULL,
    usuario_id INT NULL, -- quem fez (se autenticado)
    motorista_id INT NULL, -- qual motorista foi afetado
    ip_address INET NOT NULL,
    user_agent TEXT NULL,
    session_id UUID NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_tabela_registro ON audit_log(tabela_nome, registro_id);
CREATE INDEX idx_audit_usuario ON audit_log(usuario_id);
CREATE INDEX idx_audit_motorista ON audit_log(motorista_id);
CREATE INDEX idx_audit_created_at ON audit_log(created_at DESC);

-- Trigger function para log automático
CREATE OR REPLACE FUNCTION log_audit() RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id INT;
    v_motorista_id INT;
BEGIN
    -- Extrair usuario_id do contexto JWT (via auth.uid())
    v_usuario_id := auth.uid();
    v_motorista_id := (
        SELECT id FROM motoristas WHERE usuario_id = v_usuario_id LIMIT 1
    );

    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log (
            tabela_nome, registro_id, operacao,
            dados_antigos, usuario_id, motorista_id,
            ip_address, user_agent, session_id
        ) VALUES (
            TG_TABLE_NAME, OLD.id, 'DELETE',
            to_jsonb(OLD), v_usuario_id, v_motorista_id,
            current_setting('request.ip', true)::INET,
            current_setting('request.user_agent', true),
            current_setting('request.session_id', true)::UUID
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_log (
            tabela_nome, registro_id, operacao,
            dados_antigos, dados_novos, usuario_id, motorista_id,
            ip_address, user_agent, session_id
        ) VALUES (
            TG_TABLE_NAME, NEW.id, 'UPDATE',
            to_jsonb(OLD), to_jsonb(NEW),
            v_usuario_id, v_motorista_id,
            current_setting('request.ip', true)::INET,
            current_setting('request.user_agent', true),
            current_setting('request.session_id', true)::UUID
        );
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_log (
            tabela_nome, registro_id, operacao,
            dados_novos, usuario_id, motorista_id,
            ip_address, user_agent, session_id
        ) VALUES (
            TG_TABLE_NAME, NEW.id, 'INSERT',
            to_jsonb(NEW), v_usuario_id, v_motorista_id,
            current_setting('request.ip', true)::INET,
            current_setting('request.user_agent', true),
            current_setting('request.session_id', true)::UUID
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar triggers nas tabelas críticas
CREATE TRIGGER trg_audit_ordens
    AFTER INSERT OR UPDATE OR DELETE ON ordens_servico
    FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER trg_audit_motoristas
    AFTER INSERT OR UPDATE OR DELETE ON motoristas
    FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER trg_audit_sessions
    AFTER INSERT OR UPDATE OR DELETE ON sessions
    FOR EACH ROW EXECUTE FUNCTION log_audit();
```

---

```sql
-- 7. NOTIFICACOES_PUSH (histórico)
CREATE TABLE notificacoes_push (
    id BIGSERIAL PRIMARY KEY,
    motorista_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    corpo TEXT NOT NULL,
    tipo ENUM('NOVA_ORDEM','ORDEM_CANCELADA','ALERTA_GPS','LEMBRETE') DEFAULT 'NOVA_ORDEM',
    prioridade ENUM('BAIXA','NORMAL','ALTA') DEFAULT 'NORMAL',
    dados_extras JSONB NULL, -- {ordem_id, action}
    lida BOOLEAN DEFAULT FALSE,
    lida_em TIMESTAMP NULL,
    enviada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered BOOLEAN DEFAULT FALSE,
    delivered_em TIMESTAMP NULL,

    FOREIGN KEY (motorista_id) REFERENCES motoristas(id) ON DELETE CASCADE
);

CREATE INDEX idx_notificacoes_motorista ON notificacoes_push(motorista_id, lida, enviada_em DESC);
```

---

```sql
-- 8. CLIENTES (referência)
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(18) UNIQUE NOT NULL, -- criptografado
   Contato_nome VARCHAR(150),
    contato_telefone VARCHAR(20), -- criptografado
    contato_email VARCHAR(255),
    endereco_logradouro TEXT,
    endereco_numero VARCHAR(20),
    endereco_bairro VARCHAR(100),
    endereco_cidade VARCHAR(100),
    endereco_estado CHAR(2),
    endereco_cep VARCHAR(8),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_clientes_cnpj ON clientes(cnpj);
CREATE INDEX idx_clientes_ativo ON clientes(ativo);
```

---

## 🔐 Segurança — Camadas

### **1. PostgreSQL Roles & Permissions**
```sql
-- Roles separadas
CREATE ROLE app_motorista NOLOGIN;
CREATE ROLE app_gestor NOLOGIN;
CREATE ROLE app_admin NOLOGIN;

-- Permissões granulares
GRANT SELECT ON motoristas TO app_motorista;
GRANT UPDATE (disponibilidade) ON motoristas TO app_motorista;
GRANT SELECT ON ordens_servico TO app_motorista WHERE status IN ('ABERTA','ACEITA','EM_ROTA');
GRANT UPDATE (status, motivo_recusa) ON ordens_servico TO app_motorista;

-- Revoke público
REVOKE ALL ON DATABASE zelamapa FROM PUBLIC;
```

---

### **2. PGP Encryption (pgcrypto)**
```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criptografar PII na tabela
ALTER TABLE motoristas
    ALTER COLUMN cnh SET DATA TYPE TEXT,
    ALTER COLUMN placa_caminhao SET DATA TYPE TEXT;

-- Função para criptografia
CREATE OR REPLACE FUNCTION encrypt_data(data TEXT, key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_encrypt(data, key);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para descriptografia (só backend tem key)
CREATE OR REPLACE FUNCTION decrypt_data(encrypted TEXT, key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted::bytea, key);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Views para acesso controlada
CREATE VIEW v_motoristas_public AS
SELECT
    id,
    disponibilidade,
    avaliacao_media,
    -- PII oculta
    '****' || right(placa_caminhao, 4) as placa_mascarada
FROM motoristas;
```

---

### **3. Connection Security**
```sql
-- Fail2ban integration (log failed logins)
CREATE TABLE login_attempts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    sucesso BOOLEAN NOT NULL,
    tentativa_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address, tentativa_em);
CREATE INDEX idx_login_attempts_email ON login_attempts(email, tentativa_em);

-- Cleanup automático (>30 dias)
CREATE OR REPLACE FUNCTION cleanup_old_attempts()
RETURNS void AS $$
BEGIN
    DELETE FROM login_attempts
    WHERE tentativa_em < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

CREATE EVENT TRIGGER cleanup_attempts
    ON sql_drop
    EXECUTE FUNCTION cleanup_old_attempts();
```

---

### **4. Validação de Dados (CHECK constraints)**
```sql
-- Validação robusta
ALTER TABLE ordens_servico
    ADD CONSTRAINT chk_datas_validas
        CHECK (data_fim_previsto > data_inicio),
    ADD CONSTRAINT chk_coordenadas_validas
        CHECK (
            origem_lat BETWEEN -90 AND 90 AND
            origem_lng BETWEEN -180 AND 180 AND
            destino_lat BETWEEN -90 AND 90 AND
            destino_lng BETWEEN -180 AND 180
        ),
    ADD CONSTRAINT chk_feedback_valido
        CHECK (
            (feedback_nota IS NULL AND feedback_comentario IS NULL) OR
            (feedback_nota IS NOT NULL AND feedback_nota BETWEEN 1 AND 5)
        );

ALTER TABLE localizacoes
    ADD CONSTRAINT chk_speed_plausable
        CHECK (velocidade <= 200), -- max 200 km/h caminhão
    ADD CONSTRAINT chk_precisao_minima
        CHECK (precisao_meters <= 100); -- GPS preciso
```

---

### **5. Row Level Security (RLS) Policies**
```sql
-- Policy: Motorista vê apenas próprios dados
CREATE POLICY motorista_own_data ON motoristas
    FOR ALL USING (usuario_id = auth.uid());

-- Policy: Motorista vê apenas ordens atribuídas
CREATE POLICY ordens_assigned ON ordens_servico
    FOR SELECT USING (motorista_id = auth.motorista_id());

-- Policy: Gestor vê todas ordens da sua região
CREATE POLICY gestor_view_all ON ordens_servico
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM gestores g
            WHERE g.usuario_id = auth.uid()
            AND g.regiao = ordens_servico.origem_estado
        )
    );

-- Desabilitar RLS para admin
ALTER TABLE ordens_servico FORCE ROW LEVEL SECURITY;
```

---

## 🗃️ Migrations & Versionamento

### **Estrutura de Migrations**
```bash
backend/
├── migrations/
│   ├── 001_initial_schema.sql          -- base
│   ├── 002_add_rls_policies.sql        -- RLS
│   ├── 003_add_audit_triggers.sql      -- auditoria
│   ├── 004_add_crypto_functions.sql    -- criptografia
│   ├── 005_add_indexes_performance.sql -- índices
│   └── 006_add_constraints_security.sql -- constraints
```

### **Rollback automático**
```sql
-- Cada migration terá对应的 rollback
-- Exemplo: 003_add_audit_triggers.sql
-- UP:
CREATE OR REPLACE FUNCTION log_audit() ...;
CREATE TRIGGER ...

-- DOWN:
DROP TRIGGER IF EXISTS trg_audit_ordens ON ordens_servico;
DROP FUNCTION IF EXISTS log_audit();
```

---

## 📈 Performance & Indexing

### **Índices Estratégicos**
```sql
-- Covering index para queries frequentes
CREATE INDEX idx_ordens_status_atribuido ON ordens_servico(status, motorista_id, data_inicio DESC)
    WHERE status IN ('ABERTA', 'ACEITA', 'EM_ROTA');

-- Partial index para ordens ativas
CREATE INDEX idx_ordens_ativas ON ordens_servico(motorista_id, status)
    WHERE status NOT IN ('CONCLUIDA', 'CANCELADA');

-- Composite para localizações recentes
CREATE INDEX idx_gps_recent ON localizacoes(motorista_id, timestamp DESC)
    WHERE timestamp > NOW() - INTERVAL '1 hour';
```

### **Vistas Materializadas (opcional)**
```sql
-- Cache de dashboard
CREATE MATERIALIZED VIEW mv_motorista_dashboard AS
SELECT
    m.id as motorista_id,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'EM_ROTA') as em_rota,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'ABERTA') as disponiveis,
    AVG(l.velocidade) as velocidade_media,
    MAX(l.timestamp) as ultima_transmissao
FROM motoristas m
LEFT JOIN ordens_servico o ON o.motorista_id = m.id
LEFT JOIN localizacoes l ON l.motorista_id = m.id
GROUP BY m.id;

-- Refresh a cada 5min
CREATE OR REPLACE FUNCTION refresh_dashboard()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_motorista_dashboard;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔄 Backup & Recovery

### **Strategy**
```
├── Full backup: diário (02:00) — criptografado
├── WAL archiving: contínuo
├── Point-in-time recovery: até 7 dias
└── Teste restore: semanal (automated)
```

```bash
# Exemplo pg_dump criptografado
pg_dump -U postgres zelamapa \
    | gpg --encrypt --recipient backup@zelamapa.com \
    | gzip > /backups/zelamapa_$(date +%Y%m%d).sql.gz.gpg
```

---

## 📊 Monitoring & Alerts

### **Queries importantes para monitorar**

```sql
-- 1. Sessões ativas
SELECT COUNT(*) FROM sessions WHERE revoked = FALSE AND expires_at > NOW();

-- 2. Tentativas de login falhadas (última hora)
SELECT email, COUNT(*) as tentativas
FROM login_attempts
WHERE sucesso = false AND tentativa_em > NOW() - INTERVAL '1 hour'
GROUP BY email HAVING COUNT(*) >= 5;

-- 3. Localizações atrasadas (>5min)
SELECT m.id, m.placa_caminhao, MAX(l.timestamp) as ultima
FROM motoristas m
LEFT JOIN localizacoes l ON l.motorista_id = m.id
GROUP BY m.id, m.placa_caminhao
HAVING MAX(l.timestamp) < NOW() - INTERVAL '5 minutes';

-- 4. Ordem há muito tempo EM_ROTA
SELECT id, numero_os, data_inicio_efetivo
FROM ordens_servico
WHERE status = 'EM_ROTA'
    AND data_inicio_efetivo < NOW() - INTERVAL '4 hours';
```

---

## 📋 Checklist de Segurança

**Nível 1 — Básico:**
- [ ] Senhas argon2id (custo >= 12)
- [ ] JWT com refresh token rotation
- [ ] HTTPS enforcement (Strict-Transport-Security)
- [ ] CORS configurado só para frontend origin
- [ ] Rate limiting: 5 tentativas login/min por IP
- [ ] SQL queries sempre parametrizadas (sem concatenação)

**Nível 2 — Intermediário:**
- [ ] RLS ativo em todas tabelas sensíveis
- [ ] Audit log registra mudanças críticas
- [ ] PII criptografado (cnh, placa, cnpj)
- [ ] Sessions table com revogação JWT
- [ ] Backup diário criptografado
- [ ] Validação entrada: Zod/Pydantic

**Nível 3 — Avançado:**
- [ ] Database encryption at-rest (TDE)
- [ ] Network isolation (VPC, security groups)
- [ ] WAF rules para API
- [ ] Anomaly detection (queries suspeitas)
- [ ] Pentest anual
- [ ] GDPR/ LGPD compliance (direito ao esquecimento)

---

## 🛠️ Skills para Instalar

```bash
# Instalar via Kilo (ou manual)
kilo install auth-jwt
kilo install password-hash
kilo install pg-crypto
kilo install audit-log
kilo install row-level-security
kilo install rate-limiter-redis
kilo install pii-encryption
kilo install db-migration-safe
```

---

## 📁 Estrutura Backend DB

```
backend/
├── database/
│   ├── migrations/       -- Alembic/ Flyway
│   │   ├── versions/
│   │   └── env.py
│   ├── seeds/
│   │   ├── usuarios_seed.sql
│   │   ├── motoristas_seed.sql
│   │   └── ordens_seed.sql
│   └── functions/
│       ├── crypto_functions.sql
│       ├── audit_triggers.sql
│       └── rls_policies.sql
├── models/
│   ├── user.py           -- Pydantic
│   ├── motorista.py
│   ├── ordem.py
│   ├── localizacao.py
│   └── session.py
└── services/
    └── security_service.py -- crypto, audit helper
```

---

## ⚡ Comandos Úteis

```sql
-- Verificar usuários com senhas fracas
SELECT id, email FROM usuarios
WHERE senha_hash NOT LIKE '%argon2%';

-- Listar todas as RLS policies
SELECT * FROM pg_policies WHERE tablename IN ('ordens_servico','motoristas','localizacoes');

-- Verificar connections ativas
SELECT pid, usename, application_name, client_addr, state
FROM pg_stat_activity WHERE datname = 'zelamapa';

-- Forçar logout de um usuário (revogar sessions)
UPDATE sessions SET revoked = TRUE WHERE motorista_id = :driverId;
```

---

## 🚨 Auditoria — O que Loggar

**Tudo que altera estado:**
- Login/logout (success + failure)
- Mudança de status ordem (aceitar/recusar/concluir/cancelar)
- Atualização perfil motorista
- Criação/edição de cliente
- Envio de GPS (batch)
- Revogação de token
- Acesso a dados sensíveis (CNH, placa)

**Padrão de log:**
```json
{
  "timestamp": "2025-04-16T20:30:00Z",
  "event": "ordem.status_change",
  "usuario_id": 42,
  "motorista_id": 7,
  "ordem_id": 1234,
  "old_status": "ACEITA",
  "new_status": "EM_ROTA",
  "ip": "200.200.200.200",
  "user_agent": "ZelaMapaDriver/1.0"
}
```

---

## 📋 Migration Checklist

**Antes de subir para produção:**
- [ ] Todas senhas re-hashed (argon2id)
- [ ] RLS policies testadas
- [ ] Audit triggers instalados
- [ ] Backups automáticos configurados
- [ ] Connection pool otimizado (max_connections)
- [ ] Índices criados (analyze table)
- [ ] Fail2ban configurado para tentativas login
- [ ] SSL certificates atualizados
- [ ] Teste de restore executado (sucesso)
- [ ] Penetration test básico realizado

---

**Pronto para criar as migrations? Posso gerar os arquivos SQL completos.**
