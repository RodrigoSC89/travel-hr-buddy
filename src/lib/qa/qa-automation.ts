/**
 * QA Automation System - Monitoring, Alerts, Dashboards
 * Nauti One v4.0
 */

export interface QAMetric {
  id: string;
  name: string;
  category: 'performance' | 'reliability' | 'security' | 'usability';
  value: number;
  threshold: { warning: number; critical: number };
  unit: string;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

export interface QAAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  metric: string;
  currentValue: number;
  threshold: number;
  triggeredAt: string;
  acknowledged: boolean;
  resolvedAt?: string;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: string;
  uptime: number;
  errors: number;
}

export interface QADashboard {
  overallScore: number;
  metrics: QAMetric[];
  alerts: QAAlert[];
  healthChecks: HealthCheck[];
  testResults: TestResult[];
  trends: TrendData[];
}

export interface TestResult {
  suite: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  coverage: number;
  lastRun: string;
}

export interface TrendData {
  date: string;
  score: number;
  incidents: number;
  deployments: number;
}

class QAAutomationEngine {
  private metrics: Map<string, QAMetric> = new Map();
  private alerts: QAAlert[] = [];
  private healthChecks: Map<string, HealthCheck> = new Map();

  /**
   * Initialize default metrics
   */
  initializeMetrics(): void {
    const defaultMetrics: QAMetric[] = [
      {
        id: 'lighthouse_performance',
        name: 'Lighthouse Performance',
        category: 'performance',
        value: 95,
        threshold: { warning: 90, critical: 80 },
        unit: 'score',
        trend: 'stable',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'api_response_time',
        name: 'API Response Time',
        category: 'performance',
        value: 150,
        threshold: { warning: 500, critical: 1000 },
        unit: 'ms',
        trend: 'down',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'error_rate',
        name: 'Error Rate',
        category: 'reliability',
        value: 0.1,
        threshold: { warning: 1, critical: 5 },
        unit: '%',
        trend: 'stable',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'test_coverage',
        name: 'Test Coverage',
        category: 'reliability',
        value: 85,
        threshold: { warning: 80, critical: 70 },
        unit: '%',
        trend: 'up',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'security_score',
        name: 'Security Score',
        category: 'security',
        value: 98,
        threshold: { warning: 90, critical: 80 },
        unit: 'score',
        trend: 'stable',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'accessibility_score',
        name: 'Accessibility Score',
        category: 'usability',
        value: 92,
        threshold: { warning: 85, critical: 70 },
        unit: 'score',
        trend: 'up',
        lastUpdated: new Date().toISOString()
      }
    ];

    defaultMetrics.forEach(m => this.metrics.set(m.id, m));
  }

  /**
   * Update metric value
   */
  updateMetric(id: string, value: number): QAAlert | null {
    const metric = this.metrics.get(id);
    if (!metric) return null;

    const previousValue = metric.value;
    metric.value = value;
    metric.trend = value > previousValue ? 'up' : value < previousValue ? 'down' : 'stable';
    metric.lastUpdated = new Date().toISOString();

    // Check thresholds
    if (value >= metric.threshold.critical) {
      return this.createAlert('critical', metric);
    } else if (value >= metric.threshold.warning) {
      return this.createAlert('warning', metric);
    }

    return null;
  }

  /**
   * Create alert
   */
  private createAlert(severity: QAAlert['severity'], metric: QAMetric): QAAlert {
    const alert: QAAlert = {
      id: `alert_${Date.now()}`,
      severity,
      title: `${metric.name} ${severity === 'critical' ? 'Critical' : 'Warning'}`,
      message: `${metric.name} is at ${metric.value}${metric.unit}, threshold: ${
        severity === 'critical' ? metric.threshold.critical : metric.threshold.warning
      }${metric.unit}`,
      metric: metric.id,
      currentValue: metric.value,
      threshold: severity === 'critical' ? metric.threshold.critical : metric.threshold.warning,
      triggeredAt: new Date().toISOString(),
      acknowledged: false
    };

    this.alerts.push(alert);
    return alert;
  }

  /**
   * Run health check
   */
  async runHealthCheck(service: string, endpoint: string): Promise<HealthCheck> {
    const startTime = Date.now();
    let status: HealthCheck['status'] = 'healthy';
    let errors = 0;

    try {
      const response = await fetch(endpoint, { method: 'HEAD' });
      if (!response.ok) {
        status = response.status >= 500 ? 'down' : 'degraded';
        errors = 1;
      }
    } catch {
      status = 'down';
      errors = 1;
    }

    const responseTime = Date.now() - startTime;
    const existing = this.healthChecks.get(service);

    const healthCheck: HealthCheck = {
      service,
      status,
      responseTime,
      lastCheck: new Date().toISOString(),
      uptime: existing ? (status === 'healthy' ? existing.uptime + 1 : existing.uptime) : (status === 'healthy' ? 1 : 0),
      errors: existing ? existing.errors + errors : errors
    };

    this.healthChecks.set(service, healthCheck);
    return healthCheck;
  }

  /**
   * Get dashboard data
   */
  getDashboard(): QADashboard {
    const metrics = Array.from(this.metrics.values());
    const overallScore = metrics.reduce((sum, m) => {
      const normalized = m.category === 'performance' && m.unit === 'ms' 
        ? Math.max(0, 100 - m.value / 10)
        : m.value;
      return sum + normalized;
    }, 0) / metrics.length;

    return {
      overallScore: Math.round(overallScore),
      metrics,
      alerts: this.alerts.filter(a => !a.resolvedAt).slice(-10),
      healthChecks: Array.from(this.healthChecks.values()),
      testResults: this.getTestResults(),
      trends: this.generateTrends()
    };
  }

  /**
   * Get test results summary
   */
  private getTestResults(): TestResult[] {
    return [
      { suite: 'Unit Tests', passed: 245, failed: 2, skipped: 5, duration: 12.5, coverage: 87, lastRun: new Date().toISOString() },
      { suite: 'Integration Tests', passed: 89, failed: 0, skipped: 3, duration: 45.2, coverage: 78, lastRun: new Date().toISOString() },
      { suite: 'E2E Tests', passed: 42, failed: 1, skipped: 2, duration: 180.0, coverage: 65, lastRun: new Date().toISOString() }
    ];
  }

  /**
   * Generate trend data
   */
  private generateTrends(): TrendData[] {
    const trends: TrendData[] = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trends.push({
        date: date.toISOString().split('T')[0],
        score: 85 + Math.random() * 10,
        incidents: Math.floor(Math.random() * 3),
        deployments: i % 7 === 0 ? 1 : 0
      });
    }
    return trends;
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolvedAt = new Date().toISOString();
      return true;
    }
    return false;
  }
}

export const qaAutomationEngine = new QAAutomationEngine();
