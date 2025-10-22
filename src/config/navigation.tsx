import { safeLazyImport } from "@/utils/safeLazyImport";

// Navegação principal do Nautilus One
export const NAVIGATION = [
  { name: "Dashboard", path: "/dashboard", component: safeLazyImport(() => React.lazy(() => import(import("@/modules/dashboard/Dashboard"), "Dashboard"))) },
  { name: "Sistema Marítimo", path: "/sistema-maritimo", component: safeLazyImport(() => React.lazy(() => import(import("@/modules/sistema-maritimo/MaritimeSystem"), "Sistema Marítimo"))) },
  { name: "DP Intelligence", path: "/dp-intelligence", component: safeLazyImport(() => React.lazy(() => import(import("@/modules/dp-intelligence/DPIntelligenceCenter"), "DP Intelligence"))) },
  { name: "BridgeLink", path: "/bridgelink", component: safeLazyImport(() => React.lazy(() => import(import("@/modules/bridgelink/BridgeLinkDashboard"), "BridgeLink"))) },
  { name: "Forecast Global", path: "/forecast-global", component: safeLazyImport(() => React.lazy(() => import(import("@/modules/forecast-global/ForecastConsole"), "Forecast Global"))) },
  { name: "Control Hub", path: "/control-hub", component: safeLazyImport(() => React.lazy(() => import(import("@/modules/control-hub/ControlHubPanel"), "Control Hub"))) },
  { name: "MMI", path: "/mmi", component: safeLazyImport(() => React.lazy(() => import(import("@/modules/mmi/MaintenanceIntelligence"), "MMI"))) },
  { name: "FMEA Expert", path: "/fmea-expert", component: safeLazyImport(() => React.lazy(() => import(import("@/modules/fmea/FMEAExpert"), "FMEA Expert"))) },
  { name: "SGSO", path: "/sgso", component: safeLazyImport(() => React.lazy(() => import(import("@/modules/sgso/SGSOSystem"), "SGSO"))) },
  { name: "PEO-DP", path: "/peo-dp", component: safeLazyImport(() => React.lazy(() => import(import("@/modules/peo-dp/PEODPPanel"), "PEO-DP"))) },
  { name: "Documentos IA", path: "/documentos-ia", component: safeLazyImport(() => React.lazy(() => import(import("@/modules/documentos-ia/DocumentsAI"), "Documentos IA"))) },
  { name: "Templates", path: "/templates", component: safeLazyImport(() => React.lazy(() => import(import("@/modules/templates/TemplatesPanel"), "Templates"))) },
  { name: "Assistente IA", path: "/assistente-ia", component: safeLazyImport(() => React.lazy(() => import(import("@/modules/assistente-ia/AIChatAssistant"), "Assistente IA"))) },
  { name: "Smart Workflow", path: "/smart-workflow", component: safeLazyImport(() => React.lazy(() => import(import("@/modules/smart-workflow/SmartWorkflow"), "Smart Workflow"))) },
  { name: "Analytics Avançado", path: "/analytics-avancado", component: safeLazyImport(() => React.lazy(() => import(import("@/modules/analytics-avancado/AdvancedAnalytics"), "Analytics Avançado"))) },
  { name: "Analytics Tempo Real", path: "/analytics-tempo-real", component: safeLazyImport(() => React.lazy(() => import(import("@/modules/analytics-tempo-real/RealTimeAnalytics"), "Analytics Tempo Real"))) },
  { name: "Colaboração", path: "/colaboracao", component: safeLazyImport(() => React.lazy(() => import(import("@/modules/colaboracao/CollaborationPanel"), "Colaboração"))) },
  { name: "Centro de Ajuda", path: "/centro-ajuda", component: safeLazyImport(() => React.lazy(() => import(import("@/modules/centro-ajuda/HelpCenter"), "Centro de Ajuda"))) },
  { name: "Visão Geral", path: "/visao-geral", component: safeLazyImport(() => React.lazy(() => import(import("@/modules/visao-geral/SystemOverview"), "Visão Geral"))) },
];

export const SuspenseFallback = <div className="p-8 text-center text-gray-400">🔄 Carregando módulo...</div>;
