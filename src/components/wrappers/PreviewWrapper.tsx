import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";

interface PreviewWrapperProps {
  children: React.ReactNode;
  fallbackClassName?: string;
}

/**
 * PATCH 607: PreviewWrapper component
 * Wraps preview components with ErrorBoundary and Suspense for stability
 */
export function PreviewWrapper({ 
  children, 
  fallbackClassName = "h-96 w-full" 
}: PreviewWrapperProps) {
  const fallback = <Skeleton className={fallbackClassName} />;
  
  return (
    <ErrorBoundary fallback={fallback}>
      <React.Suspense fallback={fallback}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  );
}
