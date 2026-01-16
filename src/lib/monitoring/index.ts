/**
 * Monitoring Module Index
 * Centralized exports for all monitoring utilities
 * Includes: Sentry, PostHog, Health Check, APM, Web Vitals
 */

// Sentry Error Tracking
export * from './sentry';

// PostHog Analytics
export * from './posthog';

// Health Check Service
export * from './health-check';

// Web Vitals
export { 
  webVitalsMonitor, 
  useWebVitals, 
  PERFORMANCE_BUDGETS, 
  checkBudget 
} from './web-vitals';

// Structured Logging
export { 
  logger, 
  createModuleLogger 
} from './structured-logging';

// Application Performance Monitoring
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

// Combined initialization for production
export const initMonitoring = () => {
  // Initialize Sentry
  import("./sentry").then(({ initSentry }) => {
    initSentry();
  });
  
  // Initialize PostHog
  import("./posthog").then(({ initPostHog }) => {
    initPostHog();
  });
  
  // Start health monitoring (every 60 seconds)
  import("./health-check").then(({ startHealthMonitoring }) => {
    startHealthMonitoring(60000);
  });
  
  console.log("[Monitoring] All services initialized");
};

// User tracking helpers
export const trackUserSession = (user: { id: string; email?: string; name?: string } | null) => {
  import("./sentry").then(({ setUser }) => {
    setUser(user);
  });
  
  if (user) {
    import("./posthog").then(({ identifyUser }) => {
      identifyUser(user.id, { email: user.email, name: user.name });
    });
  } else {
    import("./posthog").then(({ resetUser }) => {
      resetUser();
    });
  }
};
