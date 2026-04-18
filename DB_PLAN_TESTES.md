# 🗄️ Banco de Dados — Plano Simplificado (Apenas Testes)

## 🎯 Objetivo
Schema **funcional mínimo** para testes e desenvolvimento do app motorista.
**Sem camadas avançadas de segurança** — foco em velocidade e funcionalidade.

---

## ✅ JÁ IMPLEMENTADO

### Tabelas Básicas (todas presentes)
- `usuarios` — autenticação
- `motoristas` — perfil motorista
- `tipos_ocorrencia` — catálogo
- `ocorrencias` — chamados
- `ordens_servico` — fluxo principal
- `localizacoes` — GPS (criada agora)
- `sessions` — JWT revogação (estrutura)
- `audit_log` — logs (estrutura)
- `notificacoes_push` — notificações
- `historico_limpeza` — limpeza de imagens
- `v_motoristas_public` — view

### Backend Funcional
- Auth JWT (`/api/auth/login`, `/me`)
- Ordens (`/api/ordens/pendentes`, `/minhas`, `/{id}/aceitar`, `/{id}/iniciar`, `/{id}/concluir`)
- Rota OSRM (`/{id}/rota`)

---

## ❌ REMOVIDO / DESNECESSÁRIO PARA TESTES

### Segurança Avançada (NÃO implementar agora)
- [x] Row Level Security (RLS) — **DESNECESSÁRIO em testes**
- [x] pgcrypto extension — **criptografia ficará na aplicação se necessário**
- [x] Audit Log Triggers automáticos — ** logs manuais no backend**
- [x] Roles & Permissionsgranular — **uso simples: autenticação + autorização nos endpoints**
- [x] Full-text search GIN index — **opcional**
- [x] Particionamento por mês — **só se volume alto**
- [x] Vistas materializadas — **desnecessário**
- [x] Check constraints complexos — **validação no backend**
- [x] Fail2ban + login_attempts — **rate limiting no backend depois**
- [x] Backup encrypted strategy — **backup manual durante testes**

---

## 📋 TAREFAS PENDENTES (Testes)

### 1. **Endpoint GPS** — CRUD localizacoes
**Arquivo:** `backend/app/routers/localizacao.py` (criar)

**Endpoints:**
```
POST   /api/localizacao/batch       # recebe array de coordenadas
GET    /api/localizacao/ultima/{motorista_id}
DELETE /api/localizacao/antigas     # limpa > 30 dias (opcional)
```

**Lógica:**
- Recebe batch de localizações (10-50 pontos)
- Insere em `localizacoes` (FK motorista_id opcionalmente ordem_id)
- Retorna sucesso/falha

**Teste:** Frontend envia GPS a cada 10-15s

---

### 2. **WebSocket (Socket.IO)** — Notificações real-time
**Arquivo:** `backend/app/websocket.py` (criar)

**Events:**
```python
# Servidor emite:
socket.emit('nova_ordem', {ordem: {...}})
socket.emit('ordem_cancelada', {ordem_id: 123})

# Cliente envia:
socket.emit('motorista_online', {motorista_id: 1})
socket.emit('motorista_offline', {motorista_id: 1})
```

**Teste:** Quando ordem criada (gestor), motorista recebe toast

---

### 3. **Endpoint Status Motorista** — PUT /api/motorista/status
**Arquivo:** já existe em `ordens.py` ou criar separado

```
PUT /api/motorista/status
Body: { "disponibilidade": "DISPONIVEL" | "EM_ROTA" | "OFFLINE" | "EM_PAUSA" }
```

**Update:** tabela `motoristas.disponibilidade`

---

### 4. **Update Schema SQLite** —garantir novas tabelas
- `localizacoes` ✅ criada
- `sessions` ✅ criada
- `audit_log` ✅ criada
- `notificacoes_push` ✅ criada

**Rodar:** `python3 backend/seed.py --force` para popular

---

### 5. **Frontend — Componentes Restantes**

**Ordem 1 (Crítico):**
- `OrderDetailModal.tsx` — modal detalhes + botões fluxo
- Integração com `orderService` (chamar PUTs)
- Atualização lista eotimista

**Ordem 2 (GPS):**
- `useGeolocation.ts` hook — `navigator.geolocation.watchPosition`
- `locationService.ts` — POST batch a cada 10-15s
- Indicador visual GPS "transmitindo"

**Ordem 3 (Mapa):**
- `DriverMap.tsx` — Leaflet com posição atual + marcadores origem/destino
- Polylinha rota (OSRM)

**Ordem 4 (Navegação):**
- `NavigationPanel.tsx` — painel instruções OSRM passo-a-passo
- Botão "Abrir no Google Maps"

**Ordem 5 (Perfil):**
- `ProfileScreen.tsx` — dados motorista + PUT update
- Toggle status ONLINE/OFFLINE

**Ordem 6 (Polish):**
- OfflineBanner (detecta navegador offline)
- Toast notifications (context)
- Loading/error states

---

## 🗺️ **ROADMAP IMEDIATO (3 dias)**

### **Dia 1 — Backend Finalização**
- [ ] Criar `routers/localizacao.py` (POST batch)
- [ ] Criar `websocket.py` (Socket.IO basics)
- [ ] Testar com `curl`/Postman:
  - login → token
  - GET /ordens/pendentes
  - PUT /ordens/{id}/aceitar
  - POST /localizacao/batch

### **Dia 2 — Frontend Modal + GPS**
- [ ] `OrderDetailModal` completo
- [ ] Integração fluxo Aceitar→Iniciar→Concluir
- [ ] Hook `useGeolocation` + service
- [ ] Envio batch GPS automático

### **Dia 3 — Mapa + Navegação**
- [ ] `DriverMap` Leaflet com rota
- [ ] `NavigationPanel` OSRM instructions
- [ ] `ProfileScreen` + status toggle
- [ ] Teste end-to-end completo

---

## 🧪 **Checklist Testes**

**Backend:**
- [ ] POST `/auth/login` retorna token
- [ ] GET `/ordens/pendentes` retorna lista
- [ ] PUT `/ordens/{id}/aceitar` muda status
- [ ] POST `/localizacao/batch` insere registros
- [ ] WebSocket conecta e emite eventos

**Frontend:**
- [ ] Login → DriverLayout
- [ ] Lista ordens aparece
- [ ] Modal detalhes funciona
- [ ] GPS envia a cada 10s
- [ ] Mapa mostra rota
- [ ] Navegação instruções aparecem
- [ ] Perfil editável

---

## ⚡ **PRÓXIMO PASSO AGORA**

**Implementar `OrderDetailModal.tsx`** (Frontend — Dia 3 do plano original)

É o componente chave que falta para o fluxo completo do motorista.

**Quer que eu crie o `OrderDetailModal` agora?**
