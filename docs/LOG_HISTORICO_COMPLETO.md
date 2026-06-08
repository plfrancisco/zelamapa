# 📜 Histórico de Evolução Técnica: ZelaMapa (v1.0 - v4.0)
> Este documento consolida todos os logs de desenvolvimento, decisões de arquitetura e manutenções críticas realizadas no projeto ZelaMapa.

---

## 🏗️ Fase 1: Concepção e Planejamento (Semanas 01 - 10)
- **Definição de Escopo:** Sistema GovTech para zeladoria pública e otimização de coletas urbanas.
- **Modelagem:** Criação de diagramas de fluxo, MER (Modelo Entidade-Relacionamento) e prototipagem de telas no Figma.
- **Infra Inicial:** Configuração do repositório base e escolha do stack: FastAPI (Python) + React (TypeScript).

## 🚀 Fase 2: Implementação do Core e Mapas (Semanas 11 - 14)
- **Geolocalização:** Integração com Leaflet para visualização de pontos de coleta e OSRM para roteirização.
- **Real-time:** Implementação de WebSockets via Socket.io para rastreamento de caminhões em tempo real.
- **UX/UI:** Desenvolvimento da dashboard de gestão com foco em estética premium e dashboards interativos.

## 🛠️ Fase 3: Modernização e Estrutura Elite (Semanas 15 - 16)
- **Migração de Dados:** Transição completa do banco legado SQLite para **MySQL (Docker)** para suporte a alta concorrência.
- **Clean Architecture:** Reestruturação do backend em camadas (Controllers, Services, Models, Schemas).
- **Monorepo Profissional:** Organização cirúrgica de pastas: `api/`, `frontend/`, `infra/`, `scripts/`, `docs/`.
- **Automação:** Criação de scripts de inicialização única (`iniciar_projeto.sh`) e seeds automáticos.

## 💎 Fase 4: Manutenção Elite e Inteligência (Semana 17 - Atual)
- **Data: 04/05/2026 - 08/05/2026**
- **Segurança de Dados (04/05):**
    - Implementada estrutura de **senhas seguras** utilizando hashing com BCrypt (rounds=12).
    - Verificação de políticas de acesso e proteção contra armazenamento de credenciais em texto plano.
- **Correções Críticas (08/05):**
    - Estabilização da API: Resolvido erro de importação `Numeric` que impedia o boot do backend.
    - Conserto do Mapa: Restaurada a comunicação Frontend-Backend para renderização de pontos geográficos.
    - Estabilidade de Tema: Corrigido bug que resetava o Dark Mode ao navegar pelas configurações.
- **Novas Funcionalidades de Auditoria:**
    - **Snapshots de Preço:** O custo das ordens é congelado no ato da conclusão, garantindo integridade financeira histórica.
    - **Governança Dinâmica:** KPIs vinculadas diretamente ao banco de dados (Preço combustível, SLA).
    - **Central de Acessos:** Gestão completa de usuários (Admin/Motorista) com criação de contas e senhas na UI.
- **Testes de Estresse:**
    - Seed massivo: Geração de 10 motoristas operacionais e ~150 ocorrências distribuídas em 30 dias para validação de BI.
    - Monitoramento simulado: Ativação de sinais GPS simulados para toda a frota ativa.

---

## 📊 Status Atual do Ecossistema
- **Backend:** FastAPI operacional em porta 8000.
- **Frontend:** React + Vite operacional em porta 5173.
- **DB:** MySQL 8.0 rodando via Docker.
- **Monitoramento:** Feed ao vivo via WebSocket ativo.

## 🔜 Visão de Futuro
- Implementação de **Geofencing** para alertas de desvio de rota.
- Relatórios avançados em PDF com assinaturas digitais.
- Aplicativo nativo Mobile para motoristas com modo offline.

---
*Atualizado em: 08/05/2026*
