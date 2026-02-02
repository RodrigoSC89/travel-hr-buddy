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
  "/maritime-command": "/operations-command?tab=maritime",
  "/fleet-command": "/operations-command?tab=fleet",
  "/voyage-command": "/operations-command?tab=voyage",
  "/mission-command": "/operations-command?tab=mission",
  "/logistics-command": "/operations-command?tab=logistics",
  "/route-optimizer": "/operations-command?tab=voyage",
  "/bridge-link": "/operations-command?tab=maritime",
  "/drydock-management": "/operations-command?tab=fleet",
  "/vessel-history": "/operations-command?tab=fleet",
  "/digital-twin": "/operations-command?tab=fleet",

  // ============================================
  // GROUP B: AI Control Tower
  // ============================================
  "/ai-modules-hub": "/ai-control-tower?tab=hub",
  "/ai-hub": "/ai-control-tower?tab=hub",
  "/ai-command": "/ai-control-tower?tab=chat",
  "/revolutionary-ai": "/ai-control-tower?tab=chat",
  "/autonomous-command": "/ai-control-tower?tab=agents",
  "/agent-orchestration": "/ai-control-tower?tab=agents",
  "/ai-analytics": "/ai-control-tower?tab=analytics",
  "/ai-observability": "/ai-control-tower?tab=observability",
  "/ai-audit": "/ai-control-tower?tab=audit",
  "/workflow-command": "/ai-control-tower?tab=workflows",
  "/ai-journaling": "/ai-control-tower?tab=journaling",
  "/ai-ops/logs": "/ai-control-tower?tab=audit",

  // ============================================
  // GROUP C: Tracking & Telemetry
  // ============================================
  "/telemetria": "/tracking-telemetry?tab=overview",
  "/telemetria-command": "/tracking-telemetry?tab=overview",
  "/predictive-telemetry": "/tracking-telemetry?tab=predictive",
  "/tracking": "/tracking-telemetry?tab=realtime",
  "/tracking/gnss-live": "/tracking-telemetry?tab=realtime",
  "/tracking/alerts": "/tracking-telemetry?tab=alerts",

  // ============================================
  // GROUP D: Document Center
  // ============================================
  "/reports-command": "/document-center?tab=reports",
  "/reports": "/document-center?tab=reports",
  "/documents": "/document-center?tab=documents",
  "/documentation": "/document-center?tab=documents",
  "/templates": "/document-center?tab=templates",
  "/admin/checklists": "/document-center?tab=checklists",
  "/document-workflow": "/document-center?tab=workflow",
  "/export-center": "/document-center?tab=export",
  "/advanced-search": "/document-center?tab=search",

  // ============================================
  // GROUP E: Comms & Alerts
  // ============================================
  "/communication-command": "/comms-alerts?tab=comms",
  "/alerts-command": "/comms-alerts?tab=alerts",
  "/emergency-mode": "/comms-alerts?tab=alerts",
  "/real-time-workspace": "/comms-alerts?tab=workspace",
  "/maritime-connectivity": "/comms-alerts?tab=connectivity",

  // ============================================
  // GROUP F: People Hub
  // ============================================
  "/nautilus-people": "/people-hub?tab=overview",
  "/hr-dashboard": "/people-hub?tab=performance",
  "/hr/dashboard": "/people-hub?tab=overview",
  "/recruitment": "/people-hub?tab=talent",
  "/hr-turnover": "/people-hub?tab=talent",
  "/crew-wellness": "/people-hub?tab=wellness",
  "/crew-wellbeing": "/people-hub?tab=wellness",
  "/medical-infirmary": "/people-hub?tab=wellness",
  "/hr-payroll": "/people-hub?tab=overview",
  "/payroll": "/people-hub?tab=overview",
  "/hr-time-tracking": "/people-hub?tab=overview",
  "/time-tracking": "/people-hub?tab=overview",
  "/hr-chatbot": "/people-hub?tab=overview",
  "/people-analytics": "/people-hub?tab=analytics",

  // ============================================
  // GROUP G: Compliance Hub
  // ============================================
  "/compliance-hub": "/compliance-unified?tab=dashboard",
  "/compliance-one": "/compliance-unified?tab=dashboard",
  "/compliance-dashboard": "/compliance-unified?tab=dashboard",
  "/compliance-executive": "/compliance-unified?tab=dashboard",
  "/audit-agents": "/compliance-unified?tab=agents",
  "/audit-ai-chat": "/compliance-unified?tab=agents",
  "/peo-dp": "/compliance-unified?tab=audits",
  "/peotram": "/compliance-unified?tab=audits",
  "/sgso": "/compliance-unified?tab=audits",
  "/imca-audit": "/compliance-unified?tab=audits",
  "/pre-ovid": "/compliance-unified?tab=audits",
  "/mlc-inspection": "/compliance-unified?tab=audits",
  "/psc-package": "/compliance-unified?tab=certificates",
  "/diagnostic-certificates": "/compliance-unified?tab=certificates",
  "/diagnostic-ncs": "/compliance-unified?tab=ncs",
  "/nc-workflow": "/compliance-unified?tab=ncs",
  "/regulations": "/compliance-unified?tab=regulations",
  "/risk-matrix": "/compliance-unified?tab=risks",
  "/safety-human-factors": "/compliance-unified?tab=risks",
  "/diagnostic-reports": "/compliance-unified?tab=reports",
};

/**
 * Component that handles legacy route redirects
 * Preserves query params and hash fragments
 */
export function LegacyRedirect({ from }: { from: string }) {
  const [searchParams] = useSearchParams();
  const to = LEGACY_ROUTES[from];
  
  if (!to) {
    return <Navigate to="/central-comando" replace />;
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
