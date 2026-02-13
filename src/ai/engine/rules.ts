/**
 * PATCH 198.0 - Rules Manager
 * 
 * Centralized rule management for the Autonomy Layer
 */

import { AutonomousRule, AutonomousEvent, AutonomousActionResult } from "../autonomy-layer";
import { logger } from "@/lib/logger";

export interface RuleTemplate {
  name: string;
  description: string;
  conditionBuilder: (params: Record<string, unknown>) => (event: AutonomousEvent) => boolean;
  actionBuilder: (params: Record<string, unknown>) => (event: AutonomousEvent) => Promise<AutonomousActionResult>;
}

class RulesManager {
  private templates: Map<string, RuleTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize rule templates
   */
  private initializeTemplates() {
    // Error threshold template
    this.templates.set("error-threshold", {
      name: "Error Threshold",
      description: "Trigger action when error count exceeds threshold",
      conditionBuilder: (params) => (event) => {
        return (
          event.type === "error_threshold" &&
          Number(event.data.error_count) >= (Number(params.threshold) || 5)
        );
      },
      actionBuilder: (params) => async (event) => {
        logger.warn("[RulesManager] Error threshold exceeded", {
          module: event.module,
          count: Number(event.data.error_count),
          threshold: Number(params.threshold),
        });

        return {
          success: true,
          action: String(params.action || "notify"),
          description: `Error threshold exceeded: ${Number(event.data.error_count)} errors`,
        };
      },
    });

    // Latency threshold template
    this.templates.set("latency-threshold", {
      name: "Latency Threshold",
      description: "Trigger action when latency exceeds threshold",
      conditionBuilder: (params) => (event) => {
        return (
          event.type === "high_latency" &&
          Number(event.data.latency) >= (Number(params.threshold_ms) || 3000)
        );
      },
      actionBuilder: (params) => async (event) => {
        logger.warn("[RulesManager] Latency threshold exceeded", {
          module: event.module,
          latency: Number(event.data.latency),
          threshold: Number(params.threshold_ms),
        });

        return {
          success: true,
          action: String(params.action || "notify"),
          description: `Latency threshold exceeded: ${Number(event.data.latency)}ms`,
        };
      },
    });

    // Memory threshold template
    this.templates.set("memory-threshold", {
      name: "Memory Threshold",
      description: "Trigger action when memory usage exceeds threshold",
      conditionBuilder: (params) => (event) => {
        return (
          event.type === "custom" &&
          event.data.metric === "memory" &&
          Number(event.data.usage) >= (Number(params.threshold_mb) || 512)
        );
      },
      actionBuilder: (params) => async (event) => {
        logger.warn("[RulesManager] Memory threshold exceeded", {
          module: event.module,
          usage: Number(event.data.usage),
          threshold: Number(params.threshold_mb),
        });

        return {
          success: true,
          action: String(params.action || "cleanup"),
          description: `Memory threshold exceeded: ${Number(event.data.usage)}MB`,
        };
      },
    });

    // Rate limit template
    this.templates.set("rate-limit", {
      name: "Rate Limit",
      description: "Trigger action when request rate exceeds threshold",
      conditionBuilder: (params) => (event) => {
        return (
          event.type === "custom" &&
          event.data.metric === "request_rate" &&
          Number(event.data.rate) >= (Number(params.max_requests_per_minute) || 100)
        );
      },
      actionBuilder: (params) => async (event) => {
        logger.warn("[RulesManager] Rate limit exceeded", {
          module: event.module,
          rate: Number(event.data.rate),
          limit: Number(params.max_requests_per_minute),
        });

        return {
          success: true,
          action: String(params.action || "throttle"),
          description: `Rate limit exceeded: ${Number(event.data.rate)} req/min`,
        };
      },
    });
  }

  /**
   * Create rule from template
   */
  createRuleFromTemplate(
    templateId: string,
    ruleId: string,
    params: Record<string, unknown>,
    priority: number = 5
  ): AutonomousRule | null {
    const template = this.templates.get(templateId);
    
    if (!template) {
      logger.error("[RulesManager] Template not found", { templateId });
      return null;
    }

    const rule: AutonomousRule = {
      id: ruleId,
      name: String(params.name || template.name),
      description: String(params.description || template.description),
      condition: template.conditionBuilder(params),
      action: template.actionBuilder(params),
      priority,
      enabled: true,
    };

    logger.info("[RulesManager] Rule created from template", {
      templateId,
      ruleId,
      name: rule.name,
    });

    return rule;
  }

  /**
   * Get all templates
   */
  getTemplates(): RuleTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): RuleTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Add custom template
   */
  addTemplate(templateId: string, template: RuleTemplate) {
    this.templates.set(templateId, template);
    logger.info("[RulesManager] Template added", { templateId, name: template.name });
  }

  /**
   * Validate rule configuration
   */
  validateRule(rule: AutonomousRule): boolean {
    if (!rule.id || !rule.name || !rule.condition || !rule.action) {
      logger.error("[RulesManager] Invalid rule configuration", { ruleId: rule.id });
      return false;
    }

    if (rule.priority < 0 || rule.priority > 10) {
      logger.error("[RulesManager] Invalid priority", {
        ruleId: rule.id,
        priority: rule.priority,
      });
      return false;
    }

    return true;
  }
}

export const rulesManager = new RulesManager();
export default rulesManager;
