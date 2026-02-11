/**
 * Sync Status Indicator Component
 * Shows offline sync status for mobile users
 */

import { Cloud, CloudOff, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { useMobileSync } from '@/hooks/useMobileSync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SyncStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

export function SyncStatusIndicator({ 
  className, 
  showLabel = false,
  compact = false 
}: SyncStatusIndicatorProps) {
  const { 
    isOnline, 
    isSyncing, 
    pendingCount, 
    failedCount,
    syncNow 
  } = useMobileSync({ showNotifications: false });

  const getStatusInfo = () => {
    // PATCH iOS PWA: Removido check de !isOnline que mostrava "Offline"
    // navigator.onLine não é confiável no iOS Safari PWA
    
    if (isSyncing) {
      return {
        icon: RefreshCw,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        label: 'Sincronizando',
        description: 'Enviando dados...'
      };
    }
    
    if (failedCount > 0) {
      return {
        icon: AlertCircle,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        label: 'Erro',
        description: `${failedCount} falha(s)`
      };
    }
    
    if (pendingCount > 0) {
      return {
        icon: Cloud,
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        label: 'Pendente',
        description: `${pendingCount} para sincronizar`
      };
    }
    
    return {
      icon: Check,
      color: 'text-success',
      bgColor: 'bg-success/10',
      label: 'Sincronizado',
      description: 'Todos os dados atualizados'
    };
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={cn(
                'flex items-center gap-1 p-1 rounded-full',
                status.bgColor,
                className
              )}
            >
              <Icon 
                className={cn(
                  'h-4 w-4',
                  status.color,
                  isSyncing && 'animate-spin'
                )} 
              />
              {pendingCount > 0 && (
                <Badge variant="secondary" className="h-4 min-w-4 p-0 text-[10px] flex items-center justify-center">
                  {pendingCount}
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{status.label}</p>
            <p className="text-xs text-muted-foreground">{status.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div 
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full',
          status.bgColor
        )}
      >
        <Icon 
          className={cn(
            'h-4 w-4',
            status.color,
            isSyncing && 'animate-spin'
          )} 
        />
        
        {showLabel && (
          <span className={cn('text-sm font-medium', status.color)}>
            {status.label}
          </span>
        )}
        
        {pendingCount > 0 && !showLabel && (
          <Badge variant="secondary" className="h-5">
            {pendingCount}
          </Badge>
        )}
      </div>

      {isOnline && pendingCount > 0 && !isSyncing && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={syncNow}
          className="h-8"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Sync
        </Button>
      )}
    </div>
  );
}

export default SyncStatusIndicator;
