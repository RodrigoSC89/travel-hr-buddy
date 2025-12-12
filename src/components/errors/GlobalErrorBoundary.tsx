/**
 * FASE 3.3 - Global Error Boundary
 * Error boundary principal que envolve toda a aplicação
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { errorTrackingService } from "@/lib/errors";
import { ErrorFallback } from "./fallbacks";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Track error
    errorTrackingService.trackRuntimeError(error, {
      component: "GlobalErrorBoundary",
      action: "componentDidCatch",
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });

    // Update state
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    };
  };

  handleReport = (): void => {
    if (this.state.error) {
      // Additional reporting logic
      const errorReport = {
        message: this.state.error.message,
        stack: this.state.error.stack,
        componentStack: this.state.errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Copy to clipboard
      navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
      
      alert("Detalhes do erro copiados para a área de transferência. Por favor, envie para o suporte.");
    }
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={this.handleReset}
          showDetails={process.env.NODE_ENV === "development"}
          onReport={this.handleReport}
        />
      );
    }

    return this.props.children;
  }
}
