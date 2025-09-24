import React, { Suspense, memo } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LazyComponentProps {
  loader: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  children?: React.ReactNode;
  [key: string]: any;
}

export const LazyComponent: React.FC<LazyComponentProps> = memo(({ 
  loader, 
  fallback, 
  children,
  ...props 
}) => {
  const Component = React.lazy(loader);
  
  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Carregando módulo...</p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <Component {...props}>
        {children}
      </Component>
    </Suspense>
  );
});

LazyComponent.displayName = 'LazyComponent';

// Hook para monitoramento de performance
export const usePerformanceMonitor = (componentName: string) => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      if (loadTime > 1000) {
        console.warn(`${componentName} demorou ${loadTime.toFixed(2)}ms para carregar`);
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

OptimizedCard.displayName = 'OptimizedCard';