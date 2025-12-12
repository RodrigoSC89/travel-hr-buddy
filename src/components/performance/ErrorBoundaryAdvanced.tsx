/**
import { useState, useCallback } from "react";;
 * Advanced Error Boundary - PATCH 832
 * Error recovery, retry logic, and graceful degradation
 */

import React, { Component, ReactNode, ErrorInfo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, Bug, WifiOff } from "lucide-react";
import { logger } from "@/lib/monitoring/structured-logging";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: unknown[];
  level?: "page" | "section" | "component";
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
}

const MAX_RETRIES = 3;

export class ErrorBoundaryAdvanced extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log the error
    logger.error("React Error Boundary caught error", error, {
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state when resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );

      if (hasResetKeyChanged) {
        this.reset();
      }
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
    });
    this.props.onReset?.();
  };

  retry = async () => {
    if (this.state.retryCount >= MAX_RETRIES) {
      return;
    }

    this.setState({ isRetrying: true });

    // Small delay before retry
    await new Promise((resolve) => setTimeout(resolve, 500));

    this.setState((state) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: state.retryCount + 1,
      isRetrying: false,
    }));
  };

  goHome = () => {
    window.location.href = "/";
  };

  render() {
    const { hasError, error, errorInfo, retryCount, isRetrying } = this.state;
    const { children, fallback, level = "section", showDetails = false } = this.props;

    if (!hasError) {
      return children;
    }

    // Custom fallback
    if (fallback) {
      return fallback;
    }

    // Check if offline error
    const isOfflineError = !navigator.onLine || error?.message?.includes("network");

    // Compact error for component level
    if (level === "component") {
      return (
        <div className="flex items-center gap-2 p-2 text-sm text-destructive bg-destructive/10 rounded">
          <AlertTriangle className="h-4 w-4" />
          <span>Erro ao carregar</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={this.retry}
            disabled={isRetrying || retryCount >= MAX_RETRIES}
          >
            <RefreshCw className={`h-3 w-3 ${isRetrying ? "animate-spin" : ""}`} />
          </Button>
        </div>
      );
    }

    // Section level error
    if (level === "section") {
      return (
        <Card className="border-destructive/50">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            {isOfflineError ? (
              <WifiOff className="h-10 w-10 text-muted-foreground mb-4" />
            ) : (
              <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
            )}
            <h3 className="font-semibold mb-2">
              {isOfflineError ? "Sem conexão" : "Algo deu errado"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isOfflineError
                ? "Verifique sua conexão e tente novamente."
                : "Ocorreu um erro ao carregar esta seção."}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={this.retry}
                disabled={isRetrying || retryCount >= MAX_RETRIES}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
                Tentar novamente
                {retryCount > 0 && ` (${retryCount}/${MAX_RETRIES})`}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Page level error
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {isOfflineError ? (
              <WifiOff className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            ) : (
              <Bug className="h-16 w-16 text-destructive mx-auto mb-4" />
            )}
            <CardTitle>
              {isOfflineError ? "Você está offline" : "Oops! Algo deu errado"}
            </CardTitle>
            <CardDescription>
              {isOfflineError
                ? "Não foi possível conectar ao servidor. Verifique sua conexão com a internet."
                : "Encontramos um problema inesperado. Nossa equipe foi notificada."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {showDetails && error && (
              <div className="p-3 bg-muted rounded-lg text-xs font-mono overflow-auto max-h-32">
                <p className="font-semibold text-destructive">{error.message}</p>
                {errorInfo?.componentStack && (
                  <pre className="mt-2 text-muted-foreground whitespace-pre-wrap">
                    {errorInfo.componentStack.slice(0, 500)}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                onClick={this.retry}
                disabled={isRetrying || retryCount >= MAX_RETRIES}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
                {isRetrying ? "Tentando..." : "Tentar novamente"}
                {retryCount > 0 && !isRetrying && ` (${retryCount}/${MAX_RETRIES})`}
              </Button>

              <Button variant="outline" onClick={this.goHome} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Voltar ao início
              </Button>

              <Button
                variant="ghost"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Recarregar página
              </Button>
            </div>

            {retryCount >= MAX_RETRIES && (
              <p className="text-sm text-center text-muted-foreground">
                Número máximo de tentativas atingido. Por favor, tente recarregar a página.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ErrorBoundaryProps, "children">
) {
  const displayName = Component.displayName || Component.name || "Component";

  const WrappedComponent = (props: P) => (
    <ErrorBoundaryAdvanced {...options}>
      <Component {...props} />
    </ErrorBoundaryAdvanced>
  );

  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;

  return WrappedComponent;
}

// Hook for triggering error boundary
export const useErrorBoundary = memo(function() {
  const [error, setError] = React.useState<Error | null>(null);

  if (error) {
    throw error;
  }

  return {
    triggerError: setError,
    resetError: () => setError(null),
  };
}
