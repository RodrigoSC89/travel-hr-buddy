import React from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { useOfflineMode } from "@/hooks/useOfflineMode";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OfflineBannerProps {
  className?: string;
  showSyncStatus?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  className,
  showSyncStatus = true,
}) => {
  const { isOffline, hasPendingSync, pendingSync } = useOfflineMode();

  if (!isOffline) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-destructive/95 backdrop-blur-sm",
        "text-destructive-foreground px-4 py-2",
        "flex items-center justify-between gap-4",
        "animate-fade-in",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm font-medium">
          Você está offline
        </span>
        {showSyncStatus && hasPendingSync && (
          <span className="text-xs opacity-80">
            • {pendingSync.length} {pendingSync.length === 1 ? "item" : "itens"} aguardando sync
          </span>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-destructive-foreground hover:bg-destructive-foreground/10"
        onClick={() => window.location.reload()}
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Tentar novamente
      </Button>
    </div>
  );
};

/**
 * Componente para indicar que dados são do cache
 */
export const CacheIndicator: React.FC<{ isFromCache: boolean; className?: string }> = ({
  isFromCache,
  className,
}) => {
  if (!isFromCache) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs text-muted-foreground",
        "bg-muted/50 px-2 py-0.5 rounded-full",
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      Dados em cache
    </span>
  );
});
