/**
 * ✅ R02/R06 COMPLIANCE: Integration Status Badge
 * 
 * Componente visual para exibir status de integrações
 * Mostra claramente quando dados não são reais
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  type IntegrationStatus, 
  getStatusMessage, 
  getStatusColor,
  canShowData 
} from '@/lib/integration-status';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface IntegrationStatusBadgeProps {
  status: IntegrationStatus;
  integrationName?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function IntegrationStatusBadge({
  status,
  integrationName,
  showLabel = true,
  size = 'md',
  className,
}: IntegrationStatusBadgeProps) {
  const Icon = getStatusIcon(status);
  const colorClass = getStatusColorClass(status);
  const sizeClass = getSizeClass(size);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              'flex items-center gap-1.5',
              colorClass,
              sizeClass,
              className
            )}
          >
            <Icon className={cn('h-3 w-3', size === 'lg' && 'h-4 w-4')} />
            {showLabel && (
              <span className="font-medium">
                {getShortLabel(status)}
              </span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            {integrationName && (
              <p className="font-semibold">{integrationName}</p>
            )}
            <p>{getStatusMessage(status)}</p>
            {!canShowData(status) && (
              <p className="text-yellow-500 mt-1">
                ⚠️ Dados não disponíveis
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function getStatusIcon(status: IntegrationStatus) {
  switch (status) {
    case 'CONNECTED':
      return CheckCircle2;
    case 'DEGRADED':
      return AlertCircle;
    case 'DISCONNECTED':
      return XCircle;
    case 'NOT_CONFIGURED':
      return Settings;
    case 'ERROR':
      return AlertTriangle;
    default:
      return AlertCircle;
  }
}

function getStatusColorClass(status: IntegrationStatus): string {
  switch (status) {
    case 'CONNECTED':
      return 'border-green-500 text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-400';
    case 'DEGRADED':
      return 'border-yellow-500 text-yellow-700 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400';
    case 'DISCONNECTED':
      return 'border-orange-500 text-orange-700 bg-orange-50 dark:bg-orange-950 dark:text-orange-400';
    case 'NOT_CONFIGURED':
      return 'border-border text-muted-foreground bg-muted dark:bg-muted dark:text-muted-foreground';
    case 'ERROR':
      return 'border-red-500 text-red-700 bg-red-50 dark:bg-red-950 dark:text-red-400';
    default:
      return 'border-border text-muted-foreground';
  }
}

function getSizeClass(size: 'sm' | 'md' | 'lg'): string {
  switch (size) {
    case 'sm':
      return 'text-xs px-1.5 py-0.5';
    case 'md':
      return 'text-sm px-2 py-1';
    case 'lg':
      return 'text-base px-3 py-1.5';
    default:
      return 'text-sm px-2 py-1';
  }
}

function getShortLabel(status: IntegrationStatus): string {
  switch (status) {
    case 'CONNECTED':
      return 'Online';
    case 'DEGRADED':
      return 'Degradado';
    case 'DISCONNECTED':
      return 'Offline';
    case 'NOT_CONFIGURED':
      return 'Não Configurado';
    case 'ERROR':
      return 'Erro';
    default:
      return 'Desconhecido';
  }
}

/**
 * Componente de aviso quando integração não está configurada
 * ✅ R06: Mostra claramente que módulo não tem dados reais
 */
interface IntegrationNotConfiguredProps {
  integrationName: string;
  description?: string;
  onConfigure?: () => void;
}

export function IntegrationNotConfigured({
  integrationName,
  description,
  onConfigure,
}: IntegrationNotConfiguredProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-muted">
      <Settings className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {integrationName} não configurado
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
          {description}
        </p>
      )}
      {onConfigure && (
        <button
          onClick={onConfigure}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Configurar Integração
        </button>
      )}
    </div>
  );
}

/**
 * Wrapper que bloqueia conteúdo se integração não estiver configurada
 * ✅ R02: Impede exibição de dados falsos
 */
interface IntegrationGuardProps {
  status: IntegrationStatus;
  integrationName: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function IntegrationGuard({
  status,
  integrationName,
  children,
  fallback,
}: IntegrationGuardProps) {
  if (!canShowData(status)) {
    return fallback || (
      <IntegrationNotConfigured
        integrationName={integrationName}
        description="Configure esta integração para visualizar dados reais."
      />
    );
  }

  return <>{children}</>;
}
