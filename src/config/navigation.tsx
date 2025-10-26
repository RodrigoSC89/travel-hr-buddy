import { safeLazyImport } from "@/utils/safeLazyImport";

// Navegação principal do Nautilus One
export const NAVIGATION = [
  { name: "Dashboard", path: "/dashboard", component: safeLazyImport(() => import("@/modules/ui/dashboard/Dashboard"), "Dashboard") },
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
  { name: "PEO-DP", path: "/peo-dp", component: safeLazyImport(() => import("@/modules/hr/peo-dp/PEODPPanel"), "PEO-DP") },
];

export const SuspenseFallback = <div className="p-8 text-center text-gray-400">🔄 Carregando módulo...</div>;
