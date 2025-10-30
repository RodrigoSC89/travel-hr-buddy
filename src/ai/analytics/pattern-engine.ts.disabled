/**
 * PATCH 598 - Global Pattern Recognition Engine
 * 
 * Engine for recognizing patterns in mission operations, failures, and successes.
 * Implements:
 * - Mission history and signal analysis
 * - Common failure/success pattern detection
 * - Preventive alert emission
 * - Filters by mission type and failure type
 */

import { supabase } from "@/integrations/supabase/client";
import { signalCollector, SignalType } from "../signal/situational-collector";
import { intelligenceCore } from "../mission/persistent-intelligence-core";

export type PatternType = "failure" | "success" | "anomaly" | "warning";

export interface PatternData {
  description: string;
  indicators: string[];
  conditions: Record<string, any>;
  sample_size: number;
}

export interface MissionPattern {
  id: string;
  pattern_type: PatternType;
  pattern_data: PatternData;
  mission_types: string[];
  occurrences: number;
  confidence_score: number;
  preventive_actions: string[];
  first_detected_at: string;
  last_detected_at: string;
  created_at: string;
}

export interface PatternAlert {
  pattern_id: string;
  pattern_type: PatternType;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  recommended_actions: string[];
  detected_at: string;
}

/**
 * Global Pattern Recognition Engine Class
 */
export class PatternRecognitionEngine {
  private detectionThreshold = 0.7; // Minimum confidence for pattern detection

  /**
   * Analyze mission data and detect patterns
   */
  async analyzeAndDetectPatterns(missionId: string): Promise<MissionPattern[]> {
    console.log(`🔍 [Pattern Engine] Analyzing patterns for mission ${missionId}`);

    // Fetch mission intelligence
    const intelligence = await intelligenceCore.fetchMissionIntelligence(missionId);
    if (!intelligence) {
      console.warn(`⚠️ [Pattern Engine] No intelligence data for mission ${missionId}`);
      return [];
    }

    // Fetch signals
    const signals = await signalCollector.getSignals(missionId, undefined, 500);

    // Analyze patterns
    const detectedPatterns: MissionPattern[] = [];

    // Pattern 1: Failure prediction based on signal degradation
    const failurePattern = await this.detectFailurePattern(signals);
    if (failurePattern) {
      detectedPatterns.push(failurePattern);
    }

    // Pattern 2: Success indicators
    const successPattern = await this.detectSuccessPattern(intelligence, signals);
    if (successPattern) {
      detectedPatterns.push(successPattern);
    }

    // Pattern 3: Anomaly detection
    const anomalyPattern = await this.detectAnomalyPattern(signals);
    if (anomalyPattern) {
      detectedPatterns.push(anomalyPattern);
    }

    console.log(`✅ [Pattern Engine] Detected ${detectedPatterns.length} patterns`);
    return detectedPatterns;
  }

  /**
   * Detect failure patterns
   */
  private async detectFailurePattern(signals: any[]): Promise<MissionPattern | null> {
    // Analyze signal quality degradation
    const recentSignals = signals.slice(0, 20);
    const avgQuality = recentSignals.reduce((sum, s) => {
      const quality = s.normalized_data?.quality || 0.5;
      return sum + quality;
    }, 0) / Math.max(recentSignals.length, 1);

    // If average quality is below threshold, it's a failure indicator
    if (avgQuality < 0.6) {
      const pattern: PatternData = {
        description: "Signal quality degradation detected",
        indicators: ["Low signal quality", "Potential equipment failure"],
        conditions: {
          avg_quality: avgQuality,
          signal_count: recentSignals.length,
        },
        sample_size: recentSignals.length,
      };

      return await this.createPattern("failure", pattern, ["equipment", "communication"]);
    }

    return null;
  }

  /**
   * Detect success patterns
   */
  private async detectSuccessPattern(intelligence: any, signals: any[]): Promise<MissionPattern | null> {
    // Analyze successful decisions
    const successfulDecisions = (intelligence.decisions || []).filter(
      (d: any) => d.outcome === "success" && d.confidence > 0.8
    );

    if (successfulDecisions.length >= 3) {
      const pattern: PatternData = {
        description: "High success rate in decision making",
        indicators: ["Multiple successful decisions", "High confidence scores"],
        conditions: {
          success_count: successfulDecisions.length,
          avg_confidence: successfulDecisions.reduce((sum: number, d: any) => sum + d.confidence, 0) / successfulDecisions.length,
        },
        sample_size: successfulDecisions.length,
      };

      return await this.createPattern("success", pattern, ["operations", "decision-making"]);
    }

    return null;
  }

  /**
   * Detect anomaly patterns
   */
  private async detectAnomalyPattern(signals: any[]): Promise<MissionPattern | null> {
    // Group signals by type
    const signalsByType: Record<string, any[]> = {};
    signals.forEach((signal) => {
      const type = signal.signal_type;
      if (!signalsByType[type]) {
        signalsByType[type] = [];
      }
      signalsByType[type].push(signal);
    });

    // Check for missing signal types (anomaly)
    const expectedTypes: SignalType[] = ["voice", "climate", "sensor", "navigation"];
    const missingTypes = expectedTypes.filter((type) => !signalsByType[type] || signalsByType[type].length === 0);

    if (missingTypes.length > 0) {
      const pattern: PatternData = {
        description: "Missing signal types detected",
        indicators: missingTypes.map((t) => `Missing ${t} signals`),
        conditions: {
          missing_types: missingTypes,
          total_types_expected: expectedTypes.length,
        },
        sample_size: signals.length,
      };

      return await this.createPattern("anomaly", pattern, ["monitoring", "sensors"]);
    }

    return null;
  }

  /**
   * Create and persist pattern
   */
  private async createPattern(
    type: PatternType,
    patternData: PatternData,
    missionTypes: string[]
  ): Promise<MissionPattern | null> {
    try {
      const preventiveActions = this.generatePreventiveActions(type, patternData);

      const { data, error } = await supabase
        .from("mission_patterns")
        .insert({
          pattern_type: type,
          pattern_data: patternData,
          mission_types: missionTypes,
          occurrences: 1,
          confidence_score: this.calculateConfidence(patternData),
          preventive_actions: preventiveActions,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ [Pattern Engine] Error creating pattern:", error);
        return null;
      }

      console.log(`✅ [Pattern Engine] Pattern created: ${type}`);
      return data as MissionPattern;
    } catch (err) {
      console.error("❌ [Pattern Engine] Exception creating pattern:", err);
      return null;
    }
  }

  /**
   * Calculate confidence score for pattern
   */
  private calculateConfidence(patternData: PatternData): number {
    const sampleSizeFactor = Math.min(1, patternData.sample_size / 10);
    const indicatorFactor = Math.min(1, patternData.indicators.length / 3);
    return (sampleSizeFactor + indicatorFactor) / 2;
  }

  /**
   * Generate preventive actions based on pattern
   */
  private generatePreventiveActions(type: PatternType, patternData: PatternData): string[] {
    const actions: string[] = [];

    switch (type) {
      case "failure":
        actions.push("Check equipment status immediately");
        actions.push("Increase signal monitoring frequency");
        actions.push("Prepare backup systems");
        break;

      case "success":
        actions.push("Document successful procedures");
        actions.push("Replicate decision-making approach");
        actions.push("Share best practices with team");
        break;

      case "anomaly":
        actions.push("Investigate missing data sources");
        actions.push("Verify sensor connectivity");
        actions.push("Review monitoring configuration");
        break;

      case "warning":
        actions.push("Monitor situation closely");
        actions.push("Alert relevant personnel");
        actions.push("Prepare contingency plans");
        break;
    }

    return actions;
  }

  /**
   * Fetch patterns with filters
   */
  async getPatterns(
    patternType?: PatternType,
    missionType?: string,
    minConfidence: number = 0.5
  ): Promise<MissionPattern[]> {
    console.log(`📊 [Pattern Engine] Fetching patterns (type: ${patternType || "all"})`);

    try {
      let query = supabase
        .from("mission_patterns")
        .select("*")
        .gte("confidence_score", minConfidence)
        .order("last_detected_at", { ascending: false });

      if (patternType) {
        query = query.eq("pattern_type", patternType);
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ [Pattern Engine] Error fetching patterns:", error);
        return [];
      }

      let patterns = (data || []) as MissionPattern[];

      // Filter by mission type if specified
      if (missionType) {
        patterns = patterns.filter((p) => p.mission_types.includes(missionType));
      }

      return patterns;
    } catch (err) {
      console.error("❌ [Pattern Engine] Exception fetching patterns:", err);
      return [];
    }
  }

  /**
   * Emit preventive alert based on pattern
   */
  async emitAlert(pattern: MissionPattern): Promise<PatternAlert> {
    const severity = this.determineSeverity(pattern);

    const alert: PatternAlert = {
      pattern_id: pattern.id,
      pattern_type: pattern.pattern_type,
      severity,
      message: this.generateAlertMessage(pattern),
      recommended_actions: pattern.preventive_actions,
      detected_at: new Date().toISOString(),
    };

    console.log(`🚨 [Pattern Engine] Alert emitted: ${severity.toUpperCase()} - ${alert.message}`);

    return alert;
  }

  /**
   * Determine alert severity
   */
  private determineSeverity(pattern: MissionPattern): "low" | "medium" | "high" | "critical" {
    if (pattern.pattern_type === "failure" && pattern.confidence_score > 0.8) {
      return "critical";
    }
    if (pattern.pattern_type === "failure") {
      return "high";
    }
    if (pattern.pattern_type === "anomaly") {
      return "medium";
    }
    return "low";
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(pattern: MissionPattern): string {
    const type = pattern.pattern_type.toUpperCase();
    const description = pattern.pattern_data.description;
    const confidence = (pattern.confidence_score * 100).toFixed(0);

    return `${type} PATTERN DETECTED: ${description} (Confidence: ${confidence}%)`;
  }

  /**
   * Update pattern occurrence
   */
  async incrementPatternOccurrence(patternId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc("increment_pattern_occurrence", {
        pattern_id: patternId,
      });

      // If RPC doesn't exist, do it manually
      if (error) {
        const { data: pattern } = await supabase
          .from("mission_patterns")
          .select("occurrences")
          .eq("id", patternId)
          .single();

        if (pattern) {
          await supabase
            .from("mission_patterns")
            .update({
              occurrences: pattern.occurrences + 1,
              last_detected_at: new Date().toISOString(),
            })
            .eq("id", patternId);
        }
      }

      console.log(`✅ [Pattern Engine] Pattern occurrence updated`);
    } catch (err) {
      console.error("❌ [Pattern Engine] Error updating pattern:", err);
    }
  }
}

// Singleton instance
export const patternEngine = new PatternRecognitionEngine();

// Demo/Example usage
export async function demonstratePatternEngine() {
  console.log("🚀 [Demo] Starting Pattern Engine demonstration...");

  const missionId = `mission-pattern-${Date.now()}`;

  // Initialize mission intelligence
  await intelligenceCore.initializeMission(missionId);

  // Add some decisions
  await intelligenceCore.addDecision(missionId, "Deploy team", "success", 0.9);
  await intelligenceCore.addDecision(missionId, "Activate systems", "success", 0.85);
  await intelligenceCore.addDecision(missionId, "Emergency response", "success", 0.88);

  // Collect some signals
  await signalCollector.collectSignal(missionId, {
    type: "voice",
    data: { transcript: "All clear", volume: 80, clarity: 0.9 },
  });

  await signalCollector.collectSignal(missionId, {
    type: "climate",
    data: { temperature: 22, humidity: 60 },
  });

  // Analyze and detect patterns
  const patterns = await patternEngine.analyzeAndDetectPatterns(missionId);
  console.log(`🔍 Detected ${patterns.length} patterns:`, patterns);

  // Fetch patterns
  const allPatterns = await patternEngine.getPatterns();
  console.log(`📊 Total patterns in database: ${allPatterns.length}`);

  // Emit alerts for critical patterns
  for (const pattern of patterns) {
    if (pattern.confidence_score > 0.7) {
      const alert = await patternEngine.emitAlert(pattern);
      console.log(`🚨 Alert:`, alert);
    }
  }

  console.log("✅ [Demo] Pattern Engine demonstration complete!");
}
