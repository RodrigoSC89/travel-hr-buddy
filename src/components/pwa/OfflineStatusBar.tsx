/**
import { useEffect, useState, useCallback } from "react";;
 * Offline Status Bar Component
 * PATCH 850: Visual indicator for offline/sync status
 */

import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { offlineSyncManager } from "@/lib/pwa/offline-sync-manager";
import { cn } from "@/lib/utils";

interface OfflineStatusBarProps {
  className?: string;
}

export const OfflineStatusBar: React.FC<OfflineStatusBarProps> = ({ className }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Subscribe to sync manager updates
    const unsubscribe = offlineSyncManager.subscribe((status) => {
      if (status.syncing !== undefined) setIsSyncing(status.syncing);
      if (status.pendingCount !== undefined) setPendingCount(status.pendingCount);
      if (!status.syncing && status.pendingCount === 0) {
        setLastSyncTime(new Date());
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    });

    // Initialize and get pending count
    offlineSyncManager.initialize().then(async () => {
      const count = await offlineSyncManager.getPendingCount();
      setPendingCount(count);
  });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsubscribe();
    });
  }, []);

  const handleManualSync = async () => {
    if (!isOnline || isSyncing) return;
    await offlineSyncManager.syncPendingMutations();
  });

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: "Offline - Alterações serão sincronizadas",
        bgColor: "bg-amber-500/90",
        textColor: "text-white",
        show: true,
      };
    }

    if (isSyncing) {
      return {
        icon: RefreshCw,
        text: `Sincronizando ${pendingCount} alterações...`,
        bgColor: "bg-blue-500/90",
        textColor: "text-white",
        show: true,
        animate: true,
      };
    }

    if (pendingCount > 0) {
      return {
        icon: AlertTriangle,
        text: `${pendingCount} alterações pendentes`,
        bgColor: "bg-orange-500/90",
        textColor: "text-white",
        show: true,
      };
    }

    if (showSuccess) {
      return {
        icon: CheckCircle2,
        text: "Tudo sincronizado",
        bgColor: "bg-green-500/90",
        textColor: "text-white",
        show: true,
      };
    }

    return { show: false };
  };

  const config = getStatusConfig();

  if (!config.show) return null;

  const Icon = config.icon!;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        config.bgColor,
        className
      )}
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon 
              className={cn(
                "h-4 w-4",
                config.textColor,
                config.animate && "animate-spin"
              )} 
            />
            <span className={cn("text-sm font-medium", config.textColor)}>
              {config.text}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {lastSyncTime && isOnline && !isSyncing && (
              <span className={cn("text-xs opacity-80", config.textColor)}>
                Última sync: {lastSyncTime.toLocaleTimeString()}
              </span>
            )}

            {isOnline && pendingCount > 0 && !isSyncing && (
              <button
                onClick={handleManualSync}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
                  "bg-white/20 hover:bg-white/30 transition-colors",
                  config.textColor
                )}
              >
                <RefreshCw className="h-3 w-3" />
                Sincronizar
              </button>
            )}

            {isOnline ? (
              <Cloud className={cn("h-4 w-4", config.textColor)} />
            ) : (
              <CloudOff className={cn("h-4 w-4", config.textColor)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineStatusBar;
