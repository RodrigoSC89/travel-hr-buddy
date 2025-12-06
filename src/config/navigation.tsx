import { safeLazyImport } from "@/utils/safeLazyImport";

// Navegação principal do Nautilus One
export const NAVIGATION = [
  { name: "Dashboard", path: "/dashboard", component: safeLazyImport(() => import("@/modules/ui/dashboard/Dashboard"), "Dashboard") },
  { name: "Executive Dashboard", path: "/executive-dashboard", component: safeLazyImport(() => import("@/pages/ExecutiveDashboard"), "Executive Dashboard") },
  // PATCH 191.0: Consolidated Fleet Module
  { name: "Sistema Marítimo", path: "/sistema-maritimo", component: safeLazyImport(() => import("@/modules/fleet"), "Fleet Management") },
  { name: "Fleet Management", path: "/fleet", component: safeLazyImport(() => import("@/modules/fleet"), "Fleet Management") },
  { name: "DP Intelligence", path: "/dp-intelligence", component: safeLazyImport(() => import("@/modules/intelligence/dp-intelligence/DPIntelligenceCenter"), "DP Intelligence") },
  { name: "BridgeLink", path: "/bridgelink", component: safeLazyImport(() => import("@/modules/control/bridgelink/BridgeLinkDashboard"), "BridgeLink") },
  { name: "Forecast Global", path: "/forecast-global", component: safeLazyImport(() => import("@/modules/control/forecast-global/ForecastConsole"), "Forecast Global") },
  { name: "Control Hub", path: "/control-hub", component: safeLazyImport(() => import("@/modules/control/control-hub/ControlHubPanel"), "Control Hub") },
  { name: "MMI", path: "/mmi", component: safeLazyImport(() => import("@/modules/planning/mmi/MaintenanceIntelligence"), "MMI") },
  { name: "FMEA Expert", path: "/fmea-expert", component: safeLazyImport(() => import("@/modules/planning/fmea/FMEAExpert"), "FMEA Expert") },
  { name: "SGSO", path: "/sgso", component: safeLazyImport(() => import("@/modules/compliance/sgso/SGSOSystem"), "SGSO") },
  { name: "MLC Inspection", path: "/mlc-inspection", component: safeLazyImport(() => import("@/modules/compliance/mlc-inspection"), "MLC Inspection") },
  { name: "AI Insights", path: "/ai-insights", component: safeLazyImport(() => import("@/pages/AIInsights"), "AI Insights") },
  { name: "Real-Time Workspace", path: "/real-time-workspace", component: safeLazyImport(() => import("@/modules/workspace/real-time-workspace"), "Real-Time Workspace") },
  { name: "Workflow", path: "/workflow", component: safeLazyImport(() => import("@/pages/Workflow"), "Workflow") },
  // LSA/FFA Inspections - module archived
  { name: "PEO-DP", path: "/peo-dp", component: safeLazyImport(() => import("@/modules/hr/peo-dp/PEODPPanel"), "PEO-DP") },
  // PATCH 980: System Diagnostic Tools
  { name: "System Diagnostic", path: "/system-diagnostic", component: safeLazyImport(() => import("@/pages/SystemDiagnostic"), "System Diagnostic") },
  { name: "Execution Roadmap", path: "/execution-roadmap", component: safeLazyImport(() => import("@/pages/ExecutionRoadmap"), "Execution Roadmap") },
  { name: "Usage Simulation", path: "/usage-simulation", component: safeLazyImport(() => import("@/pages/UsageSimulation"), "Usage Simulation") },
];

export const SuspenseFallback = <div className="p-8 text-center text-gray-400">🔄 Carregando módulo...</div>;
