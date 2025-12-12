/**
 * FASE 3.3 - Error Handling System
 * Exports centralizados
 */

// Types
export * from "./types";

// Services
export { errorTrackingService } from "./error-tracking-service";
export { errorRecoveryManager, resetApplicationState, reloadPageSafely, navigateToSafeRoute } from "./error-recovery";

// Retry logic
export { 
  retryWithBackoff, 
  retryWithCondition, 
  safeAsyncWithRetry, 
  withTimeout, 
  retryWithTimeout 
} from "./retry-logic";

// Fetch utilities
export { fetchWithErrorHandling, fetchJSON } from "./fetch-with-error-handling";
export type { FetchOptions } from "./fetch-with-error-handling";

// Axios interceptors
export { setupAxiosInterceptors, createAxiosWithRetry, axiosWithRetry } from "./axios-interceptors";
