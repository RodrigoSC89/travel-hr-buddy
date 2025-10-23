/**
 * Module Status Registry
 * PATCH 61.0 - Consolidated module status tracking
 * Maps physical folders to defined modules
 */

import { NAUTILUS_MODULES } from "./modules-definition";

export type ModuleStatus = "implemented" | "partial" | "planned" | "deprecated";

export interface ModuleStatusEntry {
  id: string;
  name: string;
  path: string;
  status: ModuleStatus;
  folderPath?: string;
  hasIndex: boolean;
  hasLogic: boolean;
  hasTypes: boolean;
  lastUpdated?: string;
  notes?: string;
}

/**
 * Physical folder to module mapping
 */
export const FOLDER_TO_MODULE_MAP: Record<string, string> = {
  "dp-intelligence": "dp-intelligence",
  "real-time-workspace": "real-time-workspace",
  "voice-assistant": "voice-assistant",
  "audit-center": "audit-center",
  "bridgelink": "bridgelink",
  "forecast-global": "forecast-global",
  "control-hub": "control-hub",
  "mmi": "mmi",
  "peo-dp": "peo-dp",
  "fleet": "fleet",
  "crew": "crew",
  "comunicacao": "communication",
  "channel-manager": "channel-manager",
  "notifications-center": "notifications-center",
  "analytics-core": "analytics-core",
  "reports": "reports",
  "performance": "performance",
  "portal-funcionario": "portal-funcionario",
  "training-academy": "training-academy",
  "user-management": "user-management",
  "documentos-ia": "documentos",
  "compliance-hub": "compliance-hub",
  "checklists-inteligentes": "checklists-inteligentes",
  "voyage-planner": "voyage-planner",
  "logistics-hub": "logistics-hub",
  "fuel-optimizer": "fuel-optimizer",
  "ai-insights": "ai-insights",
  "automation": "automation",
  "feedback": "feedback",
  "api-gateway": "api-gateway",
  "mission-control": "mission-control",
  "emergency-response": "emergency-response",
  "satellite-tracker": "satellite-tracker",
  "crew-wellbeing": "crew-wellbeing",
  "sgso": "sgso",
  "dashboard": "dashboard",
  "fmea": "fmea-expert",
};

/**
 * Deprecated/duplicate folders to be archived
 */
export const DEPRECATED_FOLDERS = [
  "control_hub", // duplicate of control-hub
  "controlhub", // duplicate of control-hub
  "peodp_ai", // integrated into peo-dp
  "peotram", // legacy
  "documentos-ia", // renamed to documentos
  "assistente-ia", // duplicate of voice-assistant
  "ia-inovacao", // merged into ai-insights
  "automacao-ia", // merged into automation
  "analytics-avancado", // merged into analytics-core
  "analytics-tempo-real", // merged into analytics-core
  "business-intelligence", // merged into analytics-core
  "monitor-avancado", // merged into performance
  "monitor-sistema", // merged into performance
  "sistema-maritimo", // split into specific modules
  "colaboracao", // merged into real-time-workspace
  "configuracoes", // system settings, not a module
  "centro-ajuda", // help center, not a module
  "hub-integracoes", // merged into api-gateway
  "incident-reports", // merged into emergency-response
  "maintenance-planner", // merged into mmi
  "mission-logs", // merged into mission-control
  "otimizacao", // merged into fuel-optimizer
  "otimizacao-mobile", // merged into fuel-optimizer
  "project-timeline", // merged into analytics-core
  "reservas", // merged into voyage-planner
  "risk-audit", // merged into fmea-expert
  "risk-management", // merged into fmea-expert
  "smart-workflow", // merged into workflow-engine
  "task-automation", // merged into automation
  "templates", // shared templates, not a module
  "vault_ai", // merged into documentos
  "viagens", // merged into voyage-planner
  "visao-geral", // merged into dashboard
  "weather-dashboard", // merged into forecast-global
  "alertas-precos", // merged into analytics-core
  "finance-hub", // not in current 39 modules
  "forecast", // renamed to forecast-global
  "ai", // generic, specific modules exist
];

/**
 * Get module status
 */
export function getModuleStatus(moduleId: string): ModuleStatusEntry | null {
  const module = NAUTILUS_MODULES.find(m => m.id === moduleId);
  if (!module) return null;

  // Find corresponding folder
  const folderEntry = Object.entries(FOLDER_TO_MODULE_MAP).find(
    ([_, id]) => id === moduleId
  );

  return {
    id: module.id,
    name: module.name,
    path: module.path,
    status: "implemented", // Will be updated by scanning script
    folderPath: folderEntry ? `src/modules/${folderEntry[0]}` : undefined,
    hasIndex: false,
    hasLogic: false,
    hasTypes: false,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Get all module statuses
 */
export function getAllModuleStatuses(): ModuleStatusEntry[] {
  return NAUTILUS_MODULES.map(module => {
    const folderEntry = Object.entries(FOLDER_TO_MODULE_MAP).find(
      ([_, id]) => id === module.id
    );

    return {
      id: module.id,
      name: module.name,
      path: module.path,
      status: "implemented",
      folderPath: folderEntry ? `src/modules/${folderEntry[0]}` : undefined,
      hasIndex: false,
      hasLogic: false,
      hasTypes: false,
      lastUpdated: new Date().toISOString(),
    };
  });
}

/**
 * Check if folder should be deprecated
 */
export function shouldDeprecateFolder(folderName: string): boolean {
  return DEPRECATED_FOLDERS.includes(folderName);
}
