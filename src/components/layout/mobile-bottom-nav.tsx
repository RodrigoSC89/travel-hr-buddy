/**
 * Mobile Bottom Navigation v12 - World-Class Maritime
 * Contextual nav with alert badge, swipe gestures, haptic feedback
 */
import React, { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Ship, Brain, Shield, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Início", icon: LayoutDashboard, path: "/command" },
  { label: "Frota", icon: Ship, path: "/ops?tab=fleet" },
  { label: "IA", icon: Brain, path: "/ai" },
  { label: "Compliance", icon: Shield, path: "/compliance" },
  { label: "Alertas", icon: Bell, path: "/tracking?tab=alerts" },
];

interface MobileBottomNavProps {
  criticalAlerts?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ criticalAlerts = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const handleNavClick = useCallback((path: string) => {
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    navigate(path);
  }, [navigate]);

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
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-lg"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          const showBadge = item.path.includes("alerts") && criticalAlerts > 0;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full min-h-[44px] gap-0.5 transition-all",
                "active:scale-95 touch-manipulation",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <div className="relative">
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  active && "scale-110"
                )} />
                {showBadge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-3 h-4 min-w-4 px-1 text-[9px] font-bold flex items-center justify-center"
                  >
                    {criticalAlerts > 9 ? "9+" : criticalAlerts}
                  </Badge>
                )}
                {active && (
                  <motion.div
                    layoutId="mobile-nav-glow"
                    className="absolute -inset-2 bg-primary/10 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all",
                active && "font-bold text-primary"
              )}>
                {item.label}
              </span>
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 w-8 h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
