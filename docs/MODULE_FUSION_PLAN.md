# 🔀 MODULE FUSION PLAN - NAUTI ONE v8.0

> **Plano de Fusão com Regras Anti-Supressão**
> Data: 2026-02-06 | Objetivo: Consolidar módulos sem perda de funcionalidades

---

## 📋 REGRAS DE FUSÃO (NÃO NEGOCIÁVEIS)

### ❌ PROIBIDO

1. **Remover funcionalidades** - Nenhum botão, ação ou feature pode desaparecer
2. **Quebrar rotas antigas** - Todas as URLs devem continuar funcionando via redirect
3. **Apagar services/hooks** - Código existente deve ser migrado, não deletado
4. **Criar placeholders** - Tudo que é fusionado deve continuar operacional
5. **Esconder módulos** - Funcionalidades não podem ser "enterradas" em submenus inacessíveis

### ✅ OBRIGATÓRIO

1. **Mapeamento 1:1** - Cada feature antiga → feature nova documentada
2. **Legacy redirects** - Rotas antigas redirecionam para novas
3. **Teste before/after** - Validar que tudo funciona após fusão
4. **Preservar query params** - Deep links continuam funcionando
5. **Manter CRUD** - Create/Read/Update/Delete preservados

---

## 🗂️ INVENTÁRIO FUNCIONAL PRÉ-FUSÃO

### MEGA-HUB A: COMMAND CENTER

**Módulos Consolidados:**
| Módulo Original | Rota Antiga | Funcionalidades |
|-----------------|-------------|-----------------|
| Central de Comando | `/central-comando` | Dashboard, KPIs, Overview |
| NOC 24/7 | `/noc` | Monitoramento real-time, Alertas |
| SOC Security | `/soc` | Segurança, Incidentes |
| Comunicações | `/communication-command` | Mensagens, Radio |
| Alertas | `/alerts-command` | Gestão de alertas |

**Hooks/Services:**
- `useExecutiveKPIs.ts` ✅
- `useAlerts.ts` 🟡
- `useIncidents.ts` 🟡

**Tabelas Supabase:**
- `vessels` ✅
- `incidents` ✅
- `alerts` 🟡 (parcial)
- `communications` ❌ (não existe)

---

### MEGA-HUB B: OPS (Operations)

**Módulos Consolidados:**
| Módulo Original | Rota Antiga | Funcionalidades |
|-----------------|-------------|-----------------|
| Operations Command | `/operations-command-hub` | Hub central |
| Maritime Command | `/maritime-command` | Operações marítimas |
| Fleet Command | `/fleet-command` | Gestão de frota |
| Voyage Command | `/voyage-command` | Gestão de viagens |
| Mission Command | `/mission-command` | Missões/Projetos |
| Logistics | `/logistics-command` | Logística |
| Contracts | `/vessel-contracts` | Contratos, Charter |

**Hooks/Services:**
- `useFleetOperations.ts` ✅
- `useVoyages.ts` 🟡
- `useContracts.ts` ✅
- `useMissions.ts` ❌

**Tabelas Supabase:**
- `vessels` ✅
- `voyages` 🟡
- `vessel_contracts` ✅
- `missions` ❌ (não existe)

---

### MEGA-HUB C: MAINTENANCE

**Módulos Consolidados:**
| Módulo Original | Rota Antiga | Funcionalidades |
|-----------------|-------------|-----------------|
| Maintenance Hub | `/maintenance-hub` | Dashboard manutenção |
| Class Surveys | `/maintenance?tab=surveys` | Vistorias DNV/LR/BV |
| Predictive | `/predictive-maintenance` | ML predictions |
| Drydock | `/drydock-management` | Docagem seca |
| Fuel/ROB | `/fuel-management` | Combustível |
| Digital Twin | `/digital-twin` | Visualização 2D/3D |
| MARPOL/Waste | `/waste-management` | Resíduos MARPOL |
| ESG | `/esg-emissions` | Emissões CII/EEXI |

**Hooks/Services:**
- `useClassSurveys.ts` ✅
- `useDrydockSchedule.ts` 🟡
- `useFuelData.ts` 🟡
- `useWasteManagement.ts` ✅

**Tabelas Supabase:**
- `vessels` ✅
- `maintenance_records` ✅
- `fuel_records` 🟡
- `waste_logs` ✅

---

### MEGA-HUB D: AI

**Módulos Consolidados:**
| Módulo Original | Rota Antiga | Funcionalidades |
|-----------------|-------------|-----------------|
| AI Control Tower | `/ai-control-tower` | Hub IA central |
| AI Chat | `/ai-command` | Chat assistente |
| AI Modules | `/ai-modules` | 11 módulos IA |
| Voice Assistant | `/voice-assistant` | Comandos de voz |
| RAG Assistant | `/enterprise/rag-assistant` | Busca semântica |
| OCR Center | `/enterprise/ocr-center` | Leitura documentos |
| Agent Orchestration | `/agent-orchestration` | Orquestração multi-agente |

**Hooks/Services:**
- `useAIChat.ts` 🟡
- `useVoiceCommands.ts` 🟡
- `useOCR.ts` ✅
- `useRAG.ts` 🟡

**Edge Functions:**
- `ai-chat` ✅
- `document-ocr` ✅
- `rag-query` 🟡

---

### MEGA-HUB E: TRACKING

**Módulos Consolidados:**
| Módulo Original | Rota Antiga | Funcionalidades |
|-----------------|-------------|-----------------|
| Tracking Hub | `/tracking-telemetry` | Hub rastreamento |
| Real-time | `/telemetria` | Tempo real |
| AIS Fleet | `/ais-tracker-page` | Posições AIS |
| SATCOM | `/satcom-dashboard` | Comunicação satélite |
| Weather | `/weather-command` | Meteorologia |
| Alerts | `/tracking/alerts` | Geofencing |

**Hooks/Services:**
- `useFleetTracking.ts` ✅
- `useAISData.ts` 🟡 (simulado)
- `useWeather.ts` 🟡
- `useSATCOM.ts` ❌

**Integrações Externas:**
- OpenMeteo ✅
- MarineTraffic ❌ (não integrado)
- SATCOM Provider ❌

---

### MEGA-HUB F: COMPLIANCE

**Módulos Consolidados:**

#### 12 Auditorias Marítimas
| # | Auditoria | Rota | Padrão |
|---|-----------|------|--------|
| 1 | PEO-DP | `/peo-dp` | IMCA M-117 |
| 2 | PEOTRAM | `/peotram` | ANP 13E |
| 3 | ISM Code | `/safety-imca` | IMO SMS |
| 4 | ISPS Security | `/isps-security` | SOLAS XI-2 |
| 5 | SOLAS/LSA/FFE | `/solas-inspection` | IMO SOLAS III |
| 6 | MARPOL I-VI | `/waste-management` | IMO MARPOL |
| 7 | Pre-OVID | `/pre-ovid` | OCIMF |
| 8 | Pre-MLC 2006 | `/mlc-inspection` | ILO MLC |
| 9 | PSC Package | `/psc-package` | Paris/Tokyo MoU |
| 10 | SGSO ANP | `/sgso` | ANP 17P |
| 11 | Pre-SIRE 2.0 | `/pre-sire` | OCIMF SIRE |
| 12 | TMSA | `/tmsa-assessment` | OCIMF |

#### 10 Agentes IA Auditoria
Todos registrados em `/audit-agents`

**Hooks/Services:**
- `useAuditData.ts` 🟡
- `useCertificates.ts` 🟡
- `useNonConformities.ts` 🟡
- `useRiskMatrix.ts` 🟡

**Tabelas Supabase:**
- `internal_audits` 🟡
- `certificates` 🟡
- `non_conformities` 🟡
- `compliance_scores` 🟡

---

### MEGA-HUB G: WORKBENCH

**Seções:**

#### Docs
- Document Center, Templates, Checklists, Forms, Reports

#### People
- HR Dashboard, Crew, Training, Medical, STCW/MLC

#### Finance
- Voyage P&L, Procurement, Suppliers, Travel

#### System
- Settings, Integrations, API Monitor, IoT

**Hooks/Services:**
- `useDocuments.ts` ✅
- `usePeopleHubData.ts` ✅
- `useVoyagePnL.ts` ✅
- `useProcurement.ts` 🟡
- `useSuppliers.ts` ✅

---

## 🔄 MAPEAMENTO DE MIGRAÇÃO

### Legacy Redirects Configurados

Arquivo: `src/routes/legacy-redirects-mega.tsx`

```typescript
// Exemplo de redirecionamentos
"/central-comando" → "/command"
"/operations-command-hub" → "/ops"
"/maintenance-hub" → "/maintenance"
"/ai-control-tower" → "/ai"
"/tracking-telemetry" → "/tracking"
"/compliance-unified" → "/compliance"
"/document-center" → "/workbench/docs"
"/people-hub" → "/workbench/people"
"/finance-hub" → "/workbench/finance"
"/system-hub" → "/workbench/system"
```

**Total Configurado:** 135+ redirects

---

## ✅ VALIDAÇÃO DE FUSÃO

### Checklist por MEGA-HUB

#### MEGA-HUB A: Command ✅
- [x] Rotas antigas redirecionam
- [x] Tabs preservam funcionalidades
- [ ] Timeline conectada a dados reais
- [ ] Alertas com backend real

#### MEGA-HUB B: Ops ✅
- [x] Rotas antigas redirecionam
- [x] Contratos com CRUD real
- [ ] Voyages com CRUD completo
- [ ] Missions implementado

#### MEGA-HUB C: Maintenance ✅
- [x] Class Surveys funcional
- [x] Waste Management real
- [ ] Spare parts implementado
- [ ] Predictive com dados reais

#### MEGA-HUB D: AI ✅
- [x] Chat funcional
- [x] OCR funcional
- [ ] RAG melhorado
- [ ] Voice offline

#### MEGA-HUB E: Tracking 🟡
- [x] Estrutura OK
- [ ] AIS real (não simulado)
- [ ] SATCOM integrado
- [ ] Weather multi-provider

#### MEGA-HUB F: Compliance ✅
- [x] 12 auditorias acessíveis
- [x] 10 agentes registrados
- [ ] CRUD completo em auditorias
- [ ] Certificados automatizados

#### MEGA-HUB G: Workbench ✅
- [x] Docs funcional
- [x] People funcional
- [x] Finance P&L real
- [ ] Forms Builder real
- [ ] Checklists Builder real

---

## 📊 STATUS DE MIGRAÇÃO

| Categoria | Total | Migrado | Funcional | Pendente |
|-----------|-------|---------|-----------|----------|
| Rotas | 180+ | 180+ | 180+ | 0 |
| Redirects | 135 | 135 | 135 | 0 |
| CRUD Operations | 45 | 45 | 25 | 20 |
| Backend Hooks | 50+ | 50+ | 35 | 15+ |
| Mock Removal | 45 | 0 | 0 | 45 |

---

*Plano de Fusão - NAUTI ONE v8.0*
*Última atualização: 2026-02-06*
