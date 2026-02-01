# 🚨 VITRINE MODULES - MÓDULOS DECORATIVOS

> **ETAPA 1 - PROMPT MASTER V4.1**
> Data: Janeiro 2026

---

## ⚠️ DEFINIÇÃO DE MÓDULO VITRINE

Um módulo é **VITRINE** se:
1. ❌ Não tem persistência real (tabela Supabase + RLS)
2. ❌ Usa mock data / Promise.resolve / setTimeout+resolve
3. ❌ Não tem CRUD real ponta-a-ponta
4. ❌ Não tem feedback de loading/error/success

---

## 🔴 LISTA DE MÓDULOS VITRINE (CORREÇÃO OBRIGATÓRIA)

### PRIORIDADE CRÍTICA (🔴 P0)

#### 1. Logistics Command
- **Path**: `/logistics-command`
- **Arquivo**: `src/components/logistics/UnifiedLogisticsDashboard.tsx`
- **Evidência**:
  ```
  Linha 92: return getMockCargo();
  Linha 101: return getMockSuppliers();
  Linha 109: return getMockPortCalls();
  Linha 636-708: function getMockCargo()
  Linha 711-773: function getMockSuppliers()
  Linha 776-831: function getMockPortCalls()
  ```
- **Tabelas Existentes**: `shipments`, `suppliers`, `port_calls`
- **Ação**: Integrar com tabelas existentes

---

#### 2. Communication Command Center
- **Path**: `/communication-command`
- **Arquivo**: `src/pages/CommunicationCommandCenter.tsx`
- **Evidência**: Mock data patterns
- **Ação**: Integrar com `intelligent_notifications`, `soc_alerts`

---

#### 3. Real-Time Workspace
- **Path**: `/real-time-workspace`
- **Arquivo**: `src/modules/workspace/real-time-workspace/RealTimeWorkspaceProfessional.tsx`
- **Evidência**: Mock data em componentes internos
- **Ação**: Integrar com Supabase real-time

---

#### 4. AI Analytics Dashboard
- **Path**: `/ai-analytics`
- **Arquivo**: `src/pages/AIAnalyticsDashboard.tsx`
- **Evidência**: Mock metrics data
- **Ação**: Integrar com `ai_decisions`, `ai_analytics`

---

#### 5. Bridge Link
- **Path**: `/bridge-link`
- **Arquivo**: `src/modules/bridgelink/BridgeLinkDashboard.tsx`
- **Evidência**: 100% mock data
- **Ação**: Integrar com IoT/sensors

---

### PRIORIDADE ALTA (🟠 P1)

#### 6. Voyage Command - Ports
- **Path**: `/voyage-command`
- **Arquivo**: `src/pages/VoyageCommandCenter.tsx`
- **Evidência**:
  ```
  Linha 81-89: const DEFAULT_PORTS: Port[] = [...]  // Hardcoded
  Linha 94-99: const DEMO_WEATHER: WeatherCondition[] = [...]
  ```
- **Tabelas Existentes**: `ports`, `voyages`
- **Ação**: Integrar com tabela `ports`

---

#### 7. Procurement Command Center
- **Path**: `/procurement-command`
- **Arquivo**: `src/pages/ProcurementCommandCenter.tsx`
- **Evidência**: Mock data em algumas seções
- **Ação**: Integrar com `purchase_orders`, `suppliers`

---

#### 8. Nauti People - Recruitment Pipeline
- **Path**: `/nautilus-people`
- **Arquivo**: `src/modules/nauti-people/components/RecruitmentPipeline.tsx`
- **Evidência**: Mock candidates data
- **Ação**: Integrar com `hr_candidates`, `crew_members`

---

#### 9. Nauti People - Climate Engagement
- **Arquivo**: `src/modules/nauti-people/components/ClimateEngagement.tsx`
- **Evidência**: Mock engagement data
- **Ação**: Integrar com `crew_engagement_scores`

---

#### 10. Medical Infirmary - Reports
- **Path**: `/medical-infirmary`
- **Arquivo**: `src/modules/medical-infirmary/components/ReportsTab.tsx`
- **Evidência**: Mock medical reports
- **Ação**: Integrar com `medical_records`, `crew_health_checkins`

---

#### 11. Medical Infirmary - Crew Health
- **Arquivo**: `src/modules/medical-infirmary/components/CrewHealthTab.tsx`
- **Evidência**: Mock health data
- **Ação**: Integrar com `crew_health_checkins`

---

### PRIORIDADE MÉDIA (🟡 P2)

#### 12. Observability Center
- **Path**: `/ai-observability`
- **Arquivo**: `src/pages/ObservabilityCenter.tsx`
- **Evidência**: Mock observability metrics
- **Ação**: Integrar com `system_logs`, `ai_decisions`

---

#### 13. Security Center
- **Path**: `/security-center`
- **Arquivo**: `src/pages/SecurityCenter.tsx`
- **Evidência**: Mock security metrics
- **Ação**: Integrar com `security_scans`, `vulnerabilities`

---

#### 14. Templates Page
- **Path**: `/templates`
- **Arquivo**: `src/pages/Templates.tsx`
- **Evidência**: Mock template data
- **Ação**: Integrar com `document_templates`

---

#### 15. System Hub
- **Path**: `/system-hub`
- **Arquivo**: `src/pages/SystemHub.tsx`
- **Evidência**: Mock system status
- **Ação**: Integrar com `system_health`

---

#### 16. Integrations Center
- **Path**: `/integrations`
- **Arquivo**: `src/pages/IntegrationsCenter.tsx`
- **Evidência**: Mock integrations status
- **Ação**: Integrar com `integration_configs`

---

#### 17. Whistleblower V2
- **Path**: `/whistleblower`
- **Arquivo**: `src/pages/WhistleblowerV2.tsx`
- **Evidência**: Mock reports
- **Ação**: Integrar com `whistleblower_reports`

---

#### 18. Usage Simulation
- **Path**: `/usage-simulation`
- **Arquivo**: `src/pages/UsageSimulation.tsx`
- **Evidência**: Simulation mock data
- **Ação**: Remover ou converter para ferramenta de teste

---

#### 19. Analytics Feedback
- **Path**: `/analytics-feedback`
- **Arquivo**: `src/pages/AnalyticsFeedback.tsx`
- **Evidência**: Mock NPS/feedback data
- **Ação**: Integrar com `user_feedback`, `nps_scores`

---

### MÓDULOS DE TESTE (PERMITIDO TER MOCK)

Os seguintes arquivos são de teste/admin e podem manter mock:
- `src/pages/admin/Patch50*.tsx` - Patches de teste
- `src/pages/admin/api-tester.tsx` - Testador de API

---

## 📊 ARQUIVOS COM MOCK EM `src/hooks`

| Arquivo | Padrão Mock | Status Atual |
|---------|-------------|--------------|
| `useLiveInventoryData.ts` | demo fallback | ✅ Corrigido |
| `useCommunicationData.ts` | demo fallback | ✅ Corrigido |
| `useCrewWellnessData.ts` | demo fallback | ✅ Corrigido |
| `useEmployeePortalData.ts` | demo fallback | ✅ Corrigido |
| `useDPIncidentsData.ts` | demo fallback | ✅ Corrigido |
| `useAutonomousAgentActionsData.ts` | demo fallback | ✅ Corrigido |
| `usePredictiveMaintenanceData.ts` | demo fallback | ✅ Corrigido |
| `useDashboardStats.ts` | Promise.resolve | ⚠️ Verificar |
| `use-enhanced-notifications.ts` | Promise.resolve | ⚠️ Verificar |

---

## 📊 ARQUIVOS COM MOCK EM `src/modules`

| Módulo | Arquivos com Mock | Severidade |
|--------|-------------------|------------|
| `workspace/real-time-workspace` | 3 arquivos | 🔴 Alta |
| `workflow-visual` | 1 arquivo | 🟡 Média |
| `sonar-ai/services` | 1 arquivo | 🔴 Alta (Submarino) |
| `sonar-ai/components` | 1 arquivo | 🔴 Alta (Submarino) |
| `nauti-command-center` | 2 arquivos | 🟡 Média |
| `deep-risk-ai/services` | 1 arquivo | 🔴 Alta (Submarino) |
| `nauti-people` | 4 arquivos | 🟠 Alta |
| `medical-infirmary` | 2 arquivos | 🟠 Alta |
| `maintenance-planner` | 3 arquivos | 🟡 Média |
| `intelligent-maintenance` | 1 arquivo | 🟡 Média |
| `hr/employee-portal` | 2 arquivos | 🟠 Alta |
| `esg-emissions` | 1 arquivo | 🟡 Média |
| `crew-management` | 2 arquivos | 🟡 Média |
| `autonomous-procurement` | 2 arquivos | 🟠 Alta |

---

## 📊 ARQUIVOS COM MOCK EM `src/components`

| Componente | Arquivos com Mock | Severidade |
|------------|-------------------|------------|
| `logistics/*` | 2 arquivos | 🔴 CRÍTICO |
| `ai/*` | 2 arquivos | 🟠 Alta |
| `automation/*` | 3 arquivos | 🟡 Média |
| `compliance/roadmap/*` | 2 arquivos | 🟡 Média |
| `sgso/*` | 7 arquivos | 🟡 Média |
| `voice/*` | 1 arquivo | 🟡 Média |
| `weather/*` | 1 arquivo | 🟡 Média |
| `peotram/*` | 5 arquivos | 🟡 Média |
| `testing/*` | 6 arquivos | ⚪ OK (teste) |

---

## 🎯 PLANO DE CORREÇÃO

### FASE 1: Críticos (P0) - 1 semana
1. ✅ Logistics Command → shipments, suppliers, port_calls
2. ✅ Communication Command → intelligent_notifications
3. ✅ Real-Time Workspace → Supabase real-time
4. ✅ AI Analytics → ai_decisions, ai_analytics
5. ✅ Bridge Link → Ocultar (feature flag) ou integrar IoT

### FASE 2: Alta (P1) - 2 semanas
6. Voyage Command → ports table
7. Procurement Command → purchase_orders
8. Nauti People modules → hr_candidates
9. Medical Infirmary → medical_records

### FASE 3: Média (P2) - 3 semanas
10. Observability → system_logs
11. Security Center → security_scans
12. Templates → document_templates
13. Remaining modules

---

## ✅ CHECKLIST DE CORREÇÃO POR MÓDULO

Para cada módulo vitrine, aplicar:

```markdown
[ ] Identificar tabela Supabase correspondente
[ ] Verificar se tabela existe (criar migration se não)
[ ] Criar/atualizar hook TanStack Query
[ ] Substituir mock por query real
[ ] Adicionar loading state
[ ] Adicionar error state
[ ] Adicionar empty state
[ ] Testar CRUD completo
[ ] Criar teste E2E mínimo
```

---

## 📈 MÉTRICAS DE PROGRESSO

```
TOTAL MÓDULOS VITRINE: 19
CORRIGIDOS: 0
PENDENTES: 19
PROGRESSO: 0%
```

---

*Documento gerado em Janeiro 2026 - ETAPA 1 Completa*
