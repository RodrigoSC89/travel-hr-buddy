/**
 * BridgeLink Module
 * 
 * Painel Vivo de Operação com IA contextual
 * Centraliza dados de navegação, ASOG, FMEA e DP
 * 
 * @module bridgelink
 */

export { default as BridgeLinkDashboard } from "./BridgeLinkDashboard";

// Components
export { LiveDecisionMap } from "./components/LiveDecisionMap";
export { DPStatusCard } from "./components/DPStatusCard";
export { RiskAlertPanel } from "./components/RiskAlertPanel";

// Hooks
export { useBridgeLinkData } from "./hooks/useBridgeLinkData";

// Services
export {
  getBridgeLinkData,
  connectToLiveStream,
  exportReportPDF,
  exportReportJSON,
} from "./services/bridge-link-api";

// Types
export type {
  DPEvent,
  RiskAlert,
  SystemStatus,
  BridgeLinkData,
  ASGOEvent,
  FMEAAnalysis,
} from "./types";
