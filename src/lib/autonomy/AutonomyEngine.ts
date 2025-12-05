/**
 * Autonomy Engine - Optimized
 * Lightweight autonomous system (disabled by default)
 */

import { Logger } from "@/lib/utils/logger";

export interface AutonomousAction {
  id: string;
  moduleId: string;
  action: "restart" | "cache-clear" | "reconnect-ai" | "hotfix" | "fallback";
  reason: string;
  confidence: number;
  timestamp: string;
  success?: boolean;
  executedAt?: string;
}

export interface DecisionContext {
  moduleId: string;
  errorRate: number;
  responseTime: number;
  lastRestart?: string;
  criticalityLevel: "low" | "medium" | "high" | "critical";
  aiDependency: boolean;
}

class AutonomyEngine {
  private actions: AutonomousAction[] = [];
  private isActive = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 60000; // 1 minute (increased from 15s)

  start() {
    // Disabled by default to prevent performance issues
    const ENABLE = import.meta.env.VITE_ENABLE_AUTONOMY === "true";
    if (!ENABLE) {
      Logger.info("AutonomyEngine disabled", undefined, "AutonomyEngine");
      return;
    }

    if (this.isActive) return;
    this.isActive = true;
    
    Logger.info("AutonomyEngine starting", undefined, "AutonomyEngine");

    this.checkInterval = setInterval(() => {
      this.evaluateSystemHealth();
    }, this.CHECK_INTERVAL_MS);
  }

  stop() {
    this.isActive = false;
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    Logger.info("AutonomyEngine stopped", undefined, "AutonomyEngine");
  }

  private evaluateSystemHealth() {
    if (!this.isActive) return;
    Logger.debug("System health check", undefined, "AutonomyEngine");
  }

  getRecentActions(limit: number = 20): AutonomousAction[] {
    return this.actions.slice(-limit);
  }

  getStatistics() {
    const total = this.actions.length;
    const successful = this.actions.filter(a => a.success).length;

    return {
      totalActions: total,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      actionBreakdown: {},
      averageConfidence: 0,
      isActive: this.isActive
    };
  }
}

export const autonomyEngine = new AutonomyEngine();
