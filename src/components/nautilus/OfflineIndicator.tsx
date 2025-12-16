/**
 * Offline Indicator - Shows sync status and pending actions
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, isSyncing, pendingCount, lastSyncStatus, forceSync } = useOfflineSync();

  const handleSync = async () => {
    try {
      await forceSync();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Connection Status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
              isOnline 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isOnline 
              ? 'Conectado - dados sincronizando em tempo real' 
              : 'Modo offline - dados serão sincronizados quando a conexão for restaurada'}
          </TooltipContent>
        </Tooltip>

        {/* Pending Actions */}
        <AnimatePresence>
          {pendingCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="gap-1 cursor-pointer" onClick={handleSync}>
                    {isSyncing ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <CloudOff className="h-3 w-3" />
                    )}
                    {pendingCount}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {pendingCount} ações pendentes de sincronização
                  <br />
                  <span className="text-muted-foreground text-xs">Clique para sincronizar</span>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sync Status */}
        {lastSyncStatus === 'synced' && pendingCount === 0 && isOnline && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <Cloud className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              Tudo sincronizado
            </TooltipContent>
          </Tooltip>
        )}

        {/* Manual Sync Button */}
        {isOnline && pendingCount > 0 && !isSyncing && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleSync}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Sincronizar agora
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
