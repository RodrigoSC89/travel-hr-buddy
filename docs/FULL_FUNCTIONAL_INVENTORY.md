# 📋 INVENTÁRIO FUNCIONAL COMPLETO — NAUTI ONE v8.0

> **Gerado: 2026-02-06**
> **Escopo: 100% do sistema — Módulos, Rotas, Funcionalidades, Tabelas, Edge Functions**

---

## 1️⃣ INVENTÁRIO DE MÓDULOS (7 Mega-Hubs + Sub-módulos)

### A. 🎯 COMMAND CENTER (`/command`)
| # | Módulo | Rota | Status |
|---|--------|------|--------|
| 1 | Command Center Dashboard | `/command` | ✅ Funcional |
| 2 | Operations Overview | `/command?tab=operations` | ✅ Funcional |
| 3 | Executive Dashboard | `/command?tab=executive` | ✅ Funcional |
| 4 | NOC 24/7 | `/command?tab=noc`, `/noc` | ✅ Funcional |
| 5 | SOC Security | `/command?tab=soc`, `/soc` | ✅ Funcional |
| 6 | Health Monitor | `/health-monitor` | ✅ Funcional |
| 7 | Communication Center | `/communication-command` | ✅ Funcional |
| 8 | Alerts Command | `/alerts-command` | ✅ Funcional |

### B. 🚀 OPS — Operações (`/ops`)
| # | Módulo | Rota | Status |
|---|--------|------|--------|
| 9 | Operations Hub | `/ops` | ✅ Funcional |
| 10 | Maritime Command | `/ops?tab=maritime`, `/maritime-command` | ✅ Funcional |
| 11 | Fleet Management | `/ops?tab=fleet`, `/fleet-command` | ✅ Funcional |
| 12 | Voyage Planning | `/ops?tab=voyage`, `/voyage-command` | ✅ Funcional |
| 13 | Mission Control | `/ops?tab=missions`, `/mission-command` | ✅ Funcional |
| 14 | Logistics Command | `/ops?tab=logistics`, `/logistics-command` | ✅ Funcional |
| 15 | Contracts Management | `/ops?tab=contracts`, `/vessel-contracts` | ✅ Funcional |
| 16 | Charter Party | `/charter-party` | ✅ Funcional |
| 17 | Cargo Management | `/cargo-management` | ✅ Funcional |
| 18 | Port Call Optimization | `/port-call` | ✅ Funcional |
| 19 | Vessel CTS | `/vessel-cts` | ✅ Funcional |
| 20 | Vessel History | `/vessel-history` | ✅ Funcional |
| 21 | Route Optimizer | `/route-optimizer` | ✅ Funcional |
| 22 | Bridge Link | `/bridge-link` | ✅ Funcional |

### C. 🔧 MAINTENANCE (`/maintenance`)
| # | Módulo | Rota | Status |
|---|--------|------|--------|
| 23 | Maintenance Hub | `/maintenance` | ✅ Funcional |
| 24 | Class Surveys (DNV) | `/maintenance?tab=surveys` | ✅ Funcional |
| 25 | Predictive Maintenance (ML) | `/maintenance?tab=predictive` | 🟡 UI OK, ML mock |
| 26 | Drydock Management | `/maintenance?tab=drydock`, `/drydock-management` | ✅ Funcional |
| 27 | Fuel & ROB | `/maintenance?tab=fuel`, `/fuel-management` | ✅ Funcional |
| 28 | Digital Twin | `/maintenance?tab=digital-twin`, `/digital-twin` | ✅ Funcional |
| 29 | MARPOL & Waste (e-GRB) | `/maintenance?tab=waste-marpol` | ✅ Funcional |
| 30 | ESG Emissions | `/maintenance?tab=esg`, `/esg-emissions` | ✅ Funcional |
| 31 | Maintenance Command | `/maintenance-command` | ✅ Funcional |

### D. 🤖 AI — Inteligência Artificial (`/ai`)
| # | Módulo | Rota | Status |
|---|--------|------|--------|
| 32 | AI Hub / Control Tower | `/ai` | ✅ Funcional |
| 33 | Chat & Assistants | `/ai?tab=chat` | ✅ Funcional |
| 34 | AI Agents (25+) | `/ai?tab=agents` | ✅ Funcional |
| 35 | Workflows AI | `/ai?tab=workflows`, `/workflow-command` | ✅ Funcional |
| 36 | Voice Assistant | `/ai?tab=voice`, `/voice-assistant` | 🟡 UI OK, TTS browser |
| 37 | 11 AI Modules Hub | `/ai?tab=modules`, `/ai-modules` | ✅ Funcional |
| 38 | RAG Assistant | `/ai?tab=rag`, `/enterprise/rag-assistant` | 🟡 UI OK, sem pipeline |
| 39 | OCR Center | `/enterprise/ocr-center` | 🟡 UI OK, sem processamento |
| 40 | AI Analytics | `/ai?tab=analytics`, `/ai-analytics` | ✅ Funcional |
| 41 | AI Observability | `/ai-observability` | ✅ Funcional |
| 42 | AI Audit Trail | `/ai-audit` | ✅ Funcional |
| 43 | AI Operations Center | `/ai-ops/logs` | ✅ Funcional |
| 44 | Revolutionary Features | `/revolutionary-features` | ✅ Funcional |
| 45 | Autonomous Command | `/autonomous-command` | ✅ Funcional |

#### 11 AI Modules (Sub-rotas)
| # | Módulo AI | Rota | Status |
|---|-----------|------|--------|
| 46 | Voyage Logistics AI | `/ai/voyage-logistics` | ✅ Funcional |
| 47 | Safety Incident AI | `/ai/safety-incident` | ✅ Funcional |
| 48 | Inventory & Spares AI | `/ai/inventory-spares` | ✅ Funcional |
| 49 | Compliance AI | `/compliance-ai` | ✅ Funcional |
| 50 | Environmental AI | `/environmental-ai` | ✅ Funcional |
| 51 | Quality Management AI | `/quality-ai` | ✅ Funcional |
| 52 | Contract & Legal AI | `/contract-legal-ai` | ✅ Funcional |
| 53 | Insurance Claims AI | `/insurance-claims-ai` | ✅ Funcional |
| 54 | Crewing & Payroll AI | `/crewing-payroll-ai` | ✅ Funcional |
| 55 | Reporting & Analytics AI | `/reporting-analytics-ai` | ✅ Funcional |
| 56 | Mobile & Offline AI | `/mobile-offline-ai` | ✅ Funcional |

### E. 📡 TRACKING (`/tracking`)
| # | Módulo | Rota | Status |
|---|--------|------|--------|
| 57 | Tracking Hub | `/tracking` | ✅ Funcional |
| 58 | Real-time Tracking | `/tracking?tab=realtime` | ✅ Funcional |
| 59 | AIS Fleet | `/tracking?tab=ais`, `/ais-tracker-page` | ✅ Funcional |
| 60 | SATCOM Dashboard | `/tracking?tab=satcom`, `/satcom-dashboard` | 🟡 UI OK, sem API |
| 61 | Weather AI | `/tracking?tab=weather`, `/weather-command` | 🟡 UI OK, API parcial |
| 62 | Alerts & Geofencing | `/tracking?tab=alerts` | ✅ Funcional |
| 63 | Predictive Telemetry | `/predictive-telemetry` | ✅ Funcional |
| 64 | Satellite Optimizer | `/satellite-optimizer` | ✅ Funcional |
| 65 | Telemetria Command | `/telemetria`, `/telemetria-command` | ✅ Funcional |

### F. 🛡️ COMPLIANCE (`/compliance`)
| # | Módulo | Rota | Status |
|---|--------|------|--------|
| 66 | Compliance Hub | `/compliance` | ✅ Funcional |
| 67 | Scorecard | `/compliance?tab=scorecard` | ✅ Funcional |
| 68 | 10 AI Audit Agents | `/audit-agents` | ✅ Funcional |
| 69 | Certificates Management | `/compliance?tab=certificates` | ✅ Funcional |
| 70 | Risk Matrix | `/risk-matrix` | ✅ Funcional |
| 71 | NCs & CAPAs | `/compliance?tab=ncs-capas` | ✅ Funcional |
| 72 | Regulations | `/regulations` | ✅ Funcional |
| 73 | Evidences | `/evidences` | ✅ Funcional |
| 74 | Due Diligence | `/due-diligence` | ✅ Funcional |
| 75 | Whistleblower | `/whistleblower` | ✅ Funcional |
| 76 | Security Center | `/security-center` | ✅ Funcional |
| 77 | Compliance Roadmap | `/compliance-roadmap` | ✅ Funcional |
| 78 | Executive Compliance | `/compliance-executive` | ✅ Funcional |
| 79 | Compliance ONE | `/compliance-one` | ✅ Funcional |
| 80 | GMUD | `/gmud` | ✅ Funcional |
| 81 | Responsibility Matrix | `/responsibility-matrix` | ✅ Funcional |
| 82 | Safety Human Factors | `/safety-human-factors` | ✅ Funcional |
| 83 | Safety Guardian | `/safety-guardian` | ✅ Funcional |

#### 12 Auditorias Marítimas Completas
| # | Auditoria | Rota | Standard | Status |
|---|-----------|------|----------|--------|
| 84 | PEO-DP | `/peo-dp` | IMCA M-117 | ✅ Funcional |
| 85 | PEOTRAM 13 Elementos | `/peotram` | ANP 13E | ✅ Funcional |
| 86 | ISM Code | `/safety-imca` | IMO SMS | ✅ Funcional |
| 87 | ISPS Security | `/isps-security` | SOLAS XI-2 | ✅ Funcional |
| 88 | SOLAS/LSA/FFE | `/solas-inspection` | IMO SOLAS III | ✅ Funcional |
| 89 | MARPOL I-VI | `/waste-management` | IMO MARPOL | ✅ Funcional |
| 90 | Pre-OVID | `/pre-ovid` | OCIMF | ✅ Funcional |
| 91 | Pre-MLC 2006 | `/mlc-inspection` | ILO MLC | ✅ Funcional |
| 92 | PSC Package | `/psc-package` | MoU | ✅ Funcional |
| 93 | SGSO ANP | `/sgso` | ANP 17P | ✅ Funcional |
| 94 | Pre-SIRE 2.0 | `/pre-sire` | OCIMF SIRE | ✅ Funcional |
| 95 | TMSA | `/tmsa-assessment` | OCIMF | ✅ Funcional |

### G. 📚 WORKBENCH (`/workbench`)
| # | Módulo | Rota | Status |
|---|--------|------|--------|
| 96 | Documents Hub | `/workbench?section=docs` | ✅ Funcional |
| 97 | People Hub | `/workbench?section=people` | ✅ Funcional |
| 98 | Finance Hub | `/workbench?section=finance` | ✅ Funcional |
| 99 | Travel Command | `/workbench?section=travel`, `/travel-command` | ✅ Funcional |
| 100 | System Hub | `/workbench?section=system` | ✅ Funcional |
| 101 | Dev Tools | `/workbench?section=system&view=dev` | ✅ Funcional |

#### Documents Sub-módulos
| # | Módulo | Rota | Status |
|---|--------|------|--------|
| 102 | Documents | `/documents` | ✅ Funcional |
| 103 | Reports Command | `/reports-command`, `/reports` | ✅ Funcional |
| 104 | Templates | `/templates` | ✅ Funcional |
| 105 | Document Workflow | `/document-workflow` | ✅ Funcional |
| 106 | Export Center | `/export-center` | ✅ Funcional |
| 107 | Advanced Search | `/advanced-search` | ✅ Funcional |
| 108 | Knowledge Hub | `/knowledge-hub` | ✅ Funcional |

#### People Sub-módulos
| # | Módulo | Rota | Status |
|---|--------|------|--------|
| 109 | People Hub | `/people-hub` | ✅ Funcional |
| 110 | HR Dashboard | `/hr-dashboard` | ✅ Funcional |
| 111 | Employee Portal | `/employee-portal` | ✅ Funcional |
| 112 | Payroll | `/payroll` | ✅ Funcional |
| 113 | Time Tracking | `/time-tracking` | ✅ Funcional |
| 114 | People Analytics | `/people-analytics` | ✅ Funcional |
| 115 | Crew Wellness | `/crew-wellness` | ✅ Funcional |
| 116 | Medical Infirmary | `/medical-infirmary` | ✅ Funcional |
| 117 | Recruitment | `/recruitment` | ✅ Funcional |
| 118 | Users Management | `/users` | ✅ Funcional |
| 119 | STCW/MLC Compliance | `/stcw-mlc` | ✅ Funcional |
| 120 | Crew Scheduler | `/crew-scheduler` | ✅ Funcional |
| 121 | HR Chatbot AI | `/hr-chatbot` | ✅ Funcional |
| 122 | HR Document OCR | `/hr-ocr` | ✅ Funcional |
| 123 | HR Turnover Prediction | `/hr-turnover` | ✅ Funcional |

#### Finance Sub-módulos
| # | Módulo | Rota | Status |
|---|--------|------|--------|
| 124 | Finance Command | `/finance-command` | ✅ Funcional |
| 125 | Finance Hub | `/finance-hub` | ✅ Funcional |
| 126 | Voyage P&L | `/voyage-pnl` | ✅ Funcional |
| 127 | Voyage Accounting | `/voyage-accounting` | ✅ Funcional |
| 128 | Procurement Command | `/procurement-command` | ✅ Funcional |
| 129 | Supplier Portal | `/supplier-portal` | ✅ Funcional |
| 130 | Company Financials | `/company-financials` | ✅ Funcional |
| 131 | Finance AI | `/finance-ai` | ✅ Funcional |

#### System Sub-módulos
| # | Módulo | Rota | Status |
|---|--------|------|--------|
| 132 | System Hub | `/system-hub` | ✅ Funcional |
| 133 | Settings | `/settings` | ✅ Funcional |
| 134 | Security Settings | `/settings/security` | ✅ Funcional |
| 135 | Integrations Center | `/integrations` | ✅ Funcional |
| 136 | API Gateway | `/api-gateway` | ✅ Funcional |
| 137 | API Center | `/integracoes/api-center` | ✅ Funcional |
| 138 | API Monitor | `/integracoes/api-monitor` | ✅ Funcional |
| 139 | IoT Dashboard | `/iot-dashboard`, `/iot` | ✅ Funcional |
| 140 | Quality Dashboard | `/quality-dashboard` | ✅ Funcional |
| 141 | Gamification | `/gamification` | ✅ Funcional |
| 142 | Roadmap | `/roadmap` | ✅ Funcional |
| 143 | Collaboration | `/collaboration` | ✅ Funcional |
| 144 | Dev Routes | `/dev-routes` | ✅ Funcional |
| 145 | Production Deploy | `/production-deploy` | ✅ Funcional |
| 146 | Admin SaaS | `/admin` | ✅ Funcional |

### H. 🏢 ENTERPRISE INTELLIGENCE SUITE
| # | Módulo | Rota | Status |
|---|--------|------|--------|
| 147 | RAG Assistant | `/enterprise/rag-assistant` | 🟡 UI OK |
| 148 | OCR Center | `/enterprise/ocr-center` | 🟡 UI OK |
| 149 | Forms Builder | `/enterprise/forms-builder` | ✅ Funcional |
| 150 | Checklists Builder | `/enterprise/checklists-builder` | ✅ Funcional |
| 151 | OCIMF Assessment | `/enterprise/ocimf-assessment` | ✅ Funcional |
| 152 | TMSA Analytics | `/enterprise/tmsa-analytics` | ✅ Funcional |
| 153 | Fatigue Risk | `/enterprise/fatigue-risk` | ✅ Funcional |
| 154 | MLC Work Hours | `/enterprise/mlc-hours` | ✅ Funcional |
| 155 | Crew Matching | `/enterprise/crew-matching` | ✅ Funcional |
| 156 | Contract Analysis | `/enterprise/contract-analysis` | ✅ Funcional |
| 157 | Risk Clauses | `/enterprise/risk-clauses` | ✅ Funcional |
| 158 | Compliance Predictor | `/enterprise/compliance-predictor` | ✅ Funcional |
| 159 | NC Prediction | `/enterprise/nc-prediction` | ✅ Funcional |

### I. 🚀 ADVANCED MARITIME MODULES
| # | Módulo | Rota | Status |
|---|--------|------|--------|
| 160 | Digital Twin 3D | `/advanced/digital-twin-3d` | ✅ Funcional |
| 161 | Weather Intelligence | `/advanced/weather-intelligence` | 🟡 Parcial |
| 162 | Bunker Optimization | `/advanced/bunker-optimization` | 🟡 Parcial |
| 163 | Cargo Planning | `/advanced/cargo-planning` | ✅ Funcional |
| 164 | PSC Readiness | `/advanced/psc-readiness` | ✅ Funcional |
| 165 | MARPOL Tracker | `/advanced/marpol-tracker` | ✅ Funcional |
| 166 | Blockchain Certificates | `/advanced/blockchain-certificates` | ✅ Funcional |
| 167 | Incident Investigation | `/advanced/incident-investigation` | ✅ Funcional |
| 168 | VR Training | `/advanced/vr-training` | 🟡 UI OK |
| 169 | Voice Commands | `/advanced/voice-commands` | 🟡 UI OK |
| 170 | Crew Wellness AI | `/advanced/crew-wellness-ai` | ✅ Funcional |
| 171 | Executive Dashboard | `/advanced/executive-dashboard` | ✅ Funcional |

### J. 🔴 MÓDULOS SUPRIMIDOS (Comentados no App.tsx)
| # | Módulo | Rota Original | Status |
|---|--------|---------------|--------|
| 172 | Ocean Sonar | `/ocean-sonar` | ❌ SUPRIMIDO |
| 173 | Underwater Drone | `/underwater-drone` | ❌ SUPRIMIDO |
| 174 | AutoSub | `/auto-sub` | ❌ SUPRIMIDO |
| 175 | Sonar AI | `/sonar-ai` | ❌ SUPRIMIDO |
| 176 | Deep Risk AI | `/deep-risk-ai` | ❌ SUPRIMIDO |

---

## 2️⃣ INVENTÁRIO DE ROTAS

### Total de Rotas Registradas
| Categoria | Quantidade |
|-----------|------------|
| Rotas canônicas (7 Mega-Hubs) | 14 |
| Rotas diretas de módulos | ~180 |
| Rotas legadas (redirects) | 180+ |
| Rotas enterprise | 13 |
| Rotas advanced | 12 |
| Rotas AI modules | 11 |
| Rotas suprimidas | 5 |
| **TOTAL** | **~415** |

### Rotas Públicas
| Rota | Componente |
|------|-----------|
| `/auth` | Auth (Login/Cadastro) |
| `/auth/callback` | AuthCallback |
| `/landing` | LandingPage |
| `/pricing` | LandingPage |
| `/status` | StatusPage |

---

## 3️⃣ INVENTÁRIO DE TABELAS SUPABASE

**Total: 767+ tabelas** (ver query `pg_tables`)

### Tabelas Core com Dados Reais
| Tabela | Registros | Uso |
|--------|-----------|-----|
| `vessels` | 9 | Gestão de frota |
| `crew_members` | 4 | Gestão de tripulação |
| `agent_registry` | 25 | Agentes de IA |
| `telemetry_alerts` | 4 | Alertas de telemetria |
| `certificates` | 3 | Certificados marítimos |

### Tabelas Core Vazias (Precisam de Seed Data)
`maintenance_records`, `internal_audits`, `suppliers`, `documents`, `inventory_items`, `rfq_requests`, `non_conformities`, `voyage_plans`, `fuel_records`, `emissions_records`, `waste_records`, `ai_chat_messages`, `ai_decisions`, `ai_insights`, `cii_ratings`, `class_surveys`, `navigation_history`

---

## 4️⃣ INVENTÁRIO DE EDGE FUNCTIONS

**Total: 300+ Edge Functions definidas em `supabase/functions/`**

### Categorias Principais
| Categoria | Exemplos | Qtd Aprox |
|-----------|----------|-----------|
| AI & Chat | `ai-chat`, `ai-hub-chat`, `ai-hub-voice`, `ai-copilot-stream` | ~40 |
| Crew Management | `create-crew`, `update-crew`, `crew-ai-analysis` | ~20 |
| Compliance & Audits | `peodp-ai-chat`, `peotram-ai-chat`, `sgso-assistant` | ~25 |
| Maintenance | `create-maintenance-task`, `predictive-maintenance-alert` | ~15 |
| Voyage & Operations | `create-voyage`, `voyage-risk-assessment` | ~15 |
| Finance & Procurement | `create-invoice`, `procurement-management` | ~10 |
| Weather & Tracking | `weather-integration`, `ais-tracking`, `fleet-tracking` | ~10 |
| Documents | `document-ocr`, `summarize-document`, `generate-document` | ~10 |
| System & Security | `health-check`, `security-audit`, `api-gateway` | ~15 |
| Notifications | `send-email-notification`, `send-push-notification` | ~20 |
| HR & People | `hr-chatbot-ai`, `hr-turnover-prediction`, `cv-parser` | ~15 |
| Analytics | `dashboard-analytics`, `track-analytics` | ~10 |
| Voice | `eleven-labs-voice`, `speech-to-text`, `text-to-speech` | ~8 |
| IoT & Sensors | `iot-sensor-processing`, `iot-anomaly-cron` | ~5 |
| Blockchain | `blockchain-compliance`, `certificate-blockchain` | ~3 |
| Outros | `generate-quiz`, `gamification`, `backup`, etc | ~80+ |

---

## 5️⃣ INVENTÁRIO DE COMPONENTES

### Diretórios de Componentes: 130+
Principais: `ui/`, `premium/`, `enterprise/`, `world-class/`, `design-system/`, `ai/`, `operations/`, `maintenance/`, `compliance/`, `tracking/`, `documents/`, `crew/`, `finance/`, `fleet/`, `safety/`, `weather/`, `voice/`

### Componentes Core UX
| Componente | Arquivo | Função |
|-----------|---------|--------|
| PageShell | `ui/PageShell.tsx` | Wrapper padronizado de páginas |
| ConfirmDialog | `ui/ConfirmDialog.tsx` | Modal de confirmação |
| DataTable | `ui/DataTable.tsx` | Tabela com sort/pagination |
| StatusPipeline | `ui/StatusPipeline.tsx` | Pipeline visual de workflow |
| BulkActionsBar | `ui/BulkActionsBar.tsx` | Ações em lote |
| UXStates | `ui/UXStates.tsx` | Loading/Error/Empty/Success states |
| CommandPalette | `CommandPalette.tsx` | Busca global (Ctrl+K) |

---

## 6️⃣ INVENTÁRIO DE HOOKS

**Total: 350+ hooks customizados**

### Hooks CRUD Principais
| Hook | Tabelas | Funcionalidades |
|------|---------|-----------------|
| `useClassSurveys` | vessels | CRUD, Export CSV |
| `useFleetOperations` | vessels | KPIs, Export, Status |
| `useExecutiveKPIs` | vessels, incidents | Financial, Safety, ESG |
| `useFleetTracking` | vessels | Realtime, Signal Quality |
| `useAlertsRealData` | telemetry_alerts | CRUD, Real-time |
| `useProcurementCRUD` | suppliers, inventory | Full CRUD, Export |
| `useComplianceCRUD` | audits, NCs, certs | Full CRUD, Export |
| `useMaritimeAuditsCRUD` | 6 audit tables | 12 Audits CRUD |

---

## 7️⃣ RESUMO QUANTITATIVO

| Métrica | Valor |
|---------|-------|
| **Módulos totais** | 176 (171 ativos + 5 suprimidos) |
| **Rotas registradas** | ~415 |
| **Mega-Hubs** | 7 |
| **Auditorias Marítimas** | 12/12 |
| **Agentes IA** | 25 registrados, 10 de auditoria |
| **AI Modules** | 11 |
| **Enterprise Modules** | 13 |
| **Advanced Modules** | 12 |
| **Edge Functions** | 300+ |
| **Tabelas Supabase** | 767+ |
| **Hooks customizados** | 350+ |
| **Páginas React** | 230+ |
| **Legacy redirects** | 180+ |

---

*Inventário gerado automaticamente — NAUTI ONE v8.0*
*Data: 2026-02-06*
