# ZelaMapa - Sistema GovTech de Limpeza Urbana e Geoprocessamento

O **ZelaMapa** é uma plataforma focada na gestão e controle operacional da coleta de resíduos e limpeza urbana. Ele atende ao município de *Pompéia-SP* através de rotas geo referenciadas. 

O sistema conta com dois perfis:
- **Gerente**: Um dashboard gerencial completo para monitoramento, mapas de calor, e acompanhamento em "bird's eye view".
- **Motorista**: Um aplicativo visual mobile-first embarcado no navegador que auxilia caminhões de lixo/recolhimento e traça pontos. 

## Tecnologias

- **Frontend**: React 18, Vite, Tailwind CSS v4, TypeScript, React Router.
- **Backend / API**: FastAPI, Python.
- **Banco de Dados**: MySQL Server.
- **Mapas**: Leaflet / React-Leaflet (OpenStreetMap geo mapping).

## Instruções de Instalação Local

### 1. Banco de Dados (MySQL)
Configure um banco de dados local com o arquivo `.env` da seção backend e o schema de tabelas providenciado.

### 2. Rodar o Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Rodar o Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Acesse o sistema em `http://localhost:5173`. Todos os logins podem ser testados com os IDs `gerente` ou `motorista` e a senha `adm`.
