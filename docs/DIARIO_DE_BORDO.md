# 📔 Diário de Bordo - ZelaMapa (PI-II)
> Estrutura oficial de acompanhamento do Projeto Integrador.

| Semana | Data inicial | Data final | Atividades planejadas | Atividades realizadas | Responsáveis | Dificuldades | Soluções / Decisões tomadas | Resultados obtidos | Próximos passos | Evidências |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **15** | 20/04 | 26/04 | Reunião de alinhamento para definição das prioridades da semana. | Estabilização do ambiente de desenvolvimento e início da migração para MySQL. | Pedro | Complexidade na transição de dados do SQLite para MySQL. | Decisão de utilizar Docker para padronizar o ambiente de banco de dados. | Ambiente de dev preparado para a nova infraestrutura. | Migração completa das tabelas. | Log de Fatos v3.0. |
| **16** | 27/04 | 03/05 | Início da migração MySQL e limpeza de legados SQLite. | Estrutura Docker configurada, tabelas MySQL criadas e scripts de migração inicial rodando. | Pedro | Divergência de schemas entre instâncias locais. | Unificação do schema em `database/schema.sql` e automação via Docker. | Ambiente preparado para produção local. | Início da Service Layer. | Commits de infra. |
| **17** | 04/05 | 10/05 | Estabilização, Auditoria Nominal, Jornada Mensal e Refinamento de BI. | Limpeza operacional do banco, implementação de jornada de trabalho, monitoramento real-time, filtros de busca e auditoria de ações por nome. | Pedro | Erros de permissão (403) no mobile e inconsistência em tipos de objetos da API. | Padronização de modelos SQLAlchemy em toda a camada de rotas e sincronização de eventos via WebSockets no Login/Logout. | Sistema sênior v4.0 com governança completa e BI estável. | Início do fluxo simplificado de ordens. | Log de Fatos v4.0. |

---

## 🛠️ Detalhamento Técnico (Semana 17)

### 2026-05-09: Governança e Real-time Elite
- **Infraestrutura:** 
    - Corrigido container `bdzelamapa` e removida redundância de tabelas de log.
    - Simplificado schema de usuários (removidos campos de bloqueio e verificação não utilizados).
- **Segurança & Auditoria:**
    - Registro nominal: Cada ação no log agora mostra o nome do autor (ex: "Usuário X criou a conta de Y").
    - Sanitização automática de e-mails (bloqueio de acentos no frontend e backend).
    - Medidor de força de senha no cadastro.
- **BI & Jornada:**
    - Criado sistema de controle de jornada (tempo online) com fechamento mensal automático.
    - Scorecard do Operador agora permite filtro por nome e exibe horas trabalhadas no mês.
    - Corrigido crash de tela branca em relatórios quando o banco de dados está vazio.
- **UX Real-time:**
    - Status do motorista (Online/Offline) agora reflete instantaneamente no Dashboard ao logar/sair.

---
[[README|⬅️ Voltar ao README]]
