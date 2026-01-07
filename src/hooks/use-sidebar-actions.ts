/**
 * Sidebar Navigation Actions Hook
 * v4.0.0 - Complete rebuild for stable hook count
 */
import { useNavigate } from "react-router-dom";

// Module route mappings - moved outside hook for performance
const MODULE_ROUTES: Record<string, string> = {
  dashboard: "/dashboard",
  admin: "/admin",
  hr: "/hr",
  maritime: "/sistema-maritimo",
  "maritime-certifications": "/maritime-certifications",
  "fleet-tracking": "/fleet-tracking",
  "fleet-management": "/fleet-management",
  "fleet-dashboard": "/fleet-dashboard",
  "crew-management": "/crew-management",
  portal: "/portal",
  travel: "/travel",
  "price-alerts": "/price-alerts",
  integrations: "/integrations",
  analytics: "/analytics",
  reservations: "/reservations",
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
  "mlc-inspection": "/mlc-inspection"
};

/**
 * Hook for sidebar navigation actions
 * Uses exactly 1 hook (useNavigate) for stability
 */
export function useSidebarActions() {
  const navigate = useNavigate();

  const handleNavigation = (path: string): void => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    navigate(normalizedPath);
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
