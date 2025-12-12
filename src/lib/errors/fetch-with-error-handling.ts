/**
 * FASE 3.3 - Fetch with Error Handling
 * Wrapper do fetch com retry, timeout e error tracking
 */

import { retryWithBackoff, RetryOptions } from "./retry-logic";
import { errorTrackingService } from "./error-tracking-service";
import { NetworkError, APIError } from "./types";

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retry?: Partial<RetryOptions>;
  trackErrors?: boolean;
}

/**
 * Enhanced fetch with error handling, retry, and timeout
 */
export async function fetchWithErrorHandling<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    timeout = 30000,
    retry,
    trackErrors = true,
    ...fetchOptions
  } = options;

  const operation = async (): Promise<T> => {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!response.ok) {
        const error = new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          {
            action: "fetch",
            metadata: {
              url,
              method: fetchOptions.method || "GET",
            },
          }
        );

        if (trackErrors) {
          errorTrackingService.trackAPIError(
            error,
            response.status,
            {
              action: "fetch",
              metadata: { url, method: fetchOptions.method || "GET" },
            }
          );
        }

        throw error;
      }

      // Parse response
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return await response.json();
      } else {
        return (await response.text()) as any;
      }
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle abort (timeout)
      if (error.name === "AbortError") {
        const timeoutError = new NetworkError("Request timeout", {
          action: "fetch",
          metadata: { url, timeout },
        });

        if (trackErrors) {
          errorTrackingService.trackNetworkError(timeoutError, {
            action: "fetch",
            metadata: { url, timeout },
          });
        }

        throw timeoutError;
      }

      // Handle network errors
      if (error instanceof TypeError || error.message?.includes("fetch")) {
        const networkError = new NetworkError(
          "Network request failed",
          {
            action: "fetch",
            metadata: { url, originalError: error.message },
          }
        );

        if (trackErrors) {
          errorTrackingService.trackNetworkError(networkError, {
            action: "fetch",
            metadata: { url },
          });
        }

        throw networkError;
      }

      // Re-throw other errors
      throw error;
    }
  };

  // Apply retry logic if configured
  if (retry) {
    return retryWithBackoff(operation, retry);
  }

  return operation();
}

/**
 * Convenience methods
 */
export const fetchJSON = {
  get: <T = any>(url: string, options?: FetchOptions) =>
    fetchWithErrorHandling<T>(url, { ...options, method: "GET" }),

  post: <T = any>(url: string, data?: any, options?: FetchOptions) =>
    fetchWithErrorHandling<T>(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(data),
    }),

  put: <T = any>(url: string, data?: any, options?: FetchOptions) =>
    fetchWithErrorHandling<T>(url, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(data),
    }),

  patch: <T = any>(url: string, data?: any, options?: FetchOptions) =>
    fetchWithErrorHandling<T>(url, {
      ...options,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(data),
    }),

  delete: <T = any>(url: string, options?: FetchOptions) =>
    fetchWithErrorHandling<T>(url, { ...options, method: "DELETE" }),
};
