/**
 * PATCH 499: Main Telemetry Service
 * Centralized telemetry tracking with PostHog
 */

import posthog from "posthog-js";
import type { TelemetryEvent, TelemetryEventName } from "./events";
import { ConsentManager } from "./consent";
import { OfflineQueue } from "./offline-queue";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || "";
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com";
const TELEMETRY_ENABLED = import.meta.env.VITE_TELEMETRY_ENABLED === "true";

class TelemetryService {
  private initialized = false;
  private online = navigator.onLine;

  constructor() {
    // Monitor online/offline status
    window.addEventListener("online", () => {
      this.online = true;
      this.syncOfflineEvents();
    });

    window.addEventListener("offline", () => {
      this.online = false;
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
          this.initialized = true;
          this.syncOfflineEvents();
        },
      });
    } catch (error) {
      console.error("Failed to initialize PostHog:", error);
      console.error("Failed to initialize PostHog:", error);
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
      console.error("Failed to track event:", error);
      console.error("Failed to track event:", error);
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
      console.error("Failed to identify user:", error);
      console.error("Failed to identify user:", error);
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
      console.error("Failed to reset telemetry:", error);
      console.error("Failed to reset telemetry:", error);
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
    } catch (error) {
      console.error("Failed to sync offline events:", error);
      console.error("Failed to sync offline events:", error);
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
