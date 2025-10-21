import { safeLazyImport } from "@/utils/safeLazyImport";

// Navegação principal do Nautilus One com safeLazyImport
export const NAVIGATION = [
  { name: "Dashboard", path: "/dashboard", component: safeLazyImport(() => import("@/modules/dashboard/Dashboard"), "Dashboard") },
  { name: "Sistema Marítimo", path: "/sistema-maritimo", component: safeLazyImport(() => import("@/modules/sistema-maritimo/MaritimeSystem"), "Sistema Marítimo") },
  { name: "DP Intelligence", path: "/dp-intelligence", component: safeLazyImport(() => import("@/modules/dp-intelligence/DPIntelligenceCenter"), "DP Intelligence") },
  { name: "BridgeLink", path: "/bridgelink", component: safeLazyImport(() => import("@/modules/bridgelink/BridgeLinkDashboard"), "BridgeLink") },
  { name: "Forecast Global", path: "/forecast-global", component: safeLazyImport(() => import("@/modules/forecast-global/ForecastConsole"), "Forecast Global") },
  { name: "Control Hub", path: "/control-hub", component: safeLazyImport(() => import("@/modules/control-hub/ControlHubPanel"), "Control Hub") },
  { name: "MMI", path: "/mmi", component: safeLazyImport(() => import("@/modules/mmi/MaintenanceIntelligence"), "MMI") },
  { name: "FMEA Expert", path: "/fmea-expert", component: safeLazyImport(() => import("@/modules/fmea/FMEAExpert"), "FMEA Expert") },
  { name: "SGSO", path: "/sgso", component: safeLazyImport(() => import("@/modules/sgso/SGSOSystem"), "SGSO") },
  { name: "PEO-DP", path: "/peo-dp", component: safeLazyImport(() => import("@/modules/peo-dp/PEODPPanel"), "PEO-DP") },
  { name: "Documentos IA", path: "/documentos-ia", component: safeLazyImport(() => import("@/modules/documentos-ia/DocumentsAI"), "Documentos IA") },
  { name: "Templates", path: "/templates", component: safeLazyImport(() => import("@/modules/templates/TemplatesPanel"), "Templates") },
  { name: "Assistente IA", path: "/assistente-ia", component: safeLazyImport(() => import("@/modules/assistente-ia/AIChatAssistant"), "Assistente IA") },
  { name: "Smart Workflow", path: "/smart-workflow", component: safeLazyImport(() => import("@/modules/smart-workflow/SmartWorkflow"), "Smart Workflow") },
  { name: "Analytics Avançado", path: "/analytics-avancado", component: safeLazyImport(() => import("@/modules/analytics-avancado/AdvancedAnalytics"), "Analytics Avançado") },
  { name: "Analytics Tempo Real", path: "/analytics-tempo-real", component: safeLazyImport(() => import("@/modules/analytics-tempo-real/RealTimeAnalytics"), "Analytics Tempo Real") },
  { name: "Colaboração", path: "/colaboracao", component: safeLazyImport(() => import("@/modules/colaboracao/CollaborationPanel"), "Colaboração") },
  { name: "Centro de Ajuda", path: "/centro-ajuda", component: safeLazyImport(() => import("@/modules/centro-ajuda/HelpCenter"), "Centro de Ajuda") },
  { name: "Visão Geral", path: "/visao-geral", component: safeLazyImport(() => import("@/modules/visao-geral/SystemOverview"), "Visão Geral") },
];

export const SuspenseFallback = <div className="p-8 text-center text-gray-400">🔄 Carregando módulo...</div>;
