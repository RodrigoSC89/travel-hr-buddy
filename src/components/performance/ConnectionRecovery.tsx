/**
 * Connection Recovery Component
 * Shows connection status and handles reconnection
 */

import { useState, useEffect } from "react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { offlineSyncManager } from "@/lib/offline/sync-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Wifi, WifiOff, RefreshCw, CloudOff, 
  CheckCircle, Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ConnectionRecoveryProps {
  className?: string;
  showAlways?: boolean;
}

export function ConnectionRecovery({ className, showAlways = false }: ConnectionRecoveryProps) {
  const { online, quality } = useNetworkStatus();
  const [stats, setStats] = useState({ pending: 0, failed: 0 });
  const [isSyncing, setIsSyncing] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  // Track offline state
  useEffect(() => {
    if (!online) {
      setWasOffline(true);
    }
  }, [online]);

  // Get pending actions count
  useEffect(() => {
    const checkStats = () => {
      const syncStats = offlineSyncManager.getStats();
      setStats({ pending: syncStats.pending, failed: syncStats.failed });
    };

    checkStats();
    const interval = setInterval(checkStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (online && wasOffline && stats.pending > 0) {
      handleSync();
      setWasOffline(false);
    }
  }, [online, wasOffline, stats.pending]);

  const handleSync = async () => {
    if (isSyncing || !online) return;

    setIsSyncing(true);

    try {
      const result = await offlineSyncManager.syncAll();
      
      if (result.pending === 0 && result.failed === 0) {
        toast.success(`${result.completed} ações sincronizadas`);
        offlineSyncManager.clearCompleted();
      } else if (result.failed > 0) {
        toast.warning(`${result.completed} sincronizadas, ${result.failed} falharam`);
      }
      
      setStats({ pending: result.pending, failed: result.failed });
    } catch (error) {
      toast.error("Erro ao sincronizar");
    } finally {
      setIsSyncing(false);
    }
  };

  const pendingCount = stats.pending + stats.failed;

  // Don't show if online with no pending actions (unless showAlways)
  if (!showAlways && online && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <Card className={cn(
      "fixed bottom-4 right-4 z-50 w-80 shadow-lg transition-all",
      !online && "border-destructive",
      className
    )}>
      <CardContent className="p-4">
        {/* Status Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {online ? (
              <Wifi className={cn(
                "h-5 w-5",
                quality === "fast" && "text-green-500",
                quality === "medium" && "text-yellow-500",
                quality === "slow" && "text-orange-500"
              )} />
            ) : (
              <WifiOff className="h-5 w-5 text-destructive" />
            )}
            <span className="font-medium">
              {online ? "Online" : "Offline"}
            </span>
          </div>
          
          {quality && online && (
            <span className="text-xs text-muted-foreground capitalize">
              {quality}
            </span>
          )}
        </div>

        {/* Offline Message */}
        {!online && (
          <div className="flex items-start gap-2 mb-3 p-2 rounded bg-destructive/10">
            <CloudOff className="h-4 w-4 text-destructive mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-destructive">Sem conexão</p>
              <p className="text-muted-foreground text-xs">
                Suas alterações serão salvas localmente
              </p>
            </div>
          </div>
        )}

        {/* Pending Actions */}
        {pendingCount > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Ações pendentes</span>
              <span className="font-medium">{pendingCount}</span>
            </div>
          </div>
        )}

        {/* Sync Button */}
        {online && pendingCount > 0 && (
          <Button 
            onClick={handleSync} 
            disabled={isSyncing}
            className="w-full"
            size="sm"
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar agora
              </>
            )}
          </Button>
        )}

        {/* Success State */}
        {online && pendingCount === 0 && !isSyncing && showAlways && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Tudo sincronizado</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ConnectionRecovery;
