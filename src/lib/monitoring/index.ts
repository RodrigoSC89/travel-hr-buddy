/**
 * Monitoring Module Index
 * Centralized exports for all monitoring utilities
 */

export { 
  webVitalsMonitor, 
  useWebVitals, 
  PERFORMANCE_BUDGETS, 
  checkBudget 
} from './web-vitals';

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
