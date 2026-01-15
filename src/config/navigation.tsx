import { safeLazyImport } from "@/utils/safeLazyImport";

// Navegação principal do Nauti One
// PATCH UNIFY-FINAL: Nauti Command Center é o ponto de entrada principal
export const NAVIGATION = [
  { name: "Nauti Command Center", path: "/nautilus-command", component: safeLazyImport(() => import("@/pages/NautilusCommand"), "Nauti Command Center") },
  // PATCH 192.0: Unified Fleet Command Center (fusão de 3 módulos)
  { name: "Fleet Command Center", path: "/fleet-command", component: safeLazyImport(() => import("@/pages/FleetCommandCenter"), "Fleet Command Center") },
  { name: "Sistema Marítimo", path: "/sistema-maritimo", component: safeLazyImport(() => import("@/pages/FleetCommandCenter"), "Fleet Command Center") },
  { name: "Fleet Management", path: "/fleet", component: safeLazyImport(() => import("@/pages/FleetCommandCenter"), "Fleet Command Center") },
  // PATCH UNIFY-9.0: Maritime Command Center (fusão de 4 módulos marítimos)
  { name: "Maritime Command Center", path: "/maritime-command", component: safeLazyImport(() => import("@/pages/MaritimeCommandCenter"), "Maritime Command Center") },
  { name: "Maritime", path: "/maritime", component: safeLazyImport(() => import("@/pages/MaritimeCommandCenter"), "Maritime Command Center") },
  { name: "Tripulação", path: "/crew", component: safeLazyImport(() => import("@/pages/CrewManagement"), "Crew Management") },
  { name: "Checklists Marítimos", path: "/maritime-checklists", component: safeLazyImport(() => import("@/pages/MaritimeChecklists"), "Maritime Checklists") },
  { name: "Certificações Marítimas", path: "/maritime-certifications", component: safeLazyImport(() => import("@/pages/MaritimeCertifications"), "Maritime Certifications") },
  { name: "DP Intelligence", path: "/dp-intelligence", component: safeLazyImport(() => import("@/modules/intelligence/dp-intelligence/DPIntelligenceCenter"), "DP Intelligence") },
  { name: "BridgeLink", path: "/bridgelink", component: safeLazyImport(() => import("@/modules/control/bridgelink/BridgeLinkDashboard"), "BridgeLink") },
  // PATCH UNIFY-10.0: Weather Command Center (fusão de 2 módulos meteorológicos)
  { name: "Weather Command Center", path: "/weather-command", component: safeLazyImport(() => import("@/pages/WeatherCommandCenter"), "Weather Command Center") },
  { name: "Weather Dashboard", path: "/weather-dashboard", component: safeLazyImport(() => import("@/pages/WeatherDashboard"), "Weather Dashboard") },
  { name: "Forecast Global", path: "/forecast-global", component: safeLazyImport(() => import("@/modules/control/forecast-global/ForecastConsole"), "Forecast Global") },
  { name: "Control Hub", path: "/control-hub", component: safeLazyImport(() => import("@/modules/control/control-hub/ControlHubPanel"), "Control Hub") },
  // PATCH UNIFY-3.0: Unified Maintenance Command Center (fusão de 8 módulos de manutenção)
  { name: "Maintenance Command Center", path: "/maintenance-command", component: safeLazyImport(() => import("@/pages/MaintenanceCommandCenter"), "Maintenance Command Center") },
  { name: "Manutenção Inteligente", path: "/intelligent-maintenance", component: safeLazyImport(() => import("@/modules/intelligent-maintenance"), "Manutenção Inteligente") },
  { name: "MMI - Manutenção", path: "/mmi", component: safeLazyImport(() => import("@/pages/MMI"), "MMI") },
  { name: "Procurement & Inventory", path: "/procurement-inventory", component: safeLazyImport(() => import("@/modules/procurement-inventory"), "Procurement & Inventory") },
  // PATCH UNIFY-8.0: Unified Mission Command Center (fusão de 2 módulos de missão)
  { name: "Mission Command Center", path: "/mission-command", component: safeLazyImport(() => import("@/pages/MissionCommandCenter"), "Mission Command Center") },
  { name: "Mission Logs", path: "/mission-logs", component: safeLazyImport(() => import("@/pages/MissionLogsPage"), "Mission Logs") },
  { name: "Mission Control", path: "/mission-control", component: safeLazyImport(() => import("@/modules/mission-control"), "Mission Control") },
  { name: "SOLAS, ISPS & ISM Training", path: "/solas-isps-training", component: safeLazyImport(() => import("@/modules/solas-isps-training"), "SOLAS, ISPS & ISM Training") },
  { name: "FMEA Expert", path: "/fmea-expert", component: safeLazyImport(() => import("@/modules/planning/fmea/FMEAExpert"), "FMEA Expert") },
  { name: "SGSO", path: "/sgso", component: safeLazyImport(() => import("@/modules/compliance/sgso/SGSOSystem"), "SGSO") },
  { name: "MLC Inspection", path: "/mlc-inspection", component: safeLazyImport(() => import("@/modules/compliance/mlc-inspection"), "MLC Inspection") },
  // PATCH UNIFY-11.0: AI Command Center (fusão de 4 módulos de IA)
  { name: "AI Command Center", path: "/ai-command", component: safeLazyImport(() => import("@/pages/AICommandCenter"), "AI Command Center") },
  { name: "Revolutionary AI", path: "/revolutionary-ai", component: safeLazyImport(() => import("@/pages/RevolutionaryAI"), "Revolutionary AI") },
  { name: "AI Dashboard", path: "/ai-dashboard", component: safeLazyImport(() => import("@/pages/ai/AIDashboard"), "AI Dashboard") },
  { name: "AI Insights", path: "/ai-insights", component: safeLazyImport(() => import("@/pages/AIInsights"), "AI Insights") },
  { name: "Automation", path: "/automation", component: safeLazyImport(() => import("@/pages/Automation"), "Automation") },
  { name: "Real-Time Workspace", path: "/real-time-workspace", component: safeLazyImport(() => import("@/modules/workspace/real-time-workspace"), "Real-Time Workspace") },
  // PATCH UNIFY-12.0: Workflow Command Center (fusão de 4 módulos de workflow)
  { name: "Workflow Command Center", path: "/workflow-command", component: safeLazyImport(() => import("@/pages/WorkflowCommandCenter"), "Workflow Command Center") },
  { name: "Workflow", path: "/workflow", component: safeLazyImport(() => import("@/pages/Workflow"), "Workflow") },
  { name: "Nauti People Hub", path: "/nautilus-people", component: safeLazyImport(() => import("@/modules/nautilus-people"), "Nauti People Hub") },
  { name: "PEO-DP", path: "/peo-dp", component: safeLazyImport(() => import("@/modules/hr/peo-dp/PEODPPanel"), "PEO-DP") },
  { name: "System Diagnostic", path: "/system-diagnostic", component: safeLazyImport(() => import("@/pages/SystemDiagnostic"), "System Diagnostic") },
  { name: "Execution Roadmap", path: "/execution-roadmap", component: safeLazyImport(() => import("@/pages/ExecutionRoadmap"), "Execution Roadmap") },
  { name: "Usage Simulation", path: "/usage-simulation", component: safeLazyImport(() => import("@/pages/UsageSimulation"), "Usage Simulation") },
];

export const SuspenseFallback = <div className="p-8 text-center text-gray-400">🔄 Carregando módulo...</div>;
