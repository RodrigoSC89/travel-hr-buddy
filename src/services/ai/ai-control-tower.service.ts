/**
 * AI Control Tower Service
 * Centralized service for AI governance, model monitoring, and decision audit
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

// ── Types ──────────────────────────────────────────────────────
export interface ModelMetrics {
  model: string;
  requests: number;
  avgLatency: number;
  totalTokensIn: number;
  totalTokensOut: number;
  avgQuality: number | null;
  avgConfidence: number | null;
}

export interface DecisionRecord {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  confidence: number;
  confidenceLevel: string;
  impact: string;
  reasoning: string;
  createdAt: string;
  executedAt: string | null;
  feedbackCorrect: boolean | null;
}

export interface BlockchainBlock {
  id: string;
  blockNumber: number;
  agentName: string;
  module: string;
  actionType: string;
  actionDescription: string;
  confidence: number | null;
  humanOverride: boolean | null;
  hash: string;
  previousHash: string;
  timestamp: string;
}

export interface UsageByService {
  service: string;
  requests: number;
  tokens: number;
  errors: number;
}

export interface UsageByModel {
  model: string;
  count: number;
}

export interface AIControlTowerData {
  modelMetrics: ModelMetrics[];
  decisions: DecisionRecord[];
  blockchainBlocks: BlockchainBlock[];
  usageByService: UsageByService[];
  usageByModel: UsageByModel[];
  healthScore: number;
  totalRequests: number;
  totalTokens: number;
  errorRate: number;
}

// ── Service ────────────────────────────────────────────────────
export class AIControlTowerService {

  async getControlTowerData(): Promise<AIControlTowerData> {
    const [metricsRes, decisionsRes, usageRes] = await Promise.all([
      this.fetchModelMetrics(),
      this.fetchDecisionAudit(),
      this.fetchUsageAnalytics(),
    ]);

    return {
      modelMetrics: metricsRes.models,
      decisions: decisionsRes.decisions,
      blockchainBlocks: decisionsRes.blockchainRecords,
      usageByService: usageRes.byService,
      usageByModel: usageRes.byModel,
      healthScore: 92, // Will be updated from edge function
      totalRequests: usageRes.totalRequests,
      totalTokens: usageRes.totalTokens,
      errorRate: usageRes.errorRate,
    };
  }

  private async fetchModelMetrics(): Promise<{ models: ModelMetrics[] }> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-governance', {
        body: { action: 'model_metrics' },
      });
      if (error) throw error;
      return data?.data || { models: [] };
    } catch {
      // Fallback: fetch directly
      return this.fetchModelMetricsDirect();
    }
  }

  private async fetchModelMetricsDirect(): Promise<{ models: ModelMetrics[] }> {
    const { data: logs } = await supabase
      .from('ai_audit_logs')
      .select('model_provider, model_version, response_time_ms, tokens_input, tokens_output, quality_score, confidence_score')
      .order('created_at', { ascending: false })
      .limit(200);

    if (!logs || logs.length === 0) return { models: [] };

    const modelMap = new Map<string, ModelMetrics & { _count: number; _qCount: number; _cCount: number }>();
    for (const log of logs) {
      const model = log.model_provider || log.model_version || 'unknown';
      const existing = modelMap.get(model) || {
        model, requests: 0, avgLatency: 0, totalTokensIn: 0, totalTokensOut: 0,
        avgQuality: null, avgConfidence: null, _count: 0, _qCount: 0, _cCount: 0,
      };
      existing.requests++;
      existing.avgLatency += log.response_time_ms || 0;
      existing.totalTokensIn += log.tokens_input || 0;
      existing.totalTokensOut += log.tokens_output || 0;
      if (log.quality_score != null) {
        existing.avgQuality = (existing.avgQuality || 0) + log.quality_score;
        existing._qCount++;
      }
      if (log.confidence_score != null) {
        existing.avgConfidence = (existing.avgConfidence || 0) + log.confidence_score;
        existing._cCount++;
      }
      existing._count++;
      modelMap.set(model, existing);
    }

    return {
      models: Array.from(modelMap.values()).map(m => ({
        model: m.model,
        requests: m.requests,
        avgLatency: m._count > 0 ? Math.round(m.avgLatency / m._count) : 0,
        totalTokensIn: m.totalTokensIn,
        totalTokensOut: m.totalTokensOut,
        avgQuality: m._qCount > 0 ? Number(((m.avgQuality || 0) / m._qCount).toFixed(2)) : null,
        avgConfidence: m._cCount > 0 ? Number(((m.avgConfidence || 0) / m._cCount).toFixed(2)) : null,
      })),
    };
  }

  private async fetchDecisionAudit(): Promise<{ decisions: DecisionRecord[]; blockchainRecords: BlockchainBlock[] }> {
    const [decisionsRes, blockchainRes] = await Promise.all([
      supabase.from('ai_decisions').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('ai_blockchain_audit').select('*').order('block_number', { ascending: false }).limit(50),
    ]);

    const decisions: DecisionRecord[] = (decisionsRes.data || []).map((d) => ({
      id: String(d.id),
      title: String(d.title),
      description: String(d.description),
      type: String(d.type),
      status: String(d.status),
      confidence: Number(d.confidence),
      confidenceLevel: String(d.confidence_level),
      impact: String(d.impact),
      reasoning: String(d.justification_reasoning),
      createdAt: String(d.created_at),
      executedAt: d.executed_at ? String(d.executed_at) : null,
      feedbackCorrect: d.feedback_was_correct != null ? Boolean(d.feedback_was_correct) : null,
    }));

    const blockchainRecords: BlockchainBlock[] = (blockchainRes.data || []).map((b) => ({
      id: String(b.id),
      blockNumber: Number(b.block_number),
      agentName: String(b.agent_name),
      module: String(b.module),
      actionType: String(b.action_type),
      actionDescription: String(b.action_description),
      confidence: b.confidence != null ? Number(b.confidence) : null,
      humanOverride: Boolean(b.human_override),
      hash: String(b.hash),
      previousHash: String(b.previous_hash),
      timestamp: b.timestamp,
    }));

    return { decisions, blockchainRecords };
  }

  private async fetchUsageAnalytics(): Promise<{
    byService: UsageByService[];
    byModel: UsageByModel[];
    totalRequests: number;
    totalTokens: number;
    errorRate: number;
  }> {
    const { data: logs } = await supabase
      .from('ai_logs')
      .select('service, model, status, tokens_used')
      .order('created_at', { ascending: false })
      .limit(500);

    if (!logs || logs.length === 0) {
      return { byService: [], byModel: [], totalRequests: 0, totalTokens: 0, errorRate: 0 };
    }

    const serviceMap = new Map<string, UsageByService>();
    const modelMap = new Map<string, number>();

    for (const log of logs) {
      const svc = log.service || 'unknown';
      const existing = serviceMap.get(svc) || { service: svc, requests: 0, tokens: 0, errors: 0 };
      existing.requests++;
      existing.tokens += log.tokens_used || 0;
      if (log.status === 'error') existing.errors++;
      serviceMap.set(svc, existing);

      const model = log.model || 'unknown';
      modelMap.set(model, (modelMap.get(model) || 0) + 1);
    }

    const totalErrors = logs.filter(l => l.status === 'error').length;

    return {
      byService: Array.from(serviceMap.values()),
      byModel: Array.from(modelMap.entries()).map(([model, count]) => ({ model, count })),
      totalRequests: logs.length,
      totalTokens: logs.reduce((a, l) => a + (l.tokens_used || 0), 0),
      errorRate: logs.length > 0 ? Number(((totalErrors / logs.length) * 100).toFixed(1)) : 0,
    };
  }

  async generateGovernanceReport(): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-governance', {
        body: { action: 'governance_report' },
      });
      if (error) throw error;
      return data?.data?.report || null;
    } catch (err) {
      logger.error('Governance report error:', err);
      return null;
    }
  }
}

export const aiControlTower = new AIControlTowerService();
