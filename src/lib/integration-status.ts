/**
 * ✅ R02 COMPLIANCE: Integration Status System
 * 
 * Tipo e utilitários para gerenciar status de integrações externas
 * Impede exibição de dados falsos quando integração não está configurada
 */

import { logger } from '@/lib/logger';

export type IntegrationStatus = 
  | 'CONNECTED'       // Integração ativa e funcionando
  | 'DEGRADED'        // Integração funcionando com problemas
  | 'DISCONNECTED'    // Integração configurada mas offline
  | 'NOT_CONFIGURED'  // Integração nunca foi configurada
  | 'ERROR';          // Erro na integração

export interface IntegrationState {
  status: IntegrationStatus;
  lastCheck: Date;
  lastSuccessfulSync?: Date;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface IntegrationConfig {
  name: string;
  requiredSecrets: string[];
  healthCheckFn?: () => Promise<boolean>;
}

/**
 * Verifica se uma integração pode exibir dados
 * ✅ R02: Bloqueia exibição se status não for CONNECTED ou DEGRADED
 */
export function canShowData(status: IntegrationStatus): boolean {
  return status === 'CONNECTED' || status === 'DEGRADED';
}

/**
 * Retorna mensagem de status para UI
 */
export function getStatusMessage(status: IntegrationStatus): string {
  const messages: Record<IntegrationStatus, string> = {
    CONNECTED: 'Conectado e funcionando',
    DEGRADED: 'Conectado com limitações',
    DISCONNECTED: 'Desconectado temporariamente',
    NOT_CONFIGURED: 'Integração não configurada',
    ERROR: 'Erro na integração',
  };
  return messages[status];
}

/**
 * Retorna cor do badge de status
 */
export function getStatusColor(status: IntegrationStatus): string {
  const colors: Record<IntegrationStatus, string> = {
    CONNECTED: 'bg-green-500',
    DEGRADED: 'bg-yellow-500',
    DISCONNECTED: 'bg-orange-500',
    NOT_CONFIGURED: 'bg-gray-500',
    ERROR: 'bg-red-500',
  };
  return colors[status];
}

/**
 * Cria um estado de integração inicial
 */
export function createInitialState(status: IntegrationStatus = 'NOT_CONFIGURED'): IntegrationState {
  return {
    status,
    lastCheck: new Date(),
  };
}

/**
 * Verifica configuração de integração
 */
export async function checkIntegrationConfig(
  integrationName: string,
  requiredEnvVars: string[] = []
): Promise<IntegrationStatus> {
  try {
    // Verificar se variáveis de ambiente estão definidas
    for (const envVar of requiredEnvVars) {
      const value = import.meta.env[envVar];
      if (!value || value === 'undefined' || value === '') {
        logger.warn(`Integration ${integrationName} missing env var: ${envVar}`);
        return 'NOT_CONFIGURED';
      }
    }

    return 'CONNECTED';
  } catch (error) {
    logger.error(`Error checking integration ${integrationName}:`, error);
    return 'ERROR';
  }
}

/**
 * Registry de integrações para monitoramento centralizado
 */
class IntegrationRegistry {
  private integrations: Map<string, IntegrationState> = new Map();
  private listeners: Set<(name: string, state: IntegrationState) => void> = new Set();

  register(name: string, state: IntegrationState): void {
    this.integrations.set(name, state);
    this.notifyListeners(name, state);
  }

  get(name: string): IntegrationState | undefined {
    return this.integrations.get(name);
  }

  getAll(): Map<string, IntegrationState> {
    return new Map(this.integrations);
  }

  updateStatus(name: string, status: IntegrationStatus, errorMessage?: string): void {
    const current = this.integrations.get(name) || createInitialState();
    const updated: IntegrationState = {
      ...current,
      status,
      lastCheck: new Date(),
      errorMessage,
      lastSuccessfulSync: status === 'CONNECTED' ? new Date() : current.lastSuccessfulSync,
    };
    this.integrations.set(name, updated);
    this.notifyListeners(name, updated);
  }

  addListener(listener: (name: string, state: IntegrationState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(name: string, state: IntegrationState): void {
    this.listeners.forEach(listener => listener(name, state));
  }

  /**
   * Retorna estatísticas de todas as integrações
   */
  getStats(): {
    total: number;
    connected: number;
    degraded: number;
    disconnected: number;
    notConfigured: number;
    error: number;
  } {
    const stats = {
      total: this.integrations.size,
      connected: 0,
      degraded: 0,
      disconnected: 0,
      notConfigured: 0,
      error: 0,
    };

    this.integrations.forEach(state => {
      switch (state.status) {
        case 'CONNECTED': stats.connected++; break;
        case 'DEGRADED': stats.degraded++; break;
        case 'DISCONNECTED': stats.disconnected++; break;
        case 'NOT_CONFIGURED': stats.notConfigured++; break;
        case 'ERROR': stats.error++; break;
      }
    });

    return stats;
  }
}

export const integrationRegistry = new IntegrationRegistry();

/**
 * Hook helper para usar em componentes React
 */
export function useIntegrationStatus(integrationName: string) {
  const state = integrationRegistry.get(integrationName);
  
  return {
    status: state?.status || 'NOT_CONFIGURED',
    canShowData: state ? canShowData(state.status) : false,
    message: getStatusMessage(state?.status || 'NOT_CONFIGURED'),
    color: getStatusColor(state?.status || 'NOT_CONFIGURED'),
    lastCheck: state?.lastCheck,
    errorMessage: state?.errorMessage,
  };
}
