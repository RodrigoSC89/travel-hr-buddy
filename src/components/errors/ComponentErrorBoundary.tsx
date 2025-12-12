/**
 * FASE 3.3 - Component Error Boundary
 * Error boundary leve para componentes individuais
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { errorTrackingService } from "@/lib/errors";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  componentName?: string;
  fallback?: ReactNode;
  silent?: boolean; // Se true, não exibe UI de erro
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    errorTrackingService.track(error, "warning", "runtime", {
      component: this.props.componentName || "ComponentErrorBoundary",
      action: "componentDidCatch",
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    };
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Silent mode - render nothing
      if (this.props.silent) {
        return null;
      }

      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default inline error UI
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro no Componente</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p className="text-sm">
              {this.props.componentName || "Este componente"} encontrou um erro e não pode ser exibido.
            </p>
            {this.state.error && (
              <p className="text-xs font-mono bg-black/5 dark:bg-white/5 p-2 rounded">
                {this.state.error.message}
              </p>
            )}
            <Button
              onClick={this.handleReset}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Tentar Novamente
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
