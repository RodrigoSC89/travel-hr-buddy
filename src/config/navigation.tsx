import { lazy } from "react";

// Navegação principal do Nautilus One
export const NAVIGATION = [
  { name: "Dashboard", path: "/dashboard", component: lazy(() => import("@/modules/dashboard/Dashboard")) },
  { name: "Sistema Marítimo", path: "/sistema-maritimo", component: lazy(() => import("@/modules/sistema-maritimo/MaritimeSystem")) },
  { name: "DP Intelligence", path: "/dp-intelligence", component: lazy(() => import("@/modules/dp-intelligence/DPIntelligenceCenter")) },
  { name: "BridgeLink", path: "/bridgelink", component: lazy(() => import("@/modules/bridgelink/BridgeLinkDashboard")) },
  { name: "Forecast Global", path: "/forecast-global", component: lazy(() => import("@/modules/forecast-global/ForecastConsole")) },
  { name: "Control Hub", path: "/control-hub", component: lazy(() => import("@/modules/control-hub/ControlHubPanel")) },
  { name: "MMI", path: "/mmi", component: lazy(() => import("@/modules/mmi/MaintenanceIntelligence")) },
  { name: "FMEA Expert", path: "/fmea-expert", component: lazy(() => import("@/modules/fmea/FMEAExpert")) },
  { name: "SGSO", path: "/sgso", component: lazy(() => import("@/modules/sgso/SGSOSystem")) },
  { name: "PEO-DP", path: "/peo-dp", component: lazy(() => import("@/modules/peo-dp/PEODPPanel")) },
  { name: "Documentos IA", path: "/documentos-ia", component: lazy(() => import("@/modules/documentos-ia/DocumentsAI")) },
  { name: "Templates", path: "/templates", component: lazy(() => import("@/modules/templates/TemplatesPanel")) },
  { name: "Assistente IA", path: "/assistente-ia", component: lazy(() => import("@/modules/assistente-ia/AIChatAssistant")) },
  { name: "Smart Workflow", path: "/smart-workflow", component: lazy(() => import("@/modules/smart-workflow/SmartWorkflow")) },
  { name: "Analytics Avançado", path: "/analytics-avancado", component: lazy(() => import("@/modules/analytics-avancado/AdvancedAnalytics")) },
  { name: "Analytics Tempo Real", path: "/analytics-tempo-real", component: lazy(() => import("@/modules/analytics-tempo-real/RealTimeAnalytics")) },
  { name: "Colaboração", path: "/colaboracao", component: lazy(() => import("@/modules/colaboracao/CollaborationPanel")) },
  { name: "Centro de Ajuda", path: "/centro-ajuda", component: lazy(() => import("@/modules/centro-ajuda/HelpCenter")) },
  { name: "Visão Geral", path: "/visao-geral", component: lazy(() => import("@/modules/visao-geral/SystemOverview")) },
];

export const SuspenseFallback = <div className="p-8 text-center text-gray-400">🔄 Carregando módulo...</div>;
