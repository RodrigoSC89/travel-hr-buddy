import { useCallback, useRef } from 'react';
import { logError } from '@/utils/errorLogger';

/**
 * Hook para executar operações assíncronas de forma segura
 * Previne memory leaks e estados inconsistentes
 */
export function useSafeAsync<T extends (...args: any[]) => Promise<any>>(
  asyncFunction: T,
  onError?: (error: Error) => void
): [T, { isLoading: boolean; error: Error | null }] {
  const isMountedRef = useRef(true);
  const loadingRef = useRef(false);
  const errorRef = useRef<Error | null>(null);

  const safeAsyncFunction = useCallback(
    async (...args: Parameters<T>) => {
      if (!isMountedRef.current) return;

      loadingRef.current = true;
      errorRef.current = null;

      try {
        const result = await asyncFunction(...args);
        if (isMountedRef.current) {
          loadingRef.current = false;
          return result;
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        if (isMountedRef.current) {
          errorRef.current = err;
          loadingRef.current = false;
          
          logError('Erro em operação assíncrona', err, 'useSafeAsync');
          
          if (onError) {
            onError(err);
          }
        }
        
        throw err;
      }
    },
    [asyncFunction, onError]
  ) as T;

  return [
    safeAsyncFunction,
    {
      isLoading: loadingRef.current,
      error: errorRef.current,
    },
  ];
}

/**
 * Hook para gerenciar o estado de montagem do componente
 * Útil para prevenir atualizações de estado em componentes desmontados
 */
export function useIsMounted() {
  const isMountedRef = useRef(false);

  useCallback(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
}
