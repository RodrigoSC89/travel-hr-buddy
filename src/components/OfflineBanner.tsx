/**
 * PATCH 140.1 - Offline Banner Component
 * PATCH iOS PWA: NÃO mostrar banner de "offline" - apenas status de sincronização
 * 
 * navigator.onLine não é confiável no iOS Safari PWA e causa falsos positivos
 */

import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Cloud, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { syncEngine } from "@/lib/syncEngine";
import { toast } from "sonner";
import { useState } from "react";
import { logger } from "@/lib/logger";

export const OfflineBanner = () => {
  const { pendingChanges } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);

  // PATCH iOS PWA: Apenas mostrar se há alterações pendentes para sincronizar
  // NÃO mostrar banner de "offline" baseado em isOnline/navigator.onLine
  if (pendingChanges === 0) {
    return null;
  }

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncEngine.pushLocalChanges();
      toast.success("Sincronização concluída!");
    } catch (error) {
      logger.error("Manual sync failed:", error);
      toast.error("Falha na sincronização. Tente novamente.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3 text-sm font-medium transition-all duration-300 bg-warning text-warning-foreground"
      role="alert"
      aria-live="polite"
    >
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Cloud className="h-5 w-5 flex-shrink-0" />
          <span>{pendingChanges} alteração{pendingChanges > 1 ? 'ões' : ''} pendente{pendingChanges > 1 ? 's' : ''}</span>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={handleManualSync}
          disabled={isSyncing}
          className="gap-2"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <Cloud className="h-4 w-4" />
              Sincronizar agora
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
