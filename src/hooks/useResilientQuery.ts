/**
 * useResilientQuery - Query hook with exponential backoff, graceful degradation
 * and stale-while-revalidate for maritime low-bandwidth environments
 */
import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";
import { useState, useCallback, useRef, useEffect } from "react";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

interface ResilientQueryOptions<TData, TError = Error> extends Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryKey' | 'queryFn'> {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  /** Fallback data to use when all retries fail */
  fallbackData?: TData;
  /** Max retries with exponential backoff (default: 3) */
  maxRetries?: number;
  /** Show toast on failure (default: true) */
  showErrorToast?: boolean;
  /** Module name for logging */
  module?: string;
}

export function useResilientQuery<TData, TError = Error>({
  queryKey,
  queryFn,
  fallbackData,
  maxRetries = 3,
  showErrorToast = true,
  module = "unknown",
  ...options
}: ResilientQueryOptions<TData, TError>) {
  const [retryCount, setRetryCount] = useState(0);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const failureCountRef = useRef(0);

  const resilientQueryFn = useCallback(async (): Promise<TData> => {
    try {
      const result = await queryFn();
      // Reset on success
      failureCountRef.current = 0;
      setIsUsingFallback(false);
      return result;
    } catch (error) {
      failureCountRef.current += 1;
      logger.warn(`[ResilientQuery:${module}] Attempt ${failureCountRef.current} failed`, {
        key: JSON.stringify(queryKey),
        error: error instanceof Error ? error.message : String(error),
      });

      // If we have fallback data and exceeded retries, use it
      if (fallbackData !== undefined && failureCountRef.current >= maxRetries) {
        setIsUsingFallback(true);
        if (showErrorToast) {
          toast.warning("Dados offline", {
            description: `Usando dados em cache para ${module}. Reconectando...`,
            duration: 3000,
          });
        }
        return fallbackData;
      }

      throw error;
    }
  }, [queryFn, queryKey, fallbackData, maxRetries, showErrorToast, module]);

  const query = useQuery<TData, TError>({
    queryKey,
    queryFn: resilientQueryFn,
    retry: (failureCount, error) => {
      setRetryCount(failureCount);
      // Don't retry auth errors
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes("401") || msg.includes("403") || msg.includes("JWT")) return false;
      return failureCount < maxRetries;
    },
    retryDelay: (attempt) => Math.min(1000 * Math.pow(2, attempt), 30000), // 1s, 2s, 4s, 8s... max 30s
    staleTime: 1000 * 60 * 5, // 5 min - maritime bandwidth optimization
    gcTime: 1000 * 60 * 30,   // 30 min - keep cache longer
    refetchOnReconnect: "always",
    ...options,
  });

  return {
    ...query,
    retryCount,
    isUsingFallback,
    isHealthy: !query.isError && !isUsingFallback,
  };
}

export default useResilientQuery;
