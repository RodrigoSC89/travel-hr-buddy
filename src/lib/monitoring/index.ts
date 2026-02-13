/**
 * Monitoring Module Index
 * Centralized exports for all monitoring utilities
 */

export { 
  logger, 
  createModuleLogger 
} from './structured-logging';

export {
  apm,
  withAPM,
  useAPMTransaction,
  type APMMetric,
  type APMTransaction,
  type APMSpan,
  type APMError,
} from './apm';

// Button Error Tracking (Sentry Integration)
export { 
  trackButtonError,
  trackNonFunctionalButton,
  createTrackedHandler,
  withButtonTracking,
  trackButtonPerformance,
  type ButtonErrorContext,
} from './button-error-tracker';
