/**
 * Legacy Redirects v8.0 - FUSÃO TOTAL COM ZERO PERDA
 * =========================================================
 * 150+ rotas antigas → 10 HUBs canônicos
 * 
 * REGRAS:
 * ✅ Todas as rotas antigas funcionam
 * ✅ Query params preservados
 * ✅ Hash fragments preservados
 * ✅ Deep links funcionam
 * =========================================================
 */

import { Navigate, useSearchParams, useLocation } from "react-router-dom";
import { logger } from "@/lib/logger";

/**
 * Complete map of legacy routes to new canonical routes
 * 150+ redirects organized by hub
 */
export const LEGACY_ROUTES_V8: Record<string, string> = {
  // ═══════════════════════════════════════════════════════════
  // HUB 1: COMMAND CENTER
  // ═══════════════════════════════════════════════════════════
  "/central-comando": "/command",
  "/central-comando/visao-geral": "/command",
  "/central-comando/operacoes": "/command?tab=operations",
  "/central-comando/executivo": "/command?tab=executive",
  "/noc": "/command?tab=noc",
  "/soc": "/command?tab=soc",
  "/dashboard": "/command",
  "/overview": "/command",

  // ═══════════════════════════════════════════════════════════
  // HUB 2: OPERATIONS
  // ═══════════════════════════════════════════════════════════
  "/operations-command-hub": "/operations",
  "/operations-command": "/operations",
  "/maritime-command": "/operations?tab=maritime",
  "/fleet-command": "/operations?tab=fleet",
  "/voyage-command": "/operations?tab=voyage",
  "/mission-command": "/operations?tab=missions",
  "/logistics-command": "/operations?tab=logistics",
  "/route-optimizer": "/operations?tab=voyage",
  "/bridge-link": "/operations?tab=maritime",
  "/vessel-history": "/operations?tab=fleet",
  "/vessel-contracts": "/operations?tab=contracts",
  "/charter-party": "/operations?tab=contracts",
  "/cargo-planning": "/operations?tab=cargo",
  "/advanced/cargo-planning": "/operations?tab=cargo",
  "/port-call": "/operations?tab=logistics",

  // ═══════════════════════════════════════════════════════════
  // HUB 3: MAINTENANCE
  // ═══════════════════════════════════════════════════════════
  "/maintenance-hub": "/maintenance",
  "/drydock-management": "/maintenance?tab=drydock",
  "/digital-twin": "/maintenance?tab=digital-twin",
  "/advanced/digital-twin-3d": "/maintenance?tab=digital-twin",
  "/fuel-management": "/maintenance?tab=fuel",
  "/advanced/bunker-optimization": "/maintenance?tab=fuel",
  "/pms": "/maintenance?tab=predictive",
  "/spare-parts": "/maintenance",

  // ═══════════════════════════════════════════════════════════
  // HUB 4: AI HUB (Fusão: AI Control Tower + Enterprise AI)
  // ═══════════════════════════════════════════════════════════
  "/ai-control-tower": "/ai",
  "/ai-modules-hub": "/ai?tab=modules",
  "/ai-modules": "/ai?tab=modules",
  "/ai-hub": "/ai?tab=hub",
  "/ai-command": "/ai?tab=chat",
  "/revolutionary-ai": "/ai?tab=chat",
  "/autonomous-command": "/ai?tab=agents",
  "/agent-orchestration": "/ai?tab=agents",
  "/ai-analytics": "/ai?tab=analytics",
  "/ai-observability": "/ai?tab=observability",
  "/ai-audit": "/ai?tab=audit",
  "/workflow-command": "/ai?tab=workflows",
  "/ai-journaling": "/ai?tab=journaling",
  "/ai-ops/logs": "/ai?tab=audit",
  "/voice-assistant": "/ai?tab=voice",
  "/advanced/voice-commands": "/ai?tab=voice",
  "/enterprise/rag-assistant": "/ai?tab=rag",
  "/enterprise/ocr-center": "/ai?tab=ocr",
  "/enterprise/crew-matching": "/ai?tab=crew-matching",
  "/enterprise/contract-analysis": "/ai?tab=contract-analysis",
  "/enterprise/compliance-predictor": "/ai?tab=compliance-predictor",

  // ═══════════════════════════════════════════════════════════
  // HUB 5: TRACKING (Fusão: Tracking + Weather)
  // ═══════════════════════════════════════════════════════════
  "/tracking-telemetry": "/tracking",
  "/telemetria": "/tracking",
  "/telemetria-command": "/tracking",
  "/predictive-telemetry": "/tracking?tab=predictive",
  "/tracking/gnss-live": "/tracking?tab=realtime",
  "/tracking/alerts": "/tracking?tab=alerts",
  "/ais-tracker-page": "/tracking?tab=ais",
  "/ais-tracker": "/tracking?tab=ais",
  "/satcom-dashboard": "/tracking?tab=satcom",
  "/advanced/weather-intelligence": "/tracking?tab=weather",
  "/weather": "/tracking?tab=weather",

  // ═══════════════════════════════════════════════════════════
  // HUB 6: COMPLIANCE (12 Auditorias + 10 Agentes)
  // ═══════════════════════════════════════════════════════════
  "/compliance-unified": "/compliance",
  "/compliance-hub": "/compliance",
  "/compliance-one": "/compliance",
  "/compliance-dashboard": "/compliance",
  "/compliance-executive": "/compliance",
  
  // Agentes de Auditoria IA
  "/audit-agents": "/compliance?tab=agents",
  "/audit-ai-chat": "/compliance?tab=agents",
  
  // 12 Auditorias Marítimas (TODAS PRESERVADAS)
  "/peo-dp": "/compliance/peo-dp",
  "/peotram": "/compliance/peotram",
  "/safety-imca": "/compliance/ism",
  "/isps-security": "/compliance/isps",
  "/drill-simulator": "/compliance/solas",
  "/waste-management": "/compliance/marpol",
  "/pre-ovid": "/compliance/pre-ovid",
  "/mlc-inspection": "/compliance/pre-mlc",
  "/psc-package": "/compliance/psc",
  "/sgso": "/compliance/sgso",
  "/pre-sire": "/compliance/pre-sire",
  "/tmsa-assessment": "/compliance/tmsa",
  
  // OCIMF Assessments
  "/enterprise/ocimf-assessment": "/compliance/sire",
  "/enterprise/tmsa-analytics": "/compliance/tmsa",
  
  // Outras conformidades
  "/imca-audit": "/compliance?tab=audits",
  "/diagnostic-certificates": "/compliance?tab=certificates",
  "/diagnostic-ncs": "/compliance?tab=ncs",
  "/nc-workflow": "/compliance?tab=ncs",
  "/regulations": "/compliance?tab=regulations",
  "/risk-matrix": "/compliance?tab=risks",
  "/safety-human-factors": "/compliance?tab=risks",
  "/diagnostic-reports": "/compliance?tab=reports",
  "/due-diligence": "/compliance?tab=due-diligence",
  "/whistleblower": "/compliance?tab=whistleblower",
  "/security-center": "/compliance?tab=security",
  "/advanced/psc-readiness": "/compliance?tab=psc",
  "/advanced/marpol-tracker": "/compliance/marpol",
  "/advanced/blockchain-certificates": "/compliance?tab=blockchain",
  "/advanced/incident-investigation": "/compliance?tab=incidents",

  // ═══════════════════════════════════════════════════════════
  // HUB 7: DOCUMENTS (Fusão: Docs + Enterprise Forms)
  // ═══════════════════════════════════════════════════════════
  "/document-center": "/docs",
  "/reports-command": "/docs?tab=reports",
  "/reports": "/docs?tab=reports",
  "/documents": "/docs?tab=documents",
  "/documentation": "/docs?tab=documents",
  "/templates": "/docs?tab=templates",
  "/admin/checklists": "/docs?tab=checklists",
  "/document-workflow": "/docs?tab=workflow",
  "/export-center": "/docs?tab=export",
  "/advanced-search": "/docs?tab=search",
  "/enterprise/forms-builder": "/docs?tab=forms",
  "/enterprise/checklists-builder": "/docs?tab=checklists",

  // ═══════════════════════════════════════════════════════════
  // HUB 8: PEOPLE (Fusão: People + Enterprise HR)
  // ═══════════════════════════════════════════════════════════
  "/people-hub": "/people",
  "/nautilus-people": "/people",
  "/hr-dashboard": "/people?tab=performance",
  "/hr/dashboard": "/people",
  "/recruitment": "/people?tab=talent",
  "/hr-turnover": "/people?tab=talent",
  "/crew-wellness": "/people?tab=wellness",
  "/crew-wellbeing": "/people?tab=wellness",
  "/medical-infirmary": "/people?tab=medical",
  "/hr-payroll": "/people?tab=payroll",
  "/payroll": "/people?tab=payroll",
  "/hr-time-tracking": "/people?tab=time",
  "/time-tracking": "/people?tab=time",
  "/hr-chatbot": "/people",
  "/people-analytics": "/people?tab=analytics",
  "/stcw-mlc": "/people?tab=stcw-mlc",
  "/crew-intelligence": "/people?tab=intelligence",
  "/users": "/people?tab=users",
  "/enterprise/fatigue-risk": "/people?tab=fatigue",
  "/enterprise/mlc-hours": "/people?tab=mlc-hours",
  "/advanced/vr-training": "/people?tab=vr-training",
  "/advanced/crew-wellness-ai": "/people?tab=wellness-ai",

  // ═══════════════════════════════════════════════════════════
  // HUB 9: FINANCE (Fusão: Finance + Travel + ESG)
  // ═══════════════════════════════════════════════════════════
  "/finance-hub": "/finance",
  "/finance-command": "/finance",
  "/travel-command": "/finance?tab=travel",
  "/esg-emissions": "/finance?tab=esg",
  "/voyage-pnl": "/finance?tab=voyage-pnl",
  "/procurement": "/finance?tab=procurement",
  "/suppliers": "/finance?tab=suppliers",
  "/budget": "/finance?tab=budget",
  "/contracts": "/finance?tab=contracts",
  "/advanced/executive-dashboard": "/finance?tab=executive",

  // ═══════════════════════════════════════════════════════════
  // HUB 10: SYSTEM
  // ═══════════════════════════════════════════════════════════
  "/system-hub": "/system",
  "/settings": "/system?tab=settings",
  "/api-monitor": "/system?tab=api-monitor",
  "/api-gateway": "/system?tab=api-gateway",
  "/iot-dashboard": "/system?tab=iot",
  "/health-monitor": "/system?tab=health",
  "/quality-dashboard": "/system?tab=quality",
  "/roadmap": "/system?tab=roadmap",
  "/dev-routes": "/system?tab=dev",

  // ═══════════════════════════════════════════════════════════
  // COMMUNICATION (agora em Command)
  // ═══════════════════════════════════════════════════════════
  "/communication-command": "/command?tab=comms",
  "/comms-alerts": "/command?tab=comms",
  "/alerts-command": "/command?tab=alerts",
  "/emergency-mode": "/command?tab=alerts",
  "/real-time-workspace": "/command?tab=workspace",
  "/maritime-connectivity": "/command?tab=connectivity",
};

/**
 * Component that handles legacy route redirects
 * Preserves query params and hash fragments
 */
export function LegacyRedirectV8({ from }: { from: string }) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const to = LEGACY_ROUTES_V8[from];
  
  if (!to) {
    // Fallback to command center if route not found
    logger.warn(`Legacy route not found: ${from}, redirecting to /command`);
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
export function getLegacyPathsV8(): string[] {
  return Object.keys(LEGACY_ROUTES_V8);
}

/**
 * Check if a path is a legacy route
 */
export function isLegacyRouteV8(path: string): boolean {
  return path in LEGACY_ROUTES_V8;
}

/**
 * Get the new route for a legacy path
 */
export function getNewRouteV8(legacyPath: string): string | undefined {
  return LEGACY_ROUTES_V8[legacyPath];
}

/**
 * Get count of legacy routes
 */
export function getLegacyRouteCountV8(): number {
  return Object.keys(LEGACY_ROUTES_V8).length;
}

export default LEGACY_ROUTES_V8;
