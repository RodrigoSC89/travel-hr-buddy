/**
 * PATCH 547 - Module Error Boundary
 * Provides error boundaries for critical system modules with fallback UI
 * Prevents cascade failures and provides recovery options
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  moduleName: string;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Error Boundary specifically designed for module-level error handling
 * Features:
 * - Automatic error logging
 * - Custom fallback UI
 * - Error recovery options
 * - Error count tracking to prevent infinite error loops
 */
export class ModuleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { moduleName, onError } = this.props;
    const { errorCount } = this.state;

    // Update error count
    this.setState({ errorCount: errorCount + 1, errorInfo });

    // Log error
    logger.error(`[ModuleErrorBoundary] Error in ${moduleName}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorCount: errorCount + 1,
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Report to monitoring service if configured
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          module: {
            name: moduleName,
            errorCount: errorCount + 1,
          },
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { children, moduleName, fallbackComponent, showDetails = false } = this.props;

    if (hasError && error) {
      // If custom fallback is provided, use it
      if (fallbackComponent) {
        return fallbackComponent;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-destructive/5">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-destructive">
                    Erro no Módulo: {moduleName}
                  </CardTitle>
                  <CardDescription>
                    Ocorreu um erro inesperado que impediu o módulo de funcionar corretamente.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error message */}
              <Alert variant="destructive">
                <AlertDescription className="font-mono text-sm">
                  {error.message}
                </AlertDescription>
              </Alert>

              {/* Error details (only in development or if explicitly enabled) */}
              {showDetails && errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Detalhes técnicos
                  </summary>
                  <div className="mt-2 p-4 bg-muted rounded-md">
                    <p className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </p>
                  </div>
                </details>
              )}

              {/* Error count warning */}
              {errorCount > 1 && (
                <Alert>
                  <AlertDescription>
                    Este módulo apresentou {errorCount} erros consecutivos. 
                    Considere recarregar a página ou voltar à página inicial.
                  </AlertDescription>
                </Alert>
              )}

              {/* Action buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={this.handleReset}
                  className="flex-1"
                  disabled={errorCount > 3}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Página Inicial
                </Button>
              </div>

              {/* Help text */}
              <p className="text-xs text-muted-foreground text-center pt-2">
                Se o problema persistir, entre em contato com o suporte técnico.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

/**
 * Hook-based alternative for functional components
 */
export function useModuleErrorHandler(moduleName: string) {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    logger.error(`[Module: ${moduleName}] Error:`, error);
    setError(error);
  }, [moduleName]);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, resetError };
}
