/**
 * Sync Status Indicator (Compact inline version)
 * For use in header/navbar - minimal footprint
 */

import { Cloud, CloudOff, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { useMobileSync } from '@/hooks/useMobileSync';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SyncStatusBadgeProps {
  className?: string;
}

export function SyncStatusBadge({ className }: SyncStatusBadgeProps) {
  const { isOnline, isSyncing, pendingCount, failedCount } = useMobileSync({ 
    showNotifications: false 
  });

  const getStatusInfo = () => {
    if (!isOnline) {
      return { icon: CloudOff, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Offline' };
    }
    if (isSyncing) {
      return { icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Sincronizando' };
    }
    if (failedCount > 0) {
      return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Erro' };
    }
    if (pendingCount > 0) {
      return { icon: Cloud, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Pendente' };
    }
    return { icon: Check, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Sincronizado' };
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  // Don't show if online and synced
  if (isOnline && pendingCount === 0 && failedCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center gap-1 p-1 rounded-full', status.bg, className)}>
            <Icon className={cn('h-4 w-4', status.color, isSyncing && 'animate-spin')} />
            {pendingCount > 0 && (
              <Badge variant="secondary" className="h-4 min-w-4 p-0 text-[10px] flex items-center justify-center">
                {pendingCount}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{status.label}</p>
          {pendingCount > 0 && <p className="text-xs text-muted-foreground">{pendingCount} pendente(s)</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default SyncStatusBadge;
