/**
 * PATCH OPS-V7 — Integration Status Types
 * 
 * Define status padrão para todas as integrações externas.
 * REGRA: Toda integração DEVE reportar seu status.
 * PROIBIDO: Exibir dados simulados como se fossem reais.
 */

export type IntegrationStatus = 
  | 'CONNECTED'        // Integração ativa e funcionando
  | 'DEGRADED'         // Parcialmente funcional (ex: alta latência, dados parciais)
  | 'DISCONNECTED'     // Temporariamente indisponível (tentando reconectar)
  | 'NOT_CONFIGURED'   // Credenciais/config não fornecidas
  | 'ERROR';           // Erro permanente que requer intervenção

export interface IntegrationHealthCheck {
  name: string;
  status: IntegrationStatus;
  lastCheck: Date;
  latencyMs?: number;
  errorMessage?: string;
  errorCode?: string;
  retryCount?: number;
  nextRetryAt?: Date;
}

export interface IntegrationConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  enabled: boolean;
}

/**
 * Verifica se a integração está operacional
 */
export function isIntegrationOperational(status: IntegrationStatus): boolean {
  return status === 'CONNECTED' || status === 'DEGRADED';
}

/**
 * Verifica se a integração pode exibir dados
 * NOTA: Só permite exibir dados se estiver CONNECTED ou DEGRADED
 */
export function canShowIntegrationData(status: IntegrationStatus): boolean {
  return status === 'CONNECTED' || status === 'DEGRADED';
}

/**
 * Retorna mensagem de status para UI
 */
export function getStatusMessage(status: IntegrationStatus): string {
  switch (status) {
    case 'CONNECTED':
      return 'Conectado';
    case 'DEGRADED':
      return 'Conexão degradada';
    case 'DISCONNECTED':
      return 'Desconectado - tentando reconectar...';
    case 'NOT_CONFIGURED':
      return 'Não configurado - configure as credenciais';
    case 'ERROR':
      return 'Erro de conexão - verifique as configurações';
  }
}

/**
 * Retorna cor do badge de status
 */
export function getStatusColor(status: IntegrationStatus): string {
  switch (status) {
    case 'CONNECTED':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'DEGRADED':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'DISCONNECTED':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'NOT_CONFIGURED':
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    case 'ERROR':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
  }
}

/**
 * Retorna ícone do status (nome do ícone Lucide)
 */
export function getStatusIcon(status: IntegrationStatus): string {
  switch (status) {
    case 'CONNECTED':
      return 'CheckCircle';
    case 'DEGRADED':
      return 'AlertTriangle';
    case 'DISCONNECTED':
      return 'WifiOff';
    case 'NOT_CONFIGURED':
      return 'Settings';
    case 'ERROR':
      return 'XCircle';
  }
}
