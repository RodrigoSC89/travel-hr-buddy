# 📦 MODULE INVENTORY - NAUTI ONE
> **ETAPA 0 - PROMPT MASTER V4.1**
> Data: Janeiro 2026

---

## 📊 RESUMO EXECUTIVO

| Métrica | Valor |
|---------|-------|
| **Total de Grupos no Sidebar** | 16 |
| **Total de Módulos no Sidebar** | 134+ |
| **Módulos com Mock Data** | 50+ |
| **Módulos 100% Integrados** | ~60 |
| **Rotas Únicas** | 134+ |

---

## 🗂️ MAPA COMPLETO DE MÓDULOS POR GRUPO

### 1️⃣ 🧠 Central de Comando (9 módulos)

| Módulo | Path | Status | Backend | Tabelas |
|--------|------|--------|---------|---------|
| Visão Geral | `/central-comando/visao-geral` | ✅ Real | Supabase | vessels, crew_members |
| Operações | `/central-comando/operacoes` | ✅ Real | Supabase | mission_logs |
| Executivo | `/central-comando/executivo` | ✅ Real | Supabase | analytics |
| IA Central | `/central-comando/ia` | ✅ Real | Edge Fn | ai_decisions |
| Resiliência | `/central-comando/resiliencia` | ⚠️ Parcial | Supabase | system_health |
| Alertas | `/central-comando/alertas` | ✅ Real | Supabase | soc_alerts |
| NOC 24/7 | `/noc` | ✅ Real | Supabase | vessels, alerts |
| NOC Monitoring | `/noc-monitoring` | ✅ Real | Supabase | system_logs |
| SOC Dashboard | `/soc` | ✅ Real | Supabase | soc_alerts |

---

### 2️⃣ 🚢 Operações Marítimas (15 módulos)

| Módulo | Path | Status | Backend | Mock Data |
|--------|------|--------|---------|-----------|
| Maritime Command | `/maritime-command` | ✅ Real | Supabase | ❌ |
| Fleet Command Center | `/fleet-command` | ✅ Real | Supabase | ❌ |
| Voyage Command | `/voyage-command` | ⚠️ Parcial | Supabase | ⚠️ DEFAULT_PORTS |
| Otimização de Rotas AI | `/route-optimizer` | ⚠️ Parcial | Edge Fn | ⚠️ |
| Mission Command | `/mission-command` | ✅ Real | Supabase | ❌ |
| Bridge Link | `/bridge-link` | 🔴 Mock | - | 🔴 100% |
| Drydock Management | `/drydock-management` | ⚠️ Parcial | Supabase | ⚠️ |
| Contratos de Embarcação | `/vessel-contracts` | ✅ Real | Supabase | ❌ |
| Charter Party | `/charter-party` | ✅ Real | Supabase | ❌ |
| Cargo Management | `/cargo-management` | 🔴 Mock | - | 🔴 getMockCargo |
| Port Call | `/port-call` | 🔴 Mock | - | 🔴 getMockPortCalls |
| CTS Tripulação | `/vessel-cts` | ✅ Real | Supabase | ❌ |
| Histórico de Embarcação | `/vessel-history` | ✅ Real | Supabase | ❌ |
| Digital Twin | `/digital-twin` | ⚠️ Parcial | IoT | ⚠️ |
| Logistics Command | `/logistics-command` | 🔴 Mock | - | 🔴 100% Mock |

---

### 3️⃣ 🔧 Manutenção (7 módulos)

| Módulo | Path | Status | Backend |
|--------|------|--------|---------|
| Central de Manutenção | `/maintenance-command` | ✅ Real | Supabase |
| Manutenção Preditiva ML | `/predictive-maintenance` | ✅ Real | Supabase + ML |
| Saúde da Frota | `/maintenance-command?tab=health` | ✅ Real | Supabase |
| IA Copilot | `/maintenance-command?tab=copilot` | ✅ Real | Edge Fn |
| Jobs & Ordens | `/maintenance-command?tab=jobs` | ✅ Real | Supabase |
| Forecast IA | `/maintenance-command?tab=forecast` | ✅ Real | Edge Fn |
| Digital Twin 3D | `/maintenance-command?tab=twin` | ⚠️ Parcial | IoT |

---

### 4️⃣ 🧠 IA & Automação (14 módulos)

| Módulo | Path | Status | Mock Data |
|--------|------|--------|-----------|
| AI Modules Hub | `/ai-modules-hub` | ✅ Real | ❌ |
| AI Hub Central | `/ai-hub` | ✅ Real | ❌ |
| AI Analytics | `/ai-analytics` | 🔴 Mock | 🔴 AIAnalyticsDashboard.tsx |
| Features Revolucionárias | `/revolutionary-features` | ⚠️ Parcial | ⚠️ |
| Autonomous Command | `/autonomous-command` | ✅ Real | ❌ |
| Agent Orchestration | `/agent-orchestration` | ⚠️ Parcial | ⚠️ |
| AI Command Center | `/ai-command` | ✅ Real | ❌ |
| IA Autônoma (Logs) | `/ai-ops/logs` | ✅ Real | ❌ |
| Observabilidade IA | `/ai-observability` | ⚠️ Parcial | ⚠️ ObservabilityCenter.tsx |
| Workflow Command | `/workflow-command` | ✅ Real | ❌ |
| Journaling IA | `/ai-journaling` | ✅ Real | ❌ |
| Auditoria de IA | `/ai-audit` | ✅ Real | ❌ |
| Voice Assistant IA | `/voice-assistant` | ✅ Real | ❌ |
| Assistente de Voz | `/assistant/voice` | ✅ Real | ❌ |

---

### 5️⃣ 🤖 AI Enterprise Engines (12 módulos)

| Módulo | Path | Status | Edge Function |
|--------|------|--------|---------------|
| Voyage & Logistics AI | `/ai/voyage-logistics` | ✅ Real | voyage-logistics-ai |
| Safety & Incident AI | `/ai/safety-incident` | ✅ Real | safety-incident-ai |
| Inventory & Spares AI | `/ai/inventory-spares` | ✅ Real | inventory-spares-ai |
| Finance & Procurement AI | `/finance-procurement-ai` | ✅ Real | finance-procurement-ai |
| Compliance AI | `/compliance-ai` | ✅ Real | compliance-ai |
| Environmental AI | `/environmental-ai` | ✅ Real | environmental-ai |
| Quality Management AI | `/quality-ai` | ✅ Real | quality-management-ai |
| Contract & Legal AI | `/contract-legal-ai` | ✅ Real | contract-legal-ai |
| Insurance & Claims AI | `/insurance-claims-ai` | ✅ Real | insurance-claims-ai |
| Crewing & Payroll AI | `/crewing-payroll-ai` | ✅ Real | crewing-payroll-ai |
| Reporting & Analytics AI | `/reporting-analytics-ai` | ✅ Real | reporting-analytics-ai |
| Mobile & Offline AI | `/mobile-offline-ai` | ⚠️ Parcial | mobile-offline-ai |

---

### 6️⃣ 🔬 Inteligência Avançada (7 módulos)

| Módulo | Path | Status |
|--------|------|--------|
| Otimização Unificada | `/optimization-dashboard` | ⚠️ Parcial |
| OPEC - Otimizador Energético | `/intelligence/opec` | ⚠️ Parcial |
| SAWP - Wellness Preditivo | `/intelligence/wellness` | ⚠️ Parcial |
| CIDM - Central Documentos | `/intelligence/documents` | ⚠️ Parcial |
| CIAI - Inteligência Acidentes | `/intelligence/accidents` | ⚠️ Parcial |
| GDCB - Blockchain Governance | `/intelligence/blockchain` | ⚠️ Parcial |
| ICFT - Intel. Competitiva | `/intelligence/competitive` | ⚠️ Parcial |

---

### 7️⃣ 🏢 Enterprise Intelligence (16 módulos)

| Módulo | Path | Status | Mock Data |
|--------|------|--------|-----------|
| Knowledge Hub IA | `/knowledge-hub` | ✅ Real | ❌ |
| RAG Chatbot | `/enterprise/rag-assistant` | ✅ Real | ❌ |
| OCR Multi-Engine | `/enterprise/ocr-center` | ⚠️ Parcial | ⚠️ OCRCenterPage.tsx |
| Document Processor | `/enterprise/document-processor` | ✅ Real | ❌ |
| Forms Builder | `/enterprise/forms-builder` | ⚠️ Parcial | ⚠️ |
| Checklists Builder | `/enterprise/checklists-builder` | ⚠️ Parcial | ⚠️ |
| OCIMF OVMSA | `/enterprise/ocimf-assessment` | ⚠️ Parcial | ⚠️ |
| TMSA Analytics | `/enterprise/tmsa-analytics` | ⚠️ Parcial | ⚠️ |
| Fatigue Risk Predictor | `/enterprise/fatigue-risk` | ⚠️ Parcial | ⚠️ |
| MLC Work Hours | `/enterprise/mlc-hours` | ✅ Real | ❌ |
| Crew Matching AI | `/enterprise/crew-matching` | ⚠️ Parcial | ⚠️ |
| Talent Pool | `/enterprise/talent-pool` | ⚠️ Parcial | ⚠️ |
| Contract Analysis AI | `/enterprise/contract-analysis` | ⚠️ Parcial | ⚠️ ContractAnalysisPage.tsx |
| Risk Clause Detector | `/enterprise/risk-clauses` | ⚠️ Parcial | ⚠️ |
| Compliance Predictor | `/enterprise/compliance-predictor` | ⚠️ Parcial | ⚠️ |
| NC Prediction | `/enterprise/nc-prediction` | ⚠️ Parcial | ⚠️ |

---

### 8️⃣ 🚀 Módulos Avançados (12 módulos)

| Módulo | Path | Status |
|--------|------|--------|
| Digital Twin 3D | `/advanced/digital-twin-3d` | ⚠️ Parcial |
| Weather Intelligence | `/advanced/weather-intelligence` | ✅ Real |
| Bunker Optimization | `/advanced/bunker-optimization` | ✅ Real |
| Cargo Planning AI | `/advanced/cargo-planning` | ⚠️ Parcial |
| PSC Readiness AI | `/advanced/psc-readiness` | ⚠️ Parcial |
| MARPOL Tracker | `/advanced/marpol-tracker` | ⚠️ Parcial |
| Blockchain Certificates | `/advanced/blockchain-certificates` | ⚠️ Parcial |
| Incident Investigation AI | `/advanced/incident-investigation` | ⚠️ Parcial |
| VR/AR Training | `/advanced/vr-training` | 🔴 Mock |
| ARIA Voice Commands | `/advanced/voice-commands` | ✅ Real |
| Crew Wellness AI | `/advanced/crew-wellness-ai` | ✅ Real |
| Executive Dashboard | `/advanced/executive-dashboard` | ✅ Real |

---

### 9️⃣ 📊 Telemetria & Monitoramento (9 módulos)

| Módulo | Path | Status |
|--------|------|--------|
| Telemetria 360° | `/telemetria` | ✅ Real |
| Telemetria Preditiva | `/predictive-telemetry` | ✅ Real |
| Otimização Satélite | `/satellite-optimizer` | ⚠️ Parcial |
| DGNSS Tracking | `/tracking` | ✅ Real |
| GNSS Live | `/tracking/gnss-live` | ✅ Real |
| Tracking Alerts | `/tracking/alerts` | ✅ Real |
| Simulador Incidentes | `/simulador` | ⚠️ Parcial |
| Modo Emergência | `/emergency-mode` | ⚠️ Parcial |
| Calendário Operacional | `/operational-calendar` | ✅ Real |

---

### 🔟 🌐 APIs & Integrações (11 módulos)

| Módulo | Path | Status |
|--------|------|--------|
| API Center | `/integracoes/api-center` | ✅ Real |
| API Monitor | `/integracoes/api-monitor` | ✅ Real |
| Central Integrações | `/integracoes` | ⚠️ Parcial |
| Clima Marítimo | `/weather-maritime` | ✅ Real |
| AIS Tracker | `/ais-tracker-page` | ✅ Real |
| Port API | `/port-api` | ✅ Real |
| Flight Tracker | `/flight-tracker` | ✅ Real |
| NOAA Weather | `/noaa-weather` | ✅ Real |
| OpenSky Flights | `/opensky-flights` | ✅ Real |
| Earthquake Monitor | `/earthquake-monitor` | ✅ Real |
| IA de Voz | `/voice-transcriber` | ✅ Real |

---

### 1️⃣1️⃣ 📁 Relatórios & Documentos (8 módulos)

| Módulo | Path | Status |
|--------|------|--------|
| Reports Command | `/reports-command` | ✅ Real |
| Documentos IA | `/documents` | ✅ Real |
| Templates | `/templates` | ⚠️ Parcial |
| Checklists Inteligentes | `/admin/checklists` | ⚠️ Parcial |
| Workflow Documentos ISM/MLC | `/document-workflow` | ✅ Real |
| Centro de Exportação | `/export-center` | ✅ Real |
| Busca Avançada | `/advanced-search` | ✅ Real |
| Knowledge Hub IA | `/knowledge-hub` | ✅ Real |

---

### 1️⃣2️⃣ 📢 Comunicação & Alertas (4 módulos)

| Módulo | Path | Status | Mock Data |
|--------|------|--------|-----------|
| Communication Command | `/communication-command` | 🔴 Mock | 🔴 CommunicationCommandCenter.tsx |
| Alerts Command | `/alerts-command` | ✅ Real | ❌ |
| Conectividade Marítima | `/maritime-connectivity` | ⚠️ Parcial | ⚠️ |
| Workspace em Tempo Real | `/real-time-workspace` | 🔴 Mock | 🔴 RealTimeWorkspaceProfessional.tsx |

---

### 1️⃣3️⃣ 🔍 Auditorias (29 módulos)

| Módulo | Path | Status |
|--------|------|--------|
| Alertas Certificados | `/diagnostic-certificates` | ✅ Real |
| Dashboard Compliance | `/diagnostic-dashboard` | ✅ Real |
| Repositório Docs | `/diagnostic-documents` | ✅ Real |
| Workflow NCs | `/diagnostic-ncs` | ✅ Real |
| Relatórios Auto | `/diagnostic-reports` | ✅ Real |
| Dashboard Executivo | `/compliance-executive` | ✅ Real |
| Compliance Avançado | `/compliance-roadmap` | ⚠️ Parcial |
| Audit AI Chat | `/audit-ai-chat` | ✅ Real |
| PEO-DP | `/peo-dp` | ✅ Real |
| PEOTRAM | `/peotram` | ✅ Real |
| SGSO | `/sgso` | ✅ Real |
| IMCA Audit | `/imca-audit` | ✅ Real |
| Pre-OVID Inspection | `/pre-ovid` | ✅ Real |
| MLC Inspection | `/mlc-inspection` | ✅ Real |
| Gerador Pacotes PSC | `/psc-package` | ✅ Real |
| GMUD | `/gmud` | ✅ Real |
| Matriz de Responsabilidades | `/responsibility-matrix` | ✅ Real |
| Safety Human Factors | `/safety-human-factors` | ⚠️ Parcial |
| Safety IMCA | `/safety-imca` | ✅ Real |
| ISPS Security & Cyber | `/isps-security` | ✅ Real |
| Drill Simulator | `/drill-simulator` | ⚠️ Parcial |
| Compliance One | `/compliance-one` | ✅ Real |
| Regulamentos | `/regulations` | ✅ Real |
| Matriz de Riscos | `/risk-matrix` | ✅ Real |
| Evidências | `/evidences` | ✅ Real |
| Due Diligence | `/due-diligence` | ✅ Real |
| Canal de Denúncias | `/whistleblower` | ⚠️ Parcial |
| Security Center | `/security-center` | ⚠️ Parcial |
| Compliance Hub | `/compliance-hub` | ✅ Real |

---

### 1️⃣4️⃣ 👥 RH & Pessoas (11 módulos)

| Módulo | Path | Status | Mock Data |
|--------|------|--------|-----------|
| HR Dashboard | `/hr-dashboard` | ✅ Real | ❌ |
| People Analytics | `/people-analytics` | ✅ Real | ❌ |
| Portal Colaborador | `/employee-portal` | ✅ Real | ❌ |
| Nauti People Hub | `/nautilus-people` | ⚠️ Parcial | ⚠️ nauti-people/* |
| Gestão de Tripulação | `/crew-management` | ✅ Real | ❌ |
| Bem-estar AI | `/crew-wellness` | ✅ Real | ❌ |
| Bem-estar Tripulação | `/crew-wellbeing` | ✅ Real | ❌ |
| Enfermaria Digital | `/medical-infirmary` | ⚠️ Parcial | ⚠️ medical-infirmary/* |
| Gestão de Usuários | `/users` | ✅ Real | ❌ |
| Recrutamento AI | `/recruitment` | ⚠️ Parcial | ⚠️ |
| MLC Scheduling | `/mlc-scheduling` | ✅ Real | ❌ |

---

### 1️⃣5️⃣ 🤖 RH & IA (5 módulos)

| Módulo | Path | Status |
|--------|------|--------|
| Chatbot RH 24/7 | `/hr-chatbot` | ⚠️ Parcial |
| OCR Documentos | `/hr-ocr` | ⚠️ Parcial |
| Predição Turnover | `/hr-turnover` | ⚠️ Parcial |
| Folha de Pagamento | `/hr-payroll` | ⚠️ Parcial |
| Ponto Eletrônico | `/hr-time-tracking` | ✅ Real |

---

### 1️⃣6️⃣ 🎓 Treinamentos (4 módulos)

| Módulo | Path | Status |
|--------|------|--------|
| Nauti Academy | `/nautilus-academy` | ✅ Real |
| SOLAS, ISPS & ISM Training | `/solas-isps-training` | ✅ Real |
| Mentor DP | `/mentor-dp` | ✅ Real |
| DP Intelligence | `/dp-intelligence` | ✅ Real |

---

### 1️⃣7️⃣ 💰 Finanças & Procurement (9 módulos)

| Módulo | Path | Status | Mock Data |
|--------|------|--------|-----------|
| Finance Command | `/finance-command` | ✅ Real | ❌ |
| Voyage Accounting | `/voyage-accounting` | ✅ Real | ❌ |
| Analytics Command | `/analytics-command` | ✅ Real | ❌ |
| Operations Command | `/operations-command` | ✅ Real | ❌ |
| Procurement Command | `/procurement-command` | ⚠️ Parcial | ⚠️ ProcurementCommandCenter.tsx |
| Gestão de Tarefas | `/task-management` | ✅ Real | ❌ |
| Supplier Portal | `/supplier-portal` | ⚠️ Parcial | ⚠️ |
| Company Financials | `/company-financials` | ✅ Real | ❌ |
| Blockchain Compliance | `/blockchain-compliance` | ⚠️ Parcial | ⚠️ |

---

### 1️⃣8️⃣ 🌱 ESG & Sustentabilidade (3 módulos)

| Módulo | Path | Status |
|--------|------|--------|
| ESG & Emissões | `/esg-emissions` | ✅ Real |
| Gestão de Resíduos | `/waste-management` | ⚠️ Parcial |
| Sustainability Score | `/sustainability-score` | ⚠️ Parcial |

---

### 1️⃣9️⃣ ✈️ Viagens & Logística (2 módulos)

| Módulo | Path | Status |
|--------|------|--------|
| Travel Command | `/travel-command` | ✅ Real |
| Weather Command | `/weather-command` | ✅ Real |

---

### 2️⃣0️⃣ ⚙️ Sistema & Configurações (14 módulos)

| Módulo | Path | Status |
|--------|------|--------|
| Configurações | `/settings` | ✅ Real |
| Hub de Integrações | `/integrations` | ⚠️ Parcial |
| API Gateway | `/api-gateway` | ✅ Real |
| Colaboração | `/collaboration` | ⚠️ Parcial |
| IoT Dashboard | `/iot` | ✅ Real |
| IoT Sensors Real-time | `/iot-dashboard` | ✅ Real |
| Gamificação | `/gamification` | ⚠️ Parcial |
| Onboarding | `/onboarding` | ✅ Real |
| Analytics & Feedback | `/analytics-feedback` | ⚠️ Parcial |
| Billing Portal | `/billing-portal` | ✅ Real |
| Roadmap v3.2 | `/roadmap` | ✅ Real |
| QA Preview | `/qa/preview` | ✅ Real |
| Production Deploy | `/production-deploy` | ✅ Real |

---

## 📊 ESTATÍSTICAS FINAIS

```
TOTAL DE MÓDULOS: 134+

✅ REAL (Integrado com Supabase): ~75 (56%)
⚠️ PARCIAL (Mock em parte): ~45 (34%)
🔴 MOCK (100% Mock): ~14 (10%)
```

---

## 🎯 PRÓXIMO PASSO

➡️ ETAPA 1: Gerar `VITRINE_MODULES.md` com lista detalhada dos módulos com mock data.

---

*Documento gerado em Janeiro 2026 - ETAPA 0 Completa*
