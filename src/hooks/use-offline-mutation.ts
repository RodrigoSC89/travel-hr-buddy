/**
 * PATCH 800: Offline-aware Mutation Hook
 * Automatically queues mutations when offline
 */
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { queueAction } from "@/lib/offline/sync-queue";
import { useNetworkStatus } from "@/hooks/use-network-status";

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
  const { online } = useNetworkStatus();
  
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
      // If offline, queue the action
      if (!online) {
        await queueAction(actionType, variables);
        
        if (showToasts) {
          toast({
            title: "Modo Offline",
            description: queuedMessage,
          });
        }
        
        // Return a placeholder response
        return { queued: true };
      }
      
      // If online, execute normally
      return mutationFn(variables);
    },
    onSuccess: (data, variables) => {
      // Don't call onSuccess for queued actions
      if (data?.queued) return;
      
      if (onSuccess) {
        onSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      // If the error is due to network, queue the action
      if (!navigator.onLine) {
        queueAction(actionType, variables);
        
        if (showToasts) {
          toast({
            title: "Modo Offline",
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
