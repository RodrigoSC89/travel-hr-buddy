/**
 * PATCH 614 - Contextual Threat Monitor
 * AI-driven contextual threat detection using multiple sources
 * Integrates with graph engine, sensors, and Watchdog system
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';
import { systemWatchdog } from '@/ai/watchdog';
import { graphInferenceEngine, BottleneckInfo } from '../inference/graph-engine';

export type ThreatType =
  | 'security_breach'
  | 'system_anomaly'
  | 'resource_depletion'
  | 'operational_failure'
  | 'cascade_failure'
  | 'unauthorized_access';

export type ThreatSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ThreatContext {
  source: 'sensor' | 'log' | 'graph' | 'ai' | 'watchdog';
  data: Record<string, any>;
  timestamp: Date;
  reliability: number; // 0-1 scale
}

export interface Threat {
  id: string;
  type: ThreatType;
  severity: ThreatSeverity;
  severityScore: number; // 0-100
  description: string;
  contexts: ThreatContext[];
  affectedModules: string[];
  indicators: string[];
  recommendations: string[];
  firstDetected: Date;
  lastUpdated: Date;
  isActive: boolean;
  confidence: number; // 0-1 scale
}

export interface ThreatAlert {
  id: string;
  threatId: string;
  severity: ThreatSeverity;
  message: string;
  details: Record<string, any>;
  timestamp: Date;
  acknowledged: boolean;
}

class ContextualThreatMonitor {
  private threats: Map<string, Threat> = new Map();
  private alerts: Map<string, ThreatAlert> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isActive = false;

  /**
   * Start the threat monitor
   */
  async start(): Promise<void> {
    if (this.isActive) {
      logger.warn('[ThreatMonitor] Already running');
      return;
    }

    logger.info('[ThreatMonitor] Starting contextual threat monitor...');

    // Initialize graph engine
    await graphInferenceEngine.initialize();

    // Start Watchdog if not already running
    systemWatchdog.start();

    this.isActive = true;

    // Start continuous monitoring
    this.monitoringInterval = setInterval(() => {
      this.performThreatAnalysis();
    }, 30000); // Every 30 seconds

    // Perform initial analysis
    await this.performThreatAnalysis();

    logger.info('[ThreatMonitor] Contextual threat monitor is active');
  }

  /**
   * Stop the threat monitor
   */
  stop(): void {
    if (!this.isActive) return;

    this.isActive = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    logger.info('[ThreatMonitor] Contextual threat monitor stopped');
  }

  /**
   * Perform comprehensive threat analysis
   */
  private async performThreatAnalysis(): Promise<void> {
    if (!this.isActive) return;

    logger.debug('[ThreatMonitor] Performing threat analysis...');

    try {
      // Collect contexts from multiple sources
      const contexts = await this.collectContexts();

      // Analyze contexts for threats
      const detectedThreats = await this.analyzeContexts(contexts);

      // Update threat database
      for (const threat of detectedThreats) {
        await this.updateThreat(threat);

        // Generate alert if new or severity increased
        if (this.shouldAlert(threat)) {
          await this.generateAlert(threat);
        }
      }

      // Clean up resolved threats
      this.cleanupResolvedThreats();

      logger.debug(`[ThreatMonitor] Analysis complete. Active threats: ${this.threats.size}`);
    } catch (error) {
      logger.error('[ThreatMonitor] Error during threat analysis', error);
    }
  }

  /**
   * Collect contexts from multiple sources
   */
  private async collectContexts(): Promise<ThreatContext[]> {
    const contexts: ThreatContext[] = [];

    // 1. Collect from Watchdog
    const watchdogStats = systemWatchdog.getStats();
    if (watchdogStats.criticalErrors > 0) {
      contexts.push({
        source: 'watchdog',
        data: {
          criticalErrors: watchdogStats.criticalErrors,
          errorsByType: watchdogStats.errorsByType,
        },
        timestamp: new Date(),
        reliability: 0.9,
      });
    }

    // 2. Collect from Graph Engine (bottlenecks)
    const bottlenecks = graphInferenceEngine.detectBottlenecks();
    if (bottlenecks.length > 0) {
      contexts.push({
        source: 'graph',
        data: {
          bottlenecks: bottlenecks.filter((b) => b.severity !== 'low'),
        },
        timestamp: new Date(),
        reliability: 0.85,
      });
    }

    // 3. Collect from sensor data
    const sensorContext = await this.collectSensorData();
    if (sensorContext) {
      contexts.push(sensorContext);
    }

    // 4. Collect from system logs
    const logContext = await this.collectLogData();
    if (logContext) {
      contexts.push(logContext);
    }

    // 5. Collect from AI analysis
    const aiContext = await this.collectAIInsights();
    if (aiContext) {
      contexts.push(aiContext);
    }

    logger.debug(`[ThreatMonitor] Collected ${contexts.length} contexts`);
    return contexts;
  }

  /**
   * Collect sensor data
   */
  private async collectSensorData(): Promise<ThreatContext | null> {
    try {
      // Query recent sensor anomalies
      const { data, error } = await supabase
        .from('sensor_logs')
        .select('*')
        .eq('status', 'anomaly')
        .gte('created_at', new Date(Date.now() - 300000).toISOString()) // Last 5 minutes
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        return {
          source: 'sensor',
          data: {
            anomalies: data.length,
            sensors: data.map((d) => d.sensor_id),
          },
          timestamp: new Date(),
          reliability: 0.8,
        };
      }
    } catch (error) {
      logger.error('[ThreatMonitor] Failed to collect sensor data', error);
    }

    return null;
  }

  /**
   * Collect log data
   */
  private async collectLogData(): Promise<ThreatContext | null> {
    try {
      // Query recent error logs
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .eq('level', 'error')
        .gte('created_at', new Date(Date.now() - 300000).toISOString())
        .limit(20);

      if (error) throw error;

      if (data && data.length > 5) {
        // High error rate is a threat indicator
        return {
          source: 'log',
          data: {
            errorCount: data.length,
            errorTypes: [...new Set(data.map((d) => d.error_type))],
          },
          timestamp: new Date(),
          reliability: 0.75,
        };
      }
    } catch (error) {
      logger.error('[ThreatMonitor] Failed to collect log data', error);
    }

    return null;
  }

  /**
   * Collect AI insights
   */
  private async collectAIInsights(): Promise<ThreatContext | null> {
    try {
      // Query recent AI analysis results
      const { data, error } = await supabase
        .from('ai_analysis')
        .select('*')
        .gte('created_at', new Date(Date.now() - 600000).toISOString()) // Last 10 minutes
        .order('confidence', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data && data.length > 0) {
        const highConfidenceResults = data.filter((d) => d.confidence > 0.7);
        
        if (highConfidenceResults.length > 0) {
          return {
            source: 'ai',
            data: {
              predictions: highConfidenceResults.map((d) => ({
                type: d.analysis_type,
                result: d.result,
                confidence: d.confidence,
              })),
            },
            timestamp: new Date(),
            reliability: 0.7,
          };
        }
      }
    } catch (error) {
      logger.error('[ThreatMonitor] Failed to collect AI insights', error);
    }

    return null;
  }

  /**
   * Analyze contexts to detect threats
   */
  private async analyzeContexts(contexts: ThreatContext[]): Promise<Threat[]> {
    const threats: Threat[] = [];

    // 1. Check for cascade failures (graph + watchdog)
    const cascadeThreat = this.detectCascadeFailure(contexts);
    if (cascadeThreat) threats.push(cascadeThreat);

    // 2. Check for resource depletion
    const resourceThreat = this.detectResourceDepletion(contexts);
    if (resourceThreat) threats.push(resourceThreat);

    // 3. Check for system anomalies
    const anomalyThreat = this.detectSystemAnomaly(contexts);
    if (anomalyThreat) threats.push(anomalyThreat);

    // 4. Check for operational failures
    const operationalThreat = this.detectOperationalFailure(contexts);
    if (operationalThreat) threats.push(operationalThreat);

    // 5. Cross-correlate contexts for security threats
    const securityThreat = this.detectSecurityThreat(contexts);
    if (securityThreat) threats.push(securityThreat);

    return threats;
  }

  /**
   * Detect cascade failure threat
   */
  private detectCascadeFailure(contexts: ThreatContext[]): Threat | null {
    const graphContext = contexts.find((c) => c.source === 'graph');
    const watchdogContext = contexts.find((c) => c.source === 'watchdog');

    if (!graphContext || !watchdogContext) return null;

    const bottlenecks = graphContext.data.bottlenecks as BottleneckInfo[];
    const criticalBottlenecks = bottlenecks.filter((b) => b.severity === 'critical');

    if (criticalBottlenecks.length > 0 && watchdogContext.data.criticalErrors > 2) {
      const severity = this.calculateSeverity(
        criticalBottlenecks.length,
        watchdogContext.data.criticalErrors
      );

      return {
        id: `threat-cascade-${Date.now()}`,
        type: 'cascade_failure',
        severity,
        severityScore: this.severityToScore(severity),
        description: 'Multiple critical bottlenecks detected with system errors',
        contexts: [graphContext, watchdogContext],
        affectedModules: criticalBottlenecks.map((b) => b.nodeId),
        indicators: [
          `${criticalBottlenecks.length} critical bottlenecks`,
          `${watchdogContext.data.criticalErrors} critical errors`,
        ],
        recommendations: [
          'Isolate affected modules to prevent spread',
          'Activate backup systems',
          'Alert operations team',
        ],
        firstDetected: new Date(),
        lastUpdated: new Date(),
        isActive: true,
        confidence: 0.85,
      };
    }

    return null;
  }

  /**
   * Detect resource depletion threat
   */
  private detectResourceDepletion(contexts: ThreatContext[]): Threat | null {
    const watchdogContext = contexts.find((c) => c.source === 'watchdog');
    
    if (!watchdogContext) return null;

    // Check for resource-related errors
    const errorsByType = watchdogContext.data.errorsByType as Record<string, number>;
    const resourceErrors = errorsByType['resource'] || 0;

    if (resourceErrors > 5) {
      return {
        id: `threat-resource-${Date.now()}`,
        type: 'resource_depletion',
        severity: 'high',
        severityScore: 75,
        description: 'Critical resource depletion detected',
        contexts: [watchdogContext],
        affectedModules: ['system'],
        indicators: [`${resourceErrors} resource-related errors`],
        recommendations: [
          'Free up system resources',
          'Scale resources if possible',
          'Identify and terminate resource-intensive processes',
        ],
        firstDetected: new Date(),
        lastUpdated: new Date(),
        isActive: true,
        confidence: 0.8,
      };
    }

    return null;
  }

  /**
   * Detect system anomaly threat
   */
  private detectSystemAnomaly(contexts: ThreatContext[]): Threat | null {
    const sensorContext = contexts.find((c) => c.source === 'sensor');
    const logContext = contexts.find((c) => c.source === 'log');

    if (!sensorContext && !logContext) return null;

    const anomalies = sensorContext?.data.anomalies || 0;
    const errorCount = logContext?.data.errorCount || 0;

    if (anomalies > 3 || errorCount > 10) {
      const severity: ThreatSeverity = anomalies > 5 || errorCount > 15 ? 'high' : 'medium';

      return {
        id: `threat-anomaly-${Date.now()}`,
        type: 'system_anomaly',
        severity,
        severityScore: this.severityToScore(severity),
        description: 'Unusual system behavior detected',
        contexts: contexts.filter((c) => c.source === 'sensor' || c.source === 'log'),
        affectedModules: sensorContext?.data.sensors || [],
        indicators: [
          `${anomalies} sensor anomalies`,
          `${errorCount} error logs`,
        ],
        recommendations: [
          'Investigate sensor readings',
          'Review error logs for patterns',
          'Run diagnostic checks',
        ],
        firstDetected: new Date(),
        lastUpdated: new Date(),
        isActive: true,
        confidence: 0.7,
      };
    }

    return null;
  }

  /**
   * Detect operational failure threat
   */
  private detectOperationalFailure(contexts: ThreatContext[]): Threat | null {
    const graphContext = contexts.find((c) => c.source === 'graph');
    
    if (!graphContext) return null;

    const bottlenecks = graphContext.data.bottlenecks as BottleneckInfo[];
    const highSeverityBottlenecks = bottlenecks.filter(
      (b) => b.severity === 'high' || b.severity === 'critical'
    );

    if (highSeverityBottlenecks.length >= 2) {
      return {
        id: `threat-operational-${Date.now()}`,
        type: 'operational_failure',
        severity: 'high',
        severityScore: 80,
        description: 'Multiple operational bottlenecks detected',
        contexts: [graphContext],
        affectedModules: highSeverityBottlenecks.map((b) => b.nodeId),
        indicators: highSeverityBottlenecks.map((b) => b.reason),
        recommendations: [
          'Review operational procedures',
          'Redistribute workload',
          'Consider scaling affected components',
        ],
        firstDetected: new Date(),
        lastUpdated: new Date(),
        isActive: true,
        confidence: 0.75,
      };
    }

    return null;
  }

  /**
   * Detect security threat
   */
  private detectSecurityThreat(contexts: ThreatContext[]): Threat | null {
    const aiContext = contexts.find((c) => c.source === 'ai');
    const logContext = contexts.find((c) => c.source === 'log');

    if (!aiContext || !logContext) return null;

    // Check for security-related predictions
    const predictions = aiContext.data.predictions as Array<{ type: string; confidence: number }>;
    const securityPredictions = predictions.filter(
      (p) => p.type.includes('security') || p.type.includes('unauthorized')
    );

    if (securityPredictions.length > 0) {
      return {
        id: `threat-security-${Date.now()}`,
        type: 'security_breach',
        severity: 'critical',
        severityScore: 95,
        description: 'Potential security threat detected',
        contexts: [aiContext, logContext],
        affectedModules: ['security', 'access_control'],
        indicators: securityPredictions.map((p) => `${p.type} (confidence: ${p.confidence})`),
        recommendations: [
          'Activate security protocols',
          'Review access logs',
          'Isolate affected systems',
          'Alert security team immediately',
        ],
        firstDetected: new Date(),
        lastUpdated: new Date(),
        isActive: true,
        confidence: securityPredictions[0].confidence,
      };
    }

    return null;
  }

  /**
   * Update threat in database
   */
  private async updateThreat(threat: Threat): Promise<void> {
    const existing = this.threats.get(threat.id);

    if (existing) {
      // Update existing threat
      existing.lastUpdated = new Date();
      existing.contexts = threat.contexts;
      existing.severity = threat.severity;
      existing.severityScore = threat.severityScore;
    } else {
      // Add new threat
      this.threats.set(threat.id, threat);
    }

    // Save to database
    try {
      const { error } = await supabase.from('threat_logs').upsert({
        threat_id: threat.id,
        threat_type: threat.type,
        severity: threat.severity,
        severity_score: threat.severityScore,
        description: threat.description,
        affected_modules: threat.affectedModules,
        indicators: threat.indicators,
        recommendations: threat.recommendations,
        confidence: threat.confidence,
        is_active: threat.isActive,
        first_detected: threat.firstDetected.toISOString(),
        last_updated: threat.lastUpdated.toISOString(),
      });

      if (error) {
        logger.error('[ThreatMonitor] Failed to save threat', error);
      }
    } catch (error) {
      logger.error('[ThreatMonitor] Error saving threat', error);
    }
  }

  /**
   * Check if alert should be generated
   */
  private shouldAlert(threat: Threat): boolean {
    // Always alert for critical threats
    if (threat.severity === 'critical') return true;

    // Alert for high severity if not already alerted
    if (threat.severity === 'high') {
      const existingAlert = Array.from(this.alerts.values()).find(
        (a) => a.threatId === threat.id
      );
      return !existingAlert;
    }

    return false;
  }

  /**
   * Generate alert for threat
   */
  private async generateAlert(threat: Threat): Promise<void> {
    const alert: ThreatAlert = {
      id: `alert-${Date.now()}`,
      threatId: threat.id,
      severity: threat.severity,
      message: threat.description,
      details: {
        type: threat.type,
        affectedModules: threat.affectedModules,
        indicators: threat.indicators,
        recommendations: threat.recommendations,
      },
      timestamp: new Date(),
      acknowledged: false,
    };

    this.alerts.set(alert.id, alert);

    // Send to Watchdog for alerting
    logger.warn(`[ThreatMonitor] ALERT: ${threat.severity.toUpperCase()} - ${threat.description}`);

    // Save alert to database
    try {
      const { error } = await supabase.from('watchdog_logs').insert({
        error_id: alert.id,
        error_type: 'threat',
        severity: alert.severity,
        message: alert.message,
        context: alert.details,
        timestamp: alert.timestamp.toISOString(),
      });

      if (error) {
        logger.error('[ThreatMonitor] Failed to save alert', error);
      }
    } catch (error) {
      logger.error('[ThreatMonitor] Error saving alert', error);
    }
  }

  /**
   * Clean up resolved threats
   */
  private cleanupResolvedThreats(): void {
    const oneHourAgo = new Date(Date.now() - 3600000);

    for (const [id, threat] of this.threats.entries()) {
      if (threat.lastUpdated < oneHourAgo) {
        threat.isActive = false;
        this.updateThreat(threat);
        this.threats.delete(id);
      }
    }
  }

  /**
   * Calculate severity based on factors
   */
  private calculateSeverity(factor1: number, factor2: number): ThreatSeverity {
    const combined = factor1 + factor2;
    
    if (combined >= 6) return 'critical';
    if (combined >= 4) return 'high';
    if (combined >= 2) return 'medium';
    return 'low';
  }

  /**
   * Convert severity to numeric score
   */
  private severityToScore(severity: ThreatSeverity): number {
    const scores = { low: 25, medium: 50, high: 75, critical: 95 };
    return scores[severity];
  }

  /**
   * Get active threats
   */
  getActiveThreats(): Threat[] {
    return Array.from(this.threats.values()).filter((t) => t.isActive);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): ThreatAlert[] {
    return Array.from(this.alerts.values()).filter((a) => !a.acknowledged);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    const threats = Array.from(this.threats.values());
    
    return {
      isActive: this.isActive,
      totalThreats: threats.length,
      activeThreats: threats.filter((t) => t.isActive).length,
      threatsBySeverity: {
        critical: threats.filter((t) => t.severity === 'critical').length,
        high: threats.filter((t) => t.severity === 'high').length,
        medium: threats.filter((t) => t.severity === 'medium').length,
        low: threats.filter((t) => t.severity === 'low').length,
      },
      unacknowledgedAlerts: this.getActiveAlerts().length,
    };
  }
}

// Export singleton instance
export const contextualThreatMonitor = new ContextualThreatMonitor();
