/**
 * PATCH 189.0 - Web Worker Hook
 * 
 * React hook for using Web Workers easily
 * Handles worker lifecycle and message passing
 */

import { useState, useCallback, useEffect, useRef } from "react";

type WorkerStatus = "idle" | "processing" | "error";

interface UseWorkerOptions {
  timeout?: number;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

interface UseWorkerResult<T> {
  execute: (message: any) => Promise<T>;
  status: WorkerStatus;
  result: T | null;
  error: string | null;
  duration: number | null;
  terminate: () => void;
}

/**
 * Hook for using Web Workers
 * 
 * @example
 * ```tsx
 * const { execute, status, result } = useWorker<SortedData[]>();
 * 
 * const handleSort = async () => {
 *   const sorted = await execute({
 *     type: 'SORT_DATA',
 *     payload: { data: items, key: 'name', order: 'asc' }
 *   });
 *    * };
 * ```
 */
export function useWorker<T = any>(
  options: UseWorkerOptions = {}
): UseWorkerResult<T> {
  const { timeout = 30000, onSuccess, onError } = options;
  
  const [status, setStatus] = useState<WorkerStatus>("idle");
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // Initialize worker
  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL("../workers/heavy-computation.worker.ts", import.meta.url),
        { type: "module" }
      );
    }
    return workerRef.current;
  }, []);

  // Execute task in worker
  const execute = useCallback(
    (message: any): Promise<T> => {
      return new Promise((resolve, reject) => {
        const worker = getWorker();
        
        setStatus("processing");
        setError(null);
        
        // Set timeout
        timeoutRef.current = window.setTimeout(() => {
          setStatus("error");
          setError("Worker timeout");
          onError?.("Worker timeout");
          reject(new Error("Worker timeout"));
        }, timeout);
        
        // Handle response
        worker.onmessage = (event) => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          if (event.data.type === "SUCCESS") {
            setStatus("idle");
            setResult(event.data.result);
            setDuration(event.data.duration);
            onSuccess?.(event.data.result);
            resolve(event.data.result);
          } else {
            setStatus("error");
            setError(event.data.error);
            onError?.(event.data.error);
            reject(new Error(event.data.error));
          }
        };
        
        worker.onerror = (err) => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          setStatus("error");
          setError(err.message);
          onError?.(err.message);
          reject(err);
        };
        
        // Send message to worker
        worker.postMessage(message);
      });
    },
    [getWorker, timeout, onSuccess, onError]
  );

  // Terminate worker
  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setStatus("idle");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      terminate();
    };
  }, [terminate]);

  return {
    execute,
    status,
    result,
    error,
    duration,
    terminate,
  };
}

/**
 * Convenience hook for sorting data in worker
 */
export function useWorkerSort<T>() {
  const { execute, status, result } = useWorker<T[]>();
  
  const sort = useCallback(
    async (data: T[], key: string, order: "asc" | "desc" = "asc") => {
      return execute({
        type: "SORT_DATA",
        payload: { data, key, order },
      });
    },
    [execute]
  );
  
  return { sort, status, result };
}

/**
 * Convenience hook for filtering data in worker
 */
export function useWorkerFilter<T>() {
  const { execute, status, result } = useWorker<T[]>();
  
  const filter = useCallback(
    async (data: T[], filters: Record<string, any>) => {
      return execute({
        type: "FILTER_DATA",
        payload: { data, filters },
      });
    },
    [execute]
  );
  
  return { filter, status, result };
}

/**
 * Convenience hook for searching data in worker
 */
export function useWorkerSearch<T>() {
  const { execute, status, result } = useWorker<T[]>();
  
  const search = useCallback(
    async (data: T[], query: string, fields: string[]) => {
      return execute({
        type: "SEARCH_DATA",
        payload: { data, query, fields },
      });
    },
    [execute]
  );
  
  return { search, status, result };
}
