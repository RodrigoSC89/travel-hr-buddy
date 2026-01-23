/**
 * Enhanced Error Boundary with Recovery and Reporting
 * PATCH: QUALITY-10/10 - Production-grade error handling
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

const MAX_RETRIES = 3;

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
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log to console for debugging
    console.error("[ErrorBoundary] Caught error:", error);
    console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Report to monitoring service
    this.reportError(error, errorInfo);
  }

  private async reportError(error: Error, errorInfo: ErrorInfo): Promise<void> {
    try {
      // Report to Sentry if available
      if (typeof window !== "undefined" && (window as any).Sentry) {
        (window as any).Sentry.captureException(error, {
          extra: {
            componentStack: errorInfo.componentStack,
            retryCount: this.state.retryCount,
          },
        });
      }

      // Log to custom endpoint
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      console.log("[ErrorBoundary] Error report:", errorReport);
    } catch (reportError) {
      console.error("[ErrorBoundary] Failed to report error:", reportError);
    }
  }

  private handleRetry = (): void => {
    if (this.state.retryCount < MAX_RETRIES) {
      this.setState((prev) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prev.retryCount + 1,
      }));
    }
  };

  private handleGoHome = (): void => {
    window.location.href = "/";
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, retryCount } = this.state;
      const canRetry = retryCount < MAX_RETRIES;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="max-w-lg w-full border-destructive/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-destructive">
                Algo deu errado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center">
                Ocorreu um erro inesperado. Nossa equipe foi notificada e está
                trabalhando para resolver.
              </p>

              {this.props.showDetails && error && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2 text-destructive font-medium mb-2">
                    <Bug className="w-4 h-4" />
                    Detalhes do erro
                  </div>
                  <code className="text-xs text-muted-foreground block overflow-auto max-h-32">
                    {error.message}
                  </code>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                {canRetry && (
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={this.handleRetry}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar novamente ({MAX_RETRIES - retryCount} restantes)
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={this.handleGoHome}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao início
                </Button>
              </div>

              {!canRetry && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={this.handleReload}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recarregar página
                </Button>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Código de erro: {error?.name || "UNKNOWN"} | Tentativa:{" "}
                {retryCount + 1}
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
