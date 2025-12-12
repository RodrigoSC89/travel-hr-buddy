/**
 * PATCH 840: Unified System Initialization
 * Centralizes all system initialization for optimal performance
 */

import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";

interface InitProgress {
  step: string;
  progress: number;
  total: number;
}

type InitCallback = (progress: InitProgress) => void;

class UnifiedSystemInit {
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private callbacks: Set<InitCallback> = new Set();

  async initialize(onProgress?: InitCallback): Promise<void> {
    if (this.initialized) {
      logger.info("System already initialized");
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    if (onProgress) {
      this.callbacks.add(onProgress);
    }

    this.initPromise = this.runInitialization();
    await this.initPromise;
  }

  private async runInitialization(): Promise<void> {
    const steps = [
      { name: "Core Systems", fn: this.initCoreSystem.bind(this) },
      { name: "PWA & Offline", fn: this.initPWA.bind(this) },
      { name: "Performance Monitor", fn: this.initPerformance.bind(this) },
      { name: "Accessibility", fn: this.initAccessibility.bind(this) },
      { name: "Notifications", fn: this.initNotifications.bind(this) },
      { name: "Analytics", fn: this.initAnalytics.bind(this) },
      { name: "i18n", fn: this.initI18n.bind(this) },
    ];

    const total = steps.length;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      this.notifyProgress({ step: step.name, progress: i, total });

      try {
        await step.fn();
        logger.info(`✓ ${step.name} initialized`);
      } catch (error) {
        logger.warn(`⚠ ${step.name} initialization failed`, { error });
        // Continue with other initializations
      }
    }

    this.notifyProgress({ step: "Complete", progress: total, total });
    this.initialized = true;
    logger.info("🚀 Nautilus One fully initialized");
  }

  private async initCoreSystem(): Promise<void> {
    // Initialize monitoring (already done in App.tsx)
    // This ensures it's called if not already initialized
    try {
      const { initializeMonitoring, isMonitoringInitialized } = await import("@/lib/monitoring/init");
      if (!isMonitoringInitialized()) {
        initializeMonitoring();
      }
    } catch {
      // Monitoring may not be available
    }
  }

  private async initPWA(): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      const { offlineSync } = await import("@/lib/pwa/offline-sync");
      await offlineSync.init();

      // Register service worker
      if ("serviceWorker" in navigator) {
        const { swManager } = await import("@/lib/pwa/service-worker-registration");
        await swManager.register();
      }
    } catch (error) {
      logger.warn("PWA initialization failed", { error });
    }
  }

  private async initPerformance(): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      // Initialize web vitals monitoring
      const { webVitalsMonitor } = await import("@/lib/monitoring/web-vitals");
      webVitalsMonitor.init();

      // Initialize bandwidth optimizer
      const { bandwidthOptimizer } = await import("@/lib/performance/low-bandwidth-optimizer");
      bandwidthOptimizer.init();
    } catch (error) {
      logger.warn("Performance monitoring initialization failed", { error });
    }
  }

  private async initAccessibility(): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      const { a11yManager } = await import("@/lib/accessibility/a11y-manager");
      a11yManager.setupSkipLinks();
    } catch (error) {
      logger.warn("Accessibility initialization failed", { error });
    }
  }

  private async initNotifications(): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      const { smartNotifications } = await import("@/lib/notifications/smart-notifications");
      await smartNotifications.checkPermission();
    } catch (error) {
      logger.warn("Notifications initialization failed", { error });
    }
  }

  private async initAnalytics(): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      const { analytics } = await import("@/lib/analytics/advanced-analytics");
      analytics.track("system_init", "system", { timestamp: Date.now() });
    } catch (error) {
      logger.warn("Analytics initialization failed", { error });
    }
  }

  private async initI18n(): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      const { i18n } = await import("@/lib/i18n/translation-manager");
      // Language is auto-detected on instantiation
      logger.info(`Language: ${i18n.getLanguage()}`);
    } catch (error) {
      logger.warn("i18n initialization failed", { error });
    }
  }

  private notifyProgress(progress: InitProgress): void {
    this.callbacks.forEach(cb => {
      try {
        cb(progress);
      } catch {
        // Ignore callback errors
      }
    });
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // Subscribe to initialization progress
  onProgress(callback: InitCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }
}

export const systemInit = new UnifiedSystemInit();

// Hook for React components
export function useSystemInit() {
  const [initialized, setInitialized] = useState(systemInit.isInitialized());
  const [progress, setProgress] = useState<InitProgress | null>(null);

  useEffect(() => {
    if (!initialized) {
      systemInit.initialize(setProgress).then(() => {
        setInitialized(true);
      });
    }
  }, [initialized]);

  return { initialized, progress };
}
