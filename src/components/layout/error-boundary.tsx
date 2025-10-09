import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorCount: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState(prevState => ({ 
      errorInfo,
      errorCount: prevState.errorCount + 1 
    }));
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorCount } = this.state;
      const isCritical = errorCount > 2;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Alert className={`max-w-md ${isCritical ? "border-destructive bg-destructive/10" : ""}`}>
            <AlertTriangle className={`h-4 w-4 ${isCritical ? "text-destructive" : ""}`} />
            <AlertTitle className="font-bold">
              {isCritical ? "Erro Crítico Detectado" : "Oops! Algo deu errado"}
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-3">
              <p>
                {isCritical 
                  ? "Múltiplos erros foram detectados. Por favor, retorne à página inicial."
                  : "Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando na correção."}
              </p>
              
              {error && process.env.NODE_ENV === "development" && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-xs font-mono text-foreground break-all">
                    {error.toString()}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                {!isCritical && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={this.handleRetry}
                    className="flex items-center gap-2 min-h-[44px]"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Tentar novamente
                  </Button>
                )}
                <Button 
                  variant={isCritical ? "destructive" : "default"}
                  size="sm" 
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2 min-h-[44px]"
                >
                  <Home className="h-3 w-3" />
                  Ir para Início
                </Button>
              </div>
              
              {process.env.NODE_ENV === "development" && error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <pre className="mt-2 text-xs text-destructive overflow-auto max-h-40 p-2 bg-muted rounded">
                    {error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}