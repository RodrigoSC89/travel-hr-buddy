import { memo } from 'react';
/**
 * Offline Status Banner
 * PATCH 624 - Visual indicator for cached/offline data
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OfflineStatusBannerProps {
  isFromCache: boolean;
  lastSync: Date | null;
  onRetry?: () => void;
  retryCount?: number;
  maxRetries?: number;
}

export const OfflineStatusBanner = memo(function({ 
  isFromCache, 
  lastSync, 
  onRetry,
  retryCount = 0,
  maxRetries = 5
}: OfflineStatusBannerProps) {
  if (!isFromCache) {
    return null;
  }

  const isRetrying = retryCount > 0 && retryCount < maxRetries;

  return (
    <Alert variant="destructive" className="mb-4">
      <WifiOff className="h-4 w-4" />
      <AlertTitle>Modo Offline</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p>Exibindo dados em cache. A conexão com o servidor está indisponível.</p>
          {lastSync && (
            <p className="text-xs mt-1">
              Última sincronização: {lastSync.toLocaleString("pt-BR")}
            </p>
          )}
          {isRetrying && (
            <p className="text-xs mt-1">
              Tentando reconectar... (tentativa {retryCount}/{maxRetries})
            </p>
          )}
        </div>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="ml-4"
            disabled={isRetrying}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? "Reconectando..." : "Tentar Agora"}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
