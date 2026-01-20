/**
 * PATCH 837.1: Offline Status Indicator
 * PATCH iOS PWA: NÃO mostrar estado offline baseado em navigator.onLine
 * Apenas mostra status de sincronização pendente
 */

import * as React from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, RefreshCw, AlertTriangle } from 'lucide-react';
import { useOfflineSync } from '@/lib/pwa/offline-sync';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const { status, queueStatus } = useOfflineSync();
  
  // PATCH iOS PWA: REMOVIDO estado isOnline baseado em navigator.onLine
  // navigator.onLine não é confiável no iOS Safari PWA e causava falsos positivos

  const isSyncing = status?.type === 'syncing';
  const hasPending = queueStatus.pending > 0;

  return (
    <AnimatePresence>
      {/* PATCH iOS PWA: Apenas mostrar se há operações pendentes ou sincronizando */}
      {(hasPending || isSyncing) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-50",
            "px-4 py-2 rounded-full shadow-lg",
            "flex items-center gap-2 text-sm font-medium",
            isSyncing
              ? "bg-primary text-primary-foreground"
              : hasPending
              ? "bg-warning text-warning-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Sincronizando...</span>
            </>
          ) : hasPending ? (
            <>
              <Cloud className="w-4 h-4" />
              <span>{queueStatus.pending} alteração{queueStatus.pending > 1 ? 'ões' : ''} pendente{queueStatus.pending > 1 ? 's' : ''}</span>
            </>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SyncStatusBadge() {
  const { status, queueStatus } = useOfflineSync();
  
  // PATCH iOS PWA: REMOVIDO check de navigator.onLine

  const getStatusColor = () => {
    if (status?.type === 'syncing') return 'bg-primary animate-pulse';
    if (queueStatus.pending > 0) return 'bg-warning';
    return 'bg-success';
  };

  const getStatusIcon = () => {
    if (status?.type === 'syncing') return <RefreshCw className="w-3 h-3 animate-spin" />;
    if (queueStatus.pending > 0) return <AlertTriangle className="w-3 h-3" />;
    return null;
  };

  // Não mostrar se não há nada pendente ou sincronizando
  if (queueStatus.pending === 0 && status?.type !== 'syncing') {
    return null;
  }

  return (
    <div className={cn(
      "flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs",
      getStatusColor()
    )}>
      {getStatusIcon()}
      {queueStatus.pending > 0 && (
        <span>{queueStatus.pending}</span>
      )}
    </div>
  );
}
