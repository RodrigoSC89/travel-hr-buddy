/**
 * PATCH 198.0 - Autonomy Layer (Resposta Autônoma)
 * 
 * Autonomous response system that can act on failures or events without human interaction.
 * Integrates with System Watchdog and learning-core to make intelligent decisions.
 */

import { logger } from "@/lib/logger";
import { learningCore } from "./learning-core";

export interface AutonomousRule {
  id: string;
  name: string;
  description: string;
  condition: (event: AutonomousEvent) => boolean;
  action: (event: AutonomousEvent) => Promise<AutonomousActionResult>;
  priority: number;
  enabled: boolean;
}

export interface AutonomousEvent {
  type: 'module_crash' | 'high_latency' | 'api_failure' | 'error_threshold' | 'custom';
  module: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: Record<string, any>;
  timestamp: Date;
}

export interface AutonomousActionResult {
  success: boolean;
  action: string;
  description: string;
  requiresHumanReview?: boolean;
  metadata?: Record<string, any>;
}

class AutonomyLayer {
  private rules: Map<string, AutonomousRule> = new Map();
  private eventQueue: AutonomousEvent[] = [];
  private isActive = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialize default autonomous rules
   */
  private initializeDefaultRules() {
    // Rule 1: Restart module on crash
    this.addRule({
      id: 'restart-on-crash',
      name: 'Restart Module on Crash',
      description: 'Automatically restart a module that has crashed',
      priority: 10,
      enabled: true,
      condition: (event) => event.type === 'module_crash',
      action: async (event) => {
        logger.warn("[AutonomyLayer] Attempting to restart crashed module", {
          module: event.module,
        });

        try {
          // Trigger module restart
          await this.restartModule(event.module);

          // Track decision
          await learningCore.trackDecision(
            'autonomy-layer',
            'module_restart',
            { module: event.module, reason: 'crash' },
            { success: true },
            0.9
          );

          return {
            success: true,
            action: 'restart',
            description: `Module ${event.module} restarted successfully`,
          };
        } catch (error) {
          logger.error("[AutonomyLayer] Failed to restart module", {
            module: event.module,
            error,
          });

          return {
            success: false,
            action: 'restart',
            description: `Failed to restart module ${event.module}`,
            requiresHumanReview: true,
          };
        }
      },
    });

    // Rule 2: Notify on high latency
    this.addRule({
      id: 'notify-high-latency',
      name: 'Notify on High Latency',
      description: 'Send notification when latency exceeds threshold',
      priority: 5,
      enabled: true,
      condition: (event) => {
        return event.type === 'high_latency' && event.data.latency > 5000;
      },
      action: async (event) => {
        logger.warn("[AutonomyLayer] High latency detected", {
          module: event.module,
          latency: event.data.latency,
        });

        try {
          await this.sendNotification(
            'High Latency Alert',
            `Module ${event.module} has latency of ${event.data.latency}ms`,
            event.severity
          );

          return {
            success: true,
            action: 'notify',
            description: 'Notification sent for high latency',
          };
        } catch (error) {
          logger.error("[AutonomyLayer] Failed to send notification", { error });
          return {
            success: false,
            action: 'notify',
            description: 'Failed to send notification',
          };
        }
      },
    });

    // Rule 3: Auto-disable faulty feature
    this.addRule({
      id: 'disable-faulty-feature',
      name: 'Disable Faulty Feature',
      description: 'Automatically disable a feature that repeatedly fails',
      priority: 8,
      enabled: true,
      condition: (event) => {
        return (
          event.type === 'error_threshold' &&
          event.data.error_count > 10 &&
          event.severity === 'critical'
        );
      },
      action: async (event) => {
        logger.warn("[AutonomyLayer] Disabling faulty feature", {
          module: event.module,
          error_count: event.data.error_count,
        });

        try {
          await this.disableFeature(event.module, event.data.feature);

          await learningCore.trackDecision(
            'autonomy-layer',
            'feature_disable',
            { module: event.module, feature: event.data.feature },
            { success: true },
            0.85
          );

          return {
            success: true,
            action: 'disable',
            description: `Feature ${event.data.feature} in ${event.module} disabled`,
            requiresHumanReview: true,
          };
        } catch (error) {
          logger.error("[AutonomyLayer] Failed to disable feature", { error });
          return {
            success: false,
            action: 'disable',
            description: 'Failed to disable feature',
            requiresHumanReview: true,
          };
        }
      },
    });

    // Rule 4: Route fallback
    this.addRule({
      id: 'route-fallback',
      name: 'Route Fallback',
      description: 'Switch to fallback route when primary fails',
      priority: 7,
      enabled: true,
      condition: (event) => {
        return event.type === 'api_failure' && event.data.consecutive_failures > 3;
      },
      action: async (event) => {
        logger.warn("[AutonomyLayer] Activating route fallback", {
          module: event.module,
          failures: event.data.consecutive_failures,
        });

        try {
          await this.activateFallbackRoute(event.module, event.data.route);

          return {
            success: true,
            action: 'fallback',
            description: `Fallback route activated for ${event.module}`,
          };
        } catch (error) {
          logger.error("[AutonomyLayer] Failed to activate fallback", { error });
          return {
            success: false,
            action: 'fallback',
            description: 'Failed to activate fallback route',
            requiresHumanReview: true,
          };
        }
      },
    });

    // Rule 5: Cache flush
    this.addRule({
      id: 'cache-flush',
      name: 'Cache Flush',
      description: 'Flush cache when stale data is detected',
      priority: 3,
      enabled: true,
      condition: (event) => {
        return event.type === 'custom' && event.data.issue === 'stale_cache';
      },
      action: async (event) => {
        logger.info("[AutonomyLayer] Flushing cache", { module: event.module });

        try {
          await this.flushCache(event.module);

          return {
            success: true,
            action: 'cache_flush',
            description: `Cache flushed for ${event.module}`,
          };
        } catch (error) {
          logger.error("[AutonomyLayer] Failed to flush cache", { error });
          return {
            success: false,
            action: 'cache_flush',
            description: 'Failed to flush cache',
          };
        }
      },
    });
  }

  /**
   * Start autonomy layer
   */
  start() {
    if (this.isActive) {
      logger.warn("[AutonomyLayer] Already active");
      return;
    }

    this.isActive = true;
    logger.info("[AutonomyLayer] Starting Autonomy Layer");

    // Process event queue every 5 seconds
    this.processingInterval = setInterval(() => {
      this.processEventQueue();
    }, 5000);

    logger.info("[AutonomyLayer] Autonomy Layer is active");
  }

  /**
   * Stop autonomy layer
   */
  stop() {
    if (!this.isActive) return;

    this.isActive = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    logger.info("[AutonomyLayer] Autonomy Layer stopped");
  }

  /**
   * Add a new rule
   */
  addRule(rule: AutonomousRule) {
    this.rules.set(rule.id, rule);
    logger.info("[AutonomyLayer] Rule added", { ruleId: rule.id, name: rule.name });
  }

  /**
   * Remove a rule
   */
  removeRule(ruleId: string) {
    const deleted = this.rules.delete(ruleId);
    if (deleted) {
      logger.info("[AutonomyLayer] Rule removed", { ruleId });
    }
  }

  /**
   * Enable/disable a rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean) {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
      logger.info("[AutonomyLayer] Rule status changed", { ruleId, enabled });
    }
  }

  /**
   * Queue an event for processing
   */
  async handleEvent(event: AutonomousEvent): Promise<void> {
    logger.debug("[AutonomyLayer] Event queued", {
      type: event.type,
      module: event.module,
      severity: event.severity,
    });

    this.eventQueue.push(event);

    // Track event in learning core
    await learningCore.trackSystemEvent(
      'autonomous_event',
      'autonomy-layer',
      {
        event_type: event.type,
        module: event.module,
        severity: event.severity,
        data: event.data,
      }
    );
  }

  /**
   * Process queued events
   */
  private async processEventQueue() {
    if (this.eventQueue.length === 0) return;

    const event = this.eventQueue.shift();
    if (!event) return;

    logger.info("[AutonomyLayer] Processing event", {
      type: event.type,
      module: event.module,
    });

    // Find matching rules
    const matchingRules = Array.from(this.rules.values())
      .filter((rule) => rule.enabled && rule.condition(event))
      .sort((a, b) => b.priority - a.priority);

    if (matchingRules.length === 0) {
      logger.debug("[AutonomyLayer] No matching rules for event", {
        type: event.type,
      });
      return;
    }

    // Execute highest priority rule
    const rule = matchingRules[0];
    logger.info("[AutonomyLayer] Executing rule", {
      ruleId: rule.id,
      ruleName: rule.name,
    });

    try {
      const result = await rule.action(event);

      logger.info("[AutonomyLayer] Rule execution completed", {
        ruleId: rule.id,
        success: result.success,
        action: result.action,
      });

      // Track result
      await learningCore.trackDecision(
        'autonomy-layer',
        'rule_execution',
        { rule_id: rule.id, event_type: event.type },
        { success: result.success, action: result.action },
        result.success ? 0.9 : 0.3
      );

      if (result.requiresHumanReview) {
        await this.requestHumanReview(event, result);
      }
    } catch (error) {
      logger.error("[AutonomyLayer] Rule execution failed", {
        ruleId: rule.id,
        error,
      });

      await learningCore.trackModuleError(
        'autonomy-layer',
        `Rule execution failed: ${rule.id}`,
        error instanceof Error ? error.stack : undefined
      );
    }
  }

  /**
   * Restart a module
   */
  private async restartModule(moduleName: string): Promise<void> {
    logger.info("[AutonomyLayer] Restarting module", { module: moduleName });
    
    // Trigger module reload by dispatching custom event
    window.dispatchEvent(
      new CustomEvent('module-restart', { detail: { module: moduleName } })
    );

    // Wait for restart
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  /**
   * Send notification
   */
  private async sendNotification(
    title: string,
    message: string,
    severity: string
  ): Promise<void> {
    logger.info("[AutonomyLayer] Sending notification", { title, severity });

    // Dispatch notification event
    window.dispatchEvent(
      new CustomEvent('autonomous-notification', {
        detail: { title, message, severity },
      })
    );
  }

  /**
   * Disable a feature
   */
  private async disableFeature(moduleName: string, feature: string): Promise<void> {
    logger.warn("[AutonomyLayer] Disabling feature", { module: moduleName, feature });

    // Store in localStorage
    const disabledFeatures = JSON.parse(
      localStorage.getItem('disabled_features') || '{}'
    );
    
    if (!disabledFeatures[moduleName]) {
      disabledFeatures[moduleName] = [];
    }
    
    if (!disabledFeatures[moduleName].includes(feature)) {
      disabledFeatures[moduleName].push(feature);
    }

    localStorage.setItem('disabled_features', JSON.stringify(disabledFeatures));

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent('feature-disabled', {
        detail: { module: moduleName, feature },
      })
    );
  }

  /**
   * Activate fallback route
   */
  private async activateFallbackRoute(moduleName: string, route: string): Promise<void> {
    logger.info("[AutonomyLayer] Activating fallback route", {
      module: moduleName,
      route,
    });

    // Store fallback state
    const fallbacks = JSON.parse(localStorage.getItem('active_fallbacks') || '{}');
    fallbacks[moduleName] = { route, activated_at: new Date().toISOString() };
    localStorage.setItem('active_fallbacks', JSON.stringify(fallbacks));

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent('fallback-activated', {
        detail: { module: moduleName, route },
      })
    );
  }

  /**
   * Flush cache
   */
  private async flushCache(moduleName: string): Promise<void> {
    logger.info("[AutonomyLayer] Flushing cache", { module: moduleName });

    // Clear cache for module
    const cacheKey = `cache_${moduleName}`;
    localStorage.removeItem(cacheKey);

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent('cache-flushed', { detail: { module: moduleName } })
    );
  }

  /**
   * Request human review
   */
  private async requestHumanReview(
    event: AutonomousEvent,
    result: AutonomousActionResult
  ): Promise<void> {
    logger.warn("[AutonomyLayer] Human review requested", {
      event_type: event.type,
      module: event.module,
      action: result.action,
    });

    // Store review request
    const reviews = JSON.parse(localStorage.getItem('review_requests') || '[]');
    reviews.push({
      event,
      result,
      requested_at: new Date().toISOString(),
      status: 'pending',
    });
    localStorage.setItem('review_requests', JSON.stringify(reviews));

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent('human-review-requested', {
        detail: { event, result },
      })
    );
  }

  /**
   * Get all rules
   */
  getRules(): AutonomousRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get rule by ID
   */
  getRule(ruleId: string): AutonomousRule | undefined {
    return this.rules.get(ruleId);
  }
}

// Singleton instance
export const autonomyLayer = new AutonomyLayer();

export default autonomyLayer;
