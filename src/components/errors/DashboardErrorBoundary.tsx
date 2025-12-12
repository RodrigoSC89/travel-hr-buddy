/**
 * FASE 3.3 - Dashboard Error Boundary
 * Error boundary específico para o dashboard
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { errorTrackingService } from "@/lib/errors";
import { ModuleErrorFallback } from "./fallbacks";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    });
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    });
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    errorTrackingService.trackRuntimeError(error, {
      component: "DashboardErrorBoundary",
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
    });
  });

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        <ModuleErrorFallback
          error={this.state.error}
          moduleName="Dashboard"
          resetError={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
