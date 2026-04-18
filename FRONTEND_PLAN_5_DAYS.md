# 🚛 Frontend Driver App — 5 Dias (Intensivo)

## 🎯 Objetivo
**5 dias úteis** para telas funcionais do app motorista, integradas com backend JWT + WebSocket + GPS.

---

## 📋 Plano 5 Dias

### **DIA 1 — Setup + Login + Layout Base**

**Manhã:**
- Install dependencies: `socket.io-client`, `zustand`, `axios`, `react-hook-form` + `zod`
- Criar estrutura: `src/components/driver/`, `src/stores/`, `src/services/`
- Configurar `axios` instance com JWT interceptor

**Tarde:**
- **LoginPage.tsx** — formulário email/senha, validação Zod, erro handling
- **AuthStore** (Zustand) — `token`, `user`, `login()`, `logout()`, `isAuthenticated`
- **ProtectedRoute** wrapper
- **DriverLayout.tsx** — tab bar inferior (Ordens | Mapa | Perfil)

**Critério fim do dia:** Login funciona → redireciona para DriverLayout

---

### **DIA 2 — Lista de Ordens + Card** (integrado com GET `/api/ordens/pendentes`)

**Manhã:**
- **OrdersList.tsx** — lista de cards horizontais (swipe não, apenas scroll)
- **OrderCard.tsx** — mostra: id, origem, destino, status badge, distância, horário
- Loading skeleton + error state

**Tarde:**
- Integração `orderService.getPendingOrders()` polling a cada 15s
- Pull-to-refresh (react native web) ou botão refresh
- Badge contador no tab "Ordens"

**Critério fim do dia:** Ordens pendentes aparecem em tempo real (polling)

---

### **DIA 3 — Order Detail + Fluxo Aceitar/Iniciar/Concluir** (WebSocket integrado)

**Manhã:**
- **OrderDetailModal.tsx** — aberto ao clicar card
  - Dados: origem/destino completos, mapa mini, botões condicionais
  - Botões: **Aceitar** (se status=ABERTA) → **Iniciar Rota** (se ACEITA) → **Concluir** (se EM_ROTA)
  - Timer 30s para aceitar (countdown)

**Tarde:**
- WebSocket connection on mount (Socket.IO)
- Event listeners: `nova_ordem` → toast notification + atualizar lista
- Event listeners: `ordem_cancelada` → remover da lista
- Atualização otimista de status local

**Critério fim do dia:** Fluxo completo: recebe ordem → aceita → inicia → conclui

---

### **DIA 4 — Mapa + GPS + Rastreamento**

**Manhã:**
- **DriverMap.tsx** (Leaflet) — centered na posição atual do driver
- Custom marker para origem (pickup) e destino (dropoff)
- Polylinha da rota (já tem PolylineOSRM)

**Tarde:**
- `useGeolocation` hook — `navigator.geolocation.watchPosition` a cada 10s
- Envio batch GPS: `locationService.sendBatch(coords)` acumula 5 pontos ou 30s
- Indicador visual "GPS ativo" (verde/vermelho)
- Toggle manual liga/desliga GPS

**Critério fim do dia:** Motorista vê sua rota + GPS transmitindo

---

### **DIA 5 — Navegação + Perfil + Polish Final**

**Manhã:**
- **NavigationPanel.tsx** — painel deslizante inferior
  - Lista de instruções OSRM (step-by-step)
  - ETA grande + distância restante
  - Botão "Abrir no Google Maps"外链 (deep link)
- Integração: `GET /api/ordens/{id}/rota` → parse OSRM → exibe instruções

**Tarde:**
- **ProfileScreen.tsx** — dados do motorista (nome, placa, modelo)
  - PUT atualização perfil
  - Toggle status ON/OFF visual
- **OfflineBanner.tsx** — detecta `navigator.onLine` (básico)
- Loading states + error boundaries + toast notifications
- Responsivo mobile-first (Tailwind)

**Critério fim do dia:** Navegação funcionando + perfil editável + ready for testing

---

## 🎨 Componentes Dia a Dia

```
Dia 1:
├── LoginPage.tsx
├── AuthStore.ts
├── DriverLayout.tsx
├── TabBar.tsx
└── api.ts (axios config)

Dia 2:
├── OrdersList.tsx
├── OrderCard.tsx
├── orderService.ts
└── OrdersStore.ts

Dia 3:
├── OrderDetailModal.tsx
├── useWebSocket.ts
├── websocketService.ts
└── toast/ (context)

Dia 4:
├── DriverMap.tsx
├── useGeolocation.ts
├── locationService.ts
└── CustomMarker.tsx

Dia 5:
├── NavigationPanel.tsx
├── ProfileScreen.tsx
├── OfflineBanner.tsx
└── utils/osrmParser.ts
```

---

## 🔧 Skills Requeridas (pré-instaladas)

```json
{
  "skills": [
    "auth-jwt",
    "socket-io",
    "zustand",
    "validation-schema",
    "geolocation-tracker",
    "ui-components" // shadcn existente
  ]
}
```

---

## 📡 Integração Backend Assumida

APIs disponíveis (devem estar prontas no Day 0):
```
POST   /api/auth/login          {email, senha} → {token, user}
GET    /api/auth/me             header Authorization

GET    /api/ordens/pendentes    ?status=ABERTA
GET    /api/ordens/{id}
PUT    /api/ordens/{id}/aceitar
PUT    /api/ordens/{id}/iniciar
PUT    /api/ordens/{id}/concluir
GET    /api/ordens/{id}/rota     → OSRM instructions

GET    /api/motorista/perfil
PUT    /api/motorista/perfil
PUT    /api/motorista/status

POST   /api/localizacao/batch   [{lat, lng, speed, timestamp}]

WS     /ws/driver/{id}          events: nova_ordem, ordem_cancelada, ordem_atualizada
```

---

## 🗂️ Estrutura Final Frontend

```
frontend/src/
├── components/
│   ├── driver/
│   │   ├── LoginPage.tsx
│   │   ├── DriverLayout.tsx
│   │   ├── OrdersList.tsx
│   │   ├── OrderCard.tsx
│   │   ├── OrderDetailModal.tsx
│   │   ├── NavigationPanel.tsx
│   │   ├── DriverMap.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── OfflineBanner.tsx
│   └── ui/ (shadcn)
├── stores/
│   ├── authStore.ts
│   ├── ordersStore.ts
│   └── driverStore.ts (GPS + status)
├── services/
│   ├── api.ts
│   ├── authService.ts
│   ├── orderService.ts
│   ├── locationService.ts
│   └── websocketService.ts
├── hooks/
│   ├── useGeolocation.ts
│   ├── useWebSocket.ts
│   └── useOnlineStatus.ts
├── utils/
│   ├── formatters.ts
│   └── osrmParser.ts
└── views/
    └── DriverApp.tsx (entry point)
```

---

## ✅ Checklist Diário (Definition of Done)

**Dia 1:**
- [ ] LoginPage renderiza e valida
- [ ] AuthStore persiste token no localStorage
- [ ] Protected route redireciona se não autenticado
- [ ] DriverLayout com 3 tabs (vazio inicial)

**Dia 2:**
- [ ] OrdersList busca da API
- [ ] OrderCard mostra dados corretos
- [ ] Pull-to-refresh atualiza lista
- [ ] Badge count atualiza

**Dia 3:**
- [ ] OrderDetailModal aberto com dados
- [ ] Botões Aceitar/Iniciar/Concluir funcionam
- [ ] WebSocket conecta ao login
- [ ] Toast aparece em `nova_ordem`
- [ ] Lista atualiza automaticamente

**Dia 4:**
- [ ] DriverMap mostra posição atual
- [ ] Marcadores origem/destino visíveis
- [ ] Polylinha da rota desenhada
- [ ] GPS envia batch a cada 30s
- [ ] Indicador GPS funciona

**Dia 5:**
- [ ] NavigationPanel mostra instruções
- [ ] Botão "Abrir no Google Maps" funciona
- [ ] ProfileScreen edita dados
- [ ] OfflineBanner detecta conexão
- [ ] Sem erros no console
- [ ] Responsivo mobile (viewport correta)

---

## 🚨 Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| APIs backend não prontas | Mock services com dados fake |
| WebSocket instável | Fallback para polling 10s |
| GPS permission denied | Explicar + botão retry |
| OSRM response malformado | Parser robusto + fallback link Google Maps |
| Mobile emulator GPS fake | Testar com location spoofing |

---

## 🔄 Dia 0 — Preparatório (Backend PRONTO)

**Antes de começar o frontend, garantir:**
- [ ] Auth JWT: `POST /api/auth/login` retorna token
- [ ] Endpoint ordens: GET `/pendentes`, PUT `/{id}/aceitar`, `/{id}/concluir`
- [ ] WebSocket Socket.IO em `/ws/driver/{id}` emitindo eventos
- [ ] GPS endpoint: `POST /api/localizacao/batch`
- [ ] Rota OSRM: `GET /api/ordens/{id}/rota` retorna instructions[]
- [ ] CORS configurado para frontend origin

---

**Ready to start?**
