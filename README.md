# 📍 ZelaMapa

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-00000f?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

**ZelaMapa** é uma solução **GovTech** de ponta desenvolvida para otimizar o zeladoria urbana e a gestão de serviços municipais. Combinando monitoramento em tempo real, inteligência de dados e uma interface intuitiva, o sistema conecta cidadãos, gestores e equipes operacionais para transformar a manutenção das cidades.

---

## 🏗️ Arquitetura do Sistema

O projeto utiliza uma estrutura modular e organizada, separando claramente as responsabilidades:

- **Backend (Python/FastAPI):** Localizado na pasta `/backend`, contém a API Core, a engine de WebSockets, modelos de dados, e a infraestrutura de banco de dados via Docker.
- **Frontend (React/Vite):** Localizado na pasta `/frontend`, contém o dashboard administrativo e a interface mobile-first do motorista, utilizando TypeScript e Tailwind CSS.

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

---

## 🛠️ Stack Tecnológica

### Backend
- **Framework:** FastAPI
- **ORM:** SQLAlchemy
- **Database:** MySQL 8.0 (Containerizado)
- **Real-time:** Socket.io (ASGI)

### Frontend
- **Framework:** React 19 + Vite
- **Linguagem:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **Maps:** Leaflet & OpenStreetMap
- **State:** Zustand

---

## 🚦 Início Rápido

Para rodar o ambiente completo (API + Frontend + DB):

```bash
# Permissão de execução (se necessário)
chmod +x iniciar_projeto.sh

# Inicia tudo simultaneamente
./iniciar_projeto.sh
```

### Comandos do Script Mestre
- `./iniciar_projeto.sh` : Inicia todos os serviços.
- `./iniciar_projeto.sh --stop` : Para todos os serviços e limpa portas.
- `./iniciar_projeto.sh --restart` : Reinicia o ambiente completo.

### 🔐 Credenciais de Apresentação
- **Administrador:** Login: `admin` | Senha: `admin`
- **Motorista:** Login: `motorista` | Senha: `123`

---

## 📐 Organização de Pastas

```bash
.
├── backend/            # Camada de Servidor (FastAPI)
│   ├── api/            # Rotas e Endpoints (v1)
│   ├── core/           # Configurações globais e segurança
│   ├── db/             # Sessão do banco e classes base
│   ├── infra/          # Docker (MySQL) e Schema SQL
│   ├── models/         # Definição de tabelas (SQLAlchemy)
│   ├── schemas/        # Pydantic (Validação e Serialização)
│   ├── scripts/        # Automação, Seed Massivo e Simuladores
│   ├── services/       # Regras de negócio e lógica complexa
│   ├── main.py         # Ponto de entrada da API
│   └── websocket.py    # Engine de Real-time (Socket.io)
├── frontend/           # Camada de Interface (React/Vite)
│   ├── src/            # Código fonte TypeScript
│   │   ├── components/ # UI e Componentes de negócio
│   │   ├── services/   # Integração API/WS
│   │   └── stores/     # Estado Global (Zustand)
│   ├── public/         # Ativos estáticos
│   ├── package.json    # Manifest de dependências
│   └── vite.config.ts  # Configuração do Build
└── iniciar_projeto.sh  # Script mestre de orquestração
```

---

<div align="center">
  <sub>Desenvolvido para o Projeto Integrador - ZelaMapa 2026</sub>
</div>
