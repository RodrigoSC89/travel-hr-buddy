/**
 * Configuração de Lazy Loading Otimizado
 * Módulos pesados que causam travamento são carregados sob demanda
 */

import { lazy, ComponentType } from 'react';

// Wrapper para lazy loading com timeout e retry
export const lazyWithRetry = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback: T | null = null
) => {
  return lazy(() =>
    importFn().catch((error) => {
      console.error('Erro ao carregar módulo:', error);
      if (fallback) {
        return { default: fallback };
      }
      // Retry após 2 segundos
      return new Promise<{ default: T }>((resolve) => {
        setTimeout(() => {
          importFn().then(resolve).catch(() => {
            // Se falhar novamente, retorna um componente vazio
            resolve({ default: (() => null) as unknown as T });
          });
        }, 2000);
      });
    })
  );
};

// Módulos pesados que devem ser carregados apenas sob demanda
export const HEAVY_MODULES = {
  // AI/ML Modules (ONNX, TensorFlow)
  DPAIAnalyzer: lazyWithRetry(() => 
    import('@/modules/intelligence/dp-intelligence/components/DPAIAnalyzer')
  ),
  
  // Large Data Modules (removed - consolidated)
};

// Pré-carregar módulos críticos após a aplicação estar rodando
export const preloadCriticalModules = () => {
  // Esperar 3 segundos após o load inicial
  setTimeout(() => {
    // Pré-carregar apenas módulos mais usados
    const criticalModules = [
      import('@/modules/intelligence/smart-alerts'),
      import('@/modules/intelligence/smart-workflow'),
    ];
    
    Promise.all(criticalModules).catch(console.error);
  }, 3000);
};

// Desabilitar módulos pesados em modo de desenvolvimento/baixa performance
export const shouldLoadHeavyModule = (moduleName: string): boolean => {
  // Verificar performance do dispositivo
  const memory = (performance as any).memory;
  if (memory && memory.jsHeapSizeLimit < 2000000000) {
    // Menos de 2GB de heap: não carregar módulos pesados
    console.warn(`Módulo ${moduleName} desabilitado: memória insuficiente`);
    return false;
  }
  
  return true;
};

export default HEAVY_MODULES;
