/**
 * Centralized Sentry Initialization
 * P1-008: Single point of initialization for error tracking
 */
import * as Sentry from '@sentry/react';
import { logger } from '@/lib/logger';

let initialized = false;

export function initializeSentry() {
  if (initialized) return;

  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const env = import.meta.env.MODE;

  if (!dsn) {
    if (import.meta.env.DEV) {
      logger.info('[Sentry] VITE_SENTRY_DSN não configurado — monitoramento desativado');
    }
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: env,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: env === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event) {
        // Strip cookies for privacy
        if (event.request?.cookies) delete event.request.cookies;
        return event;
      },
    });

    initialized = true;
    logger.info('[Sentry] Initialized successfully', { environment: env });
  } catch (error) {
    logger.warn('[Sentry] Failed to initialize', error instanceof Error ? { message: error.message } : undefined);
  }
}

export { Sentry };
