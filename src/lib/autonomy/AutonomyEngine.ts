/**
 * Autonomy Engine
 * Intelligent decision-making core for autonomous system operations
 */

import { systemWatchdog, ModuleStatus } from "@/lib/monitoring/SystemWatchdog";
import { logsEngine } from "@/lib/monitoring/LogsEngine";
import { metricsDaemon } from "@/lib/monitoring/MetricsDaemon";
import { patternRecognition } from "./PatternRecognition";
import { hotfixManager } from "./HotfixManager";
import { logger } from "@/lib/logger";

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
  private readonly CHECK_INTERVAL_MS = 15000; // 15 seconds
  private readonly RESTART_COOLDOWN_MS = 300000; // 5 minutes
  private restartHistory: Map<string, number> = new Map();

  /**
   * Start autonomous monitoring and decision-making
   */
  start() {
    if (this.isActive) {
      logger.info("🤖 AutonomyEngine: Already running");
      return;
    }

    logger.info("🤖 AutonomyEngine: Iniciando sistema de autonomia...");
    this.isActive = true;

    // Start pattern learning
    patternRecognition.start();

    // Periodic autonomous checks
    this.checkInterval = setInterval(() => {
      this.evaluateSystemHealth();
    }, this.CHECK_INTERVAL_MS);

    logsEngine.info("autonomy", "AutonomyEngine ativado", {
      interval: this.CHECK_INTERVAL_MS,
      mode: "proactive"
    });
  }

  /**
   * Stop autonomous operations
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isActive = false;
    patternRecognition.stop();
    logger.info("🤖 AutonomyEngine: Stopped");
  }

  /**
   * Evaluate system health and take autonomous actions
   */
  private async evaluateSystemHealth() {
    const systemStatus = systemWatchdog.getSystemStatus();
    
    for (const module of systemStatus.modules) {
      const decision = this.analyzeModule(module);
      
      if (decision) {
        await this.executeAutonomousAction(decision);
      }
    }
  }

  /**
   * Analyze a module and decide if action is needed
   */
  private analyzeModule(module: ModuleStatus): AutonomousAction | null {
    const context = this.buildDecisionContext(module);
    
    // Rule 1: High error rate detection
    if (context.errorRate > 0.2 && !this.wasRecentlyRestarted(module.id)) {
      return this.createAction(module.id, "restart", 
        `Taxa de erro crítica detectada (${(context.errorRate * 100).toFixed(1)}%)`, 0.85);
    }

    // Rule 2: Degraded performance
    if (module.status === "degraded" && context.responseTime > 3000) {
      const pattern = patternRecognition.findPattern(module.id, "degraded-performance");
      
      if (pattern) {
        return this.createAction(module.id, pattern.recommendedAction as any,
          `Padrão conhecido detectado: ${pattern.description}`, pattern.confidence / 100);
      }
    }

    // Rule 3: Module offline
    if (module.status === "offline") {
      const lastError = module.errors[0];
      
      if (lastError?.includes("IA") || lastError?.includes("GPT")) {
        return this.createAction(module.id, "reconnect-ai",
          "Falha na conexão com IA detectada", 0.75);
      }

      return this.createAction(module.id, "restart",
        "Módulo offline detectado", 0.90);
    }

    // Rule 4: Check for known failure patterns
    const knownPattern = patternRecognition.detectKnownFailure(module.id);
    if (knownPattern && hotfixManager.hasHotfix(knownPattern.id)) {
      return this.createAction(module.id, "hotfix",
        `Padrão recorrente identificado: ${knownPattern.description}`, knownPattern.confidence / 100);
    }

    return null;
  }

  /**
   * Build decision context for a module
   */
  private buildDecisionContext(module: ModuleStatus): DecisionContext {
    const metrics = metricsDaemon.getCurrentMetrics();
    
    return {
      moduleId: module.id,
      errorRate: metrics.error_rate / 100,
      responseTime: module.responseTime,
      lastRestart: this.restartHistory.get(module.id)?.toString(),
      criticalityLevel: this.assessCriticality(module.id),
      aiDependency: this.hasAIDependency(module.id)
    };
  }

  /**
   * Execute an autonomous action
   */
  private async executeAutonomousAction(action: AutonomousAction) {
    logger.info(`🤖 AutonomyEngine: Executando ação autônoma [${action.action}] em ${action.moduleId}`);
    
    const startTime = performance.now();
    let success = false;

    try {
      switch (action.action) {
        case "restart":
          success = await this.restartModule(action.moduleId);
          break;
        case "cache-clear":
          success = await this.clearCache(action.moduleId);
          break;
        case "reconnect-ai":
          success = await this.reconnectAI(action.moduleId);
          break;
        case "hotfix":
          success = await this.applyHotfix(action.moduleId);
          break;
        case "fallback":
          success = await this.activateFallback(action.moduleId);
          break;
      }

      const duration = performance.now() - startTime;

      // Update action result
      action.success = success;
      action.executedAt = new Date().toISOString();

      // Store action
      this.actions.push(action);
      if (this.actions.length > 100) {
        this.actions.shift();
      }

      // Log to engine
      logsEngine.info("autonomy", `Ação autônoma executada: ${action.action}`, {
        moduleId: action.moduleId,
        success,
        duration,
        confidence: action.confidence,
        reason: action.reason
      });

      // Learn from this action
      patternRecognition.recordAction(action, success);

    } catch (error) {
      logsEngine.error("autonomy", "Falha ao executar ação autônoma", {
        action: action.action,
        moduleId: action.moduleId,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  /**
   * Restart a module
   */
  private async restartModule(moduleId: string): Promise<boolean> {
    try {
      // Mark restart time
      this.restartHistory.set(moduleId, Date.now());
      
      // Simulate module restart logic
      logger.info(`🔄 Reiniciando módulo: ${moduleId}`);
      
      // Update watchdog
      systemWatchdog.updateModuleStatus(moduleId, {
        status: "active",
        errors: [],
        responseTime: 0
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear module cache
   */
  private async clearCache(moduleId: string): Promise<boolean> {
    try {
      logger.info(`🧹 Limpando cache do módulo: ${moduleId}`);
      localStorage.removeItem(`cache_${moduleId}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Reconnect AI for module
   */
  private async reconnectAI(moduleId: string): Promise<boolean> {
    try {
      logger.info(`🧠 Reconectando IA para módulo: ${moduleId}`);
      // This would trigger AI reconnection logic
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Apply hotfix to module
   */
  private async applyHotfix(moduleId: string): Promise<boolean> {
    return hotfixManager.applyHotfix(moduleId);
  }

  /**
   * Activate fallback for module
   */
  private async activateFallback(moduleId: string): Promise<boolean> {
    try {
      logger.info(`🛡️ Ativando fallback para módulo: ${moduleId}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if module was recently restarted
   */
  private wasRecentlyRestarted(moduleId: string): boolean {
    const lastRestart = this.restartHistory.get(moduleId);
    if (!lastRestart) return false;
    
    return (Date.now() - lastRestart) < this.RESTART_COOLDOWN_MS;
  }

  /**
   * Assess module criticality
   */
  private assessCriticality(moduleId: string): "low" | "medium" | "high" | "critical" {
    const criticalModules = ["dp-intelligence", "mission-control", "fuel-optimizer"];
    const highModules = ["crew", "fleet", "real-time-workspace"];
    
    if (criticalModules.includes(moduleId)) return "critical";
    if (highModules.includes(moduleId)) return "high";
    return "medium";
  }

  /**
   * Check if module has AI dependency
   */
  private hasAIDependency(moduleId: string): boolean {
    const aiModules = ["dp-intelligence", "voice-assistant", "ai-insights", "predictive-maintenance"];
    return aiModules.includes(moduleId);
  }

  /**
   * Create autonomous action
   */
  private createAction(
    moduleId: string, 
    action: AutonomousAction["action"], 
    reason: string, 
    confidence: number
  ): AutonomousAction {
    return {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      moduleId,
      action,
      reason,
      confidence,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get recent autonomous actions
   */
  getRecentActions(limit: number = 20): AutonomousAction[] {
    return this.actions.slice(-limit);
  }

  /**
   * Get autonomy statistics
   */
  getStatistics() {
    const total = this.actions.length;
    const successful = this.actions.filter(a => a.success).length;
    const byAction = this.actions.reduce((acc, action) => {
      acc[action.action] = (acc[action.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalActions: total,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      actionBreakdown: byAction,
      averageConfidence: total > 0 
        ? this.actions.reduce((sum, a) => sum + a.confidence, 0) / total 
        : 0,
      isActive: this.isActive
    };
  }
}

// Singleton instance
export const autonomyEngine = new AutonomyEngine();
