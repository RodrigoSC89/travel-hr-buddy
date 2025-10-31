/**
 * PATCH 587: IA Reflective Core
 * 
 * Enables AI self-reflection based on previous decisions
 * Features:
 * - Decision history storage and retrieval
 * - Error/success pattern analysis
 * - Dynamic confidence weight adaptation
 * - Automatic reflection per mission
 * - Insight generation for alternative decisions
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface DecisionRecord {
  id: string;
  missionId: string;
  decisionType: string;
  context: Record<string, any>;
  chosenAction: string;
  alternativeActions: string[];
  outcome: "success" | "failure" | "partial" | "unknown";
  impactScore: number; // 0-100
  timestamp: string;
  confidenceAtTime: number;
  actualPerformance: number; // 0-100
}

export interface ReflectionInsight {
  id: string;
  missionId: string;
  decisionId: string;
  insightType: "error_pattern" | "success_pattern" | "missed_opportunity" | "optimal_choice";
  description: string;
  shouldHaveDone: string;
  learningPoints: string[];
  confidenceAdjustment: number; // -1.0 to +1.0
  timestamp: string;
}

export interface StrategyConfidence {
  strategyName: string;
  baseConfidence: number;
  adjustments: Array<{
    reason: string;
    delta: number;
    timestamp: string;
  }>;
  currentConfidence: number;
  usageCount: number;
  successRate: number;
}

export interface ReflectionReport {
  missionId: string;
  totalDecisions: number;
  successfulDecisions: number;
  failedDecisions: number;
  insights: ReflectionInsight[];
  strategyConfidences: StrategyConfidence[];
  overallLearning: string;
  timestamp: string;
}

export class ReflectiveCore {
  private decisionHistory: DecisionRecord[] = [];
  private insights: ReflectionInsight[] = [];
  private strategyConfidences: Map<string, StrategyConfidence> = new Map();

  /**
   * Store a decision for future reflection
   */
  async recordDecision(decision: Omit<DecisionRecord, "id" | "timestamp">): Promise<string> {
    const record: DecisionRecord = {
      ...decision,
      id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.decisionHistory.push(record);

    // Store in database
    try {
      await (supabase as any).from("ai_decision_history").insert({
        decision_id: record.id,
        mission_id: record.missionId,
        decision_type: record.decisionType,
        context: record.context,
        chosen_action: record.chosenAction,
        alternative_actions: record.alternativeActions,
        outcome: record.outcome,
        impact_score: record.impactScore,
        confidence_at_time: record.confidenceAtTime,
        actual_performance: record.actualPerformance,
        timestamp: record.timestamp,
      });
    } catch (error) {
      logger.error("Failed to record decision", error);
    }

    return record.id;
  }

  /**
   * Execute reflection analysis for a mission
   */
  async reflectOnMission(missionId: string): Promise<ReflectionReport> {
    const missionDecisions = this.decisionHistory.filter(
      d => d.missionId === missionId
    );

    if (missionDecisions.length === 0) {
      throw new Error(`No decisions found for mission ${missionId}`);
    }

    // Analyze patterns
    const errorPatterns = this.analyzeErrorPatterns(missionDecisions);
    const successPatterns = this.analyzeSuccessPatterns(missionDecisions);
    const missedOpportunities = this.identifyMissedOpportunities(missionDecisions);

    // Generate insights
    const newInsights: ReflectionInsight[] = [];

    // Error pattern insights
    for (const pattern of errorPatterns) {
      const insight = this.generateErrorInsight(pattern, missionId);
      newInsights.push(insight);
      this.insights.push(insight);
    }

    // Success pattern insights
    for (const pattern of successPatterns) {
      const insight = this.generateSuccessInsight(pattern, missionId);
      newInsights.push(insight);
      this.insights.push(insight);
    }

    // Missed opportunity insights
    for (const opportunity of missedOpportunities) {
      const insight = this.generateOpportunityInsight(opportunity, missionId);
      newInsights.push(insight);
      this.insights.push(insight);
    }

    // Update strategy confidences
    this.updateStrategyConfidences(missionDecisions, newInsights);

    // Calculate statistics
    const successfulDecisions = missionDecisions.filter(
      d => d.outcome === "success"
    ).length;
    const failedDecisions = missionDecisions.filter(
      d => d.outcome === "failure"
    ).length;

    // Generate overall learning
    const overallLearning = this.synthesizeOverallLearning(
      missionDecisions,
      newInsights
    );

    const report: ReflectionReport = {
      missionId,
      totalDecisions: missionDecisions.length,
      successfulDecisions,
      failedDecisions,
      insights: newInsights,
      strategyConfidences: Array.from(this.strategyConfidences.values()),
      overallLearning,
      timestamp: new Date().toISOString(),
    };

    // Store reflection report
    await this.storeReflectionReport(report);

    return report;
  }

  /**
   * Analyze error patterns across decisions
   */
  private analyzeErrorPatterns(decisions: DecisionRecord[]): Array<{
    pattern: string;
    frequency: number;
    decisions: DecisionRecord[];
  }> {
    const failedDecisions = decisions.filter(d => d.outcome === "failure");
    const patterns: Map<string, DecisionRecord[]> = new Map();

    for (const decision of failedDecisions) {
      // Group by decision type
      const key = decision.decisionType;
      if (!patterns.has(key)) {
        patterns.set(key, []);
      }
      patterns.get(key)!.push(decision);
    }

    return Array.from(patterns.entries())
      .filter(([_, decs]) => decs.length > 1) // Only patterns that repeat
      .map(([pattern, decs]) => ({
        pattern,
        frequency: decs.length,
        decisions: decs,
      }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Analyze success patterns
   */
  private analyzeSuccessPatterns(decisions: DecisionRecord[]): Array<{
    pattern: string;
    frequency: number;
    decisions: DecisionRecord[];
  }> {
    const successfulDecisions = decisions.filter(d => d.outcome === "success");
    const patterns: Map<string, DecisionRecord[]> = new Map();

    for (const decision of successfulDecisions) {
      // Group by decision type
      const key = decision.decisionType;
      if (!patterns.has(key)) {
        patterns.set(key, []);
      }
      patterns.get(key)!.push(decision);
    }

    return Array.from(patterns.entries())
      .map(([pattern, decs]) => ({
        pattern,
        frequency: decs.length,
        decisions: decs,
      }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Identify missed opportunities where better alternatives existed
   */
  private identifyMissedOpportunities(decisions: DecisionRecord[]): Array<{
    decision: DecisionRecord;
    betterAlternative: string;
    potentialImprovement: number;
  }> {
    const opportunities: Array<{
      decision: DecisionRecord;
      betterAlternative: string;
      potentialImprovement: number;
    }> = [];

    for (const decision of decisions) {
      // Look for decisions with low performance but had alternatives
      if (
        decision.actualPerformance < 60 &&
        decision.alternativeActions.length > 0
      ) {
        // Estimate which alternative might have been better
        const betterAlternative = decision.alternativeActions[0];
        const potentialImprovement = 100 - decision.actualPerformance;

        opportunities.push({
          decision,
          betterAlternative,
          potentialImprovement,
        });
      }
    }

    return opportunities.sort((a, b) => b.potentialImprovement - a.potentialImprovement);
  }

  /**
   * Generate insight from error pattern
   */
  private generateErrorInsight(
    pattern: { pattern: string; frequency: number; decisions: DecisionRecord[] },
    missionId: string
  ): ReflectionInsight {
    const avgPerformance = pattern.decisions.reduce(
      (sum, d) => sum + d.actualPerformance, 0
    ) / pattern.decisions.length;

    return {
      id: `insight-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      missionId,
      decisionId: pattern.decisions[0].id,
      insightType: "error_pattern",
      description: `Repeated failures in ${pattern.pattern} decisions (${pattern.frequency} occurrences). Average performance: ${avgPerformance.toFixed(1)}%.`,
      shouldHaveDone: `Consider alternative approaches for ${pattern.pattern} decisions or add pre-validation checks.`,
      learningPoints: [
        `${pattern.pattern} decisions consistently underperform`,
        "Need to improve decision-making process for this type",
        "Consider adjusting confidence levels or adding safeguards",
      ],
      confidenceAdjustment: -0.2 * (pattern.frequency / 10), // Reduce confidence
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate insight from success pattern
   */
  private generateSuccessInsight(
    pattern: { pattern: string; frequency: number; decisions: DecisionRecord[] },
    missionId: string
  ): ReflectionInsight {
    const avgPerformance = pattern.decisions.reduce(
      (sum, d) => sum + d.actualPerformance, 0
    ) / pattern.decisions.length;

    return {
      id: `insight-success-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      missionId,
      decisionId: pattern.decisions[0].id,
      insightType: "success_pattern",
      description: `Strong performance in ${pattern.pattern} decisions (${pattern.frequency} occurrences). Average performance: ${avgPerformance.toFixed(1)}%.`,
      shouldHaveDone: `Continue leveraging ${pattern.pattern} approach in similar contexts.`,
      learningPoints: [
        `${pattern.pattern} decisions consistently perform well`,
        "This approach should be prioritized in similar situations",
        "Consider applying similar strategy to related decision types",
      ],
      confidenceAdjustment: 0.1 * (pattern.frequency / 10), // Increase confidence
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate insight from missed opportunity
   */
  private generateOpportunityInsight(
    opportunity: {
      decision: DecisionRecord;
      betterAlternative: string;
      potentialImprovement: number;
    },
    missionId: string
  ): ReflectionInsight {
    return {
      id: `insight-opportunity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      missionId,
      decisionId: opportunity.decision.id,
      insightType: "missed_opportunity",
      description: `Suboptimal choice in ${opportunity.decision.decisionType}. Performance: ${opportunity.decision.actualPerformance}%. Potential improvement: ${opportunity.potentialImprovement}%.`,
      shouldHaveDone: `Should have chosen: "${opportunity.betterAlternative}" instead of "${opportunity.decision.chosenAction}".`,
      learningPoints: [
        "Alternative action may have yielded better results",
        "Need to better evaluate alternatives before committing",
        "Consider expanding exploration of action space",
      ],
      confidenceAdjustment: -0.1,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Update strategy confidences based on insights
   */
  private updateStrategyConfidences(
    decisions: DecisionRecord[],
    insights: ReflectionInsight[]
  ): void {
    // Group decisions by type (strategy)
    for (const decision of decisions) {
      const strategyName = decision.decisionType;

      if (!this.strategyConfidences.has(strategyName)) {
        this.strategyConfidences.set(strategyName, {
          strategyName,
          baseConfidence: 0.7,
          adjustments: [],
          currentConfidence: 0.7,
          usageCount: 0,
          successRate: 0,
        });
      }

      const strategy = this.strategyConfidences.get(strategyName)!;
      strategy.usageCount++;

      // Calculate success rate
      const strategyDecisions = decisions.filter(d => d.decisionType === strategyName);
      const successfulCount = strategyDecisions.filter(d => d.outcome === "success").length;
      strategy.successRate = successfulCount / strategyDecisions.length;
    }

    // Apply insights adjustments
    for (const insight of insights) {
      const decision = decisions.find(d => d.id === insight.decisionId);
      if (!decision) continue;

      const strategy = this.strategyConfidences.get(decision.decisionType);
      if (!strategy) continue;

      strategy.adjustments.push({
        reason: insight.description,
        delta: insight.confidenceAdjustment,
        timestamp: insight.timestamp,
      });

      // Update current confidence
      strategy.currentConfidence = Math.max(
        0.1,
        Math.min(1.0, strategy.baseConfidence + 
          strategy.adjustments.reduce((sum, adj) => sum + adj.delta, 0))
      );
    }
  }

  /**
   * Synthesize overall learning from mission
   */
  private synthesizeOverallLearning(
    decisions: DecisionRecord[],
    insights: ReflectionInsight[]
  ): string {
    const totalDecisions = decisions.length;
    const successRate = decisions.filter(d => d.outcome === "success").length / totalDecisions;
    const avgPerformance = decisions.reduce((sum, d) => sum + d.actualPerformance, 0) / totalDecisions;

    const errorCount = insights.filter(i => i.insightType === "error_pattern").length;
    const successCount = insights.filter(i => i.insightType === "success_pattern").length;
    const missedOpportunities = insights.filter(i => i.insightType === "missed_opportunity").length;

    let learning = `Mission analysis: ${totalDecisions} decisions with ${(successRate * 100).toFixed(1)}% success rate and ${avgPerformance.toFixed(1)}% average performance. `;

    if (successCount > errorCount) {
      learning += `Strong performance overall with ${successCount} successful patterns identified. `;
    } else if (errorCount > 0) {
      learning += `Identified ${errorCount} error patterns requiring attention. `;
    }

    if (missedOpportunities > 0) {
      learning += `Found ${missedOpportunities} missed opportunities for improvement. `;
    }

    learning += "Key takeaway: ";
    if (successRate > 0.7) {
      learning += "Continue current approach while fine-tuning based on insights.";
    } else if (successRate > 0.4) {
      learning += "Mixed results - need to strengthen decision-making process and learn from failures.";
    } else {
      learning += "Significant improvement needed - consider major strategy adjustments.";
    }

    return learning;
  }

  /**
   * Store reflection report in database
   */
  private async storeReflectionReport(report: ReflectionReport): Promise<void> {
    try {
      await (supabase as any).from("ai_reflection_reports").insert({
        mission_id: report.missionId,
        total_decisions: report.totalDecisions,
        successful_decisions: report.successfulDecisions,
        failed_decisions: report.failedDecisions,
        insights: report.insights,
        strategy_confidences: report.strategyConfidences,
        overall_learning: report.overallLearning,
        timestamp: report.timestamp,
      });

      // Also store individual insights
      for (const insight of report.insights) {
        await (supabase as any).from("ai_reflection_insights").insert({
          insight_id: insight.id,
          mission_id: insight.missionId,
          decision_id: insight.decisionId,
          insight_type: insight.insightType,
          description: insight.description,
          should_have_done: insight.shouldHaveDone,
          learning_points: insight.learningPoints,
          confidence_adjustment: insight.confidenceAdjustment,
          timestamp: insight.timestamp,
        });
      }
    } catch (error) {
      logger.error("Failed to store reflection report", error);
    }
  }

  /**
   * Get strategy confidence for decision-making
   */
  getStrategyConfidence(strategyName: string): number {
    const strategy = this.strategyConfidences.get(strategyName);
    return strategy ? strategy.currentConfidence : 0.7; // Default confidence
  }

  /**
   * Get all insights for a mission
   */
  getInsights(missionId?: string): ReflectionInsight[] {
    if (missionId) {
      return this.insights.filter(i => i.missionId === missionId);
    }
    return [...this.insights];
  }

  /**
   * Get decision history
   */
  getDecisionHistory(missionId?: string): DecisionRecord[] {
    if (missionId) {
      return this.decisionHistory.filter(d => d.missionId === missionId);
    }
    return [...this.decisionHistory];
  }

  /**
   * Export learning data for analysis
   */
  exportLearningData(): {
    decisions: DecisionRecord[];
    insights: ReflectionInsight[];
    strategies: StrategyConfidence[];
    } {
    return {
      decisions: this.decisionHistory,
      insights: this.insights,
      strategies: Array.from(this.strategyConfidences.values()),
    };
  }
}

// Export singleton instance
export const reflectiveCore = new ReflectiveCore();
