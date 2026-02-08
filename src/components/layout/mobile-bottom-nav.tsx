/**
 * Mobile Bottom Navigation
 * Navegação inferior fixa para dispositivos móveis
 */
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Ship, 
  Users, 
  Bell,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Início", icon: LayoutDashboard, path: "/command" },
  { label: "Frota", icon: Ship, path: "/ops?tab=fleet" },
  { label: "IA", icon: Brain, path: "/ai" },
  { label: "Tripulação", icon: Users, path: "/workbench?section=people" },
  { label: "Alertas", icon: Bell, path: "/tracking?tab=alerts" },
];

export const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const isActive = (path: string) => {
    const basePath = path.split('?')[0];
    if (basePath === "/command") {
      return location.pathname === "/" || location.pathname === "/command" || location.pathname.startsWith("/command/");
    }
    return location.pathname.startsWith(basePath);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-h-[44px] gap-0.5 transition-colors",
                "active:scale-95 touch-manipulation",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={cn(
                "h-5 w-5 transition-transform",
                active && "scale-110"
              )} />
              <span className={cn(
                "text-[10px] font-medium",
                active && "font-semibold"
              )}>
                {item.label}
              </span>
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
