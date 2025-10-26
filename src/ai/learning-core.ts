/**
 * PATCH 196.0 - Learning Core (IA Aprendente)
 * 
 * Tracks system usage, logs, and decisions to train AI behavior over time.
 * This module collects interaction data, system events, and errors to generate
 * training datasets for continuous AI improvement.
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

export interface LearningConfig {
  learning_enabled: boolean;
  retention_days: number;
}

export interface LearningEvent {
  id?: string;
  event_type: 'interaction' | 'system_event' | 'module_error' | 'decision' | 'user_action';
  module_name: string;
  user_id?: string | null;
  tenant_id?: string | null;
  event_data: Record<string, any>;
  context: Record<string, any>;
  outcome?: 'success' | 'failure' | 'partial' | null;
  timestamp?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface TrainingDataset {
  version: string;
  generated_at: string;
  total_events: number;
  event_types: Record<string, number>;
  patterns: UsagePattern[];
  events: LearningEvent[];
}

export interface UsagePattern {
  pattern_type: string;
  frequency: number;
  module: string;
  confidence: number;
  description: string;
  examples: any[];
}

class LearningCore {
  private config: LearningConfig = {
    learning_enabled: true,
    retention_days: 90,
  };

  private eventBuffer: LearningEvent[] = [];
  private bufferSize = 100;
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<LearningConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    if (this.config.learning_enabled) {
      this.initialize();
    }
  }

  /**
   * Initialize learning core with auto-flush
   */
  private initialize() {
    logger.info("[LearningCore] Initializing learning core", {
      retention_days: this.config.retention_days,
    });

    // Auto-flush buffer every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushBuffer();
    }, 30000);
  }

  /**
   * Track user interaction with the system
   */
  async trackInteraction(
    moduleName: string,
    action: string,
    userId?: string,
    additionalData?: Record<string, any>
  ): Promise<void> {
    if (!this.config.learning_enabled) return;

    const event: LearningEvent = {
      event_type: 'interaction',
      module_name: moduleName,
      user_id: userId || null,
      event_data: {
        action,
        ...additionalData,
      },
      context: {
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      },
      timestamp: new Date().toISOString(),
    };

    await this.logEvent(event);
  }

  /**
   * Track system events (startup, shutdown, errors)
   */
  async trackSystemEvent(
    eventName: string,
    moduleName: string,
    eventData: Record<string, any>,
    outcome?: 'success' | 'failure'
  ): Promise<void> {
    if (!this.config.learning_enabled) return;

    const event: LearningEvent = {
      event_type: 'system_event',
      module_name: moduleName,
      event_data: {
        event_name: eventName,
        ...eventData,
      },
      context: {
        timestamp: new Date().toISOString(),
      },
      outcome: outcome || null,
      timestamp: new Date().toISOString(),
    };

    await this.logEvent(event);
  }

  /**
   * Track module-level errors for learning and improvement
   */
  async trackModuleError(
    moduleName: string,
    errorMessage: string,
    errorStack?: string,
    userId?: string
  ): Promise<void> {
    if (!this.config.learning_enabled) return;

    const event: LearningEvent = {
      event_type: 'module_error',
      module_name: moduleName,
      user_id: userId || null,
      event_data: {
        error_message: errorMessage,
        error_stack: errorStack,
      },
      context: {
        timestamp: new Date().toISOString(),
        url: window.location.href,
      },
      outcome: 'failure',
      timestamp: new Date().toISOString(),
    };

    await this.logEvent(event);
    
    logger.error("[LearningCore] Module error tracked", {
      module: moduleName,
      error: errorMessage,
    });
  }

  /**
   * Track AI decisions for training
   */
  async trackDecision(
    moduleName: string,
    decisionType: string,
    input: Record<string, any>,
    output: Record<string, any>,
    confidence?: number
  ): Promise<void> {
    if (!this.config.learning_enabled) return;

    const event: LearningEvent = {
      event_type: 'decision',
      module_name: moduleName,
      event_data: {
        decision_type: decisionType,
        input,
        output,
        confidence: confidence || 0,
      },
      context: {
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    await this.logEvent(event);
  }

  /**
   * Log event to buffer and sync with Supabase
   */
  private async logEvent(event: LearningEvent): Promise<void> {
    try {
      // Add to buffer
      this.eventBuffer.push(event);

      // Flush if buffer is full
      if (this.eventBuffer.length >= this.bufferSize) {
        await this.flushBuffer();
      }
    } catch (error) {
      logger.error("[LearningCore] Failed to log event", { error });
    }
  }

  /**
   * Flush event buffer to Supabase
   */
  private async flushBuffer(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const eventsToFlush = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      const { error } = await supabase
        .from('learning_events')
        .insert(eventsToFlush);

      if (error) {
        logger.error("[LearningCore] Failed to flush events to Supabase", { error });
        // Re-add events to buffer on failure
        this.eventBuffer.push(...eventsToFlush);
      } else {
        logger.debug("[LearningCore] Flushed events to Supabase", {
          count: eventsToFlush.length,
        });
      }
    } catch (error) {
      logger.error("[LearningCore] Exception during buffer flush", { error });
      // Re-add events to buffer on exception
      this.eventBuffer.push(...eventsToFlush);
    }
  }

  /**
   * Generate training data from usage patterns
   */
  async generateTrainingData(
    startDate?: string,
    endDate?: string
  ): Promise<TrainingDataset | null> {
    try {
      logger.info("[LearningCore] Generating training data", { startDate, endDate });

      let query = supabase
        .from('learning_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data: events, error } = await query;

      if (error) {
        logger.error("[LearningCore] Failed to fetch events for training", { error });
        return null;
      }

      if (!events || events.length === 0) {
        logger.warn("[LearningCore] No events found for training data generation");
        return null;
      }

      // Analyze patterns
      const patterns = this.analyzeUsagePatterns(events);
      const eventTypeCounts = this.countEventTypes(events);

      const dataset: TrainingDataset = {
        version: '1.0',
        generated_at: new Date().toISOString(),
        total_events: events.length,
        event_types: eventTypeCounts,
        patterns,
        events: events as LearningEvent[],
      };

      logger.info("[LearningCore] Training data generated", {
        total_events: events.length,
        patterns_found: patterns.length,
      });

      return dataset;
    } catch (error) {
      logger.error("[LearningCore] Failed to generate training data", { error });
      return null;
    }
  }

  /**
   * Analyze usage patterns from events
   */
  private analyzeUsagePatterns(events: any[]): UsagePattern[] {
    const patterns: UsagePattern[] = [];
    const moduleInteractions: Record<string, any[]> = {};

    // Group by module
    events.forEach(event => {
      if (!moduleInteractions[event.module_name]) {
        moduleInteractions[event.module_name] = [];
      }
      moduleInteractions[event.module_name].push(event);
    });

    // Analyze each module
    Object.entries(moduleInteractions).forEach(([module, moduleEvents]) => {
      const actionFrequency: Record<string, number> = {};

      moduleEvents.forEach(event => {
        const action = event.event_data?.action || 'unknown';
        actionFrequency[action] = (actionFrequency[action] || 0) + 1;
      });

      // Find top patterns
      Object.entries(actionFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .forEach(([action, count]) => {
          patterns.push({
            pattern_type: 'frequent_action',
            frequency: count,
            module,
            confidence: count / moduleEvents.length,
            description: `Users frequently perform "${action}" in ${module}`,
            examples: moduleEvents
              .filter(e => e.event_data?.action === action)
              .slice(0, 3)
              .map(e => e.event_data),
          });
        });
    });

    return patterns;
  }

  /**
   * Count event types for statistics
   */
  private countEventTypes(events: any[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    events.forEach(event => {
      const type = event.event_type || 'unknown';
      counts[type] = (counts[type] || 0) + 1;
    });

    return counts;
  }

  /**
   * Export training dataset as JSON
   */
  async exportTrainingDataset(
    startDate?: string,
    endDate?: string,
    filename?: string
  ): Promise<string | null> {
    const dataset = await this.generateTrainingData(startDate, endDate);
    
    if (!dataset) {
      return null;
    }

    const json = JSON.stringify(dataset, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `training-data-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    logger.info("[LearningCore] Training dataset exported", { filename: link.download });
    
    return json;
  }

  /**
   * Clean old events based on retention policy
   */
  async cleanOldEvents(): Promise<number> {
    try {
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - this.config.retention_days);

      const { data, error } = await supabase
        .from('learning_events')
        .delete()
        .lt('created_at', retentionDate.toISOString())
        .select();

      if (error) {
        logger.error("[LearningCore] Failed to clean old events", { error });
        return 0;
      }

      const deletedCount = data?.length || 0;
      logger.info("[LearningCore] Cleaned old events", {
        count: deletedCount,
        retention_date: retentionDate.toISOString(),
      });

      return deletedCount;
    } catch (error) {
      logger.error("[LearningCore] Exception during event cleanup", { error });
      return 0;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LearningConfig>): void {
    this.config = { ...this.config, ...config };
    
    logger.info("[LearningCore] Configuration updated", this.config);

    if (!this.config.learning_enabled && this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    } else if (this.config.learning_enabled && !this.flushInterval) {
      this.initialize();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): LearningConfig {
    return { ...this.config };
  }

  /**
   * Shutdown learning core
   */
  async shutdown(): Promise<void> {
    logger.info("[LearningCore] Shutting down learning core");
    
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    // Flush remaining events
    await this.flushBuffer();
  }
}

// Singleton instance
export const learningCore = new LearningCore();

export default learningCore;
