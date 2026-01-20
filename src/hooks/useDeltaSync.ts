/**
 * useDeltaSync Hook
 * React hook for efficient delta synchronization
 * PATCH: Phase 2 - Technical Resilience
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { deltaSyncService } from "@/lib/sync/delta-sync-service";
import { toast } from "sonner";

interface DeltaSyncStats {
  pendingCount: number;
  lastSyncTime: Date | null;
  totalSavings: number;
  isOnline: boolean;
}

interface UseDeltaSyncOptions {
  autoSync?: boolean;
  syncInterval?: number;
  onSyncComplete?: (stats: { synced: number; failed: number; savings: number; totalSavings: number }) => void;
}

export function useDeltaSync(options: UseDeltaSyncOptions = {}) {
  const { autoSync = true, syncInterval = 30000, onSyncComplete } = options;

  const [stats, setStats] = useState<DeltaSyncStats>({
    pendingCount: 0,
    lastSyncTime: null,
    totalSavings: 0,
    isOnline: navigator.onLine,
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize service
  useEffect(() => {
    deltaSyncService.initialize();

    if (autoSync) {
      deltaSyncService.startBackgroundSync();
    }

    return () => {
      deltaSyncService.stopBackgroundSync();
    };
  }, [autoSync]);

  // PATCH iOS PWA: Removido network status listener que mostrava "Sem conexão"
  // navigator.onLine não é confiável no iOS Safari PWA
  // O sistema de retry no customFetch lida com erros reais de rede

  /**
   * Track changes for a record
   */
  const trackChange = useCallback(
    async <T extends Record<string, unknown>>(
      table: string,
      id: string,
      data: T
    ): Promise<{ savings: number }> => {
      try {
        const result = await deltaSyncService.saveDelta(table, id, data);
        setStats((prev) => ({
          ...prev,
          pendingCount: prev.pendingCount + 1,
          totalSavings: Math.round((prev.totalSavings + result.savings) / 2),
        }));
        return { savings: result.savings };
      } catch (error) {
        console.error("[useDeltaSync] Failed to track change:", error);
        return { savings: 0 };
      }
    },
    []
  );

  /**
   * Take a snapshot of current data state
   */
  const snapshot = useCallback(
    async <T extends Record<string, unknown>>(
      table: string,
      id: string,
      data: T
    ): Promise<void> => {
      await deltaSyncService.snapshot(table, id, data);
    },
    []
  );

  /**
   * Manually trigger sync
   * PATCH iOS PWA: Não bloquear baseado em navigator.onLine (não é confiável)
   */
  const syncNow = useCallback(async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      const result = await deltaSyncService.syncPendingDeltas();
      
      setStats((prev) => ({
        ...prev,
        pendingCount: Math.max(0, prev.pendingCount - result.synced),
        lastSyncTime: new Date(),
        totalSavings: result.totalSavings,
      }));

      onSyncComplete?.({ ...result, savings: result.totalSavings });

      if (result.synced > 0) {
        toast.success(`${result.synced} registros sincronizados`, {
          description: `Economia de bandwidth: ${result.totalSavings}%`,
        });
      }
    } catch (error) {
      console.error("[useDeltaSync] Sync failed:", error);
      toast.error("Falha na sincronização");
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, onSyncComplete]);

  /**
   * Clean up old synced data
   */
  const cleanup = useCallback(async () => {
    const deleted = await deltaSyncService.cleanup();
    if (deleted > 0) {
      toast.info(`${deleted} registros antigos removidos`);
    }
  }, []);

  return {
    trackChange,
    snapshot,
    syncNow,
    cleanup,
    isSyncing,
    stats,
  };
}
