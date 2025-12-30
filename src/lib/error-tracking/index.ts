/**
 * Error Tracking Module Index
 * PATCH 833: Central export for error tracking
 * Re-exports from unified module for consistency
 */

export { 
  errorTracker, 
  useErrorTracking,
  logError,
  logErrorOnce,
  handleApiError,
  getErrorMessage,
  normalizeError,
  isRetryableError,
  APIError,
  ValidationError,
  NetworkError,
  AuthError,
  CircuitOpenError,
} from '@/lib/unified/error-handling.unified';
