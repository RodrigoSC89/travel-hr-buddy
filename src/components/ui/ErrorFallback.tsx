/**
 * Error Fallback Component
 * Professional error handling with recovery options
 */

import React from "react";
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  title?: string;
  description?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  showReportButton?: boolean;
  className?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  title = "Algo deu errado",
  description = "Ocorreu um erro inesperado. Por favor, tente novamente.",
  showHomeButton = true,
  showBackButton = true,
  showReportButton = false,
  className
}) => {
  const handleGoBack = () => {
    window.history.back();
  });

  const handleGoHome = () => {
    window.location.href = "/";
  });

  const handleReport = () => {
    // Could integrate with error reporting service
    alert("Erro reportado. Obrigado pelo feedback!");
  });

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center min-h-[400px] p-8 text-center",
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="rounded-full bg-destructive/10 p-4 mb-6">
        <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />
      </div>
      
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        {title}
      </h2>
      
      <p className="text-muted-foreground mb-6 max-w-md">
        {description}
      </p>

      {error && process.env.NODE_ENV === "development" && (
        <details className="mb-6 text-left w-full max-w-lg">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            Detalhes técnicos
          </summary>
          <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-40">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}

      <div className="flex flex-wrap gap-3 justify-center">
        {resetErrorBoundary && (
          <Button
            onClick={resetErrorBoundary}
            variant="default"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Tentar Novamente
          </Button>
        )}
        
        {showBackButton && (
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar
          </Button>
        )}
        
        {showHomeButton && (
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="gap-2"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Página Inicial
          </Button>
        )}

        {showReportButton && (
          <Button
            onClick={handleReport}
            variant="ghost"
            className="gap-2"
          >
            <Bug className="h-4 w-4" aria-hidden="true" />
            Reportar Erro
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Simple inline error message
 */
interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  onRetry,
  className
}) => (
  <div 
    className={cn(
      "flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20",
      className
    )}
    role="alert"
  >
    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" aria-hidden="true" />
    <p className="text-sm text-destructive flex-1">{message}</p>
    {onRetry && (
      <Button
        onClick={onRetry}
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    )}
  </div>
);

/**
 * Empty state component
 */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className
}) => (
  <div className={cn(
    "flex flex-col items-center justify-center py-12 px-4 text-center",
    className
  )}>
    {icon && (
      <div className="rounded-full bg-muted p-4 mb-4" aria-hidden="true">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
    {description && (
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
    )}
    {action && (
      <Button onClick={action.onClick} variant="outline">
        {action.label}
      </Button>
    )}
  </div>
);
