/**
 * PATCH 499: Main Telemetry Service
 * Centralized telemetry tracking with PostHog
 */

import posthog from "posthog-js";
import { logger } from '@/lib/logger';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || "";
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com";
const TELEMETRY_ENABLED = import.meta.env.VITE_TELEMETRY_ENABLED === "true";

type TelemetryEventName = string;

interface TelemetryEvent {
  name: TelemetryEventName;
  properties?: Record<string, unknown>;
}

class TelemetryService {
  private initialized = false;
  private online = true;
  private offlineQueue: TelemetryEvent[] = [];

  constructor() {
    window.addEventListener("online", () => {
      this.online = true;
      this.syncOfflineEvents();
    });
    window.addEventListener("offline", () => { /* keep trying */ });
  }

  init(): void {
    if (this.initialized || !TELEMETRY_ENABLED) return;

    try {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: true,
        disable_session_recording: false,
        session_recording: { maskAllInputs: true, maskTextSelector: ".sensitive" },
        persistence: "localStorage",
        opt_out_capturing_by_default: false,
        loaded: () => {
          this.initialized = true;
          this.syncOfflineEvents();
        },
      });
    } catch (error) {
      logger.error("Failed to initialize PostHog:", error);
    }
  }

  trackEvent(name: TelemetryEventName, properties?: Record<string, unknown>): void {
    if (!TELEMETRY_ENABLED) return;

    const event: TelemetryEvent = {
      name,
      properties: { ...properties, timestamp: new Date().toISOString() },
    };

    if (!this.online) {
      this.offlineQueue.push(event);
      return;
    }

    try {
      posthog.capture(name, event.properties);
    } catch {
      this.offlineQueue.push(event);
    }
  }

  identify(userId: string, properties?: Record<string, unknown>): void {
    if (!TELEMETRY_ENABLED) return;
    try { posthog.identify(userId, properties); } catch { /* noop */ }
  }

  reset(): void {
    if (!TELEMETRY_ENABLED) return;
    try { posthog.reset(); } catch { /* noop */ }
  }

  private async syncOfflineEvents(): Promise<void> {
    if (!this.online || !this.initialized) return;
    const events = [...this.offlineQueue];
    this.offlineQueue = [];
    for (const event of events) {
      try { posthog.capture(event.name, event.properties); } catch { /* noop */ }
    }
  }

  isEnabled(): boolean {
    return TELEMETRY_ENABLED;
  }

  getStatus() {
    return {
      enabled: TELEMETRY_ENABLED,
      initialized: this.initialized,
      online: this.online,
      queuedEvents: this.offlineQueue.length,
    };
  }
}

export const telemetry = new TelemetryService();

export function trackEvent(name: TelemetryEventName, properties?: Record<string, unknown>): void {
  telemetry.trackEvent(name, properties);
}

export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
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

// Re-export performance monitor & otel
export { usePerformanceMonitor } from './performance-monitor';
export type { PerformanceMetrics } from './performance-monitor';
