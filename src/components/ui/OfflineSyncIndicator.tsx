/**
 * Offline Sync Indicator Component
 * Shows pending offline actions and sync status
 * 
 * PATCH iOS PWA: NÃO usa navigator.onLine - apenas mostra operações pendentes
 */

import React, { useState, useEffect } from 'react';
import { Cloud, RefreshCw, Check, AlertCircle } from 'lucide-react';
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
  // PATCH iOS PWA: REMOVIDO estado isOnline baseado em navigator.onLine
  // navigator.onLine não é confiável no iOS Safari PWA
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    // PATCH iOS PWA: Removidos event listeners de online/offline

    // Subscribe to queue changes
    const unsubscribe = offlineQueue.onQueueChange(setPendingCount);

    // Get initial count
    offlineQueue.getPendingCount().then(setPendingCount);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSync = async () => {
    if (isSyncing) return;

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

  // Don't show if no pending items and no recent result
  if (pendingCount === 0 && !lastSyncResult) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2", className)}>
            {pendingCount > 0 ? (
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
              <div className="flex items-center gap-1.5 text-success">
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
          {pendingCount > 0 ? (
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
