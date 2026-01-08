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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Header: FC = () => {
  const { isHighContrast, toggleHighContrast } = useHighContrastTheme();
  const { isMobile, toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/98 backdrop-blur-sm supports-[backdrop-filter]:bg-background/90">
      <div className="flex h-14 items-center px-3 md:px-4">
        {/* Mobile Menu Trigger - Large and prominent for touch */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-11 w-11 md:h-8 md:w-8 shrink-0 touch-manipulation"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="h-6 w-6 md:h-5 md:w-5" />
        </Button>
        
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