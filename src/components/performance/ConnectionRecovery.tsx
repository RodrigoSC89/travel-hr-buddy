/**
 * Connection Recovery Component
 * PATCH v12: Removed offline messages - always shows connected for iOS PWA compatibility
 */

import { useState, useEffect } from 'react';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { offlineSyncManager } from '@/lib/offline/sync-manager';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, RefreshCw, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ConnectionRecoveryProps {
  className?: string;
  showAlways?: boolean;
}

export function ConnectionRecovery({ className, showAlways = false }: ConnectionRecoveryProps) {
  const { quality } = useNetworkStatus();
  const [stats, setStats] = useState({ pending: 0, failed: 0 });
  const [isSyncing, setIsSyncing] = useState(false);

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

  const handleSync = async () => {
    if (isSyncing) return;

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
      toast.error('Erro ao sincronizar');
    } finally {
      setIsSyncing(false);
    }
  };

  const pendingCount = stats.pending + stats.failed;

  // Don't show if no pending actions (unless showAlways)
  if (!showAlways && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <Card className={cn('fixed bottom-4 right-4 z-50 w-80 shadow-lg transition-all', className)}>
      <CardContent className="p-4">
        {/* Status Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wifi className={cn(
              'h-5 w-5',
              quality === 'fast' && 'text-green-500',
              quality === 'medium' && 'text-yellow-500',
              quality === 'slow' && 'text-orange-500'
            )} />
            <span className="font-medium">Online</span>
          </div>
          
          {quality && (
            <span className="text-xs text-muted-foreground capitalize">
              {quality}
            </span>
          )}
        </div>

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
        {pendingCount > 0 && (
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
        {pendingCount === 0 && !isSyncing && showAlways && (
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
