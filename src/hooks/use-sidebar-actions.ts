import { useNavigate } from "react-router-dom";
import { useToast } from "./use-toast";

export const useSidebarActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNavigation = (path: string) => {
    try {
      // Ensure path starts with / for absolute navigation
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      navigate(normalizedPath);
      
      toast({
        title: "Navegação",
        description: "Carregando módulo...",
        duration: 1000
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao navegar para o módulo",
        variant: "destructive"
      });
    }
  };

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
      "pre-ovid": "/admin/pre-ovid"
    };

    const route = moduleRoutes[moduleKey] || `/${moduleKey}`;
    handleNavigation(route);
  };

  return {
    handleNavigation,
    handleModuleAccess
  };
};