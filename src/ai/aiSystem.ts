/**
 * AI System Initialization
 * Initializes and starts all AI engines
 */

import { logger } from "@/lib/logger";
import { predictiveEngine } from "./predictiveEngine";
import { tacticalAI } from "./tacticalAI";
import { adaptiveMetricsEngine } from "./adaptiveMetrics";
import { evoAIConnector } from "./evoAIConnector";
import { systemWatchdog } from "./watchdog";

export interface AISystemConfig {
  enablePredictive?: boolean;
  enableTactical?: boolean;
  enableAdaptive?: boolean;
  enableEvolution?: boolean;
  enableWatchdog?: boolean;
}

interface HealthReport {
  timestamp: string;
  watchdog?: ReturnType<typeof systemWatchdog.getStats>;
  tactical?: ReturnType<typeof tacticalAI.getStats>;
  adaptive?: ReturnType<typeof adaptiveMetricsEngine.getStats>;
  evolution?: ReturnType<typeof evoAIConnector.getStats>;
}

class AISystem {
  private isInitialized = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private readonly HEALTH_CHECK_INTERVAL_MS = 5 * 60 * 1000;
  private readonly CRITICAL_ERROR_THRESHOLD = 5;
  private readonly QUEUE_LENGTH_THRESHOLD = 20;
  private config: AISystemConfig = {
    enablePredictive: true,
    enableTactical: true,
    enableAdaptive: true,
    enableEvolution: true,
    enableWatchdog: true,
  };

  async initialize(config?: Partial<AISystemConfig>): Promise<void> {
    if (this.isInitialized) {
      logger.warn("[AISystem] Already initialized");
      return;
    }

    this.config = { ...this.config, ...config };
    logger.info("[AISystem] Initializing AI System...");

    try {
      if (this.config.enableWatchdog) {
        systemWatchdog.start();
        logger.info("[AISystem] ✓ System Watchdog started");
      }
      if (this.config.enablePredictive) {
        await predictiveEngine.trainModel();
        logger.info("[AISystem] ✓ Predictive Engine initialized");
      }
      if (this.config.enableTactical) {
        tacticalAI.start();
        logger.info("[AISystem] ✓ Tactical AI started");
      }
      if (this.config.enableAdaptive) {
        adaptiveMetricsEngine.start();
        logger.info("[AISystem] ✓ Adaptive Metrics Engine started");
      }
      if (this.config.enableEvolution) {
        evoAIConnector.start();
        logger.info("[AISystem] ✓ Evolution AI Connector started");
      }

      this.isInitialized = true;
      logger.info("[AISystem] 🚀 AI System fully initialized");
      this.scheduleHealthCheck();
    } catch (error) {
      logger.error("[AISystem] Failed to initialize:", error);
      throw error;
    }
  }

  shutdown(): void {
    if (!this.isInitialized) return;
    logger.info("[AISystem] Shutting down AI System...");

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    if (this.config.enableWatchdog) systemWatchdog.stop();
    if (this.config.enableTactical) tacticalAI.stop();
    if (this.config.enableAdaptive) adaptiveMetricsEngine.stop();
    if (this.config.enableEvolution) evoAIConnector.stop();

    this.isInitialized = false;
    logger.info("[AISystem] AI System shutdown complete");
  }

  private scheduleHealthCheck(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.HEALTH_CHECK_INTERVAL_MS);
  }

  private async performHealthCheck(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      const health: HealthReport = {
        timestamp: new Date().toISOString(),
      };

      if (this.config.enableWatchdog) health.watchdog = systemWatchdog.getStats();
      if (this.config.enableTactical) health.tactical = tacticalAI.getStats();
      if (this.config.enableAdaptive) health.adaptive = adaptiveMetricsEngine.getStats();
      if (this.config.enableEvolution) health.evolution = evoAIConnector.getStats();

      logger.info("[AISystem] Health check:", health);

      if (health.watchdog && (health.watchdog as Record<string, unknown>).criticalErrors as number > this.CRITICAL_ERROR_THRESHOLD) {
        logger.warn(`[AISystem] High number of critical errors detected`);
      }

      if (health.tactical && (health.tactical as Record<string, unknown>).queueLength as number > this.QUEUE_LENGTH_THRESHOLD) {
        logger.warn(`[AISystem] Tactical decision queue is backing up`);
      }
    } catch (error) {
      logger.error("[AISystem] Health check failed:", error);
    }
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      config: this.config,
      watchdog: this.config.enableWatchdog ? systemWatchdog.getStats() : null,
      tactical: this.config.enableTactical ? tacticalAI.getStats() : null,
      adaptive: this.config.enableAdaptive ? adaptiveMetricsEngine.getStats() : null,
      evolution: this.config.enableEvolution ? evoAIConnector.getStats() : null,
    };
  }

  async runPredictions(): Promise<void> {
    if (!this.config.enablePredictive) {
      logger.warn("[AISystem] Predictive engine is disabled");
      return;
    }
    logger.info("[AISystem] Running predictions for all modules...");
    await predictiveEngine.predictAllModules();
  }

  async evaluateModule(moduleName: string): Promise<void> {
    if (!this.config.enableTactical) {
      logger.warn("[AISystem] Tactical AI is disabled");
      return;
    }
    logger.info(`[AISystem] Evaluating module: ${moduleName}`);
    await tacticalAI.evaluateAndDecide(moduleName);
  }
}

export const aiSystem = new AISystem();
