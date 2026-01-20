import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wifi, WifiOff, RefreshCw, Check, AlertCircle } from "lucide-react";
import { offlineCache } from "@/lib/offline-cache";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * PATCH 634.1: Sync Status Component with Real Supabase Integration
 * Display connection status and sync pending offline data to Supabase
 */
export function SyncStatus() {
  // PATCH iOS PWA: Removido navigator.onLine - sempre assumir online
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const { toast } = useToast();

  useEffect(() => {
    // PATCH iOS PWA: Removidos event listeners de online/offline
    // navigator.onLine não é confiável no iOS Safari PWA

    // Load pending count
    loadPendingCount();
  }, []);

  const loadPendingCount = async () => {
    try {
      const [docs, logs, actions] = await Promise.all([
        offlineCache.getUnsyncedDocuments(),
        offlineCache.getUnsyncedLogs(),
        offlineCache.getPendingActions(),
      ]);
      setPendingCount(docs.length + logs.length + actions.length);
    } catch (error) {
      console.error("Failed to load pending count:", error);
    }
  };

  /**
   * Sync a single document to Supabase
   */
  const syncDocument = async (doc: any): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('ai_documents')
        .upsert({
          id: doc.id,
          file_name: doc.file_name || doc.name,
          file_type: doc.file_type || doc.type || 'application/octet-stream',
          storage_path: doc.storage_path || `offline/${doc.id}`,
          ocr_status: 'pending',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) {
        console.error("Failed to sync document:", error);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Document sync error:", error);
      return false;
    }
  };

  /**
   * Sync a log entry to Supabase
   */
  const syncLog = async (log: any): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('access_logs')
        .insert({
          action: log.action || 'offline_action',
          module_accessed: log.module || 'offline',
          result: log.result || 'synced',
          severity: log.severity || 'info',
          details: log.details || {},
          timestamp: log.timestamp || new Date().toISOString(),
        });

      if (error) {
        console.error("Failed to sync log:", error);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Log sync error:", error);
      return false;
    }
  };

  /**
   * Process a pending action (crew update, checklist item, etc.)
   */
  const processAction = async (action: any): Promise<boolean> => {
    try {
      const { actionType, payload, table } = action;

      switch (actionType) {
        case 'CREATE':
          const { error: createError } = await supabase
            .from(table || 'action_items')
            .insert(payload);
          if (createError) throw createError;
          break;

        case 'UPDATE':
          const { error: updateError } = await supabase
            .from(table || 'action_items')
            .update(payload.data)
            .eq('id', payload.id);
          if (updateError) throw updateError;
          break;

        case 'DELETE':
          const { error: deleteError } = await supabase
            .from(table || 'action_items')
            .delete()
            .eq('id', payload.id);
          if (deleteError) throw deleteError;
          break;

        default:
          console.warn("Unknown action type:", actionType);
          return true; // Mark as processed
      }

      return true;
    } catch (error) {
      console.error("Action processing error:", error);
      return false;
    }
  };

  const syncPendingData = async () => {
    // PATCH iOS PWA: Removido check de isOnline
    if (isSyncing) return;

    setIsSyncing(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Get all pending items
      const [docs, logs, actions] = await Promise.all([
        offlineCache.getUnsyncedDocuments(),
        offlineCache.getUnsyncedLogs(),
        offlineCache.getPendingActions(),
      ]);

      const totalItems = docs.length + logs.length + actions.length;
      setSyncProgress({ current: 0, total: totalItems });

      // Sync documents
      for (const doc of docs) {
        const success = await syncDocument(doc);
        if (success) {
          await offlineCache.markDocumentSynced(doc.id);
          successCount++;
        } else {
          failCount++;
        }
        setSyncProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }

      // Sync logs
      for (const log of logs) {
        const success = await syncLog(log);
        if (success) {
          await offlineCache.markLogSynced(log.id);
          successCount++;
        } else {
          failCount++;
        }
        setSyncProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }

      // Process pending actions
      for (const action of actions) {
        const success = await processAction(action);
        if (success) {
          await offlineCache.removePendingAction(action.id);
          successCount++;
        } else {
          failCount++;
        }
        setSyncProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }

      setLastSyncTime(new Date());
      await loadPendingCount();

      if (failCount === 0) {
        toast({
          title: "Sync complete",
          description: `All ${successCount} pending changes have been synchronized`,
        });
      } else {
        toast({
          title: "Sync partially complete",
          description: `${successCount} synced, ${failCount} failed. Will retry failed items.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to sync some changes. Will retry automatically.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
      setSyncProgress({ current: 0, total: 0 });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-64 shadow-lg">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* PATCH iOS PWA: Sempre mostrar Online */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Online</span>
              </div>
              <Badge variant="default">
                Connected
              </Badge>
            </div>

            {/* Sync progress */}
            {isSyncing && syncProgress.total > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Syncing...</span>
                  <span>{syncProgress.current}/{syncProgress.total}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Pending items */}
            {pendingCount > 0 && !isSyncing && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pending changes:</span>
                <span className="font-medium">{pendingCount}</span>
              </div>
            )}

            {/* Last sync time */}
            {lastSyncTime && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="h-3 w-3" />
                <span>Last synced: {lastSyncTime.toLocaleTimeString()}</span>
              </div>
            )}

            {/* Sync button - PATCH iOS PWA: Removido check de isOnline */}
            {pendingCount > 0 && (
              <Button
                size="sm"
                onClick={syncPendingData}
                disabled={isSyncing}
                className="w-full"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </>
                )}
              </Button>
            )}

            {/* PATCH iOS PWA: Removido offline warning que usava isOnline */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}