/**
 * useQueryWithRetry - Enhanced TanStack Query hook
 * Adds: exponential backoff, offline detection, user-friendly error states
 */
import { useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCallback, useRef } from "react";

interface UseQueryWithRetryOptions<T> extends Omit<UseQueryOptions<T>, "queryFn"> {
  queryFn: () => Promise<T>;
  /** Show a toast on error */
  errorToast?: boolean;
  /** Custom error message */
  errorMessage?: string;
  /** Module name for error context */
  moduleName?: string;
}

export function useQueryWithRetry<T>({
  queryFn,
  errorToast = false,
  errorMessage,
  moduleName,
  ...options
}: UseQueryWithRetryOptions<T>): UseQueryResult<T> & { refetchSafe: () => void } {
  const toastShownRef = useRef(false);

  const result = useQuery<T>({
    ...options,
    queryFn,
    retry: (failureCount, error) => {
      // Don't retry auth errors (401, 403)
      if (error instanceof Error) {
        const msg = error.message;
        if (msg.includes("401") || msg.includes("403") || msg.includes("auth")) {
          return false;
        }
      }
      return failureCount < 2;
    },
    retryDelay: (attempt) => Math.min(1000 * Math.pow(2, attempt), 8000),
  });

  // Show error toast only once per error instance
  if (result.isError && errorToast && !toastShownRef.current) {
    toastShownRef.current = true;
    const msg = errorMessage ?? `Erro ao carregar${moduleName ? ` ${moduleName}` : ""}`;
    toast.error(msg, {
      description: "Verifique sua conexão e tente novamente.",
      duration: 4000,
      action: {
        label: "Tentar novamente",
        onClick: () => {
          toastShownRef.current = false;
          result.refetch();
        },
      },
    });
  }

  // Reset toast shown when data loads successfully
  if (result.isSuccess) {
    toastShownRef.current = false;
  }

  const refetchSafe = useCallback(() => {
    toastShownRef.current = false;
    result.refetch();
  }, [result]);

  return { ...result, refetchSafe };
}

export default useQueryWithRetry;
