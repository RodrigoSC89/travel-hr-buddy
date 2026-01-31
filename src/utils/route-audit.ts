/**
 * Route Audit Utility
 * Automatically verifies all navigation paths against App.tsx routes
 * Run with: npx ts-node src/utils/route-audit.ts
 */

// Valid routes extracted from App.tsx
export const VALID_ROUTES = new Set([
  // Auth
  "/auth",
  
  // Central de Comando
  "/central-comando",
  "/central-comando/visao-geral",
  "/central-comando/operacoes",
  "/central-comando/executivo",
  "/central-comando/ia",
  "/central-comando/resiliencia",
  "/central-comando/alertas",
  "/central-comando/config",
  "/noc",
  "/noc-monitoring",
  
  // Operações Marítimas
  "/maritime-command",
  "/fleet-command",
  "/voyage-command",
  "/route-optimizer",
  "/mission-command",
  "/bridge-link",
  "/drydock-management",
  "/vessel-contracts",
  "/charter-party",
  "/cargo-management",
  "/port-call",
  "/vessel-cts",
  "/vessel-history",
  
  // Manutenção
  "/maintenance-command",
  "/predictive-maintenance",
  
  // Operações Submarinas
  "/ocean-sonar",
  "/underwater-drone",
  "/auto-sub",
  "/sonar-ai",
  "/deep-risk-ai",
  
  // IA & Automação
  "/nautilus-command",
  "/revolutionary-ai",
  "/ai-command",
  "/ai-hub",
  "/ai-analytics",
  "/revolutionary-features",
  "/autonomous-command",
  "/ai-observability",
  "/workflow-command",
  "/ai-audit",
  "/voice-assistant",
  "/ai-operations",
  
  // Inteligência
  "/optimization",
  
  // Telemetria
  "/telemetria",
  "/telemetria-command",
  "/predictive-telemetry",
  "/satellite-optimizer",
  "/tracking",
  "/tracking/gnss-live",
  "/tracking/alerts",
  "/simulador",
  "/emergency-mode",
  "/operational-calendar",
  
  // APIs & Integrações
  "/api-center",
  "/api-monitor",
  "/integrations",
  "/weather-maritime",
  "/ais-tracker",
  "/port-api",
  "/flight-tracker",
  "/noaa-weather",
  "/opensky-flights",
  "/earthquake-monitor",
  "/voice-transcriber",
  
  // Relatórios
  "/reports-command",
  "/documents",
  "/templates",
  "/maritime-checklists",
  "/document-workflow",
  "/export-center",
  "/advanced-search",
  
  // Comunicação
  "/communication-command",
  "/alerts-command",
  
  // Compliance
  "/peo-dp",
  "/peotram",
  "/sgso",
  "/safety-imca",
  "/pre-ovid",
  "/mlc-inspection",
  "/psc-package",
  "/gmud",
  "/responsibility-matrix",
  "/safety-human-factors",
  "/isps-security",
  "/drill-simulator",
  "/compliance-one",
  "/regulations",
  "/risk-matrix",
  "/evidences",
  "/due-diligence",
  "/whistleblower",
  "/security-center",
  "/security-audit",
  "/security-scanner",
  "/compliance-hub",
  
  // RH
  "/crew",
  "/crew-wellness",
  "/users",
  
  // Treinamentos
  "/ai-training",
  "/mentor-dp",
  "/dp-intelligence",
  
  // Finanças
  "/finance-command",
  "/voyage-accounting",
  "/analytics-command",
  "/operations-command",
  "/procurement-command",
  "/tasks",
  
  // ESG
  "/sustainability-score",
  
  // Viagens
  "/travel-command",
  "/weather-command",
  
  // Sistema
  "/settings",
  "/integrations-center",
  "/api-gateway",
  "/collaboration",
  "/iot",
  "/gamification",
  "/roadmap",
  "/production-deploy",
  
  // Admin
  "/admin",
  "/dashboard",
  "/executive-dashboard",
  "/system-overview",
  "/analytics",
  "/backup-audit",
  "/testing",
  "/feedback",
  "/saas-manager",
]);

// Patterns that indicate dynamic routes
const DYNAMIC_PATTERNS = [
  /^\/\w+\/[a-f0-9-]{36}$/, // UUID patterns
  /^\/\w+\/\d+$/,           // Numeric IDs
  /^\/admin\/patches/,      // Admin patches
];

/**
 * Check if a route is valid
 */
export function isValidRoute(path: string): boolean {
  // Normalize path
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const basePath = normalizedPath.split("?")[0].split("#")[0];
  
  // Check exact match
  if (VALID_ROUTES.has(basePath)) {
    return true;
  }
  
  // Check if it's a sub-route of a valid route
  for (const validRoute of VALID_ROUTES) {
    if (basePath.startsWith(validRoute + "/")) {
      return true;
    }
  }
  
  // Check dynamic patterns
  for (const pattern of DYNAMIC_PATTERNS) {
    if (pattern.test(basePath)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Audit result interface
 */
export interface RouteAuditResult {
  file: string;
  line: number;
  path: string;
  isValid: boolean;
  suggestion?: string;
}

/**
 * Common route corrections
 */
export const ROUTE_CORRECTIONS: Record<string, string> = {
  "/fuel-manager": "/finance-command",
  "/vessel-tracking": "/tracking",
  "/executive-kpis": "/executive-dashboard",
  "/iot-history": "/telemetria",
  "/compliance": "/compliance-hub",
  "/reports": "/reports-command",
  "/channel-manager": "/communication-command",
  "/price-alerts": "/alerts-command",
  "/analytics-core": "/analytics-command",
  "/crew-management": "/crew",
  "/fleet": "/fleet-command",
  "/maintenance": "/maintenance-command",
  "/missions": "/mission-command",
  "/weather-dashboard": "/weather-command",
};

/**
 * Get suggestion for broken route
 */
export function getSuggestion(brokenPath: string): string | undefined {
  const normalized = brokenPath.toLowerCase();
  
  // Check direct corrections
  if (ROUTE_CORRECTIONS[normalized]) {
    return ROUTE_CORRECTIONS[normalized];
  }
  
  // Check partial matches
  for (const [broken, correct] of Object.entries(ROUTE_CORRECTIONS)) {
    if (normalized.includes(broken.replace("/", ""))) {
      return correct;
    }
  }
  
  return undefined;
}

/**
 * Hook for runtime route validation (development only)
 */
export function useRouteValidator() {
  if (import.meta.env.DEV) {
    return {
      validatePath: (path: string): { valid: boolean; suggestion?: string } => {
        const valid = isValidRoute(path);
        const suggestion = valid ? undefined : getSuggestion(path);
        // Invalid routes are detected by the validator, no console output needed
        return { valid, suggestion };
      },
    };
  }
  
  return {
    validatePath: () => ({ valid: true }),
  };
}

/**
 * Runtime navigation wrapper with validation
 */
export function createSafeNavigate(navigate: (path: string) => void) {
  return (path: string) => {
    if (import.meta.env.DEV && !isValidRoute(path)) {
      const suggestion = getSuggestion(path);
      // Dev-only route validation warning - only shown in development mode
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error(
          `[RouteAudit] Attempting to navigate to invalid route: "${path}"`,
          suggestion ? `\nDid you mean: "${suggestion}"?` : ""
        );
      }
    }
    navigate(path);
  };
}

// Export for testing
export default {
  VALID_ROUTES,
  isValidRoute,
  getSuggestion,
  ROUTE_CORRECTIONS,
};
