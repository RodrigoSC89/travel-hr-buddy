import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "./use-toast";
import { useCallback } from "react";

export const useSidebarActions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleNavigation = useCallback((path: string) => {
    try {
      // Ensure path starts with / for absolute navigation
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      
      // Skip navigation if already on the same path
      if (location.pathname === normalizedPath) {
        return;
      }
      
      // Use replace: false to ensure proper history
      navigate(normalizedPath, { replace: false });
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao navegar para o módulo",
        variant: "destructive"
      });
    }
  }, [navigate, location.pathname, toast]);

  const handleModuleAccess = (moduleKey: string) => {
    // Map module keys to their routes
    const moduleRoutes: Record<string, string> = {
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

    const route = moduleRoutes[moduleKey] || `/${moduleKey}`;
    handleNavigation(route);
  };

  return {
    handleNavigation,
    handleModuleAccess
  };
};