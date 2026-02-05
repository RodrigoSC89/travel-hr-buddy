/**
 * Modules Index - Centralized Exports
 * Provides easy access to all module components
 * Updated: PATCH UNIFY-3.0 - Module Consolidation Phase 3
 * 
 * NOTE: Barrel exports (export * from) removed to prevent heap overflow
 * during build. Import directly from submodules when needed.
 */

// ============================================
// CORE MODULES
// ============================================
export { default as Dashboard } from "@/pages/CentralComando";
export { default as SystemWatchdog } from "./system-watchdog/SystemWatchdog";

// ============================================
// OPERATIONS MODULES (UNIFIED → FLEET OPERATIONS)
// ============================================
export { default as FleetModule } from "./fleet";
export { default as CrewManagement } from "./crew-management";
export { default as OperationsDashboard } from "./operations";
export { default as FleetOperations } from "./fleet-operations";

// ============================================
// MAINTENANCE (UNIFIED → NAUTILUS MAINTENANCE)
// ============================================
export { default as MaintenancePlanner } from "./maintenance-planner";
export { default as NautilusMaintenance } from "./nauti-maintenance";

// ============================================
// MISSION CONTROL
// ============================================
export { default as MissionControl } from "./mission-control";

// ============================================
// VOYAGE & ROUTES (UNIFIED → NAUTILUS VOYAGE)
// ============================================
// NautilusVoyage and VoyagePlanner moved to VoyageCommandCenter
// export { default as NautilusVoyage } from "./nauti-voyage";
// export { default as VoyagePlanner } from "./voyage-planner";

// ============================================
// COMMUNICATION & CONNECTIVITY (UNIFIED → SATCOM & NAUTILUS COMMS)
// ============================================
export { CommunicationCenter } from "./communication-center";
export { default as SatcomDashboard } from "./satcom";
export { default as NautilusComms } from "./nauti-comms";

// ============================================
// SATELLITE (UNIFIED → NAUTILUS SATELLITE)
// ============================================
export { default as NautilusSatellite } from "./nauti-satellite";

// ============================================
// INTELLIGENCE & AI MODULES (UNIFIED → NAUTILUS AI HUB)
// NOTE: Import directly from "./ai" submodule to avoid loading all AI code
// ============================================
export { default as NautilusAIHub } from "./nauti-ai-hub";

// ============================================
// AUTOMATION (UNIFIED → NAUTILUS AUTOMATION)
// ============================================
export { default as NautilusAutomation } from "./nauti-automation";

// ============================================
// SUBSEA OPERATIONS (UNIFIED)
// ============================================
export { default as SubseaOperations } from "./subsea-operations";

// ============================================
// COMPLIANCE MODULES
// NOTE: Import directly from "./compliance" submodule to avoid loading all code
// ============================================
export { default as AuditCenter } from "./compliance/audit-center";
export { default as SGSOSystem } from "./compliance/sgso";

// ============================================
// ANALYTICS
// ============================================
export { default as AnalyticsCore } from "./analytics";

// ============================================
// TRACKING & TELEMETRY (UNIFIED)
// ============================================
export { default as TrackingTelemetry } from "./tracking-telemetry";
export { default as TrackingCommandCenter } from "./tracking-telemetry/components/TrackingCommandCenter";

// ============================================
// HR & TRAINING (UNIFIED → NAUTILUS ACADEMY & PEOPLE HUB)
// ============================================
export { default as NautilusAcademy } from "./nauti-academy";
export { default as NautilusPeople } from "./nauti-people";

// ============================================
// DOCUMENTS (UNIFIED → NAUTILUS DOCUMENTS)
// ============================================
export { default as NautilusDocuments } from "./nauti-documents";
export { default as IncidentReports } from "./incident-reports";
export { default as DocumentHub } from "./document-hub";

// ============================================
// ASSISTANTS (UNIFIED → NAUTILUS ASSISTANT)
// ============================================
export { default as NautilusAssistant } from "./nauti-assistant";
export { default as VoiceAssistant } from "./assistants/voice-assistant";

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
// REMOVED: SmartMobility redirect - merged into TravelCommandCenter

// ============================================
// PROCUREMENT & INVENTORY (UNIFIED)
// ============================================
export { default as ProcurementInventory } from "./procurement-inventory";

// ============================================
// REGISTRY & UTILITIES
// ============================================
export { MODULE_REGISTRY, type ModuleDefinition } from "./registry";
export { loadModule, preloadModule, getModuleMetadata, moduleExists } from "./loader";
export { validateAllModules, runIntegrationCheck, getActiveModules, getNavigationRoutes } from "./integration-validator";
export { MODULE_DOMAINS, getModulesByDomain, getDomainForModule, getDomainRoutes } from "./domain-index";
