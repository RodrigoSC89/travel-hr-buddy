/**
 * PATCH 615 - Joint Copilot Strategy Recommender
 * Unified strategy recommendation across multiple copilots
 * Aggregates voice, navigation, and mission copilot data
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';
import { graphInferenceEngine } from '../inference/graph-engine';
import { contextualThreatMonitor } from '../security/context-threat-monitor';

export type CopilotType = 'voice' | 'navigation' | 'mission' | 'tactical';

export interface CopilotData {
  type: CopilotType;
  status: 'active' | 'idle' | 'busy';
  currentContext: Record<string, any>;
  recentDecisions: Array<{
    id: string;
    decision: string;
    confidence: number;
    timestamp: Date;
  }>;
  metrics: {
    accuracy: number;
    responseTime: number;
    userSatisfaction: number;
  };
}

export interface StrategyRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  reasoning: string[];
  sources: Array<{
    copilotType: CopilotType;
    contribution: number; // 0-1
    keyData: Record<string, any>;
  }>;
  actions: Array<{
    step: number;
    description: string;
    assignedTo: CopilotType;
    estimatedDuration: number; // minutes
  }>;
  expectedOutcome: string;
  alternatives: string[];
  risks: Array<{ description: string; mitigation: string }>;
  timestamp: Date;
}

export interface UserResponse {
  recommendationId: string;
  action: 'accept' | 'reject' | 'defer';
  feedback?: string;
  timestamp: Date;
}

class JointCopilotStrategyRecommender {
  private copilots: Map<CopilotType, CopilotData> = new Map();
  private recommendations: Map<string, StrategyRecommendation> = new Map();
  private userResponses: UserResponse[] = [];
  private isInitialized = false;

  /**
   * Initialize the recommender system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('[CopilotRecommender] Already initialized');
      return;
    }

    logger.info('[CopilotRecommender] Initializing joint copilot strategy recommender...');

    // Initialize dependencies
    await graphInferenceEngine.initialize();
    await contextualThreatMonitor.start();

    // Initialize copilot data
    this.initializeCopilots();

    this.isInitialized = true;
    logger.info('[CopilotRecommender] Recommender system initialized');
  }

  /**
   * Initialize copilot data structures
   */
  private initializeCopilots(): void {
    const copilotTypes: CopilotType[] = ['voice', 'navigation', 'mission', 'tactical'];

    for (const type of copilotTypes) {
      this.copilots.set(type, {
        type,
        status: 'active',
        currentContext: {},
        recentDecisions: [],
        metrics: {
          accuracy: 0.85 + Math.random() * 0.1,
          responseTime: 100 + Math.random() * 200,
          userSatisfaction: 0.8 + Math.random() * 0.15,
        },
      });
    }

    logger.debug(`[CopilotRecommender] Initialized ${copilotTypes.length} copilots`);
  }

  /**
   * Update copilot data
   */
  updateCopilotData(type: CopilotType, data: Partial<CopilotData>): void {
    const copilot = this.copilots.get(type);
    if (copilot) {
      Object.assign(copilot, data);
      logger.debug(`[CopilotRecommender] Updated ${type} copilot data`);
    }
  }

  /**
   * Aggregate data from all copilots
   */
  private aggregateCopilotData(): Record<string, any> {
    const aggregated: Record<string, any> = {
      copilots: {},
      systemHealth: 0,
      totalDecisions: 0,
      averageConfidence: 0,
    };

    let totalConfidence = 0;
    let confidenceCount = 0;

    for (const [type, copilot] of this.copilots.entries()) {
      aggregated.copilots[type] = {
        status: copilot.status,
        metrics: copilot.metrics,
        recentDecisions: copilot.recentDecisions.length,
      };

      aggregated.totalDecisions += copilot.recentDecisions.length;

      // Calculate average confidence
      for (const decision of copilot.recentDecisions) {
        totalConfidence += decision.confidence;
        confidenceCount++;
      }
    }

    aggregated.averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;
    aggregated.systemHealth = this.calculateSystemHealth();

    return aggregated;
  }

  /**
   * Calculate overall system health
   */
  private calculateSystemHealth(): number {
    let health = 100;

    // Check copilot metrics
    for (const copilot of this.copilots.values()) {
      if (copilot.status !== 'active') health -= 10;
      if (copilot.metrics.accuracy < 0.7) health -= 15;
      if (copilot.metrics.userSatisfaction < 0.7) health -= 10;
    }

    // Check for threats
    const threats = contextualThreatMonitor.getActiveThreats();
    health -= threats.length * 5;

    // Check graph bottlenecks
    const bottlenecks = graphInferenceEngine.detectBottlenecks();
    const criticalBottlenecks = bottlenecks.filter((b) => b.severity === 'critical');
    health -= criticalBottlenecks.length * 10;

    return Math.max(0, Math.min(100, health));
  }

  /**
   * Generate unified strategy recommendation
   */
  async generateRecommendation(context?: Record<string, any>): Promise<StrategyRecommendation> {
    logger.info('[CopilotRecommender] Generating unified strategy recommendation...');

    // Aggregate copilot data
    const aggregatedData = this.aggregateCopilotData();

    // Collect insights from each copilot
    const insights = await this.collectCopilotInsights(context);

    // Analyze unified strategy
    const strategy = await this.analyzeUnifiedStrategy(aggregatedData, insights);

    // Generate natural language recommendation
    const recommendation = this.formatRecommendation(strategy, aggregatedData, insights);

    // Store recommendation
    this.recommendations.set(recommendation.id, recommendation);

    // Log to database
    await this.logRecommendation(recommendation);

    logger.info(
      `[CopilotRecommender] Generated recommendation: ${recommendation.title} (${recommendation.priority} priority)`
    );

    return recommendation;
  }

  /**
   * Collect insights from each copilot
   */
  private async collectCopilotInsights(
    context?: Record<string, any>
  ): Promise<Record<CopilotType, any>> {
    const insights: Record<string, any> = {};

    for (const [type, copilot] of this.copilots.entries()) {
      insights[type] = await this.getCopilotInsight(type, copilot, context);
    }

    return insights;
  }

  /**
   * Get insight from a specific copilot
   */
  private async getCopilotInsight(
    type: CopilotType,
    copilot: CopilotData,
    context?: Record<string, any>
  ): Promise<any> {
    switch (type) {
      case 'voice':
        return {
          recentCommands: copilot.recentDecisions.length,
          userEngagement: copilot.metrics.userSatisfaction,
          suggestion: 'Optimize voice interaction patterns',
        };

      case 'navigation':
        return {
          routeOptimization: copilot.metrics.accuracy,
          deviations: copilot.recentDecisions.filter((d) => d.decision.includes('deviation'))
            .length,
          suggestion: 'Review navigation efficiency',
        };

      case 'mission':
        return {
          missionProgress: Math.random() * 100, // Mock data
          criticalTasks: Math.floor(Math.random() * 5),
          suggestion: 'Prioritize critical mission tasks',
        };

      case 'tactical':
        return {
          threatLevel: contextualThreatMonitor.getActiveThreats().length,
          responseTime: copilot.metrics.responseTime,
          suggestion: 'Monitor tactical situation closely',
        };

      default:
        return {};
    }
  }

  /**
   * Analyze unified strategy
   */
  private async analyzeUnifiedStrategy(
    aggregatedData: Record<string, any>,
    insights: Record<CopilotType, any>
  ): Promise<any> {
    const systemHealth = aggregatedData.systemHealth;
    const threats = contextualThreatMonitor.getActiveThreats();
    const bottlenecks = graphInferenceEngine.detectBottlenecks();

    // Determine priority based on system state
    let priority: StrategyRecommendation['priority'] = 'medium';
    if (systemHealth < 50 || threats.some((t) => t.severity === 'critical')) {
      priority = 'critical';
    } else if (systemHealth < 70 || threats.some((t) => t.severity === 'high')) {
      priority = 'high';
    } else if (systemHealth < 85) {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    // Calculate confidence based on copilot agreement
    const confidence = this.calculateCopilotAgreement(insights);

    // Determine main actions
    const actions: StrategyRecommendation['actions'] = [];

    if (threats.length > 0) {
      actions.push({
        step: 1,
        description: `Address ${threats.length} active threat(s)`,
        assignedTo: 'tactical',
        estimatedDuration: 30,
      });
    }

    if (bottlenecks.length > 0) {
      actions.push({
        step: actions.length + 1,
        description: `Resolve ${bottlenecks.length} system bottleneck(s)`,
        assignedTo: 'mission',
        estimatedDuration: 45,
      });
    }

    if (aggregatedData.averageConfidence < 0.7) {
      actions.push({
        step: actions.length + 1,
        description: 'Improve decision confidence across copilots',
        assignedTo: 'voice',
        estimatedDuration: 20,
      });
    }

    // Navigation optimization
    const navInsight = insights['navigation'];
    if (navInsight && navInsight.routeOptimization < 0.8) {
      actions.push({
        step: actions.length + 1,
        description: 'Optimize navigation routes',
        assignedTo: 'navigation',
        estimatedDuration: 60,
      });
    }

    return {
      priority,
      confidence,
      actions,
      systemHealth,
      threats,
      bottlenecks,
    };
  }

  /**
   * Calculate copilot agreement level
   */
  private calculateCopilotAgreement(insights: Record<CopilotType, any>): number {
    // Simple heuristic: average of all copilot metrics
    let total = 0;
    let count = 0;

    for (const copilot of this.copilots.values()) {
      total += copilot.metrics.accuracy;
      total += copilot.metrics.userSatisfaction;
      count += 2;
    }

    return count > 0 ? total / count : 0.5;
  }

  /**
   * Format recommendation in natural language
   */
  private formatRecommendation(
    strategy: any,
    aggregatedData: Record<string, any>,
    insights: Record<CopilotType, any>
  ): StrategyRecommendation {
    const id = `rec-${Date.now()}`;

    // Generate title based on priority
    let title = '';
    switch (strategy.priority) {
      case 'critical':
        title = '🚨 Critical System Intervention Required';
        break;
      case 'high':
        title = '⚠️ High Priority Optimization Needed';
        break;
      case 'medium':
        title = '📊 System Optimization Recommended';
        break;
      case 'low':
        title = '✅ System Operating Nominally';
        break;
    }

    // Generate description
    const description = this.generateDescription(strategy, aggregatedData);

    // Generate reasoning
    const reasoning = this.generateReasoning(strategy, aggregatedData, insights);

    // Generate sources
    const sources = this.generateSources(insights);

    // Generate expected outcome
    const expectedOutcome = this.generateExpectedOutcome(strategy);

    // Generate alternatives
    const alternatives = this.generateAlternatives(strategy);

    // Generate risks
    const risks = this.generateRisks(strategy);

    return {
      id,
      title,
      description,
      priority: strategy.priority,
      confidence: strategy.confidence,
      reasoning,
      sources,
      actions: strategy.actions,
      expectedOutcome,
      alternatives,
      risks,
      timestamp: new Date(),
    };
  }

  /**
   * Generate natural language description
   */
  private generateDescription(strategy: any, aggregatedData: Record<string, any>): string {
    const parts: string[] = [];

    parts.push(`System health is at ${aggregatedData.systemHealth.toFixed(0)}%.`);

    if (strategy.threats.length > 0) {
      parts.push(`There are ${strategy.threats.length} active threat(s) requiring attention.`);
    }

    if (strategy.bottlenecks.length > 0) {
      parts.push(`${strategy.bottlenecks.length} operational bottleneck(s) detected.`);
    }

    if (aggregatedData.averageConfidence < 0.7) {
      parts.push(`Copilot decision confidence is below optimal threshold.`);
    }

    if (strategy.actions.length === 0) {
      parts.push('System is operating within normal parameters.');
    } else {
      parts.push(`${strategy.actions.length} recommended action(s) to optimize performance.`);
    }

    return parts.join(' ');
  }

  /**
   * Generate reasoning
   */
  private generateReasoning(
    strategy: any,
    aggregatedData: Record<string, any>,
    insights: Record<CopilotType, any>
  ): string[] {
    const reasoning: string[] = [];

    reasoning.push(`System health assessment: ${aggregatedData.systemHealth.toFixed(0)}%`);
    reasoning.push(`Total copilot decisions analyzed: ${aggregatedData.totalDecisions}`);
    reasoning.push(`Average decision confidence: ${(aggregatedData.averageConfidence * 100).toFixed(1)}%`);

    // Add insights from each copilot
    for (const [type, insight] of Object.entries(insights)) {
      const copilot = this.copilots.get(type as CopilotType);
      if (copilot) {
        reasoning.push(
          `${type.charAt(0).toUpperCase() + type.slice(1)} Copilot: ${insight.suggestion || 'Operating normally'}`
        );
      }
    }

    // Add threat information
    if (strategy.threats.length > 0) {
      const criticalThreats = strategy.threats.filter((t: any) => t.severity === 'critical');
      if (criticalThreats.length > 0) {
        reasoning.push(`⚠️ ${criticalThreats.length} critical threat(s) detected`);
      }
    }

    // Add bottleneck information
    if (strategy.bottlenecks.length > 0) {
      const criticalBottlenecks = strategy.bottlenecks.filter(
        (b: any) => b.severity === 'critical'
      );
      if (criticalBottlenecks.length > 0) {
        reasoning.push(`🔴 ${criticalBottlenecks.length} critical bottleneck(s) identified`);
      }
    }

    return reasoning;
  }

  /**
   * Generate sources with contributions
   */
  private generateSources(
    insights: Record<CopilotType, any>
  ): StrategyRecommendation['sources'] {
    const sources: StrategyRecommendation['sources'] = [];

    for (const [type, insight] of Object.entries(insights)) {
      const copilot = this.copilots.get(type as CopilotType);
      if (copilot) {
        sources.push({
          copilotType: type as CopilotType,
          contribution: copilot.metrics.accuracy,
          keyData: {
            recentDecisions: copilot.recentDecisions.length,
            accuracy: copilot.metrics.accuracy,
            userSatisfaction: copilot.metrics.userSatisfaction,
            insight: insight.suggestion,
          },
        });
      }
    }

    return sources;
  }

  /**
   * Generate expected outcome
   */
  private generateExpectedOutcome(strategy: any): string {
    if (strategy.priority === 'critical') {
      return 'Immediate intervention will stabilize critical systems and prevent cascading failures.';
    } else if (strategy.priority === 'high') {
      return 'Implementing these actions will improve system performance by 15-20% and reduce risks.';
    } else if (strategy.priority === 'medium') {
      return 'These optimizations will enhance operational efficiency and user experience.';
    } else {
      return 'System will continue operating at optimal performance levels.';
    }
  }

  /**
   * Generate alternatives
   */
  private generateAlternatives(strategy: any): string[] {
    const alternatives: string[] = [];

    if (strategy.actions.length > 1) {
      alternatives.push('Prioritize actions by impact rather than urgency');
      alternatives.push('Distribute actions across multiple time windows');
    }

    if (strategy.threats.length > 0) {
      alternatives.push('Implement automated threat mitigation protocols');
    }

    alternatives.push('Defer non-critical optimizations to off-peak hours');
    alternatives.push('Request human operator intervention for complex decisions');

    return alternatives;
  }

  /**
   * Generate risks
   */
  private generateRisks(strategy: any): StrategyRecommendation['risks'] {
    const risks: StrategyRecommendation['risks'] = [];

    if (strategy.actions.length > 3) {
      risks.push({
        description: 'Multiple simultaneous actions may strain system resources',
        mitigation: 'Stagger action execution with 5-minute intervals',
      });
    }

    if (strategy.confidence < 0.7) {
      risks.push({
        description: 'Lower confidence level may indicate uncertainty in recommendations',
        mitigation: 'Request operator confirmation before executing critical actions',
      });
    }

    if (strategy.priority === 'critical') {
      risks.push({
        description: 'Delayed response may result in system degradation',
        mitigation: 'Activate emergency protocols and alert all operators',
      });
    }

    return risks;
  }

  /**
   * Log recommendation to database
   */
  private async logRecommendation(recommendation: StrategyRecommendation): Promise<void> {
    try {
      const { error } = await supabase.from('copilot_recommendations').insert({
        recommendation_id: recommendation.id,
        title: recommendation.title,
        description: recommendation.description,
        priority: recommendation.priority,
        confidence: recommendation.confidence,
        reasoning: recommendation.reasoning,
        sources: recommendation.sources,
        actions: recommendation.actions,
        expected_outcome: recommendation.expectedOutcome,
        timestamp: recommendation.timestamp.toISOString(),
      });

      if (error) {
        logger.error('[CopilotRecommender] Failed to log recommendation', error);
      }
    } catch (error) {
      logger.error('[CopilotRecommender] Error logging recommendation', error);
    }
  }

  /**
   * Handle user response to recommendation
   */
  async handleUserResponse(
    recommendationId: string,
    action: UserResponse['action'],
    feedback?: string
  ): Promise<void> {
    const recommendation = this.recommendations.get(recommendationId);
    
    if (!recommendation) {
      logger.warn(`[CopilotRecommender] Recommendation not found: ${recommendationId}`);
      return;
    }

    const response: UserResponse = {
      recommendationId,
      action,
      feedback,
      timestamp: new Date(),
    };

    this.userResponses.push(response);

    logger.info(
      `[CopilotRecommender] User ${action}ed recommendation: ${recommendation.title}`
    );

    // Log response to database
    try {
      const { error } = await supabase.from('copilot_responses').insert({
        recommendation_id: recommendationId,
        action,
        feedback,
        timestamp: response.timestamp.toISOString(),
      });

      if (error) {
        logger.error('[CopilotRecommender] Failed to log response', error);
      }

      // If accepted, trigger actions
      if (action === 'accept') {
        await this.executeRecommendation(recommendation);
      }
    } catch (error) {
      logger.error('[CopilotRecommender] Error logging response', error);
    }
  }

  /**
   * Execute accepted recommendation
   */
  private async executeRecommendation(recommendation: StrategyRecommendation): Promise<void> {
    logger.info(`[CopilotRecommender] Executing recommendation: ${recommendation.title}`);

    for (const action of recommendation.actions) {
      logger.info(
        `[CopilotRecommender] Step ${action.step}: ${action.description} (${action.assignedTo})`
      );
      
      // In real implementation, this would trigger actual copilot actions
      // For now, we just log the execution
    }
  }

  /**
   * Get recent recommendations
   */
  getRecentRecommendations(limit: number = 10): StrategyRecommendation[] {
    return Array.from(this.recommendations.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get copilot statistics
   */
  getStats() {
    return {
      copilotCount: this.copilots.size,
      totalRecommendations: this.recommendations.size,
      totalResponses: this.userResponses.length,
      acceptanceRate: this.calculateAcceptanceRate(),
      copilotMetrics: Object.fromEntries(
        Array.from(this.copilots.entries()).map(([type, copilot]) => [
          type,
          copilot.metrics,
        ])
      ),
    };
  }

  /**
   * Calculate acceptance rate
   */
  private calculateAcceptanceRate(): number {
    if (this.userResponses.length === 0) return 0;

    const accepted = this.userResponses.filter((r) => r.action === 'accept').length;
    return accepted / this.userResponses.length;
  }
}

// Export singleton instance
export const jointCopilotStrategyRecommender = new JointCopilotStrategyRecommender();
