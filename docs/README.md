# ZelaMapa (v4.0 Elite)

ZelaMapa é um sistema GovTech de alta performance projetado para gerenciar e otimizar rotas de coleta e atendimentos urbanos. O sistema oferece governança nominal, BI em tempo real e uma interface estética de nível elite.

## 🚀 Tecnologias

- **Backend:** FastAPI (Python 3.11+), SQLAlchemy, MySQL/SQLite, WebSockets.
- **Frontend:** React + Vite, TypeScript, Tailwind CSS, Lucide React.
- **Mapas/Rotas:** Leaflet / React-Leaflet com integração de geolocalização.

## 📂 Estrutura do Projeto

- `/api`: Núcleo do Backend FastAPI (v1).
- `/frontend`: Aplicação Web React (Dashboard e App do Motorista).
- `/scripts`: Utilitários para seed de dados, criação de admin e automação.
- `/infra`: Arquivos de configuração Docker, Render e Vercel.
- `/docs`: Documentação detalhada, diário de bordo e relatórios.

## 🛠️ Instalação e Execução

Para iniciar o projeto completo (Backend + Frontend) em ambiente local, utilize o script na raiz:

\`\`\`bash
./iniciar_projeto.sh
\`\`\`

### Configuração Manual

**Backend:**
\`\`\`bash
cd api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
\`\`\`

**Frontend:**
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## 📊 Dados Mockados e Credenciais

O projeto já vem preparado com scripts de seed para demonstração imediata.

**Para popular o banco:**
\`\`\`bash
python scripts/seed_massivo.py
\`\`\`

**Credenciais Padrão:**
- **Admin:** `admin` / Senha: `admin`
- **Motorista:** `motorista` / Senha: `123` (Adicionais: `motorista2` a `motorista10`)

## ✨ Funcionalidades

- **Dashboard BI:** Filtros inteligentes, Scorecard e monitoramento de tempo online.
- **App do Motorista:** Gestão de ordens de serviço, mapas em tempo real e rotas.
- **Governança:** Log de auditoria nominal (`audit_logs`) e monitoramento via WebSockets.
- **Geofencing:** (Em desenvolvimento) Alertas de desvio de rota.
