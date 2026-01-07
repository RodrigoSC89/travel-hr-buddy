/**
 * Sidebar Navigation Actions Hook
 * Version: 3.0.0 - Minimal stable hooks (no useToast to prevent hook count issues)
 */
import { useNavigate } from "react-router-dom";

// Module route mappings
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

export const useSidebarActions = () => {
  // Single hook - useNavigate only
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    navigate(normalizedPath);
  };

  const handleModuleAccess = (moduleKey: string) => {
    const route = MODULE_ROUTES[moduleKey] || `/${moduleKey}`;
    handleNavigation(route);
  };

  return {
    handleNavigation,
    handleModuleAccess
  };
};
