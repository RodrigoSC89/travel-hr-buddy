/**
 * Sentry Client Configuration - Enhanced for Button Error Monitoring
 * PATCH 850: Production monitoring for button errors and UI issues
 */

import * as Sentry from "@sentry/react";

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE || 'development',
    release: 'nautilus-one@3.2.0',
    tracesSampleRate: 1.0,
    
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Before send filter for button errors
    beforeSend(event, hint) {
      // Enrich button-related errors
      if (event.tags?.error_type === 'button_click') {
        event.fingerprint = [
          '{{ default }}',
          event.tags.module as string,
          event.tags.action as string,
        ];
      }
      
      // Filter out known non-critical errors
      const error = hint.originalException;
      if (error instanceof Error) {
        // Skip ResizeObserver errors (browser quirk)
        if (error.message.includes('ResizeObserver')) {
          return null;
        }
      }
      
      return event;
    },
    
    // Breadcrumb filter for button clicks
    beforeBreadcrumb(breadcrumb) {
      // Track all button clicks
      if (breadcrumb.category === 'ui.click') {
        breadcrumb.level = 'info';
      }
      return breadcrumb;
    },
  });
  
  // Set global tags
  Sentry.setTag('app_version', '3.2.0');
  Sentry.setTag('platform', 'web');
  
  console.info("Sentry initialized - error tracking enabled");
} else {
  console.info("Sentry DSN not configured - error tracking disabled");
}
