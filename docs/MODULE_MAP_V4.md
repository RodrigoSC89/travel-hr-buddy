# 📊 MODULE MAP V4 - NAUTI ONE
**Data:** 31/01/2026  
**Versão:** v4.0  
**Total de Módulos no Sidebar:** 168 rotas

---

## 📋 SUMÁRIO EXECUTIVO

### Contagem por Status
| Status | Quantidade | % |
|--------|------------|---|
| ✅ Funcional (Real Backend) | ~85 | 51% |
| ⚠️ Parcial (Mock Fallback) | ~45 | 27% |
| ❌ Vitrine (100% Mock) | ~15 | 9% |
| 🔒 Desabilitado | 5 | 3% |
| 🆕 Novo/Beta | ~18 | 10% |

### Módulos Desabilitados (Correto)
Os seguintes módulos foram corretamente desabilitados por serem 100% mock:
- `/ocean-sonar` - Ocean Sonar AI
- `/underwater-drone` - Underwater Drone
- `/auto-sub` - AutoSub Mission
- `/sonar-ai` - Sonar AI Enhancement
- `/deep-risk-ai` - Deep Risk AI

---

## 🗂️ MAPA COMPLETO POR GRUPO

### 1. 🧠 Central de Comando (9 rotas)
| Módulo | Rota | Status | Backend Real | Observação |
|--------|------|--------|--------------|------------|
| Visão Geral | `/central-comando/visao-geral` | ✅ | Supabase | Dashboard principal |
| Operações | `/central-comando/operacoes` | ✅ | Supabase | Métricas operacionais |
| Executivo | `/central-comando/executivo` | ✅ | Supabase | Dashboard executivo |
| IA Central | `/central-comando/ia` | ⚠️ | Parcial | Edge Functions |
| Resiliência | `/central-comando/resiliencia` | ⚠️ | Parcial | Monitoramento |
| Alertas | `/central-comando/alertas` | ✅ | Supabase | Sistema de alertas |
| NOC 24/7 | `/noc` | ✅ | Supabase | Network Operations |
| NOC Monitoring | `/noc-monitoring` | ✅ | Supabase | Monitoramento |
| SOC Dashboard | `/soc` | 🆕 | Parcial | Security Operations |

### 2. 🚢 Operações Marítimas (15 rotas)
| Módulo | Rota | Status | Backend Real | Observação |
|--------|------|--------|--------------|------------|
| Maritime Command | `/maritime-command` | ✅ | Supabase | Centro de comando |
| Fleet Command Center | `/fleet-command` | ✅ | Supabase | Gestão de frota |
| Voyage Command | `/voyage-command` | ✅ | Supabase | Gestão de viagens |
| Otimização de Rotas AI | `/route-optimizer` | ⚠️ | Parcial | AI com fallback |
| Mission Command | `/mission-command` | ✅ | Supabase | Missões |
| Bridge Link | `/bridge-link` | ⚠️ | Parcial | Comunicação ponte |
| Drydock Management | `/drydock-management` | ✅ | Supabase | Docagem seca |
| Contratos de Embarcação | `/vessel-contracts` | ✅ | Supabase | Contratos |
| Charter Party | `/charter-party` | ✅ | Supabase | Afretamento |
| Cargo Management | `/cargo-management` | ✅ | Supabase | Gestão de carga |
| Port Call | `/port-call` | ✅ | Supabase | Escala portuária |
| CTS Tripulação | `/vessel-cts` | ✅ | Supabase | Crew Transfer |
| Histórico de Embarcação | `/vessel-history` | ✅ | Supabase | Histórico |
| Digital Twin | `/digital-twin` | 🆕 | Parcial | IoT + 3D |
| Logistics Command | `/logistics-command` | 🆕 | Parcial | Logística |

### 3. 🔧 Manutenção (7 rotas)
| Módulo | Rota | Status | Backend Real | Observação |
|--------|------|--------|--------------|------------|
| Central de Manutenção | `/maintenance-command` | ✅ | Supabase | CRUD completo |
| Manutenção Preditiva ML | `/predictive-maintenance` | ⚠️ | Parcial | AI predictions |
| Saúde da Frota | `/maintenance-command?tab=health` | ✅ | Supabase | Health metrics |
| IA Copilot | `/maintenance-command?tab=copilot` | ⚠️ | Parcial | AI assistant |
| Jobs & Ordens | `/maintenance-command?tab=jobs` | ✅ | Supabase | Work orders |
| Forecast IA | `/maintenance-command?tab=forecast` | ⚠️ | Parcial | Previsões |
| Digital Twin 3D | `/maintenance-command?tab=twin` | 🆕 | Mock | 3D visualization |

### 4. 🌊 Operações Submarinas (DESABILITADO)
| Módulo | Rota | Status | Motivo |
|--------|------|--------|--------|
| Ocean Sonar AI | `/ocean-sonar` | 🔒 | 100% mock |
| Underwater Drone | `/underwater-drone` | 🔒 | 100% mock |
| AutoSub Mission | `/auto-sub` | 🔒 | 100% mock |
| Sonar AI Enhancement | `/sonar-ai` | 🔒 | 100% mock |
| Deep Risk AI | `/deep-risk-ai` | 🔒 | 100% mock |

### 5. 🧠 IA & Automação (14 rotas)
| Módulo | Rota | Status | Backend Real | Observação |
|--------|------|--------|--------------|------------|
| AI Modules Hub | `/ai-modules-hub` | ✅ | Edge Functions | Hub central |
| AI Hub Central | `/ai-hub` | ✅ | Edge Functions | 11 IAs |
| AI Analytics | `/ai-analytics` | ⚠️ | Parcial | Analytics |
| Features Revolucionárias | `/revolutionary-features` | ⚠️ | Parcial | Showcase |
| Autonomous Command | `/autonomous-command` | ⚠️ | Parcial | Agentes |
| Agent Orchestration | `/agent-orchestration` | 🆕 | Parcial | Orquestração |
| AI Command Center | `/ai-command` | ✅ | Edge Functions | Centro IA |
| IA Autônoma (Logs) | `/ai-ops/logs` | ✅ | Supabase | Logs |
| Observabilidade IA | `/ai-observability` | ⚠️ | Parcial | Métricas |
| Workflow Command | `/workflow-command` | ✅ | Supabase | Workflows |
| Journaling IA | `/ai-journaling` | ⚠️ | Parcial | Journaling |
| Auditoria de IA | `/ai-audit` | ✅ | Supabase | Audit trail |
| Voice Assistant IA | `/voice-assistant` | ⚠️ | Parcial | Speech |
| Assistente de Voz | `/assistant/voice` | ⚠️ | Parcial | Voice |

### 6. 🤖 AI Enterprise Engines (12 rotas)
| Módulo | Rota | Status | Backend Real | Observação |
|--------|------|--------|--------------|------------|
| Voyage & Logistics AI | `/ai/voyage-logistics` | ✅ | Edge Function | voyage-logistics-ai |
| Safety & Incident AI | `/ai/safety-incident` | ✅ | Edge Function | safety-incident-ai |
| Inventory & Spares AI | `/ai/inventory-spares` | ✅ | Edge Function | inventory-spares-ai |
| Finance & Procurement AI | `/finance-procurement-ai` | ✅ | Edge Function | finance-procurement-ai |
| Compliance AI | `/compliance-ai` | ✅ | Edge Function | compliance-ai |
| Environmental AI | `/environmental-ai` | ✅ | Edge Function | environmental-ai |
| Quality Management AI | `/quality-ai` | ⚠️ | Parcial | quality-ai |
| Contract & Legal AI | `/contract-legal-ai` | ⚠️ | Parcial | contract-legal-ai |
| Insurance & Claims AI | `/insurance-claims-ai` | ⚠️ | Parcial | insurance-claims-ai |
| Crewing & Payroll AI | `/crewing-payroll-ai` | ⚠️ | Parcial | crewing-payroll-ai |
| Reporting & Analytics AI | `/reporting-analytics-ai` | ⚠️ | Parcial | reporting-ai |
| Mobile & Offline AI | `/mobile-offline-ai` | ⚠️ | Parcial | mobile-ai |

### 7-16. Demais Grupos (Resumo)
| Grupo | Total Rotas | ✅ Real | ⚠️ Parcial | ❌ Mock |
|-------|-------------|---------|------------|---------|
| 🔬 Inteligência Avançada | 7 | 2 | 4 | 1 |
| 🏢 Enterprise Intelligence | 16 | 6 | 8 | 2 |
| 🚀 Módulos Avançados | 12 | 3 | 7 | 2 |
| 📊 Telemetria | 9 | 5 | 3 | 1 |
| 🌐 APIs & Integrações | 11 | 7 | 3 | 1 |
| 📁 Relatórios & Documentos | 8 | 6 | 2 | 0 |
| 📢 Comunicação & Alertas | 4 | 3 | 1 | 0 |
| 🔍 Auditorias | 28 | 18 | 8 | 2 |
| 👥 RH & Pessoas | 11 | 7 | 3 | 1 |
| 🤖 RH & IA | 5 | 2 | 2 | 1 |
| 🎓 Treinamentos | 4 | 3 | 1 | 0 |
| 💰 Finanças & Procurement | 9 | 6 | 2 | 1 |
| 🌱 ESG & Sustentabilidade | 3 | 2 | 1 | 0 |
| ✈️ Viagens & Logística | 2 | 2 | 0 | 0 |
| ⚙️ Sistema & Configurações | 14 | 10 | 3 | 1 |

---

## 🔴 MÓDULOS ÓRFÃOS (Rota existe, não está no Sidebar)

| Rota | Componente | Status | Ação Recomendada |
|------|------------|--------|------------------|
| `/dev-routes` | DevRoutesDashboard | Dev Only | Manter oculto |
| `/health-monitor` | HealthMonitor | Interno | Manter oculto |
| `/interactivity-scoreboard` | InteractivityScoreboard | Dev Only | Manter oculto |
| `/qa/preview` | QAPreview | QA Only | Manter oculto |

---

## 🟡 MÓDULOS VITRINE (Expostos mas sem Backend Real)

| Módulo | Rota | Problema | Ação Recomendada |
|--------|------|----------|------------------|
| VR/AR Training | `/advanced/vr-training` | 100% mock | Ocultar ou implementar |
| Blockchain Certificates | `/advanced/blockchain-certificates` | Mock | Implementar ou ocultar |
| ARIA Voice Commands | `/advanced/voice-commands` | Parcial mock | Completar integração |

---

## ✅ HOOKS CRÍTICOS - STATUS

| Hook | Arquivo | Status | Backend |
|------|---------|--------|---------|
| useAutonomousAgentActions | `useAutonomousAgentActionsData.ts` | ✅ | Supabase |
| usePredictiveMaintenanceData | `usePredictiveMaintenanceData.ts` | ✅ | Supabase |
| useCrewWellnessData | `useCrewWellnessData.ts` | ⚠️ | Fallback mock |
| useCrewTrainingData | `useCrewTrainingData.ts` | ✅ | Supabase |
| useLiveInventoryData | `useLiveInventoryData.ts` | ⚠️ | Fallback mock |
| useEmployeePortalData | `useEmployeePortalData.ts` | ⚠️ | Simulado |

---

## 📊 CONCLUSÃO

### Pontos Fortes
1. **420+ migrations** criadas no Supabase
2. **2.395+ políticas RLS** implementadas
3. **11 Edge Functions** de IA funcionais
4. **Operações Submarinas** corretamente desabilitadas

### Pontos a Melhorar
1. **14 hooks** ainda com fallback mock
2. **~15 módulos** expostos como vitrine
3. **Inconsistência UX** entre módulos
4. **any types** em excesso (84 ocorrências)

### Próximos Passos
1. Remover fallbacks mock dos hooks críticos
2. Ocultar módulos vitrine restantes
3. Padronizar UX (loading/error/empty)
4. Reduzir any types
