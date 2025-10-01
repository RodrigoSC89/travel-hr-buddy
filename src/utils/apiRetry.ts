import { logError, logWarning } from './errorLogger';

interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Executa uma função com retry automático em caso de falha
 * Implementa exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        logError(
          `Falha após ${maxRetries} tentativas`,
          lastError,
          'apiRetry'
        );
        throw lastError;
      }

      const delay = delayMs * Math.pow(backoffMultiplier, attempt);
      logWarning(
        `Tentativa ${attempt + 1}/${maxRetries} falhou. Tentando novamente em ${delay}ms`,
        'apiRetry'
      );

      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Helper para delay assíncrono
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verifica se um erro é recuperável (deve ser retentado)
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Erros de rede são recuperáveis
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('fetch') ||
      message.includes('connection')
    ) {
      return true;
    }

    // Erros HTTP 5xx são recuperáveis
    if ('status' in error) {
      const status = (error as { status: number }).status;
      return status >= 500 && status < 600;
    }

    // Erro 429 (rate limit) é recuperável
    if ('status' in error && (error as { status: number }).status === 429) {
      return true;
    }
  }

  return false;
}

/**
 * Wrapper para chamadas de API do Supabase com retry
 */
export async function supabaseWithRetry<T>(
  operation: () => Promise<{ data: T | null; error: Error | null }>,
  options: RetryOptions = {}
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const result = await withRetry(async () => {
      const { data, error } = await operation();
      
      if (error && isRetryableError(error)) {
        throw error;
      }
      
      return { data, error };
    }, options);

    return result;
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
