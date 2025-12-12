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

class AISystem {
  private isInitialized = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private readonly HEALTH_CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly CRITICAL_ERROR_THRESHOLD = 5;
  private readonly QUEUE_LENGTH_THRESHOLD = 20;
  private config: AISystemConfig = {
    enablePredictive: true,
    enableTactical: true,
    enableAdaptive: true,
    enableEvolution: true,
    enableWatchdog: true,
  };

  /**
   * Initialize and start AI system
   */
  async initialize(config?: Partial<AISystemConfig>): Promise<void> {
    if (this.isInitialized) {
      logger.warn("[AISystem] Already initialized");
      return;
    }

    // Merge config
    this.config = { ...this.config, ...config };

    logger.info("[AISystem] Initializing AI System...");

    try {
      // Start System Watchdog first (monitoring)
      if (this.config.enableWatchdog) {
        systemWatchdog.start();
        logger.info("[AISystem] ✓ System Watchdog started");
      }

      // Start Predictive Engine (predictions)
      if (this.config.enablePredictive) {
        await predictiveEngine.trainModel();
        logger.info("[AISystem] ✓ Predictive Engine initialized");
      }

      // Start Tactical AI (decisions)
      if (this.config.enableTactical) {
        tacticalAI.start();
        logger.info("[AISystem] ✓ Tactical AI started");
      }

      // Start Adaptive Metrics Engine (auto-tuning)
      if (this.config.enableAdaptive) {
        adaptiveMetricsEngine.start();
        logger.info("[AISystem] ✓ Adaptive Metrics Engine started");
      }

      // Start Evolution AI Connector (learning)
      if (this.config.enableEvolution) {
        evoAIConnector.start();
        logger.info("[AISystem] ✓ Evolution AI Connector started");
      }

      this.isInitialized = true;
      logger.info("[AISystem] 🚀 AI System fully initialized");

      // Schedule periodic health check
      this.scheduleHealthCheck();
    } catch (error) {
      logger.error("[AISystem] Failed to initialize:", error);
      throw error;
    }
  }

  /**
   * Shutdown AI system
   */
  shutdown(): void {
    if (!this.isInitialized) return;

    logger.info("[AISystem] Shutting down AI System...");

    // Clear health check interval
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.config.enableWatchdog) {
      systemWatchdog.stop();
    }

    if (this.config.enableTactical) {
      tacticalAI.stop();
    }

    if (this.config.enableAdaptive) {
      adaptiveMetricsEngine.stop();
    }

    if (this.config.enableEvolution) {
      evoAIConnector.stop();
    }

    this.isInitialized = false;
    logger.info("[AISystem] AI System shutdown complete");
  }

  /**
   * Schedule periodic health check
   */
  private scheduleHealthCheck(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.HEALTH_CHECK_INTERVAL_MS);
  }

  /**
   * Perform health check on all AI engines
   */
  private async performHealthCheck(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      const health: any = {
        timestamp: new Date().toISOString(),
      });

      // Only get stats for enabled engines
      if (this.config.enableWatchdog) {
        health.watchdog = systemWatchdog.getStats();
      }
      if (this.config.enableTactical) {
        health.tactical = tacticalAI.getStats();
      }
      if (this.config.enableAdaptive) {
        health.adaptive = adaptiveMetricsEngine.getStats();
      }
      if (this.config.enableEvolution) {
        health.evolution = evoAIConnector.getStats();
      }

      logger.info("[AISystem] Health check:", health);

      // Check for any critical issues
      if (health.watchdog && health.watchdog.criticalErrors > this.CRITICAL_ERROR_THRESHOLD) {
        logger.warn(`[AISystem] High number of critical errors detected: ${health.watchdog.criticalErrors}`);
      }

      if (health.tactical && health.tactical.queueLength > this.QUEUE_LENGTH_THRESHOLD) {
        logger.warn(`[AISystem] Tactical decision queue is backing up: ${health.tactical.queueLength} items`);
      }
    } catch (error) {
      logger.error("[AISystem] Health check failed:", error);
    }
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      config: this.config,
      watchdog: this.config.enableWatchdog ? systemWatchdog.getStats() : null,
      tactical: this.config.enableTactical ? tacticalAI.getStats() : null,
      adaptive: this.config.enableAdaptive ? adaptiveMetricsEngine.getStats() : null,
      evolution: this.config.enableEvolution ? evoAIConnector.getStats() : null,
    });
  }

  /**
   * Trigger manual prediction for all modules
   */
  async runPredictions(): Promise<void> {
    if (!this.config.enablePredictive) {
      logger.warn("[AISystem] Predictive engine is disabled");
      return;
    }

    logger.info("[AISystem] Running predictions for all modules...");
    await predictiveEngine.predictAllModules();
  }

  /**
   * Trigger manual evaluation for a module
   */
  async evaluateModule(moduleName: string): Promise<void> {
    if (!this.config.enableTactical) {
      logger.warn("[AISystem] Tactical AI is disabled");
      return;
    }

    logger.info(`[AISystem] Evaluating module: ${moduleName}`);
    await tacticalAI.evaluateAndDecide(moduleName);
  }
}

// Export singleton instance
export const aiSystem = new AISystem();
