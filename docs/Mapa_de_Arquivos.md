# 🗺️ Mapa de Arquivos: ZelaMapa (Arquitetura Profissional)
> **Versão:** 4.0 (Senior Rebuild)
> **Padrão:** Clean Architecture (Backend) + Feature-Sliced Design (Frontend)

## 📂 Estrutura do Projeto

### ⚙️ Backend (FastAPI + SQLAlchemy ORM)
A lógica está separada em camadas para facilitar testes e manutenção.
- `backend/app/main.py`: Ponto de entrada (minimalista).
- `backend/app/api/`: Camada de entrega (HTTP).
  - `v1/api.py`: Roteador mestre da versão 1.
  - `deps.py`: Dependências injetáveis (Auth, DB Session).
- `backend/app/services/`: Camada de aplicação (Lógica de negócio e CRUD).
- `backend/app/models/`: Camada de domínio (Entidades SQLAlchemy).
- `backend/app/schemas/`: Camada de transferência (Pydantic models).
- `backend/app/db/`: Configuração de infraestrutura (Engine, Session).
- `backend/app/core/`: Configurações globais e segurança.

### 🌐 Frontend (React + TypeScript + Vite)
Organizado por domínios e responsabilidades.
- `frontend/src/api/`: Comunicação externa e serviços legados.
- `frontend/src/features/`: Módulos de negócio isolados (auth, driver, manager).
- `frontend/src/pages/`: Composição de telas (Antigo views).
- `frontend/src/components/ui/`: Biblioteca de componentes base.
- `frontend/src/stores/`: Estado global (Zustand).

## 🎯 Dicionário de Símbolos Principais

| Símbolo | Localização | Papel |
| :--- | :--- | :--- |
| `get_db` | `app/db/session.py` | Fornece sessão do banco para as rotas. |
| `get_current_user` | `app/api/deps.py` | Protege rotas exigindo JWT válido. |
| `Usuario` | `app/models/usuario.py` | Modelo de dados do usuário. |
| `apiClient` | `src/api/client.ts` | Cliente Axios centralizado com interceptors. |

## 🚀 Fluxo de Desenvolvimento
1. Defina o **Model** (SQLAlchemy).
2. Defina o **Schema** (Pydantic).
3. Implemente a lógica no **Service**.
4. Exponha o endpoint na **API (v1)**.
5. Consuma no **Frontend** via `api/client.ts`.

---
[[ZelaMapa_Master]] | [[00_SISTEMA_IA]]
