/**
 * PATCH 208.0 - Adaptive Metrics Engine
 * Auto-adjusts thresholds, timeouts, and preferences based on behavior logs
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface AdaptiveParameter {
  name: string;
  currentValue: number;
  defaultValue: number;
  minValue: number;
  maxValue: number;
  unit: string;
  lastAdjusted: Date;
  adjustmentCount: number;
}

export interface MetricHistory {
  timestamp: Date;
  value: number;
  performance: number;
}

export interface ParameterConfig {
  latencyThreshold: AdaptiveParameter;
  retryAttempts: AdaptiveParameter;
  timeoutDuration: AdaptiveParameter;
  cacheExpiry: AdaptiveParameter;
  maxConcurrency: AdaptiveParameter;
}

class AdaptiveMetricsEngine {
  private parameters: Map<string, AdaptiveParameter> = new Map();
  private historySize = 100;
  private adjustmentThreshold = 0.15; // 15% delta triggers adjustment
  private isActive = false;
  private adjustmentInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeParameters();
  }

  /**
   * Initialize default parameters
   */
  private initializeParameters(): void {
    const defaults: AdaptiveParameter[] = [
      {
        name: 'latencyThreshold',
        currentValue: 1000,
        defaultValue: 1000,
        minValue: 200,
        maxValue: 5000,
        unit: 'ms',
        lastAdjusted: new Date(),
        adjustmentCount: 0,
      },
      {
        name: 'retryAttempts',
        currentValue: 3,
        defaultValue: 3,
        minValue: 1,
        maxValue: 10,
        unit: 'attempts',
        lastAdjusted: new Date(),
        adjustmentCount: 0,
      },
      {
        name: 'timeoutDuration',
        currentValue: 30000,
        defaultValue: 30000,
        minValue: 5000,
        maxValue: 120000,
        unit: 'ms',
        lastAdjusted: new Date(),
        adjustmentCount: 0,
      },
      {
        name: 'cacheExpiry',
        currentValue: 300,
        defaultValue: 300,
        minValue: 60,
        maxValue: 3600,
        unit: 'seconds',
        lastAdjusted: new Date(),
        adjustmentCount: 0,
      },
      {
        name: 'maxConcurrency',
        currentValue: 10,
        defaultValue: 10,
        minValue: 1,
        maxValue: 50,
        unit: 'connections',
        lastAdjusted: new Date(),
        adjustmentCount: 0,
      },
    ];

    defaults.forEach(param => {
      this.parameters.set(param.name, param);
    });
  }

  /**
   * Start adaptive engine
   */
  start(): void {
    if (this.isActive) {
      logger.warn('[AdaptiveMetrics] Already running');
      return;
    }

    this.isActive = true;
    logger.info('[AdaptiveMetrics] Starting Adaptive Metrics Engine...');

    // Load saved parameters from database
    this.loadParameters();

    // Adjust parameters periodically
    this.adjustmentInterval = setInterval(() => {
      this.evaluateAndAdjust();
    }, 60000); // Every minute

    logger.info('[AdaptiveMetrics] Adaptive Metrics Engine is active');
  }

  /**
   * Stop adaptive engine
   */
  stop(): void {
    if (!this.isActive) return;

    this.isActive = false;
    if (this.adjustmentInterval) {
      clearInterval(this.adjustmentInterval);
      this.adjustmentInterval = null;
    }

    logger.info('[AdaptiveMetrics] Adaptive Metrics Engine stopped');
  }

  /**
   * Load parameters from database
   */
  private async loadParameters(): Promise<void> {
    try {
      const { data } = await supabase
        .from('adaptive_parameters')
        .select('*')
        .order('updated_at', { ascending: false });

      if (data) {
        data.forEach((param: any) => {
          const existing = this.parameters.get(param.parameter_name);
          if (existing) {
            existing.currentValue = param.current_value;
            existing.adjustmentCount = param.adjustment_count || 0;
            existing.lastAdjusted = new Date(param.updated_at);
          }
        });
        logger.info('[AdaptiveMetrics] Loaded parameters from database');
      }
    } catch (error) {
      logger.error('[AdaptiveMetrics] Failed to load parameters:', error);
    }
  }

  /**
   * Evaluate and adjust parameters
   */
  private async evaluateAndAdjust(): Promise<void> {
    if (!this.isActive) return;

    logger.info('[AdaptiveMetrics] Evaluating parameters for adjustment...');

    for (const [name, param] of this.parameters) {
      try {
        await this.adjustParameter(name, param);
      } catch (error) {
        logger.error(`[AdaptiveMetrics] Failed to adjust ${name}:`, error);
      }
    }
  }

  /**
   * Adjust a specific parameter
   */
  private async adjustParameter(name: string, param: AdaptiveParameter): Promise<void> {
    // Fetch recent metric history
    const history = await this.fetchMetricHistory(name);
    
    if (history.length < 10) {
      logger.debug(`[AdaptiveMetrics] Insufficient data for ${name}`);
      return;
    }

    // Calculate recommended value
    const recommended = this.calculateRecommendedValue(name, param, history);

    // Calculate delta from default
    const deltaFromDefault = Math.abs(recommended - param.defaultValue) / param.defaultValue;

    // Adjust if delta exceeds threshold
    if (deltaFromDefault > this.adjustmentThreshold && recommended !== param.currentValue) {
      const oldValue = param.currentValue;
      param.currentValue = recommended;
      param.lastAdjusted = new Date();
      param.adjustmentCount++;

      logger.info(
        `[AdaptiveMetrics] Adjusted ${name}: ${oldValue}${param.unit} → ${recommended}${param.unit} ` +
        `(${(deltaFromDefault * 100).toFixed(1)}% from default)`
      );

      // Save adjustment
      await this.saveParameter(param);

      // Track performance impact
      await this.trackPerformanceImpact(name, oldValue, recommended);
    }
  }

  /**
   * Fetch metric history for a parameter
   */
  private async fetchMetricHistory(paramName: string): Promise<MetricHistory[]> {
    try {
      const { data } = await supabase
        .from('metric_history')
        .select('*')
        .eq('parameter_name', paramName)
        .order('timestamp', { ascending: false })
        .limit(this.historySize);

      return (data || []).map((d: any) => ({
        timestamp: d.timestamp ? new Date(d.timestamp) : new Date(),
        value: d.value as number,
        performance: (d.performance_score ?? 0) as number,
      }));
    } catch (error) {
      logger.error(`[AdaptiveMetrics] Failed to fetch history for ${paramName}:`, error);
      return [];
    }
  }

  /**
   * Calculate recommended value based on history
   */
  private calculateRecommendedValue(
    name: string,
    param: AdaptiveParameter,
    history: MetricHistory[]
  ): number {
    // Calculate statistics from history
    const values = history.map(h => h.value);
    const performances = history.map(h => h.performance);

    const avgValue = values.reduce((sum, v) => sum + v, 0) / values.length;
    const avgPerformance = performances.reduce((sum, p) => sum + p, 0) / performances.length;

    let recommended: number;

    switch (name) {
      case 'latencyThreshold':
        // Increase threshold if performance is poor
        recommended = avgPerformance < 0.7 
          ? Math.min(param.currentValue * 1.2, param.maxValue)
          : Math.max(param.currentValue * 0.9, param.minValue);
        break;

      case 'retryAttempts':
        // Adjust retries based on success rate
        recommended = avgPerformance < 0.8
          ? Math.min(param.currentValue + 1, param.maxValue)
          : Math.max(param.currentValue - 1, param.minValue);
        break;

      case 'timeoutDuration':
        // Increase timeout if many timeouts occur
        const recentTimeouts = history.filter(h => h.performance < 0.5).length;
        const timeoutRate = recentTimeouts / history.length;
        recommended = timeoutRate > 0.2
          ? Math.min(param.currentValue * 1.3, param.maxValue)
          : Math.max(param.currentValue * 0.85, param.minValue);
        break;

      case 'cacheExpiry':
        // Adjust based on cache hit rate (performance)
        recommended = avgPerformance > 0.9
          ? Math.min(param.currentValue * 1.2, param.maxValue)
          : Math.max(param.currentValue * 0.8, param.minValue);
        break;

      case 'maxConcurrency':
        // Adjust based on load and performance
        if (avgPerformance < 0.7 && avgValue > param.currentValue * 0.8) {
          recommended = Math.min(param.currentValue + 2, param.maxValue);
        } else if (avgPerformance > 0.95 && avgValue < param.currentValue * 0.5) {
          recommended = Math.max(param.currentValue - 2, param.minValue);
        } else {
          recommended = param.currentValue;
        }
        break;

      default:
        recommended = param.currentValue;
    }

    // Ensure within bounds
    return Math.round(Math.max(param.minValue, Math.min(param.maxValue, recommended)));
  }

  /**
   * Save parameter to database
   */
  private async saveParameter(param: AdaptiveParameter): Promise<void> {
    try {
      const { error } = await supabase
        .from('adaptive_parameters')
        .upsert({
          parameter_name: param.name,
          module_name: 'adaptive_metrics',
          current_value: param.currentValue,
          baseline_value: param.defaultValue,
          updated_at: param.lastAdjusted.toISOString(),
        });

      if (error) {
        logger.error('[AdaptiveMetrics] Failed to save parameter:', error);
      }
    } catch (error) {
      logger.error('[AdaptiveMetrics] Error saving parameter:', error);
    }
  }

  /**
   * Track performance impact of adjustment
   */
  private async trackPerformanceImpact(
    paramName: string,
    oldValue: number,
    newValue: number
  ): Promise<void> {
    try {
      await supabase
        .from('parameter_adjustments')
        .insert({
          parameter_name: paramName,
          module_name: 'adaptive_metrics',
          old_value: oldValue,
          new_value: newValue,
          delta_percent: oldValue === 0 ? 0 : ((newValue - oldValue) / oldValue) * 100,
          created_at: new Date().toISOString(),
        });
    } catch (error) {
      logger.error('[AdaptiveMetrics] Failed to track adjustment:', error);
    }
  }

  /**
   * Record metric value
   */
  async recordMetric(
    paramName: string,
    value: number,
    performanceScore: number
  ): Promise<void> {
    try {
      await supabase
        .from('metric_history')
        .insert({
          module_name: 'adaptive_metrics',
          parameter_name: paramName,
          value,
          performance_score: Math.max(0, Math.min(1, performanceScore)),
          timestamp: new Date().toISOString(),
        });
    } catch (error) {
      logger.error('[AdaptiveMetrics] Failed to record metric:', error);
    }
  }

  /**
   * Get current parameter value
   */
  getParameter(name: string): AdaptiveParameter | undefined {
    return this.parameters.get(name);
  }

  /**
   * Get all parameters
   */
  getAllParameters(): ParameterConfig {
    return {
      latencyThreshold: this.parameters.get('latencyThreshold')!,
      retryAttempts: this.parameters.get('retryAttempts')!,
      timeoutDuration: this.parameters.get('timeoutDuration')!,
      cacheExpiry: this.parameters.get('cacheExpiry')!,
      maxConcurrency: this.parameters.get('maxConcurrency')!,
    };
  }

  /**
   * Reset parameter to default
   */
  async resetParameter(name: string): Promise<void> {
    const param = this.parameters.get(name);
    if (!param) {
      logger.warn(`[AdaptiveMetrics] Parameter ${name} not found`);
      return;
    }

    param.currentValue = param.defaultValue;
    param.lastAdjusted = new Date();
    param.adjustmentCount = 0;

    await this.saveParameter(param);
    logger.info(`[AdaptiveMetrics] Reset ${name} to default: ${param.defaultValue}${param.unit}`);
  }

  /**
   * Get adjustment history
   */
  async getAdjustmentHistory(limit = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('parameter_adjustments')
        .select('*')
        .order('adjusted_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('[AdaptiveMetrics] Failed to fetch adjustment history:', error);
      return [];
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    const params = Array.from(this.parameters.values());
    const totalAdjustments = params.reduce((sum, p) => sum + p.adjustmentCount, 0);
    const avgDeltaFromDefault = params.reduce((sum, p) => {
      return sum + Math.abs(p.currentValue - p.defaultValue) / p.defaultValue;
    }, 0) / params.length;

    return {
      isActive: this.isActive,
      totalParameters: params.length,
      totalAdjustments,
      avgDeltaFromDefault: avgDeltaFromDefault * 100, // as percentage
      lastAdjustment: Math.max(...params.map(p => p.lastAdjusted.getTime())),
    };
  }
}

// Export singleton instance
export const adaptiveMetricsEngine = new AdaptiveMetricsEngine();
