/**
 * FASE 3.3 - Route Error Boundary
 * Error boundary para rotas individuais
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { errorTrackingService } from "@/lib/errors";
import { RouteErrorFallback } from "./fallbacks";

interface Props {
  children: ReactNode;
  routePath?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RouteErrorBoundary extends Component<Props, State> {
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
    });
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    errorTrackingService.trackRuntimeError(error, {
      component: "RouteErrorBoundary",
      route: this.props.routePath || window.location.pathname,
      action: "componentDidCatch",
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return <RouteErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
