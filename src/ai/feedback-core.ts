/**
 * PATCH 201.0 - Cognitive Feedback System (IA Reflexiva)
 * 
 * AI-based cognitive feedback system that learns from user decisions and operator corrections.
 * Tracks AI decisions, operator actions, and outcomes to generate insights and improve over time.
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

export interface CognitiveFeedbackEntry {
  id?: string;
  
  // Decision tracking
  decision_type: 'suggestion' | 'automation' | 'recommendation' | 'prediction' | 'analysis';
  module_name: string;
  decision_context: Record<string, any>;
  ai_decision: Record<string, any>;
  
  // Operator interaction
  operator_action?: 'accepted' | 'rejected' | 'modified' | 'ignored';
  operator_change?: Record<string, any>;
  operator_feedback?: string;
  
  // Outcome tracking
  result?: 'success' | 'failure' | 'partial';
  result_metrics?: Record<string, any>;
  
  // Pattern detection metadata
  similar_decisions_count?: number;
  pattern_category?: string;
  insight_generated?: string;
  confidence_score?: number;
  
  // Audit fields
  user_id?: string;
  tenant_id?: string;
  vessel_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FeedbackPattern {
  pattern_type: string;
  module: string;
  frequency: number;
  confidence: number;
  description: string;
  examples: CognitiveFeedbackEntry[];
}

export interface FeedbackInsight {
  insight: string;
  category: string;
  confidence: number;
  evidence_count: number;
  recommendation: string;
}

export interface WeeklyFeedbackReport {
  week_start: string;
  total_decisions: number;
  acceptance_rate: number;
  rejection_rate: number;
  modification_rate: number;
  top_patterns: FeedbackPattern[];
  key_insights: FeedbackInsight[];
  module_performance: Record<string, {
    total: number;
    accepted: number;
    rejected: number;
    success_rate: number;
  }>;
}

class CognitiveFeedbackCore {
  private patternCache: Map<string, FeedbackPattern[]> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate = 0;

  /**
   * Log an AI decision for tracking
   */
  async logDecision(decision: Omit<CognitiveFeedbackEntry, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const entry: CognitiveFeedbackEntry = {
        ...decision,
        user_id: user?.id,
        operator_action: decision.operator_action || 'accepted',
        confidence_score: decision.confidence_score || 0.5,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase as any)
        .from('cognitive_feedback')
        .insert([entry])
        .select()
        .single();

      if (error) {
        logger.error('Failed to log cognitive feedback:', error);
        return null;
      }

      logger.info('Cognitive feedback logged:', { id: data.id, module: decision.module_name });
      
      // Trigger pattern detection asynchronously
      this.detectPatternsAsync(decision.module_name, decision.decision_type);
      
      return data.id;
    } catch (error) {
      logger.error('Error logging cognitive feedback:', error);
      return null;
    }
  }

  /**
   * Update feedback with operator action and result
   */
  async updateFeedback(
    feedbackId: string,
    update: {
      operator_action?: CognitiveFeedbackEntry['operator_action'];
      operator_change?: Record<string, any>;
      operator_feedback?: string;
      result?: 'success' | 'failure' | 'partial';
      result_metrics?: Record<string, any>;
    }
  ): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from('cognitive_feedback')
        .update(update)
        .eq('id', feedbackId);

      if (error) {
        logger.error('Failed to update cognitive feedback:', error);
        return false;
      }

      logger.info('Cognitive feedback updated:', { id: feedbackId });
      
      // Regenerate insights based on updated data
      this.generateInsightsAsync(feedbackId);
      
      return true;
    } catch (error) {
      logger.error('Error updating cognitive feedback:', error);
      return false;
    }
  }

  /**
   * Detect patterns where AI decisions were ignored or altered
   */
  async detectPatterns(
    module?: string,
    decision_type?: string,
    days: number = 30
  ): Promise<FeedbackPattern[]> {
    try {
      // Check cache first
      const cacheKey = `${module || 'all'}_${decision_type || 'all'}_${days}`;
      const now = Date.now();
      
      if (this.patternCache.has(cacheKey) && (now - this.lastCacheUpdate) < this.CACHE_TTL) {
        return this.patternCache.get(cacheKey)!;
      }

      let query = supabase
        .from('cognitive_feedback')
        .select('*')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

      if (module) {
        query = query.eq('module_name', module);
      }
      if (decision_type) {
        query = query.eq('decision_type', decision_type);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to fetch feedback for pattern detection:', error);
        return [];
      }

      // Analyze patterns
      const patterns = this.analyzePatterns((data || []) as unknown as CognitiveFeedbackEntry[]);
      
      // Update cache
      this.patternCache.set(cacheKey, patterns);
      this.lastCacheUpdate = now;
      
      return patterns;
    } catch (error) {
      logger.error('Error detecting patterns:', error);
      return [];
    }
  }

  /**
   * Analyze feedback data to identify patterns
   */
  private analyzePatterns(feedbackData: CognitiveFeedbackEntry[]): FeedbackPattern[] {
    const patterns: FeedbackPattern[] = [];

    // Group by module and operator action
    const grouped = feedbackData.reduce((acc, entry) => {
      const key = `${entry.module_name}_${entry.operator_action}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(entry);
      return acc;
    }, {} as Record<string, CognitiveFeedbackEntry[]>);

    // Identify patterns
    Object.entries(grouped).forEach(([key, entries]) => {
      const [module, action] = key.split('_');
      
      if (entries.length >= 3) { // Minimum 3 occurrences to form a pattern
        const contextSimilarities = this.findContextSimilarities(entries);
        
        contextSimilarities.forEach(similarity => {
          patterns.push({
            pattern_type: action,
            module,
            frequency: similarity.count,
            confidence: similarity.confidence,
            description: this.generatePatternDescription(module, action, similarity.context),
            examples: similarity.examples,
          });
        });
      }
    });

    // Sort by confidence and frequency
    patterns.sort((a, b) => (b.confidence * b.frequency) - (a.confidence * a.frequency));

    return patterns.slice(0, 20); // Return top 20 patterns
  }

  /**
   * Find similar contexts in feedback entries
   */
  private findContextSimilarities(entries: CognitiveFeedbackEntry[]): Array<{
    context: Record<string, any>;
    count: number;
    confidence: number;
    examples: CognitiveFeedbackEntry[];
  }> {
    const similarities: Map<string, {
      context: Record<string, any>;
      count: number;
      examples: CognitiveFeedbackEntry[];
    }> = new Map();

    entries.forEach(entry => {
      // Extract key context features
      const contextKeys = Object.keys(entry.decision_context);
      const contextSignature = contextKeys
        .map(key => `${key}:${JSON.stringify(entry.decision_context[key])}`)
        .sort()
        .join('|');

      if (similarities.has(contextSignature)) {
        const existing = similarities.get(contextSignature)!;
        existing.count++;
        existing.examples.push(entry);
      } else {
        similarities.set(contextSignature, {
          context: entry.decision_context,
          count: 1,
          examples: [entry],
        });
      }
    });

    return Array.from(similarities.values())
      .filter(s => s.count >= 2) // At least 2 similar contexts
      .map(s => ({
        ...s,
        confidence: Math.min(0.95, (s.count / entries.length) * 1.2), // Higher count = higher confidence
      }));
  }

  /**
   * Generate human-readable pattern description
   */
  private generatePatternDescription(
    module: string,
    action: string,
    context: Record<string, any>
  ): string {
    const contextStr = Object.entries(context)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join(', ');

    const actionDescriptions = {
      accepted: 'accepts',
      rejected: 'rejects',
      modified: 'modifies',
      ignored: 'ignores',
    };

    return `Operator ${actionDescriptions[action as keyof typeof actionDescriptions] || action} ${module} suggestions when ${contextStr}`;
  }

  /**
   * Generate insights from patterns
   */
  async generateInsights(module?: string, days: number = 30): Promise<FeedbackInsight[]> {
    try {
      const patterns = await this.detectPatterns(module, undefined, days);
      const insights: FeedbackInsight[] = [];

      // Analyze rejection patterns
      const rejectionPatterns = patterns.filter(p => p.pattern_type === 'rejected');
      if (rejectionPatterns.length > 0) {
        const topRejection = rejectionPatterns[0];
        insights.push({
          insight: `Operators frequently reject ${topRejection.module} suggestions in specific contexts`,
          category: 'rejection_pattern',
          confidence: topRejection.confidence,
          evidence_count: topRejection.frequency,
          recommendation: `Review ${topRejection.module} decision logic for: ${topRejection.description}`,
        });
      }

      // Analyze modification patterns
      const modificationPatterns = patterns.filter(p => p.pattern_type === 'modified');
      if (modificationPatterns.length > 0) {
        const topModification = modificationPatterns[0];
        insights.push({
          insight: `Operators consistently modify ${topModification.module} outputs`,
          category: 'modification_pattern',
          confidence: topModification.confidence,
          evidence_count: topModification.frequency,
          recommendation: `Adjust ${topModification.module} output format or parameters based on common modifications`,
        });
      }

      // Analyze acceptance patterns (positive feedback)
      const acceptancePatterns = patterns.filter(p => p.pattern_type === 'accepted');
      if (acceptancePatterns.length > 0) {
        const topAcceptance = acceptancePatterns[0];
        insights.push({
          insight: `${topAcceptance.module} performs well in specific scenarios`,
          category: 'success_pattern',
          confidence: topAcceptance.confidence,
          evidence_count: topAcceptance.frequency,
          recommendation: `Expand ${topAcceptance.module} capabilities to similar contexts`,
        });
      }

      return insights.sort((a, b) => (b.confidence * b.evidence_count) - (a.confidence * a.evidence_count));
    } catch (error) {
      logger.error('Error generating insights:', error);
      return [];
    }
  }

  /**
   * Get weekly feedback report
   */
  async getWeeklyReport(vesselId?: string): Promise<WeeklyFeedbackReport | null> {
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      let query = supabase
        .from('cognitive_feedback')
        .select('*')
        .gte('created_at', weekStart.toISOString());

      if (vesselId) {
        query = query.eq('vessel_id', vesselId);
      }

      const { data, error } = await query;

      if (error || !data) {
        logger.error('Failed to fetch weekly feedback:', error);
        return null;
      }

      // Calculate statistics
      const totalDecisions = data.length;
      const accepted = data.filter(d => d.operator_action === 'accepted').length;
      const rejected = data.filter(d => d.operator_action === 'rejected').length;
      const modified = data.filter(d => d.operator_action === 'modified').length;

      // Module performance
      const modulePerformance: Record<string, any> = {};
      data.forEach(entry => {
        const moduleKey = entry.module_name || 'unknown';
        if (!modulePerformance[moduleKey]) {
          modulePerformance[moduleKey] = {
            total: 0,
            accepted: 0,
            rejected: 0,
            success_rate: 0,
          };
        }
        
        modulePerformance[moduleKey].total++;
        if (entry.operator_action === 'accepted') {
          modulePerformance[moduleKey].accepted++;
        }
        if (entry.operator_action === 'rejected') {
          modulePerformance[moduleKey].rejected++;
        }
      });

      // Calculate success rates
      Object.keys(modulePerformance).forEach(module => {
        const perf = modulePerformance[module];
        perf.success_rate = perf.total > 0 ? perf.accepted / perf.total : 0;
      });

      // Get patterns and insights
      const patterns = await this.detectPatterns(undefined, undefined, 7);
      const insights = await this.generateInsights(undefined, 7);

      return {
        week_start: weekStart.toISOString(),
        total_decisions: totalDecisions,
        acceptance_rate: totalDecisions > 0 ? accepted / totalDecisions : 0,
        rejection_rate: totalDecisions > 0 ? rejected / totalDecisions : 0,
        modification_rate: totalDecisions > 0 ? modified / totalDecisions : 0,
        top_patterns: patterns.slice(0, 10),
        key_insights: insights.slice(0, 5),
        module_performance: modulePerformance,
      };
    } catch (error) {
      logger.error('Error generating weekly report:', error);
      return null;
    }
  }

  /**
   * Async pattern detection (non-blocking)
   */
  private async detectPatternsAsync(module: string, decisionType: string): Promise<void> {
    setTimeout(async () => {
      try {
        await this.detectPatterns(module, decisionType, 30);
      } catch (error) {
        logger.error('Error in async pattern detection:', error);
      }
    }, 100);
  }

  /**
   * Async insight generation (non-blocking)
   */
  private async generateInsightsAsync(feedbackId: string): Promise<void> {
    setTimeout(async () => {
      try {
        // Fetch the updated feedback entry
        const { data, error } = await supabase
          .from('cognitive_feedback')
          .select('module_name')
          .eq('id', feedbackId)
          .single();

        if (!error && data) {
          const insights = await this.generateInsights(data.module_name || undefined, 30);
          
          if (insights.length > 0) {
            // Update the feedback entry with the best insight
            await (supabase as any)
              .from('cognitive_feedback')
              .update({
                insight_generated: insights[0].insight,
                pattern_category: insights[0].category,
                confidence_score: insights[0].confidence,
              })
              .eq('id', feedbackId);
          }
        }
      } catch (error) {
        logger.error('Error in async insight generation:', error);
      }
    }, 500);
  }

  /**
   * Clear pattern cache
   */
  clearCache(): void {
    this.patternCache.clear();
    this.lastCacheUpdate = 0;
    logger.info('Cognitive feedback cache cleared');
  }
}

// Export singleton instance
export const cognitiveFeedback = new CognitiveFeedbackCore();

// Export type-safe helper functions
export const logAIDecision = (decision: Omit<CognitiveFeedbackEntry, 'id' | 'created_at' | 'updated_at'>) => 
  cognitiveFeedback.logDecision(decision);

export const updateOperatorFeedback = (feedbackId: string, update: Parameters<typeof cognitiveFeedback.updateFeedback>[1]) =>
  cognitiveFeedback.updateFeedback(feedbackId, update);

export const getWeeklyFeedbackReport = (vesselId?: string) =>
  cognitiveFeedback.getWeeklyReport(vesselId);

export const getFeedbackInsights = (module?: string, days: number = 30) =>
  cognitiveFeedback.generateInsights(module, days);
