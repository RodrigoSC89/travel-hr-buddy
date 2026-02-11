/**
 * MLC Offline Indicator Component
 * Shows offline status and sync progress for MLC inspections
 * PATCH 860: PWA Offline Mode for MLC Module
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, WifiOff, Cloud, CloudOff, RefreshCw, CheckCircle2, 
  Clock, AlertTriangle, Database
} from 'lucide-react';
import { useMLCOffline } from '@/hooks/use-mlc-offline';
import { cn } from '@/lib/utils';

export const MLCOfflineIndicator: React.FC = () => {
  const { 
    isOnline, 
    isSyncing, 
    pendingSyncCount, 
    lastSyncTime,
    syncNow 
  } = useMLCOffline();

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Nunca';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Connection Status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={isOnline ? "default" : "destructive"}
              className={cn(
                "flex items-center gap-1 px-2 py-1",
                isOnline ? "bg-success hover:bg-success/90" : "bg-destructive"
              )}
            >
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3" />
                  <span className="text-xs">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span className="text-xs">Offline</span>
                </>
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isOnline ? 'Conexão ativa' : 'Trabalhando offline - dados serão sincronizados automaticamente'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Pending Sync Count */}
        {pendingSyncCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className={cn(
                  "flex items-center gap-1 px-2 py-1",
                  isSyncing ? "border-primary text-primary" : "border-warning text-warning"
                )}
              >
                {isSyncing ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <CloudOff className="h-3 w-3" />
                )}
                <span className="text-xs">{pendingSyncCount} pendente(s)</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p>{pendingSyncCount} inspeção(ões) aguardando sincronização</p>
                {isSyncing && <p className="text-primary">Sincronizando...</p>}
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Synced Status */}
        {pendingSyncCount === 0 && isOnline && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className="flex items-center gap-1 px-2 py-1 border-success text-success"
              >
                <CheckCircle2 className="h-3 w-3" />
                <span className="text-xs">Sincronizado</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Todos os dados estão sincronizados</p>
              <p className="text-muted-foreground text-xs">Última sync: {formatLastSync(lastSyncTime)}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Sync Button */}
        {isOnline && pendingSyncCount > 0 && !isSyncing && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-7 px-2"
                onClick={syncNow}
              >
                <Cloud className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sincronizar agora</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

// Compact version for mobile
export const MLCOfflineIndicatorCompact: React.FC = () => {
  const { isOnline, isSyncing, pendingSyncCount } = useMLCOffline();

  return (
    <div className="flex items-center gap-1">
      {isOnline ? (
        <Wifi className="h-4 w-4 text-success" />
      ) : (
        <WifiOff className="h-4 w-4 text-destructive" />
      )}
      {pendingSyncCount > 0 && (
        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
          {isSyncing ? <RefreshCw className="h-3 w-3 animate-spin" /> : pendingSyncCount}
        </Badge>
      )}
    </div>
  );
};

// Full status panel for settings
export const MLCOfflineStatusPanel: React.FC = () => {
  const { 
    isOnline, 
    isSyncing, 
    pendingSyncCount, 
    lastSyncTime,
    inspections,
    syncNow,
    clearOfflineData
  } = useMLCOffline();

  const localInspections = inspections.filter(i => i.status !== 'synced').length;
  const syncedInspections = inspections.filter(i => i.status === 'synced').length;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Database className="h-4 w-4" />
          Status Offline MLC
        </h3>
        <Badge variant={isOnline ? "default" : "destructive"}>
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-muted-foreground">Inspeções Locais</p>
          <p className="text-2xl font-bold">{localInspections}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Sincronizadas</p>
          <p className="text-2xl font-bold text-success">{syncedInspections}</p>
        </div>
      </div>

      {pendingSyncCount > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Sincronização</span>
            <span>{isSyncing ? 'Em progresso...' : `${pendingSyncCount} pendente(s)`}</span>
          </div>
          <Progress value={isSyncing ? 50 : 0} className="h-2" />
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Última sync: {lastSyncTime ? lastSyncTime.toLocaleString('pt-BR') : 'Nunca'}
        </span>
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={syncNow}
          disabled={isSyncing || pendingSyncCount === 0}
          className="flex-1"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isSyncing && "animate-spin")} />
          Sincronizar
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={clearOfflineData}
          className="text-destructive hover:text-destructive"
        >
          Limpar
        </Button>
      </div>

      {/* PATCH v19: Banner de "Modo Offline" removido - sempre assume online */}
    </div>
  );
};