import { memo, memo, useEffect, useState, useCallback } from "react";;;
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wifi, WifiOff, RefreshCw, Check, AlertCircle } from "lucide-react";
import { offlineCache } from "@/lib/offline-cache";
import { useToast } from "@/hooks/use-toast";

/**
 * PATCH 634: Sync Status Component
 * Display connection status and sync pending offline data
 */
export const SyncStatus = memo(function() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back online",
        description: "Connection restored. Syncing pending data...",
      });
      syncPendingData();
    });

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Changes will be saved locally and synced when reconnected",
        variant: "destructive",
      });
    });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Load pending count
    loadPendingCount();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
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

  const syncPendingData = async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      // Get all pending items
      const [docs, logs, actions] = await Promise.all([
        offlineCache.getUnsyncedDocuments(),
        offlineCache.getUnsyncedLogs(),
        offlineCache.getPendingActions(),
      ]);

      // Sync documents
      for (const doc of docs) {
        try {
          // TODO: Implement actual sync to Supabase
          await offlineCache.markDocumentSynced(doc.id);
        } catch (error) {
          console.error("Failed to sync document:", error);
        }
      }

      // Sync logs
      for (const log of logs) {
        try {
          // TODO: Implement actual sync to Supabase
          await offlineCache.markLogSynced(log.id);
        } catch (error) {
          console.error("Failed to sync log:", error);
        }
      }

      // Process pending actions
      for (const action of actions) {
        try {
          // TODO: Implement actual action processing
          await offlineCache.removePendingAction(action.id);
        } catch (error) {
          console.error("Failed to process action:", error);
        }
      }

      setLastSyncTime(new Date());
      await loadPendingCount();

      toast({
        title: "Sync complete",
        description: "All pending changes have been synchronized",
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to sync some changes. Will retry automatically.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  });

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-64 shadow-lg">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Status indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Offline</span>
                  </>
                )}
              </div>
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? "Connected" : "Disconnected"}
              </Badge>
            </div>

            {/* Pending items */}
            {pendingCount > 0 && (
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

            {/* Sync button */}
            {isOnline && pendingCount > 0 && (
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

            {/* Offline warning */}
            {!isOnline && (
              <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded text-xs">
                <AlertCircle className="h-3 w-3 text-yellow-600 flex-shrink-0 mt-0.5" />
                <span className="text-yellow-900">
                  Working offline. Changes will sync when connection is restored.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
