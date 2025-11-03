import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { logger } from "@/lib/logger";

interface PreviewWrapperProps {
  children: React.ReactNode;
  fallbackClassName?: string;
  onError?: (error: Error, info: { componentStack: string }) => void;
}

/**
 * PATCH 607: PreviewWrapper component
 * Wraps preview components with ErrorBoundary and Suspense for stability
 */
export function PreviewWrapper({ 
  children, 
  fallbackClassName = "h-96 w-full",
  onError
}: PreviewWrapperProps) {
  const fallback = <Skeleton className={fallbackClassName} />;
  
  const handleError = (error: Error, info: { componentStack: string }) => {
    // Log error for monitoring
    logger.error("[PreviewWrapper] Component error caught", {
      error: error.message,
      stack: error.stack,
      componentStack: info.componentStack
    });
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, info);
    }
  };
  
  return (
    <ErrorBoundary 
      fallback={fallback}
      onError={handleError}
      onReset={() => {
        // Reset any state if needed
        logger.info("[PreviewWrapper] Error boundary reset");
      }}
    >
      <React.Suspense fallback={fallback}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  );
}
