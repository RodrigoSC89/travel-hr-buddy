/**
 * Modules Index - Centralized Exports
 * Provides easy access to all module components
 * Updated: PATCH UNIFY-2.0 - Module Consolidation Phase 2
 * 
 * FUSÃO DE MÓDULOS:
 * - Treinamento → Nautilus Academy (unified)
 * - Logística → Procurement & Inventory (unified)
 * - Conectividade → SATCOM Dashboard (unified)
 * - RH → Nautilus People Hub (unified)
 * - IA & Analytics → Nautilus AI Hub (unified)
 * - Automação → Nautilus Automation (unified)
 * - Fleet & Operations → Fleet Operations Center (unified)
 * - Manutenção → Nautilus Maintenance (unified)
 * - Subsea → Subsea Operations (unified)
 */

// ============================================
// CORE MODULES
// ============================================
export { default as Dashboard } from "@/pages/Dashboard";
export { default as SystemWatchdog } from "./system-watchdog/SystemWatchdog";

// ============================================
// OPERATIONS MODULES (UNIFIED → FLEET OPERATIONS)
// ============================================
export { default as FleetModule } from "./fleet";
export { default as CrewManagement } from "./crew-management";
export { default as OperationsDashboard } from "./operations";
export { default as FleetOperations } from "./fleet-operations";
// Deprecated: Use FleetOperations for unified fleet view

// ============================================
// MAINTENANCE (UNIFIED → NAUTILUS MAINTENANCE)
// ============================================
export { default as MaintenancePlanner } from "./maintenance-planner";
export { default as NautilusMaintenance } from "./nautilus-maintenance";
// Deprecated: Use NautilusMaintenance instead
// export { default as IntelligentMaintenance } from "./nautilus-maintenance";
// export { default as MMI } from "./nautilus-maintenance";

// ============================================
// MISSION CONTROL
// ============================================
export { default as MissionControl } from "./mission-control";

// ============================================
// COMMUNICATION & CONNECTIVITY (UNIFIED → SATCOM)
// ============================================
export { CommunicationCenter } from "./communication-center";
export { default as SatcomDashboard } from "./satcom";

// ============================================
// INTELLIGENCE & AI MODULES (UNIFIED → NAUTILUS AI HUB)
// ============================================
export * from "./ai";
export { default as NautilusAIHub } from "./nautilus-ai-hub";
// Deprecated: Use NautilusAIHub instead
// export { default as AIInsights } from "./nautilus-ai-hub";
// export { default as PredictiveAnalytics } from "./nautilus-ai-hub";
// export { default as AdvancedAnalytics } from "./nautilus-ai-hub";

// ============================================
// AUTOMATION (UNIFIED → NAUTILUS AUTOMATION)
// ============================================
export { default as NautilusAutomation } from "./nautilus-automation";
// Deprecated: Use NautilusAutomation instead
// export { default as AutomationHub } from "./nautilus-automation";
// export { default as SmartWorkflow } from "./nautilus-automation";

// ============================================
// SUBSEA OPERATIONS (UNIFIED)
// ============================================
export { default as SubseaOperations } from "./subsea-operations";
// Deprecated: Use SubseaOperations instead
// export { default as OceanSonar } from "./subsea-operations";
// export { default as UnderwaterDrone } from "./subsea-operations";

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
export { default as NautilusAcademy } from "./nautilus-academy";
export { default as NautilusPeople } from "./nautilus-people";

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
export { default as ProcurementInventory } from "./procurement-inventory";

// ============================================
// REGISTRY
// ============================================
export { MODULE_REGISTRY, type ModuleDefinition } from "./registry";
