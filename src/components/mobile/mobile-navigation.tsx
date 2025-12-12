import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  BarChart3, 
  Bell, 
  Settings, 
  User,
  AlertTriangle,
  Users,
  Plane,
  Bot,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useEnhancedNotifications } from "@/hooks/use-enhanced-notifications";

const navigationItems = [
  {
    href: "/",
    icon: Home,
    label: "Início",
    end: true
  },
  {
    href: "/portal",
    icon: User,
    label: "Portal"
  },
  {
    href: "/innovation",
    icon: Bot,
    label: "IA"
  },
  {
    href: "/gamification",
    icon: Trophy,
    label: "Ranking"
  },
  {
    href: "/price-alerts",
    icon: AlertTriangle,
    label: "Alertas"
  }
];

export const MobileNavigation: React.FC = () => {
  const location = useLocation();
  const { unreadCount } = useEnhancedNotifications();

  const isActive = (href: string, end?: boolean) => {
    if (end) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.end);
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-1 text-xs font-medium transition-colors relative",
                active 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon 
                className={cn(
                  "h-5 w-5",
                  active && "scale-110"
                )} 
              />
              <span className="truncate max-w-full">
                {item.label}
              </span>
              
              {/* Badge para notificações na navegação de alertas */}
              {item.href === "/price-alerts" && unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 text-xs p-0 flex items-center justify-center scale-75"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
              
              {/* Indicador visual para item ativo */}
              {active && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};