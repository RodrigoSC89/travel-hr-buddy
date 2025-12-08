/**
 * Modules Index - Centralized Exports
 * Provides easy access to all module components
 * Updated: PATCH UNIFY-1.0 - Module Consolidation
 * 
 * FUSÃO DE MÓDULOS:
 * - Treinamento → Nautilus Academy (unified)
 * - Logística → Procurement & Inventory (unified)
 * - Conectividade → SATCOM Dashboard (unified)
 * - RH → Nautilus People Hub (unified)
 */

// ============================================
// CORE MODULES
// ============================================
export { default as Dashboard } from "@/pages/Dashboard";
export { default as SystemWatchdog } from "./system-watchdog/SystemWatchdog";

// ============================================
// OPERATIONS MODULES
// ============================================
export { default as FleetModule } from "./fleet";
export { default as CrewManagement } from "./crew-management";
export { default as OperationsDashboard } from "./operations";
export { default as MaintenancePlanner } from "./maintenance-planner";
export { default as MissionControl } from "./mission-control";

// ============================================
// COMMUNICATION & CONNECTIVITY (UNIFIED → SATCOM)
// ============================================
export { CommunicationCenter } from "./communication-center";
export { default as SatcomDashboard } from "./satcom";
// Deprecated: Use SatcomDashboard instead
// export { default as MaritimeConnectivity } from "./satcom"; // Redirected
// export { default as ConnectivityPanel } from "./satcom"; // Redirected

// ============================================
// INTELLIGENCE & AI MODULES
// ============================================
export * from "./ai";

// ============================================
// COMPLIANCE MODULES
// ============================================
export * from "./compliance";

// ============================================
// ANALYTICS
// ============================================
export { default as AnalyticsCore } from "./analytics";

// ============================================
// HR & TRAINING (UNIFIED → NAUTILUS ACADEMY & PEOPLE HUB)
// ============================================
// Unified Training Module - All training modules redirect here
export { default as NautilusAcademy } from "./nautilus-academy";
// Unified HR Module - All HR modules redirect here
export { default as NautilusPeople } from "./nautilus-people";
// Deprecated: These now redirect to NautilusAcademy
// export { default as SolasTraining } from "./nautilus-academy"; // Redirected
// export { default as SolasIspsTraining } from "./nautilus-academy"; // Redirected

// ============================================
// DOCUMENTS
// ============================================
export { default as IncidentReports } from "./incident-reports";
export { default as DocumentHub } from "./document-hub";

// ============================================
// FINANCE
// ============================================
export { default as FinanceHub } from "./finance";

// ============================================
// MEDICAL
// ============================================
export { default as MedicalInfirmary } from "./medical-infirmary";

// ============================================
// ESG & SAFETY
// ============================================
export { default as ESGEmissions } from "./esg-emissions";
export { default as SafetyGuardian } from "./safety-guardian";
export { default as SmartMobility } from "./smart-mobility";

// ============================================
// ASSISTANTS
// ============================================
export { default as VoiceAssistant } from "./assistants/voice-assistant";

// ============================================
// PROCUREMENT & INVENTORY (UNIFIED)
// ============================================
// Unified Logistics Module - All procurement/logistics modules redirect here
export { default as ProcurementInventory } from "./procurement-inventory";
// Deprecated: These now redirect to ProcurementInventory
// export { default as AutonomousProcurement } from "./procurement-inventory"; // Redirected
// export { default as SmartLogistics } from "./procurement-inventory"; // Redirected
// export { default as LogisticsMultibase } from "./procurement-inventory"; // Redirected

// ============================================
// REGISTRY
// ============================================
export { MODULE_REGISTRY, type ModuleDefinition } from "./registry";
