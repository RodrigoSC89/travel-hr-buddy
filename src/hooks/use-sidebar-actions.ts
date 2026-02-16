/**
 * Sidebar Navigation Actions Hook
 * v4.0.0 - Complete rebuild for stable hook count
 */
import { useNavigate } from "react-router-dom";

// Module route mappings - moved outside hook for performance
const MODULE_ROUTES: Record<string, string> = {
  dashboard: "/dashboard",
  admin: "/admin",
  hr: "/hr-dashboard",
  maritime: "/maritime-command",
  "maritime-certifications": "/maritime-command",
  "fleet-tracking": "/tracking?tab=realtime",
  "fleet-management": "/fleet-command",
  "fleet-dashboard": "/fleet-command",
  "crew-management": "/crew-management",
  portal: "/portal",
  travel: "/travel-command",
  "price-alerts": "/alerts-command",
  integrations: "/integrations",
  analytics: "/analytics-command",
  reservations: "/travel-command",
  reports: "/reports",
  communication: "/communication",
  settings: "/settings",
  "enhanced-metrics": "/enhanced-metrics",
  "ai-insights": "/ai-insights",
  "advanced-reports": "/advanced-reports",
  "checklists-inteligentes": "/checklists-inteligentes",
  "crew-dossier": "/crew-dossier",
  peotram: "/peotram",
  sgso: "/sgso",
  "imca-audit": "/imca-audit",
  "pre-ovid": "/pre-ovid-inspection",
  "mlc-inspection": "/mlc-inspection",
  // V2 Modules - Advanced Features
  "human-factors": "/safety-human-factors-v2",
  "gmud": "/gmud-v2",
  "vessel-history": "/vessel-history-v2",
  "responsibility-matrix": "/responsibility-matrix-v2",
  "contract-downtime": "/vessel-contracts-v2",
  "cts-compliance": "/cts-compliance-v2",
  "imca-incidents": "/imca-incidents-v2",
  // World-Class Competitive Modules
  "charter-party": "/charter-party",
  "laytime-demurrage": "/laytime-demurrage",
  "running-hours": "/running-hours",
  "crew-appraisal": "/crew-appraisal",
  "crew-travel": "/crew-travel",
  "crew-rotation": "/crew-rotation",
  "qhse-incidents": "/qhse-incidents",
  "class-surveys": "/class-surveys",
};

/**
 * Hook for sidebar navigation actions
 * Uses exactly 1 hook (useNavigate) for stability
 */
export function useSidebarActions() {
  const navigate = useNavigate();

  const handleNavigation = (path: string): void => {
    // Handle paths with query params correctly
    if (path.includes('?')) {
      const [basePath, queryString] = path.split('?');
      const normalizedPath = basePath.startsWith("/") ? basePath : `/${basePath}`;
      navigate({ pathname: normalizedPath, search: `?${queryString}` });
    } else {
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      navigate(normalizedPath);
    }
  };

  const handleModuleAccess = (moduleKey: string): void => {
    const route = MODULE_ROUTES[moduleKey] || `/${moduleKey}`;
    handleNavigation(route);
  };

  return {
    handleNavigation,
    handleModuleAccess
  } as const;
}

// Named export for compatibility
export default useSidebarActions;
