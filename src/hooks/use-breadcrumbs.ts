import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export const useBreadcrumbs = () => {
  const location = useLocation();
  
  const breadcrumbs = useMemo(() => {
    const path = location.pathname;
    const segments = path.split("/").filter(Boolean);
    
    const items: BreadcrumbItem[] = [];
    
    // Always start with Dashboard
    if (path !== "/") {
      items.push({ label: "Dashboard", href: "/" });
    }
    
    // Map path segments to breadcrumb items
    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1;
      const href = "/" + segments.slice(0, index + 1).join("/");
      
      let label = "";
      switch (segment) {
      case "travel":
        label = "Viagens";
        break;
      case "maritime":
        label = "Sistema Marítimo";
        break;
      case "hr":
      case "human-resources":
        label = "Recursos Humanos";
        break;
      case "price-alerts":
        label = "Alertas de Preços";
        break;
      case "communication":
        label = "Comunicação";
        break;
      case "settings":
        label = "Configurações";
        break;
      case "analytics":
        label = "Analytics";
        break;
      case "reports":
        label = "Relatórios";
        break;
      case "admin":
        label = "Administração";
        break;
      case "auth":
        label = "Autenticação";
        break;
      case "innovation":
        label = "Inovação";
        break;
      case "strategic":
        label = "Estratégico";
        break;
      case "optimization":
        label = "Otimização";
        break;
      case "intelligence":
        label = "Inteligência";
        break;
      case "voice":
        label = "Interface de Voz";
        break;
      default:
        label = segment.charAt(0).toUpperCase() + segment.slice(1);
      }
      
      items.push({
        label,
        href: isLast ? undefined : href,
        current: isLast,
      });
    });
    
    return items;
  }, [location.pathname]);
  
  return breadcrumbs;
};