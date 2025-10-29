/**
 * PATCH 547 – AI Trust Analysis Engine (v1)
 * Motor de análise de confiança com base em entradas de sistema
 */

import { supabase } from "@/integrations/supabase/client";

export interface TrustInput {
  entityId: string;
  entityType: "user" | "incident" | "token" | "system";
  eventType: string;
  eventData?: Record<string, any>;
  impact?: number; // -100 to +100
}

export interface TrustScore {
  score: number; // 0-100
  color: string;
  label: string;
  tooltip: string;
}

/**
 * Calculate trust score based on input events
 * Score ranges from 0 (no trust) to 100 (full trust)
 */
export async function calculateTrustScore(
  input: TrustInput
): Promise<number> {
  try {
    // Get current trust score for entity
    const { data: existingEntity, error: fetchError } = await supabase
      .from("trust_entities")
      .select("trust_score")
      .eq("entity_id", input.entityId)
      .single();

    const currentScore = existingEntity?.trust_score || 50.0;

    // Calculate impact based on event type
    let impact = input.impact || 0;

    if (!input.impact) {
      // Default impact values based on event type
      switch (input.eventType) {
        case "incident_resolved":
          impact = 5;
          break;
        case "incident_created":
          impact = -3;
          break;
        case "successful_login":
          impact = 1;
          break;
        case "failed_login":
          impact = -5;
          break;
        case "token_used":
          impact = 0.5;
          break;
        case "token_expired":
          impact = -2;
          break;
        case "system_error":
          impact = -10;
          break;
        case "successful_action":
          impact = 2;
          break;
        default:
          impact = 0;
      }
    }

    // Calculate new score with decay function (prevents extreme values)
    const decayFactor = 0.8;
    const newScore = Math.max(
      0,
      Math.min(100, currentScore + impact * decayFactor)
    );

    // Update or create entity trust score
    const { error: upsertError } = await supabase
      .from("trust_entities")
      .upsert({
        entity_id: input.entityId,
        entity_type: input.entityType,
        trust_score: newScore,
        last_event_at: new Date().toISOString(),
      });

    if (upsertError) {
      console.error("Error updating trust entity:", upsertError);
    }

    // Log trust event
    await logTrustEvent({
      entityId: input.entityId,
      eventType: input.eventType,
      scoreBefore: currentScore,
      scoreAfter: newScore,
      eventData: input.eventData,
    });

    return newScore;
  } catch (error) {
    console.error("Error calculating trust score:", error);
    return 50.0; // Default neutral score on error
  }
}

/**
 * Log trust event to history
 */
async function logTrustEvent(event: {
  entityId: string;
  eventType: string;
  scoreBefore: number;
  scoreAfter: number;
  eventData?: Record<string, any>;
}): Promise<void> {
  try {
    await supabase.from("trust_events").insert({
      entity_id: event.entityId,
      event_type: event.eventType,
      trust_score_before: event.scoreBefore,
      trust_score_after: event.scoreAfter,
      event_data: event.eventData || {},
    });
  } catch (error) {
    console.error("Error logging trust event:", error);
  }
}

/**
 * Get trust score with color and label
 */
export function getTrustScoreInfo(score: number): TrustScore {
  let color: string;
  let label: string;
  let tooltip: string;

  if (score >= 80) {
    color = "text-green-600";
    label = "Confiável";
    tooltip = "Alta confiança - histórico consistente e positivo";
  } else if (score >= 60) {
    color = "text-blue-600";
    label = "Bom";
    tooltip = "Boa confiança - comportamento geralmente positivo";
  } else if (score >= 40) {
    color = "text-yellow-600";
    label = "Moderado";
    tooltip = "Confiança moderada - monitoramento recomendado";
  } else if (score >= 20) {
    color = "text-orange-600";
    label = "Baixo";
    tooltip = "Baixa confiança - atenção necessária";
  } else {
    color = "text-red-600";
    label = "Crítico";
    tooltip = "Confiança crítica - revisão imediata necessária";
  }

  return {
    score: Math.round(score * 10) / 10,
    color,
    label,
    tooltip,
  };
}

/**
 * Get trust history for an entity
 */
export async function getTrustHistory(
  entityId: string,
  limit: number = 50
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("trust_events")
      .select("*")
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching trust history:", error);
    return [];
  }
}
