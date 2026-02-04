/**
 * Central Data Hooks Export - PATCH DATA-3.0
 * Unified export for all module data hooks with Supabase integration
 */

// Core module data hooks
export { useFinanceCommandData } from "./useFinanceCommandData";
export { useMaintenanceCommandData } from "./useMaintenanceCommandData";
export { useComplianceHubData } from "./useComplianceHubData";
export { usePeopleHubData } from "./usePeopleHubData";
export { useOperationsCommandData } from "./useOperationsCommandData";
export { useTrackingTelemetryData } from "./useTrackingTelemetryData";
export { useAIControlTowerData } from "./useAIControlTowerData";
export { useDocumentCenterData } from "./useDocumentCenterData";
export { useSystemHubData } from "./useSystemHubData";
export { useWasteManagementData } from "./useWasteManagementData";
export { useMedicalInfirmaryData } from "./useMedicalInfirmaryData";

// Re-export types for convenience
export type { VoyageData, MissionData, PortData } from "./useOperationsCommandData";
export type { AIAgent, AIDecision, AIAuditLog } from "./useAIControlTowerData";
export type { CrewMember, Training, WellnessRecord, PeopleSummary } from "./usePeopleHubData";
export type { Document, DocumentStats, DocumentCategory } from "./useDocumentCenterData";
export type { WasteTank, DischargeRecord } from "./useWasteManagementData";
