# 🚛 ZelaMapa - Plano 2 Semanas (MVP Testável)

## 🎯 Objetivo
App motorista **funcional para testes reais** em 10 dias úteis.

---

## 📋 Plano 2 Semanas

### **SEMANA 1 — Base + Autenticação + Ordens**

**Dia 1-2 — Autenticação JWT**
- Backend: POST `/api/auth/login` + JWT middleware
- Frontend: Tela login real + armazenamento seguro
- Skills: `auth-jwt`, `password-hash`

**Dia 3-4 — Perfil & Status**
- Backend: GET/PUT `/api/motorista/perfil`, PUT `/api/motorista/status`
- Frontend: Tela perfil + toggle disponibilidade (ONLINE/OFFLINE)
- Skills: `validation-schema`

**Dia 5 — Ordens Básicas**
- Backend: 
  - GET `/api/ordens/pendentes` (status=ABERTA)
  - GET `/api/ordens/{id}` (detalhes)
  - PUT `/api/ordens/{id}/aceitar`
  - PUT `/api/ordens/{id}/concluir`
- Frontend: Lista pendentes → modal detalhes → fluxo aceitar→concluir

---

### **SEMANA 2 — GPS + Navegação + Real-time**

**Dia 6-7 — Rastreamento GPS**
- Backend: POST `/api/localizacao/batch`
- Banco: tabela `localizacoes`
- Frontend: Envio automático a cada 10s (navigator.geolocation)
- Indicador visual "Transmitando GPS"

**Dia 8 — Navegação**
- Backend: GET `/api/rota/instrucoes?origem=&destino=` (OSRM parsing)
- Frontend: Painel deslizante com instruções + botão "Abrir no Google Maps"

**Dia 9-10 — Real-time & Polish**
- WebSocket simples via Socket.IO: eventos `nova_ordem`, `ordem_cancelada`
- Frontend: Notificação toast + som ao receber ordem
- Loading states, validação forms, ajustes UI mobile-first

---

## 🎨 Telas MVP
```
1. Login (email/senha)
2. DriverLayout (tab: Ordens | Mapa | Perfil)
3. OrdersList (cards com status)
4. OrderDetailModal (aceitar/recusar/iniciar/concluir)
5. NavigationPanel (instruções OSRM)
6. ProfileScreen (editar + status toggle)
7. OfflineBanner básico
```

---

## 🔧 Skills Essenciais (instalar já)
1. `auth-jwt` — autenticação pronta
2. `socket-io` — real-time
3. `validation-schema` — validação forms
4. `geolocation-tracker` — GPS otimizado

---

## 🗄️ Banco — Mínimo
```sql
-- Já existem: usuarios, ordens_servico
ALTER TABLE ordens_servico ADD COLUMN status ENUM('ABERTA','ACEITA','EM_ROTA','CONCLUIDA','RECUSADA') DEFAULT 'ABERTA';
ALTER TABLE ordens_servico ADD COLUMN motivo_recusa TEXT;
ALTER TABLE ordens_servico ADD COLUMN horario_aceitacao DATETIME;
ALTER TABLE ordens_servico ADD COLUMN horario_inicio DATETIME;

CREATE TABLE localizacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  motorista_id INT NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  velocidade DECIMAL(5,2),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_motorista_timestamp (motorista_id, timestamp DESC)
);
```

---

## 📡 API Endpoints — Só o Essencial
```
POST   /api/auth/login
GET    /api/auth/me

GET    /api/motorista/perfil
PUT    /api/motorista/status

GET    /api/ordens/pendentes
GET    /api/ordens/{id}
PUT    /api/ordens/{id}/aceitar
PUT    /api/ordens/{id}/concluir
GET    /api/ordens/{id}/rota

POST   /api/localizacao/batch

WS     /ws/driver/{motorista_id} (nova_ordem, ordem_cancelada)
```

---

## ⏱️ Timeline Realista
| Dia | Tarefa | Entregável |
|-----|--------|------------|
| 1-2 | Auth JWT backend + frontend | Login funcional |
| 3-4 | Perfil + status toggle | Motorista edita dados |
| 5 | Lista ordens + fluxo aceitar | Ordens aparecem, aceita |
| 6-7 | GPS batch + tabela | Localização no mapa gestor |
| 8 | OSRM instruções + painel | Navegação passo-a-passo |
| 9 | Socket.IO + notificações | Tempo real |
| 10 | Bugfixes + polish | MVP testável |

---

## ✅ Critérios Sucesso (MVP)
- [ ] Login JWT funciona
- [ ] Motorista marca ONLINE/OFFLINE
- [ ] Ordem pendente aparece → Aceita → Inicia → Conclui
- [ ] GPS envia a cada 10s
- [ ] Instruções rota aparecem no painel
- [ ] WebSocket notifica novas ordens
- [ ] UI responsiva mobile
- [ ] Sem erros críticos no console

---

## 🚀 Próximos Passos Imediatos
1. Instalar skills: `auth-jwt`, `socket-io`, `validation-schema`, `geolocation-tracker`
2. Criar branch `feat/driver-mvp`
3. Implementar Dia 1-2 (Auth) agora
4. Testar com motorista real no final da semana 2
