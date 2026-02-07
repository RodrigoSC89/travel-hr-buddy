/**
 * M003 - Adaptive Voting Weights with RLHF
 * Dynamic weight calculation based on agent performance metrics
 * Inspired by Google DeepMind's adaptive learning systems
 */

import { supabase } from '@/integrations/supabase/client';

export interface AgentPerformance {
  agentId: string;
  name: string;
  totalTasks: number;
  successCount: number;
  errorCount: number;
  avgResponseTimeMs: number;
  approvalRate: number;
  accuracy: number;
  baseWeight: number;
  dynamicWeight: number;
  weightTrend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

export interface ConsensusVote {
  agentId: string;
  decision: string;
  confidence: number;
  weight: number;
  reasoning: string;
}

export interface ConsensusResult {
  finalDecision: string;
  totalConfidence: number;
  votes: ConsensusVote[];
  agreement: number; // 0-100%
  method: 'weighted-majority' | 'unanimous' | 'supervisor-override';
}

class AdaptiveWeightsService {
  private performanceCache: Map<string, AgentPerformance> = new Map();
  private readonly BASE_WEIGHT = 0.25;
  private readonly PERFORMANCE_BONUS_MAX = 0.50;
  private readonly ACCURACY_BONUS_MAX = 0.25;

  /**
   * Calculate dynamic weight for an agent based on performance
   */
  calculateDynamicWeight(metrics: {
    successRate: number;
    accuracy: number;
    avgResponseTimeMs: number;
    totalTasks: number;
  }): number {
    const { successRate, accuracy, avgResponseTimeMs, totalTasks } = metrics;

    // Base weight
    let weight = this.BASE_WEIGHT;

    // Performance bonus (up to +50%)
    const performanceBonus = successRate * this.PERFORMANCE_BONUS_MAX;
    weight += performanceBonus;

    // Accuracy bonus (up to +25%)
    const accuracyBonus = accuracy * this.ACCURACY_BONUS_MAX;
    weight += accuracyBonus;

    // Speed penalty for very slow agents (>5s avg)
    if (avgResponseTimeMs > 5000) {
      weight *= 0.9;
    }

    // Experience bonus for high-volume agents
    if (totalTasks > 100) {
      weight *= 1.05;
    }

    return Math.min(Math.max(weight, 0.1), 1.0);
  }

  /**
   * Fetch real performance data from Supabase
   */
  async fetchAgentPerformance(): Promise<AgentPerformance[]> {
    const { data: metrics, error } = await supabase
      .from('agent_swarm_metrics')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error || !metrics) return [];

    return metrics.map(m => {
      const successRate = m.task_count > 0 ? m.success_count / m.task_count : 0;
      const accuracy = m.task_count > 0 ? m.success_count / m.task_count : 0;
      const dynamicWeight = this.calculateDynamicWeight({
        successRate,
        accuracy,
        avgResponseTimeMs: m.avg_response_time_ms,
        totalTasks: m.task_count,
      });

      const perf: AgentPerformance = {
        agentId: m.agent_id,
        name: m.agent_id,
        totalTasks: m.task_count,
        successCount: m.success_count,
        errorCount: m.error_count,
        avgResponseTimeMs: m.avg_response_time_ms,
        approvalRate: successRate,
        accuracy,
        baseWeight: this.BASE_WEIGHT,
        dynamicWeight,
        weightTrend: dynamicWeight > this.BASE_WEIGHT + 0.1 ? 'up' : dynamicWeight < this.BASE_WEIGHT - 0.05 ? 'down' : 'stable',
        lastUpdated: new Date(m.updated_at),
      };

      this.performanceCache.set(m.agent_id, perf);
      return perf;
    });
  }

  /**
   * Run weighted consensus among multiple agents
   */
  runWeightedConsensus(votes: ConsensusVote[]): ConsensusResult {
    if (votes.length === 0) {
      return { finalDecision: 'NO_VOTES', totalConfidence: 0, votes: [], agreement: 0, method: 'weighted-majority' };
    }

    // Check for unanimous decision
    const uniqueDecisions = [...new Set(votes.map(v => v.decision))];
    if (uniqueDecisions.length === 1) {
      const avgConfidence = votes.reduce((sum, v) => sum + v.confidence * v.weight, 0) / votes.reduce((sum, v) => sum + v.weight, 0);
      return {
        finalDecision: uniqueDecisions[0],
        totalConfidence: avgConfidence,
        votes,
        agreement: 100,
        method: 'unanimous',
      };
    }

    // Weighted majority voting
    const decisionScores = new Map<string, number>();
    let totalWeight = 0;

    for (const vote of votes) {
      const score = vote.confidence * vote.weight;
      decisionScores.set(vote.decision, (decisionScores.get(vote.decision) || 0) + score);
      totalWeight += vote.weight;
    }

    // Find winning decision
    let bestDecision = '';
    let bestScore = 0;
    for (const [decision, score] of decisionScores) {
      if (score > bestScore) {
        bestScore = score;
        bestDecision = decision;
      }
    }

    // Calculate agreement %
    const agreeingVotes = votes.filter(v => v.decision === bestDecision);
    const agreement = (agreeingVotes.length / votes.length) * 100;

    return {
      finalDecision: bestDecision,
      totalConfidence: bestScore / totalWeight,
      votes,
      agreement,
      method: 'weighted-majority',
    };
  }

  /**
   * Get cached performance for an agent
   */
  getCachedPerformance(agentId: string): AgentPerformance | undefined {
    return this.performanceCache.get(agentId);
  }

  /**
   * Get weight distribution summary
   */
  getWeightDistribution(): { agentId: string; weight: number; trend: string }[] {
    return Array.from(this.performanceCache.values()).map(p => ({
      agentId: p.agentId,
      weight: p.dynamicWeight,
      trend: p.weightTrend,
    }));
  }
}

export const adaptiveWeights = new AdaptiveWeightsService();
