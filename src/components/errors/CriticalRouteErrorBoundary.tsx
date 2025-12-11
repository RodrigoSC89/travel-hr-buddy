/**
 * FASE A2 - Critical Route Error Boundary
 * Error boundary especializado para rotas críticas com fallback e recuperação
 */

import React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ui/ErrorFallback';
import { ModuleNotFound } from './fallbacks/ModuleNotFound';
import { logger } from '@/lib/logger';

export interface CriticalRouteErrorBoundaryProps {
  children: React.ReactNode;
  routeName: string;
  routeId?: string;
  fallbackType?: 'default' | 'module' | 'custom';
  customFallback?: React.ComponentType<FallbackProps>;
}

function ErrorFallbackWrapper({ error, resetErrorBoundary, routeName, routeId }: FallbackProps & { routeName: string; routeId?: string }) {
  // Verifica se é erro de módulo não encontrado
  const isModuleNotFound = error.message.includes('Failed to fetch') || 
                          error.message.includes('Cannot find module') ||
                          error.message.includes('not found');

  if (isModuleNotFound) {
    return (
      <ModuleNotFound 
        moduleName={routeName}
        moduleId={routeId}
        error={error}
      />
    );
  }

  return (
    <ErrorFallback
      error={error}
      resetErrorBoundary={resetErrorBoundary}
      title={`Erro em ${routeName}`}
      description="Ocorreu um erro ao carregar este módulo. Tente novamente ou volte para o dashboard."
      showHomeButton={true}
      showBackButton={true}
      showReportButton={true}
    />
  );
}

export const CriticalRouteErrorBoundary: React.FC<CriticalRouteErrorBoundaryProps> = ({
  children,
  routeName,
  routeId,
  fallbackType = 'default',
  customFallback: CustomFallback,
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    logger.error(`[CriticalRoute] Error in ${routeName}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      routeName,
      routeId,
    });
  };

  const FallbackComponent = CustomFallback || ((props: FallbackProps) => (
    <ErrorFallbackWrapper {...props} routeName={routeName} routeId={routeId} />
  ));

  return (
    <ErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={handleError}
      onReset={() => {
        // Opcional: limpar estado específico da rota
        window.location.href = '/';
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
