import React, { Suspense, memo } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { logger } from "@/lib/logger";

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
  // Use safe lazy loading with error handling
  const Component = React.lazy(async () => {
    try {
      return await loader();
    } catch (err) {
      console.error(`❌ Erro ao carregar módulo ${componentName}:`, err);
      logger.error(`Failed to load component ${componentName}`, err);
      
      // Return a fallback component that displays an error message
      return {
        default: () => (
          <div 
            className="flex items-center justify-center min-h-[200px] bg-gray-50 dark:bg-gray-900 p-4"
            role="alert"
            aria-live="assertive"
          >
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg 
                    className="h-6 w-6 text-red-600 dark:text-red-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                    ⚠️ Falha ao carregar o módulo
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p className="font-semibold">{componentName}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      🔄 Atualizar página
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
      };
    }
  });
  
  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Carregando {componentName}...</p>
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