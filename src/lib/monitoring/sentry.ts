/**
 * Sentry Error Tracking & Performance Monitoring
 * Captures runtime exceptions, performance metrics, and user sessions
 */
import * as Sentry from "@sentry/react";

// Initialize Sentry
export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn || import.meta.env.DEV) {
    console.log("[Sentry] Disabled in development mode");
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: `nauti-one@${import.meta.env.VITE_APP_VERSION || "4.0.0"}`,
    
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Filter out non-critical errors
    beforeSend(event, hint) {
      const error = hint.originalException as Error;
      
      // Ignore network errors and rate limits
      if (error?.message?.includes("Failed to fetch") ||
          error?.message?.includes("NetworkError") ||
          error?.message?.includes("Rate limit")) {
        return null;
      }
      
      return event;
    },
    
    // Tags for filtering
    initialScope: {
      tags: {
        app: "nauti-one",
        platform: "web",
      },
    },
  });

  console.log("[Sentry] Initialized successfully");
};

// Capture custom errors
export const captureError = (error: Error, context?: Record<string, unknown>) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

// Capture custom messages
export const captureMessage = (message: string, level: Sentry.SeverityLevel = "info") => {
  Sentry.captureMessage(message, level);
};

// Set user context
export const setUser = (user: { id: string; email?: string; name?: string } | null) => {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  } else {
    Sentry.setUser(null);
  }
};

// Add breadcrumb for debugging
export const addBreadcrumb = (
  message: string,
  category: string,
  data?: Record<string, unknown>
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: "info",
  });
};

// Performance tracking
export const startTransaction = (name: string, op: string) => {
  return Sentry.startSpan({ name, op }, (span) => span);
};

// Track API calls
export const trackApiCall = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    addBreadcrumb(`API: ${name} completed in ${duration.toFixed(0)}ms`, "api", {
      duration,
      success: true,
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    
    addBreadcrumb(`API: ${name} failed after ${duration.toFixed(0)}ms`, "api", {
      duration,
      success: false,
      error: (error as Error).message,
    });
    
    throw error;
  }
};

export default Sentry;
