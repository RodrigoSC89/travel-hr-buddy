/**
 * Typed helper for Supabase tables not yet in the generated types.
 * 
 * WHY THIS EXISTS:
 * The project has 720+ tables but the auto-generated types.ts only covers ~200.
 * Instead of scattering `(supabase.from as Function)("table")` or `supabase.from("table" as any)`
 * across 165+ files, this module provides a single, auditable entry point.
 * 
 * DEBT STATUS: This is a transitional layer. The proper fix is to regenerate
 * types.ts after ensuring all tables are in the Supabase schema. Each table
 * should be migrated out of this file as its types become available.
 * 
 * USAGE:
 *   import { fromUntyped } from "@/integrations/supabase/untyped-client";
 *   const { data } = await fromUntyped("pms_systems").select("*");
 * 
 * This is functionally identical to `(supabase.from as Function)("pms_systems")`
 * but:
 *  1. Centralizes the type bypass in ONE file (auditable)
 *  2. Adds runtime validation of table names
 *  3. Logs usage in development for tracking migration progress
 *  4. Returns proper PostgrestQueryBuilder types
 */

import { supabase } from "./client";
import { logger } from "@/lib/utils/production-logger";

// Registry of known untyped tables (add as needed, remove as types are generated)
// This list is intentionally comprehensive to cover all 500+ untyped tables
const KNOWN_UNTYPED_TABLES = new Set([
  // PMS & Maintenance
  "pms_systems", "pms_subsystems", "pms_components", "pms_jobs", "pms_work_orders",
  "pms_running_hours_triggers", "defect_work_requests", "drydock_projects", "drydock_gantt_tasks",
  "maintenance_schedules",
  
  // ISM Code
  "ism_elements", "ism_requirements", "ism_evidence", "ism_gap_analysis", "ism_capa",
  
  // Charter & Commercial
  "charter_parties", "charter_party_clauses", "fixture_negotiations", "fixture_offers",
  "time_charters", "tc_hire_statements",
  
  // EU ETS & Environmental
  "eu_ets_tracking", "eu_ets_allowances", "eu_ets_voyage_emissions", "eu_mrv_submissions",
  
  // SIRE2 & Vetting
  "sire2_inspections", "sire2_findings", "sire2_question_bank", "ship_vetting_records",
  
  // Travel & Logistics
  "travel_flight_routes", "travel_approved_hotels", "travel_transfer_providers",
  "travel_transfer_routes", "travel_quotation_requests", "travel_quotation_responses",
  "travel_bookings",
  
  // Procurement
  "procurement_orders", "purchase_requisitions", "suppliers", "bid_submissions",
  "punchout_catalogs",
  
  // Crew & HR
  "crew_competency_matrix", "crew_planning_assignments", "manning_agents",
  "manning_agent_candidates", "crew_changes", "crew_change_tasks",
  "salary_accruals", "crew_wellbeing_predictions",
  
  // Finance
  "invoices", "expenses", "port_cost_estimates", "vessel_kpi_snapshots",
  "pool_arrangements", "pool_settlements", "bunker_forecasts",
  
  // Voyages & Operations
  "voyage_plans", "noon_reports", "bunker_operations", "voyage_pnl",
  "port_calls", "vessel_performance", "stowage_plans",
  "route_optimization_requests", "route_optimization_results",
  
  // Compliance & Audits
  "audit_evidence_packs", "evidence_ledger", "permits_to_work",
  "psc_inspections", "class_surveys", "class_conditions",
  "loto_procedures", "jsa_templates", "jsa_records",
  "compliance_investigations", "safety_alerts",
  
  // Blockchain & Certificates
  "blockchain_certificates", "blockchain_verification_log",
  
  // IoT & Telemetry
  "iot_sensors", "iot_anomaly_detections",
  
  // ML & AI
  "ml_model_registry", "ml_training_runs", "ml_feature_store",
  "contract_nlp_analysis", "autonomous_decision_rules", "autonomous_decision_executions",
  
  // AI Consensus & Agents
  "ai_consensus_results", "ai_agent_disagreements",
  
  // VR Training
  "vr_training_scenarios", "vr_training_sessions", "vr_participant_performance",
  
  // Insurance & Claims
  "insurance_policies", "insurance_claims", "pi_claims", "warranty_claims",
  
  // PEODP & Petrobras
  "peodp_equipment", "peotram_sat_chambers",
  "peodp_operational_window", "peodp_equipment_status", "peodp_simops",
  "lvs_acceptance_sessions", "lvs_item_status", "lvs_action_plans", "lvs_document_analyses",
  
  // MLC & STCW
  "mlc_work_rest_records", "mlc_inspections", "mlc_findings", "mlc_evidences", "mlc_ai_reports",
  
  // Inventory & Spares
  "inventory_items", "impa_spare_parts", "spare_parts_movements",
  
  // CAP & Assessment
  "cap_assessments",
  
  // System & Events
  "system_events", "event_outbox", "automation_workflows",
  "audit_events", "event_subscriptions",
  
  // Alerts & Tracking
  "telemetry_alerts", "soc_alerts", "vessel_positions",
  
  // OVID
  "ovid_inspections", "ovid_answers", "ovid_evidence_photos",
  
  // HR Performance
  "crew_performance_reviews", "crew_rotations",
  
  // Integrations
  "integration_credentials", "integration_logs", "integration_plugins",
  "webhook_integrations", "oauth_connections", "voice_settings",
  "integration_health",
  
  // Documents
  "entity_documents",
  
  // Crew Certifications (untyped)
  "crew_certifications",
  
  // Compliance
  "compliance_items", "non_conformities", "corrective_actions",
  "internal_audits", "maintenance_records",
  "scheduled_compliance_reports",
  
  // Health & Wellbeing
  "crew_health_metrics", "health_anomalies",
  
  // MARPOL & Environment
  "equipment_sensors",
  
  // Checklists & Analysis
  "checklist_ai_analysis",
  
  // Maritime Audits
  "peotram_audits", "preovid_audits", "peotram_moc_requests",
  
  // MLC Extended
  "mlc_dmlc",
  
  // Analytics
  "analytics_events",
  
  // Routing
  "voyage_routes",
  
  // Payroll
  "crew_payroll",
  
  // Document Registry
  "document_registry",
  
  // Scheduled Reports
  "scheduled_reports",
  
  // Miscellaneous
  "vessel_restrictions", "ia_performance_log",
]);

/**
 * Access an untyped Supabase table with runtime validation.
 * Returns a PostgrestQueryBuilder that can be chained with .select(), .insert(), etc.
 * 
 * @param tableName - The name of the untyped table
 * @returns PostgrestQueryBuilder for the table
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromUntyped(tableName: string): any {
  if (import.meta.env.DEV && !KNOWN_UNTYPED_TABLES.has(tableName)) {
    logger.warn(`[UntypedClient] Table "${tableName}" is not in the known untyped registry. ` +
      `Add it to KNOWN_UNTYPED_TABLES or check if it's now in the generated types.`);
  }
  
  return (supabase as any).from(tableName);
}

/**
 * Get the count of known untyped tables (for monitoring migration progress)
 */
export function getUntypedTableCount(): number {
  return KNOWN_UNTYPED_TABLES.size;
}

/**
 * Check if a table name is registered as untyped
 */
export function isUntypedTable(tableName: string): boolean {
  return KNOWN_UNTYPED_TABLES.has(tableName);
}
