/**
 * App Bootstrap - Unified initialization for all systems
 * PATCH 900: Performance + Security + Analytics + i18n
 */

import { logger } from "@/lib/logger";

// Lazy imports for code splitting
const loadUltraPerformance = () => import("@/lib/performance/ultra-performance-init");
const loadSecurityHardening = () => import("@/lib/security/security-hardening");
const loadAnalyticsEngine = () => import("@/lib/analytics/analytics-engine");
const loadOfflineManager = () => import("@/lib/pwa/offline-manager");
const loadI18n = () => import("@/lib/i18n/i18n-config");
const loadAutoScaler = () => import("@/lib/scaling/auto-scaler");

interface BootstrapConfig {
  enablePerformance?: boolean;
  enableSecurity?: boolean;
  enableAnalytics?: boolean;
  enableOffline?: boolean;
  enableI18n?: boolean;
  enableScaling?: boolean;
}

const defaultConfig: BootstrapConfig = {
  enablePerformance: true,
  enableSecurity: true,
  enableAnalytics: true,
  enableOffline: true,
  enableI18n: true,
  enableScaling: true,
};

class AppBootstrap {
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize all app systems
   */
  async init(config: BootstrapConfig = defaultConfig): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.doInit(config);
    return this.initPromise;
  }

  private async doInit(config: BootstrapConfig): Promise<void> {
    const startTime = performance.now();
    logger.info("App bootstrap starting...");

    try {
      // Critical path - load in parallel
      const criticalPromises: Promise<void>[] = [];

      // 1. Performance (highest priority)
      if (config.enablePerformance) {
        criticalPromises.push(
          loadUltraPerformance().then(({ ultraPerformance }) => {
            ultraPerformance.init();
          }).catch(e => logger.warn("Performance init failed", { error: e }))
        );
      }

      // 2. Security (critical)
      if (config.enableSecurity) {
        criticalPromises.push(
          loadSecurityHardening().then(({ securityHardening }) => {
            securityHardening.init();
          }).catch(e => logger.warn("Security init failed", { error: e }))
        );
      }

      // 3. i18n (needed for UI)
      if (config.enableI18n) {
        criticalPromises.push(
          loadI18n().then(({ initI18n }) => {
            initI18n();
          }).catch(e => logger.warn("i18n init failed", { error: e }))
        );
      }

      // Wait for critical systems
      await Promise.all(criticalPromises);

      // Non-critical - load after critical path
      const deferredPromises: Promise<void>[] = [];

      // 4. Offline/PWA
      if (config.enableOffline) {
        deferredPromises.push(
          loadOfflineManager().then(({ offlineManager }) => {
            return offlineManager.init();
          }).catch(e => logger.warn("Offline init failed", { error: e }))
        );
      }

      // 5. Analytics
      if (config.enableAnalytics) {
        deferredPromises.push(
          loadAnalyticsEngine().then(({ analyticsEngine }) => {
            analyticsEngine.trackEvent("navigation", "app_start");
          }).catch(e => logger.warn("Analytics init failed", { error: e }))
        );
      }

      // 6. Auto-scaling
      if (config.enableScaling) {
        deferredPromises.push(
          loadAutoScaler().then(() => {
            // Auto-scaler initializes itself
          }).catch(e => logger.warn("Scaler init failed", { error: e }))
        );
      }

      // Wait for deferred in background (don't block)
      Promise.all(deferredPromises).catch(() => {});

      this.initialized = true;
      const duration = performance.now() - startTime;
      logger.info(`App bootstrap complete in ${duration.toFixed(0)}ms`);

      // Report to analytics
      if (config.enableAnalytics) {
        loadAnalyticsEngine().then(({ analyticsEngine }) => {
          analyticsEngine.trackPerformance("bootstrap_time", duration);
        }).catch(() => {});
      }
    } catch (error) {
      logger.error("App bootstrap failed", { error });
      this.initialized = true; // Mark as initialized to prevent retry loops
    }
  }

  /**
   * Check if bootstrap is complete
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Wait for bootstrap to complete
   */
  async waitForInit(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }
}

export const appBootstrap = new AppBootstrap();

// Auto-init when module loads (deferred)
if (typeof window !== "undefined") {
  // Use requestIdleCallback for non-blocking init
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      appBootstrap.init();
    }, { timeout: 2000 });
  } else {
    setTimeout(() => {
      appBootstrap.init();
    }, 100);
  }
}
