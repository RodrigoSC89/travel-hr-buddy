/**
import { useEffect, useState, useCallback } from "react";;
 * PATCH 837: Offline Status Indicator
 * Visual feedback for offline/sync status
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, Check, AlertTriangle } from "lucide-react";
import { useOfflineSync } from "@/lib/pwa/offline-sync";
import { cn } from "@/lib/utils";

export const OfflineIndicator = memo(function() {
  const { status, queueStatus } = useOfflineSync();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    });
  }, []);

  const isSyncing = status?.type === "syncing";
  const hasPending = queueStatus.pending > 0;

  return (
    <AnimatePresence>
      {(!isOnline || hasPending || isSyncing) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-50",
            "px-4 py-2 rounded-full shadow-lg",
            "flex items-center gap-2 text-sm font-medium",
            !isOnline
              ? "bg-destructive text-destructive-foreground"
              : isSyncing
                ? "bg-primary text-primary-foreground"
                : hasPending
                  ? "bg-warning text-warning-foreground"
                  : "bg-muted text-muted-foreground"
          )}
        >
          {!isOnline ? (
            <>
              <WifiOff className="w-4 h-4" />
              <span>Você está offline</span>
              {queueStatus.pending > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {queueStatus.pending} pendente{queueStatus.pending > 1 ? "s" : ""}
                </span>
              )}
            </>
          ) : isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Sincronizando...</span>
            </>
          ) : hasPending ? (
            <>
              <Cloud className="w-4 h-4" />
              <span>{queueStatus.pending} alteração{queueStatus.pending > 1 ? "ões" : ""} pendente{queueStatus.pending > 1 ? "s" : ""}</span>
            </>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const SyncStatusBadge = memo(function() {
  const { status, queueStatus } = useOfflineSync();
  const isOnline = navigator.onLine;

  const getStatusColor = () => {
    if (!isOnline) return "bg-destructive";
    if (status?.type === "syncing") return "bg-primary animate-pulse";
    if (queueStatus.pending > 0) return "bg-warning";
    return "bg-success";
  });

  const getStatusIcon = () => {
    if (!isOnline) return <CloudOff className="w-3 h-3" />;
    if (status?.type === "syncing") return <RefreshCw className="w-3 h-3 animate-spin" />;
    if (queueStatus.pending > 0) return <AlertTriangle className="w-3 h-3" />;
    return <Check className="w-3 h-3" />;
  });

  return (
    <div className={cn(
      "flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs",
      getStatusColor()
    )}>
      {getStatusIcon()}
      {queueStatus.pending > 0 && (
        <span>{queueStatus.pending}</span>
      )}
    </div>
  );
}
