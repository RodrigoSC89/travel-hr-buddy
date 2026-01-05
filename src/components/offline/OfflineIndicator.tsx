/**
 * Offline Indicator Component - PATCH 1000
 * Shows offline status and pending sync count with visual feedback
 */

import React, { useState, useEffect } from 'react';
import { WifiOff, Cloud, CloudOff, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { useNetwork } from '@/hooks/unified/useNetwork';
import { indexedDBSync } from '@/lib/offline/indexeddb-sync';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SyncStats {
  pending: number;
  syncing: number;
  failed: number;
  total: number;
}

export function OfflineIndicator() {
  const { online, quality, pendingChanges } = useNetwork();
  const [syncStats, setSyncStats] = useState<SyncStats>({
    pending: 0,
    syncing: 0,
    failed: 0,
    total: 0,
  });
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Update sync stats periodically
  useEffect(() => {
    const updateStats = async () => {
      try {
        const stats = await indexedDBSync.getQueueStats();
        setSyncStats({
          pending: stats.pending,
          syncing: stats.syncing,
          failed: stats.failed,
          total: stats.total,
        });
      } catch (error) {
        // IndexedDB might not be ready yet
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    // Listen for sync-complete events
    const handleSyncComplete = () => {
      updateStats();
      setLastSyncTime(new Date());
    };

    window.addEventListener('sync-complete', handleSyncComplete);

    return () => {
      clearInterval(interval);
      window.removeEventListener('sync-complete', handleSyncComplete);
    };
  }, []);

  // Show indicator when offline or has pending changes
  useEffect(() => {
    const shouldShow = !online || syncStats.pending > 0 || syncStats.failed > 0;
    setIsVisible(shouldShow);
  }, [online, syncStats.pending, syncStats.failed]);

  // Don't render if everything is synced and online
  if (!isVisible) {
    return null;
  }

  const getStatusIcon = () => {
    if (!online) {
      return <WifiOff className="h-4 w-4 text-amber-500" />;
    }
    if (syncStats.failed > 0) {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
    if (syncStats.syncing > 0) {
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    if (syncStats.pending > 0) {
      return <CloudOff className="h-4 w-4 text-amber-500" />;
    }
    return <Check className="h-4 w-4 text-emerald-500" />;
  };

  const getStatusText = () => {
    if (!online) {
      return 'Modo Offline';
    }
    if (syncStats.syncing > 0) {
      return `Sincronizando ${syncStats.syncing} item(s)...`;
    }
    if (syncStats.pending > 0) {
      return `${syncStats.pending} item(s) pendente(s)`;
    }
    if (syncStats.failed > 0) {
      return `${syncStats.failed} item(s) com erro`;
    }
    return 'Sincronizado';
  };

  const getStatusClass = () => {
    if (!online) return 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400';
    if (syncStats.failed > 0) return 'bg-destructive/10 border-destructive/30 text-destructive';
    if (syncStats.syncing > 0) return 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400';
    if (syncStats.pending > 0) return 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400';
    return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "fixed bottom-4 left-4 z-50 px-3 py-2 rounded-lg border shadow-lg",
              "flex items-center gap-2 text-sm font-medium backdrop-blur-sm",
              "transition-all duration-300 animate-in slide-in-from-bottom-4",
              getStatusClass()
            )}
          >
            {getStatusIcon()}
            <span className="hidden sm:inline">{getStatusText()}</span>
            {(syncStats.pending > 0 || syncStats.failed > 0) && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-current/20 text-xs">
                {syncStats.pending + syncStats.failed}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1 text-xs">
            <p className="font-medium">Status da Sincronização</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
              <span>Conexão:</span>
              <span className="text-foreground">{online ? `Online (${quality})` : 'Offline'}</span>
              <span>Pendentes:</span>
              <span className="text-foreground">{syncStats.pending}</span>
              <span>Sincronizando:</span>
              <span className="text-foreground">{syncStats.syncing}</span>
              {syncStats.failed > 0 && (
                <>
                  <span>Com erro:</span>
                  <span className="text-destructive">{syncStats.failed}</span>
                </>
              )}
              {lastSyncTime && (
                <>
                  <span>Última sync:</span>
                  <span className="text-foreground">{lastSyncTime.toLocaleTimeString()}</span>
                </>
              )}
            </div>
            {!online && (
              <p className="pt-1 text-amber-600 dark:text-amber-400">
                💡 As alterações serão sincronizadas automaticamente quando a conexão for restaurada.
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default OfflineIndicator;
