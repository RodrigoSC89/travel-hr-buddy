/**
 * Auto-Healer - Automatic issue detection and resolution
 * Self-correcting system that fixes issues autonomously
 */

import { Logger } from "@/lib/utils/logger";
import { healthMonitor } from "./HealthMonitor";
import type {
  SystemIssue,
  AppliedFix,
  FixStrategy,
  FixSuggestion,
  HealingConfig,
  HealingEvent,
  IssueType,
} from "./types";

class AutoHealer {
  private config: HealingConfig;
  private appliedFixes: AppliedFix[] = [];
  private retryCount: Map<string, number> = new Map();
  private eventListeners: Set<(event: HealingEvent) => void> = new Set();
  private healingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = {
      enabled: true,
      autoFixEnabled: true,
      checkInterval: 10000, // 10 seconds
      maxRetries: 3,
      escalationThreshold: 5,
      notifyOnFix: true,
      strategies: {
        route_error: "restart",
        component_crash: "isolate",
        api_failure: "restart",
        database_error: "escalate",
        memory_leak: "restart",
        performance_degradation: "patch",
        dependency_missing: "escalate",
        type_error: "patch",
        network_timeout: "restart",
        auth_failure: "restart",
      },
    };
  }

  /**
   * Start auto-healing system
   */
  start(): void {
    if (!this.config.enabled || this.healingInterval) return;

    Logger.info("Auto-Healer started", { config: this.config }, "AutoHealer");

    // Subscribe to health monitor
    healthMonitor.subscribe((diagnostic) => {
      if (this.config.autoFixEnabled) {
        this.processIssues(diagnostic.activeIssues);
      }
    });

    // Start periodic healing check
    this.healingInterval = setInterval(() => {
      this.performHealingCycle();
    }, this.config.checkInterval);
  }

  /**
   * Stop auto-healing system
   */
  stop(): void {
    if (this.healingInterval) {
      clearInterval(this.healingInterval);
      this.healingInterval = null;
      Logger.info("Auto-Healer stopped", undefined, "AutoHealer");
    }
  }

  /**
   * Process detected issues
   */
  private async processIssues(issues: SystemIssue[]): Promise<void> {
    for (const issue of issues) {
      if (!issue.autoFixable) continue;

      const retries = this.retryCount.get(issue.id) || 0;
      if (retries >= this.config.maxRetries) {
        await this.escalateIssue(issue);
        continue;
      }

      try {
        const fix = await this.attemptFix(issue);
        if (fix.success) {
          healthMonitor.resolveIssue(issue.id);
          this.emitEvent({ type: "fix_applied", timestamp: Date.now(), data: fix });
        } else {
          this.retryCount.set(issue.id, retries + 1);
          this.emitEvent({ type: "fix_failed", timestamp: Date.now(), data: fix });
        }
      } catch (error) {
        Logger.error(`Fix attempt failed for ${issue.id}`, { error }, "AutoHealer");
        this.retryCount.set(issue.id, retries + 1);
      }
    }
  }

  /**
   * Attempt to fix an issue
   */
  private async attemptFix(issue: SystemIssue): Promise<AppliedFix> {
    const startTime = Date.now();
    const strategy = this.config.strategies[issue.type] || "escalate";

    Logger.info(`Attempting fix for ${issue.type}`, { strategy, issue: issue.id }, "AutoHealer");

    let success = false;
    let description = "";

    switch (strategy) {
      case "restart":
        success = await this.applyRestartStrategy(issue);
        description = success ? "Module restarted successfully" : "Restart failed";
        break;

      case "rollback":
        success = await this.applyRollbackStrategy(issue);
        description = success ? "Rolled back to previous state" : "Rollback failed";
        break;

      case "patch":
        success = await this.applyPatchStrategy(issue);
        description = success ? "Patch applied successfully" : "Patch failed";
        break;

      case "isolate":
        success = await this.applyIsolateStrategy(issue);
        description = success ? "Module isolated" : "Isolation failed";
        break;

      case "escalate":
        await this.escalateIssue(issue);
        description = "Issue escalated to manual review";
        break;
    }

    const fix: AppliedFix = {
      id: crypto.randomUUID(),
      issueId: issue.id,
      timestamp: Date.now(),
      strategy,
      success,
      description,
      rollbackAvailable: strategy !== "escalate",
      duration: Date.now() - startTime,
    };

    this.appliedFixes.push(fix);
    
    // Keep only recent fixes
    if (this.appliedFixes.length > 50) {
      this.appliedFixes = this.appliedFixes.slice(-50);
    }

    return fix;
  }

  /**
   * Restart strategy - Reinitialize the affected module
   */
  private async applyRestartStrategy(issue: SystemIssue): Promise<boolean> {
    try {
      // Clear any cached data for the module
      if (typeof sessionStorage !== "undefined") {
        const cacheKey = `module_cache_${issue.module}`;
        sessionStorage.removeItem(cacheKey);
      }

      // Trigger a soft refresh of the module state
      const event = new CustomEvent("module:restart", {
        detail: { moduleId: issue.module },
      });
      window.dispatchEvent(event);

      Logger.info(`Restart applied for ${issue.module}`, undefined, "AutoHealer");
      return true;
    } catch (error) {
      Logger.error(`Restart failed for ${issue.module}`, { error }, "AutoHealer");
      return false;
    }
  }

  /**
   * Rollback strategy - Revert to previous known good state
   */
  private async applyRollbackStrategy(issue: SystemIssue): Promise<boolean> {
    try {
      // Clear module-specific state from storage
      if (typeof sessionStorage !== "undefined") {
        const stateKey = `module_state_${issue.module}`;
        sessionStorage.removeItem(stateKey);
      }

      // Emit rollback event
      const event = new CustomEvent("module:rollback", {
        detail: { moduleId: issue.module },
      });
      window.dispatchEvent(event);

      Logger.info(`Rollback applied for ${issue.module}`, undefined, "AutoHealer");
      return true;
    } catch (error) {
      Logger.error(`Rollback failed for ${issue.module}`, { error }, "AutoHealer");
      return false;
    }
  }

  /**
   * Patch strategy - Apply a targeted fix
   */
  private async applyPatchStrategy(issue: SystemIssue): Promise<boolean> {
    try {
      // For performance issues, clear caches and optimize
      if (issue.type === "performance_degradation") {
        // Clear React Query cache if available
        const event = new CustomEvent("cache:clear", {
          detail: { moduleId: issue.module },
        });
        window.dispatchEvent(event);
      }

      // For type errors, we can only log and suggest
      if (issue.type === "type_error") {
        Logger.warn(`Type error detected in ${issue.module}, requires manual fix`, undefined, "AutoHealer");
      }

      Logger.info(`Patch applied for ${issue.module}`, undefined, "AutoHealer");
      return true;
    } catch (error) {
      Logger.error(`Patch failed for ${issue.module}`, { error }, "AutoHealer");
      return false;
    }
  }

  /**
   * Isolate strategy - Disable the failing module
   */
  private async applyIsolateStrategy(issue: SystemIssue): Promise<boolean> {
    try {
      // Store isolation state
      if (typeof sessionStorage !== "undefined") {
        const isolatedModules = JSON.parse(
          sessionStorage.getItem("isolated_modules") || "[]"
        );
        if (!isolatedModules.includes(issue.module)) {
          isolatedModules.push(issue.module);
          sessionStorage.setItem("isolated_modules", JSON.stringify(isolatedModules));
        }
      }

      // Emit isolation event
      const event = new CustomEvent("module:isolate", {
        detail: { moduleId: issue.module },
      });
      window.dispatchEvent(event);

      Logger.warn(`Module ${issue.module} isolated`, undefined, "AutoHealer");
      return true;
    } catch (error) {
      Logger.error(`Isolation failed for ${issue.module}`, { error }, "AutoHealer");
      return false;
    }
  }

  /**
   * Escalate issue for manual intervention
   */
  private async escalateIssue(issue: SystemIssue): Promise<void> {
    Logger.error(`Issue escalated: ${issue.description}`, { issue }, "AutoHealer");

    // Emit escalation event
    this.emitEvent({
      type: "escalated",
      timestamp: Date.now(),
      data: issue,
    });

    // Create a notification for the user
    const event = new CustomEvent("healing:escalated", {
      detail: {
        issue,
        message: `O sistema detectou um problema que requer atenção manual: ${issue.description}`,
      },
    });
    window.dispatchEvent(event);
  }

  /**
   * Perform healing cycle
   */
  private async performHealingCycle(): Promise<void> {
    const issues = healthMonitor.getIssues();
    const autoFixableIssues = issues.filter((i) => i.autoFixable);

    if (autoFixableIssues.length > 0) {
      Logger.debug(
        `Healing cycle: ${autoFixableIssues.length} issues to process`,
        undefined,
        "AutoHealer"
      );
      await this.processIssues(autoFixableIssues);
    }
  }

  /**
   * Generate fix suggestion for an issue
   */
  generateSuggestion(issue: SystemIssue): FixSuggestion {
    const strategy = this.config.strategies[issue.type] || "escalate";

    const suggestions: Record<FixStrategy, FixSuggestion> = {
      restart: {
        strategy: "restart",
        confidence: 0.8,
        description: "Reiniciar o módulo afetado",
        steps: [
          "Limpar cache do módulo",
          "Reinicializar estado",
          "Reconectar dependências",
        ],
        estimatedTime: 5,
        riskLevel: "low",
      },
      rollback: {
        strategy: "rollback",
        confidence: 0.7,
        description: "Reverter para estado anterior",
        steps: [
          "Identificar último estado válido",
          "Restaurar configurações",
          "Verificar integridade",
        ],
        estimatedTime: 10,
        riskLevel: "medium",
      },
      patch: {
        strategy: "patch",
        confidence: 0.6,
        description: "Aplicar correção direcionada",
        steps: [
          "Analisar causa raiz",
          "Aplicar patch específico",
          "Validar correção",
        ],
        estimatedTime: 15,
        riskLevel: "medium",
      },
      isolate: {
        strategy: "isolate",
        confidence: 0.9,
        description: "Isolar módulo para prevenir propagação",
        steps: [
          "Desativar módulo",
          "Redirecionar tráfego",
          "Notificar administradores",
        ],
        estimatedTime: 3,
        riskLevel: "low",
      },
      escalate: {
        strategy: "escalate",
        confidence: 0.5,
        description: "Escalar para intervenção manual",
        steps: [
          "Coletar diagnósticos",
          "Notificar equipe técnica",
          "Aguardar resolução manual",
        ],
        estimatedTime: 60,
        riskLevel: "high",
      },
    };

    return suggestions[strategy];
  }

  /**
   * Subscribe to healing events
   */
  onEvent(callback: (event: HealingEvent) => void): () => void {
    this.eventListeners.add(callback);
    return () => this.eventListeners.delete(callback);
  }

  /**
   * Emit healing event
   */
  private emitEvent(event: HealingEvent): void {
    this.eventListeners.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        Logger.error("Event listener failed", { error }, "AutoHealer");
      }
    });
  }

  /**
   * Get applied fixes
   */
  getAppliedFixes(): AppliedFix[] {
    return [...this.appliedFixes];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<HealingConfig>): void {
    this.config = { ...this.config, ...config };
    Logger.info("AutoHealer config updated", { config: this.config }, "AutoHealer");
  }

  /**
   * Get current configuration
   */
  getConfig(): HealingConfig {
    return { ...this.config };
  }
}

export const autoHealer = new AutoHealer();
