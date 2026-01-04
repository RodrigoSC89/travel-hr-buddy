/**
 * Intelligent Alerting System - Nautilus One v3.2.0
 * Anomaly detection, smart escalation, and predictive alerts
 */

import * as Sentry from '@sentry/react';
import { AdvancedMonitoring } from './advanced-metrics';

// Types
interface Alert {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  metric?: string;
  value?: number;
  mean?: number;
  stdDev?: number;
  action?: string;
  metadata?: Record<string, any>;
}

interface AlertConfig {
  enableSlack?: boolean;
  enableEmail?: boolean;
  enableSentry?: boolean;
  slackWebhook?: string;
  emailRecipients?: string[];
}

interface PredictionResult {
  metric: string;
  prediction: number;
  trend: string;
  alert?: Alert;
}

const defaultConfig: AlertConfig = {
  enableSlack: false,
  enableEmail: false,
  enableSentry: true,
};

export class IntelligentAlerting {
  private static config: AlertConfig = defaultConfig;
  
  static configure(config: Partial<AlertConfig>) {
    this.config = { ...this.config, ...config };
  }
  
  // Detect anomalies in metric values
  static async detectAnomalies(metric: string, value: number): Promise<boolean> {
    const history = AdvancedMonitoring.getMetricHistory(metric, 7);
    
    if (history.length < 5) {
      return false; // Not enough data
    }
    
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const stdDev = Math.sqrt(
      history.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / history.length
    );
    
    // Z-score > 3 = anomaly
    const zScore = stdDev > 0 ? Math.abs((value - mean) / stdDev) : 0;
    
    if (zScore > 3) {
      await this.sendAlert({
        severity: 'warning',
        title: `Anomaly detected: ${metric}`,
        description: `Value ${value.toFixed(2)} is ${zScore.toFixed(2)} standard deviations from mean (${mean.toFixed(2)})`,
        metric,
        value,
        mean,
        stdDev,
      });
      return true;
    }
    
    return false;
  }
  
  // Smart escalation based on severity
  static async sendAlert(alert: Alert) {
    console.log(`[Alert][${alert.severity}] ${alert.title}:`, alert.description);
    
    // Always log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Alert:', alert);
    }
    
    // Sentry integration
    if (this.config.enableSentry) {
      const sentryLevel = alert.severity === 'critical' ? 'error' 
        : alert.severity === 'warning' ? 'warning' 
        : 'info';
      
      Sentry.captureMessage(`${alert.title}: ${alert.description}`, {
        level: sentryLevel,
        extra: {
          metric: alert.metric,
          value: alert.value,
          mean: alert.mean,
          stdDev: alert.stdDev,
          action: alert.action,
          ...alert.metadata,
        },
      });
    }
    
    // Escalation based on severity
    switch (alert.severity) {
      case 'critical':
        await this.notifyCritical(alert);
        break;
        
      case 'warning':
        await this.notifyWarning(alert);
        break;
        
      case 'info':
        await this.notifyInfo(alert);
        break;
    }
    
    // Store in local storage for dashboard
    this.storeAlertLocally(alert);
  }
  
  // Predictive alerts using linear regression
  static async predictIssues(): Promise<PredictionResult[]> {
    const metricsToCheck = ['cpu_usage', 'memory_usage', 'response_time', 'error_rate'];
    const predictions: PredictionResult[] = [];
    
    for (const metric of metricsToCheck) {
      const trend = AdvancedMonitoring.predictTrend(metric);
      
      const predictionResult: PredictionResult = {
        metric,
        prediction: trend.nextValue,
        trend: trend.trend,
      };
      
      // Alert if predicted to exceed thresholds
      if (metric === 'cpu_usage' && trend.nextValue > 90) {
        predictionResult.alert = {
          severity: 'warning',
          title: 'Predicted CPU spike',
          description: `CPU usage predicted to reach ${trend.nextValue.toFixed(1)}% based on current trend`,
          action: 'Consider scaling up resources',
        };
        await this.sendAlert(predictionResult.alert);
      }
      
      if (metric === 'memory_usage' && trend.nextValue > 90) {
        predictionResult.alert = {
          severity: 'warning',
          title: 'Predicted Memory spike',
          description: `Memory usage predicted to reach ${trend.nextValue.toFixed(1)}% based on current trend`,
          action: 'Check for memory leaks',
        };
        await this.sendAlert(predictionResult.alert);
      }
      
      if (metric === 'error_rate' && trend.nextValue > 5) {
        predictionResult.alert = {
          severity: 'warning',
          title: 'Predicted Error rate increase',
          description: `Error rate predicted to reach ${trend.nextValue.toFixed(2)}% based on current trend`,
          action: 'Review recent deployments and error logs',
        };
        await this.sendAlert(predictionResult.alert);
      }
      
      predictions.push(predictionResult);
    }
    
    return predictions;
  }
  
  // Get recent alerts from local storage
  static getRecentAlerts(count: number = 50): Array<Alert & { timestamp: string }> {
    try {
      const stored = localStorage.getItem('nautilus_alerts');
      if (!stored) return [];
      
      const alerts: Array<Alert & { timestamp: string }> = JSON.parse(stored);
      return alerts.slice(-count);
    } catch {
      return [];
    }
  }
  
  // Clear old alerts
  static clearOldAlerts(daysToKeep: number = 7) {
    try {
      const stored = localStorage.getItem('nautilus_alerts');
      if (!stored) return;
      
      const alerts: Array<Alert & { timestamp: string }> = JSON.parse(stored);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysToKeep);
      
      const filtered = alerts.filter(a => new Date(a.timestamp) > cutoff);
      localStorage.setItem('nautilus_alerts', JSON.stringify(filtered));
    } catch {
      // Ignore errors
    }
  }
  
  // Private: Store alert locally
  private static storeAlertLocally(alert: Alert) {
    try {
      const stored = localStorage.getItem('nautilus_alerts');
      const alerts: Array<Alert & { timestamp: string }> = stored ? JSON.parse(stored) : [];
      
      alerts.push({
        ...alert,
        timestamp: new Date().toISOString(),
      });
      
      // Keep last 500 alerts
      if (alerts.length > 500) {
        alerts.splice(0, alerts.length - 500);
      }
      
      localStorage.setItem('nautilus_alerts', JSON.stringify(alerts));
    } catch {
      // Ignore storage errors
    }
  }
  
  // Private: Critical notification
  private static async notifyCritical(alert: Alert) {
    console.error('[CRITICAL ALERT]', alert);
    
    Sentry.captureMessage(`CRITICAL: ${alert.title}`, {
      level: 'error',
      extra: { ...alert },
    });
  }
  
  // Private: Warning notification
  private static async notifyWarning(alert: Alert) {
    console.warn('[WARNING ALERT]', alert);
  }
  
  // Private: Info notification
  private static async notifyInfo(alert: Alert) {
    console.info('[INFO ALERT]', alert);
  }
}

// Scheduled check for predictive alerts
export async function runPredictiveAlertCheck(): Promise<PredictionResult[]> {
  const predictions = await IntelligentAlerting.predictIssues();
  IntelligentAlerting.clearOldAlerts(7);
  return predictions;
}

export default IntelligentAlerting;
