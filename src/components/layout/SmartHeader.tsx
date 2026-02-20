/**
 * Smart Header Component - v13 Polish
 * Added: NetworkStatusIndicator for real-time connectivity feedback
 */

import React, { useState } from "react";
import { Bell, Bot, Sun, Moon, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/layout/theme-provider";
import { SimpleGlobalSearch } from "@/components/ui/simple-global-search";
import { UserMenu } from "@/components/auth/user-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { NetworkStatusIndicator } from "@/components/ui/NetworkStatusIndicator";

// Lazy load dialogs
const AlertsDialog = React.lazy(() => 
  import("@/components/layout/AlertsDialog").then(m => ({ default: m.AlertsDialog }))
);
const QuickCopilotDialog = React.lazy(() => 
  import("@/components/layout/QuickCopilotDialog").then(m => ({ default: m.QuickCopilotDialog }))
);


export function SmartHeader() {
  const { theme, setTheme } = useTheme();
  const [notificationCount] = useState(3);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  // Voice commands removed during cleanup
  const isListening = false;
  const isSupported = false;
  const transcript = '';
  const toggleVoice = () => {};

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <header role="banner" className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-card dark:bg-card text-foreground shadow-md border-b border-border">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <span>🚀 Nauti One</span>
        </h1>

        <div className="flex-1 max-w-md mx-auto">
          <SimpleGlobalSearch />
        </div>

        <div className="flex items-center gap-2">
          {/* Network status - compact indicator */}
          <NetworkStatusIndicator compact />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-muted transition-colors"
            aria-label={theme === "dark" ? "Alternar para modo claro" : "Alternar para modo escuro"}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full hover:bg-muted transition-colors"
            title="Notificações"
            aria-label={`Notificações${notificationCount > 0 ? ` - ${notificationCount} novas` : ""}`}
            onClick={() => setAlertsOpen(true)}
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {notificationCount}
              </span>
            )}
          </Button>

          {/* Voice Commands */}
          {isSupported && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-full transition-colors",
                    isListening 
                      ? "bg-destructive/20 hover:bg-destructive/30 text-destructive" 
                      : "hover:bg-muted"
                  )}
                  onClick={toggleVoice}
                  aria-label={isListening ? "Parar escuta de voz" : "Ativar comando de voz"}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isListening ? `Escutando: "${transcript || '...'}"` : "Comando de Voz"}
              </TooltipContent>
            </Tooltip>
          )}

          {/* AI Assistant */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-muted transition-colors"
            title="Assistente IA"
            aria-label="Abrir Assistente de Inteligência Artificial"
            onClick={() => setCopilotOpen(true)}
          >
            <Bot className="w-5 h-5" />
          </Button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </header>

      {/* Dialogs - Lazy loaded */}
      <React.Suspense fallback={null}>
        {alertsOpen && (
          <AlertsDialog open={alertsOpen} onOpenChange={setAlertsOpen} />
        )}
        {copilotOpen && (
          <QuickCopilotDialog open={copilotOpen} onOpenChange={setCopilotOpen} />
        )}
      </React.Suspense>
    </>
  );
}
