import React, { ReactNode } from "react";
import { ErrorBoundary } from "./error-boundary";
import * as Sentry from "@sentry/react";

interface ModuleErrorBoundaryProps {
  children: ReactNode;
  moduleName?: string;
}

/**
 * Maritime module error boundary wrapper
 * Provides consistent error handling for all maritime modules
 */
export const ModuleErrorBoundary: React.FC<ModuleErrorBoundaryProps> = ({ 
  children, 
  moduleName = "Módulo" 
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error to Sentry monitoring service
    Sentry.captureException(error, { 
      tags: { module: moduleName },
      contexts: { react: { componentStack: errorInfo.componentStack } }
    });
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

export default ModuleErrorBoundary;
