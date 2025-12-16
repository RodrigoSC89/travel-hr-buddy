/**
 * PATCH 589 - Offline Indicator Component
 * Clear visual feedback for network and sync status
 */

import React, { useState, useEffect, memo } from "react";
import { cn } from "@/lib/utils";
import { 
  Wifi, 
  WifiOff, 
  CloudOff, 
  RefreshCw, 
  Check, 
  AlertTriangle,
  Signal
} from "lucide-react";
import { networkDetector } from "../services/networkDetector";
import { useOfflineSync } from "../hooks/useOfflineSync";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OfflineIndicatorProps {
  /** Show as compact badge */
  compact?: boolean;
  /** Show sync status */
  showSyncStatus?: boolean;
  /** Position */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "inline";
  /** Custom class */
  className?: string;
}

type ConnectionQuality = "offline" | "poor" | "moderate" | "good" | "excellent";

/**
 * Offline indicator with network quality and sync status
 */
export const OfflineIndicator = memo<OfflineIndicatorProps>(({
  compact = false,
  showSyncStatus = true,
  position = "inline",
  className
}) => {
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>("good");
  const { isOnline, isSyncing, pendingChanges, lastSync, sync } = useOfflineSync();

  // Update connection quality
  useEffect(() => {
    const updateQuality = () => {
      const status = networkDetector.getStatus();

      if (!status.isOnline) {
        setConnectionQuality("offline");
        return;
      }

      switch (status.effectiveType) {
      case "slow-2g":
        setConnectionQuality("poor");
        break;
      case "2g":
        setConnectionQuality("poor");
        break;
      case "3g":
        setConnectionQuality("moderate");
        break;
      case "4g":
        setConnectionQuality(status.downlink && status.downlink > 5 ? "excellent" : "good");
        break;
      default:
        setConnectionQuality("good");
      }
    };

    updateQuality();
    const unsubscribe = networkDetector.onChange(() => updateQuality());
    
    return () => unsubscribe();
  }, []);

  // Get icon based on connection quality
  const getConnectionIcon = () => {
    switch (connectionQuality) {
    case "offline":
      return <WifiOff className="h-4 w-4" />;
    case "poor":
      return <Signal className="h-4 w-4 text-destructive" />;
    case "moderate":
      return <Signal className="h-4 w-4 text-warning" />;
    case "good":
      return <Wifi className="h-4 w-4 text-success" />;
    case "excellent":
      return <Wifi className="h-4 w-4 text-primary" />;
    }
  };

  // Get status text
  const getStatusText = () => {
    if (!isOnline) return "Offline";
    if (isSyncing) return "Sincronizando...";
    if (pendingChanges > 0) return `${pendingChanges} pendente${pendingChanges > 1 ? "s" : ""}`;
    return "Conectado";
  };

  // Get badge variant
  const getBadgeVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (!isOnline) return "destructive";
    if (pendingChanges > 0) return "secondary";
    return "default";
  };

  // Format last sync time
  const formatLastSync = () => {
    if (!lastSync) return "Nunca sincronizado";
    
    const diff = Date.now() - lastSync.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Agora mesmo";
    if (minutes < 60) return `${minutes}m atrás`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    
    return lastSync.toLocaleDateString();
  };

  // Position classes
  const positionClasses = {
    "top-left": "fixed top-4 left-4 z-50",
    "top-right": "fixed top-4 right-4 z-50",
    "bottom-left": "fixed bottom-20 left-4 z-50",
    "bottom-right": "fixed bottom-20 right-4 z-50",
    "inline": ""
  };

  // Compact version
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={getBadgeVariant()}
              className={cn(
                "gap-1.5 cursor-pointer",
                positionClasses[position],
                className
              )}
            >
              {isSyncing ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                getConnectionIcon()
              )}
              {!isOnline && "Offline"}
              {pendingChanges > 0 && isOnline && pendingChanges}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p>{getStatusText()}</p>
              <p className="text-muted-foreground">{formatLastSync()}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Full version
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card",
        !isOnline && "border-destructive/50 bg-destructive/5",
        pendingChanges > 0 && isOnline && "border-warning/50 bg-warning/5",
        positionClasses[position],
        className
      )}
    >
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {isSyncing ? (
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
        ) : (
          getConnectionIcon()
        )}
        <div>
          <p className="text-sm font-medium">{getStatusText()}</p>
          <p className="text-xs text-muted-foreground">{formatLastSync()}</p>
        </div>
      </div>

      {/* Sync Button */}
      {showSyncStatus && pendingChanges > 0 && isOnline && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => sync()}
          disabled={isSyncing}
          className="ml-auto"
        >
          {isSyncing ? "Sincronizando..." : "Sincronizar"}
        </Button>
      )}

      {/* Offline Warning */}
      {!isOnline && (
        <div className="ml-auto flex items-center gap-1 text-destructive">
          <CloudOff className="h-4 w-4" />
          <span className="text-xs">Alterações salvas localmente</span>
        </div>
      )}
    </div>
  );
});

OfflineIndicator.displayName = "OfflineIndicator";

/**
 * Floating offline indicator for mobile
 */
export const FloatingOfflineIndicator = memo(() => {
  const { isOnline, pendingChanges } = useOfflineSync();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show indicator when offline or has pending changes
    setIsVisible(!isOnline || pendingChanges > 0);
  }, [isOnline, pendingChanges]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <OfflineIndicator compact showSyncStatus />
    </div>
  );
});

FloatingOfflineIndicator.displayName = "FloatingOfflineIndicator";

/**
 * Banner for extended offline periods
 */
export const OfflineBanner = memo<{ className?: string }>(({ className }) => {
  const { isOnline, pendingChanges } = useOfflineSync();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isOnline) {
      // Show banner after 5 seconds offline
      timeout = setTimeout(() => setShowBanner(true), 5000);
    } else {
      setShowBanner(false);
    }

    return () => clearTimeout(timeout);
  }, [isOnline]);

  if (!showBanner) return null;

  return (
    <div
      className={cn(
        "w-full p-3 bg-destructive/10 border-b border-destructive/20",
        "flex items-center justify-center gap-2 text-sm",
        className
      )}
    >
      <WifiOff className="h-4 w-4 text-destructive" />
      <span>
        Você está offline. 
        {pendingChanges > 0 && ` ${pendingChanges} alteração(ões) aguardando sincronização.`}
      </span>
    </div>
  );
});

OfflineBanner.displayName = "OfflineBanner";
