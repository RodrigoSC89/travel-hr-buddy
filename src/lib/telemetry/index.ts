/**
 * PATCH 499: Main Telemetry Service
 * Centralized telemetry tracking with PostHog
 */

import posthog from "posthog-js";
import type { TelemetryEvent, TelemetryEventName } from "./events";
import { ConsentManager } from "./consent";
import { OfflineQueue } from "./offline-queue";
import { logger } from '@/lib/logger';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || "";
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com";
const TELEMETRY_ENABLED = import.meta.env.VITE_TELEMETRY_ENABLED === "true";

class TelemetryService {
  private initialized = false;
  // PATCH v26: Sempre assumir online - navigator.onLine não é confiável no iOS PWA
  private online = true;

  constructor() {
    // PATCH v26: Listeners mantidos para compatibilidade, mas sempre tentamos enviar
    window.addEventListener("online", () => {
      this.online = true;
      this.syncOfflineEvents();
    });

    window.addEventListener("offline", () => {
      // PATCH v26: Não desabilitar telemetry - deixar falhar naturalmente
      // this.online = false;
    });
  }

  /**
   * Initialize PostHog
   */
  init(): void {
    if (this.initialized || !TELEMETRY_ENABLED) {
      return;
    }

    // Only initialize if consent is granted
    if (!ConsentManager.hasConsent()) {
      return;
    }

    try {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        autocapture: false, // Disable autocapture for GDPR compliance
        capture_pageview: false, // Manual pageview tracking
        capture_pageleave: true,
        disable_session_recording: false,
        session_recording: {
          maskAllInputs: true, // Mask sensitive inputs
          maskTextSelector: ".sensitive", // Mask elements with sensitive class
        },
        persistence: "localStorage",
        opt_out_capturing_by_default: false,
        loaded: (posthog) => {
          logger.debug("PostHog initialized");
          this.initialized = true;
          this.syncOfflineEvents();
        },
      });
    } catch (error) {
      logger.error("Failed to initialize PostHog:", error);
    }
  }

  /**
   * Track event
   */
  trackEvent(name: TelemetryEventName, properties?: Record<string, any>): void {
    if (!TELEMETRY_ENABLED) {
      return;
    }

    // Check consent
    if (!ConsentManager.hasConsent()) {
      logger.debug("Telemetry tracking skipped - no consent");
      return;
    }

    const event: TelemetryEvent = {
      name,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
      },
    };

    // If offline, queue the event
    if (!this.online) {
      OfflineQueue.enqueue(event);
      return;
    }

    // Track with PostHog
    try {
      posthog.capture(name, event.properties);
    } catch (error) {
      logger.error("Failed to track event:", error);
      // Queue for retry
      OfflineQueue.enqueue(event);
    }
  }

  /**
   * Identify user
   */
  identify(userId: string, properties?: Record<string, any>): void {
    if (!TELEMETRY_ENABLED || !ConsentManager.hasConsent()) {
      return;
    }

    try {
      posthog.identify(userId, properties);
    } catch (error) {
      logger.error("Failed to identify user:", error);
    }
  }

  /**
   * Reset user identity (on logout)
   */
  reset(): void {
    if (!TELEMETRY_ENABLED) {
      return;
    }

    try {
      posthog.reset();
    } catch (error) {
      logger.error("Failed to reset telemetry:", error);
    }
  }

  /**
   * Sync offline events
   */
  private async syncOfflineEvents(): Promise<void> {
    if (!this.online || !this.initialized) {
      return;
    }

    try {
      await OfflineQueue.processQueue(async (event) => {
        posthog.capture(event.name, event.properties);
      });
      logger.debug("Offline events synced successfully");
    } catch (error) {
      logger.error("Failed to sync offline events:", error);
    }
  }

  /**
   * Check if telemetry is enabled and consent is granted
   */
  isEnabled(): boolean {
    return TELEMETRY_ENABLED && ConsentManager.hasConsent();
  }

  /**
   * Get telemetry status
   */
  getStatus() {
    return {
      enabled: TELEMETRY_ENABLED,
      initialized: this.initialized,
      hasConsent: ConsentManager.hasConsent(),
      online: this.online,
      queuedEvents: OfflineQueue.getQueueSize(),
    };
  }
}

// Export singleton instance
export const telemetry = new TelemetryService();

// Export convenience functions
export function trackEvent(name: TelemetryEventName, properties?: Record<string, any>): void {
  telemetry.trackEvent(name, properties);
}

export function identifyUser(userId: string, properties?: Record<string, any>): void {
  telemetry.identify(userId, properties);
}

export function resetTelemetry(): void {
  telemetry.reset();
}

export function initTelemetry(): void {
  telemetry.init();
}

export function getTelemetryStatus() {
  return telemetry.getStatus();
}
