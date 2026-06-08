# 📄 Proposta de Atualização do Relatório ZelaMapa (Para Overleaf)

Esta é uma prévia de como ficarão as alterações no relatório final. Após sua aprovação, realizarei a conversão para os arquivos `.tex` correspondentes.

---

## 🏗️ 1. Inclusão de "Vulnerabilidades e Desafios Técnicos" (Capítulo Metodologia)

### 3.4 Desafios de Segurança e Vulnerabilidades Identificadas
Durante o ciclo de desenvolvimento, foram identificados e endereçados pontos críticos de segurança para garantir a integridade dos dados governamentais:

1.  **Segurança de Autenticação (JWT):** Implementação de tokens JWT para sessões. Uma vulnerabilidade potencial reside no armazenamento de tokens no `localStorage`; para mitigar riscos de XSS, planeja-se migrar para *HTTP-only cookies* em versões futuras.
2.  **Configurações de CORS:** O backend em FastAPI exigiu configurações rigorosas de CORS para permitir apenas origens autorizadas (o frontend Vite), evitando acessos não autorizados por scripts externos.
3.  **Sanitização de Dados:** O sistema utiliza Pydantic e SQLAlchemy para prevenir ataques de *SQL Injection*, validando cada entrada de dados vinda do cidadão.

---

## 🛠️ 2. Inclusão de "Correções e Melhorias" (Capítulo Etapas de Execução)

### 4.2 Evolução e Refatoração
Baseado nos testes funcionais, as seguintes correções foram aplicadas:
- **Sincronização de Estado:** Refatoração da store global (Zustand) para garantir que o papel do usuário (*ADMIN* vs *MOTORISTA*) seja respeitado instantaneamente após o login, evitando falhas de renderização.
- **Consistência do Banco de Dados:** Correção de conflitos entre o backup SQLite e o banco principal MySQL, garantindo persistência única em container Docker.
- **Validação ViaCEP:** Melhoria no tratamento de erros do formulário do cidadão quando o serviço de CEP está indisponível.

---

## 📸 3. Inclusão das Telas Reais (Capítulo Entregas)

### 5.5 Implementação das Interfaces Funcionais
Diferente da prototipação, a implementação final apresenta os dados reais consumidos via API:

**Figura 6: Portal Web Institucional (Landing Page)**
*(Imagem: 01_LandingPage.png)*
Apresenta o conceito do projeto e os pontos de acesso para cidadãos e gestores.

**Figura 7: Dashboard Administrativo de Gestão Urbana**
*(Imagem: 02_Dashboard_Gerente.png)*
Painel em React apresentando indicadores de BI, mapa de calor de ocorrências e gestão de equipes em tempo real.

**Figura 8: Interface do Motorista e Logística**
*(Imagem: 03_App_Motorista.png)*
Focado em usabilidade móvel, exibe as rotas otimizadas e a lista de coletas pendentes.

**Figura 9: Sistema de Solicitação Cidadã**
*(Imagem: 04_App_Cidadao.png)*
Interface simplificada para o relato de demandas urbanas com geolocalização automática.

---

## 🚀 4. Expansão de "Próximos Passos" (Capítulo Conclusão)

### 7.1 Trabalhos Futuros e Escalabilidade
Para a conclusão do projeto e futura implementação em escala real, os seguintes passos são prioritários:
- **Notificações Push:** Implementar alertas em tempo real para os motoristas via WebSockets quando uma nova ordem de serviço crítica for gerada.
- **Suporte Offline Completo:** Expandir a capacidade do PWA para permitir que motoristas confirmem coletas mesmo em áreas de baixa conectividade, sincronizando os dados posteriormente.
- **Inteligência Artificial para Rotas:** Integrar modelos de aprendizado de máquina para prever áreas de maior descarte de resíduos com base em dados históricos.

---

**Deseja que eu proceda com a atualização oficial nos arquivos `.tex` do projeto?**
