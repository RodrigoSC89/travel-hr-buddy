/**
 * PATCH 547 - AI Trust Analysis Engine
 * Event-based trust scoring (0-100) for users, incidents, tokens, systems
 */

import { supabase } from "@/integrations/supabase/client";

export interface TrustInput {
  entityId: string;
  entityType: "user" | "incident" | "token" | "system";
  eventType: "incident_resolved" | "incident_created" | "validation_success" | "validation_failure" | "breach_detected" | "audit_passed" | "audit_failed";
  sourceSystem?: string;
  metadata?: Record<string, any>;
}

export interface TrustScore {
  score: number;
  level: "very_low" | "low" | "medium" | "high" | "excellent";
  factors: {
    recentActivity: number;
    historicalPerformance: number;
    complianceRecord: number;
    incidentHistory: number;
  };
  recommendation: string;
}

const EVENT_WEIGHTS = {
  incident_resolved: 15,
  incident_created: -10,
  validation_success: 5,
  validation_failure: -8,
  breach_detected: -25,
  audit_passed: 10,
  audit_failed: -15,
};

/**
 * Calculate trust score based on entity's event history
 */
export async function calculateTrustScore(input: TrustInput): Promise<TrustScore> {
  const { entityId, entityType, eventType, sourceSystem, metadata } = input;

  try {
    // Get historical events for this entity
    const { data: historicalEvents, error: historyError } = await supabase
      .from("trust_events")
      .select("*")
      .eq("source_system", entityId)
      .order("timestamp", { ascending: false })
      .limit(50);

    if (historyError && historyError.code !== "PGRST116") {
    }

    // Calculate base score from historical events
    let baseScore = 50; // Start neutral
    let recentActivity = 50;
    let historicalPerformance = 50;
    let complianceRecord = 50;
    let incidentHistory = 50;

    if (historicalEvents && historicalEvents.length > 0) {
      // Recent activity (last 10 events)
      const recentEvents = historicalEvents.slice(0, 10);
      const recentSum = recentEvents.reduce((sum, event) => {
        const weight = EVENT_WEIGHTS[event.event_type as keyof typeof EVENT_WEIGHTS] || 0;
        return sum + weight;
      }, 0);
      recentActivity = Math.max(0, Math.min(100, 50 + recentSum));

      // Historical performance (all events)
      const historicalSum = historicalEvents.reduce((sum, event) => {
        const weight = EVENT_WEIGHTS[event.event_type as keyof typeof EVENT_WEIGHTS] || 0;
        return sum + weight;
      }, 0);
      historicalPerformance = Math.max(0, Math.min(100, 50 + historicalSum / historicalEvents.length * 2));

      // Compliance record (compliance-related events)
      const complianceEvents = historicalEvents.filter(e => 
        (e.details as any)?.compliance_status === "compliant" || e.event_type === "audit_passed"
      );
      complianceRecord = Math.round((complianceEvents.length / historicalEvents.length) * 100);

      // Incident history (incident-related events)
      const incidentEvents = historicalEvents.filter(e => 
        e.event_type === "breach_detected" || (e.details as any)?.incident_created
      );
      const resolvedIncidents = historicalEvents.filter(e => 
        e.event_type === "incident_resolved"
      );
      if (incidentEvents.length > 0) {
        incidentHistory = Math.round((resolvedIncidents.length / incidentEvents.length) * 100);
      }

      // Calculate weighted average
      baseScore = Math.round(
        recentActivity * 0.3 +
        historicalPerformance * 0.3 +
        complianceRecord * 0.2 +
        incidentHistory * 0.2
      );
    }

    // Apply current event weight
    const eventWeight = EVENT_WEIGHTS[eventType] || 0;
    const finalScore = Math.max(0, Math.min(100, baseScore + eventWeight));

    // Determine trust level
    let level: TrustScore["level"];
    let recommendation: string;

    if (finalScore >= 80) {
      level = "excellent";
      recommendation = "Highly trusted entity with excellent track record";
    } else if (finalScore >= 60) {
      level = "high";
      recommendation = "Trusted entity with good performance history";
    } else if (finalScore >= 40) {
      level = "medium";
      recommendation = "Moderate trust - monitor for any issues";
    } else if (finalScore >= 20) {
      level = "low";
      recommendation = "Low trust - increased monitoring recommended";
    } else {
      level = "very_low";
      recommendation = "Critical trust issues - immediate review required";
    }

    // Log this event to trust_events table
    const { error: insertError } = await supabase
      .from("trust_events")
      .insert({
        entity_id: entityId,
        event_type: eventType === "incident_resolved" || eventType === "incident_created" ? "audit" : "validation",
        severity: finalScore < 40 ? "high" : finalScore < 60 ? "medium" : "low",
        trust_score_before: null,
        trust_score_after: finalScore,
        details: {
          entityType,
          eventType,
          sourceSystem: sourceSystem || entityId,
          compliance_status: finalScore >= 60 ? "compliant" : finalScore >= 40 ? "pending" : "non_compliant",
          validation_results: {
            recentActivity,
            historicalPerformance,
            complianceRecord,
            incidentHistory,
          },
          alert_level: finalScore < 40 ? "high" : finalScore < 60 ? "warning" : "info",
          alert_message: `Trust score calculated for ${entityType} ${entityId}: ${finalScore}/100 (${level})`,
          metadata: metadata || {},
        },
      });

    if (insertError) {
    }

    return {
      score: finalScore,
      level,
      factors: {
        recentActivity,
        historicalPerformance,
        complianceRecord,
        incidentHistory,
      },
      recommendation,
    });
  } catch (error) {
    console.error("Error calculating trust score:", error);
    console.error("Error calculating trust score:", error);
    // Return default medium score on error
    return {
      score: 50,
      level: "medium",
      factors: {
        recentActivity: 50,
        historicalPerformance: 50,
        complianceRecord: 50,
        incidentHistory: 50,
      },
      recommendation: "Unable to calculate trust score - using default value",
    };
  }
}

/**
 * Get trust score history for an entity
 */
export async function getTrustScoreHistory(
  entityId: string,
  limit: number = 30
): Promise<Array<{ timestamp: string; score: number; event_type: string }>> {
  try {
    const { data, error } = await supabase
      .from("trust_events")
      .select("created_at, trust_score_after, event_type")
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return [];
    }

    return (data || []).map((event) => ({
      timestamp: event.created_at,
      score: event.trust_score_after,
      event_type: event.event_type,
    }));
  } catch (error) {
    console.error("Error in getTrustScoreHistory:", error);
    console.error("Error in getTrustScoreHistory:", error);
    return [];
  }
}
