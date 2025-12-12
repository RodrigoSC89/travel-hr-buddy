/**
 * Lite Mode Component
 * Automatically activates reduced features for slow connections
 */

import { memo, memo, ReactNode, createContext, useContext, useEffect, useState, useCallback } from "react";;;
import { useNetworkStatus } from "@/hooks/use-network-status";
import { toast } from "@/hooks/use-toast";

interface LiteModeConfig {
  enabled: boolean;
  disableAnimations: boolean;
  reduceImageQuality: boolean;
  disableAutoplay: boolean;
  reducePollingFrequency: boolean;
  disablePrefetch: boolean;
  simplifyUI: boolean;
}

interface LiteModeContextType {
  config: LiteModeConfig;
  isLiteMode: boolean;
  toggleLiteMode: (enabled?: boolean) => void;
  autoDetected: boolean;
}

const defaultConfig: LiteModeConfig = {
  enabled: false,
  disableAnimations: false,
  reduceImageQuality: false,
  disableAutoplay: false,
  reducePollingFrequency: false,
  disablePrefetch: false,
  simplifyUI: false,
};

const LiteModeContext = createContext<LiteModeContextType>({
  config: defaultConfig,
  isLiteMode: false,
  toggleLiteMode: () => {},
  autoDetected: false,
});

export const useLiteMode = memo(function() {
  return useContext(LiteModeContext);
}

interface LiteModeProviderProps {
  children: ReactNode;
  autoEnable?: boolean;
}

export const LiteModeProvider = memo(function({ children, autoEnable = true }: LiteModeProviderProps) {
  const { quality, effectiveType } = useNetworkStatus();
  const [config, setConfig] = useState<LiteModeConfig>(defaultConfig);
  const [autoDetected, setAutoDetected] = useState(false);
  const [userOverride, setUserOverride] = useState<boolean | null>(null);

  // Auto-detect slow connection
  useEffect(() => {
    if (!autoEnable) return;

    const isSlowConnection = quality === "slow" || effectiveType === "2g" || effectiveType === "slow-2g";
    
    if (isSlowConnection && userOverride === null) {
      setAutoDetected(true);
      setConfig({
        enabled: true,
        disableAnimations: true,
        reduceImageQuality: true,
        disableAutoplay: true,
        reducePollingFrequency: true,
        disablePrefetch: true,
        simplifyUI: effectiveType === "slow-2g" || effectiveType === "2g",
      });

      toast({
        title: "Modo Lite Ativado",
        description: "Conexão lenta detectada. Recursos reduzidos para melhor performance.",
      });
    } else if (!isSlowConnection && autoDetected && userOverride === null) {
      setAutoDetected(false);
      setConfig(defaultConfig);
    }
  }, [quality, effectiveType, autoEnable, userOverride, autoDetected]);

  // Apply CSS class for animations
  useEffect(() => {
    if (config.disableAnimations) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
  }, [config.disableAnimations]);

  const toggleLiteMode = (enabled?: boolean) => {
    const newEnabled = enabled ?? !config.enabled;
    setUserOverride(newEnabled);
    
    if (newEnabled) {
      setConfig({
        enabled: true,
        disableAnimations: true,
        reduceImageQuality: true,
        disableAutoplay: true,
        reducePollingFrequency: true,
        disablePrefetch: true,
        simplifyUI: false,
      });
    } else {
      setConfig(defaultConfig);
    }
  });

  return (
    <LiteModeContext.Provider
      value={{
        config,
        isLiteMode: config.enabled,
        toggleLiteMode,
        autoDetected,
      }}
    >
      {children}
    </LiteModeContext.Provider>
  );
}

/**
 * Lite Mode Toggle Button
 */
import { Zap, ZapOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const LiteModeToggle = memo(function({ className }: { className?: string }) {
  const { isLiteMode, toggleLiteMode, autoDetected } = useLiteMode();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isLiteMode ? "secondary" : "ghost"}
            size="icon"
            onClick={() => toggleLiteMode()}
            className={className}
          >
            {isLiteMode ? (
              <ZapOff className="h-4 w-4" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isLiteMode ? "Desativar Modo Lite" : "Ativar Modo Lite"}</p>
          {autoDetected && <p className="text-xs text-muted-foreground">Auto-detectado</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
