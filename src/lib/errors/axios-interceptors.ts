/**
 * FASE 3.3 - Axios Interceptors
 * Interceptors para tracking e retry automático
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { errorTrackingService } from "./error-tracking-service";
import { retryWithBackoff } from "./retry-logic";
import { APIError, NetworkError } from "./types";

/**
 * Setup axios interceptors for error handling
 */
export function setupAxiosInterceptors(instance: AxiosInstance = axios): void {
  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Add timestamp to track request duration
      (config as any).__startTime = Date.now();
      return config;
    },
    (error) => {
      errorTrackingService.trackNetworkError(error, {
        action: "axios:request",
      });
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => {
      // Calculate request duration
      const duration = Date.now() - ((response.config as any).__startTime || 0);
      
      // Log slow requests
      if (duration > 3000) {
        console.warn(`Slow request detected: ${response.config.url} (${duration}ms)`);
      }

      return response;
    },
    (error: AxiosError) => {
      return handleAxiosError(error);
    }
  );
}

/**
 * Handle axios errors
 */
function handleAxiosError(error: AxiosError): Promise<never> {
  // Network error (no response)
  if (!error.response) {
    const networkError = new NetworkError(
      error.message || "Network request failed",
      {
        action: "axios",
        metadata: {
          url: error.config?.url,
          method: error.config?.method,
        },
      }
    );

    errorTrackingService.trackNetworkError(networkError, {
      action: "axios",
      metadata: {
        url: error.config?.url,
        method: error.config?.method,
      },
    });

    return Promise.reject(networkError);
  }

  // HTTP error (with response)
  const status = error.response.status;
  const apiError = new APIError(
    getErrorMessage(error),
    status,
    {
      action: "axios",
      metadata: {
        url: error.config?.url,
        method: error.config?.method,
        status,
      },
    }
  );

  errorTrackingService.trackAPIError(apiError, status, {
    action: "axios",
    metadata: {
      url: error.config?.url,
      method: error.config?.method,
      status,
    },
  });

  return Promise.reject(apiError);
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(error: AxiosError): string {
  const status = error.response?.status;
  const data = error.response?.data as any;

  // Check for custom error message in response
  if (data?.error) {
    return data.error;
  }
  if (data?.message) {
    return data.message;
  }

  // Default messages by status code
  switch (status) {
  case 400:
    return "Dados inválidos. Verifique os campos.";
  case 401:
    return "Sessão expirada. Faça login novamente.";
  case 403:
    return "Você não tem permissão para esta ação.";
  case 404:
    return "Recurso não encontrado.";
  case 429:
    return "Muitas requisições. Aguarde um momento.";
  case 500:
  case 502:
  case 503:
  case 504:
    return "Erro no servidor. Tente novamente em alguns minutos.";
  default:
    return error.message || "Ocorreu um erro. Tente novamente.";
  }
}

/**
 * Create axios instance with retry logic
 */
export function createAxiosWithRetry(config?: AxiosRequestConfig): AxiosInstance {
  const instance = axios.create(config);
  
  setupAxiosInterceptors(instance);
  
  return instance;
}

/**
 * Axios request with automatic retry
 */
export async function axiosWithRetry<T = any>(
  config: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  return retryWithBackoff(
    () => axios.request<T>(config),
    {
      maxRetries: 3,
      initialDelayMs: 1000,
      maxDelayMs: 10000,
      backoffMultiplier: 2,
    }
  );
}
