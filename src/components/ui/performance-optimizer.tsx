import React, { memo } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { logger } from "@/lib/logger";
import { safeLazyImport } from "@/utils/safeLazyImport";

interface LazyComponentProps {
  loader: () => Promise<{ default: React.ComponentType<unknown> }>;
  fallback?: React.ReactNode;
  children?: React.ReactNode;
  componentName?: string;
  [key: string]: any;
}

export const LazyComponent: React.FC<LazyComponentProps> = memo(({ 
  loader, 
  fallback, 
  children,
  componentName = "Component",
  ...props 
}) => {
  const Component = safeLazyImport(loader, componentName);
  
  return (
    <React.Suspense fallback={fallback || <LoadingSpinner />}>
      <Component {...props} />
    </React.Suspense>
  );
});

LazyComponent.displayName = "LazyComponent";

// Hook para monitoramento de performance
export const usePerformanceMonitor = (componentName: string) => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      if (loadTime > 1000) {
        logger.warn(`${componentName} demorou ${loadTime.toFixed(2)}ms para carregar`);
      }
    };
  }, [componentName]);
};

// Componente otimizado para cards
export const OptimizedCard = memo(({ children, className, ...props }: any) => {
  return (
    <div className={`transition-all duration-200 ${className}`} {...props}>
      {children}
    </div>
  );
});

OptimizedCard.displayName = "OptimizedCard";