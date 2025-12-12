/**
 * Network-aware loading hook for bandwidth-limited scenarios
 * Adapts loading behavior based on connection quality
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { isSlowConnection, getConnectionInfo } from "@/lib/llm-optimizer";

interface NetworkState {
  isSlowConnection: boolean;
  effectiveType: string;
  downlink: number;
  isOnline: boolean;
  saveData: boolean;
}

export const useNetworkState = (): NetworkState => {
  const [state, setState] = useState<NetworkState>(() => {
    const conn = getConnectionInfo();
    return {
      isSlowConnection: isSlowConnection(),
      effectiveType: conn.effectiveType,
      downlink: conn.downlink,
      isOnline: navigator.onLine,
      saveData: conn.saveData
    };
  });

  useEffect(() => {
    const updateState = () => {
      const conn = getConnectionInfo();
      setState({
        isSlowConnection: isSlowConnection(),
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        isOnline: navigator.onLine,
        saveData: conn.saveData
      });
    });

    window.addEventListener("online", updateState);
    window.addEventListener("offline", updateState);
    
    const nav = navigator as Navigator & { connection?: { addEventListener: (type: string, cb: () => void) => void } };
    nav.connection?.addEventListener("change", updateState);

    return () => {
      window.removeEventListener("online", updateState);
      window.removeEventListener("offline", updateState);
    };
  }, []);

  return state;
};

interface AdaptiveLoadingOptions {
  slowConnectionDelay?: number;
  prefetchOnFastConnection?: boolean;
  reducedQualityOnSlow?: boolean;
}

export const useAdaptiveLoading = <T>(
  loadFn: () => Promise<T>,
  options: AdaptiveLoadingOptions = {}
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  reload: () => void;
} => {
  const {
    slowConnectionDelay = 500,
    prefetchOnFastConnection = true,
    reducedQualityOnSlow = true
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const network = useNetworkState();
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Add delay on slow connections to prevent UI jank
      if (network.isSlowConnection && slowConnectionDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, slowConnectionDelay));
      }

      if (!mountedRef.current) return;

      const result = await loadFn();
      
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as Error);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [loadFn, network.isSlowConnection, slowConnectionDelay]);

  useEffect(() => {
    mountedRef.current = true;
    load();

    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  return { data, loading, error, reload: load };
};

// Debounced fetch for slow connections
export const useDebouncedFetch = <T>(
  fetchFn: () => Promise<T>,
  dependencies: unknown[],
  debounceMs: number = 300
): { data: T | null; loading: boolean; error: Error | null } => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const network = useNetworkState();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Increase debounce on slow connections
    const delay = network.isSlowConnection ? debounceMs * 2 : debounceMs;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setLoading(true);

    timeoutRef.current = setTimeout(async () => {
      try {
        const result = await fetchFn();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, network.isSlowConnection]);

  return { data, loading, error };
};

// Prefetch manager for critical routes
const prefetchedRoutes = new Set<string>();

export const usePrefetch = (routes: string[]): void => {
  const network = useNetworkState();

  useEffect(() => {
    // Skip prefetch on slow connections or when save-data is enabled
    if (network.isSlowConnection || network.saveData) {
      return;
    }

    routes.forEach(route => {
      if (!prefetchedRoutes.has(route)) {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = route;
        document.head.appendChild(link);
        prefetchedRoutes.add(route);
      }
    });
  }, [routes, network.isSlowConnection, network.saveData]);
};

// Image quality adapter
export const useAdaptiveImageQuality = (): {
  quality: "low" | "medium" | "high";
  format: "webp" | "avif" | "auto";
} => {
  const network = useNetworkState();

  if (!network.isOnline) {
    return { quality: "low", format: "webp" };
  }

  if (network.isSlowConnection) {
    return { quality: "low", format: "webp" };
  }

  if (network.downlink < 5) {
    return { quality: "medium", format: "webp" };
  }

  return { quality: "high", format: "avif" };
};
