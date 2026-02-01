# 🔄 MODULE FUSION PLAN - NAUTI ONE

> **ETAPA 2 - PROMPT MASTER V4.1**
> Data: Janeiro 2026

---

## 🎯 OBJETIVO

Reduzir o sidebar de **134+ módulos** para **~15 hubs** sem perder funcionalidades.

---

## 📋 GRUPOS DE FUSÃO

### GRUPO A: Operations Command Hub

**Fundir 5 módulos principais + 5 sub-áreas:**

#### Módulos Principais (viram TABS):
| Módulo Atual | Path Atual | Nova Tab |
|--------------|------------|----------|
| Maritime Command | `/maritime-command` | `maritime` |
| Fleet Command Center | `/fleet-command` | `fleet` |
| Voyage Command | `/voyage-command` | `voyage` |
| Mission Command | `/mission-command` | `mission` |
| Logistics Command | `/logistics-command` | `logistics` |

#### Sub-áreas (viram seções dentro das tabs):
| Módulo Atual | Path Atual | Destino |
|--------------|------------|---------|
| Otimização de Rotas AI | `/route-optimizer` | Tab Voyage → Seção "Otimização" |
| Bridge Link | `/bridge-link` | Tab Maritime → Seção "Bridge" |
| Drydock Management | `/drydock-management` | Tab Fleet → Seção "Drydock" |
| Histórico de Embarcação | `/vessel-history` | Tab Fleet → Seção "Histórico" |
| Digital Twin | `/digital-twin` | Tab Fleet → Seção "Digital Twin" |

#### Nova Estrutura:
```typescript
// Nova rota: /operations-command
<Tabs defaultValue="maritime">
  <TabsList>
    <TabsTrigger value="maritime">⚓ Maritime</TabsTrigger>
    <TabsTrigger value="fleet">🚢 Fleet</TabsTrigger>
    <TabsTrigger value="voyage">🗺️ Voyage</TabsTrigger>
    <TabsTrigger value="mission">🎯 Mission</TabsTrigger>
    <TabsTrigger value="logistics">📦 Logistics</TabsTrigger>
  </TabsList>
</Tabs>
```

#### Redirects:
```
/maritime-command → /operations-command?tab=maritime
/fleet-command → /operations-command?tab=fleet
/voyage-command → /operations-command?tab=voyage
/mission-command → /operations-command?tab=mission
/logistics-command → /operations-command?tab=logistics
/route-optimizer → /operations-command?tab=voyage&section=optimization
/bridge-link → /operations-command?tab=maritime&section=bridge
/drydock-management → /operations-command?tab=fleet&section=drydock
/vessel-history → /operations-command?tab=fleet&section=history
/digital-twin → /operations-command?tab=fleet&section=twin
```

**Resultado**: 15 módulos → 1 hub

---

### GRUPO B: Cargo & Port Operations Hub

**Fundir 2 módulos:**

| Módulo Atual | Path Atual | Nova Tab |
|--------------|------------|----------|
| Cargo Management | `/cargo-management` | `cargo` |
| Port Call | `/port-call` | `port` |

#### Nova Estrutura:
```typescript
// Nova rota: /cargo-port-operations
<Tabs defaultValue="cargo">
  <TabsList>
    <TabsTrigger value="cargo">📦 Cargo</TabsTrigger>
    <TabsTrigger value="port">⚓ Port Call</TabsTrigger>
    <TabsTrigger value="integrated">🔗 Visão Integrada</TabsTrigger>
  </TabsList>
</Tabs>
```

**Resultado**: 2 módulos → 1 hub

---

### GRUPO C: Vessel Contracts Hub

**Fundir 2 módulos:**

| Módulo Atual | Path Atual | Nova Tab |
|--------------|------------|----------|
| Contratos de Embarcação | `/vessel-contracts` | `contracts` |
| Charter Party | `/charter-party` | `charter` |

#### Nova Estrutura:
```typescript
// Nova rota: /vessel-contracts-hub
<Tabs defaultValue="contracts">
  <TabsList>
    <TabsTrigger value="contracts">📝 Contratos</TabsTrigger>
    <TabsTrigger value="charter">📜 Charter Party</TabsTrigger>
    <TabsTrigger value="compliance">✅ Compliance</TabsTrigger>
  </TabsList>
</Tabs>
```

**Resultado**: 2 módulos → 1 hub

---

### GRUPO D: Crew Operations Hub

**Fundir 3 módulos:**

| Módulo Atual | Path Atual | Nova Tab |
|--------------|------------|----------|
| CTS Tripulação | `/vessel-cts` | `cts` |
| Gestão de Tripulação | `/crew-management` | `management` |
| MLC Scheduling | `/mlc-scheduling` | `mlc` |

#### Nova Estrutura:
```typescript
// Nova rota: /crew-operations
<Tabs defaultValue="management">
  <TabsList>
    <TabsTrigger value="management">👥 Gestão</TabsTrigger>
    <TabsTrigger value="cts">📋 CTS</TabsTrigger>
    <TabsTrigger value="mlc">⚖️ MLC</TabsTrigger>
    <TabsTrigger value="certifications">🏆 Certificações</TabsTrigger>
    <TabsTrigger value="hours">⏰ Horas</TabsTrigger>
  </TabsList>
</Tabs>
```

**Resultado**: 3 módulos → 1 hub

---

### GRUPO E: AI Control Tower (MAIOR FUSÃO)

**Fundir 11 módulos:**

| Módulo Atual | Path Atual | Nova Tab |
|--------------|------------|----------|
| AI Modules Hub | `/ai-modules-hub` | `hub` |
| AI Hub Central | `/ai-hub` | `hub` |
| AI Command Center | `/ai-command` | `command` |
| Autonomous Command | `/autonomous-command` | `autonomous` |
| Agent Orchestration | `/agent-orchestration` | `agents` |
| AI Analytics | `/ai-analytics` | `analytics` |
| Observabilidade IA | `/ai-observability` | `observability` |
| Auditoria de IA | `/ai-audit` | `audit` |
| Workflow Command | `/workflow-command` | `workflows` |
| Journaling IA | `/ai-journaling` | `journaling` |
| IA Autônoma (Logs) | `/ai-ops/logs` | `logs` |

#### Nova Estrutura:
```typescript
// Nova rota: /ai-control-tower
<Tabs defaultValue="hub">
  <TabsList className="grid grid-cols-4">
    <TabsTrigger value="hub">🏠 Hub</TabsTrigger>
    <TabsTrigger value="chat">💬 Chat</TabsTrigger>
    <TabsTrigger value="agents">🤖 Agentes</TabsTrigger>
    <TabsTrigger value="workflows">🔄 Workflows</TabsTrigger>
    <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
    <TabsTrigger value="observability">👁️ Observabilidade</TabsTrigger>
    <TabsTrigger value="audit">🔍 Auditoria</TabsTrigger>
    <TabsTrigger value="journaling">📝 Journaling</TabsTrigger>
  </TabsList>
</Tabs>
```

**Resultado**: 11 módulos → 1 hub

---

### GRUPO F: Voice & Assistant Hub

**Fundir 3 módulos:**

| Módulo Atual | Path Atual | Nova Tab |
|--------------|------------|----------|
| Voice Assistant IA | `/voice-assistant` | `assistant` |
| Assistente de Voz | `/assistant/voice` | `assistant` |
| IA de Voz | `/voice-transcriber` | `transcriber` |

#### Nova Estrutura:
```typescript
// Nova rota: /voice-assistant-hub
<Tabs defaultValue="assistant">
  <TabsList>
    <TabsTrigger value="assistant">🎙️ Assistente</TabsTrigger>
    <TabsTrigger value="commands">🗣️ Comandos</TabsTrigger>
    <TabsTrigger value="integration">🔗 Integração</TabsTrigger>
  </TabsList>
</Tabs>
```

**Resultado**: 3 módulos → 1 hub

---

### GRUPO G: Tracking & Telemetry Hub

**Fundir 5 módulos:**

| Módulo Atual | Path Atual | Nova Tab |
|--------------|------------|----------|
| Telemetria 360° | `/telemetria` | `overview` |
| Telemetria Preditiva | `/predictive-telemetry` | `predictive` |
| DGNSS Tracking | `/tracking` | `tracking` |
| GNSS Live | `/tracking/gnss-live` | `gnss` |
| Tracking Alerts | `/tracking/alerts` | `alerts` |

#### Nova Estrutura:
```typescript
// Nova rota: /tracking-telemetry
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">📊 Visão Geral</TabsTrigger>
    <TabsTrigger value="realtime">⚡ Tempo Real</TabsTrigger>
    <TabsTrigger value="predictive">🔮 Preditiva</TabsTrigger>
    <TabsTrigger value="alerts">🚨 Alertas</TabsTrigger>
    <TabsTrigger value="history">📜 Histórico</TabsTrigger>
  </TabsList>
</Tabs>
```

**Resultado**: 5 módulos → 1 hub

---

### GRUPO H: Document Center Hub

**Fundir 7 módulos:**

| Módulo Atual | Path Atual | Nova Tab |
|--------------|------------|----------|
| Reports Command | `/reports-command` | `reports` |
| Documentos IA | `/documents` | `documents` |
| Templates | `/templates` | `templates` |
| Workflow Documentos | `/document-workflow` | `workflow` |
| Centro de Exportação | `/export-center` | `export` |
| Busca Avançada | `/advanced-search` | `search` |
| Checklists Inteligentes | `/admin/checklists` | `checklists` |

#### Nova Estrutura:
```typescript
// Nova rota: /document-center
<Tabs defaultValue="documents">
  <TabsList>
    <TabsTrigger value="documents">📄 Documentos</TabsTrigger>
    <TabsTrigger value="templates">📋 Templates</TabsTrigger>
    <TabsTrigger value="checklists">✅ Checklists</TabsTrigger>
    <TabsTrigger value="reports">📊 Relatórios</TabsTrigger>
    <TabsTrigger value="workflow">🔄 Workflow</TabsTrigger>
    <TabsTrigger value="export">📤 Exportar</TabsTrigger>
    <TabsTrigger value="search">🔍 Busca</TabsTrigger>
  </TabsList>
</Tabs>
```

**Resultado**: 7 módulos → 1 hub

---

### GRUPO I: Comms & Alerts Hub

**Fundir 4 módulos:**

| Módulo Atual | Path Atual | Nova Tab |
|--------------|------------|----------|
| Communication Command | `/communication-command` | `comms` |
| Alerts Command | `/alerts-command` | `alerts` |
| Workspace em Tempo Real | `/real-time-workspace` | `workspace` |
| Conectividade Marítima | `/maritime-connectivity` | `connectivity` |

#### Nova Estrutura:
```typescript
// Nova rota: /comms-alerts
<Tabs defaultValue="comms">
  <TabsList>
    <TabsTrigger value="comms">📡 Comunicação</TabsTrigger>
    <TabsTrigger value="alerts">🚨 Alertas</TabsTrigger>
    <TabsTrigger value="workspace">💼 Workspace</TabsTrigger>
    <TabsTrigger value="connectivity">🌐 Conectividade</TabsTrigger>
  </TabsList>
</Tabs>
```

**Resultado**: 4 módulos → 1 hub

---

### GRUPO J: People Hub

**Fundir 2 grupos (RH & Pessoas + RH & IA):**

| Módulo Atual | Path Atual | Nova Tab |
|--------------|------------|----------|
| Nauti People Hub | `/nautilus-people` | `overview` |
| HR Dashboard | `/hr-dashboard` | `dashboard` |
| Recrutamento AI | `/recruitment` | `talent` |
| Predição Turnover | `/hr-turnover` | `talent` |
| Bem-estar AI | `/crew-wellness` | `wellness` |
| Bem-estar Tripulação | `/crew-wellbeing` | `wellness` |
| Folha de Pagamento | `/hr-payroll` | `payroll` |
| Ponto Eletrônico | `/hr-time-tracking` | `time` |
| Chatbot RH | `/hr-chatbot` | `chatbot` |
| OCR Documentos | `/hr-ocr` | `documents` |

#### Normalização de Duplicidades:
- **Bem-estar AI + Bem-estar Tripulação** → 1 tab "Wellness"
- **Recrutamento AI + Predição Turnover** → 1 tab "Talent Intelligence"
- **OCR RH** → Integra com Document Center (filtro RH)

#### Nova Estrutura:
```typescript
// Nova rota: /people-hub
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">🏠 Visão Geral</TabsTrigger>
    <TabsTrigger value="talent">🎯 Talent</TabsTrigger>
    <TabsTrigger value="performance">📈 Performance</TabsTrigger>
    <TabsTrigger value="wellness">❤️ Bem-estar</TabsTrigger>
    <TabsTrigger value="training">🎓 Treinamento</TabsTrigger>
    <TabsTrigger value="compliance">✅ Compliance</TabsTrigger>
    <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
  </TabsList>
</Tabs>
```

**Resultado**: 10+ módulos → 1 hub

---

### GRUPO K: Operações Submarinas

**Ação**: Ocultar do sidebar via feature flag (backend não existe)

```typescript
// src/config/feature-flags.ts
export const FEATURE_FLAGS = {
  enableUnderwaterOps: false, // Habilitar quando backend estiver pronto
};

// sidebar-routes.ts
...(FEATURE_FLAGS.enableUnderwaterOps ? [{
  title: "🌊 Operações Submarinas",
  items: [...]
}] : [])
```

---

## 📊 RESUMO DA FUSÃO

| Antes | Depois | Redução |
|-------|--------|---------|
| Central de Comando (9) | Central de Comando (9) | 0% |
| Operações Marítimas (15) | Operations Command (1) | 93% |
| Manutenção (7) | Manutenção (7) | 0% |
| IA & Automação (14) | AI Control Tower (1) | 93% |
| AI Enterprise (12) | AI Enterprise (12) | 0% |
| Inteligência Avançada (7) | Inteligência Avançada (7) | 0% |
| Enterprise Intelligence (16) | Enterprise Intelligence (16) | 0% |
| Módulos Avançados (12) | Módulos Avançados (12) | 0% |
| Telemetria (9) | Tracking & Telemetry (1) | 89% |
| APIs & Integrações (11) | APIs & Integrações (11) | 0% |
| Relatórios (8) | Document Center (1) | 88% |
| Comunicação (4) | Comms & Alerts (1) | 75% |
| Auditorias (29) | Auditorias (29) | 0% |
| RH & Pessoas (11) | People Hub (1) | 91% |
| RH & IA (5) | (Fundido em People Hub) | 100% |
| Treinamentos (4) | Treinamentos (4) | 0% |
| Finanças (9) | Finanças (9) | 0% |
| ESG (3) | ESG (3) | 0% |
| Viagens (2) | Viagens (2) | 0% |
| Sistema (14) | Sistema (14) | 0% |

**TOTAL**: 134+ módulos → ~90 itens no sidebar (33% redução)

---

## 📄 SIDEBAR_NEW_TREE.md

Ver arquivo separado: `docs/SIDEBAR_NEW_TREE.md`

---

## 📄 REDIRECTS_COMPAT.md

Ver arquivo separado: `docs/REDIRECTS_COMPAT.md`

---

*Documento gerado em Janeiro 2026 - ETAPA 2 Completa*
