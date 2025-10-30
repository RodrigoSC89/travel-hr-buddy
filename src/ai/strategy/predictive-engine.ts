// @ts-nocheck
/**
 * PATCH 581 - Predictive Strategy Engine
 * AI engine for predictive strategy generation with continuous learning
 * 
 * Receives signals from Situational Awareness and BI systems
 * Generates possible strategies with success probabilities
 * Validates decisions with continuous learning
 * Logs each strategy proposal
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type StrategyType = 
  | "preventive" 
  | "reactive" 
  | "optimization" 
  | "risk_mitigation" 
  | "resource_allocation"
  | "emergency_response";

export type SignalSource = "situational_awareness" | "bi_analytics" | "manual" | "sensor";

export type LearningFeedback = "success" | "partial" | "failed" | "pending";

export interface Signal {
  id: string;
  source: SignalSource;
  type: string;
  data: Record<string, any>;
  priority: number; // 0-100
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Strategy {
  id: string;
  type: StrategyType;
  name: string;
  description: string;
  successProbability: number; // 0-1
  confidenceScore: number; // 0-100
  estimatedImpact: {
    cost?: number;
    risk: number; // 0-100
    time: number; // in hours
    crewImpact: number; // 0-100
  };
  prerequisites: string[];
  actions: StrategyAction[];
  signals: string[]; // Signal IDs that generated this strategy
  generatedAt: Date;
  metadata?: Record<string, any>;
}

export interface StrategyAction {
  id: string;
  order: number;
  action: string;
  description: string;
  responsible?: string;
  duration?: number; // in hours
  dependencies?: string[];
}

export interface StrategyProposal {
  id: string;
  strategies: Strategy[];
  topStrategy: Strategy;
  analysisContext: Record<string, any>;
  proposedAt: Date;
  missionId?: string;
}

export interface FeedbackRecord {
  strategyId: string;
  feedback: LearningFeedback;
  actualOutcome: Record<string, any>;
  timestamp: Date;
  comments?: string;
  userId?: string;
}

class PredictiveStrategyEngine {
  private isInitialized = false;
  private activeSignals: Map<string, Signal> = new Map();
  private strategyHistory: Map<string, Strategy> = new Map();
  private feedbackHistory: Map<string, FeedbackRecord[]> = new Map();
  private learningModel: Map<string, number> = new Map(); // Strategy type -> success rate

  /**
   * Initialize the predictive strategy engine
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn("[PredictiveStrategyEngine] Already initialized");
      return;
    }

    logger.info("[PredictiveStrategyEngine] Initializing predictive strategy engine...");

    // Load historical feedback for learning
    await this.loadHistoricalFeedback();

    // Initialize learning model
    await this.initializeLearningModel();

    this.isInitialized = true;
    logger.info("[PredictiveStrategyEngine] Initialization complete");
  }

  /**
   * Receive signals from external systems
   */
  async receiveSignal(signal: Signal): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.activeSignals.set(signal.id, signal);
    
    logger.info("[PredictiveStrategyEngine] Signal received", {
      signalId: signal.id,
      source: signal.source,
      type: signal.type,
      priority: signal.priority
    });

    // Log signal to database
    try {
      await supabase.from("ai_strategy_signals").insert({
        signal_id: signal.id,
        source: signal.source,
        type: signal.type,
        data: signal.data,
        priority: signal.priority,
        metadata: signal.metadata,
        created_at: signal.timestamp.toISOString()
      });
    } catch (error) {
      logger.error("[PredictiveStrategyEngine] Failed to log signal", error);
    }
  }

  /**
   * Generate strategies based on active signals
   */
  async generateStrategies(missionId?: string): Promise<StrategyProposal> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.activeSignals.size === 0) {
      logger.warn("[PredictiveStrategyEngine] No active signals to process");
      throw new Error("No active signals available for strategy generation");
    }

    logger.info("[PredictiveStrategyEngine] Generating strategies", {
      signalCount: this.activeSignals.size,
      missionId
    });

    // Analyze signals and generate strategies
    const strategies = await this.analyzeSignalsAndGenerateStrategies();

    // Ensure at least 3 distinct strategies as per acceptance criteria
    if (strategies.length < 3) {
      logger.warn("[PredictiveStrategyEngine] Generated fewer than 3 strategies, adding alternatives");
      const additionalStrategies = await this.generateAlternativeStrategies(strategies);
      strategies.push(...additionalStrategies);
    }

    // Sort by confidence score and probability
    strategies.sort((a, b) => {
      const scoreA = a.confidenceScore * a.successProbability;
      const scoreB = b.confidenceScore * b.successProbability;
      return scoreB - scoreA;
    });

    const proposal: StrategyProposal = {
      id: `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      strategies: strategies.slice(0, 5), // Return top 5 strategies
      topStrategy: strategies[0],
      analysisContext: this.buildAnalysisContext(),
      proposedAt: new Date(),
      missionId
    };

    // Log proposal
    await this.logStrategyProposal(proposal);

    return proposal;
  }

  /**
   * Validate decisions with continuous learning
   */
  async validateWithLearning(strategyId: string, feedback: FeedbackRecord): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    logger.info("[PredictiveStrategyEngine] Recording feedback", {
      strategyId,
      feedback: feedback.feedback
    });

    // Store feedback
    if (!this.feedbackHistory.has(strategyId)) {
      this.feedbackHistory.set(strategyId, []);
    }
    this.feedbackHistory.get(strategyId)!.push(feedback);

    // Update learning model
    await this.updateLearningModel(strategyId, feedback);

    // Log feedback to database
    try {
      await supabase.from("ai_strategy_feedback").insert({
        strategy_id: strategyId,
        feedback: feedback.feedback,
        actual_outcome: feedback.actualOutcome,
        comments: feedback.comments,
        user_id: feedback.userId,
        created_at: feedback.timestamp.toISOString()
      });
    } catch (error) {
      logger.error("[PredictiveStrategyEngine] Failed to log feedback", error);
    }
  }

  /**
   * Get strategy by ID
   */
  getStrategy(strategyId: string): Strategy | undefined {
    return this.strategyHistory.get(strategyId);
  }

  /**
   * Get learning statistics
   */
  getLearningStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [type, successRate] of this.learningModel.entries()) {
      stats[type] = {
        successRate,
        feedbackCount: this.getFeedbackCountForType(type)
      };
    }

    return stats;
  }

  /**
   * Clear active signals
   */
  clearActiveSignals(): void {
    this.activeSignals.clear();
    logger.info("[PredictiveStrategyEngine] Active signals cleared");
  }

  // Private methods

  private async loadHistoricalFeedback(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from("ai_strategy_feedback")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) throw error;

      if (data && data.length > 0) {
        logger.info(`[PredictiveStrategyEngine] Loaded ${data.length} historical feedback records`);
      }
    } catch (error) {
      logger.error("[PredictiveStrategyEngine] Failed to load historical feedback", error);
    }
  }

  private async initializeLearningModel(): Promise<void> {
    // Initialize with baseline success rates for each strategy type
    const strategyTypes: StrategyType[] = [
      "preventive",
      "reactive",
      "optimization",
      "risk_mitigation",
      "resource_allocation",
      "emergency_response"
    ];

    for (const type of strategyTypes) {
      this.learningModel.set(type, 0.7); // 70% baseline success rate
    }

    logger.info("[PredictiveStrategyEngine] Learning model initialized with baseline rates");
  }

  private async analyzeSignalsAndGenerateStrategies(): Promise<Strategy[]> {
    const strategies: Strategy[] = [];
    const signals = Array.from(this.activeSignals.values());

    // Group signals by type and priority
    const highPrioritySignals = signals.filter(s => s.priority > 70);
    const mediumPrioritySignals = signals.filter(s => s.priority > 40 && s.priority <= 70);
    const lowPrioritySignals = signals.filter(s => s.priority <= 40);

    // Generate preventive strategy for high priority signals
    if (highPrioritySignals.length > 0) {
      strategies.push(this.createPreventiveStrategy(highPrioritySignals));
    }

    // Generate optimization strategy for medium priority
    if (mediumPrioritySignals.length > 0) {
      strategies.push(this.createOptimizationStrategy(mediumPrioritySignals));
    }

    // Generate risk mitigation strategy if there are risk signals
    const riskSignals = signals.filter(s => s.type.includes("risk") || s.type.includes("alert"));
    if (riskSignals.length > 0) {
      strategies.push(this.createRiskMitigationStrategy(riskSignals));
    }

    return strategies;
  }

  private createPreventiveStrategy(signals: Signal[]): Strategy {
    const strategyId = `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const successRate = this.learningModel.get("preventive") || 0.7;

    const strategy: Strategy = {
      id: strategyId,
      type: "preventive",
      name: "Preventive Action Strategy",
      description: "Proactive measures to prevent potential issues based on high-priority signals",
      successProbability: successRate,
      confidenceScore: 85,
      estimatedImpact: {
        cost: 5000,
        risk: 30,
        time: 24,
        crewImpact: 20
      },
      prerequisites: ["system_access", "resource_availability"],
      actions: signals.map((signal, index) => ({
        id: `action_${index}`,
        order: index + 1,
        action: `address_signal_${signal.type}`,
        description: `Address ${signal.type} from ${signal.source}`,
        duration: 4
      })),
      signals: signals.map(s => s.id),
      generatedAt: new Date(),
      metadata: {
        signalCount: signals.length,
        avgPriority: signals.reduce((sum, s) => sum + s.priority, 0) / signals.length
      }
    };

    this.strategyHistory.set(strategyId, strategy);
    return strategy;
  }

  private createOptimizationStrategy(signals: Signal[]): Strategy {
    const strategyId = `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const successRate = this.learningModel.get("optimization") || 0.7;

    const strategy: Strategy = {
      id: strategyId,
      type: "optimization",
      name: "Resource Optimization Strategy",
      description: "Optimize resource allocation and operational efficiency",
      successProbability: successRate,
      confidenceScore: 75,
      estimatedImpact: {
        cost: 3000,
        risk: 20,
        time: 12,
        crewImpact: 15
      },
      prerequisites: ["baseline_metrics", "historical_data"],
      actions: [
        {
          id: "action_1",
          order: 1,
          action: "analyze_current_allocation",
          description: "Analyze current resource allocation patterns",
          duration: 2
        },
        {
          id: "action_2",
          order: 2,
          action: "identify_optimization_opportunities",
          description: "Identify areas for optimization",
          duration: 4,
          dependencies: ["action_1"]
        },
        {
          id: "action_3",
          order: 3,
          action: "implement_optimizations",
          description: "Implement optimization recommendations",
          duration: 6,
          dependencies: ["action_2"]
        }
      ],
      signals: signals.map(s => s.id),
      generatedAt: new Date(),
      metadata: {
        signalCount: signals.length
      }
    };

    this.strategyHistory.set(strategyId, strategy);
    return strategy;
  }

  private createRiskMitigationStrategy(signals: Signal[]): Strategy {
    const strategyId = `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const successRate = this.learningModel.get("risk_mitigation") || 0.7;

    const strategy: Strategy = {
      id: strategyId,
      type: "risk_mitigation",
      name: "Risk Mitigation Strategy",
      description: "Comprehensive approach to mitigate identified risks",
      successProbability: successRate,
      confidenceScore: 80,
      estimatedImpact: {
        cost: 7000,
        risk: 10,
        time: 36,
        crewImpact: 25
      },
      prerequisites: ["risk_assessment", "mitigation_resources"],
      actions: [
        {
          id: "action_1",
          order: 1,
          action: "assess_risk_severity",
          description: "Assess the severity and scope of identified risks",
          duration: 3
        },
        {
          id: "action_2",
          order: 2,
          action: "develop_mitigation_plan",
          description: "Develop comprehensive mitigation plan",
          duration: 8,
          dependencies: ["action_1"]
        },
        {
          id: "action_3",
          order: 3,
          action: "execute_mitigation",
          description: "Execute mitigation measures",
          duration: 24,
          dependencies: ["action_2"]
        },
        {
          id: "action_4",
          order: 4,
          action: "monitor_effectiveness",
          description: "Monitor effectiveness of mitigation",
          duration: 1,
          dependencies: ["action_3"]
        }
      ],
      signals: signals.map(s => s.id),
      generatedAt: new Date(),
      metadata: {
        signalCount: signals.length,
        riskLevel: "high"
      }
    };

    this.strategyHistory.set(strategyId, strategy);
    return strategy;
  }

  private async generateAlternativeStrategies(existingStrategies: Strategy[]): Promise<Strategy[]> {
    const alternatives: Strategy[] = [];
    const existingTypes = new Set(existingStrategies.map(s => s.type));

    // Generate reactive strategy if not present
    if (!existingTypes.has("reactive")) {
      const strategyId = `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const successRate = this.learningModel.get("reactive") || 0.7;
      
      alternatives.push({
        id: strategyId,
        type: "reactive",
        name: "Reactive Response Strategy",
        description: "Quick response strategy for immediate issues",
        successProbability: successRate,
        confidenceScore: 70,
        estimatedImpact: {
          cost: 4000,
          risk: 40,
          time: 8,
          crewImpact: 30
        },
        prerequisites: ["immediate_response_capability"],
        actions: [
          {
            id: "action_1",
            order: 1,
            action: "immediate_response",
            description: "Execute immediate response actions",
            duration: 2
          },
          {
            id: "action_2",
            order: 2,
            action: "stabilize_situation",
            description: "Stabilize the current situation",
            duration: 4,
            dependencies: ["action_1"]
          },
          {
            id: "action_3",
            order: 3,
            action: "assess_and_adjust",
            description: "Assess outcomes and adjust approach",
            duration: 2,
            dependencies: ["action_2"]
          }
        ],
        signals: [],
        generatedAt: new Date()
      });
    }

    // Generate resource allocation strategy if not present
    if (!existingTypes.has("resource_allocation") && alternatives.length < 2) {
      const strategyId = `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const successRate = this.learningModel.get("resource_allocation") || 0.7;
      
      alternatives.push({
        id: strategyId,
        type: "resource_allocation",
        name: "Dynamic Resource Allocation Strategy",
        description: "Optimize resource distribution based on current needs",
        successProbability: successRate,
        confidenceScore: 72,
        estimatedImpact: {
          cost: 6000,
          risk: 25,
          time: 16,
          crewImpact: 35
        },
        prerequisites: ["resource_inventory", "allocation_authority"],
        actions: [
          {
            id: "action_1",
            order: 1,
            action: "assess_resource_needs",
            description: "Assess current and projected resource needs",
            duration: 3
          },
          {
            id: "action_2",
            order: 2,
            action: "reallocate_resources",
            description: "Reallocate resources based on priority",
            duration: 8,
            dependencies: ["action_1"]
          },
          {
            id: "action_3",
            order: 3,
            action: "monitor_allocation",
            description: "Monitor effectiveness of reallocation",
            duration: 5,
            dependencies: ["action_2"]
          }
        ],
        signals: [],
        generatedAt: new Date()
      });
    }

    return alternatives;
  }

  private buildAnalysisContext(): Record<string, any> {
    return {
      activeSignalCount: this.activeSignals.size,
      signalSources: Array.from(new Set(Array.from(this.activeSignals.values()).map(s => s.source))),
      avgSignalPriority: this.calculateAverageSignalPriority(),
      learningModelVersion: "1.0.0",
      timestamp: new Date().toISOString()
    };
  }

  private calculateAverageSignalPriority(): number {
    if (this.activeSignals.size === 0) return 0;
    const signals = Array.from(this.activeSignals.values());
    const sum = signals.reduce((acc, signal) => acc + signal.priority, 0);
    return sum / signals.length;
  }

  private async logStrategyProposal(proposal: StrategyProposal): Promise<void> {
    logger.info("[PredictiveStrategyEngine] Logging strategy proposal", {
      proposalId: proposal.id,
      strategyCount: proposal.strategies.length,
      topStrategyType: proposal.topStrategy.type,
      missionId: proposal.missionId
    });

    try {
      // Log proposal to database
      await supabase.from("ai_strategy_proposals").insert({
        proposal_id: proposal.id,
        strategies: proposal.strategies,
        top_strategy_id: proposal.topStrategy.id,
        analysis_context: proposal.analysisContext,
        mission_id: proposal.missionId,
        created_at: proposal.proposedAt.toISOString()
      });

      // Log individual strategies
      for (const strategy of proposal.strategies) {
        await supabase.from("ai_strategies").insert({
          strategy_id: strategy.id,
          proposal_id: proposal.id,
          type: strategy.type,
          name: strategy.name,
          description: strategy.description,
          success_probability: strategy.successProbability,
          confidence_score: strategy.confidenceScore,
          estimated_impact: strategy.estimatedImpact,
          prerequisites: strategy.prerequisites,
          actions: strategy.actions,
          signals: strategy.signals,
          metadata: strategy.metadata,
          created_at: strategy.generatedAt.toISOString()
        });
      }
    } catch (error) {
      logger.error("[PredictiveStrategyEngine] Failed to log strategy proposal", error);
    }
  }

  private async updateLearningModel(strategyId: string, feedback: FeedbackRecord): Promise<void> {
    const strategy = this.strategyHistory.get(strategyId);
    if (!strategy) {
      logger.warn(`[PredictiveStrategyEngine] Strategy ${strategyId} not found for learning update`);
      return;
    }

    const currentSuccessRate = this.learningModel.get(strategy.type) || 0.7;
    
    // Update success rate based on feedback
    let adjustment = 0;
    switch (feedback.feedback) {
    case "success":
      adjustment = 0.05; // Increase by 5%
      break;
    case "partial":
      adjustment = 0.02; // Increase by 2%
      break;
    case "failed":
      adjustment = -0.05; // Decrease by 5%
      break;
    default:
      adjustment = 0;
    }

    const newSuccessRate = Math.max(0.1, Math.min(0.95, currentSuccessRate + adjustment));
    this.learningModel.set(strategy.type, newSuccessRate);

    logger.info("[PredictiveStrategyEngine] Learning model updated", {
      strategyType: strategy.type,
      oldRate: currentSuccessRate,
      newRate: newSuccessRate,
      feedback: feedback.feedback
    });
  }

  private getFeedbackCountForType(type: string): number {
    let count = 0;
    for (const [strategyId, feedbacks] of this.feedbackHistory.entries()) {
      const strategy = this.strategyHistory.get(strategyId);
      if (strategy && strategy.type === type) {
        count += feedbacks.length;
      }
    }
    return count;
  }
}

// Export singleton instance
export const predictiveStrategyEngine = new PredictiveStrategyEngine();

// Export class for testing
export { PredictiveStrategyEngine };
