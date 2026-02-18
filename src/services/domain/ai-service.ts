/**
 * NAUTI ONE — AI Domain Service
 * Decision logging + suggestion workflow with HITL
 */

import { supabase } from "@/integrations/supabase/client";
import { publishEvent, logAuditEvent } from "@/lib/events/event-bus";
import type { EntityType } from "@/lib/domain/types";

export const AIService = {
  async logDecision(params: {
    entityType: EntityType;
    entityId: string;
    actionType: string;
    confidence: number;
    reasoning: string;
    inputs: Record<string, unknown>;
    outputs: Record<string, unknown>;
  }) {
    const insertData = {
      type: params.actionType,
      title: `AI ${params.actionType} for ${params.entityType}`,
      description: params.reasoning,
      confidence: params.confidence,
      confidence_level: params.confidence >= 0.8 ? 'high' : params.confidence >= 0.5 ? 'medium' : 'low',
      impact: 'medium',
      justification_reasoning: params.reasoning,
      justification_evidence: params.inputs as any,
      action_payload: params.outputs as any,
      status: 'pending',
    };

    const { data, error } = await supabase.from('ai_decisions')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    await publishEvent({
      type: 'ai.decision.logged',
      payload: {
        decision_id: data.id,
        entity_type: params.entityType,
        entity_id: params.entityId,
        confidence: params.confidence,
        action_type: params.actionType,
        reasoning: params.reasoning,
      },
      sourceEntityType: 'ai_decision',
      sourceEntityId: data.id,
    });

    return data;
  },

  async acceptSuggestion(decisionId: string) {
    const { data, error } = await supabase.from('ai_decisions')
      .update({ status: 'approved', executed_at: new Date().toISOString() })
      .eq('id', decisionId)
      .select()
      .single();
    if (error) throw error;

    await publishEvent({
      type: 'ai.suggestion.accepted',
      payload: {
        suggestion_id: data.id,
        action_type: data.type,
        accepted_by: (await supabase.auth.getUser()).data.user?.id,
      },
      sourceEntityType: 'ai_decision',
      sourceEntityId: data.id,
    });

    return data;
  },

  async rejectSuggestion(decisionId: string, reason: string) {
    const { data, error } = await supabase.from('ai_decisions')
      .update({ status: 'rejected', rejected_reason: reason })
      .eq('id', decisionId)
      .select()
      .single();
    if (error) throw error;

    await publishEvent({
      type: 'ai.suggestion.rejected',
      payload: {
        suggestion_id: data.id,
        rejected_reason: reason,
      },
      sourceEntityType: 'ai_decision',
      sourceEntityId: data.id,
    });

    await logAuditEvent({
      entityType: 'ai_decision',
      entityId: data.id,
      action: 'ai.suggestion.rejected',
      metadata: { reason },
    });

    return data;
  },
};
