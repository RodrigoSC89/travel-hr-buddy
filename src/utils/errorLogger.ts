/**
 * Sistema centralizado de logging e tratamento de erros
 * Substitui console.error com logging estruturado
 */

type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorLog {
  timestamp: Date;
  message: string;
  severity: ErrorSeverity;
  context?: string;
  error?: Error;
  metadata?: Record<string, unknown>;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private errorQueue: ErrorLog[] = [];
  private maxQueueSize = 100;

  private constructor() {
    // Singleton pattern
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log de erro com severidade e contexto
   */
  logError(
    message: string,
    error?: Error | unknown,
    severity: ErrorSeverity = 'medium',
    context?: string,
    metadata?: Record<string, unknown>
  ): void {
    const errorLog: ErrorLog = {
      timestamp: new Date(),
      message,
      severity,
      context,
      error: error instanceof Error ? error : undefined,
      metadata
    };

    // Adicionar à fila
    this.errorQueue.push(errorLog);
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Log no console apenas em desenvolvimento
    if (import.meta.env.DEV) {
      const logMethod = severity === 'critical' || severity === 'high' ? console.error : console.warn;
      logMethod(`[${severity.toUpperCase()}] ${context || 'Sistema'}:`, message, error);
    }

    // Em produção, enviar para serviço de monitoramento
    // TODO: Integrar com Sentry, LogRocket ou similar
    if (!import.meta.env.DEV && (severity === 'critical' || severity === 'high')) {
      this.sendToMonitoring(errorLog);
    }
  }

  /**
   * Enviar erro crítico para serviço de monitoramento
   */
  private sendToMonitoring(errorLog: ErrorLog): void {
    // TODO: Implementar integração com serviço de monitoramento
    // Exemplo: Sentry.captureException(errorLog.error, { extra: errorLog.metadata });
  }

  /**
   * Obter histórico de erros
   */
  getErrorHistory(): ErrorLog[] {
    return [...this.errorQueue];
  }

  /**
   * Limpar histórico de erros
   */
  clearHistory(): void {
    this.errorQueue = [];
  }

  /**
   * Obter estatísticas de erros
   */
  getErrorStats(): { total: number; bySeverity: Record<ErrorSeverity, number> } {
    const stats = {
      total: this.errorQueue.length,
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      }
    };

    this.errorQueue.forEach(log => {
      stats.bySeverity[log.severity]++;
    });

    return stats;
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();

// Helper functions para uso fácil
export const logError = (message: string, error?: Error | unknown, context?: string) => {
  errorLogger.logError(message, error, 'medium', context);
};

export const logWarning = (message: string, context?: string, metadata?: Record<string, unknown>) => {
  errorLogger.logError(message, undefined, 'low', context, metadata);
};

export const logCritical = (message: string, error?: Error | unknown, context?: string) => {
  errorLogger.logError(message, error, 'critical', context);
};
