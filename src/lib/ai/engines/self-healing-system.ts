/**
 * Self-Healing System Engine
 * Autonomous system monitoring and automatic issue resolution
 */

export interface SystemComponent {
  id: string;
  name: string;
  type: 'service' | 'database' | 'api' | 'integration' | 'cache' | 'queue';
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  dependencies: string[];
  metrics: ComponentMetrics;
  lastHealthCheck: Date;
  healingEnabled: boolean;
}

export interface ComponentMetrics {
  responseTime: number; // ms
  errorRate: number; // percentage
  throughput: number; // requests per second
  availability: number; // percentage uptime
  memoryUsage: number; // percentage
  cpuUsage: number; // percentage
  queueDepth?: number;
  connectionPoolUsage?: number;
}

export interface HealthIssue {
  id: string;
  componentId: string;
  componentName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: IssueType;
  description: string;
  detectedAt: Date;
  metrics: Partial<ComponentMetrics>;
  autoHealable: boolean;
  healingAttempts: HealingAttempt[];
  status: 'detected' | 'healing' | 'healed' | 'escalated' | 'resolved';
  rootCause?: string;
  impactedUsers?: number;
}

export type IssueType = 
  | 'high_latency'
  | 'high_error_rate'
  | 'memory_pressure'
  | 'cpu_saturation'
  | 'connection_exhaustion'
  | 'queue_backlog'
  | 'dependency_failure'
  | 'rate_limiting'
  | 'certificate_expiry'
  | 'disk_space'
  | 'database_connection'
  | 'cache_miss_rate';

export interface HealingAttempt {
  id: string;
  action: HealingAction;
  startedAt: Date;
  completedAt?: Date;
  success: boolean;
  result: string;
  rollbackPerformed: boolean;
}

export interface HealingAction {
  type: 'restart' | 'scale' | 'clear_cache' | 'reconnect' | 'rate_limit' | 'failover' | 'rollback' | 'circuit_break';
  target: string;
  parameters: Record<string, unknown>;
  estimatedDuration: number; // seconds
  riskLevel: 'low' | 'medium' | 'high';
  requiresApproval: boolean;
}

export interface HealingRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: HealingCondition[];
  actions: HealingAction[];
  cooldownMinutes: number;
  maxAttemptsPerHour: number;
  escalateAfterAttempts: number;
}

export interface HealingCondition {
  metric: keyof ComponentMetrics | 'status';
  operator: '>' | '<' | '==' | '!=' | '>=' | '<=';
  threshold: number | string;
  duration: number; // seconds the condition must persist
}

export interface SystemHealth {
  overallStatus: 'healthy' | 'degraded' | 'critical';
  healthScore: number; // 0-100
  components: SystemComponent[];
  activeIssues: HealthIssue[];
  recentHealings: HealingAttempt[];
  uptime: number; // percentage
  lastFullScan: Date;
  nextScheduledScan: Date;
}

export interface HealingReport {
  periodStart: Date;
  periodEnd: Date;
  totalIssuesDetected: number;
  autoHealed: number;
  escalated: number;
  mttr: number; // Mean Time To Recovery in minutes
  healingSuccessRate: number;
  topIssueTypes: { type: IssueType; count: number }[];
  componentReliability: { componentId: string; availability: number; incidents: number }[];
  savings: {
    estimatedDowntimeAvoided: number; // hours
    estimatedCostSaved: number;
  };
}

class SelfHealingSystemEngine {
  private components: Map<string, SystemComponent> = new Map();
  private issues: Map<string, HealthIssue> = new Map();
  private rules: Map<string, HealingRule> = new Map();
  private healingHistory: HealingAttempt[] = [];
  private lastAttemptTime: Map<string, Date> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    const defaultRules: HealingRule[] = [
      {
        id: 'rule-high-latency',
        name: 'High Latency Auto-Healing',
        enabled: true,
        conditions: [
          { metric: 'responseTime', operator: '>', threshold: 5000, duration: 60 }
        ],
        actions: [
          {
            type: 'clear_cache',
            target: 'affected_component',
            parameters: {},
            estimatedDuration: 5,
            riskLevel: 'low',
            requiresApproval: false
          },
          {
            type: 'scale',
            target: 'affected_component',
            parameters: { direction: 'up', factor: 1.5 },
            estimatedDuration: 120,
            riskLevel: 'medium',
            requiresApproval: false
          }
        ],
        cooldownMinutes: 15,
        maxAttemptsPerHour: 4,
        escalateAfterAttempts: 3
      },
      {
        id: 'rule-high-error-rate',
        name: 'High Error Rate Auto-Healing',
        enabled: true,
        conditions: [
          { metric: 'errorRate', operator: '>', threshold: 5, duration: 120 }
        ],
        actions: [
          {
            type: 'circuit_break',
            target: 'affected_component',
            parameters: { duration: 30 },
            estimatedDuration: 30,
            riskLevel: 'medium',
            requiresApproval: false
          },
          {
            type: 'restart',
            target: 'affected_component',
            parameters: { graceful: true },
            estimatedDuration: 60,
            riskLevel: 'medium',
            requiresApproval: false
          }
        ],
        cooldownMinutes: 30,
        maxAttemptsPerHour: 2,
        escalateAfterAttempts: 2
      },
      {
        id: 'rule-memory-pressure',
        name: 'Memory Pressure Auto-Healing',
        enabled: true,
        conditions: [
          { metric: 'memoryUsage', operator: '>', threshold: 85, duration: 300 }
        ],
        actions: [
          {
            type: 'clear_cache',
            target: 'affected_component',
            parameters: { aggressive: true },
            estimatedDuration: 10,
            riskLevel: 'low',
            requiresApproval: false
          },
          {
            type: 'restart',
            target: 'affected_component',
            parameters: { graceful: true },
            estimatedDuration: 60,
            riskLevel: 'medium',
            requiresApproval: true
          }
        ],
        cooldownMinutes: 60,
        maxAttemptsPerHour: 2,
        escalateAfterAttempts: 2
      },
      {
        id: 'rule-connection-exhaustion',
        name: 'Connection Pool Exhaustion',
        enabled: true,
        conditions: [
          { metric: 'connectionPoolUsage', operator: '>', threshold: 90, duration: 60 }
        ],
        actions: [
          {
            type: 'reconnect',
            target: 'affected_component',
            parameters: { poolReset: true },
            estimatedDuration: 15,
            riskLevel: 'medium',
            requiresApproval: false
          }
        ],
        cooldownMinutes: 10,
        maxAttemptsPerHour: 6,
        escalateAfterAttempts: 4
      },
      {
        id: 'rule-dependency-failure',
        name: 'Dependency Failure Handling',
        enabled: true,
        conditions: [
          { metric: 'status', operator: '==', threshold: 'unhealthy', duration: 30 }
        ],
        actions: [
          {
            type: 'failover',
            target: 'affected_component',
            parameters: { useBackup: true },
            estimatedDuration: 10,
            riskLevel: 'medium',
            requiresApproval: false
          },
          {
            type: 'circuit_break',
            target: 'affected_dependency',
            parameters: { duration: 60 },
            estimatedDuration: 5,
            riskLevel: 'low',
            requiresApproval: false
          }
        ],
        cooldownMinutes: 5,
        maxAttemptsPerHour: 12,
        escalateAfterAttempts: 5
      }
    ];

    for (const rule of defaultRules) {
      this.rules.set(rule.id, rule);
    }
  }

  registerComponent(component: SystemComponent): void {
    this.components.set(component.id, component);
  }

  updateComponentMetrics(componentId: string, metrics: Partial<ComponentMetrics>): void {
    const component = this.components.get(componentId);
    if (component) {
      component.metrics = { ...component.metrics, ...metrics };
      component.lastHealthCheck = new Date();
      this.evaluateComponentHealth(component);
    }
  }

  private evaluateComponentHealth(component: SystemComponent): void {
    const issues: HealthIssue[] = [];
    const m = component.metrics;

    // Check each metric against thresholds
    if (m.responseTime > 5000) {
      issues.push(this.createIssue(component, 'high_latency', 'high', 
        `Response time (${m.responseTime}ms) exceeds threshold`));
    } else if (m.responseTime > 2000) {
      issues.push(this.createIssue(component, 'high_latency', 'medium',
        `Response time (${m.responseTime}ms) elevated`));
    }

    if (m.errorRate > 10) {
      issues.push(this.createIssue(component, 'high_error_rate', 'critical',
        `Error rate (${m.errorRate}%) critically high`));
    } else if (m.errorRate > 5) {
      issues.push(this.createIssue(component, 'high_error_rate', 'high',
        `Error rate (${m.errorRate}%) exceeds threshold`));
    }

    if (m.memoryUsage > 90) {
      issues.push(this.createIssue(component, 'memory_pressure', 'critical',
        `Memory usage (${m.memoryUsage}%) critical`));
    } else if (m.memoryUsage > 80) {
      issues.push(this.createIssue(component, 'memory_pressure', 'high',
        `Memory usage (${m.memoryUsage}%) high`));
    }

    if (m.cpuUsage > 90) {
      issues.push(this.createIssue(component, 'cpu_saturation', 'critical',
        `CPU usage (${m.cpuUsage}%) saturated`));
    }

    if (m.connectionPoolUsage && m.connectionPoolUsage > 90) {
      issues.push(this.createIssue(component, 'connection_exhaustion', 'high',
        `Connection pool (${m.connectionPoolUsage}%) nearly exhausted`));
    }

    if (m.queueDepth && m.queueDepth > 1000) {
      issues.push(this.createIssue(component, 'queue_backlog', 'high',
        `Queue depth (${m.queueDepth}) indicates backlog`));
    }

    // Update component status
    if (issues.some(i => i.severity === 'critical')) {
      component.status = 'unhealthy';
    } else if (issues.some(i => i.severity === 'high')) {
      component.status = 'degraded';
    } else {
      component.status = 'healthy';
    }

    // Process issues
    for (const issue of issues) {
      this.processIssue(issue);
    }
  }

  private createIssue(
    component: SystemComponent,
    type: IssueType,
    severity: HealthIssue['severity'],
    description: string
  ): HealthIssue {
    const id = `issue-${component.id}-${type}-${Date.now()}`;
    
    return {
      id,
      componentId: component.id,
      componentName: component.name,
      severity,
      type,
      description,
      detectedAt: new Date(),
      metrics: { ...component.metrics },
      autoHealable: component.healingEnabled && this.isAutoHealable(type),
      healingAttempts: [],
      status: 'detected',
      rootCause: this.analyzeRootCause(component, type)
    };
  }

  private isAutoHealable(type: IssueType): boolean {
    const healableTypes: IssueType[] = [
      'high_latency',
      'high_error_rate',
      'memory_pressure',
      'connection_exhaustion',
      'queue_backlog',
      'cache_miss_rate'
    ];
    return healableTypes.includes(type);
  }

  private analyzeRootCause(component: SystemComponent, type: IssueType): string {
    const m = component.metrics;

    switch (type) {
      case 'high_latency':
        if (m.memoryUsage > 80) return 'Memory pressure causing slowdown';
        if (m.cpuUsage > 80) return 'CPU saturation causing slowdown';
        if (m.connectionPoolUsage && m.connectionPoolUsage > 70) return 'Connection pool contention';
        return 'Likely external dependency latency';

      case 'high_error_rate':
        if (component.dependencies.length > 0) return 'Possible dependency failure cascade';
        if (m.memoryUsage > 90) return 'Out of memory errors';
        return 'Application errors - review logs';

      case 'memory_pressure':
        return 'Memory leak or insufficient allocation';

      case 'cpu_saturation':
        return 'Computational bottleneck or runaway process';

      case 'connection_exhaustion':
        return 'Connection leak or insufficient pool size';

      default:
        return 'Unknown - manual investigation required';
    }
  }

  private async processIssue(issue: HealthIssue): Promise<void> {
    // Check for existing issue
    const existingKey = `${issue.componentId}-${issue.type}`;
    const existing = this.issues.get(existingKey);
    
    if (existing && existing.status !== 'healed' && existing.status !== 'resolved') {
      // Update existing issue
      existing.metrics = issue.metrics;
      existing.severity = issue.severity;
      return;
    }

    // Store new issue
    this.issues.set(existingKey, issue);

    // Attempt auto-healing if enabled
    if (issue.autoHealable) {
      await this.attemptHealing(issue);
    }
  }

  private async attemptHealing(issue: HealthIssue): Promise<boolean> {
    // Find applicable rule
    const rule = this.findApplicableRule(issue);
    if (!rule) return false;

    // Check cooldown
    const lastAttempt = this.lastAttemptTime.get(issue.componentId);
    if (lastAttempt) {
      const minutesSinceLastAttempt = (Date.now() - lastAttempt.getTime()) / 60000;
      if (minutesSinceLastAttempt < rule.cooldownMinutes) {
        return false;
      }
    }

    // Check max attempts
    const recentAttempts = issue.healingAttempts.filter(a => 
      (Date.now() - a.startedAt.getTime()) < 3600000 // Last hour
    );
    if (recentAttempts.length >= rule.maxAttemptsPerHour) {
      issue.status = 'escalated';
      return false;
    }

    // Execute healing actions
    issue.status = 'healing';
    
    for (const action of rule.actions) {
      if (action.requiresApproval) {
        console.log(`[SelfHealing] Action ${action.type} requires approval - skipping`);
        continue;
      }

      const attempt = await this.executeHealingAction(issue, action);
      issue.healingAttempts.push(attempt);
      this.healingHistory.push(attempt);

      if (attempt.success) {
        issue.status = 'healed';
        this.lastAttemptTime.set(issue.componentId, new Date());
        return true;
      }
    }

    // Check if should escalate
    if (issue.healingAttempts.length >= rule.escalateAfterAttempts) {
      issue.status = 'escalated';
    }

    return false;
  }

  private findApplicableRule(issue: HealthIssue): HealingRule | null {
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      const matches = rule.conditions.every(condition => {
        if (condition.metric === 'status') {
          const component = this.components.get(issue.componentId);
          return component?.status === condition.threshold;
        }

        const metricValue = issue.metrics[condition.metric as keyof ComponentMetrics];
        if (metricValue === undefined) return false;

        const threshold = typeof condition.threshold === 'number' ? condition.threshold : parseFloat(String(condition.threshold));
        switch (condition.operator) {
          case '>': return metricValue > threshold;
          case '<': return metricValue < threshold;
          case '>=': return metricValue >= threshold;
          case '<=': return metricValue <= threshold;
          case '==': return metricValue === threshold;
          case '!=': return metricValue !== threshold;
          default: return false;
        }
      });

      if (matches) return rule;
    }

    return null;
  }

  private async executeHealingAction(
    issue: HealthIssue,
    action: HealingAction
  ): Promise<HealingAttempt> {
    const attempt: HealingAttempt = {
      id: `heal-${Date.now()}`,
      action,
      startedAt: new Date(),
      success: false,
      result: '',
      rollbackPerformed: false
    };

    try {
      console.log(`[SelfHealing] Executing ${action.type} on ${issue.componentName}`);

      // Simulate healing actions
      switch (action.type) {
        case 'clear_cache':
          await this.simulateAction(action.estimatedDuration);
          attempt.result = 'Cache cleared successfully';
          attempt.success = true;
          break;

        case 'restart':
          await this.simulateAction(action.estimatedDuration);
          attempt.result = 'Component restarted successfully';
          attempt.success = true;
          break;

        case 'scale':
          await this.simulateAction(action.estimatedDuration);
          attempt.result = `Scaled ${action.parameters.direction} by factor ${action.parameters.factor}`;
          attempt.success = true;
          break;

        case 'reconnect':
          await this.simulateAction(action.estimatedDuration);
          attempt.result = 'Connections reset and pool refreshed';
          attempt.success = true;
          break;

        case 'circuit_break':
          await this.simulateAction(action.estimatedDuration);
          attempt.result = `Circuit breaker activated for ${action.parameters.duration}s`;
          attempt.success = true;
          break;

        case 'failover':
          await this.simulateAction(action.estimatedDuration);
          attempt.result = 'Failover to backup completed';
          attempt.success = true;
          break;

        default:
          attempt.result = 'Unknown action type';
          attempt.success = false;
      }

      // Verify healing worked
      if (attempt.success) {
        const component = this.components.get(issue.componentId);
        if (component) {
          // In a real system, this would re-check metrics
          component.status = 'healthy';
        }
      }

    } catch (error) {
      attempt.result = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      attempt.success = false;
    }

    attempt.completedAt = new Date();
    return attempt;
  }

  private simulateAction(durationSeconds: number): Promise<void> {
    // In production, this would execute actual healing actions
    return new Promise(resolve => setTimeout(resolve, Math.min(durationSeconds * 100, 1000)));
  }

  getSystemHealth(): SystemHealth {
    const components = Array.from(this.components.values());
    const activeIssues = Array.from(this.issues.values())
      .filter(i => i.status !== 'healed' && i.status !== 'resolved');

    const healthScore = this.calculateHealthScore(components, activeIssues);
    const overallStatus: SystemHealth['overallStatus'] = 
      healthScore >= 90 ? 'healthy' :
      healthScore >= 70 ? 'degraded' : 'critical';

    const uptime = components.length > 0
      ? components.reduce((sum, c) => sum + c.metrics.availability, 0) / components.length
      : 100;

    return {
      overallStatus,
      healthScore,
      components,
      activeIssues,
      recentHealings: this.healingHistory.slice(-10),
      uptime,
      lastFullScan: new Date(),
      nextScheduledScan: new Date(Date.now() + 60000) // 1 minute
    };
  }

  private calculateHealthScore(components: SystemComponent[], activeIssues: HealthIssue[]): number {
    if (components.length === 0) return 100;

    let score = 100;

    // Deduct for unhealthy components
    const unhealthy = components.filter(c => c.status === 'unhealthy').length;
    const degraded = components.filter(c => c.status === 'degraded').length;
    
    score -= (unhealthy / components.length) * 40;
    score -= (degraded / components.length) * 15;

    // Deduct for active issues
    const critical = activeIssues.filter(i => i.severity === 'critical').length;
    const high = activeIssues.filter(i => i.severity === 'high').length;
    
    score -= critical * 10;
    score -= high * 5;

    return Math.max(0, Math.min(100, score));
  }

  generateReport(startDate: Date, endDate: Date): HealingReport {
    const periodAttempts = this.healingHistory.filter(a =>
      a.startedAt >= startDate && a.startedAt <= endDate
    );

    const periodIssues = Array.from(this.issues.values()).filter(i =>
      i.detectedAt >= startDate && i.detectedAt <= endDate
    );

    const successful = periodAttempts.filter(a => a.success);
    const escalated = periodIssues.filter(i => i.status === 'escalated');

    // Calculate MTTR
    const healedIssues = periodIssues.filter(i => 
      i.status === 'healed' && 
      i.healingAttempts.length > 0 &&
      i.healingAttempts[i.healingAttempts.length - 1].completedAt
    );
    
    const mttr = healedIssues.length > 0
      ? healedIssues.reduce((sum, i) => {
          const lastAttempt = i.healingAttempts[i.healingAttempts.length - 1];
          return sum + (lastAttempt.completedAt!.getTime() - i.detectedAt.getTime()) / 60000;
        }, 0) / healedIssues.length
      : 0;

    // Issue type breakdown
    const typeCount = new Map<IssueType, number>();
    for (const issue of periodIssues) {
      typeCount.set(issue.type, (typeCount.get(issue.type) || 0) + 1);
    }

    // Component reliability
    const componentStats = new Map<string, { availability: number; incidents: number }>();
    for (const component of this.components.values()) {
      const incidents = periodIssues.filter(i => i.componentId === component.id).length;
      componentStats.set(component.id, {
        availability: component.metrics.availability,
        incidents
      });
    }

    return {
      periodStart: startDate,
      periodEnd: endDate,
      totalIssuesDetected: periodIssues.length,
      autoHealed: successful.length,
      escalated: escalated.length,
      mttr,
      healingSuccessRate: periodAttempts.length > 0 
        ? (successful.length / periodAttempts.length) * 100 
        : 100,
      topIssueTypes: Array.from(typeCount.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
      componentReliability: Array.from(componentStats.entries())
        .map(([componentId, stats]) => ({ componentId, ...stats })),
      savings: {
        estimatedDowntimeAvoided: successful.length * 0.5, // Assume 30 min avg per issue
        estimatedCostSaved: successful.length * 500 // $500 per avoided incident
      }
    };
  }

  // Manual resolution
  resolveIssue(issueId: string, resolution: string): void {
    for (const issue of this.issues.values()) {
      if (issue.id === issueId) {
        issue.status = 'resolved';
        issue.rootCause = resolution;
        break;
      }
    }
  }

  // Rule management
  addRule(rule: HealingRule): void {
    this.rules.set(rule.id, rule);
  }

  updateRule(ruleId: string, updates: Partial<HealingRule>): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      Object.assign(rule, updates);
    }
  }

  toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  getRules(): HealingRule[] {
    return Array.from(this.rules.values());
  }
}

export const selfHealingSystemEngine = new SelfHealingSystemEngine();
