/**
 * API Compression & Response Optimization
 * Minimizes data transfer for low-bandwidth connections
 */

// Field selection for minimal payloads
export type FieldSelector<T> = (keyof T)[];

interface CompressionOptions {
  removeNulls?: boolean;
  trimStrings?: boolean;
  compactDates?: boolean;
  maxStringLength?: number;
}

/**
 * Compress response payload by removing unnecessary data
 */
export function compressPayload<T extends Record<string, unknown>>(
  data: T | T[],
  options: CompressionOptions = {}
): T | T[] {
  const {
    removeNulls = true,
    trimStrings = true,
    compactDates = true,
    maxStringLength = 500
  } = options;

  const processValue = (value: unknown): unknown => {
    if (value === null || value === undefined) {
      return removeNulls ? undefined : value;
    }

    if (typeof value === "string") {
      let processed = trimStrings ? value.trim() : value;
      if (maxStringLength && processed.length > maxStringLength) {
        processed = processed.substring(0, maxStringLength) + "...";
      }
      // Compact ISO dates to timestamps
      if (compactDates && /^\d{4}-\d{2}-\d{2}T/.test(processed)) {
        return new Date(processed).getTime();
      }
      return processed;
    }

    if (Array.isArray(value)) {
      return value.map(processValue).filter(v => v !== undefined);
    }

    if (typeof value === "object") {
      return compressPayload(value as Record<string, unknown>, options);
    }

    return value;
  };

  if (Array.isArray(data)) {
    return data.map(item => compressPayload(item, options)) as T[];
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const processed = processValue(value);
    if (processed !== undefined) {
      result[key] = processed;
    }
  }
  return result as T;
}

/**
 * Select only needed fields from response
 */
export function selectFields<T extends Record<string, unknown>>(
  data: T | T[],
  fields: FieldSelector<T>
): Partial<T> | Partial<T>[] {
  const select = (item: T): Partial<T> => {
    const result: Partial<T> = {};
    for (const field of fields) {
      if (field in item) {
        result[field] = item[field];
      }
    }
    return result;
  };

  return Array.isArray(data) ? data.map(select) : select(data);
}

/**
 * Batch multiple API requests into one
 */
interface BatchRequest {
  id: string;
  endpoint: string;
  params?: Record<string, unknown>;
}

interface BatchResponse<T> {
  id: string;
  data?: T;
  error?: string;
}

export async function batchRequests<T>(
  requests: BatchRequest[],
  executor: (endpoint: string, params?: Record<string, unknown>) => Promise<T>
): Promise<BatchResponse<T>[]> {
  const results = await Promise.allSettled(
    requests.map(async req => {
      const data = await executor(req.endpoint, req.params);
      return { id: req.id, data });
    })
  );

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    return {
      id: requests[index].id,
      error: result.reason?.message || "Request failed"
    };
  });
}

/**
 * Delta compression - only send changed fields
 */
export function getDelta<T extends Record<string, unknown>>(
  original: T,
  updated: T
): Partial<T> {
  const delta: Partial<T> = {};
  
  for (const key of Object.keys(updated) as (keyof T)[]) {
    const origValue = JSON.stringify(original[key]);
    const newValue = JSON.stringify(updated[key]);
    
    if (origValue !== newValue) {
      delta[key] = updated[key];
    }
  }
  
  return delta;
}

/**
 * Adaptive page size based on network
 */
export function getAdaptivePageSize(
  networkQuality: "excellent" | "good" | "fair" | "poor" | "offline"
): number {
  const sizes = {
    excellent: 50,
    good: 30,
    fair: 20,
    poor: 10,
    offline: 5
  };
  return sizes[networkQuality] || 20;
}

/**
 * Request deduplication
 */
const pendingRequests = new Map<string, Promise<unknown>>();

export async function deduplicatedRequest<T>(
  key: string,
  requestFn: () => Promise<T>,
  ttl: number = 100
): Promise<T> {
  const existing = pendingRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = requestFn().finally(() => {
    setTimeout(() => pendingRequests.delete(key), ttl);
  });

  pendingRequests.set(key, promise);
  return promise;
}

/**
 * Streaming response handler for large datasets
 */
export async function* streamResponse<T>(
  fetchFn: (page: number, pageSize: number) => Promise<T[]>,
  pageSize: number = 20
): AsyncGenerator<T[], void, unknown> {
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const data = await fetchFn(page, pageSize);
    if (data.length === 0) {
      hasMore = false;
    } else {
      yield data;
      page++;
      hasMore = data.length === pageSize;
    }
  }
}

/**
 * Hook for adaptive API settings based on connection quality
 */
export function useAdaptiveApiSettings() {
  // Simple implementation without hook dependency for flexibility
  const getQuality = (): "excellent" | "good" | "fair" | "poor" | "offline" => {
    if (!navigator.onLine) return "offline";
    const connection = (navigator as Navigator & { connection?: { effectiveType?: string; rtt?: number } }).connection;
    if (!connection) return "good";
    
    const type = connection.effectiveType;
    if (type === "4g") return "excellent";
    if (type === "3g") return "fair";
    if (type === "2g" || type === "slow-2g") return "poor";
    return "good";
  };
  
  const quality = getQuality();
  
  return {
    pageSize: getAdaptivePageSize(quality),
    enablePrefetch: quality === "excellent" || quality === "good",
    enableRealtime: quality !== "poor" && quality !== "offline",
    retryCount: quality === "poor" ? 1 : 3,
    timeout: quality === "poor" ? 30000 : 10000,
    quality,
  };
}
