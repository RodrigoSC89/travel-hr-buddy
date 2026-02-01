/**
 * Edge Function Helper
 * PATCH 864 - Centralized Edge Function URL builder
 * Eliminates usage of VITE_SUPABASE_* environment variables
 */

// Hardcoded Supabase URL - matches integrations/supabase/client.ts
const SUPABASE_URL = "https://vnbptmixvwropvanyhdb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE";

/**
 * Get the full URL for an Edge Function
 */
export function getEdgeFunctionUrl(functionName: string): string {
  return `${SUPABASE_URL}/functions/v1/${functionName}`;
}

/**
 * Get default headers for Edge Function calls
 */
export function getEdgeFunctionHeaders(accessToken?: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
  };
}

/**
 * Call an Edge Function with proper headers and error handling
 */
export async function callEdgeFunction<T = unknown>(
  functionName: string,
  body: Record<string, unknown>,
  options?: {
    accessToken?: string;
    timeout?: number;
  }
): Promise<{ data: T | null; error: Error | null }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options?.timeout || 30000);

  try {
    const response = await fetch(getEdgeFunctionUrl(functionName), {
      method: "POST",
      headers: getEdgeFunctionHeaders(options?.accessToken),
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        data: null,
        error: new Error(`Edge function error: ${response.status} - ${errorText}`),
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

// Export constants for compatibility
export { SUPABASE_URL, SUPABASE_ANON_KEY };
