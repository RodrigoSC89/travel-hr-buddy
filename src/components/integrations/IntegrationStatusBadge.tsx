/**
 * PATCH OPS-V7 — Integration Status Badge
 * 
 * Componente obrigatório para exibir status de integrações externas.
 * REGRA: Toda tela que usa integração externa DEVE mostrar este badge.
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, AlertTriangle, WifiOff, Settings, XCircle, 
  RefreshCw, Loader2 
} from 'lucide-react';
import { 
  IntegrationStatus, 
  getStatusMessage, 
  getStatusColor 
} from '@/types/integration-status';
import { cn } from '@/lib/utils';

interface IntegrationStatusBadgeProps {
  name: string;
  status: IntegrationStatus;
  latencyMs?: number;
  onRetry?: () => void;
  isRetrying?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StatusIcon: React.FC<{ status: IntegrationStatus; className?: string }> = ({ 
  status, 
  className 
}) => {
  const iconClass = cn('h-4 w-4', className);
  
  switch (status) {
    case 'CONNECTED':
      return <CheckCircle className={iconClass} />;
    case 'DEGRADED':
      return <AlertTriangle className={iconClass} />;
    case 'DISCONNECTED':
      return <WifiOff className={iconClass} />;
    case 'NOT_CONFIGURED':
      return <Settings className={iconClass} />;
    case 'ERROR':
      return <XCircle className={iconClass} />;
  }
};

export function IntegrationStatusBadge({
  name,
  status,
  latencyMs,
  onRetry,
  isRetrying,
  showLabel = true,
  size = 'md',
}: IntegrationStatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-2',
    md: 'text-sm py-1 px-3',
    lg: 'text-base py-1.5 px-4',
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="outline" 
        className={cn(
          getStatusColor(status),
          sizeClasses[size],
          'flex items-center gap-1.5'
        )}
      >
        <StatusIcon status={status} className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
        {showLabel && (
          <span>{name}</span>
        )}
        {latencyMs !== undefined && status === 'CONNECTED' && (
          <span className="text-muted-foreground ml-1">
            {latencyMs}ms
          </span>
        )}
      </Badge>
      
      {(status === 'DISCONNECTED' || status === 'ERROR') && onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="p-1 rounded hover:bg-muted/50 transition-colors"
          title="Tentar reconectar"
        >
          {isRetrying ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      )}
    </div>
  );
}

/**
 * Componente de alerta para quando integração não está configurada
 */
export function IntegrationNotConfiguredAlert({
  integrationName,
  configPath,
}: {
  integrationName: string;
  configPath?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-500/30 bg-slate-500/10 p-4">
      <div className="flex items-start gap-3">
        <Settings className="h-5 w-5 text-slate-400 mt-0.5" />
        <div>
          <h4 className="font-medium text-slate-200">
            {integrationName} não configurado
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            Esta integração requer configuração de credenciais para funcionar.
            {configPath && (
              <span className="block mt-1">
                Configure em: <code className="text-xs bg-muted px-1 py-0.5 rounded">{configPath}</code>
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente de alerta para quando integração está em erro
 */
export function IntegrationErrorAlert({
  integrationName,
  errorMessage,
  onRetry,
  isRetrying,
}: {
  integrationName: string;
  errorMessage?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}) {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
      <div className="flex items-start gap-3">
        <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-red-200">
            Erro na integração {integrationName}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {errorMessage || 'Não foi possível conectar à integração externa.'}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="mt-2 text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              {isRetrying ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Reconectando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3" />
                  Tentar novamente
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default IntegrationStatusBadge;
