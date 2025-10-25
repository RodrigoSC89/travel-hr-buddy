/**
 * SyncStatus Component - Patch 149.1
 * Displays sync status and controls for crew app
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Wifi,
  WifiOff,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SyncStatusProps {
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: string | null;
  isOnline: boolean;
  onSync?: () => void;
  onClear?: () => void;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  pendingCount,
  isSyncing,
  lastSyncTime,
  isOnline,
  onSync,
  onClear,
}) => {
  const formatTime = (timestamp: string | null): string => {
    if (!timestamp) return "Nunca";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return `${seconds}s atrás`;
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return date.toLocaleDateString("pt-BR");
  };

  const getSyncStatusBadge = () => {
    if (isSyncing) {
      return (
        <Badge variant="default" className="gap-1 bg-blue-600">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Sincronizando
        </Badge>
      );
    }

    if (!isOnline) {
      return (
        <Badge variant="secondary" className="gap-1 bg-orange-600">
          <WifiOff className="h-3 w-3" />
          Offline
        </Badge>
      );
    }

    if (pendingCount > 0) {
      return (
        <Badge variant="secondary" className="gap-1 bg-yellow-600">
          <Clock className="h-3 w-3" />
          {pendingCount} Pendente{pendingCount !== 1 ? "s" : ""}
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="gap-1 bg-green-600">
        <CheckCircle className="h-3 w-3" />
        Sincronizado
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-5 w-5" />
            Status de Sincronização
          </CardTitle>
          {getSyncStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Progress */}
        {isSyncing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sincronizando...</span>
              <span className="font-medium">{pendingCount} itens</span>
            </div>
            <Progress value={undefined} className="h-2" />
          </div>
        )}

        {/* Connection Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Conexão</div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Offline</span>
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Última Sync</div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{formatTime(lastSyncTime)}</span>
            </div>
          </div>
        </div>

        {/* Pending Items Summary */}
        {pendingCount > 0 && (
          <div className={cn(
            "p-3 rounded-lg border",
            isOnline 
              ? "bg-yellow-50 dark:bg-yellow-950 border-yellow-500"
              : "bg-orange-50 dark:bg-orange-950 border-orange-500"
          )}>
            <div className="flex items-start gap-2">
              <AlertCircle className={cn(
                "h-4 w-4 mt-0.5",
                isOnline ? "text-yellow-600" : "text-orange-600"
              )} />
              <div className="flex-1">
                <p className={cn(
                  "text-sm font-medium",
                  isOnline 
                    ? "text-yellow-900 dark:text-yellow-100"
                    : "text-orange-900 dark:text-orange-100"
                )}>
                  {pendingCount} {pendingCount === 1 ? "item" : "itens"} aguardando sincronização
                </p>
                <p className={cn(
                  "text-xs mt-1",
                  isOnline 
                    ? "text-yellow-800 dark:text-yellow-200"
                    : "text-orange-800 dark:text-orange-200"
                )}>
                  {isOnline 
                    ? "Os dados serão sincronizados automaticamente"
                    : "Conecte-se à internet para sincronizar"
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={onSync}
            disabled={!isOnline || isSyncing || pendingCount === 0}
            className="flex-1"
            size="sm"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isSyncing && "animate-spin")} />
            Sincronizar Agora
          </Button>
          
          {pendingCount > 0 && (
            <Button
              onClick={onClear}
              disabled={isSyncing}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Limpar Fila
            </Button>
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground">
          <p>
            Os dados são salvos localmente e sincronizados automaticamente quando online.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
