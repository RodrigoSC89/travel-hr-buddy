/**
 * Sentry Client Configuration - Production Monitoring v3.2.0
 * Full error tracking, performance monitoring, and session replay
 */

import * as Sentry from "@sentry/react";

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

// Initialize Sentry for production monitoring
export function initSentry() {
  if (!sentryDsn) {
    console.info("⚠️ Sentry DSN not configured - error tracking disabled");
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE || 'development',
    release: 'nautilus-one@3.2.0',
    
    // Performance Monitoring
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.2 : 1.0,
    
    // Integrations
    integrations: [
      Sentry.browserTracingIntegration({
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/.*\.supabase\.co/,
          /^https:\/\/nautilus\.app/,
        ],
      }),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
        maskAllInputs: true,
      }),
      Sentry.feedbackIntegration({
        colorScheme: 'system',
        showBranding: false,
      }),
    ],
    
    // Session Replay
    replaysSessionSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 0,
    replaysOnErrorSampleRate: 1.0, // Always capture replays on error
    
    // Error filtering
    beforeSend(event, hint) {
      // Enrich button-related errors with custom fingerprinting
      if (event.tags?.error_type === 'button_click') {
        event.fingerprint = [
          '{{ default }}',
          event.tags.module as string || 'unknown',
          event.tags.action as string || 'unknown',
        ];
      }
      
      // Filter out known non-critical errors
      const error = hint.originalException;
      if (error instanceof Error) {
        // Skip ResizeObserver errors (browser quirk)
        if (error.message.includes('ResizeObserver')) {
          return null;
        }
        
        // Skip canceled requests
        if (error.message.includes('AbortError') || error.message.includes('canceled')) {
          return null;
        }
        
        // Skip network errors for non-critical resources
        if (error.message.includes('Failed to fetch') && error.message.includes('favicon')) {
          return null;
        }
      }
      
      return event;
    },
    
    // Breadcrumb enrichment
    beforeBreadcrumb(breadcrumb) {
      // Track all UI clicks with enhanced info
      if (breadcrumb.category === 'ui.click') {
        breadcrumb.level = 'info';
        breadcrumb.data = {
          ...breadcrumb.data,
          timestamp: new Date().toISOString(),
        };
      }
      
      // Track navigation events
      if (breadcrumb.category === 'navigation') {
        breadcrumb.level = 'info';
      }
      
      return breadcrumb;
    },
    
    // Ignore specific URLs
    denyUrls: [
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
    ],
  });
  
  // Set global context
  Sentry.setTag('app_version', '3.2.0');
  Sentry.setTag('platform', 'web');
  Sentry.setTag('app_name', 'nautilus-one');
  
  console.info("✅ Sentry initialized - production monitoring active");
}

// Export Sentry utilities
export const captureError = (error: Error, context?: Record<string, unknown>) => {
  Sentry.captureException(error, { extra: context });
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

export const setUserContext = (user: { id: string; email?: string; name?: string }) => {
  Sentry.setUser(user);
};

export const clearUserContext = () => {
  Sentry.setUser(null);
};

export const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb) => {
  Sentry.addBreadcrumb(breadcrumb);
};

// Track button clicks for error monitoring
export const trackButtonClick = (buttonId: string, moduleName: string, action: string) => {
  Sentry.addBreadcrumb({
    category: 'ui.click',
    message: `Button clicked: ${buttonId}`,
    level: 'info',
    data: {
      buttonId,
      moduleName,
      action,
      route: window.location.pathname,
    },
  });
};

// Track page views
export const trackPageView = (pageName: string) => {
  Sentry.addBreadcrumb({
    category: 'navigation',
    message: `Page view: ${pageName}`,
    level: 'info',
    data: {
      pageName,
      url: window.location.href,
    },
  });
};

// Initialize on import if DSN is available
if (sentryDsn) {
  initSentry();
}
