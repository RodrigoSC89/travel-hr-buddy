import React, { ReactNode } from 'react';
import { ErrorBoundary } from './error-boundary';

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
  moduleName = 'Módulo' 
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error to monitoring service (if available)
    console.error(`Error in ${moduleName}:`, error, errorInfo);
    
    // Could send to error tracking service here
    // Example: Sentry.captureException(error, { tags: { module: moduleName } });
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

export default ModuleErrorBoundary;
