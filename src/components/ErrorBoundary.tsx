
/**
 * Global Error Boundary
 * 
 * Captura erros React e exibe UI de fallback
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    });
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    });
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error
    logger.error("Error caught by boundary:", { error, errorInfo });
    
    this.setState({
      error,
      errorInfo,
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // TODO: Send to error tracking service (Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  });

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default error UI
      return (
        <div style={{
          padding: "2rem",
          margin: "2rem auto",
          maxWidth: "600px",
          border: "2px solid #ef4444",
          borderRadius: "8px",
          backgroundColor: "#fef2f2",
        }}>
          <h2 style={{ color: "#dc2626", marginBottom: "1rem" }}>
            ⚠️ Algo deu errado
          </h2>
          
          <p style={{ marginBottom: "1rem" }}>
            Desculpe, ocorreu um erro inesperado. Nossa equipe foi notificada.
          </p>
          
          {this.state.error && (
            <details style={{ marginBottom: "1rem" }}>
              <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                Detalhes do erro
              </summary>
              <pre style={{
                padding: "1rem",
                backgroundColor: "#fee2e2",
                borderRadius: "4px",
                overflow: "auto",
                fontSize: "0.875rem",
                marginTop: "0.5rem",
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          
          <button
            onClick={this.handleReset}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error Handler Utilities
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  status?: number;
  code?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log error with context
 */
export function logError(error: Error, context?: ErrorContext): void {
  logger.error("Error:", { error, context });
  
  // TODO: Send to error tracking service
  // if (window.Sentry) {
  //   window.Sentry.captureException(error, {
  //     extra: context,
  //   });
  // }
}

/**
 * Handle API errors
 */
export function handleApiError(error: SupabaseError | null, context?: ErrorContext): {
  message: string;
  code?: string;
  status?: number;
} {
  // Network error
  if (!error.response) {
    logError(new Error("Network error"), context);
    return {
      message: "Erro de conexão. Verifique sua internet.",
      code: "NETWORK_ERROR",
    });
  }
  
  // HTTP error
  const status = error.response?.status;
  const data = error.response?.data;
  
  let message = "Ocorreu um erro. Tente novamente.";
  let code = "UNKNOWN_ERROR";
  
  switch (status) {
  case 400:
    message = data?.error || "Dados inválidos. Verifique os campos.";
    code = "BAD_REQUEST";
    break;
  case 401:
    message = "Sessão expirada. Faça login novamente.";
    code = "UNAUTHORIZED";
    break;
  case 403:
    message = "Você não tem permissão para esta ação.";
    code = "FORBIDDEN";
    break;
  case 404:
    message = "Recurso não encontrado.";
    code = "NOT_FOUND";
    break;
  case 429:
    message = "Muitas requisições. Aguarde um momento.";
    code = "RATE_LIMIT";
    break;
  case 500:
  case 502:
  case 503:
    message = "Erro no servidor. Tente novamente em alguns minutos.";
    code = "SERVER_ERROR";
    break;
  default:
    if (data?.error) {
      message = data.error;
    }
  }
  
  logError(new Error(message), { ...context, status, code });
  
  return { message, code, status };
}

/**
 * Retry logic for failed operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
  backoff: boolean = true
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on final attempt
      if (attempt === maxRetries - 1) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = backoff ? delayMs * Math.pow(2, attempt) : delayMs;
      
      logger.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries}). Retrying in ${delay}ms...`);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // All retries failed
  logError(lastError || new Error("All retries failed"));
  throw lastError || new Error("All retries failed");
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  context?: ErrorContext
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    const err = error as Error;
    logError(err, context);
    return { data: null, error: err };
  }
}

/**
 * Debounced error logger (prevent spam)
 */
const errorLogCache = new Map<string, number>();
const ERROR_LOG_THRESHOLD = 60000; // 1 minute

export function logErrorOnce(error: Error, key: string, context?: ErrorContext): void {
  const now = Date.now();
  const lastLogged = errorLogCache.get(key);
  
  // Only log if not logged recently
  if (!lastLogged || now - lastLogged > ERROR_LOG_THRESHOLD) {
    logError(error, context);
    errorLogCache.set(key, now);
  }
}

/**
 * Cleanup old cache entries (call periodically)
 */
export function cleanupErrorCache(): void {
  const now = Date.now();
  for (const [key, timestamp] of errorLogCache.entries()) {
    if (now - timestamp > ERROR_LOG_THRESHOLD) {
      errorLogCache.delete(key);
    }
  }
}

// Auto-cleanup every 5 minutes
if (typeof window !== "undefined") {
  setInterval(cleanupErrorCache, 5 * 60 * 1000);
}
