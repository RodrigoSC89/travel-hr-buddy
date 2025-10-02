/**
 * Enhanced Error Boundary with Recovery Mechanisms
 * Provides better error handling and user feedback
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Enhanced Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to error tracking service (if available)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    // TODO: Implement error tracking (e.g., Sentry, LogRocket)
    console.log('Logging error to service:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }

  handleRetry = (): void => {
    const { retryCount } = this.state;
    
    // Limit retries to prevent infinite loops
    if (retryCount >= 3) {
      console.error('Maximum retry attempts reached');
      return;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: retryCount + 1,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoBack = (): void => {
    window.history.back();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Determine error type and provide appropriate message
      const isNetworkError = error?.message.includes('NetworkError') || 
                            error?.message.includes('Failed to fetch');
      const isChunkError = error?.message.includes('ChunkLoadError') ||
                           error?.message.includes('Loading chunk');

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
          <Card className="w-full max-w-lg shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-2xl">Oops! Algo deu errado</CardTitle>
                <CardDescription className="mt-2">
                  {isNetworkError && 'Parece que você está offline ou com problemas de conexão.'}
                  {isChunkError && 'Houve um problema ao carregar parte da aplicação.'}
                  {!isNetworkError && !isChunkError && 'Ocorreu um erro inesperado. Nossa equipe foi notificada.'}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error message (only in development) */}
              {process.env.NODE_ENV === 'development' && error && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground mb-2">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <p className="font-semibold text-destructive">{error.message}</p>
                    {error.stack && (
                      <pre className="mt-2 text-xs overflow-auto max-h-40">
                        {error.stack}
                      </pre>
                    )}
                    {errorInfo?.componentStack && (
                      <pre className="mt-2 text-xs overflow-auto max-h-40">
                        {errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={this.handleRetry}
                  disabled={retryCount >= 3}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
                
                <Button
                  onClick={this.handleGoBack}
                  className="w-full"
                  variant="outline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={this.handleGoHome}
                  className="w-full"
                  variant="outline"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Página inicial
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recarregar página
                </Button>
              </div>

              {retryCount >= 3 && (
                <p className="text-sm text-center text-muted-foreground">
                  Se o problema persistir, tente recarregar a página ou voltar à página inicial.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}
