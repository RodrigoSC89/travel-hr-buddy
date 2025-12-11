/**
 * FASE 3.3 - Module Error Boundary
 * Error boundary genérico para módulos
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorTrackingService, errorRecoveryManager } from '@/lib/errors';
import { ModuleErrorFallback } from './fallbacks';

interface Props {
  children: ReactNode;
  moduleName: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

const MAX_AUTO_RETRY = 2;

export class ModuleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo): Promise<void> {
    const { moduleName, onError } = this.props;

    // Track error
    errorTrackingService.trackRuntimeError(error, {
      component: `ModuleErrorBoundary:${moduleName}`,
      action: 'componentDidCatch',
      metadata: {
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount,
      },
    });

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // Attempt auto-recovery for retryable errors
    if (this.state.retryCount < MAX_AUTO_RETRY) {
      const recovered = await errorRecoveryManager.attemptRecovery(
        error,
        `module-${moduleName}`
      );

      if (recovered) {
        // Reset after delay
        setTimeout(() => {
          this.handleReset();
        }, 1000);
      }
    }
  }

  handleReset = (): void => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback
      return (
        <ModuleErrorFallback
          error={this.state.error}
          moduleName={this.props.moduleName}
          resetError={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
