/**
 * Unified API Client
 * PATCH 833: Complete API integration layer with caching, retries, and offline support
 */

import { supabase } from "@/integrations/supabase/client";

interface RequestConfig {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
  cache?: boolean;
  cacheTTL?: number;
  retry?: number;
  retryDelay?: number;
  timeout?: number;
  priority?: "high" | "normal" | "low";
  offline?: boolean;
}

interface APIResponse<T = any> {
  data: T | null;
  error: Error | null;
  status: number;
  cached: boolean;
  timestamp: number;
}

interface PendingRequest {
  id: string;
  url: string;
  config: RequestConfig;
  timestamp: number;
}

class UnifiedAPIClient {
  private cache = new Map<string, { data: any; expiry: number }>();
  private pendingRequests: PendingRequest[] = [];
  private isOnline = navigator.onLine;
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.syncPendingRequests();
    });
    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
    this.loadPendingRequests();
  }

  private getCacheKey(url: string, config?: RequestConfig): string {
    return `${config?.method || "GET"}:${url}:${JSON.stringify(config?.body || {})}`;
  }

  private async loadPendingRequests() {
    try {
      const stored = localStorage.getItem("api_pending_requests");
      if (stored) {
        this.pendingRequests = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load pending requests:", error);
    }
  }

  private savePendingRequests() {
    try {
      localStorage.setItem("api_pending_requests", JSON.stringify(this.pendingRequests));
    } catch (error) {
      console.error("Failed to save pending requests:", error);
    }
  }

  private async syncPendingRequests() {
    const requests = [...this.pendingRequests];
    this.pendingRequests = [];
    this.savePendingRequests();

    for (const request of requests) {
      try {
        await this.request(request.url, { ...request.config, offline: false });
      } catch (error) {
        console.error("Failed to sync request:", error);
        this.pendingRequests.push(request);
      }
    }
    this.savePendingRequests();
  }

  async request<T = any>(url: string, config: RequestConfig = {}): Promise<APIResponse<T>> {
    const {
      method = "GET",
      headers = {},
      body,
      cache = method === "GET",
      cacheTTL = 5 * 60 * 1000, // 5 minutes
      retry = 3,
      retryDelay = 1000,
      timeout = 30000,
      priority = "normal",
      offline = true,
    } = config;

    const cacheKey = this.getCacheKey(url, config);

    // Check cache for GET requests
    if (cache && method === "GET") {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        return {
          data: cached.data,
          error: null,
          status: 200,
          cached: true,
          timestamp: Date.now(),
        };
      }
    }

    // Handle offline mode
    if (!this.isOnline && offline) {
      if (method !== "GET") {
        this.pendingRequests.push({
          id: crypto.randomUUID(),
          url,
          config,
          timestamp: Date.now(),
        });
        this.savePendingRequests();
        
        return {
          data: null,
          error: null,
          status: 202, // Accepted - queued for later
          cached: false,
          timestamp: Date.now(),
        };
      }

      // Return cached data if available
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return {
          data: cached.data,
          error: null,
          status: 200,
          cached: true,
          timestamp: Date.now(),
        };
      }

      return {
        data: null,
        error: new Error("No network connection and no cached data"),
        status: 0,
        cached: false,
        timestamp: Date.now(),
      };
    }

    // Request deduplication
    const existingRequest = this.requestQueue.get(cacheKey);
    if (existingRequest && method === "GET") {
      return existingRequest;
    }

    const requestPromise = this.executeRequest<T>(url, {
      method,
      headers,
      body,
      retry,
      retryDelay,
      timeout,
    });

    if (method === "GET") {
      this.requestQueue.set(cacheKey, requestPromise);
      requestPromise.finally(() => {
        this.requestQueue.delete(cacheKey);
      });
    }

    const response = await requestPromise;

    // Cache successful GET responses
    if (cache && method === "GET" && response.data && !response.error) {
      this.cache.set(cacheKey, {
        data: response.data,
        expiry: Date.now() + cacheTTL,
      });
    }

    return response;
  }

  private async executeRequest<T>(
    url: string,
    config: {
      method: string;
      headers: Record<string, string>;
      body?: any;
      retry: number;
      retryDelay: number;
      timeout: number;
    }
  ): Promise<APIResponse<T>> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= config.retry; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        const response = await fetch(url, {
          method: config.method,
          headers: {
            "Content-Type": "application/json",
            ...config.headers,
          },
          body: config.body ? JSON.stringify(config.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        return {
          data,
          error: null,
          status: response.status,
          cached: false,
          timestamp: Date.now(),
        };
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < config.retry) {
          await new Promise(resolve => 
            setTimeout(resolve, config.retryDelay * Math.pow(2, attempt))
          );
        }
      }
    }

    return {
      data: null,
      error: lastError,
      status: 0,
      cached: false,
      timestamp: Date.now(),
    };
  }

  // Generic Supabase query - uses raw fetch for flexibility
  async supabaseQuery<T = any>(
    table: string,
    query: {
      select?: string;
      filter?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<APIResponse<T[]>> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      let url = `${baseUrl}/rest/v1/${table}?select=${query.select || "*"}`;
      
      if (query.filter) {
        Object.entries(query.filter).forEach(([key, value]) => {
          url += `&${key}=eq.${value}`;
        });
      }
      
      if (query.order) {
        url += `&order=${query.order.column}.${query.order.ascending ? "asc" : "desc"}`;
      }
      
      if (query.limit) {
        url += `&limit=${query.limit}`;
      }
      
      if (query.offset) {
        url += `&offset=${query.offset}`;
      }

      const response = await fetch(url, {
        headers: {
          "apikey": apiKey,
          "Authorization": `Bearer ${sessionData?.session?.access_token || apiKey}`,
        },
      });

      const data = await response.json();

      return {
        data: data as T[],
        error: response.ok ? null : new Error(data.message || "Query failed"),
        status: response.status,
        cached: false,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
        status: 500,
        cached: false,
        timestamp: Date.now(),
      };
    }
  }

  async supabaseMutation<T = any>(
    table: string,
    operation: "insert" | "update" | "upsert" | "delete",
    mutationData: any,
    filter?: Record<string, any>
  ): Promise<APIResponse<T>> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      let url = `${baseUrl}/rest/v1/${table}`;
      let method = "POST";
      const headers: Record<string, string> = {
        "apikey": apiKey,
        "Authorization": `Bearer ${sessionData?.session?.access_token || apiKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      };

      if (filter) {
        const filterParams = Object.entries(filter)
          .map(([key, value]) => `${key}=eq.${value}`)
          .join("&");
        url += `?${filterParams}`;
      }

      switch (operation) {
      case "insert":
        method = "POST";
        break;
      case "update":
        method = "PATCH";
        break;
      case "upsert":
        method = "POST";
        headers["Prefer"] = "resolution=merge-duplicates,return=representation";
        break;
      case "delete":
        method = "DELETE";
        break;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: operation !== "delete" ? JSON.stringify(mutationData) : undefined,
      });

      const data = response.status !== 204 ? await response.json() : null;

      return {
        data: Array.isArray(data) ? data[0] : data,
        error: response.ok ? null : new Error(data?.message || "Mutation failed"),
        status: response.status,
        cached: false,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
        status: 500,
        cached: false,
        timestamp: Date.now(),
      };
    }
  }

  clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  getPendingRequestsCount(): number {
    return this.pendingRequests.length;
  }
}

export const apiClient = new UnifiedAPIClient();

// React hook
import { useState, useCallback } from "react";

export function useAPI<T = any>(url: string, config?: RequestConfig) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState(false);

  const execute = useCallback(async (overrideConfig?: RequestConfig) => {
    setLoading(true);
    setError(null);

    const response = await apiClient.request<T>(url, { ...config, ...overrideConfig });
    
    setData(response.data);
    setError(response.error);
    setCached(response.cached);
    setLoading(false);

    return response;
  }, [url, config]);

  const refresh = useCallback(() => {
    return execute({ cache: false });
  }, [execute]);

  return { data, error, loading, cached, execute, refresh };
}

export function useSupabaseQuery<T = any>(
  table: string,
  query?: Parameters<typeof apiClient.supabaseQuery>[1]
) {
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async () => {
    setLoading(true);
    const response = await apiClient.supabaseQuery<T>(table, query);
    setData(response.data);
    setError(response.error);
    setLoading(false);
    return response;
  }, [table, query]);

  return { data, error, loading, execute };
}
