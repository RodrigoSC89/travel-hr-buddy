/**
 * Mobile Offline Indicator - PATCH 1001
 * Unified component for mobile PWA
 */

import React, { useState, useEffect } from "react";
import { WifiOff, Cloud, RefreshCw, AlertTriangle, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSyncStatus } from "@/lib/offline/hooks/useOfflineData";

interface OfflineIndicatorProps {
  compact?: boolean;
  showSyncStatus?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "inline";
  className?: string;
}

export const OfflineIndicator = React.memo<OfflineIndicatorProps>(({
  compact = false,
  position = "bottom-left",
  className,
}) => {
  const { 
    status, 
    pendingCount, 
    isOnline, 
    triggerSync,
    error,
  } = useSyncStatus();
  
  const [isDismissed, setIsDismissed] = useState(false);

  // Mostrar automaticamente quando offline ou syncing
  useEffect(() => {
    if (!isOnline || status === 'syncing' || pendingCount > 0) {
      setIsDismissed(false);
    }
  }, [isOnline, status, pendingCount]);

  // Se tudo OK e foi dispensado, não mostrar
  if (isOnline && status === 'idle' && pendingCount === 0 && isDismissed) {
    return null;
  }

  // Se tudo está OK, não mostrar
  if (isOnline && status === 'idle' && pendingCount === 0) {
    return null;
  }

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    if (status === 'syncing') return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (status === 'error') return <AlertTriangle className="h-4 w-4" />;
    if (pendingCount > 0) return <Cloud className="h-4 w-4" />;
    return <Check className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) return "Modo Offline";
    if (status === 'syncing') return "Sincronizando...";
    if (status === 'error') return "Erro na sincronização";
    if (pendingCount > 0) return `${pendingCount} pendente${pendingCount > 1 ? 's' : ''}`;
    return "Sincronizado";
  };

  const getStatusClass = () => {
    if (!isOnline) return 'bg-destructive/10 border-destructive/30 text-destructive';
    if (status === 'syncing') return 'bg-primary/10 border-primary/30 text-primary';
    if (status === 'error') return 'bg-warning/10 border-warning/30 text-warning';
    if (pendingCount > 0) return 'bg-amber-500/10 border-amber-500/30 text-amber-500';
    return 'bg-green-500/10 border-green-500/30 text-green-500';
  };

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "inline": "",
  };

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'gap-2 h-8',
          !isOnline && 'text-destructive',
          status === 'syncing' && 'text-primary',
          status === 'error' && 'text-warning',
          className
        )}
        onClick={() => isOnline && triggerSync()}
      >
        {getStatusIcon()}
        {pendingCount > 0 && (
          <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-current/20 text-xs">
            {pendingCount}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div
      className={cn(
        position !== "inline" && "fixed z-50",
        positionClasses[position],
        "px-3 py-2 rounded-lg border shadow-lg",
        "flex items-center gap-2 text-sm font-medium backdrop-blur-sm",
        "transition-all duration-300 animate-in slide-in-from-bottom-4",
        getStatusClass(),
        className
      )}
    >
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      
      {/* Botão de sync manual */}
      {isOnline && status !== 'syncing' && pendingCount > 0 && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 ml-1"
          onClick={() => triggerSync()}
          aria-label="Sincronizar dados"
          title="Sincronizar"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
      
      {/* Botão de fechar */}
      {isOnline && status === 'idle' && pendingCount === 0 && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 ml-1"
          onClick={() => setIsDismissed(true)}
          aria-label="Fechar indicador"
          title="Fechar"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
});

OfflineIndicator.displayName = "OfflineIndicator";

export const FloatingOfflineIndicator = React.memo(() => {
  return <OfflineIndicator position="bottom-left" />;
});

FloatingOfflineIndicator.displayName = "FloatingOfflineIndicator";

export const OfflineBanner = React.memo<{ className?: string }>(({ className }) => {
  return <OfflineIndicator position="inline" className={className} />;
});

OfflineBanner.displayName = "OfflineBanner";

export default OfflineIndicator;
