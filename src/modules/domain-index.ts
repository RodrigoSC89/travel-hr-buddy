/**
 * PATCH 852 - Domain-Based Module Index
 * Organizes modules by functional domain for better maintainability
 */

// ============================================
// DOMAIN: CREW (Tripulação)
// ============================================
export const CREW_MODULES = {
  maritimeCommand: "operations.maritime-command",
  nautlusPeople: "hr.nautilus-people",
  peoDp: "hr.peo-dp",
} as const;

// ============================================
// DOMAIN: FLEET (Frota)
// ============================================
export const FLEET_MODULES = {
  fleetCommand: "operations.fleet-command",
  operationsCommand: "operations.command",
  fuelManager: "logistics.fuel-manager",
} as const;

// ============================================
// DOMAIN: MAINTENANCE (Manutenção)
// ============================================
export const MAINTENANCE_MODULES = {
  maintenanceCommand: "maintenance.command",
} as const;

// ============================================
// DOMAIN: VOYAGE (Viagem)
// ============================================
export const VOYAGE_MODULES = {
  missionCommand: "operations.mission-command",
} as const;

// ============================================
// DOMAIN: AI (Inteligência Artificial)
// ============================================
export const AI_MODULES = {
  aiCommand: "intelligence.ai-command",
  aiCopilot: "intelligence.ai-copilot",
  documentAnalysis: "intelligence.document-analysis",
  predictiveInsights: "intelligence.predictive-insights",
  navigationAssistant: "intelligence.navigation-assistant",
  complianceAI: "intelligence.compliance-ai",
  securityMonitoring: "intelligence.security-monitoring",
} as const;

// ============================================
// DOMAIN: COMPLIANCE (Conformidade)
// ============================================
export const COMPLIANCE_MODULES = {
  complianceHub: "compliance.hub",
} as const;

// ============================================
// DOMAIN: DOCUMENTS (Documentos)
// ============================================
export const DOCUMENT_MODULES = {
  documentsAI: "documents.ai",
  templates: "documents.templates",
  documentHub: "documents.hub",
} as const;

// ============================================
// DOMAIN: FINANCE (Financeiro)
// ============================================
export const FINANCE_MODULES = {
  financeCommand: "finance.command",
} as const;

// ============================================
// DOMAIN: COMMUNICATION (Comunicação)
// ============================================
export const COMMUNICATION_MODULES = {
  communicationCommand: "connectivity.communication-command",
  apiGateway: "connectivity.api-gateway",
  integrationsHub: "connectivity.integrations-hub",
} as const;

// ============================================
// DOMAIN: WORKSPACE (Área de Trabalho)
// ============================================
export const WORKSPACE_MODULES = {
  realtime: "workspace.realtime",
  collaboration: "workspace.collaboration",
} as const;

// ============================================
// DOMAIN: CORE (Sistema Central)
// ============================================
export const CORE_MODULES = {
  commandCenter: "core.command-center",
  systemWatchdog: "core.system-watchdog",
  logsCenter: "core.logs-center",
} as const;

// ============================================
// ALL DOMAINS
// ============================================
export const MODULE_DOMAINS = {
  crew: CREW_MODULES,
  fleet: FLEET_MODULES,
  maintenance: MAINTENANCE_MODULES,
  voyage: VOYAGE_MODULES,
  ai: AI_MODULES,
  compliance: COMPLIANCE_MODULES,
  documents: DOCUMENT_MODULES,
  finance: FINANCE_MODULES,
  communication: COMMUNICATION_MODULES,
  workspace: WORKSPACE_MODULES,
  core: CORE_MODULES,
} as const;

// Type definitions
export type DomainName = keyof typeof MODULE_DOMAINS;
export type ModuleId = 
  | typeof CREW_MODULES[keyof typeof CREW_MODULES]
  | typeof FLEET_MODULES[keyof typeof FLEET_MODULES]
  | typeof MAINTENANCE_MODULES[keyof typeof MAINTENANCE_MODULES]
  | typeof VOYAGE_MODULES[keyof typeof VOYAGE_MODULES]
  | typeof AI_MODULES[keyof typeof AI_MODULES]
  | typeof COMPLIANCE_MODULES[keyof typeof COMPLIANCE_MODULES]
  | typeof DOCUMENT_MODULES[keyof typeof DOCUMENT_MODULES]
  | typeof FINANCE_MODULES[keyof typeof FINANCE_MODULES]
  | typeof COMMUNICATION_MODULES[keyof typeof COMMUNICATION_MODULES]
  | typeof WORKSPACE_MODULES[keyof typeof WORKSPACE_MODULES]
  | typeof CORE_MODULES[keyof typeof CORE_MODULES];

/**
 * Get all module IDs for a domain
 */
export function getModulesByDomain(domain: DomainName): string[] {
  const domainModules = MODULE_DOMAINS[domain];
  return Object.values(domainModules);
}

/**
 * Get domain for a module ID
 */
export function getDomainForModule(moduleId: string): DomainName | null {
  for (const [domain, modules] of Object.entries(MODULE_DOMAINS)) {
    if ((Object.values(modules) as string[]).includes(moduleId)) {
      return domain as DomainName;
    }
  }
  return null;
}

/**
 * Get all active domain routes for navigation
 */
export function getDomainRoutes(): Record<DomainName, string[]> {
  const routes: Record<string, string[]> = {};
  
  for (const domain of Object.keys(MODULE_DOMAINS) as DomainName[]) {
    routes[domain] = getModulesByDomain(domain);
  }
  
  return routes as Record<DomainName, string[]>;
}
