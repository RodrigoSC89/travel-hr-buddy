/**
 * PATCH 219 - Collective Loop Engine
 * Continuous feedback loop between operators, AI, copilot, and technical systems
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { contextMesh } from "@/core/context/contextMesh";

export type FeedbackType = "human" | "ai" | "operational" | "system";
export type FeedbackCategory = "accuracy" | "performance" | "suggestion" | "correction" | "rating" | "telemetry";

export interface FeedbackEvent {
  id?: string;
  feedbackType: FeedbackType;
  sourceModule: string;
  feedbackCategory: FeedbackCategory;
  rating?: number; // 1-5
  content?: string;
  metadata: Record<string, any>;
  aiMetrics?: AIMetrics;
  impactScore?: number; // 0-1
  processed: boolean;
  learningApplied: boolean;
  learningResults?: Record<string, any>;
  timestamp: Date;
}

export interface AIMetrics {
  precision?: number;
  recall?: number;
  f1Score?: number;
  accuracy?: number;
  latency?: number;
  successRate?: number;
}

export interface LearningAdjustment {
  moduleId: string;
  parameter: string;
  oldValue: any;
  newValue: any;
  reason: string;
  expectedImprovement: number;
}

export interface FeedbackSummary {
  totalEvents: number;
  byType: Record<FeedbackType, number>;
  byCategory: Record<FeedbackCategory, number>;
  averageRating: number;
  averageImpactScore: number;
  processedCount: number;
  learningAppliedCount: number;
}

class CollectiveLoopEngine {
  private feedbackQueue: FeedbackEvent[] = [];
  private processingInterval: NodeJS.Timeout | null = null;
  private learningHistory: Map<string, LearningAdjustment[]> = new Map();
  private isInitialized = false;
  private isProcessing = false;

  /**
   * Initialize the collective loop engine
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn("[CollectiveLoop] Already initialized");
      return;
    }

    logger.info("[CollectiveLoop] Initializing collective loop engine...");

    // Initialize context mesh
    await contextMesh.initialize();

    // Subscribe to feedback-related contexts
    contextMesh.subscribe({
      moduleName: "CollectiveLoop",
      contextTypes: ["ai", "telemetry"],
      handler: (message) => {
        this.handleContextUpdate(message.contextData);
      }
    });

    this.isInitialized = true;
    logger.info("[CollectiveLoop] Collective loop engine initialized successfully");
  }

  /**
   * Start processing feedback
   */
  startProcessing(): void {
    if (this.isProcessing) {
      logger.warn("[CollectiveLoop] Already processing");
      return;
    }

    logger.info("[CollectiveLoop] Starting feedback processing...");
    
    this.isProcessing = true;
    this.processingInterval = setInterval(() => {
      this.processFeedbackQueue();
    }, 5000); // Process every 5 seconds
  }

  /**
   * Stop processing feedback
   */
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.isProcessing = false;
    logger.info("[CollectiveLoop] Stopped feedback processing");
  }

  /**
   * Submit human feedback
   */
  async submitHumanFeedback(
    sourceModule: string,
    category: FeedbackCategory,
    rating: number,
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const feedback: FeedbackEvent = {
      feedbackType: "human",
      sourceModule,
      feedbackCategory: category,
      rating: Math.max(1, Math.min(5, rating)),
      content,
      metadata,
      processed: false,
      learningApplied: false,
      timestamp: new Date()
    };

    await this.recordFeedback(feedback);
    logger.info(`[CollectiveLoop] Human feedback submitted for ${sourceModule}`);
  }

  /**
   * Submit AI feedback
   */
  async submitAIFeedback(
    sourceModule: string,
    metrics: AIMetrics,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    // Calculate impact score based on metrics
    const impactScore = this.calculateImpactScore(metrics);

    const feedback: FeedbackEvent = {
      feedbackType: "ai",
      sourceModule,
      feedbackCategory: "performance",
      aiMetrics: metrics,
      impactScore,
      metadata,
      processed: false,
      learningApplied: false,
      timestamp: new Date()
    };

    await this.recordFeedback(feedback);
    logger.debug(`[CollectiveLoop] AI feedback submitted for ${sourceModule}`);
  }

  /**
   * Submit operational feedback
   */
  async submitOperationalFeedback(
    sourceModule: string,
    telemetryData: Record<string, any>
  ): Promise<void> {
    const feedback: FeedbackEvent = {
      feedbackType: "operational",
      sourceModule,
      feedbackCategory: "telemetry",
      metadata: telemetryData,
      processed: false,
      learningApplied: false,
      timestamp: new Date()
    };

    await this.recordFeedback(feedback);
    logger.debug(`[CollectiveLoop] Operational feedback submitted for ${sourceModule}`);
  }

  /**
   * Get feedback summary
   */
  async getFeedbackSummary(
    moduleName?: string,
    days: number = 7
  ): Promise<FeedbackSummary> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      let query = supabase
        .from("feedback_events")
        .select("*")
        .gte("timestamp", cutoffDate.toISOString());

      if (moduleName) {
        query = query.eq("source_module", moduleName);
      }

      const { data, error } = await query;

      if (error) {
        logger.error("[CollectiveLoop] Failed to get feedback summary", error);
        return this.getEmptySummary();
      }

      return this.calculateSummary(data || []);
    } catch (error) {
      logger.error("[CollectiveLoop] Error getting feedback summary", error);
      return this.getEmptySummary();
    }
  }

  /**
   * Get learning history for a module
   */
  getLearningHistory(moduleId: string): LearningAdjustment[] {
    return this.learningHistory.get(moduleId) || [];
  }

  /**
   * Apply learning adjustments
   */
  async applyLearning(moduleId: string, feedback: FeedbackEvent[]): Promise<void> {
    try {
      const adjustments = await this.generateLearningAdjustments(moduleId, feedback);
      
      if (adjustments.length === 0) {
        logger.debug(`[CollectiveLoop] No learning adjustments needed for ${moduleId}`);
        return;
      }

      // Store learning history
      if (!this.learningHistory.has(moduleId)) {
        this.learningHistory.set(moduleId, []);
      }
      this.learningHistory.get(moduleId)!.push(...adjustments);

      // Publish learning adjustments to context mesh
      await contextMesh.publish({
        moduleName: moduleId,
        contextType: "ai",
        contextData: {
          learningAdjustments: adjustments,
          appliedAt: new Date()
        },
        source: "CollectiveLoop"
      });

      // Mark feedback as learning applied
      for (const fb of feedback) {
        if (fb.id) {
          await supabase
            .from("feedback_events")
            .update({
              learning_applied: true,
              learning_results: { adjustments }
            })
            .eq("id", fb.id);
        }
      }

      logger.info(`[CollectiveLoop] Applied ${adjustments.length} learning adjustments for ${moduleId}`);
    } catch (error) {
      logger.error(`[CollectiveLoop] Failed to apply learning for ${moduleId}`, error);
    }
  }

  /**
   * Get feedback events
   */
  async getFeedbackEvents(
    filters?: {
      moduleName?: string;
      feedbackType?: FeedbackType;
      category?: FeedbackCategory;
      processed?: boolean;
      limit?: number;
    }
  ): Promise<FeedbackEvent[]> {
    try {
      let query = supabase
        .from("feedback_events")
        .select("*")
        .order("timestamp", { ascending: false });

      if (filters?.moduleName) {
        query = query.eq("source_module", filters.moduleName);
      }
      if (filters?.feedbackType) {
        query = query.eq("feedback_type", filters.feedbackType);
      }
      if (filters?.category) {
        query = query.eq("feedback_category", filters.category);
      }
      if (filters?.processed !== undefined) {
        query = query.eq("processed", filters.processed);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error("[CollectiveLoop] Failed to get feedback events", error);
        return [];
      }

      return (data || []).map(row => this.mapRowToFeedback(row));
    } catch (error) {
      logger.error("[CollectiveLoop] Error getting feedback events", error);
      return [];
    }
  }

  // Private methods

  private async recordFeedback(feedback: FeedbackEvent): Promise<void> {
    try {
      const { data, error } = await (supabase as any)
        .from("feedback_events")
        .insert({
          event_type: feedback.feedbackType,
          source_module: feedback.sourceModule,
          feedback_category: feedback.feedbackCategory,
          rating: feedback.rating,
          content: feedback.content,
          metadata: feedback.metadata,
          ai_metrics: feedback.aiMetrics,
          impact_score: feedback.impactScore,
          processed: feedback.processed,
          learning_applied: feedback.learningApplied,
          timestamp: feedback.timestamp.toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error("[CollectiveLoop] Failed to record feedback", error);
        return;
      }

      feedback.id = data.id;
      this.feedbackQueue.push(feedback);

      // Publish to context mesh
      await contextMesh.publish({
        moduleName: feedback.sourceModule,
        contextType: "ai",
        contextData: {
          feedback: {
            id: feedback.id,
            type: feedback.feedbackType,
            category: feedback.feedbackCategory,
            rating: feedback.rating
          }
        },
        source: "CollectiveLoop"
      });
    } catch (error) {
      logger.error("[CollectiveLoop] Error recording feedback", error);
    }
  }

  private async processFeedbackQueue(): Promise<void> {
    if (this.feedbackQueue.length === 0) return;

    const batch = this.feedbackQueue.splice(0, 10); // Process in batches of 10
    
    // Group by module
    const byModule = new Map<string, FeedbackEvent[]>();
    batch.forEach(feedback => {
      if (!byModule.has(feedback.sourceModule)) {
        byModule.set(feedback.sourceModule, []);
      }
      byModule.get(feedback.sourceModule)!.push(feedback);
    });

    // Process each module's feedback
    for (const [moduleId, feedbacks] of byModule.entries()) {
      await this.processModuleFeedback(moduleId, feedbacks);
    }
  }

  private async processModuleFeedback(moduleId: string, feedbacks: FeedbackEvent[]): Promise<void> {
    try {
      // Analyze feedback patterns
      const patterns = this.analyzeFeedbackPatterns(feedbacks);

      // Apply learning if needed
      if (patterns.requiresLearning) {
        await this.applyLearning(moduleId, feedbacks);
      }

      // Mark as processed
      for (const feedback of feedbacks) {
        if (feedback.id) {
          await supabase
            .from("feedback_events")
            .update({ processed: true })
            .eq("id", feedback.id);
        }
      }

      logger.debug(`[CollectiveLoop] Processed ${feedbacks.length} feedback events for ${moduleId}`);
    } catch (error) {
      logger.error(`[CollectiveLoop] Error processing feedback for ${moduleId}`, error);
    }
  }

  private analyzeFeedbackPatterns(feedbacks: FeedbackEvent[]): { requiresLearning: boolean } {
    // Simple heuristic: require learning if average rating < 3 or low AI metrics
    const humanFeedback = feedbacks.filter(f => f.feedbackType === "human");
    const aiFeedback = feedbacks.filter(f => f.feedbackType === "ai");

    let requiresLearning = false;

    if (humanFeedback.length > 0) {
      const avgRating = humanFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / humanFeedback.length;
      if (avgRating < 3) requiresLearning = true;
    }

    if (aiFeedback.length > 0) {
      const avgAccuracy = aiFeedback.reduce((sum, f) => sum + (f.aiMetrics?.accuracy || 0), 0) / aiFeedback.length;
      if (avgAccuracy < 0.7) requiresLearning = true;
    }

    return { requiresLearning };
  }

  private async generateLearningAdjustments(
    moduleId: string,
    feedbacks: FeedbackEvent[]
  ): Promise<LearningAdjustment[]> {
    const adjustments: LearningAdjustment[] = [];

    // Analyze feedback to generate adjustments
    const humanFeedback = feedbacks.filter(f => f.feedbackType === "human");
    const aiFeedback = feedbacks.filter(f => f.feedbackType === "ai");

    // Example adjustment based on low ratings
    if (humanFeedback.length > 0) {
      const avgRating = humanFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / humanFeedback.length;
      
      if (avgRating < 3) {
        adjustments.push({
          moduleId,
          parameter: "confidence_threshold",
          oldValue: 0.8,
          newValue: 0.9,
          reason: `Low user satisfaction (avg rating: ${avgRating.toFixed(2)})`,
          expectedImprovement: 0.15
        });
      }
    }

    // Example adjustment based on AI metrics
    if (aiFeedback.length > 0) {
      const avgAccuracy = aiFeedback.reduce((sum, f) => sum + (f.aiMetrics?.accuracy || 0), 0) / aiFeedback.length;
      
      if (avgAccuracy < 0.7) {
        adjustments.push({
          moduleId,
          parameter: "learning_rate",
          oldValue: 0.01,
          newValue: 0.005,
          reason: `Low accuracy (${(avgAccuracy * 100).toFixed(1)}%)`,
          expectedImprovement: 0.1
        });
      }
    }

    return adjustments;
  }

  private calculateImpactScore(metrics: AIMetrics): number {
    // Calculate weighted impact score
    const weights = {
      accuracy: 0.3,
      precision: 0.2,
      recall: 0.2,
      f1Score: 0.2,
      successRate: 0.1
    };

    let score = 0;
    let totalWeight = 0;

    if (metrics.accuracy !== undefined) {
      score += metrics.accuracy * weights.accuracy;
      totalWeight += weights.accuracy;
    }
    if (metrics.precision !== undefined) {
      score += metrics.precision * weights.precision;
      totalWeight += weights.precision;
    }
    if (metrics.recall !== undefined) {
      score += metrics.recall * weights.recall;
      totalWeight += weights.recall;
    }
    if (metrics.f1Score !== undefined) {
      score += metrics.f1Score * weights.f1Score;
      totalWeight += weights.f1Score;
    }
    if (metrics.successRate !== undefined) {
      score += metrics.successRate * weights.successRate;
      totalWeight += weights.successRate;
    }

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  private calculateSummary(data: any[]): FeedbackSummary {
    const byType: Record<FeedbackType, number> = {
      human: 0,
      ai: 0,
      operational: 0,
      system: 0
    };

    const byCategory: Record<FeedbackCategory, number> = {
      accuracy: 0,
      performance: 0,
      suggestion: 0,
      correction: 0,
      rating: 0,
      telemetry: 0
    };

    let totalRating = 0;
    let ratingCount = 0;
    let totalImpact = 0;
    let impactCount = 0;
    let processedCount = 0;
    let learningAppliedCount = 0;

    data.forEach(row => {
      byType[row.feedback_type as FeedbackType]++;
      byCategory[row.feedback_category as FeedbackCategory]++;

      if (row.rating) {
        totalRating += row.rating;
        ratingCount++;
      }

      if (row.impact_score !== null && row.impact_score !== undefined) {
        totalImpact += row.impact_score;
        impactCount++;
      }

      if (row.processed) processedCount++;
      if (row.learning_applied) learningAppliedCount++;
    });

    return {
      totalEvents: data.length,
      byType,
      byCategory,
      averageRating: ratingCount > 0 ? totalRating / ratingCount : 0,
      averageImpactScore: impactCount > 0 ? totalImpact / impactCount : 0,
      processedCount,
      learningAppliedCount
    };
  }

  private getEmptySummary(): FeedbackSummary {
    return {
      totalEvents: 0,
      byType: { human: 0, ai: 0, operational: 0, system: 0 },
      byCategory: { accuracy: 0, performance: 0, suggestion: 0, correction: 0, rating: 0, telemetry: 0 },
      averageRating: 0,
      averageImpactScore: 0,
      processedCount: 0,
      learningAppliedCount: 0
    };
  }

  private handleContextUpdate(contextData: Record<string, any>): void {
    // Handle context updates that might trigger feedback processing
    logger.debug("[CollectiveLoop] Received context update", contextData);
  }

  private mapRowToFeedback(row: any): FeedbackEvent {
    return {
      id: row.id,
      feedbackType: row.feedback_type,
      sourceModule: row.source_module,
      feedbackCategory: row.feedback_category,
      rating: row.rating,
      content: row.content,
      metadata: row.metadata,
      aiMetrics: row.ai_metrics,
      impactScore: row.impact_score,
      processed: row.processed,
      learningApplied: row.learning_applied,
      learningResults: row.learning_results,
      timestamp: new Date(row.timestamp)
    };
  }
}

// Export singleton instance
export const collectiveLoopEngine = new CollectiveLoopEngine();
