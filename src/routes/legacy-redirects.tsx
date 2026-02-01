/**
 * Legacy Redirects
 * Maintains backward compatibility with old routes
 * 
 * PROMPT MASTER V4.1 - REDIRECTS_COMPAT
 */

import { Navigate, useSearchParams } from "react-router-dom";

/**
 * Map of legacy routes to new hub routes
 */
export const LEGACY_ROUTES: Record<string, string> = {
  // GROUP A: Operations Command
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

  // GROUP E: AI Control Tower
  "/ai-modules-hub": "/ai-control-tower?tab=hub",
  "/ai-hub": "/ai-control-tower?tab=hub",
  "/ai-command": "/ai-control-tower?tab=chat",
  "/autonomous-command": "/ai-control-tower?tab=agents",
  "/agent-orchestration": "/ai-control-tower?tab=agents",
  "/ai-analytics": "/ai-control-tower?tab=analytics",
  "/ai-observability": "/ai-control-tower?tab=observability",
  "/ai-audit": "/ai-control-tower?tab=audit",
  "/workflow-command": "/ai-control-tower?tab=workflows",
  "/ai-journaling": "/ai-control-tower?tab=journaling",
  "/ai-ops/logs": "/ai-control-tower?tab=audit",

  // GROUP G: Tracking & Telemetry
  "/telemetria": "/tracking-telemetry?tab=overview",
  "/predictive-telemetry": "/tracking-telemetry?tab=predictive",
  "/tracking": "/tracking-telemetry?tab=realtime",
  "/tracking/gnss-live": "/tracking-telemetry?tab=realtime",
  "/tracking/alerts": "/tracking-telemetry?tab=alerts",

  // GROUP H: Document Center
  "/reports-command": "/document-center?tab=reports",
  "/documents": "/document-center?tab=documents",
  "/templates": "/document-center?tab=templates",
  "/admin/checklists": "/document-center?tab=checklists",
  "/document-workflow": "/document-center?tab=workflow",
  "/export-center": "/document-center?tab=export",
  "/advanced-search": "/document-center?tab=search",

  // GROUP I: Comms & Alerts
  "/communication-command": "/comms-alerts?tab=comms",
  "/alerts-command": "/comms-alerts?tab=alerts",
  "/real-time-workspace": "/comms-alerts?tab=workspace",
  "/maritime-connectivity": "/comms-alerts?tab=connectivity",

  // GROUP J: People Hub
  "/nautilus-people": "/people-hub?tab=overview",
  "/hr-dashboard": "/people-hub?tab=performance",
  "/recruitment": "/people-hub?tab=talent",
  "/hr-turnover": "/people-hub?tab=talent",
  "/crew-wellness": "/people-hub?tab=wellness",
  "/crew-wellbeing": "/people-hub?tab=wellness",
  "/hr-payroll": "/people-hub?tab=overview",
  "/hr-time-tracking": "/people-hub?tab=overview",
  "/hr-chatbot": "/people-hub?tab=overview",
  "/hr-ocr": "/document-center?tab=documents",
};

/**
 * Component that handles legacy route redirects
 */
export function LegacyRedirect({ from }: { from: string }) {
  const [searchParams] = useSearchParams();
  const to = LEGACY_ROUTES[from];
  
  if (!to) {
    return <Navigate to="/404" replace />;
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

export default LEGACY_ROUTES;
