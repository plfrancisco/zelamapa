# 📍 ZelaMapa (v4.0 Elite)

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-00000f?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

**ZelaMapa** é uma solução **GovTech** de ponta desenvolvida para otimizar o zeladoria urbana e a gestão de serviços municipais. Combinando monitoramento em tempo real, inteligência de dados e uma interface intuitiva, o sistema conecta cidadãos, gestores e equipes operacionais para transformar a manutenção das cidades.

---

## 🏗️ Arquitetura do Sistema

O projeto segue uma arquitetura moderna e escalável:

- **Core API:** Engine de alta performance construída com FastAPI, utilizando padrão de repositório e injeção de dependência.
- **Frontend Dashboard:** Aplicação administrativa em React com arquitetura baseada em componentes e gerenciamento de estado global.
- **Driver App:** Interface mobile-first otimizada para operação em campo com mapas interativos e geolocalização persistente.
- **Real-time Engine:** Integração via WebSockets para rastreamento de frotas e notificações instantâneas.

---

## 🗄️ Estrutura do Banco de Dados

Nossa modelagem de dados foi projetada para garantir integridade, rastreabilidade (logs de auditoria) e performance analítica.

### Diagrama de Relacionamentos (ER)

```mermaid
erDiagram
    USUARIOS ||--o| MOTORISTAS : "1:1"
    USUARIOS ||--o{ OCORRENCIAS : "reporta"
    USUARIOS ||--o{ ORDENS_SERVICO : "executa (motorista)"
    TIPOS_OCORRENCIA ||--o{ OCORRENCIAS : "classifica"
    OCORRENCIAS ||--o| ORDENS_SERVICO : "gera"
    USUARIOS ||--o{ AUDIT_LOGS : "registra ação"

    USUARIOS {
        int id PK
        uuid uuid
        string nome
        string email
        enum papel "ADMIN, MOTORISTA, CADASTRADOR"
        datetime created_at
    }

    MOTORISTAS {
        int id PK
        int usuario_id FK
        string cnh
        string placa_caminhao
        enum disponibilidade "DISPONIVEL, EM_ROTA, OFFLINE"
    }

    OCORRENCIAS {
        int id PK
        int tipo_id FK
        decimal latitude
        decimal longitude
        enum status "PENDENTE, EM_ANDAMENTO, CONCLUIDO"
        text descricao
    }

    ORDENS_SERVICO {
        int id PK
        int ocorrencia_id FK
        int motorista_id FK
        enum status "ABERTA, EM_ROTA, CONCLUIDA"
        decimal distancia_km
        decimal valor_total_os
    }
```

### Principais Entidades
- **Usuários:** Gestão de acesso (RBAC) com níveis de permissão distintos.
- **Ocorrências:** Registro georreferenciado de demandas urbanas (Entulho, Poda, Lixo, etc).
- **Ordens de Serviço:** Controle operacional de execução com snapshot de custos e distância.
- **Motoristas:** Extensão do usuário com dados técnicos de frotas e CNH.
- **Auditoria:** Registro nominal de cada alteração sensível no sistema (v4.0).

---

## 🛠️ Stack Tecnológica

### Backend
- **Framework:** FastAPI
- **ORM:** SQLAlchemy
- **Database:** MySQL 8.0 / SQLite (Dev)
- **Segurança:** OAuth2 + JWT (Bcrypt para hashing)
- **Real-time:** WebSockets (FastAPI WebSocket)

### Frontend
- **Framework:** React 18 + Vite
- **Linguagem:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **Maps:** Leaflet & OpenStreetMap
- **Icons:** Lucide React

---

## 🚦 Início Rápido

Para rodar o ambiente completo em segundos:

```bash
# Executa o script de inicialização inteligente
./iniciar_projeto.sh
```

### Popular Dados de Demonstração
Para visualizar o dashboard com métricas reais, execute o seed massivo:
```bash
python scripts/seed_massivo.py
```

### 🔐 Credenciais de Apresentação
- **Administrador:** Login: `admin` | Senha: `admin`
- **Motorista:** Login: `motorista` | Senha: `123`

---

## 📐 Organização de Pastas
```bash
.
├── api/             # Backend FastAPI Core
├── scripts/         # Scripts de Automação e Seed
├── infra/           # Docker, Render e Vercel Configs
└── src/             # Código Fonte Frontend React
```

---

<div align="center">
  <sub>Desenvolvido para o Projeto Integrador - ZelaMapa 2026</sub>
</div>
