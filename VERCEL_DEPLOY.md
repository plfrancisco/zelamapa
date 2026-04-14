# Deploy no Vercel - ZelaMapa

Este projeto usa **Serviços Experimentais do Vercel** para rodar frontend (Vite) e backend (FastAPI) no mesmo projeto.

## Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. CLI do Vercel instalado (`npm i -g vercel`)
3. Banco de dados configurado (MySQL recomendado para produção)

## Configuração do Ambiente

### 1. Banco de Dados (Recomendado: MySQL)

No Vercel, configure as seguintes environment variables:

```
DB_HOST=<your-db-host>
DB_PORT=3306
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
DB_NAME=zelamapa
```

Para MySQL local, o sistema cai para SQLite automaticamente.

### 2. Upload de Arquivos

O backend salva imagens na pasta `backend/uploads`. No Vercel, arquivos são efêmeros
(/tmp). Recomendado usar S3, Cloudinary ou similar para persistência de uploads.

## Passos de Deploy

```bash
# 1. Login no Vercel
vercel login

# 2. Deploy do projeto (interativo)
vercel --prod

# OU: configure via dashboard importando o repositório Git
```

## Estrutura do Projeto no Vercel

```
projeto/
├── frontend/           # Serviço Frontend (Vite)
│   └── dist/           # Build estático
├── backend/            # Serviço Backend (FastAPI)
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   └── routers/
│   └── uploads/        # Arquivos estáticos
└── vercel.json         # Config dos serviços experimentais
```

## Endpoints

- **Frontend**: `/` → app Vite
- **Backend API**: `/_/backend/api/...`
  - `/_/backend/api/ocorrencias/` - CRUD de ocorrências
  - `/_/backend/api/limpeza/` - endpoints internos
  - `/_/backend/` - health check

## Desenvolvimento Local

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Observações

- O Vercel com experimental services limita o tempo de execução dos backends (~60s cold start)
- Ideal para apps com baixo volume de requests
- Para produção pesada, considere separar backend no Render/Railway
