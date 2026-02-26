/**
 * Sync Queue Visual Monitor
 * Shows pending offline operations with retry controls
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPendingActions, removeAction } from "@/lib/offline/sync-queue";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { toast } from "sonner";
import { CloudUpload, Trash2, RefreshCw, WifiOff, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export function SyncQueueMonitor() {
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);

  const { data: actions = [], isLoading } = useQuery({
    queryKey: ['sync-queue-monitor'],
    queryFn: getPendingActions,
    refetchInterval: 3000,
  });

  const syncAll = useMutation({
    mutationFn: async () => {
      if (!navigator.onLine) throw new Error('Sem conexão');
      setSyncing(true);
      let synced = 0;
      for (const action of actions) {
        try {
          if (action.type === 'noon_report') {
            const { error } = await fromUntyped('noon_reports').insert(action.payload as any);
            if (!error) {
              await removeAction(action.id);
              synced++;
            }
          } else {
            // Generic sync for other types
            const payload = action.payload as any;
            if (payload?.table) {
              const { error } = await fromUntyped(payload.table).insert(payload.data || payload);
              if (!error) {
                await removeAction(action.id);
                synced++;
              }
            }
          }
        } catch {
          // Continue with next
        }
      }
      return synced;
    },
    onSuccess: (count) => {
      toast.success(`${count} operação(ões) sincronizada(s)`);
      queryClient.invalidateQueries({ queryKey: ['sync-queue-monitor'] });
      queryClient.invalidateQueries({ queryKey: ['offline-pending-count'] });
      setSyncing(false);
    },
    onError: () => {
      toast.error('Falha na sincronização — sem conexão');
      setSyncing(false);
    },
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      await removeAction(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-queue-monitor'] });
      queryClient.invalidateQueries({ queryKey: ['offline-pending-count'] });
    },
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CloudUpload className="h-4 w-4 text-primary" />
            Fila de Sincronização
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={navigator.onLine ? 'outline' : 'destructive'} className="text-[10px]">
              {navigator.onLine ? 'Online' : 'Offline'}
            </Badge>
            {actions.length > 0 && (
              <Button size="sm" variant="outline" onClick={() => syncAll.mutate()} disabled={syncing || !navigator.onLine}>
                <RefreshCw className={`h-3 w-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                Sincronizar ({actions.length})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-xs">Tudo sincronizado</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {actions.map(action => (
              <div key={action.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {action.retries > 0 ? (
                    <AlertCircle className="h-4 w-4 text-accent-foreground shrink-0" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{action.type}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(action.timestamp), 'dd/MM HH:mm')}
                      {action.retries > 0 && ` • ${action.retries} tentativas`}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0"
                  onClick={() => removeItem.mutate(action.id)}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SyncQueueMonitor;
