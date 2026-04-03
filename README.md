# ZelaMapa

ZelaMapa é um sistema GovTech projetado para gerenciar e otimizar rotas e atendimentos. Possui um Dashboard para Gestores e um Aplicativo para os Motoristas.

## Tecnologias

- **Backend:** FastAPI, Python, SQLAlchemy.
- **Frontend:** React, TypeScript, Tailwind CSS, Vite.
- **Mapas/Rotas:** Leaflet / React-Leaflet.

## Estrutura do Projeto

- `/backend`: Contém a API FastAPI para gerenciamento de ocorrências, rotas, usuários e outras regras de negócios.
- `/frontend`: Aplicação Web desenvolvida em React para os usuários (Dashboard e visualização do mapa para gestores/motoristas).
- `/database`: Scripts e modelos para o banco de dados.
- `/.agent` / `/referencia`: Arquivos de documentação, regras de agente e design base do sistema.

## Scripts de Execução Local

**Backend:**
\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
\`\`\`

**Frontend:**
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## Funcionalidades Principais

- Gestão de Ocorrências e Relatórios
- Dashboard iterativo para Gestores (GovTech)
- Rastreamento / Mapas interativos utilizando Leaflet
- Controle de acesso baseado em Cargo (Gestor vs. Motorista)
