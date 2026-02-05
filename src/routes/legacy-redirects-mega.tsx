/**
 * Legacy Redirects v8.0 MEGA-FUSION - ZERO PERDA
 * =========================================================
 * 180+ rotas antigas → 7 MEGA-HUBs canônicos
 * 
 * REGRAS:
 * ✅ Todas as rotas antigas funcionam
 * ✅ Query params preservados
 * ✅ Hash fragments preservados
 * ✅ Deep links funcionam
 * ✅ 12 Auditorias Marítimas preservadas
 * ✅ 10 Agentes IA preservados
 * =========================================================
 */

import { Navigate, useSearchParams, useLocation } from "react-router-dom";

/**
 * Complete map of legacy routes to new canonical routes
 * 180+ redirects organized by MEGA-HUB
 */
export const LEGACY_ROUTES_MEGA: Record<string, string> = {
  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB A: COMMAND
  // ═══════════════════════════════════════════════════════════
  "/central-comando": "/command",
  "/central-comando/visao-geral": "/command",
  "/central-comando/operacoes": "/command/operations",
  "/central-comando/executivo": "/command/executive",
  "/noc": "/command/noc",
  "/noc-monitoring": "/command/noc",
  "/soc": "/command/soc",
  "/soc-dashboard": "/command/soc",
  "/dashboard": "/command",
  "/overview": "/command",
  "/communication-command": "/command/comms",
  "/comms-alerts": "/command/alerts",
  "/alerts-command": "/command/alerts",
  "/emergency-mode": "/command/alerts",
  "/real-time-workspace": "/command/workspace",
  "/maritime-connectivity": "/command/connectivity",
  "/health-monitor": "/command/health",

  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB B: OPS (Operations)
  // ═══════════════════════════════════════════════════════════
  "/operations-command-hub": "/ops",
  "/operations-command": "/ops",
  "/maritime-command": "/ops/maritime",
  "/fleet-command": "/ops/fleet",
  "/voyage-command": "/ops/voyage",
  "/mission-command": "/ops/missions",
  "/logistics-command": "/ops/logistics",
  "/route-optimizer": "/ops/voyage",
  "/bridge-link": "/ops/maritime",
  "/vessel-history": "/ops/fleet",
  "/vessel-contracts": "/ops/contracts",
  "/charter-party": "/ops/contracts",
  "/cargo-management": "/ops/cargo",
  "/cargo-planning": "/ops/cargo",
  "/advanced/cargo-planning": "/ops/cargo",
  "/port-call": "/ops/logistics",
  "/vessel-cts": "/ops/fleet",
  "/vessel-tracking": "/ops/fleet",

  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB C: MAINTENANCE
  // ═══════════════════════════════════════════════════════════
  "/maintenance-hub": "/maintenance",
  "/maintenance-command": "/maintenance",
  "/drydock-management": "/maintenance/drydock",
  "/predictive-maintenance": "/maintenance/predictive",
  "/fuel-management": "/maintenance/fuel",
  "/digital-twin": "/maintenance/digital-twin",
  "/advanced/digital-twin-3d": "/maintenance/digital-twin?mode=3d",
  "/advanced/bunker-optimization": "/maintenance/fuel",
  "/esg-emissions": "/maintenance/esg",
  "/waste-management": "/maintenance/waste-marpol",
  "/advanced/marpol-tracker": "/maintenance/waste-marpol",
  "/pms": "/maintenance/predictive",
  "/spare-parts": "/maintenance",

  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB D: AI (Fusão: AI Control Tower + Enterprise AI)
  // ═══════════════════════════════════════════════════════════
  "/ai-control-tower": "/ai",
  "/ai-modules-hub": "/ai/modules",
  "/ai-modules": "/ai/modules",
  "/ai-hub": "/ai",
  "/ai-command": "/ai/chat",
  "/revolutionary-ai": "/ai/chat",
  "/nauti-command": "/ai/chat",
  "/autonomous-command": "/ai/agents",
  "/agent-orchestration": "/ai/agents",
  "/ai-analytics": "/ai/analytics",
  "/ai-observability": "/ai/observability",
  "/ai-audit": "/ai/audit",
  "/workflow-command": "/ai/workflows",
  "/ai-journaling": "/ai/audit",
  "/ai-ops/logs": "/ai/audit",
  "/voice-assistant": "/ai/voice",
  "/voice-assistant-ai": "/ai/voice",
  "/assistente-voz": "/ai/voice",
  "/assistant/voice": "/ai/voice",
  "/advanced/voice-commands": "/ai/voice",
  "/enterprise/rag-assistant": "/ai/rag",
  "/enterprise/ocr-center": "/ai/ocr",
  "/enterprise/crew-matching": "/ai/crew-matching",
  "/enterprise/contract-analysis": "/ai/contract-analysis",
  "/enterprise/compliance-predictor": "/ai/compliance-predictor",
  "/enterprise/fatigue-risk": "/ai/fatigue-risk",
  "/enterprise/mlc-hours": "/ai/mlc-hours",

  // AI Sub-modules
  "/ai/voyage-logistics": "/ai/modules?tab=voyage-logistics",
  "/ai/safety-incident": "/ai/modules?tab=safety-incident",
  "/ai/inventory-spares": "/ai/modules?tab=inventory-spares",
  "/compliance-ai": "/ai/modules?tab=compliance",
  "/environmental-ai": "/ai/modules?tab=environmental",
  "/quality-ai": "/ai/modules?tab=quality",
  "/contract-legal-ai": "/ai/modules?tab=contract-legal",
  "/insurance-claims-ai": "/ai/modules?tab=insurance",
  "/crewing-payroll-ai": "/ai/modules?tab=crewing",
  "/reporting-analytics-ai": "/ai/modules?tab=reporting",
  "/mobile-offline-ai": "/ai/modules?tab=mobile-offline",

  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB E: TRACKING
  // ═══════════════════════════════════════════════════════════
  "/tracking-telemetry": "/tracking",
  "/telemetria": "/tracking",
  "/telemetria-command": "/tracking",
  "/predictive-telemetry": "/tracking/predictive",
  "/tracking/gnss-live": "/tracking/realtime",
  "/tracking/alerts": "/tracking/alerts",
  "/ais-tracker-page": "/tracking/ais",
  "/ais-tracker": "/tracking/ais",
  "/ais-tracking": "/tracking/ais",
  "/satcom-dashboard": "/tracking/satcom",
  "/advanced/weather-intelligence": "/tracking/weather",
  "/weather": "/tracking/weather",
  "/weather-command": "/tracking/weather",

  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB F: COMPLIANCE (12 Auditorias + 10 Agentes)
  // ═══════════════════════════════════════════════════════════
  "/compliance-unified": "/compliance",
  "/compliance-hub": "/compliance",
  "/compliance-one": "/compliance",
  "/compliance-dashboard": "/compliance",
  "/compliance-executive": "/compliance",
  
  // 10 Agentes de Auditoria IA
  "/audit-agents": "/compliance/audit-agents",
  "/audit-ai-chat": "/compliance/audit-agents",
  
  // 12 Auditorias Marítimas (TODAS PRESERVADAS)
  "/peo-dp": "/compliance/standards/peo-dp",
  "/peotram": "/compliance/standards/peotram",
  "/safety-imca": "/compliance/standards/ism",
  "/isps-security": "/compliance/standards/isps",
  "/drill-simulator": "/compliance/standards/solas",
  "/pre-ovid": "/compliance/standards/pre-ovid",
  "/mlc-inspection": "/compliance/standards/pre-mlc",
  "/psc-package": "/compliance/standards/psc",
  "/sgso": "/compliance/standards/sgso",
  "/pre-sire": "/compliance/standards/pre-sire",
  "/tmsa-assessment": "/compliance/standards/tmsa",
  
  // OCIMF Assessments
  "/enterprise/ocimf-assessment": "/compliance/standards/pre-sire",
  "/enterprise/tmsa-analytics": "/compliance/standards/tmsa",
  
  // Outras conformidades
  "/imca-audit": "/compliance/audit-management",
  "/diagnostic-certificates": "/compliance/certificates",
  "/diagnostic-ncs": "/compliance/ncs-capas",
  "/nc-workflow": "/compliance/ncs-capas",
  "/regulations": "/compliance/regulations",
  "/risk-matrix": "/compliance/risk-matrix",
  "/safety-human-factors": "/compliance/risk-matrix",
  "/diagnostic-reports": "/compliance/reports",
  "/due-diligence": "/compliance/due-diligence",
  "/whistleblower": "/compliance/whistleblower",
  "/security-center": "/compliance/security",
  "/advanced/psc-readiness": "/compliance/psc-readiness",
  "/advanced/blockchain-certificates": "/compliance/blockchain",
  "/advanced/incident-investigation": "/compliance/incidents",

  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB G: WORKBENCH (Docs + People + Finance + System)
  // ═══════════════════════════════════════════════════════════
  
  // === DOCS ===
  "/document-center": "/workbench/docs",
  "/reports-command": "/workbench/docs/reports",
  "/reports": "/workbench/docs/reports",
  "/documents": "/workbench/docs/documents",
  "/documentation": "/workbench/docs",
  "/templates": "/workbench/docs/templates",
  "/admin/checklists": "/workbench/docs/checklists",
  "/document-workflow": "/workbench/docs/workflow",
  "/export-center": "/workbench/docs/export",
  "/advanced-search": "/workbench/docs/search",
  "/enterprise/forms-builder": "/workbench/docs/forms",
  "/enterprise/checklists-builder": "/workbench/docs/checklists",

  // === PEOPLE ===
  "/people-hub": "/workbench/people",
  "/nautilus-people": "/workbench/people",
  "/hr-dashboard": "/workbench/people/performance",
  "/hr/dashboard": "/workbench/people",
  "/recruitment": "/workbench/people/talent",
  "/hr-turnover": "/workbench/people/talent",
  "/crew-wellness": "/workbench/people/wellness",
  "/crew-wellbeing": "/workbench/people/wellness",
  "/medical-infirmary": "/workbench/people/medical",
  "/hr-payroll": "/workbench/people/payroll",
  "/payroll": "/workbench/people/payroll",
  "/hr-time-tracking": "/workbench/people/time",
  "/time-tracking": "/workbench/people/time",
  "/people-analytics": "/workbench/people/analytics",
  "/stcw-mlc": "/workbench/people/stcw-mlc",
  "/crew-intelligence": "/workbench/people/intelligence",
  "/users": "/workbench/people/users",
  "/advanced/vr-training": "/workbench/people/vr-training",
  "/advanced/crew-wellness-ai": "/workbench/people/wellness-ai",

  // === FINANCE ===
  "/finance-hub": "/workbench/finance",
  "/finance-command": "/workbench/finance",
  "/travel-command": "/workbench/finance/travel",
  "/voyage-pnl": "/workbench/finance/voyage-pnl",
  "/voyage-accounting": "/workbench/finance/voyage-acct",
  "/procurement": "/workbench/finance/procurement",
  "/suppliers": "/workbench/finance/suppliers",
  "/budget": "/workbench/finance/budget",
  "/contracts": "/workbench/finance/contracts",
  "/supplier-portal": "/workbench/finance/suppliers",
  "/advanced/executive-dashboard": "/workbench/finance/executive",

  // === SYSTEM ===
  "/system-hub": "/workbench/system",
  "/settings": "/workbench/system/settings",
  "/api-monitor": "/workbench/system/api-monitor",
  "/api-gateway": "/workbench/system/api-gateway",
  "/iot-dashboard": "/workbench/system/iot",
  "/quality-dashboard": "/workbench/system/quality",
  "/roadmap": "/workbench/system/roadmap",
  "/dev-routes": "/workbench/system/dev",
  "/integrations": "/workbench/system/integrations",
  "/integrations-center": "/workbench/system/integrations",
};

/**
 * Component that handles legacy route redirects
 * Preserves query params and hash fragments
 */
export function LegacyRedirectMega({ from }: { from: string }) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const to = LEGACY_ROUTES_MEGA[from];
  
  if (!to) {
    // Fallback to command center if route not found
    console.warn(`[MEGA-FUSION] Legacy route not found: ${from}, redirecting to /command`);
    return <Navigate to="/command" replace />;
  }
  
  // Preserve existing query params
  const existingParams = searchParams.toString();
  const [basePath, queryString] = to.split("?");
  
  let finalUrl = to;
  if (existingParams && queryString) {
    // Merge query params
    finalUrl = `${basePath}?${queryString}&${existingParams}`;
  } else if (existingParams) {
    finalUrl = `${basePath}?${existingParams}`;
  }
  
  // Preserve hash if present
  if (location.hash) {
    finalUrl += location.hash;
  }
  
  return <Navigate to={finalUrl} replace />;
}

/**
 * Get all legacy paths for route registration
 */
export function getLegacyPathsMega(): string[] {
  return Object.keys(LEGACY_ROUTES_MEGA);
}

/**
 * Check if a path is a legacy route
 */
export function isLegacyRouteMega(path: string): boolean {
  return path in LEGACY_ROUTES_MEGA;
}

/**
 * Get the new route for a legacy path
 */
export function getNewRouteMega(legacyPath: string): string | undefined {
  return LEGACY_ROUTES_MEGA[legacyPath];
}

/**
 * Get count of legacy routes
 */
export function getLegacyRouteCountMega(): number {
  return Object.keys(LEGACY_ROUTES_MEGA).length;
}

/**
 * Get 12 Maritime Audits paths
 */
export function getMaritimeAuditsPaths(): Record<string, string> {
  return {
    "PEO-DP": "/compliance/standards/peo-dp",
    "PEOTRAM": "/compliance/standards/peotram",
    "ISM Code": "/compliance/standards/ism",
    "ISPS Security": "/compliance/standards/isps",
    "SOLAS/LSA/FFE": "/compliance/standards/solas",
    "MARPOL I-VI": "/compliance/standards/marpol",
    "Pre-OVID": "/compliance/standards/pre-ovid",
    "Pre-MLC 2006": "/compliance/standards/pre-mlc",
    "PSC Package": "/compliance/standards/psc",
    "SGSO ANP": "/compliance/standards/sgso",
    "Pre-SIRE 2.0": "/compliance/standards/pre-sire",
    "TMSA": "/compliance/standards/tmsa",
  };
}

/**
 * Get 10 AI Audit Agents
 */
export function getAIAuditAgents(): string[] {
  return [
    "Agent PEO-DP",
    "Agent PEO-TRAM",
    "Agent ISM",
    "Agent ISPS",
    "Agent MLC",
    "Agent SGSO",
    "Agent Quality",
    "Agent Environmental",
    "Agent Technical",
    "Agent Documentation",
  ];
}

export default LEGACY_ROUTES_MEGA;
