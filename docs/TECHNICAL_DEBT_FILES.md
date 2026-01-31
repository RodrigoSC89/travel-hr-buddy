# 📋 LISTA TÉCNICA DE ARQUIVOS COM DÍVIDA TÉCNICA

**Gerado em:** 31 de Janeiro de 2026  
**Sistema:** NAUTI ONE v3.2.0

---

## 📊 RESUMO

| Tipo de Problema | Arquivos Afetados |
|------------------|-------------------|
| Dados Mockados (MOCK_, SAMPLE_, FAKE_) | 70 |
| Promise.resolve fake | 12 |
| setTimeout + resolve | 3 |
| TODO/PLACEHOLDER/FIXME | 20 |
| TypeScript `any` | 1069 |
| @ts-ignore/@ts-nocheck | 168 |
| console.log | 100+ |

---

## 🔴 1. ARQUIVOS COM DADOS MOCKADOS (70 arquivos)

### Padrão: `MOCK_`, `SAMPLE_`, `FAKE_`, `DUMMY_`, `mockData`, `sampleData`, `fakeData`

```
src/tests/send-restore-dashboard.test.ts
src/tests/send-restore-dashboard-daily.test.ts
src/tests/modules/bridgelink/BridgeLinkDashboard.test.tsx
src/tests/mmi-resolved-work-orders-service.test.ts
src/tests/mmi-history-service.test.ts
src/tests/metrics-api.test.ts
src/tests/forecast-list-api.test.ts
src/tests/components/bi/ComplianceByVesselTable.test.tsx
src/tests/components/bi/ComplianceByVesselChart.test.tsx
src/tests/bi-jobs-by-component.test.ts
src/tests/bi-dashboard-jobs.test.tsx
src/tests/auditoria-tendencia-api.test.ts
src/tests/auditoria-resumo-api.test.ts
src/tests/admin-sgso-api.test.ts
src/services/mocks/terrastar.mock.ts
src/services/mocks/starfix.mock.ts
src/pages/enterprise/ContractAnalysisPage.tsx
src/pages/admin/checklists.tsx
src/pages/SGSOReportPage.tsx
src/modules/revolutionary-ai/components/MaritimeBlockchainNetwork.tsx
src/modules/revolutionary-ai/PredictiveMaintenanceScheduler.tsx
src/modules/revolutionary-ai/LiveInventoryMap.tsx
src/modules/revolutionary-ai/AuditAssistant.tsx
src/modules/nauti-people/components/RecruitmentPipeline.tsx
src/modules/nauti-people/components/ClimateEngagement.tsx
src/modules/medical-infirmary/components/ReportsTab.tsx
src/modules/medical-infirmary/components/CrewHealthTab.tsx
src/modules/hr/employee-portal/components/EmployeePayroll.tsx
src/hooks/useSessionsReplayData.ts
src/hooks/useSessionReplayData.ts
src/hooks/usePredictiveMaintenanceData.ts
src/hooks/usePayrollData.ts
src/hooks/useNotificationsCenterData.ts
src/hooks/useMaintenancePredictionsData.ts
src/hooks/useLiveInventoryData.ts
src/hooks/useInventoryMapData.ts
src/hooks/useEmployeePortalData.ts
src/hooks/useDPIncidentsData.ts
src/hooks/useCrewWellnessData.ts
src/hooks/useCrewTrainingData.ts
src/hooks/useCommunicationData.ts
src/hooks/useAutonomousAgentActionsData.ts
src/components/voice/HotwordDetector.tsx
src/components/testing/test-environment-config.tsx
src/components/sgso/TrainingCompliance.tsx
src/components/sgso/SGSOPDFReportGenerator.tsx
src/components/sgso/NonConformityManager.tsx
src/components/sgso/IncidentReporting.tsx
src/components/sgso/CAPAManager.tsx
src/components/sgso/AuditPlanner.tsx
src/components/replay/SessionReplayViewer.tsx
src/components/portal/EmployeeTrainingPortal.tsx
src/components/portal/EmployeePaymentsHistory.tsx
src/components/monitoring/NOCCommandCenter.tsx
src/components/maintenance/MaintenanceOCRWorkflow.tsx
src/components/logistics/SmartRoutesMap.tsx
src/components/imca-audit/IMCAAuditEvents.tsx
src/components/fleet/VesselHistoryCRUD.tsx
src/components/fleet/FleetCommandDashboard.tsx
src/components/fleet/DigitalTwinInteractive.tsx
src/components/crew/CrewWellnessDashboard.tsx
src/components/connectivity/SatelliteOptimizerDashboard.tsx
src/components/compliance/diagnostic/CertificateExpirationAlerts.tsx
src/components/compliance/advanced/AutomaticReportsScheduler.tsx
src/components/communication/CommunicationCenterProfessional.tsx
src/components/bi/JobsForecastReport.examples.tsx
src/components/automation/ai-suggestions-panel.tsx
src/components/ai/AutonomousAgentPanel.tsx
src/components/ai/AIObservabilityDashboard.tsx
src/components/ai/AIExplainabilityPanel.tsx
```

---

## 🔴 2. ARQUIVOS COM Promise.resolve FAKE (12 arquivos)

### Padrão: `return Promise.resolve(`

```
src/tests/system-validation.test.ts
src/tests/pages/admin/restore/personal.test.tsx
src/tests/pages/admin/reports/assistant-cron-status.test.tsx
src/tests/pages/admin/documents/restore-dashboard-enhancements.test.tsx
src/tests/pages/admin/documents/DocumentView-comments.test.tsx
src/tests/pages/admin/assistant-logs.test.tsx
src/tests/components/dp-intelligence/dp-intelligence-center.test.tsx
src/lib/performance/smart-loader.ts
src/lib/performance/critical-resource-loader.ts
src/lib/mqtt/publisher.ts
src/lib/AI/audit-logger.ts
src/hooks/useLoopGuard.ts
```

---

## 🔴 3. ARQUIVOS COM setTimeout SIMULANDO API (3 arquivos)

### Padrão: `setTimeout(.+resolve`

```
src/tests/jobs-forecast-report.test.tsx
src/tests/components/templates/template-editor-with-rewrite.test.tsx
src/lib/performance/connection-aware.ts
```

---

## 🟡 4. ARQUIVOS COM TODO/PLACEHOLDER/FIXME (20 arquivos)

```
src/pages/FleetCommandCenter.tsx
src/services/space-weather/space-weather-monitoring.service.ts
src/services/space-weather/celestrak.service.ts
src/pages/admin/org-360.tsx
src/pages/admin/module-llm-helper.tsx
src/modules/templates/index.tsx
src/modules/system-watchdog/watchdog-service.ts
src/modules/performance/PerformanceDashboard.tsx
src/modules/features/checklists/hooks/useChecklists.ts
src/mobile/services/enhanced-sync-engine.ts
src/hooks/useDashboardStats.ts
src/hooks/use-restore-logs-summary.ts
src/hooks/use-maritime-checklists.ts
src/components/workflows/WorkflowAIScoreCard.tsx
src/components/maritime/hr-dashboard.tsx
src/components/maritime-checklists/machine-routine-checklist.tsx
src/components/maintenance/MaintenanceDashboard.tsx
src/components/integration/api-hub-nautilus.tsx
src/components/fleet/FleetCommandCenter.tsx
src/components/ai/nautilus-copilot-advanced.tsx
```

---

## 🟡 5. ARQUIVOS COM @ts-ignore/@ts-nocheck (168 arquivos)

### TOP 50 MAIS CRÍTICOS (não-testes):

```
src/pages/admin/sgso/review/[id].tsx
src/pages/admin/workflows/detail.tsx
src/pages/dashboard/QualityDashboard.tsx
src/utils/performance-utils.ts
src/services/sgso-audit-service.ts
src/services/mmi/similaritySearch.ts
src/services/mmi/historyService.ts
src/services/finance-hub.service.ts
src/services/coordinationAIService.ts
src/security/trustComplianceChecker.ts
src/pages/documents/ai.tsx
src/pages/dashboard/i18n.tsx
src/pages/ai/learning-dashboard.tsx
src/pages/admin/templates/validation.tsx
src/pages/admin/templates/editor.tsx
src/pages/admin/templates/edit/[id].tsx
src/pages/admin/satellite-tracker.tsx
src/pages/admin/reports/logs.tsx
src/pages/admin/reports/dashboard-logs.tsx
src/pages/admin/performance-profiler.tsx
src/pages/admin/performance-dashboard.tsx
src/pages/admin/peodp-wizard-complete.tsx
src/pages/admin/logistics-hub.tsx
src/pages/admin/event-timeline.tsx
src/pages/admin/documents/templates-dynamic.tsx
src/pages/admin/documents/restore-dashboard.tsx
src/pages/admin/documents/apply-template-demo.tsx
src/pages/Roadmap.tsx
src/pages/AuditoriaTecnica.tsx
src/modules/workflow-visual/index.tsx
src/modules/underwater-drone/services/underwaterMissionService.ts
src/modules/underwater-drone/services/droneMissionService.ts
src/modules/travel/components/TravelReservations.tsx
src/modules/travel/TravelManagement.tsx
src/modules/sonar-ai/services/enhanced-ai-service.ts
src/modules/satellite/services/satellite-orbit-persistence.ts
src/modules/satellite/SatelliteTrackerEnhanced.tsx
src/modules/satcom/components/SatcomTerminal.tsx
src/modules/satcom/components/CommunicationHistory.tsx
src/modules/price-alerts/services/price-alerts-service.ts
src/modules/price-alerts/index.tsx
src/modules/performance/PerformanceMonitoringDashboard.tsx
src/modules/operations/fleet-telemetry/index.tsx
src/modules/operational-calendar/index.tsx
src/modules/ocean-sonar/services/sonarPersistenceService.ts
src/modules/mission-control/services/mission-control-service.ts
src/modules/mission-control/services/jointTasking.ts
src/modules/mission-control/components/RealTimeMissionDashboard.tsx
src/modules/maintenance-planner/components/MaintenanceCalendarView.tsx
src/modules/incident-reports/services/incidentReplayService.ts
```

---

## 🟡 6. ARQUIVOS COM console.log (100+ arquivos)

### TOP 50 MAIS CRÍTICOS:

```
src/utils/moduleStatus.ts
src/utils/PreOVIDRealtimeAudio.ts
src/services/weather/unified-weather.service.ts
src/services/weather/tide-alerts.service.ts
src/services/weather/open-meteo.service.ts
src/services/weather/marinha-brasil.service.ts
src/services/weather/cptec-inpe.service.ts
src/services/weather.ts
src/services/space-weather/hybrid-monitoring.service.ts
src/services/space-weather/dp-asog-client.service.ts
src/services/mocks/terrastar.mock.ts
src/services/mocks/starfix.mock.ts
src/services/copernicus-marine.ts
src/pages/NOC.tsx
src/pages/Login.tsx
src/pages/FuelOptimizerPage.tsx
src/pages/CharterPartyV2.tsx
src/modules/satellite/services/satellite-orbit-service.ts
src/modules/satellite-tracker/components/SatelliteAICopilot.tsx
src/modules/satcom/index.tsx
src/modules/performance/PerformanceDashboard.tsx
src/modules/operations/fleet-telemetry/index.tsx
src/modules/operations/crew-rotation/index.tsx
src/modules/mission-control/mobile/syncService.ts
src/modules/incident-reports/components/IncidentWorkflow.tsx
src/modules/fleet/index.tsx
src/modules/features/price-alerts/components/NotificationsPanel.tsx
src/modules/deep-risk-ai/services/deep-risk-ai-service.ts
src/modules/compliance/compliance-reports/components/ScheduledReports.tsx
src/mobile/services/syncQueue.ts
src/mobile/services/sqlite-storage.ts
src/mobile/hooks/useWorker.ts
src/mobile/hooks/useSyncManager.ts
src/lib/web-vitals-reporter.ts
src/lib/validation/auto-validator.ts
src/lib/tracing/distributed-trace.ts
src/lib/testing/e2e-test-suite.ts
src/lib/telemetry/otel-config.ts
src/lib/telemetry/index.ts
src/lib/system-diagnostic/package-generator.ts
src/lib/system-diagnostic/integration-validator.ts
src/lib/system-diagnostic/diagnostic-engine.ts
src/lib/system-diagnostic/ai-integration-checker.ts
src/lib/syncEngine.ts
src/lib/sw-update-manager.ts
src/lib/support/knowledge-base.ts
src/lib/service-worker-register.ts
src/lib/security.ts
src/lib/routing/weather-routing.ts
src/lib/realtime/websocket-optimizer.ts
```

---

## 🟡 7. ARQUIVOS COM TypeScript `any` (TOP 30 - não types/)

```
src/hooks/useAuditLog.ts
src/pages/ai/VoyageLogisticsAIPage.tsx
src/pages/admin/mmi/forecast/page.tsx
src/pages/admin/mmi/forecast/ForecastHistory.tsx
src/pages/admin/workflows/index.tsx
src/components/voice/VoiceAssistantWithHotword.tsx
src/pages/dashboard/QualityDashboard.tsx
src/pages/intelligence/CompetitiveIntelligenceDashboard.tsx
src/pages/mission-control/workflow-engine.tsx
src/pages/mission-control/insight-dashboard.tsx
src/pages/FleetCommandCenter.tsx
src/hooks/unified/usePerformanceMetrics.ts
src/mobile/components/VoiceInterface.tsx
src/validations/patches/606.ts
src/utils/templates/exportToPDF.ts
src/utils/safeLazyImport.tsx
src/utils/pwa-utils.ts
src/utils/code-analyzer.ts
src/ui/reaction-mapper/types.ts
src/ui/reaction-mapper/ReactionMapper.tsx
src/services/weather/unified-weather.service.ts
src/services/weather/open-meteo.service.ts
src/services/weather/cptec-inpe.service.ts
src/services/weather.ts
src/services/voice.service.ts
src/services/unified/smart-drills.unified.ts
src/services/unified/reporting-engine.unified.ts
src/services/unified/offline-cache.unified.ts
src/services/unified/offline-cache.service.ts
src/services/travel-price-service.ts
```

---

## 🔧 COMANDOS PARA LIMPEZA

### Remover console.logs:
```bash
# Grep para encontrar
grep -r "console\.log(" src/ --include="*.ts" --include="*.tsx" | wc -l

# Script para remover (cuidado!)
# find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/console\.log(.*);?//g'
```

### Encontrar todos os mocks:
```bash
grep -rn "MOCK_\|SAMPLE_\|FAKE_\|mockData\|sampleData" src/ --include="*.ts" --include="*.tsx"
```

### Encontrar Promise.resolve fake:
```bash
grep -rn "return Promise\.resolve(" src/ --include="*.ts" --include="*.tsx"
```

### Encontrar @ts-ignore:
```bash
grep -rn "@ts-ignore\|@ts-nocheck" src/ --include="*.ts" --include="*.tsx"
```

### Encontrar uso de any:
```bash
grep -rn ": any\b" src/ --include="*.ts" --include="*.tsx"
```

---

## 📊 PRIORIZAÇÃO

### 🔴 ALTA PRIORIDADE (Corrigir imediatamente):
1. Hooks com dados mockados (14 arquivos)
2. Promise.resolve fake em lib/ (3 arquivos)
3. Services com mock (2 arquivos)

### 🟡 MÉDIA PRIORIDADE (Corrigir em 2 semanas):
1. console.logs em services/ e pages/
2. @ts-ignore em arquivos de produção
3. Componentes com dados mock

### 🟢 BAIXA PRIORIDADE (Backlog):
1. console.logs em lib/ e testes
2. @ts-ignore em arquivos de teste
3. TypeScript any em types/

---

**FIM DA LISTA TÉCNICA**
