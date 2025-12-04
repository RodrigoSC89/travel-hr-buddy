/**
 * Offline Sync Indicator Component
 * Shows pending offline actions and sync status
 */

import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { offlineQueue } from '@/lib/performance/offline-queue';
import { Button } from './button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './tooltip';

interface OfflineSyncIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export const OfflineSyncIndicator: React.FC<OfflineSyncIndicatorProps> = ({
  className,
  showLabel = false
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to queue changes
    const unsubscribe = offlineQueue.onQueueChange(setPendingCount);

    // Get initial count
    offlineQueue.getPendingCount().then(setPendingCount);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const handleSync = async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);
    setLastSyncResult(null);

    try {
      const result = await offlineQueue.syncQueue();
      setLastSyncResult(result.failed > 0 ? 'error' : 'success');
    } catch {
      setLastSyncResult('error');
    } finally {
      setIsSyncing(false);
      // Clear result after 3 seconds
      setTimeout(() => setLastSyncResult(null), 3000);
    }
  };

  // Don't show if online and no pending items
  if (isOnline && pendingCount === 0 && !lastSyncResult) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2", className)}>
            {!isOnline ? (
              <div className="flex items-center gap-1.5 text-orange-500">
                <CloudOff className="h-4 w-4" />
                {showLabel && <span className="text-xs">Offline</span>}
              </div>
            ) : pendingCount > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
                className="h-8 px-2 gap-1.5"
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Cloud className="h-4 w-4" />
                )}
                <span className="text-xs font-medium">{pendingCount}</span>
              </Button>
            ) : lastSyncResult === 'success' ? (
              <div className="flex items-center gap-1.5 text-green-500">
                <Check className="h-4 w-4" />
                {showLabel && <span className="text-xs">Sincronizado</span>}
              </div>
            ) : lastSyncResult === 'error' ? (
              <div className="flex items-center gap-1.5 text-destructive">
                <AlertCircle className="h-4 w-4" />
                {showLabel && <span className="text-xs">Erro ao sincronizar</span>}
              </div>
            ) : null}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {!isOnline ? (
            <p>Você está offline. As alterações serão sincronizadas quando reconectar.</p>
          ) : pendingCount > 0 ? (
            <p>{pendingCount} {pendingCount === 1 ? 'ação pendente' : 'ações pendentes'}. Clique para sincronizar.</p>
          ) : lastSyncResult === 'success' ? (
            <p>Todas as alterações foram sincronizadas!</p>
          ) : lastSyncResult === 'error' ? (
            <p>Algumas alterações não puderam ser sincronizadas.</p>
          ) : null}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
