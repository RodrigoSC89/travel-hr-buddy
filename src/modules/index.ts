/**
 * Modules Index - Centralized Exports
 * Provides easy access to all module components
 * Updated: PATCH UNIFY-3.0 - Module Consolidation Phase 3
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
 * - Viagem/Rotas → Nautilus Voyage (unified)
 * - Satélite → Nautilus Satellite (unified)
 * - Documentos → Nautilus Documents (unified)
 * - Assistentes → Nautilus Assistant (unified)
 * - Comunicação → Nautilus Comms (unified)
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

// ============================================
// MAINTENANCE (UNIFIED → NAUTILUS MAINTENANCE)
// ============================================
export { default as MaintenancePlanner } from "./maintenance-planner";
export { default as NautilusMaintenance } from "./nautilus-maintenance";

// ============================================
// MISSION CONTROL
// ============================================
export { default as MissionControl } from "./mission-control";

// ============================================
// VOYAGE & ROUTES (UNIFIED → NAUTILUS VOYAGE)
// ============================================
export { default as NautilusVoyage } from "./nautilus-voyage";
export { default as VoyagePlanner } from "./voyage-planner";
// Deprecated: Use NautilusVoyage instead
// export { default as RouteCostAnalysis } from "./nautilus-voyage";

// ============================================
// COMMUNICATION & CONNECTIVITY (UNIFIED → SATCOM & NAUTILUS COMMS)
// ============================================
export { CommunicationCenter } from "./communication-center";
export { default as SatcomDashboard } from "./satcom";
export { default as NautilusComms } from "./nautilus-comms";

// ============================================
// SATELLITE (UNIFIED → NAUTILUS SATELLITE)
// ============================================
export { default as NautilusSatellite } from "./nautilus-satellite";
// Deprecated: Use NautilusSatellite instead
// export { default as SatelliteTracker } from "./nautilus-satellite";

// ============================================
// INTELLIGENCE & AI MODULES (UNIFIED → NAUTILUS AI HUB)
// ============================================
export * from "./ai";
export { default as NautilusAIHub } from "./nautilus-ai-hub";

// ============================================
// AUTOMATION (UNIFIED → NAUTILUS AUTOMATION)
// ============================================
export { default as NautilusAutomation } from "./nautilus-automation";

// ============================================
// SUBSEA OPERATIONS (UNIFIED)
// ============================================
export { default as SubseaOperations } from "./subsea-operations";

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
// DOCUMENTS (UNIFIED → NAUTILUS DOCUMENTS)
// ============================================
export { default as NautilusDocuments } from "./nautilus-documents";
export { default as IncidentReports } from "./incident-reports";
export { default as DocumentHub } from "./document-hub";

// ============================================
// ASSISTANTS (UNIFIED → NAUTILUS ASSISTANT)
// ============================================
export { default as NautilusAssistant } from "./nautilus-assistant";
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
export { default as SmartMobility } from "./smart-mobility";

// ============================================
// PROCUREMENT & INVENTORY (UNIFIED)
// ============================================
export { default as ProcurementInventory } from "./procurement-inventory";

// ============================================
// REGISTRY
// ============================================
export { MODULE_REGISTRY, type ModuleDefinition } from "./registry";
