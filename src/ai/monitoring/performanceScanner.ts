/**
 * PATCH 235: Multi-Agent Performance Scanner
 * 
 * Continuous monitoring system for AI agents and copilotsith ranking,
 * failure detection, and automatic agent switching.
 */

import { supabase } from '@/integrations/supabase/client';

export interface AgentMetrics {
  agentId: string;
  agentName: string;
  agentType: 'copilot' | 'assistant' | 'autonomous' | 'worker';
  performance: {
    successRate: number;
    avgResponseTime: number;
    errorRate: number;
    accuracyScore: number;
    userRating: number;
    tasksCompleted: number;
    tasksInProgress: number;
    tasksFailed: number;
  };
  resourceUsage: {
    cpuUsage: number;
    memoryUsage: number;
    apiCallsPerHour: number;
    tokenUsage: number;
  };
  availability: {
    uptime: number;
    lastSeen: string;
    status: 'active' | 'idle' | 'busy' | 'offline' | 'error';
  };
  specialization: string[];
  version: string;
  lastUpdated: string;
}

export interface AgentRanking {
  rank: number;
  agentId: string;
  agentName: string;
  overallScore: number;
  categoryScores: {
    performance: number;
    reliability: number;
    efficiency: number;
    quality: number;
  };
  trend: 'improving' | 'stable' | 'declining';
}

export interface FailureDetection {
  agentId: string;
  agentName: string;
  failureType: 'high_error_rate' | 'slow_response' | 'low_accuracy' | 'unavailable' | 'resource_exhaustion';
  severity: 'warning' | 'critical';
  details: string;
  timestamp: string;
  recommendations: string[];
}

export interface AgentSwitch {
  fromAgentId: string;
  toAgentId: string;
  reason: string;
  taskId: string;
  timestamp: string;
  success: boolean;
}

export class MultiAgentPerformanceScanner {
  private scanInterval: number = 60000; // 1 minute
  private isScanning: boolean = false;
  private thresholds = {
    minSuccessRate: 0.85,
    maxErrorRate: 0.10,
    maxResponseTime: 5000, // ms
    minAccuracy: 0.80,
    minUptime: 0.95,
  };

  /**
   * Start continuous scanning
   */
  startScanning(): void {
    if (this.isScanning) return;

    this.isScanning = true;
    this.scan();
    setInterval(() => this.scan(), this.scanInterval);
    console.log('🔍 Multi-Agent Performance Scanner started');
  }

  /**
   * Stop scanning
   */
  stopScanning(): void {
    this.isScanning = false;
    console.log('⏹️ Multi-Agent Performance Scanner stopped');
  }

  /**
   * Perform complete scan cycle
   */
  private async scan(): Promise<void> {
    if (!this.isScanning) return;

    try {
      // 1. Collect metrics from all agents
      const metrics = await this.collectAllMetrics();

      // 2. Store metrics
      await this.storeMetrics(metrics);

      // 3. Detect failures
      const failures = await this.detectFailures(metrics);

      // 4. Handle failures (trigger switches if needed)
      if (failures.length > 0) {
        await this.handleFailures(failures, metrics);
      }

      // 5. Update rankings
      await this.updateRankings(metrics);

    } catch (error) {
      console.error('Error during performance scan:', error);
    }
  }

  /**
   * Collect metrics from all agents
   */
  async collectAllMetrics(): Promise<AgentMetrics[]> {
    // This would query multiple sources: agent registries, task logs, resource monitors
    // For simulation, return sample agents
    return [
      {
        agentId: 'copilot-gpt4',
        agentName: 'GPT-4 Copilot',
        agentType: 'copilot',
        performance: {
          successRate: 0.94,
          avgResponseTime: 2300,
          errorRate: 0.04,
          accuracyScore: 0.91,
          userRating: 4.5,
          tasksCompleted: 1250,
          tasksInProgress: 5,
          tasksFailed: 52,
        },
        resourceUsage: {
          cpuUsage: 35,
          memoryUsage: 512,
          apiCallsPerHour: 450,
          tokenUsage: 125000,
        },
        availability: {
          uptime: 0.98,
          lastSeen: new Date().toISOString(),
          status: 'active',
        },
        specialization: ['code_generation', 'analysis', 'documentation'],
        version: '4.0',
        lastUpdated: new Date().toISOString(),
      },
      {
        agentId: 'assistant-claude',
        agentName: 'Claude Assistant',
        agentType: 'assistant',
        performance: {
          successRate: 0.89,
          avgResponseTime: 1800,
          errorRate: 0.08,
          accuracyScore: 0.87,
          userRating: 4.2,
          tasksCompleted: 980,
          tasksInProgress: 3,
          tasksFailed: 95,
        },
        resourceUsage: {
          cpuUsage: 28,
          memoryUsage: 384,
          apiCallsPerHour: 380,
          tokenUsage: 95000,
        },
        availability: {
          uptime: 0.96,
          lastSeen: new Date().toISOString(),
          status: 'active',
        },
        specialization: ['conversation', 'reasoning', 'planning'],
        version: '3.5',
        lastUpdated: new Date().toISOString(),
      },
      {
        agentId: 'worker-local-llm',
        agentName: 'Local LLM Worker',
        agentType: 'worker',
        performance: {
          successRate: 0.78,
          avgResponseTime: 3500,
          errorRate: 0.15,
          accuracyScore: 0.75,
          userRating: 3.8,
          tasksCompleted: 650,
          tasksInProgress: 8,
          tasksFailed: 180,
        },
        resourceUsage: {
          cpuUsage: 85,
          memoryUsage: 2048,
          apiCallsPerHour: 0,
          tokenUsage: 0,
        },
        availability: {
          uptime: 0.88,
          lastSeen: new Date().toISOString(),
          status: 'busy',
        },
        specialization: ['simple_tasks', 'offline_mode'],
        version: '1.0',
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  /**
   * Detect agent failures and issues
   */
  async detectFailures(metrics: AgentMetrics[]): Promise<FailureDetection[]> {
    const failures: FailureDetection[] = [];

    for (const agent of metrics) {
      // Check success rate
      if (agent.performance.successRate < this.thresholds.minSuccessRate) {
        failures.push({
          agentId: agent.agentId,
          agentName: agent.agentName,
          failureType: 'high_error_rate',
          severity: agent.performance.successRate < 0.70 ? 'critical' : 'warning',
          details: `Success rate ${(agent.performance.successRate * 100).toFixed(1)}% below threshold ${(this.thresholds.minSuccessRate * 100).toFixed(1)}%`,
          timestamp: new Date().toISOString(),
          recommendations: [
            'Review recent task failures',
            'Check agent configuration',
            'Consider switching to backup agent',
          ],
        });
      }

      // Check error rate
      if (agent.performance.errorRate > this.thresholds.maxErrorRate) {
        failures.push({
          agentId: agent.agentId,
          agentName: agent.agentName,
          failureType: 'high_error_rate',
          severity: agent.performance.errorRate > 0.20 ? 'critical' : 'warning',
          details: `Error rate ${(agent.performance.errorRate * 100).toFixed(1)}% above threshold ${(this.thresholds.maxErrorRate * 100).toFixed(1)}%`,
          timestamp: new Date().toISOString(),
          recommendations: [
            'Investigate error patterns',
            'Update agent logic',
            'Implement better error handling',
          ],
        });
      }

      // Check response time
      if (agent.performance.avgResponseTime > this.thresholds.maxResponseTime) {
        failures.push({
          agentId: agent.agentId,
          agentName: agent.agentName,
          failureType: 'slow_response',
          severity: agent.performance.avgResponseTime > 10000 ? 'critical' : 'warning',
          details: `Average response time ${agent.performance.avgResponseTime}ms exceeds ${this.thresholds.maxResponseTime}ms`,
          timestamp: new Date().toISOString(),
          recommendations: [
            'Optimize agent processing',
            'Check resource availability',
            'Consider load balancing',
          ],
        });
      }

      // Check accuracy
      if (agent.performance.accuracyScore < this.thresholds.minAccuracy) {
        failures.push({
          agentId: agent.agentId,
          agentName: agent.agentName,
          failureType: 'low_accuracy',
          severity: agent.performance.accuracyScore < 0.70 ? 'critical' : 'warning',
          details: `Accuracy ${(agent.performance.accuracyScore * 100).toFixed(1)}% below threshold ${(this.thresholds.minAccuracy * 100).toFixed(1)}%`,
          timestamp: new Date().toISOString(),
          recommendations: [
            'Retrain or update agent model',
            'Review training data quality',
            'Adjust agent parameters',
          ],
        });
      }

      // Check availability
      if (agent.availability.uptime < this.thresholds.minUptime) {
        failures.push({
          agentId: agent.agentId,
          agentName: agent.agentName,
          failureType: 'unavailable',
          severity: agent.availability.uptime < 0.80 ? 'critical' : 'warning',
          details: `Uptime ${(agent.availability.uptime * 100).toFixed(1)}% below threshold ${(this.thresholds.minUptime * 100).toFixed(1)}%`,
          timestamp: new Date().toISOString(),
          recommendations: [
            'Investigate downtime causes',
            'Implement redundancy',
            'Set up health checks',
          ],
        });
      }

      // Check resource exhaustion
      if (agent.resourceUsage.cpuUsage > 90 || agent.resourceUsage.memoryUsage > 3000) {
        failures.push({
          agentId: agent.agentId,
          agentName: agent.agentName,
          failureType: 'resource_exhaustion',
          severity: 'critical',
          details: `Resource usage: CPU ${agent.resourceUsage.cpuUsage}%, Memory ${agent.resourceUsage.memoryUsage}MB`,
          timestamp: new Date().toISOString(),
          recommendations: [
            'Scale resources',
            'Optimize agent resource usage',
            'Distribute load to other agents',
          ],
        });
      }
    }

    return failures;
  }

  /**
   * Generate agent rankings
   */
  async generateRankings(metrics: AgentMetrics[]): Promise<AgentRanking[]> {
    const rankings: AgentRanking[] = [];

    for (const agent of metrics) {
      const categoryScores = {
        performance: this.calculatePerformanceScore(agent.performance),
        reliability: this.calculateReliabilityScore(agent.performance, agent.availability),
        efficiency: this.calculateEfficiencyScore(agent.performance, agent.resourceUsage),
        quality: this.calculateQualityScore(agent.performance),
      };

      const overallScore = (
        categoryScores.performance * 0.3 +
        categoryScores.reliability * 0.3 +
        categoryScores.efficiency * 0.2 +
        categoryScores.quality * 0.2
      );

      const trend = await this.calculateTrend(agent.agentId);

      rankings.push({
        rank: 0, // Will be assigned after sorting
        agentId: agent.agentId,
        agentName: agent.agentName,
        overallScore,
        categoryScores,
        trend,
      });
    }

    // Sort by score and assign ranks
    rankings.sort((a, b) => b.overallScore - a.overallScore);
    rankings.forEach((r, i) => r.rank = i + 1);

    return rankings;
  }

  /**
   * Handle detected failures
   */
  private async handleFailures(
    failures: FailureDetection[],
    allMetrics: AgentMetrics[]
  ): Promise<void> {
    for (const failure of failures) {
      if (failure.severity === 'critical') {
        // Find replacement agent
        const replacementAgent = await this.findReplacementAgent(
          failure.agentId,
          allMetrics
        );

        if (replacementAgent) {
          // Switch to better agent
          await this.switchAgent(failure.agentId, replacementAgent.agentId, failure.details);
        }
      }

      // Log failure
      console.warn(`⚠️ Agent failure detected: ${failure.agentName} - ${failure.details}`);
    }
  }

  /**
   * Find suitable replacement agent
   */
  private async findReplacementAgent(
    failingAgentId: string,
    allMetrics: AgentMetrics[]
  ): Promise<AgentMetrics | null> {
    const failingAgent = allMetrics.find(a => a.agentId === failingAgentId);
    if (!failingAgent) return null;

    // Find agents with similar specializations and better performance
    const candidates = allMetrics.filter(agent =>
      agent.agentId !== failingAgentId &&
      agent.availability.status === 'active' &&
      agent.performance.successRate > failingAgent.performance.successRate + 0.05 &&
      this.hasOverlappingSpecialization(agent.specialization, failingAgent.specialization)
    );

    if (candidates.length === 0) return null;

    // Return the best performing candidate
    candidates.sort((a, b) => b.performance.successRate - a.performance.successRate);
    return candidates[0];
  }

  /**
   * Switch from one agent to another
   */
  private async switchAgent(
    fromAgentId: string,
    toAgentId: string,
    reason: string
  ): Promise<void> {
    const switchRecord: Omit<AgentSwitch, 'taskId'> = {
      fromAgentId,
      toAgentId,
      reason,
      timestamp: new Date().toISOString(),
      success: true,
    };

    console.log(`🔄 Switching from ${fromAgentId} to ${toAgentId}: ${reason}`);

    // Log the switch
    // In a real implementation, this would also redirect tasks
    try {
      await supabase.from('agent_performance_metrics').insert({
        agent_id: toAgentId,
        metric_type: 'switch',
        metric_value: 1,
        context: switchRecord,
        timestamp: switchRecord.timestamp,
      });
    } catch (error) {
      console.error('Failed to log agent switch:', error);
    }
  }

  /**
   * Store agent metrics
   */
  private async storeMetrics(metrics: AgentMetrics[]): Promise<void> {
    try {
      const records = metrics.map(m => ({
        agent_id: m.agentId,
        agent_name: m.agentName,
        agent_type: m.agentType,
        performance_data: m.performance,
        resource_usage: m.resourceUsage,
        availability_data: m.availability,
        specialization: m.specialization,
        version: m.version,
        timestamp: new Date().toISOString(),
      }));

      await supabase.from('agent_performance_metrics').insert(records);
    } catch (error) {
      console.error('Failed to store metrics:', error);
    }
  }

  /**
   * Update agent rankings
   */
  private async updateRankings(metrics: AgentMetrics[]): Promise<void> {
    const rankings = await this.generateRankings(metrics);
    
    // Store rankings for historical tracking
    try {
      const records = rankings.map(r => ({
        agent_id: r.agentId,
        rank: r.rank,
        overall_score: r.overallScore,
        category_scores: r.categoryScores,
        trend: r.trend,
        timestamp: new Date().toISOString(),
      }));

      await supabase.from('agent_performance_metrics').insert(records);
    } catch (error) {
      console.error('Failed to update rankings:', error);
    }
  }

  // Scoring helpers
  private calculatePerformanceScore(performance: AgentMetrics['performance']): number {
    return (
      performance.successRate * 0.4 +
      (1 - performance.errorRate) * 0.3 +
      Math.min(1, 5000 / performance.avgResponseTime) * 0.3
    );
  }

  private calculateReliabilityScore(
    performance: AgentMetrics['performance'],
    availability: AgentMetrics['availability']
  ): number {
    return (
      availability.uptime * 0.5 +
      performance.successRate * 0.3 +
      (availability.status === 'active' ? 0.2 : 0)
    );
  }

  private calculateEfficiencyScore(
    performance: AgentMetrics['performance'],
    resources: AgentMetrics['resourceUsage']
  ): number {
    const cpuEfficiency = 1 - (resources.cpuUsage / 100);
    const memoryEfficiency = 1 - Math.min(1, resources.memoryUsage / 4096);
    const throughput = performance.tasksCompleted / (performance.tasksCompleted + performance.tasksFailed + 1);

    return (cpuEfficiency * 0.3 + memoryEfficiency * 0.3 + throughput * 0.4);
  }

  private calculateQualityScore(performance: AgentMetrics['performance']): number {
    return (
      performance.accuracyScore * 0.5 +
      (performance.userRating / 5) * 0.5
    );
  }

  private async calculateTrend(agentId: string): Promise<'improving' | 'stable' | 'declining'> {
    // This would analyze historical data
    // For simulation, return random trend
    const trends: Array<'improving' | 'stable' | 'declining'> = ['improving', 'stable', 'declining'];
    return trends[Math.floor(Math.random() * trends.length)];
  }

  private hasOverlappingSpecialization(spec1: string[], spec2: string[]): boolean {
    return spec1.some(s => spec2.includes(s));
  }

  /**
   * Get current rankings
   */
  async getRankings(): Promise<AgentRanking[]> {
    const metrics = await this.collectAllMetrics();
    return this.generateRankings(metrics);
  }

  /**
   * Get agent metrics by ID
   */
  async getAgentMetrics(agentId: string): Promise<AgentMetrics | null> {
    const metrics = await this.collectAllMetrics();
    return metrics.find(m => m.agentId === agentId) || null;
  }
}

// Export singleton instance
export const multiAgentPerformanceScanner = new MultiAgentPerformanceScanner();
