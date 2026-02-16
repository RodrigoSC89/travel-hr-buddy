/**
 * NAUTI ONE - Offline Status Bar
 * Indicador visual discreto de status de conexão e sincronização
 * Começa minimizado como uma pill pequena, expansível ao clicar
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Cloud,
  CloudOff,
  X,
  ChevronDown,
  ChevronUp,
  Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSyncStatus, useOfflineStats } from '@/lib/offline/hooks/useOfflineData';
import { cn } from '@/lib/utils';

interface OfflineStatusBarProps {
  position?: 'top' | 'bottom';
  showDetails?: boolean;
  className?: string;
}

export function OfflineStatusBar({ 
  position = 'bottom',
  showDetails = true,
  className,
}: OfflineStatusBarProps) {
  const { 
    status, 
    progress, 
    pendingCount, 
    isOnline, 
    lastSyncTime,
    error,
    currentOperation,
    triggerSync,
  } = useSyncStatus();
  
  const stats = useOfflineStats();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true); // Start minimized
  const [isDismissed, setIsDismissed] = useState(false);

  // Auto-expand when offline or error
  useEffect(() => {
    if (!isOnline || status === 'error') {
      setIsMinimized(false);
      setIsDismissed(false);
    }
  }, [isOnline, status]);

  // Auto-minimize after sync completes
  useEffect(() => {
    if (isOnline && status === 'idle' && pendingCount === 0) {
      const timer = setTimeout(() => setIsMinimized(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, status, pendingCount]);

  // Hide completely if dismissed and nothing pending
  if (isOnline && status === 'idle' && pendingCount === 0 && isDismissed) {
    return null;
  }

  const getStatusColor = () => {
    if (!isOnline) return 'bg-destructive/10 border-destructive/30 text-destructive';
    if (status === 'syncing') return 'bg-primary/10 border-primary/30 text-primary';
    if (status === 'error') return 'bg-warning/10 border-warning/30 text-warning';
    if (pendingCount > 0) return 'bg-warning/10 border-warning/30 text-warning';
    return 'bg-success/10 border-success/30 text-success';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-3.5 w-3.5" />;
    if (status === 'syncing') return <RefreshCw className="h-3.5 w-3.5 animate-spin" />;
    if (status === 'error') return <AlertCircle className="h-3.5 w-3.5" />;
    if (pendingCount > 0) return <Cloud className="h-3.5 w-3.5" />;
    return <Check className="h-3.5 w-3.5" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (status === 'syncing') return currentOperation || 'Sincronizando...';
    if (status === 'error') return 'Erro sync';
    if (pendingCount > 0) return `${pendingCount} pendente${pendingCount > 1 ? 's' : ''}`;
    return 'Sincronizado';
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Nunca sincronizado';
    const diff = Date.now() - (lastSyncTime instanceof Date ? lastSyncTime.getTime() : Number(lastSyncTime));
    if (diff < 60000) return 'Há menos de 1 minuto';
    if (diff < 3600000) return `Há ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Há ${Math.floor(diff / 3600000)}h`;
    return `Há ${Math.floor(diff / 86400000)}d`;
  };

  // ========== MINIMIZED STATE: Small pill ==========
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'fixed z-40',
          position === 'bottom' ? 'bottom-4 left-4' : 'top-4 left-4',
          className
        )}
      >
        <button
          onClick={() => setIsMinimized(false)}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border shadow-md backdrop-blur-md',
            'text-xs font-medium transition-all hover:scale-105 cursor-pointer',
            'opacity-60 hover:opacity-100',
            getStatusColor()
          )}
          title="Expandir status de sincronização"
          aria-label="Expandir status de sincronização"
        >
          {getStatusIcon()}
          {(pendingCount > 0 || !isOnline || status === 'error') && (
            <span className="hidden sm:inline">{getStatusText()}</span>
          )}
        </button>
      </motion.div>
    );
  }

  // ========== EXPANDED STATE ==========
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: position === 'bottom' ? 20 : -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: position === 'bottom' ? 20 : -20 }}
        className={cn(
          'fixed left-4 z-40',
          position === 'bottom' ? 'bottom-4' : 'top-4',
          'max-w-xs',
          className
        )}
      >
        <div
          className={cn(
            'rounded-lg border shadow-lg backdrop-blur-sm',
            getStatusColor()
          )}
        >
          {/* Main bar */}
          <div className="flex items-center gap-2 p-2.5">
            <div className="flex-shrink-0">
              {getStatusIcon()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {getStatusText()}
              </p>
              {status === 'syncing' && (
                <Progress value={progress} className="h-0.5 mt-1" />
              )}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {pendingCount > 0 && status !== 'syncing' && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1">
                  {pendingCount}
                </Badge>
              )}

              {isOnline && status !== 'syncing' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => triggerSync()}
                  aria-label="Sincronizar dados"
                  title="Sincronizar"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}

              {showDetails && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsExpanded(!isExpanded)}
                  aria-label={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                </Button>
              )}

              {/* Minimize button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsMinimized(true)}
                aria-label="Minimizar barra de sincronização"
                title="Minimizar"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>

              {/* Close completely */}
              {isOnline && status === 'idle' && pendingCount === 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsDismissed(true)}
                  aria-label="Fechar"
                  title="Fechar"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Expanded details */}
          <AnimatePresence>
            {isExpanded && showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-2.5 pb-2.5 pt-0 space-y-2 border-t border-current/10">
                  <div className="flex items-center justify-between text-[10px] mt-2">
                    <span className="text-muted-foreground">Conexão</span>
                    <span className="flex items-center gap-1">
                      {isOnline ? (
                        <><Wifi className="h-2.5 w-2.5 text-success" /><span>Online</span></>
                      ) : (
                        <><WifiOff className="h-2.5 w-2.5 text-destructive" /><span>Offline</span></>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Última sync</span>
                    <span>{formatLastSync()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Dados locais</span>
                    <span>{stats.vessels} emb., {stats.crewMembers} trip.</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Pendentes</span>
                    <span>{stats.pendingOperations}</span>
                  </div>
                  {error && (
                    <div className="text-[10px] text-destructive bg-destructive/10 p-1.5 rounded">
                      {error}
                    </div>
                  )}
                  {!isOnline && (
                    <div className="text-[10px] text-muted-foreground bg-muted/50 p-1.5 rounded">
                      Alterações salvas localmente. Sincronização automática ao reconectar.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Compact version for headers/navbars
 */
export function OfflineStatusBadge({ className }: { className?: string }) {
  const { status, pendingCount, isOnline, triggerSync } = useSyncStatus();

  if (isOnline && status === 'idle' && pendingCount === 0) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'gap-2 h-8',
        !isOnline && 'text-destructive',
        status === 'syncing' && 'text-primary',
        status === 'error' && 'text-warning',
        className
      )}
      onClick={() => isOnline && triggerSync()}
    >
      {!isOnline ? (
        <WifiOff className="h-4 w-4" />
      ) : status === 'syncing' ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : status === 'error' ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <Cloud className="h-4 w-4" />
      )}
      
      {pendingCount > 0 && (
        <Badge variant="secondary" className="text-xs h-5 px-1.5">
          {pendingCount}
        </Badge>
      )}
    </Button>
  );
}
