/**
 * AI Cost Tracker - Production cost management
 * Tracks token usage, estimates costs, and enforces budgets
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

// Pricing per 1M tokens (as of 2024)
const PRICING: Record<string, { input: number; output: number }> = {
  // Gemini models
  'google/gemini-3-pro-preview': { input: 1.25, output: 5.00 },
  'google/gemini-3-flash-preview': { input: 0.075, output: 0.30 },
  'google/gemini-2.5-pro': { input: 1.25, output: 5.00 },
  'google/gemini-2.5-flash': { input: 0.075, output: 0.30 },
  'google/gemini-2.5-flash-lite': { input: 0.0375, output: 0.15 },
  
  // OpenAI models
  'openai/gpt-5': { input: 5.00, output: 15.00 },
  'openai/gpt-5-mini': { input: 0.15, output: 0.60 },
  'openai/gpt-5-nano': { input: 0.075, output: 0.30 },
  'openai/gpt-5.2': { input: 5.00, output: 15.00 },
  
  // Voice
  'whisper': { input: 0.006, output: 0 }, // per second of audio
  'elevenlabs': { input: 0.30, output: 0 }, // per 1000 characters
  
  // Default fallback
  'default': { input: 0.10, output: 0.40 }
};

export interface TokenUsage {
  model: string;
  inputTokens: number;
  outputTokens: number;
  timestamp: number;
  module: string;
  userId?: string;
  organizationId?: string;
}

export interface CostSummary {
  totalCost: number;
  byModel: Record<string, { tokens: number; cost: number }>;
  byModule: Record<string, { tokens: number; cost: number }>;
  byDay: Array<{ date: string; cost: number }>;
  projectedMonthly: number;
  budgetRemaining: number;
  budgetUtilization: number;
}

interface BudgetConfig {
  monthlyLimit: number;
  alertThreshold: number; // 0-1 (e.g., 0.8 = alert at 80%)
  hardLimit: boolean; // If true, block requests when budget exceeded
}

const DEFAULT_BUDGET: BudgetConfig = {
  monthlyLimit: 500, // $500/month default
  alertThreshold: 0.8,
  hardLimit: false
};

// In-memory buffer for batching
const usageBuffer: TokenUsage[] = [];
const FLUSH_INTERVAL = 30000; // 30 seconds
const FLUSH_SIZE = 50;

let flushTimer: NodeJS.Timeout | null = null;

/**
 * Calculate cost for token usage
 */
export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = PRICING[model] || PRICING['default'];
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

/**
 * Track token usage
 */
export function trackUsage(usage: TokenUsage): void {
  usageBuffer.push({
    ...usage,
    timestamp: Date.now()
  });

  // Start flush timer if not running
  if (!flushTimer) {
    flushTimer = setTimeout(flushUsageBuffer, FLUSH_INTERVAL);
  }

  // Flush if buffer is full
  if (usageBuffer.length >= FLUSH_SIZE) {
    flushUsageBuffer();
  }
}

/**
 * Flush usage buffer to database
 */
async function flushUsageBuffer(): Promise<void> {
  if (usageBuffer.length === 0) return;

  const toFlush = [...usageBuffer];
  usageBuffer.length = 0;

  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  try {
    // Log to ai_usage_logs table
    const records = toFlush.map(usage => ({
      module_name: usage.module,
      module_id: usage.module,
      tokens_input: usage.inputTokens,
      tokens_output: usage.outputTokens,
      user_id: usage.userId,
      organization_id: usage.organizationId,
      metadata: {
        model: usage.model,
        cost: calculateCost(usage.model, usage.inputTokens, usage.outputTokens)
      },
      success: true,
      created_at: new Date(usage.timestamp).toISOString()
    }));

    const { error } = await supabase
      .from('ai_usage_logs')
      .insert(records);

    if (error) {
      logger.warn('[CostTracker] Failed to flush usage', { error });
      // Re-add failed records back to buffer
      usageBuffer.push(...toFlush);
    } else {
      logger.debug(`[CostTracker] Flushed ${records.length} usage records`);
    }
  } catch (error) {
    logger.error('[CostTracker] Flush error', error);
    // Re-add failed records
    usageBuffer.push(...toFlush);
  }
}

/**
 * Get cost summary for current month
 */
export async function getMonthlyCostSummary(organizationId?: string): Promise<CostSummary> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  try {
    let query = supabase
      .from('ai_usage_logs')
      .select('*')
      .gte('created_at', startOfMonth.toISOString());

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const logs = data || [];
    
    // Calculate totals
    let totalCost = 0;
    const byModel: Record<string, { tokens: number; cost: number }> = {};
    const byModule: Record<string, { tokens: number; cost: number }> = {};
    const byDayMap: Record<string, number> = {};

    for (const log of logs) {
      const model = (log.metadata as any)?.model || 'unknown';
      const cost = (log.metadata as any)?.cost || 0;
      const tokens = (log.tokens_input || 0) + (log.tokens_output || 0);
      const day = new Date(log.created_at || '').toISOString().split('T')[0];

      totalCost += cost;

      // By model
      if (!byModel[model]) byModel[model] = { tokens: 0, cost: 0 };
      byModel[model].tokens += tokens;
      byModel[model].cost += cost;

      // By module
      const module = log.module_name || 'unknown';
      if (!byModule[module]) byModule[module] = { tokens: 0, cost: 0 };
      byModule[module].tokens += tokens;
      byModule[module].cost += cost;

      // By day
      byDayMap[day] = (byDayMap[day] || 0) + cost;
    }

    const byDay = Object.entries(byDayMap)
      .map(([date, cost]) => ({ date, cost }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Project monthly cost
    const daysInMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0).getDate();
    const daysPassed = new Date().getDate();
    const projectedMonthly = daysPassed > 0 ? (totalCost / daysPassed) * daysInMonth : 0;

    const budget = DEFAULT_BUDGET.monthlyLimit;
    const budgetRemaining = Math.max(0, budget - totalCost);
    const budgetUtilization = totalCost / budget;

    return {
      totalCost,
      byModel,
      byModule,
      byDay,
      projectedMonthly,
      budgetRemaining,
      budgetUtilization
    };
  } catch (error) {
    logger.error('[CostTracker] Failed to get cost summary:', error);
    return {
      totalCost: 0,
      byModel: {},
      byModule: {},
      byDay: [],
      projectedMonthly: 0,
      budgetRemaining: DEFAULT_BUDGET.monthlyLimit,
      budgetUtilization: 0
    };
  }
}

/**
 * Check if within budget
 */
export async function checkBudget(organizationId?: string): Promise<{
  withinBudget: boolean;
  utilizationPercent: number;
  shouldAlert: boolean;
}> {
  const summary = await getMonthlyCostSummary(organizationId);
  
  return {
    withinBudget: summary.totalCost < DEFAULT_BUDGET.monthlyLimit,
    utilizationPercent: summary.budgetUtilization * 100,
    shouldAlert: summary.budgetUtilization >= DEFAULT_BUDGET.alertThreshold
  };
}

/**
 * Estimate cost before making request
 */
export function estimateCost(
  model: string,
  promptLength: number,
  expectedOutputLength: number = 500
): number {
  // Rough estimate: ~4 chars per token
  const inputTokens = Math.ceil(promptLength / 4);
  const outputTokens = Math.ceil(expectedOutputLength / 4);
  return calculateCost(model, inputTokens, outputTokens);
}

/**
 * Get model recommendation based on budget and complexity
 */
export function recommendModel(
  complexity: 'simple' | 'medium' | 'complex',
  remainingBudget: number
): string {
  // If budget is low, use cheaper models
  if (remainingBudget < 50) {
    return 'google/gemini-2.5-flash-lite';
  }

  switch (complexity) {
    case 'simple':
      return 'google/gemini-2.5-flash-lite';
    case 'medium':
      return 'google/gemini-3-flash-preview';
    case 'complex':
      return remainingBudget > 200 ? 'google/gemini-3-pro-preview' : 'google/gemini-3-flash-preview';
    default:
      return 'google/gemini-3-flash-preview';
  }
}

// Force flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (usageBuffer.length > 0) {
      // Use sendBeacon for reliable delivery
      const blob = new Blob([JSON.stringify(usageBuffer)], { type: 'application/json' });
      navigator.sendBeacon('/api/ai-usage-beacon', blob);
    }
  });
}

export { PRICING, DEFAULT_BUDGET };
