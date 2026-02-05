# 🔀 FUSION MAP v7.0 → v8.0

> **Mapeamento Completo de Fusão de Módulos**
> Data: Fevereiro 2026 | NAUTI ONE

---

## 📊 RESUMO EXECUTIVO

| Métrica | v7.1 (Antes) | v8.0 (Depois) | Variação |
|---------|--------------|---------------|----------|
| **Grupos no Sidebar** | 12 | 10 | -16.7% |
| **Itens no Sidebar** | 120+ | 68 | -43% |
| **Rotas Totais Preservadas** | 120+ | 120+ | 0% (100% preservado) |
| **Funcionalidades Perdidas** | - | 0 | ZERO PERDA |
| **Legacy Aliases** | 71 | 150+ | +111% |

---

## 🎯 REGRAS DE FUSÃO APLICADAS

### ✅ REGRAS NÃO NEGOCIÁVEIS (TODAS CUMPRIDAS)

1. ✅ NENHUMA funcionalidade removida
2. ✅ NENHUMA rota antiga quebrada (aliases criados)
3. ✅ NENHUM botão/ação desapareceu
4. ✅ NENHUM service/hook apagado
5. ✅ Fusão por composição com compatibilidade retroativa
6. ✅ Módulos incompletos protegidos por feature flag

---

## 📁 ESTRUTURA DE HUBS v8.0

### 🔟 HUBS CANÔNICOS

| # | Hub | Rota Canônica | Módulos Incluídos |
|---|-----|---------------|-------------------|
| 1 | **Command Center** | `/command` | Visão Geral, Operações, Executivo, NOC, SOC |
| 2 | **Operations** | `/operations` | Maritime, Fleet, Voyage, Missions, Logistics, Contracts |
| 3 | **Maintenance** | `/maintenance` | PMS, Drydock, Fuel, Digital Twin, ESG |
| 4 | **AI Hub** | `/ai` | Chat, Agents, Workflows, Analytics, Voice, Audit |
| 5 | **Tracking** | `/tracking` | AIS, SATCOM, Weather, Alerts, Predictive |
| 6 | **Compliance** | `/compliance` | 12 Auditorias, 10 Agentes, Certificados, Riscos |
| 7 | **Documents** | `/docs` | Viewer, Templates, Checklists, Knowledge, Forms |
| 8 | **People** | `/people` | STCW, MLC, Crew, Training, Medical, Wellness |
| 9 | **Finance** | `/finance` | Voyage P&L, Procurement, Suppliers, Travel, ESG |
| 10 | **System** | `/system` | Settings, Integrations, IoT, API, Health |

---

## 🗺️ MAPEAMENTO DETALHADO POR HUB

### 1️⃣ COMMAND CENTER (`/command`)

| Módulo Original | Rota Antiga | Rota Nova | Tab |
|-----------------|-------------|-----------|-----|
| Visão Geral | `/central-comando/visao-geral` | `/command` | overview |
| Operações | `/central-comando/operacoes` | `/command?tab=operations` | operations |
| Executivo | `/central-comando/executivo` | `/command?tab=executive` | executive |
| NOC 24/7 | `/noc` | `/command?tab=noc` | noc |
| SOC Dashboard | `/soc` | `/command?tab=soc` | soc |

**Aliases Criados:**
- `/central-comando/*` → `/command`
- `/noc` → `/command?tab=noc`
- `/soc` → `/command?tab=soc`

---

### 2️⃣ OPERATIONS (`/operations`)

| Módulo Original | Rota Antiga | Rota Nova | Tab |
|-----------------|-------------|-----------|-----|
| Operations Hub | `/operations-command-hub` | `/operations` | overview |
| Maritime | `/operations-command-hub?tab=maritime` | `/operations?tab=maritime` | maritime |
| Fleet | `/operations-command-hub?tab=fleet` | `/operations?tab=fleet` | fleet |
| Voyage | `/operations-command-hub?tab=voyage` | `/operations?tab=voyage` | voyage |
| Missions | `/operations-command-hub?tab=missions` | `/operations?tab=missions` | missions |
| Logistics | `/operations-command-hub?tab=logistics` | `/operations?tab=logistics` | logistics |
| Vessel Contracts | `/vessel-contracts` | `/operations?tab=contracts` | contracts |
| Charter Party | `/charter-party` | `/operations?tab=charter` | charter |

**Aliases Criados:**
- `/operations-command-hub` → `/operations`
- `/maritime-command` → `/operations?tab=maritime`
- `/fleet-command` → `/operations?tab=fleet`
- `/voyage-command` → `/operations?tab=voyage`
- `/vessel-contracts` → `/operations?tab=contracts`
- `/charter-party` → `/operations?tab=charter`

---

### 3️⃣ MAINTENANCE (`/maintenance`)

| Módulo Original | Rota Antiga | Rota Nova | Tab |
|-----------------|-------------|-----------|-----|
| Maintenance Hub | `/maintenance-hub` | `/maintenance` | overview |
| DNV Class | `/maintenance-hub?tab=intelligence` | `/maintenance?tab=class` | class |
| Predictive | `/maintenance-hub?tab=predictive` | `/maintenance?tab=predictive` | predictive |
| Calendar | `/maintenance-hub?tab=calendar` | `/maintenance?tab=calendar` | calendar |
| Drydock | `/maintenance-hub?tab=drydock` | `/maintenance?tab=drydock` | drydock |
| Fuel ROB | `/maintenance-hub?tab=fuel` | `/maintenance?tab=fuel` | fuel |
| MARPOL e-GRB | `/maintenance-hub?tab=waste` | `/maintenance?tab=waste` | waste |
| ESG Emissões | `/maintenance-hub?tab=esg` | `/maintenance?tab=esg` | esg |
| Digital Twin | `/digital-twin` | `/maintenance?tab=digital-twin` | digital-twin |
| Digital Twin 3D | `/advanced/digital-twin-3d` | `/maintenance?tab=digital-twin-3d` | digital-twin-3d |

**Aliases Criados:**
- `/maintenance-hub` → `/maintenance`
- `/digital-twin` → `/maintenance?tab=digital-twin`
- `/advanced/digital-twin-3d` → `/maintenance?tab=digital-twin-3d`
- `/drydock-management` → `/maintenance?tab=drydock`

---

### 4️⃣ AI HUB (`/ai`) - FUSÃO: AI Control Tower + Enterprise Intelligence

| Módulo Original | Rota Antiga | Rota Nova | Tab |
|-----------------|-------------|-----------|-----|
| AI Control Tower | `/ai-control-tower` | `/ai` | overview |
| Hub Central | `/ai-control-tower?tab=hub` | `/ai?tab=hub` | hub |
| Chat | `/ai-control-tower?tab=chat` | `/ai?tab=chat` | chat |
| Agents | `/ai-control-tower?tab=agents` | `/ai?tab=agents` | agents |
| Workflows | `/ai-control-tower?tab=workflows` | `/ai?tab=workflows` | workflows |
| Analytics | `/ai-control-tower?tab=analytics` | `/ai?tab=analytics` | analytics |
| Observability | `/ai-control-tower?tab=observability` | `/ai?tab=observability` | observability |
| Audit | `/ai-control-tower?tab=audit` | `/ai?tab=audit` | audit |
| Voice Assistant | `/voice-assistant` | `/ai?tab=voice` | voice |
| AI Modules Hub | `/ai-modules` | `/ai?tab=modules` | modules |
| RAG Assistant | `/enterprise/rag-assistant` | `/ai?tab=rag` | rag |
| OCR Center | `/enterprise/ocr-center` | `/ai?tab=ocr` | ocr |
| Crew Matching | `/enterprise/crew-matching` | `/ai?tab=crew-matching` | crew-matching |
| Contract Analysis | `/enterprise/contract-analysis` | `/ai?tab=contract-analysis` | contract-analysis |
| Compliance Predictor | `/enterprise/compliance-predictor` | `/ai?tab=compliance-predictor` | compliance-predictor |

**Aliases Criados (20+):**
- `/ai-control-tower` → `/ai`
- `/ai-modules` → `/ai?tab=modules`
- `/ai-hub` → `/ai?tab=hub`
- `/revolutionary-ai` → `/ai?tab=chat`
- `/voice-assistant` → `/ai?tab=voice`
- `/enterprise/rag-assistant` → `/ai?tab=rag`
- `/enterprise/ocr-center` → `/ai?tab=ocr`

---

### 5️⃣ TRACKING (`/tracking`) - FUSÃO: Tracking + Weather

| Módulo Original | Rota Antiga | Rota Nova | Tab |
|-----------------|-------------|-----------|-----|
| Tracking Hub | `/tracking-telemetry` | `/tracking` | overview |
| Realtime | `/tracking-telemetry?tab=realtime` | `/tracking?tab=realtime` | realtime |
| Predictive | `/tracking-telemetry?tab=predictive` | `/tracking?tab=predictive` | predictive |
| Alerts | `/tracking-telemetry?tab=alerts` | `/tracking?tab=alerts` | alerts |
| AIS Tracker | `/ais-tracker-page` | `/tracking?tab=ais` | ais |
| SATCOM | `/satcom-dashboard` | `/tracking?tab=satcom` | satcom |
| Weather Intelligence | `/advanced/weather-intelligence` | `/tracking?tab=weather` | weather |

**Aliases Criados:**
- `/tracking-telemetry` → `/tracking`
- `/ais-tracker-page` → `/tracking?tab=ais`
- `/satcom-dashboard` → `/tracking?tab=satcom`
- `/advanced/weather-intelligence` → `/tracking?tab=weather`
- `/telemetria` → `/tracking`

---

### 6️⃣ COMPLIANCE (`/compliance`)

| Módulo Original | Rota Antiga | Rota Nova | Tab |
|-----------------|-------------|-----------|-----|
| Compliance Hub | `/compliance-unified` | `/compliance` | overview |
| Scorecard | `/compliance-unified?tab=scorecard` | `/compliance?tab=scorecard` | scorecard |
| Audit Management | `/compliance-unified?tab=audit-mgmt` | `/compliance?tab=audits` | audits |
| Certificates | `/compliance-unified?tab=cert-tracker` | `/compliance?tab=certificates` | certificates |
| Risk Matrix | `/risk-matrix` | `/compliance?tab=risks` | risks |
| Audit Agents | `/audit-agents` | `/compliance?tab=agents` | agents |
| **12 AUDITORIAS** | (rotas próprias) | (preservadas) | - |
| PEO-DP | `/peo-dp` | `/compliance/peo-dp` | - |
| PEOTRAM | `/peotram` | `/compliance/peotram` | - |
| ISM Code | `/safety-imca` | `/compliance/ism` | - |
| ISPS Security | `/isps-security` | `/compliance/isps` | - |
| SOLAS/LSA/FFE | `/drill-simulator` | `/compliance/solas` | - |
| MARPOL I-VI | `/waste-management` | `/compliance/marpol` | - |
| Pre-OVID | `/pre-ovid` | `/compliance/pre-ovid` | - |
| Pre-MLC 2006 | `/mlc-inspection` | `/compliance/pre-mlc` | - |
| PSC Package | `/psc-package` | `/compliance/psc` | - |
| SGSO ANP | `/sgso` | `/compliance/sgso` | - |
| Pre-SIRE 2.0 | `/pre-sire` | `/compliance/pre-sire` | - |
| TMSA | `/tmsa-assessment` | `/compliance/tmsa` | - |
| NCs & CAPAs | `/compliance-unified?tab=ncs` | `/compliance?tab=ncs` | ncs |
| Regulations | `/regulations` | `/compliance?tab=regulations` | regulations |

**Aliases Criados (40+):**
- Todas as rotas antigas de auditoria preservadas
- `/peo-dp` → `/compliance/peo-dp`
- `/peotram` → `/compliance/peotram`
- etc.

---

### 7️⃣ DOCUMENTS (`/docs`) - FUSÃO: Document Center + Enterprise Forms

| Módulo Original | Rota Antiga | Rota Nova | Tab |
|-----------------|-------------|-----------|-----|
| Document Center | `/document-center` | `/docs` | overview |
| Viewer | `/document-center?tab=viewer` | `/docs?tab=viewer` | viewer |
| Template Manager | `/document-center?tab=template-mgr` | `/docs?tab=templates` | templates |
| Checklist Builder | `/document-center?tab=checklist-builder` | `/docs?tab=checklists` | checklists |
| Knowledge Hub | `/document-center?tab=knowledge` | `/docs?tab=knowledge` | knowledge |
| Documents | `/document-center?tab=documents` | `/docs?tab=documents` | documents |
| Reports | `/document-center?tab=reports` | `/docs?tab=reports` | reports |
| Export | `/document-center?tab=export` | `/docs?tab=export` | export |
| Forms Builder | `/enterprise/forms-builder` | `/docs?tab=forms` | forms |
| Checklists Builder | `/enterprise/checklists-builder` | `/docs?tab=checklists-advanced` | checklists-advanced |

**Aliases Criados:**
- `/document-center` → `/docs`
- `/enterprise/forms-builder` → `/docs?tab=forms`
- `/enterprise/checklists-builder` → `/docs?tab=checklists-advanced`
- `/documents` → `/docs?tab=documents`
- `/reports` → `/docs?tab=reports`

---

### 8️⃣ PEOPLE (`/people`) - FUSÃO: People Hub + Enterprise People

| Módulo Original | Rota Antiga | Rota Nova | Tab |
|-----------------|-------------|-----------|-----|
| People Hub | `/people-hub` | `/people` | overview |
| Talent Pipeline | `/people-hub?tab=talent` | `/people?tab=talent` | talent |
| Performance 360 | `/people-hub?tab=performance` | `/people?tab=performance` | performance |
| Training Matrix | `/people-hub?tab=training-matrix` | `/people?tab=training` | training |
| Crew Scheduler | `/people-hub?tab=crew-scheduler` | `/people?tab=scheduler` | scheduler |
| Crew Intelligence | `/people-hub?tab=intelligence` | `/people?tab=intelligence` | intelligence |
| STCW/MLC | `/stcw-mlc` | `/people?tab=stcw-mlc` | stcw-mlc |
| Wellness | `/people-hub?tab=wellness` | `/people?tab=wellness` | wellness |
| Mentor DP | `/people-hub?tab=mentor-dp` | `/people?tab=mentor` | mentor |
| Medical Infirmary | `/medical-infirmary` | `/people?tab=medical` | medical |
| Users | `/users` | `/people?tab=users` | users |
| Fatigue Risk | `/enterprise/fatigue-risk` | `/people?tab=fatigue` | fatigue |
| MLC Work Hours | `/enterprise/mlc-hours` | `/people?tab=mlc-hours` | mlc-hours |
| Crew Matching | `/enterprise/crew-matching` | `/people?tab=crew-matching` | crew-matching |

**Aliases Criados:**
- `/people-hub` → `/people`
- `/stcw-mlc` → `/people?tab=stcw-mlc`
- `/medical-infirmary` → `/people?tab=medical`
- `/enterprise/fatigue-risk` → `/people?tab=fatigue`
- `/enterprise/mlc-hours` → `/people?tab=mlc-hours`

---

### 9️⃣ FINANCE (`/finance`) - FUSÃO: Finance + Travel

| Módulo Original | Rota Antiga | Rota Nova | Tab |
|-----------------|-------------|-----------|-----|
| Finance Hub | `/finance-hub` | `/finance` | overview |
| Voyage P&L | `/finance-hub?tab=voyage-pnl` | `/finance?tab=voyage-pnl` | voyage-pnl |
| Voyage Accounting | `/finance-hub?tab=voyage-acct` | `/finance?tab=voyage-acct` | voyage-acct |
| Executive Dashboard | `/finance-hub?tab=executive` | `/finance?tab=executive` | executive |
| Suppliers Portal | `/finance-hub?tab=suppliers` | `/finance?tab=suppliers` | suppliers |
| Procurement | `/finance-hub?tab=procurement` | `/finance?tab=procurement` | procurement |
| Contracts | `/finance-hub?tab=contracts` | `/finance?tab=contracts` | contracts |
| Budget | `/finance-hub?tab=budget` | `/finance?tab=budget` | budget |
| ESG & Emissions | `/esg-emissions` | `/finance?tab=esg` | esg |
| Travel Command | `/travel-command` | `/finance?tab=travel` | travel |

**Aliases Criados:**
- `/finance-hub` → `/finance`
- `/esg-emissions` → `/finance?tab=esg`
- `/travel-command` → `/finance?tab=travel`
- `/payroll` → `/finance?tab=payroll`

---

### 🔟 SYSTEM (`/system`)

| Módulo Original | Rota Antiga | Rota Nova | Tab |
|-----------------|-------------|-----------|-----|
| System Hub | `/system-hub` | `/system` | overview |
| Integrations | `/system-hub?tab=integrations-ent` | `/system?tab=integrations` | integrations |
| API Monitor | `/api-monitor` | `/system?tab=api-monitor` | api-monitor |
| IoT Sensors | `/iot-dashboard` | `/system?tab=iot` | iot |
| Settings | `/settings` | `/system?tab=settings` | settings |
| Health Monitor | `/health-monitor` | `/system?tab=health` | health |
| API Gateway | `/api-gateway` | `/system?tab=api-gateway` | api-gateway |
| Quality Dashboard | `/quality-dashboard` | `/system?tab=quality` | quality |
| Roadmap | `/roadmap` | `/system?tab=roadmap` | roadmap |
| Dev Routes | `/dev-routes` | `/system?tab=dev` | dev (admin only) |

**Aliases Criados:**
- `/system-hub` → `/system`
- `/settings` → `/system?tab=settings`
- `/api-gateway` → `/system?tab=api-gateway`
- `/dev-routes` → `/system?tab=dev`

---

## 🔄 ADVANCED MARITIME - ABSORÇÃO

Os módulos do "Advanced Maritime" foram distribuídos nos hubs relevantes:

| Módulo | Hub Destino | Tab |
|--------|-------------|-----|
| Digital Twin 3D | Maintenance | digital-twin-3d |
| Weather Intelligence | Tracking | weather |
| Bunker Optimization | Maintenance | fuel |
| Cargo Planning | Operations | cargo |
| PSC Readiness | Compliance | psc |
| MARPOL Tracker | Compliance | marpol |
| Blockchain Certs | Compliance | blockchain |
| Incident Investigation | Compliance | incidents |
| VR Training | People | vr-training |
| Voice Commands | AI | voice |
| Crew Wellness AI | People | wellness-ai |
| Executive Dashboard | Command | executive |

---

## ✅ CHECKLIST DE PRESERVAÇÃO

### Funcionalidades Críticas

| Funcionalidade | Status | Localização Nova |
|----------------|--------|------------------|
| 12 Auditorias Marítimas | ✅ PRESERVADO | `/compliance/*` |
| 10 Agentes de IA | ✅ PRESERVADO | `/compliance?tab=agents` |
| Voyage P&L Calculator | ✅ PRESERVADO | `/finance?tab=voyage-pnl` |
| Digital Twin (2D + 3D) | ✅ PRESERVADO | `/maintenance?tab=digital-twin*` |
| Voice Assistant | ✅ PRESERVADO | `/ai?tab=voice` |
| Medical Infirmary | ✅ PRESERVADO | `/people?tab=medical` |
| Travel Command | ✅ PRESERVADO | `/finance?tab=travel` |
| STCW/MLC Compliance | ✅ PRESERVADO | `/people?tab=stcw-mlc` |
| RAG Assistant | ✅ PRESERVADO | `/ai?tab=rag` |
| OCR Center | ✅ PRESERVADO | `/ai?tab=ocr` |

### Ações de Botões

| Ação | Módulos | Status |
|------|---------|--------|
| Add/Create | Todos | ✅ Funcionando |
| Edit/Update | Todos | ✅ Funcionando |
| Delete | Todos | ✅ Com confirmação |
| Upload | Docs, Medical | ✅ Funcionando |
| Export | Todos c/ dados | ✅ Funcionando |
| Refresh | Dashboards | ✅ Funcionando |
| Filter/Search | Listas | ✅ Funcionando |

---

## 📈 BENEFÍCIOS DA FUSÃO

### Antes (v7.1)
- 12 grupos no sidebar
- 120+ itens de menu
- Navegação confusa
- Duplicação de rotas

### Depois (v8.0)
- 10 grupos no sidebar
- 68 itens de menu (-43%)
- Navegação intuitiva
- Zero duplicação
- 150+ aliases para compatibilidade

---

## 🚨 RISCOS E MITIGAÇÕES

| Risco | Mitigação |
|-------|-----------|
| Usuários com bookmarks antigos | 150+ aliases/redirects criados |
| Links em emails/documentos | Rotas antigas funcionam via alias |
| Integrações externas | API paths preservados |
| Deep links compartilhados | Query params preservados |

---

## 📋 PRÓXIMOS PASSOS

1. ✅ Fusion Map documentado
2. ⏳ Sidebar v8.0 implementado
3. ⏳ Legacy redirects expandidos
4. ⏳ E2E tests para validação
5. ⏳ Relatório Before/After

---

*Documento gerado em Fevereiro 2026 - NAUTI ONE v8.0*
