/**
 * NAUTI ONE — useSupabaseMutation Hook
 * Standardized mutation pattern with error normalization + optimistic updates
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { normalizeError } from '@/contracts/error-normalization';

interface MutationConfig<TData, TVariables> {
  /** The mutation function */
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Query keys to invalidate on success */
  invalidateKeys?: string[][];
  /** Success message */
  successMessage?: string;
  /** Error message override (otherwise auto-normalized) */
  errorMessage?: string;
  /** Additional react-query options */
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>;
}

export function useSupabaseMutation<TData = unknown, TVariables = void>({
  mutationFn,
  invalidateKeys = [],
  successMessage,
  errorMessage,
  options = {},
}: MutationConfig<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      for (const key of invalidateKeys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      
      // Show success toast
      if (successMessage) {
        toast.success(successMessage);
      }

      // Call custom onSuccess if provided
      if (options.onSuccess) {
        (options.onSuccess as (data: TData, variables: TVariables) => void)(data, variables);
      }
    },
    onError: (error) => {
      const normalized = normalizeError(error);
      toast.error(errorMessage || normalized.message);

      // Call custom onError if provided
      if (options.onError) {
        (options.onError as (error: Error) => void)(error);
      }
    },
    ...options,
  });
}
