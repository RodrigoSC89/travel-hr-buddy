/**
 * Resilient Fetch Wrapper with Circuit Breaker
 * 
 * Wraps fetch calls with circuit breaker protection,
 * automatic retries, and timeout handling.
 */

import { getCircuitBreaker } from '@/lib/resilience/circuit-breaker';

export interface ResilientFetchOptions extends RequestInit {
  /** Circuit breaker service name */
  circuitName?: string;
  /** Request timeout in ms */
  timeout?: number;
  /** Number of retries */
  retries?: number;
  /** Retry delay in ms */
  retryDelay?: number;
  /** Fallback response on circuit open */
  fallback?: Response | (() => Response);
}

const DEFAULT_OPTIONS: Required<Pick<ResilientFetchOptions, 'timeout' | 'retries' | 'retryDelay'>> = {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
};

/**
 * Detect circuit name from URL
 */
function detectCircuitName(url: string): string {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('supabase')) return 'supabase';
  if (urlLower.includes('ai.gateway.lovable')) return 'lovable-ai';
  if (urlLower.includes('gemini') || urlLower.includes('googleapis')) return 'gemini';
  if (urlLower.includes('openai')) return 'gpt';
  if (urlLower.includes('stripe')) return 'stripe';
  if (urlLower.includes('docusign')) return 'docusign';
  if (urlLower.includes('marinetraffic')) return 'marine-traffic';
  if (urlLower.includes('stormglass')) return 'stormglass';
  if (urlLower.includes('elevenlabs')) return 'elevenlabs';
  if (urlLower.includes('mapbox')) return 'mapbox';
  if (urlLower.includes('twilio')) return 'twilio';
  
  return 'default';
}

/**
 * Sleep utility
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Resilient fetch with circuit breaker, retries, and timeout
 */
export async function resilientFetch(
  url: string,
  options: ResilientFetchOptions = {}
): Promise<Response> {
  const {
    circuitName = detectCircuitName(url),
    timeout = DEFAULT_OPTIONS.timeout,
    retries = DEFAULT_OPTIONS.retries,
    retryDelay = DEFAULT_OPTIONS.retryDelay,
    fallback,
    ...fetchOptions
  } = options;

  const breaker = getCircuitBreaker(circuitName);

  // If circuit is open and we have a fallback, return it
  if (breaker.isOpen() && fallback) {
    console.warn(`[resilientFetch] Circuit ${circuitName} is OPEN, using fallback`);
    return typeof fallback === 'function' ? fallback() : fallback;
  }

  // Execute with circuit breaker
  return breaker.execute(async () => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetchWithTimeout(url, fetchOptions, timeout);

        // Consider 5xx as failures for circuit breaker
        if (response.status >= 500) {
          throw new Error(`Server error: ${response.status}`);
        }

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on client errors (4xx) or abort
        if (lastError.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`);
        }

        if (attempt < retries) {
          const delay = retryDelay * Math.pow(2, attempt);
          console.warn(`[resilientFetch] Attempt ${attempt + 1} failed for ${circuitName}, retrying in ${delay}ms`);
          await sleep(delay);
        }
      }
    }

    throw lastError || new Error('Unknown error');
  });
}

/**
 * Create a pre-configured fetch for a specific service
 */
export function createServiceFetch(
  serviceName: string,
  defaultOptions: Partial<ResilientFetchOptions> = {}
) {
  return (url: string, options: ResilientFetchOptions = {}) => {
    return resilientFetch(url, {
      circuitName: serviceName,
      ...defaultOptions,
      ...options,
    });
  };
}

// Pre-configured fetchers for common services
export const supabaseFetch = createServiceFetch('supabase', { timeout: 30000 });
export const aiGatewayFetch = createServiceFetch('lovable-ai', { timeout: 60000 });
export const geminiFetch = createServiceFetch('gemini', { timeout: 60000 });
export const stripeFetch = createServiceFetch('stripe', { timeout: 30000 });
export const weatherFetch = createServiceFetch('stormglass', { timeout: 15000 });

export default resilientFetch;
