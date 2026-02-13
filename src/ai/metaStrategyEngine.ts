/**
 * PATCH 231 - Meta-Strategy Engine
 * 
 * Generates alternative strategies and selects the best option based on scoring.
 * DEBT-FIX: Replaced non-existent meta_strategy_log with ai_audit_logs
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Json } from "@/integrations/supabase/types";

export interface Strategy {
  id: string;
  name: string;
  description: string;
  score: number;
  reasoning: string;
  parameters: Record<string, unknown>;
  estimated_impact: number;
  risk_level: "low" | "medium" | "high";
  complexity: number;
}

export interface StrategyContext {
  goal: string;
  constraints: Record<string, unknown>;
  current_state: Record<string, unknown>;
  available_resources: string[];
  priority: "low" | "medium" | "high" | "critical";
}

export interface StrategySelection {
  selected_strategy: Strategy;
  alternatives: Strategy[];
  context: StrategyContext;
  timestamp: string;
}

class MetaStrategyEngine {
  private strategies: Map<string, Strategy> = new Map();

  async generateStrategies(context: StrategyContext): Promise<Strategy[]> {
    logger.info("Generating strategies", { goal: context.goal });

    const strategies: Strategy[] = [];

    strategies.push({
      id: `strat-conservative-${Date.now()}`,
      name: "Conservative Approach",
      description: "Minimize risk with proven methods",
      score: this.calculateScore(context, "conservative"),
      reasoning: "Low risk, proven track record, slower results",
      parameters: { risk_tolerance: 0.2, innovation_level: 0.3, resource_usage: 0.5 },
      estimated_impact: 0.6,
      risk_level: "low",
      complexity: 0.4
    });

    strategies.push({
      id: `strat-balanced-${Date.now() + 1}`,
      name: "Balanced Approach",
      description: "Balance innovation with stability",
      score: this.calculateScore(context, "balanced"),
      reasoning: "Moderate risk, balanced innovation, steady results",
      parameters: { risk_tolerance: 0.5, innovation_level: 0.6, resource_usage: 0.7 },
      estimated_impact: 0.75,
      risk_level: "medium",
      complexity: 0.6
    });

    strategies.push({
      id: `strat-aggressive-${Date.now() + 2}`,
      name: "Aggressive Approach",
      description: "Maximize impact with innovative methods",
      score: this.calculateScore(context, "aggressive"),
      reasoning: "High risk, high reward, fast results, innovative",
      parameters: { risk_tolerance: 0.8, innovation_level: 0.9, resource_usage: 0.9 },
      estimated_impact: 0.9,
      risk_level: "high",
      complexity: 0.8
    });

    strategies.push({
      id: `strat-optimized-${Date.now() + 3}`,
      name: "Resource-Optimized",
      description: "Maximize efficiency with minimal resources",
      score: this.calculateScore(context, "optimized"),
      reasoning: "Low resource usage, efficient, moderate impact",
      parameters: { risk_tolerance: 0.4, innovation_level: 0.5, resource_usage: 0.3 },
      estimated_impact: 0.65,
      risk_level: "low",
      complexity: 0.5
    });

    strategies.forEach(s => this.strategies.set(s.id, s));
    await this.logStrategyGeneration(context, strategies);

    return strategies.sort((a, b) => b.score - a.score);
  }

  private calculateScore(context: StrategyContext, approach: string): number {
    let score = 50;

    if (context.priority === "critical") {
      if (approach === "aggressive") score += 30;
      if (approach === "balanced") score += 20;
    } else if (context.priority === "low") {
      if (approach === "conservative") score += 25;
      if (approach === "optimized") score += 30;
    } else {
      if (approach === "balanced") score += 30;
    }

    if (context.available_resources.length < 3) {
      if (approach === "optimized") score += 20;
      if (approach === "aggressive") score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  async selectBestStrategy(
    strategies: Strategy[],
    context: StrategyContext
  ): Promise<StrategySelection> {
    if (strategies.length === 0) {
      throw new Error("No strategies available for selection");
    }

    const sorted = [...strategies].sort((a, b) => b.score - a.score);
    const selected = sorted[0];
    const alternatives = sorted.slice(1);

    const selection: StrategySelection = {
      selected_strategy: selected,
      alternatives,
      context,
      timestamp: new Date().toISOString()
    };

    logger.info("Selected strategy", { name: selected.name, score: selected.score });
    await this.logStrategySelection(selection);

    return selection;
  }

  /**
   * Log strategy generation to ai_audit_logs (canonical table)
   */
  private async logStrategyGeneration(
    context: StrategyContext,
    strategies: Strategy[]
  ): Promise<void> {
    try {
      await supabase.from("ai_audit_logs").insert({
        user_input: `strategy_generation:${context.goal}`,
        ai_response: strategies.map(s => `${s.name}(${s.score.toFixed(0)})`).join(", "),
        interaction_type: "meta_strategy_generation",
        module_name: "meta_strategy_engine",
        model_parameters: {
          context,
          strategies: strategies.map(s => ({ id: s.id, name: s.name, score: s.score })),
          total_generated: strategies.length,
        } as unknown as Json,
      });
    } catch (error) {
      logger.error("Failed to log generation", { error });
    }
  }

  /**
   * Log strategy selection to ai_audit_logs
   */
  private async logStrategySelection(selection: StrategySelection): Promise<void> {
    try {
      await supabase.from("ai_audit_logs").insert({
        user_input: `strategy_selection:${selection.context.goal}`,
        ai_response: selection.selected_strategy.name,
        interaction_type: "meta_strategy_selection",
        module_name: "meta_strategy_engine",
        confidence_score: selection.selected_strategy.score / 100,
        model_parameters: {
          selected_id: selection.selected_strategy.id,
          selected_score: selection.selected_strategy.score,
          reasoning: selection.selected_strategy.reasoning,
          alternatives_count: selection.alternatives.length,
        } as unknown as Json,
      });
    } catch (error) {
      logger.error("Failed to log selection", { error });
    }
  }

  getStrategy(id: string): Strategy | undefined {
    return this.strategies.get(id);
  }

  /**
   * Get strategy logs from ai_audit_logs
   */
  async getStrategyLogs(limit: number = 50): Promise<Record<string, unknown>[]> {
    try {
      const { data, error } = await supabase
        .from("ai_audit_logs")
        .select("*")
        .in("interaction_type", ["meta_strategy_generation", "meta_strategy_selection"])
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("Failed to fetch logs", { error });
      return [];
    }
  }
}

export const metaStrategyEngine = new MetaStrategyEngine();
