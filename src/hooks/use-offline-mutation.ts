/**
 * PATCH 801: Offline-aware Mutation Hook
 * PATCH iOS PWA: Sempre tenta executar primeiro, enfileira apenas se falhar com erro de rede
 */
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { queueAction } from "@/lib/offline/sync-queue";

interface OfflineMutationOptions<TVariables> {
  /** Action type for the sync queue */
  actionType: string;
  /** The mutation function */
  mutationFn: (variables: TVariables) => Promise<any>;
  /** Whether to show toast notifications */
  showToasts?: boolean;
  /** Message when action is queued */
  queuedMessage?: string;
  /** Called on success */
  onSuccess?: (data: any, variables: TVariables) => void;
  /** Called on error */
  onError?: (error: any, variables: TVariables) => void;
}

export function useOfflineMutation<TVariables = unknown>(
  options: OfflineMutationOptions<TVariables>
) {
  const {
    actionType,
    mutationFn,
    showToasts = true,
    queuedMessage = "Ação salva. Será sincronizada quando você estiver online.",
    onSuccess,
    onError,
  } = options;

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      // PATCH iOS PWA: Sempre tentar executar primeiro
      // navigator.onLine não é confiável no iOS Safari PWA
      // Se a execução falhar com erro de rede, então enfileirar para retry
      try {
        return await mutationFn(variables);
      } catch (error) {
        // Verificar se parece ser erro de rede
        const errorMessage = (error as Error)?.message?.toLowerCase() || '';
        const isNetworkError = 
          errorMessage.includes('network') ||
          errorMessage.includes('fetch') ||
          errorMessage.includes('offline') ||
          errorMessage.includes('connection') ||
          errorMessage.includes('timeout') ||
          errorMessage.includes('aborted') ||
          errorMessage.includes('failed to fetch');
        
        if (isNetworkError) {
          // Enfileirar para retry posterior
          await queueAction(actionType, variables);
          
          if (showToasts) {
            toast({
              title: "Salvo Localmente",
              description: queuedMessage,
            });
          }
          
          return { queued: true };
        }
        
        // Se não é erro de rede, propagar o erro
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Don't call onSuccess for queued actions
      if (data?.queued) return;
      
      if (onSuccess) {
        onSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      // Tentar enfileirar como fallback
      const errorMessage = (error as Error)?.message?.toLowerCase() || '';
      const isNetworkError = 
        errorMessage.includes('network') ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('offline');
      
      if (isNetworkError) {
        queueAction(actionType, variables);
        
        if (showToasts) {
          toast({
            title: "Salvo para Sincronização",
            description: queuedMessage,
          });
        }
        return;
      }
      
      if (onError) {
        onError(error, variables);
      }
    },
  });
}
