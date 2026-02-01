// @ts-nocheck - Logger function call signature
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { RealTimeNotificationCenter } from "@/components/notifications/real-time-notification-center";
import { UserMenu } from "@/components/auth/user-menu";
import { SimpleGlobalSearch } from "@/components/ui/simple-global-search";
import { OrganizationSelector } from "@/components/admin/organization-selector";
import { SystemStatusIndicator } from "@/components/ui/SystemStatusIndicator";
import { OfflineSyncIndicator } from "@/components/ui/OfflineSyncIndicator";
import { useHighContrastTheme } from "@/hooks/useHighContrastTheme";
import { useNavigate } from "react-router-dom";
import { Settings, Menu } from "lucide-react";
import { logger } from '@/lib/logger';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Header: FC = () => {
  const { isHighContrast, toggleHighContrast } = useHighContrastTheme();
  const { isMobile, toggleSidebar, openMobile, setOpenMobile } = useSidebar();
  const navigate = useNavigate();

  // Direct handler for mobile menu - ensures it works on iOS PWA
  const handleMenuClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    logger.debug('[Header] Menu clicked, isMobile:', isMobile, 'openMobile:', openMobile);
    
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      toggleSidebar();
    }
  };

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b bg-background/98 backdrop-blur-sm supports-[backdrop-filter]:bg-background/90"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="flex h-14 items-center px-3 md:px-4">
        {/* Mobile Menu Trigger - Large touch target for iOS */}
        <button
          type="button"
          onClick={handleMenuClick}
          onTouchEnd={handleMenuClick}
          className="h-12 w-12 md:h-9 md:w-9 shrink-0 touch-manipulation active:scale-95 transition-transform flex items-center justify-center rounded-md hover:bg-accent"
          aria-label="Abrir menu de navegação"
          aria-expanded={openMobile}
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        >
          <Menu className="h-7 w-7 md:h-5 md:w-5" />
        </button>
        
        <div className="flex flex-1 items-center justify-between ml-2 md:ml-4 gap-2 min-w-0">
          {/* Search - Hidden on mobile */}
          <div className="hidden sm:flex flex-1 max-w-md mx-auto">
            <SimpleGlobalSearch />
          </div>
          
          {/* Navigation items */}
          <nav className="flex items-center gap-1 md:gap-2 ml-auto shrink-0">
            {/* Mobile: Show only essential items */}
            {isMobile ? (
              <>
                <RealTimeNotificationCenter />
                <UserMenu />
              </>
            ) : (
              <>
                <OfflineSyncIndicator />
                <SystemStatusIndicator />
                <OrganizationSelector />
                <RealTimeNotificationCenter />
                
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => navigate("/settings")}
                        aria-label="Configurações"
                      >
                        <Settings className="h-4 w-4 text-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={8}>
                      <p>Configurações</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <UserMenu />
                
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant={isHighContrast ? "default" : "ghost"}
                        size="sm"
                        onClick={toggleHighContrast}
                        aria-label={isHighContrast ? "Desativar alto contraste" : "Ativar alto contraste"}
                        className="h-9 px-3 text-xs cursor-pointer"
                      >
                        Contraste
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={8}>
                      <p>{isHighContrast ? "Desativar alto contraste" : "Ativar alto contraste"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <ThemeToggle />
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};