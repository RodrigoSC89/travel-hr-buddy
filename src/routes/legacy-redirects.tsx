/**
 * Legacy Redirects - FUSÃO TOTAL v5.0
 * Maintains backward compatibility with old routes
 * 
 * 71 rotas antigas → HUBs consolidados
 * Zero breaking changes, 100% compatibilidade
 */

import { Navigate, useSearchParams } from "react-router-dom";

/**
 * Map of legacy routes to new hub routes
 * Organized by cluster for maintainability
 */
export const LEGACY_ROUTES: Record<string, string> = {
  // ============================================
  // GROUP A: Operations Command
  // ============================================
  "/maritime-command": "/ops?tab=maritime",
  "/fleet-command": "/ops?tab=fleet",
  "/voyage-command": "/ops?tab=voyage",
  "/mission-command": "/ops?tab=missions",
  "/logistics-command": "/ops?tab=logistics",
  "/route-optimizer": "/ops?tab=voyage",
  "/bridge-link": "/ops?tab=maritime",
  "/drydock-management": "/maintenance?tab=drydock",
  "/vessel-history": "/ops?tab=fleet",
  "/digital-twin": "/command?tab=digital-twin",
  "/operations-command": "/ops",

  // ============================================
  // GROUP B: AI Control Tower
  // ============================================
  "/ai-modules-hub": "/ai?tab=modules",
  "/ai-hub": "/ai?tab=hub",
  "/ai-command": "/ai?tab=chat-voice",
  "/revolutionary-ai": "/ai?tab=chat-voice",
  "/autonomous-command": "/ai?tab=agents",
  "/agent-orchestration": "/ai?tab=all-modules&module=agent-orchestration",
  "/ai-analytics": "/ai?tab=analytics",
  "/ai-observability": "/ai?tab=analytics",
  "/ai-audit": "/ai?tab=all-modules&module=ai-audit",
  "/workflow-command": "/ai?tab=workflows",
  "/ai-journaling": "/ai?tab=hub",
  "/ai-ops/logs": "/ai?tab=analytics",
  "/ai-control-tower": "/ai",

  // ============================================
  // GROUP C: Tracking & Telemetry
  // ============================================
  "/telemetria": "/tracking?tab=overview",
  "/telemetria-command": "/tracking?tab=overview",
  "/predictive-telemetry": "/tracking?tab=predictive",
  "/tracking/gnss-live": "/tracking?tab=realtime",
  "/tracking/alerts": "/tracking?tab=alerts",
  "/tracking-telemetry": "/tracking",

  // ============================================
  // GROUP D: Document Center → Workbench
  // ============================================
  "/reports-command": "/workbench?section=modules&module=reports-command",
  "/reports": "/workbench?section=modules&module=reports-command",
  "/documents": "/workbench?section=docs",
  "/documentation": "/workbench?section=docs",
  "/templates": "/workbench?section=modules&module=templates",
  "/admin/checklists": "/workbench?section=modules&module=checklists-builder",
  "/document-workflow": "/workbench?section=modules&module=document-workflow",
  "/export-center": "/workbench?section=modules&module=export-center",
  "/advanced-search": "/workbench?section=docs",
  "/document-center": "/workbench?section=docs",

  // ============================================
  // GROUP E: Comms & Alerts → Command
  // ============================================
  "/communication-command": "/command?tab=comms",
  "/alerts-command": "/command?tab=alerts",
  "/emergency-mode": "/command?tab=alerts",
  "/real-time-workspace": "/command?tab=overview",
  "/maritime-connectivity": "/command?tab=comms",
  "/comms-alerts": "/command?tab=comms",

  // ============================================
  // GROUP F: People Hub → Workbench
  // ============================================
  "/nautilus-people": "/workbench?section=people",
  "/hr-dashboard": "/workbench?section=modules&module=hr-dashboard",
  "/hr/dashboard": "/workbench?section=people",
  "/recruitment": "/workbench?section=modules&module=recruitment",
  "/hr-turnover": "/workbench?section=modules&module=hr-turnover",
  "/crew-wellness": "/workbench?section=modules&module=crew-wellness",
  "/crew-wellbeing": "/workbench?section=modules&module=crew-wellness",
  "/hr-payroll": "/workbench?section=modules&module=payroll",
  "/payroll": "/workbench?section=modules&module=payroll",
  "/hr-time-tracking": "/workbench?section=modules&module=time-tracking",
  "/time-tracking": "/workbench?section=modules&module=time-tracking",
  "/hr-chatbot": "/workbench?section=modules&module=hr-chatbot",
  "/people-analytics": "/workbench?section=modules&module=people-analytics",
  "/people-hub": "/workbench?section=people",

  // ============================================
  // GROUP G: Compliance Hub
  // ============================================
  "/compliance-hub": "/compliance?tab=hub",
  "/compliance-one": "/compliance?tab=hub",
  "/compliance-dashboard": "/compliance?tab=hub",
  "/compliance-executive": "/compliance?tab=scorecard",
  "/audit-agents": "/compliance?tab=audit-agents",
  "/audit-ai-chat": "/compliance?tab=modules&module=audit-ai-chat",
  "/peo-dp": "/compliance?standard=peo-dp",
  "/peotram": "/compliance?standard=peotram",
  "/sgso": "/compliance?standard=sgso",
  "/imca-audit": "/compliance?standard=ism",
  "/pre-ovid": "/compliance?standard=pre-ovid",
  "/mlc-inspection": "/compliance?standard=pre-mlc",
  "/psc-package": "/compliance?tab=certificates",
  "/diagnostic-certificates": "/compliance?tab=certificates",
  "/diagnostic-ncs": "/compliance?tab=ncs-capas",
  "/nc-workflow": "/compliance?tab=ncs-capas",
  "/regulations": "/compliance?tab=regulations",
  "/risk-matrix": "/compliance?tab=risk-matrix",
  "/safety-human-factors": "/compliance?tab=risk-matrix",
  "/diagnostic-reports": "/compliance?tab=hub",
  "/compliance-unified": "/compliance",

  // ============================================
  // GROUP H: Absorbed Standalone Modules → Hub Modules
  // ============================================
  // Command absorbed
  "/business-roadmap": "/command?tab=modules&module=business-roadmap",
  "/infrastructure-dashboard": "/command?tab=modules&module=infrastructure",
  "/performance-monitor": "/command?tab=modules&module=performance-monitor",
  "/world-class-dashboard": "/command?tab=modules&module=world-class",
  "/security-dashboard": "/command?tab=modules&module=security-dashboard",
  "/gamification": "/command?tab=modules&module=gamification",
  "/support-portal": "/command?tab=modules&module=support-portal",
  "/subscription": "/command?tab=modules&module=subscription",
  "/quality-dashboard": "/command?tab=modules&module=quality-dashboard",
  "/consolidation-plan": "/command?tab=modules&module=consolidation-plan",

  // Ops absorbed
  "/commercial-operations": "/ops?tab=modules&module=commercial-ops",
  "/laytime-demurrage": "/ops?tab=modules&module=laytime-demurrage",
  "/freight-invoicing": "/ops?tab=modules&module=freight-invoicing",
  "/voyage-estimate": "/ops?tab=modules&module=voyage-estimate",
  "/chartering-hub": "/ops?tab=modules&module=chartering-hub",
  "/voyage-accounting": "/ops?tab=modules&module=voyage-accounting",
  "/budget-opex": "/ops?tab=modules&module=budget-opex",
  "/port-costs": "/ops?tab=modules&module=port-costs",
  "/fuel-management": "/ops?tab=modules&module=fuel-management",
  "/bunker-operations": "/ops?tab=modules&module=bunker-operations",
  "/weather-maritime": "/ops?tab=modules&module=weather-maritime",
  "/weather-routing": "/ops?tab=modules&module=weather-routing",
  "/stowage-plan": "/ops?tab=modules&module=stowage-plan",
  "/vessel-kpi": "/ops?tab=modules&module=vessel-kpi",
  "/fleet-benchmarking": "/ops?tab=modules&module=fleet-benchmarking",
  "/procurement": "/ops?tab=modules&module=procurement",
  "/energy-efficiency": "/ops?tab=modules&module=energy-efficiency",

  // Maintenance absorbed
  "/spare-parts": "/maintenance?tab=modules&module=spare-parts",
  "/pms-hub": "/maintenance?tab=modules&module=pms-hub",
  "/running-hours": "/maintenance?tab=modules&module=running-hours",
  "/cap-assessment": "/maintenance?tab=modules&module=cap-assessment",
  "/warranty-claims": "/maintenance?tab=modules&module=warranty-claims",

  // Workbench absorbed
  "/crew-rotation": "/workbench?section=modules&module=crew-rotation",
  "/crew-travel": "/workbench?section=modules&module=crew-travel",
  "/crew-planning": "/workbench?section=modules&module=crew-planning",
  "/crew-appraisal": "/workbench?section=modules&module=crew-appraisal",
  "/crew-competency": "/workbench?section=modules&module=crew-competency",
  "/crew-change": "/workbench?section=modules&module=crew-change",
  "/medical-infirmary": "/workbench?section=modules&module=medical-infirmary",
  "/nautilus-academy": "/workbench?section=modules&module=nautilus-academy",
  "/integrations-center": "/workbench?section=modules&module=integrations-center",
  "/api-center": "/workbench?section=modules&module=api-center",
  "/api-portal": "/workbench?section=modules&module=api-portal",
  "/collaboration": "/workbench?section=modules&module=collaboration",
  "/whatsapp-bot": "/workbench?section=modules&module=whatsapp-bot",
  "/employee-portal": "/workbench?section=modules&module=employee-portal",
  "/client-portal": "/workbench?section=modules&module=client-portal",
};

/**
 * Component that handles legacy route redirects
 * Preserves query params and hash fragments
 */
export function LegacyRedirect({ from }: { from: string }) {
  const [searchParams] = useSearchParams();
  const to = LEGACY_ROUTES[from];
  
  if (!to) {
    return <Navigate to="/command" replace />;
  }
  
  // Preserve existing query params
  const existingParams = searchParams.toString();
  const [basePath, queryString] = to.split("?");
  
  let finalUrl = to;
  if (existingParams) {
    finalUrl = queryString 
      ? `${basePath}?${queryString}&${existingParams}`
      : `${basePath}?${existingParams}`;
  }
  
  // Preserve hash if present
  if (window.location.hash) {
    finalUrl += window.location.hash;
  }
  
  return <Navigate to={finalUrl} replace />;
}

/**
 * Get all legacy paths for route registration
 */
export function getLegacyPaths(): string[] {
  return Object.keys(LEGACY_ROUTES);
}

/**
 * Check if a path is a legacy route
 */
export function isLegacyRoute(path: string): boolean {
  return path in LEGACY_ROUTES;
}

/**
 * Get the new route for a legacy path
 */
export function getNewRoute(legacyPath: string): string | undefined {
  return LEGACY_ROUTES[legacyPath];
}

export default LEGACY_ROUTES;
