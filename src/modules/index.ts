/**
 * Modules Index - Centralized Exports
 * Provides easy access to all module components
 * Updated: PATCH Integration
 */

// Core Modules
export { default as Dashboard } from "@/pages/Dashboard";
export { default as SystemWatchdog } from "./system-watchdog/SystemWatchdog";

// Operations Modules
export { default as FleetModule } from "./fleet";
export { default as CrewManagement } from "./crew-management";
export { default as OperationsDashboard } from "./operations";
export { default as MaintenancePlanner } from "./maintenance-planner";

// Communication Modules
export { CommunicationCenter } from "./communication-center";
export { default as SatcomDashboard } from "./satcom";

// Intelligence & AI Modules
export * from "./ai";

// Compliance Modules
export * from "./compliance";

// Analytics
export { default as AnalyticsCore } from "./analytics";

// HR & Training
export { default as TrainingAcademy } from "./training";

// Mission Control
export { default as MissionControl } from "./mission-control";

// Incident Reports
export { default as IncidentReports } from "./incident-reports";

// Documents
export { default as DocumentHub } from "./document-hub";

// Finance
export { default as FinanceHub } from "./finance";

// Medical
export { default as MedicalInfirmary } from "./medical-infirmary";

// ESG & Safety
export { default as ESGEmissions } from "./esg-emissions";
export { default as SafetyGuardian } from "./safety-guardian";
export { default as SmartMobility } from "./smart-mobility";

// Assistants
export { default as VoiceAssistant } from "./assistants/voice-assistant";

// Re-export registry
export { MODULE_REGISTRY, type ModuleDefinition } from "./registry";
