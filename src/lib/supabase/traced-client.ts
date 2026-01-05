/**
 * Traced Supabase Client
 * Wraps Supabase client with automatic traceId propagation
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { tracer, createTraceHeaders, TraceContext } from "@/lib/tracing/distributed-trace";

const SUPABASE_URL = "https://vnbptmixvwropvanyhdb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE";

// Safe storage adapter
const safeLocalStorage = (() => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("__storage_test__", "test");
      window.localStorage.removeItem("__storage_test__");
      return window.localStorage;
    }
  } catch {
    console.warn("localStorage not available, using memory storage");
  }
  
  const memoryStorage: Record<string, string> = {};
  return {
    getItem: (key: string) => memoryStorage[key] || null,
    setItem: (key: string, value: string) => { memoryStorage[key] = value; },
    removeItem: (key: string) => { delete memoryStorage[key]; },
    clear: () => { Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]); },
    key: (index: number) => Object.keys(memoryStorage)[index] || null,
    length: Object.keys(memoryStorage).length,
  };
})();

/**
 * Create traced Supabase client with automatic traceId propagation
 */
export function createTracedClient(module?: string): {
  client: SupabaseClient<Database>;
  context: TraceContext;
} {
  const context = tracer.startTrace({ module });
  const traceHeaders = createTraceHeaders(context);

  const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: safeLocalStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        "x-client-info": "nautilus-traced",
        ...traceHeaders,
      },
    },
  });

  return { client, context };
}

/**
 * Traced fetch wrapper for Edge Functions
 */
export async function tracedEdgeFetch<T = unknown>(
  functionName: string,
  options: {
    body?: Record<string, unknown>;
    method?: "GET" | "POST" | "PUT" | "DELETE";
    module?: string;
  } = {}
): Promise<{ data: T | null; error: Error | null; traceId: string }> {
  const context = tracer.startTrace({ module: options.module || functionName });
  const traceHeaders = createTraceHeaders(context);

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/${functionName}`,
      {
        method: options.method || "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          ...traceHeaders,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      }
    );

    const responseTraceId = response.headers.get("x-trace-id") || context.traceId;
    
    if (!response.ok) {
      const errorText = await response.text();
      tracer.endTrace(context.traceId, { 
        success: false, 
        status: response.status,
        error: errorText 
      });
      return { 
        data: null, 
        error: new Error(errorText), 
        traceId: responseTraceId 
      };
    }

    const data = await response.json();
    tracer.endTrace(context.traceId, { 
      success: true, 
      status: response.status 
    });
    
    return { data, error: null, traceId: responseTraceId };
  } catch (error) {
    tracer.endTrace(context.traceId, { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error("Unknown error"), 
      traceId: context.traceId 
    };
  }
}

/**
 * Hook for traced Supabase operations
 */
export function useTracedSupabase(module: string) {
  const { client, context } = createTracedClient(module);

  const endTrace = (metadata?: Record<string, unknown>) => {
    tracer.endTrace(context.traceId, metadata);
  };

  const callEdgeFunction = <T = unknown>(
    functionName: string,
    body?: Record<string, unknown>
  ) => tracedEdgeFetch<T>(functionName, { body, module });

  return {
    supabase: client,
    traceId: context.traceId,
    context,
    endTrace,
    callEdgeFunction,
  };
}
