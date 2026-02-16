import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

const segmentKeyMap: Record<string, string> = {
  travel: "travel",
  maritime: "maritime",
  hr: "hr",
  "human-resources": "hr",
  "price-alerts": "priceAlerts",
  communication: "communication",
  settings: "settings",
  analytics: "analytics",
  reports: "reports",
  admin: "admin",
  auth: "auth",
  innovation: "innovation",
  strategic: "strategic",
  optimization: "optimization",
  intelligence: "intelligence",
  voice: "voice",
};

export const useBreadcrumbs = () => {
  const location = useLocation();
  const { t } = useTranslation();
  
  const breadcrumbs = useMemo(() => {
    const path = location.pathname;
    const segments = path.split("/").filter(Boolean);
    
    const items: BreadcrumbItem[] = [];
    
    if (path !== "/") {
      items.push({ label: t('breadcrumbs.dashboard'), href: "/" });
    }
    
    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1;
      const href = "/" + segments.slice(0, index + 1).join("/");
      
      const key = segmentKeyMap[segment];
      const label = key ? t(`breadcrumbs.${key}`) : segment.charAt(0).toUpperCase() + segment.slice(1);
      
      items.push({
        label,
        href: isLast ? undefined : href,
        current: isLast,
      });
    });
    
    return items;
  }, [location.pathname, t]);
  
  return breadcrumbs;
};