import React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { RealTimeNotificationCenter } from "@/components/notifications/real-time-notification-center";
import { UserMenu } from "@/components/auth/user-menu";
import { SimpleGlobalSearch } from "@/components/ui/simple-global-search";
import { OrganizationSelector } from "@/components/admin/organization-selector";
import { SystemStatusIndicator } from "@/components/ui/SystemStatusIndicator";
import { OfflineSyncIndicator } from "@/components/ui/OfflineSyncIndicator";
import { useHighContrastTheme } from "@/hooks/useHighContrastTheme";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Header: React.FC = () => {
  const { isHighContrast, toggleHighContrast } = useHighContrastTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/98 backdrop-blur-sm supports-[backdrop-filter]:bg-background/90">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <SidebarTrigger />
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2">
          <div className="flex-1 max-w-md mx-auto">
            <SimpleGlobalSearch />
          </div>
          
          <nav className="flex items-center space-x-2">
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
          </nav>
        </div>
      </div>
    </header>
  );
};
