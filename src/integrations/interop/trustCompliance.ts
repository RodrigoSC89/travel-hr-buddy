// PATCH 229 - Trust Compliance
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface TrustEvent {
  entity_id: string;
  event_type: string;
  trust_impact: number; // positive or negative change
  details: any;
  severity?: "info" | "warning" | "critical";
}

export interface TrustValidationResult {
  valid: boolean;
  trust_score: number;
  blocked: boolean;
  reason?: string;
  warnings: string[];
}

// Calculate trust score based on rules
export function calculateTrustScore(
  currentScore: number,
  event: TrustEvent
): number {
  let newScore = currentScore + event.trust_impact;
  
  // Clamp between 0 and 100
  newScore = Math.max(0, Math.min(100, newScore));
  
  return Math.round(newScore * 100) / 100;
}

// Validate entity trust level
export async function validateEntityTrust(
  entityId: string,
  action: string
): Promise<TrustValidationResult> {
  const { data: entity, error } = await supabase
    .from("external_entities")
    .select("*")
    .eq("entity_id", entityId)
    .single();

  if (error || !entity) {
    return {
      valid: false,
      trust_score: 0,
      blocked: true,
      reason: "Entity not found",
      warnings: ["Entity does not exist in registry"]
    });
  }

  const warnings: string[] = [];
  let blocked = false;

  // Trust score thresholds
  if (entity.trust_score < 30) {
    blocked = true;
    warnings.push("Trust score critically low - entity blocked");
  } else if (entity.trust_score < 50) {
    warnings.push("Trust score below recommended threshold");
  }

  // Status check
  if (entity.status === "suspended") {
    blocked = true;
    warnings.push("Entity is currently suspended");
  } else if (entity.status === "inactive") {
    warnings.push("Entity is marked as inactive");
  }

  return {
    valid: !blocked,
    trust_score: entity.trust_score,
    blocked: blocked,
    reason: blocked ? warnings[0] : undefined,
    warnings: warnings
  };
}

// Record trust event
export async function recordTrustEvent(event: TrustEvent): Promise<void> {
  // Get current entity trust score
  const { data: entity, error: fetchError } = await supabase
    .from("external_entities")
    .select("trust_score")
    .eq("entity_id", event.entity_id)
    .single();

  if (!entity || fetchError) {
    logger.error("Entity not found for trust event", { error: fetchError, entity_id: event.entity_id });
    throw new Error(`Entity ${event.entity_id} not found`);
  }

  const oldScore = entity.trust_score;
  const newScore = calculateTrustScore(oldScore, event);

  // Update entity trust score
  const { error: updateError } = await supabase
    .from("external_entities")
    .update({ trust_score: newScore })
    .eq("entity_id", event.entity_id);

  if (updateError) {
    logger.error("Failed to update trust score", { error: updateError, entity_id: event.entity_id });
    throw updateError;
  }

  // Log the trust event
  const { error: insertError } = await supabase.from("trust_events").insert({
    entity_id: event.entity_id,
    event_type: event.event_type,
    trust_score_before: oldScore,
    trust_score_after: newScore,
    details: event.details,
    severity: event.severity || "info"
  });

  if (insertError) {
    logger.error("Failed to log trust event", { error: insertError, entity_id: event.entity_id });
    throw insertError;
  }
  
  logger.info("Trust event recorded", { 
    entity_id: event.entity_id, 
    event_type: event.event_type, 
    old_score: oldScore, 
    new_score: newScore 
  });
}

// Get trust events for an entity
export async function getTrustEvents(
  entityId: string,
  limit: number = 50
) {
  const { data, error } = await supabase
    .from("trust_events")
    .select("*")
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    logger.error("Failed to get trust events", { error, entity_id: entityId });
    throw error;
  }
  return data;
}

// Get trust score history
export async function getTrustScoreHistory(entityId: string) {
  const events = await getTrustEvents(entityId, 100);
  
  return events.map(event => ({
    timestamp: event.created_at,
    score: event.trust_score_after,
    event_type: event.event_type,
    severity: event.severity
  }));
}

// Validate input data for trust rules
export function validateTrustInput(input: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.entity_id) {
    errors.push("Missing entity_id");
  }

  if (!input.event_type) {
    errors.push("Missing event_type");
  }

  if (typeof input.trust_impact !== "number") {
    errors.push("Missing or invalid trust_impact");
  }

  if (input.trust_impact && Math.abs(input.trust_impact) > 50) {
    errors.push("Trust impact too large (max ±50)");
  }

  return {
    valid: errors.length === 0,
    errors: errors
  });
}

// Check if entity should trigger alert
export async function checkTrustAlerts(entityId: string): Promise<{
  should_alert: boolean;
  alerts: string[];
}> {
  const validation = await validateEntityTrust(entityId, "check");
  const alerts: string[] = [];

  if (validation.trust_score < 30) {
    alerts.push(`Critical: Trust score below 30 (${validation.trust_score})`);
  }

  if (validation.blocked) {
    alerts.push(`Entity ${entityId} is currently blocked`);
  }

  alerts.push(...validation.warnings);

  return {
    should_alert: alerts.length > 0,
    alerts: alerts
  };
}
