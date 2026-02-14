/**
 * NAUTI ONE - Offline Status Bar
 * Indicador visual de status de conexão e sincronização
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
  const [isDismissed, setIsDismissed] = useState(false);

  // Mostrar automaticamente quando offline ou syncing
  useEffect(() => {
    if (!isOnline || status === 'syncing') {
      setIsDismissed(false);
    }
  }, [isOnline, status]);

  // Se tudo OK e nada pendente, não mostrar nada
  if (isOnline && status === 'idle' && pendingCount === 0 && isDismissed) {
    return null;
  }

  const getStatusColor = () => {
    if (!isOnline) return 'bg-destructive/10 border-destructive/30 text-destructive';
    if (status === 'syncing') return 'bg-primary/10 border-primary/30 text-primary';
    if (status === 'error') return 'bg-warning/10 border-warning/30 text-warning';
    if (pendingCount > 0) return 'bg-amber-500/10 border-amber-500/30 text-amber-500';
    return 'bg-green-500/10 border-green-500/30 text-green-500';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    if (status === 'syncing') return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (status === 'error') return <AlertCircle className="h-4 w-4" />;
    if (pendingCount > 0) return <Cloud className="h-4 w-4" />;
    return <Check className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Modo Offline';
    if (status === 'syncing') return currentOperation || 'Sincronizando...';
    if (status === 'error') return 'Erro na sincronização';
    if (pendingCount > 0) return `${pendingCount} pendente${pendingCount > 1 ? 's' : ''}`;
    return 'Sincronizado';
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Nunca sincronizado';
    const diff = Date.now() - (lastSyncTime instanceof Date ? lastSyncTime.getTime() : Number(lastSyncTime));
    if (diff < 60000) return 'Há menos de 1 minuto';
    if (diff < 3600000) return `Há ${Math.floor(diff / 60000)} minutos`;
    if (diff < 86400000) return `Há ${Math.floor(diff / 3600000)} horas`;
    return `Há ${Math.floor(diff / 86400000)} dias`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: position === 'bottom' ? 20 : -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: position === 'bottom' ? 20 : -20 }}
        className={cn(
          'fixed left-4 right-4 z-50',
          position === 'bottom' ? 'bottom-4' : 'top-4',
          'max-w-md mx-auto',
          className
        )}
      >
        <div
          className={cn(
            'rounded-lg border shadow-lg backdrop-blur-sm',
            getStatusColor()
          )}
        >
          {/* Barra principal */}
          <div className="flex items-center gap-3 p-3">
            {/* Ícone de status */}
            <div className="flex-shrink-0">
              {getStatusIcon()}
            </div>

            {/* Texto de status */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {getStatusText()}
              </p>
              {status === 'syncing' && (
                <Progress value={progress} className="h-1 mt-1" />
              )}
            </div>

            {/* Badges e ações */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {pendingCount > 0 && status !== 'syncing' && (
                <Badge variant="secondary" className="text-xs">
                  {pendingCount}
                </Badge>
              )}

              {/* Botão de sync manual */}
              {isOnline && status !== 'syncing' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => triggerSync()}
                  aria-label="Sincronizar dados"
                  title="Sincronizar"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}

              {/* Expandir/Colapsar */}
              {showDetails && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsExpanded(!isExpanded)}
                  aria-label={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                  title={isExpanded ? "Recolher" : "Expandir"}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </Button>
              )}

              {/* Fechar */}
              {isOnline && status === 'idle' && pendingCount === 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsDismissed(true)}
                  aria-label="Fechar barra offline"
                  title="Fechar"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Detalhes expandidos */}
          <AnimatePresence>
            {isExpanded && showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 pt-0 space-y-3 border-t border-current/10">
                  {/* Status de conexão */}
                  <div className="flex items-center justify-between text-xs mt-3">
                    <span className="text-muted-foreground">Conexão</span>
                    <span className="flex items-center gap-1">
                      {isOnline ? (
                        <>
                          <Wifi className="h-3 w-3 text-green-500" />
                          <span>Online</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="h-3 w-3 text-destructive" />
                          <span>Offline</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Última sincronização */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Última sincronização</span>
                    <span>{formatLastSync()}</span>
                  </div>

                  {/* Dados locais */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Dados locais</span>
                    <span>
                      {stats.vessels} embarcações, {stats.crewMembers} tripulantes
                    </span>
                  </div>

                  {/* Pendentes */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Operações pendentes</span>
                    <span>{stats.pendingOperations}</span>
                  </div>

                  {/* Erro */}
                  {error && (
                    <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                      {error}
                    </div>
                  )}

                  {/* Mensagem offline */}
                  {!isOnline && (
                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      Suas alterações estão sendo salvas localmente e serão sincronizadas automaticamente quando a conexão for restaurada.
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
