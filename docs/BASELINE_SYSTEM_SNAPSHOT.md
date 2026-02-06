# 📊 BASELINE SYSTEM SNAPSHOT - NAUTI ONE v8.0

> **Auditoria Executável do Estado Atual**
> Data: 2026-02-06 | Status: ANÁLISE COMPLETA
> Objetivo: Identificar gaps antes de correções

---

## 📈 RESUMO EXECUTIVO

| Métrica | Valor | Status |
|---------|-------|--------|
| **Rotas Totais Registradas** | 180+ | ✅ |
| **Mega-Hubs Canônicos** | 7 | ✅ |
| **Itens no Sidebar** | 53 | ✅ |
| **Legacy Aliases Configurados** | 135+ | ✅ |
| **Páginas com Mock Data** | 45+ | 🔴 CRÍTICO |
| **Handlers Placeholders** | 73+ | 🔴 CRÍTICO |
| **Páginas com CRUD Incompleto** | 28+ | 🟡 ALTO |
| **Integrações Supabase Reais** | ~35 | 🟡 PARCIAL |
| **Auditorias Marítimas** | 12/12 | ✅ PRESERVADAS |
| **Agentes IA** | 10/10 | ✅ PRESERVADOS |

---

## 🗺️ ESTRUTURA DE ROTAS

### 7 MEGA-HUBS CANÔNICOS (App.tsx)

| # | Hub | Rota | Arquivo | Tabs |
|---|-----|------|---------|------|
| A | Command | `/command` | `CommandMegaHub.tsx` | overview, operations, executive, noc, soc, comms, alerts |
| B | Ops | `/ops` | `OpsMegaHub.tsx` | overview, maritime, fleet, voyage, missions, logistics, contracts |
| C | Maintenance | `/maintenance` | `MaintenanceMegaHub.tsx` | overview, surveys, predictive, drydock, fuel, digital-twin, waste-marpol, esg, planning |
| D | AI | `/ai` | `AIMegaHub.tsx` | overview, chat, agents, workflows, voice, modules, rag, analytics, agent-health |
| E | Tracking | `/tracking` | `TrackingMegaHub.tsx` | overview, realtime, ais, satcom, weather, alerts, live-map |
| F | Compliance | `/compliance` | `ComplianceMegaHub.tsx` | overview, scorecard, certificates, risk-matrix, ncs-capas, audit-workflow + 12 auditorias |
| G | Workbench | `/workbench` | `WorkbenchMegaHub.tsx` | docs, people, finance, travel, system |

### Rotas Diretas Registradas (não consolidadas)

```
/billing, /onboarding, /analytics-feedback
/noc, /soc, /health-monitor
/maritime-command, /fleet-command, /voyage-command, /route-optimizer
/mission-command, /bridge-link, /drydock-management
/vessel-contracts, /charter-party, /cargo-management, /port-call
/digital-twin, /logistics-command, /recruitment
/ai-command, /ai-hub, /ai-analytics, /voice-assistant
/peo-dp, /peotram, /sgso, /pre-sire, /tmsa-assessment (12 auditorias)
/audit-agents (10 agentes IA)
/hr-dashboard, /payroll, /time-tracking, /medical-infirmary
/voyage-pnl, /crew-scheduler, /procurement-command
/esg-emissions, /waste-management, /sustainability-score
/travel-command, /weather-command
/settings, /integrations, /api-gateway
/enterprise/* (12 módulos)
/advanced/* (12 módulos)
```

---

## 🔴 PÁGINAS COM MOCK DATA (P0 - CRÍTICO)

### Lista de Arquivos com Dados Simulados em Produção

| # | Arquivo | Variáveis Mock | Impacto |
|---|---------|----------------|---------|
| 1 | `AlertsCommandCenter.tsx` | `mockAlerts`, `mockInsights`, `mockSystemHealth` | Alertas falsos |
| 2 | `APICenter.tsx` | `mockIntegrations` | Status de APIs simulado |
| 3 | `VesselCTS.tsx` | `mockNonConformities` | Compliance falso |
| 4 | `WorkflowCommandCenter.tsx` | `mockVisualWorkflows` | Fluxos decorativos |
| 5 | `AnalyticsCommandCenter.tsx` | `mockMetrics`, `mockInsights`, `mockPredictions` | BI não real |
| 6 | `ProcurementCommandCenter.tsx` | `mockStock`, `mockRecommendations` | Inventário fictício |
| 7 | `TravelCommandCenter.tsx` | `mockTrips` | Viagens não reais |
| 8 | `SecurityMonitoring.tsx` | `mockAlerts` | Segurança simulada |
| 9 | `SecurityScanner.tsx` | `mockFindings` | Vulnerabilidades fictícias |
| 10 | `MaintenanceDashboard.tsx` | `mockWorkOrders`, `mockEquipment` | Ordens fictícias |
| 11 | `ComplianceCommandCenter.tsx` | `mockCertificates`, `mockAudits` | Certificados falsos |
| 12 | `FleetTrackingDashboard.tsx` | `mockVessels`, `mockAlerts`, `mockGeofences` | Posições falsas |
| 13 | `EnhancedWasteManagement.tsx` | `mockTanks` | MARPOL simulado |
| 14 | `MedicalDashboard.tsx` | `mockRecords`, `mockMedications` | Enfermaria falsa |
| 15 | `CommandMegaHub.tsx` | `commandTimelineEvents` (hardcoded) | Timeline decorativa |
| 16+ | **+30 arquivos enterprise/advanced** | Diversos | Módulos não operacionais |

### Módulos Enterprise 100% Mock

- `FatigueRiskPage.tsx` - Análise de fadiga simulada
- `FormsBuilderPage.tsx` - Construtor sem persistência
- `CrewMatchingPage.tsx` - Matching fictício
- `TMSAAnalyticsPage.tsx` - TMSA decorativo
- `BlockchainCertificatesPage.tsx` - Blockchain fake
- `BunkerOptimizationPage.tsx` - Otimização simulada
- `CargoPlanningPage.tsx` - Planejamento decorativo
- `VRTrainingPage.tsx` - VR placeholder

---

## 🔴 HANDLERS PLACEHOLDER (P0 - CRÍTICO)

### Botões que Apenas Mostram Toast

| # | Arquivo | Linha | Handler | O que deveria fazer |
|---|---------|-------|---------|---------------------|
| 1 | `ProcurementCommandCenter.tsx` | 990 | "Abrindo item para edição..." | Abrir modal de edição real |
| 2 | `ProcurementCommandCenter.tsx` | 1014 | "Abrindo opções de filtro..." | Abrir filtros funcionais |
| 3 | `ProcurementCommandCenter.tsx` | 1027 | "Abrindo formulário de cadastro..." | Modal de fornecedor + INSERT |
| 4 | `OperationsCommandHubEnhanced.tsx` | 271 | `handleQuickAction` (toast only) | Executar ações reais |
| 5 | `OperationsCommandHubEnhanced.tsx` | 126-165 | Alertas com ações fake | Mutations reais |
| 6 | `FinanceCommandCenter.tsx` | 1117 | "Abrindo detalhes da rota..." | Navegação ou modal real |
| 7 | `FinanceCommandCenter.tsx` | 1121 | "Exportando dados..." | Gerar CSV/PDF real |
| 8 | `IMCADPAuditDashboard.tsx` | 535, 539 | Export Excel/JSON (toast only) | Download real |
| 9 | `advanced-ai-insights.tsx` | 210 | "Exportando insights..." | Gerar arquivo real |
| 10 | `training-academy.tsx` | 584 | Download certificado fake | Gerar certificado real |
| 11 | `CommandMegaHub.tsx` | 99-101 | `handleActionBarAction` (console.log) | Ações reais |
| 12 | `OpsMegaHub.tsx` | 60-61 | `handleActionBarAction` (console.log) | Ações reais |

### Biblioteca de Placeholders (Institucionalizada)

**Arquivo:** `src/lib/actions/action-handler.ts`

```typescript
// Linhas 286-290 - Factory de placeholders
createActionHandler() // Apenas dispara toast

// Linhas 295-313 - 18 métodos decorativos
quickAction.save(), approve(), analyze(), sync(), schedule() // Todos apenas toast
```

---

## 🟡 PÁGINAS SEM CRUD COMPLETO (P1)

### Operações Parciais Detectadas

| Módulo | CREATE | READ | UPDATE | DELETE | EXPORT |
|--------|--------|------|--------|--------|--------|
| Fleet Operations | ✅ | ✅ | ⚠️ Parcial | ❌ | ✅ |
| Voyages | ❌ Toast | ✅ | ❌ | ❌ | ❌ |
| Maintenance | ⚠️ Parcial | ✅ | ⚠️ | ❌ | ✅ |
| Compliance Audits | ❌ | ✅ | ❌ | ❌ | ❌ Toast |
| Documents | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| People/Crew | ✅ | ✅ | ⚠️ | ❌ | ✅ |
| Finance | ❌ | ✅ | ❌ | ❌ | ❌ Toast |
| AI Agents | ❌ | ✅ | ❌ | ❌ | ❌ |
| Tracking | - | ✅ | - | - | ❌ Toast |

---

## ✅ INTEGRAÇÕES SUPABASE FUNCIONAIS

### Páginas com Dados Reais Confirmados

| Módulo | Hooks/Serviços | Tabelas |
|--------|----------------|---------|
| Fleet & Operations | `useFleetOperations.ts` | `vessels` |
| Maintenance & Surveys | `useClassSurveys.ts` | `vessels`, `maintenance_records` |
| Contracts | `useContractsData.ts` | `vessel_contracts`, `downtime_events` |
| Finance P&L | `useExecutiveKPIs.ts` | `vessels`, `incidents` |
| Crew Scheduler | `usePeopleHubData.ts` | `crew_members`, `vessels` |
| Tracking | `useFleetTracking.ts` | `telemetry_logs`, `telemetry_alerts` |
| Procurement | `useSuppliersRealData.ts` | `suppliers`, `rfq_requests`, `inventory_items` |
| Training Academy | `useTrainingData.ts` | `academy_progress` |

---

## 🔍 12 AUDITORIAS MARÍTIMAS - STATUS

| # | Auditoria | Rota | Página | Backend |
|---|-----------|------|--------|---------|
| 1 | PEO-DP | `/peo-dp` | `PEODP.tsx` | ⚠️ Parcial |
| 2 | PEOTRAM | `/peotram` | `PEOTRAM.tsx` | ⚠️ Parcial |
| 3 | ISM Code | `/safety-imca` | `SafetyIMCAV2.tsx` | ⚠️ Parcial |
| 4 | ISPS Security | `/isps-security` | `ISPSSecurityV2.tsx` | ⚠️ Parcial |
| 5 | SOLAS/LSA/FFE | `/solas-inspection` | `SOLASInspection.tsx` | ⚠️ Parcial |
| 6 | MARPOL I-VI | `/waste-management` | `WasteManagementPremium.tsx` | ✅ Real |
| 7 | Pre-OVID | `/pre-ovid` | `PreOVIDInspection.tsx` | ⚠️ Parcial |
| 8 | Pre-MLC 2006 | `/mlc-inspection` | `MLCInspection.tsx` | ⚠️ Parcial |
| 9 | PSC Package | `/psc-package` | `PSCPackage.tsx` | ⚠️ Parcial |
| 10 | SGSO ANP | `/sgso` | `SGSO.tsx` | ⚠️ Parcial |
| 11 | Pre-SIRE 2.0 | `/pre-sire` | `PreSIREInspection.tsx` | 🔴 Mock |
| 12 | TMSA | `/tmsa-assessment` | `TMSAAssessment.tsx` | 🔴 Mock |

---

## 🤖 10 AGENTES IA - STATUS

| # | Agente | Especialização | Status |
|---|--------|----------------|--------|
| 1 | Agent PEO-DP | Posicionamento Dinâmico | ✅ Registrado |
| 2 | Agent PEO-TRAM | Treinamento e Manning | ✅ Registrado |
| 3 | Agent ISM | Safety Management | ✅ Registrado |
| 4 | Agent ISPS | Security | ✅ Registrado |
| 5 | Agent MLC | Maritime Labour | ✅ Registrado |
| 6 | Agent SGSO | Operations Management | ✅ Registrado |
| 7 | Agent Quality | ISO 9001 | ✅ Registrado |
| 8 | Agent Environmental | MARPOL | ✅ Registrado |
| 9 | Agent Technical | Maintenance | ✅ Registrado |
| 10 | Agent Documentation | Document Control | ✅ Registrado |

**Nota:** Agentes estão registrados mas interação real com backend de IA não confirmada.

---

## 📋 SIDEBAR TREE ATUAL

```
🎯 Command (5 itens)
├── Command Center → /command
├── Operations → /command?tab=operations
├── Executive → /command?tab=executive
├── NOC 24/7 → /command?tab=noc
└── SOC Security → /command?tab=soc

🚀 Ops (7 itens)
├── Operations Hub → /ops
├── Maritime → /ops?tab=maritime
├── Fleet → /ops?tab=fleet
├── Voyage → /ops?tab=voyage
├── Missions → /ops?tab=missions
├── Logistics → /ops?tab=logistics
└── Contracts → /ops?tab=contracts

🔧 Maintenance (8 itens)
├── Maintenance Hub → /maintenance
├── Class Surveys [DNV] → /maintenance?tab=surveys
├── Predictive [ML] → /maintenance?tab=predictive
├── Drydock → /maintenance?tab=drydock
├── Fuel & ROB → /maintenance?tab=fuel
├── Digital Twin [3D] → /maintenance?tab=digital-twin
├── MARPOL & Waste → /maintenance?tab=waste-marpol
└── ESG Emissions → /maintenance?tab=esg

🤖 AI (8 itens)
├── AI Hub → /ai
├── Chat & Assistants → /ai?tab=chat
├── AI Agents [25+] → /ai?tab=agents
├── Workflows → /ai?tab=workflows
├── Voice → /ai?tab=voice
├── 11 AI Modules [11] → /ai?tab=modules
├── RAG & OCR → /ai?tab=rag
└── Analytics → /ai?tab=analytics

📡 Tracking (6 itens)
├── Tracking Hub → /tracking
├── Real-time → /tracking?tab=realtime
├── AIS Fleet → /tracking?tab=ais
├── SATCOM → /tracking?tab=satcom
├── Weather AI [AI] → /tracking?tab=weather
└── Alerts → /tracking?tab=alerts

🛡️ Compliance (18 itens)
├── Compliance Hub → /compliance
├── Scorecard → /compliance?tab=scorecard
├── 🤖 10 AI Agents [10 AI] → /audit-agents
├── Certificates → /compliance?tab=certificates
├── Risk Matrix → /risk-matrix
├── NCs & CAPAs → /compliance?tab=ncs-capas
├── 1. PEO-DP [IMCA] → /peo-dp
├── 2. PEOTRAM [13E] → /peotram
├── 3. ISM Code [SMS] → /safety-imca
├── 4. ISPS Security [SSP] → /isps-security
├── 5. SOLAS/LSA/FFE [SOLAS] → /solas-inspection
├── 6. MARPOL I-VI [I-VI] → /waste-management
├── 7. Pre-OVID [OCIMF] → /pre-ovid
├── 8. Pre-MLC 2006 [ILO] → /mlc-inspection
├── 9. PSC Package [MoU] → /psc-package
├── 10. SGSO ANP [17P] → /sgso
├── 11. Pre-SIRE 2.0 [SIRE] → /pre-sire
└── 12. TMSA [OCIMF] → /tmsa-assessment

📚 Workbench (6 itens)
├── 📄 Documents → /workbench?section=docs
├── 👥 People → /workbench?section=people
├── 💰 Finance → /workbench?section=finance
├── ✈️ Travel → /workbench?section=travel
├── ⚙️ System → /workbench?section=system
└── 🛠️ Dev Tools [admin] → /workbench?section=system&view=dev
```

**Total Sidebar:** 7 grupos, 58 itens

---

## 🚨 ROTAS QUEBRADAS DETECTADAS

| Rota | Tipo | Causa |
|------|------|-------|
| `/compliance-dashboard` | Alias faltando | Não redirecionava (corrigido) |
| `/voyage-pnl` | Página inexistente | Criada posteriormente |
| `/crew-scheduler` | Página inexistente | Criada posteriormente |
| `/workbench/*` | Tabs internas | Precisam implementação de seções |

---

## 📊 MÉTRICAS DE QUALIDADE

### Distribuição de Estado

```
COMPLETO (CRUD + Backend Real): ████████░░░░░░░░░░░░ 35%
PARCIAL (Apenas Leitura):       █████████████░░░░░░░ 40%
MOCK/PLACEHOLDER:               ████████████████████ 25%
```

### Priorização

| Prioridade | Descrição | Quantidade |
|------------|-----------|------------|
| P0 | Mock em produção / Handlers fake | 45+ páginas |
| P1 | CRUD incompleto | 28+ páginas |
| P2 | UX inconsistente | 30+ páginas |
| P3 | Performance / Offline | Sistema todo |

---

## ✅ PRÓXIMOS PASSOS

1. **P0-MOCK-REMOVAL:** Substituir todos os `mockData` por hooks Supabase
2. **P0-HANDLER-FIX:** Conectar handlers placeholder a mutations reais
3. **P1-CRUD-COMPLETE:** Completar CRUD em todos os módulos core
4. **P1-AUDIT-BACKEND:** Implementar backend real para 12 auditorias
5. **P2-UX-CONSISTENCY:** Padronizar empty/loading/error states
6. **P2-EXPORT-REAL:** Implementar exports reais (CSV/PDF/Excel)

---

*Snapshot gerado automaticamente - NAUTI ONE v8.0*
*Data: 2026-02-06*
