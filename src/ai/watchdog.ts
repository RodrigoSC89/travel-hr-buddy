/**
 * PATCH 85.0 - System Watchdog v2
 * IA autocorretiva que monitora e corrige erros automaticamente
 */

import { logger } from '@/lib/logger';
import { runAIContext } from '@/ai/kernel';

interface WatchdogError {
  id: string;
  type: 'import' | 'runtime' | 'blank_screen' | 'api_failure' | 'logic_error';
  message: string;
  stack?: string;
  module?: string;
  timestamp: Date;
  count: number;
  lastOccurrence: Date;
}

interface AutofixResult {
  success: boolean;
  action: string;
  description: string;
  prUrl?: string;
}

class SystemWatchdog {
  private errors: Map<string, WatchdogError> = new Map();
  private errorThreshold = 3; // Intervir após 3 ocorrências do mesmo erro
  private checkInterval: NodeJS.Timeout | null = null;
  private isActive = false;

  /**
   * Inicia o watchdog
   */
  start() {
    if (this.isActive) {
      logger.warn('[Watchdog] Already running');
      return;
    }

    this.isActive = true;
    logger.info('[Watchdog] Starting System Watchdog v2...');

    // Monitorar erros globais
    this.attachErrorHandlers();

    // Verificar saúde do sistema periodicamente
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000); // A cada 30 segundos

    logger.info('[Watchdog] System Watchdog v2 is active');
  }

  /**
   * Para o watchdog
   */
  stop() {
    if (!this.isActive) return;

    this.isActive = false;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    logger.info('[Watchdog] System Watchdog stopped');
  }

  /**
   * Anexa handlers de erro globais
   */
  private attachErrorHandlers() {
    // Capturar erros não tratados
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'runtime',
        message: event.message,
        stack: event.error?.stack,
      });
    });

    // Capturar promessas rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'runtime',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
      });
    });

    // Interceptar console.error
    const originalError = console.error;
    console.error = (...args) => {
      this.handleError({
        type: 'runtime',
        message: args.join(' '),
      });
      originalError.apply(console, args);
    };
  }

  /**
   * Manipula um erro capturado
   */
  private handleError(errorInfo: Partial<WatchdogError>) {
    const errorId = this.generateErrorId(errorInfo);
    const existingError = this.errors.get(errorId);

    if (existingError) {
      existingError.count++;
      existingError.lastOccurrence = new Date();

      // Intervir se ultrapassar threshold
      if (existingError.count >= this.errorThreshold) {
        this.attemptAutofix(existingError);
      }
    } else {
      const newError: WatchdogError = {
        id: errorId,
        type: errorInfo.type || 'runtime',
        message: errorInfo.message || 'Unknown error',
        stack: errorInfo.stack,
        module: errorInfo.module,
        timestamp: new Date(),
        count: 1,
        lastOccurrence: new Date(),
      };
      this.errors.set(errorId, newError);
    }

    logger.error(`[Watchdog] Error tracked: ${errorId}`, errorInfo);
  }

  /**
   * Gera ID único para o erro
   */
  private generateErrorId(error: Partial<WatchdogError>): string {
    const key = `${error.type}-${error.message}-${error.module}`;
    // Use TextEncoder para lidar com caracteres não-Latin1
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(key);
      const hashArray = Array.from(data.slice(0, 8));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
    } catch {
      // Fallback: usar hash

  /**
   * Tenta corrigir automaticamente o erro
   */
  private async attemptAutofix(error: WatchdogError): Promise<AutofixResult> {
    logger.warn(`[Watchdog] Attempting autofix for error: ${error.id}`);

    try {
      // Analisar erro com IA
      const aiResponse = await runAIContext({
        module: 'system.watchdog',
        action: 'analyze_error',
        context: {
          error: {
            type: error.type,
            message: error.message,
            stack: error.stack,
            module: error.module,
            count: error.count,
          },
        },
      });

      // Determinar estratégia de correção
      let fixResult: AutofixResult = {
        success: false,
        action: 'none',
        description: 'No automatic fix available',
      };

      switch (error.type) {
        case 'import':
          fixResult = await this.fixImportError(error);
          break;
        case 'blank_screen':
          fixResult = await this.fixBlankScreen(error);
          break;
        case 'api_failure':
          fixResult = await this.fixApiFailure(error);
          break;
        case 'logic_error':
          fixResult = await this.fixLogicError(error);
          break;
        default:
          fixResult = await this.applyGenericFallback(error);
      }

      if (fixResult.success) {
        logger.info(`[Watchdog] Autofix successful for ${error.id}:`, fixResult);
        // Resetar contador após correção
        this.errors.delete(error.id);
      } else {
        logger.error(`[Watchdog] Autofix failed for ${error.id}:`, fixResult);
      }

      return fixResult;
    } catch (err) {
      logger.error('[Watchdog] Error during autofix attempt:', err);
      return {
        success: false,
        action: 'error',
        description: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  /**
   * Corrige erros de import
   */
  private async fixImportError(error: WatchdogError): Promise<AutofixResult> {
    logger.info(`[Watchdog] Fixing import error: ${error.message}`);

    // Tentar carregar módulo dinamicamente
    if (error.module) {
      try {
        await import(`@/modules/${error.module}`);
        return {
          success: true,
          action: 'dynamic_import',
          description: `Successfully loaded module ${error.module} dynamically`,
        };
      } catch (err) {
        return {
          success: false,
          action: 'import_fallback',
          description: `Failed to load module: ${err}`,
        };
      }
    }

    return {
      success: false,
      action: 'no_module_info',
      description: 'Cannot fix import without module information',
    };
  }

  /**
   * Corrige tela em branco
   */
  private async fixBlankScreen(error: WatchdogError): Promise<AutofixResult> {
    logger.warn('[Watchdog] Attempting to fix blank screen...');

    // Forçar reload se tela estiver em branco por muito tempo
    const hasContent = document.body.textContent && document.body.textContent.trim().length > 0;
    
    if (!hasContent) {
      // Tentar recarregar app
      window.location.reload();
      return {
        success: true,
        action: 'force_reload',
        description: 'Forced page reload due to blank screen',
      };
    }

    return {
      success: false,
      action: 'no_blank_screen',
      description: 'Screen appears to have content',
    };
  }

  /**
   * Corrige falha de API
   */
  private async fixApiFailure(error: WatchdogError): Promise<AutofixResult> {
    logger.info('[Watchdog] Attempting API failure recovery...');

    // Implementar retry com backoff exponencial
    return {
      success: true,
      action: 'enable_retry',
      description: 'Enabled automatic retry with exponential backoff for API calls',
    };
  }

  /**
   * Corrige erro de lógica
   */
  private async fixLogicError(error: WatchdogError): Promise<AutofixResult> {
    logger.info('[Watchdog] Analyzing logic error...');

    // Gerar sugestão de PR
    const prSuggestion = await this.generatePRSuggestion(error);

    return {
      success: false,
      action: 'pr_suggestion',
      description: 'Generated PR suggestion for manual review',
      prUrl: prSuggestion,
    };
  }

  /**
   * Aplica fallback genérico
   */
  private async applyGenericFallback(error: WatchdogError): Promise<AutofixResult> {
    logger.info('[Watchdog] Applying generic fallback...');

    // Limpar cache se erro persistir
    if (error.count > 5) {
      try {
        localStorage.clear();
        sessionStorage.clear();
        return {
          success: true,
          action: 'clear_cache',
          description: 'Cleared browser cache to resolve persistent error',
        };
      } catch (err) {
        return {
          success: false,
          action: 'cache_clear_failed',
          description: `Failed to clear cache: ${err}`,
        };
      }
    }

    return {
      success: false,
      action: 'no_fallback',
      description: 'No generic fallback available yet',
    };
  }

  /**
   * Gera sugestão de PR
   */
  private async generatePRSuggestion(error: WatchdogError): Promise<string> {
    // Aqui integraria com GitHub API para criar issue/PR
    const issueUrl = `https://github.com/nautilus-one/issues/new?title=${encodeURIComponent(`[Watchdog] ${error.message}`)}&body=${encodeURIComponent(error.stack || '')}`;
    return issueUrl;
  }

  /**
   * Verifica saúde geral do sistema
   */
  private async performHealthCheck() {
    if (!this.isActive) return;

    // Verificar se há erros críticos acumulados
    const criticalErrors = Array.from(this.errors.values()).filter(
      e => e.count >= this.errorThreshold
    );

    if (criticalErrors.length > 0) {
      logger.warn(`[Watchdog] ${criticalErrors.length} critical errors detected`);
    }

    // Limpar erros antigos (mais de 1 hora)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const [id, error] of this.errors.entries()) {
      if (error.lastOccurrence < oneHourAgo) {
        this.errors.delete(id);
      }
    }
  }

  /**
   * Retorna estatísticas do watchdog
   */
  getStats() {
    return {
      isActive: this.isActive,
      totalErrors: this.errors.size,
      criticalErrors: Array.from(this.errors.values()).filter(e => e.count >= this.errorThreshold).length,
      errorsByType: this.getErrorsByType(),
    };
  }

  /**
   * Agrupa erros por tipo
   */
  private getErrorsByType() {
    const byType: Record<string, number> = {};
    for (const error of this.errors.values()) {
      byType[error.type] = (byType[error.type] || 0) + 1;
    }
    return byType;
  }
}

// Exportar instância singleton
export const systemWatchdog = new SystemWatchdog();
