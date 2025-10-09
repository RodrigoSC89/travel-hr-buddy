import * as Sentry from "@sentry/react";

/**
 * Sentry utility functions for error tracking and monitoring
 */

/**
 * Captures an API error with additional context
 * @param error - The error object to capture
 * @param endpoint - The API endpoint that failed
 * @param context - Additional context about the request
 */
export const captureAPIError = (
  error: Error | unknown,
  endpoint: string,
  context?: Record<string, any>
) => {
  Sentry.captureException(error, {
    tags: {
      errorType: "api-error",
      endpoint,
    },
    extra: {
      ...context,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Captures a navigation error
 * @param error - The error object to capture
 * @param route - The route that failed
 */
export const captureNavigationError = (
  error: Error | unknown,
  route: string
) => {
  Sentry.captureException(error, {
    tags: {
      errorType: "navigation-error",
      route,
    },
  });
};

/**
 * Sets user context for better error tracking
 * @param userId - The user's ID
 * @param email - The user's email (optional)
 * @param username - The user's username (optional)
 * @param metadata - Additional user metadata (optional)
 */
export const setSentryUser = (
  userId: string,
  email?: string,
  username?: string,
  metadata?: Record<string, any>
) => {
  Sentry.setUser({
    id: userId,
    email,
    username,
    ...metadata,
  });
};

/**
 * Clears user context (e.g., on logout)
 */
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

/**
 * Adds a breadcrumb for tracking user actions
 * @param message - The breadcrumb message
 * @param category - The category (e.g., 'navigation', 'user-action', 'api')
 * @param level - The severity level
 * @param data - Additional data
 */
export const addSentryBreadcrumb = (
  message: string,
  category: string = "user-action",
  level: "debug" | "info" | "warning" | "error" | "fatal" = "info",
  data?: Record<string, any>
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Sets a tag for filtering errors in Sentry
 * @param key - The tag key
 * @param value - The tag value
 */
export const setSentryTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

/**
 * Sets a context for additional information
 * @param name - The context name
 * @param context - The context object
 */
export const setSentryContext = (
  name: string,
  context: Record<string, any>
) => {
  Sentry.setContext(name, context);
};

/**
 * Wraps an async function with error tracking
 * @param fn - The async function to wrap
 * @param errorMessage - Custom error message
 * @returns The wrapped function
 */
export const withErrorTracking = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorMessage?: string
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          functionName: fn.name,
          arguments: args,
          customMessage: errorMessage,
        },
      });
      throw error;
    }
  }) as T;
};
