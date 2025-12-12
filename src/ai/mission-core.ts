
/**
 * PATCH 200.0 - Mission AI Core (IA Autônoma de Missão)
 * 
 * Mission-critical AI core to support decisions in offline or high-risk scenarios.
 * Implements context-based decision trees with offline storage for emergency protocols.
 */

import { logger } from "@/lib/logger";
import { learningCore } from "./learning-core";

export interface EmergencyProtocol {
  id: string;
  name: string;
  scenario: string;
  priority: "low" | "medium" | "high" | "critical";
  steps: ProtocolStep[];
  conditions: Record<string, any>;
  requires_human_override: boolean;
}

export interface ProtocolStep {
  order: number;
  action: string;
  description: string;
  automated: boolean;
  risk_level: "low" | "medium" | "high";
}

export interface IncidentHistory {
  id: string;
  incident_type: string;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  resolution: string;
  outcome: "resolved" | "escalated" | "pending";
  lessons_learned: string[];
  metadata: Record<string, any>;
}

export interface WeatherPattern {
  id: string;
  location: string;
  timestamp: string;
  conditions: {
    temperature: number;
    wind_speed: number;
    visibility: number;
    sea_state?: string;
  };
  risk_assessment: "safe" | "caution" | "warning" | "danger";
}

export interface SystemState {
  modules_status: Record<string, "online" | "offline" | "degraded">;
  connectivity: "online" | "offline" | "limited";
  location?: {
    latitude: number;
    longitude: number;
  };
  weather?: WeatherPattern;
  crew_status?: "normal" | "alert" | "emergency";
  resources: {
    battery?: number;
    fuel?: number;
    supplies?: string[];
  };
}

export interface DecisionContext {
  current_state: SystemState;
  incident_type?: string;
  severity: "low" | "medium" | "high" | "critical";
  available_protocols: string[];
  historical_data: IncidentHistory[];
}

export interface DecisionResult {
  action: "suggest" | "act" | "escalate";
  protocol?: EmergencyProtocol;
  reasoning: string;
  confidence: number;
  risk_score: number;
  requires_human_override: boolean;
  automated_steps: string[];
  manual_steps: string[];
}

class MissionAICore {
  private protocols: Map<string, EmergencyProtocol> = new Map();
  private incidentHistory: IncidentHistory[] = [];
  private weatherPatterns: WeatherPattern[] = [];
  private isOfflineMode = false;
  private riskThreshold = 7; // 0-10 scale, 7+ requires human override

  constructor() {
    this.initializeEmergencyProtocols();
    this.loadOfflineData();
    this.setupOfflineDetection();
  }

  /**
   * Initialize emergency protocols
   */
  private initializeEmergencyProtocols() {
    // Protocol: System Failure
    this.protocols.set("system-failure", {
      id: "system-failure",
      name: "System Failure Response",
      scenario: "Critical system component failure",
      priority: "critical",
      requires_human_override: true,
      conditions: {
        module_status: "offline",
        impact: "high",
      },
      steps: [
        {
          order: 1,
          action: "isolate_failed_component",
          description: "Isolate failed component to prevent cascade",
          automated: true,
          risk_level: "low",
        },
        {
          order: 2,
          action: "activate_backup_system",
          description: "Switch to backup system if available",
          automated: true,
          risk_level: "medium",
        },
        {
          order: 3,
          action: "notify_crew",
          description: "Alert crew of system status",
          automated: true,
          risk_level: "low",
        },
        {
          order: 4,
          action: "initiate_diagnostic",
          description: "Run diagnostics on failed component",
          automated: false,
          risk_level: "low",
        },
      ],
    });

    // Protocol: Weather Emergency
    this.protocols.set("weather-emergency", {
      id: "weather-emergency",
      name: "Severe Weather Response",
      scenario: "Severe weather conditions detected",
      priority: "high",
      requires_human_override: true,
      conditions: {
        weather_risk: "danger",
        visibility: "<1km",
      },
      steps: [
        {
          order: 1,
          action: "secure_operations",
          description: "Secure all deck operations",
          automated: false,
          risk_level: "high",
        },
        {
          order: 2,
          action: "update_route",
          description: "Calculate safe route alternatives",
          automated: true,
          risk_level: "medium",
        },
        {
          order: 3,
          action: "alert_authorities",
          description: "Notify maritime authorities",
          automated: true,
          risk_level: "low",
        },
      ],
    });

    // Protocol: Communication Loss
    this.protocols.set("comm-loss", {
      id: "comm-loss",
      name: "Communication Loss Protocol",
      scenario: "Loss of external communications",
      priority: "medium",
      requires_human_override: false,
      conditions: {
        connectivity: "offline",
        duration: ">30min",
      },
      steps: [
        {
          order: 1,
          action: "switch_to_offline_mode",
          description: "Activate offline operation mode",
          automated: true,
          risk_level: "low",
        },
        {
          order: 2,
          action: "cache_critical_data",
          description: "Cache all critical operational data",
          automated: true,
          risk_level: "low",
        },
        {
          order: 3,
          action: "attempt_reconnection",
          description: "Periodically attempt to restore connection",
          automated: true,
          risk_level: "low",
        },
      ],
    });

    // Protocol: Medical Emergency
    this.protocols.set("medical-emergency", {
      id: "medical-emergency",
      name: "Medical Emergency Response",
      scenario: "Crew medical emergency",
      priority: "critical",
      requires_human_override: true,
      conditions: {
        crew_status: "emergency",
        medical_support: "needed",
      },
      steps: [
        {
          order: 1,
          action: "alert_medical_team",
          description: "Alert onboard medical personnel",
          automated: true,
          risk_level: "low",
        },
        {
          order: 2,
          action: "contact_shore_medical",
          description: "Establish contact with shore medical support",
          automated: true,
          risk_level: "low",
        },
        {
          order: 3,
          action: "prepare_evacuation",
          description: "Prepare for potential medical evacuation",
          automated: false,
          risk_level: "high",
        },
        {
          order: 4,
          action: "divert_to_port",
          description: "Calculate route to nearest medical facility",
          automated: true,
          risk_level: "medium",
        },
      ],
    });

    logger.info("[MissionCore] Emergency protocols initialized", {
      count: this.protocols.size,
    });
  }

  /**
   * Load offline data from storage
   */
  private loadOfflineData() {
    try {
      // Load incident history
      const storedIncidents = localStorage.getItem("incident_history");
      if (storedIncidents) {
        this.incidentHistory = JSON.parse(storedIncidents);
      }

      // Load weather patterns
      const storedWeather = localStorage.getItem("weather_patterns");
      if (storedWeather) {
        this.weatherPatterns = JSON.parse(storedWeather);
      }

      logger.info("[MissionCore] Offline data loaded", {
        incidents: this.incidentHistory.length,
        weather_patterns: this.weatherPatterns.length,
      });
    } catch (error) {
      logger.error("[MissionCore] Failed to load offline data", { error });
    }
  }

  /**
   * Setup offline detection
   */
  private setupOfflineDetection() {
    window.addEventListener("online", () => {
      this.isOfflineMode = false;
      logger.info("[MissionCore] Online mode activated");
    });

    window.addEventListener("offline", () => {
      this.isOfflineMode = true;
      logger.warn("[MissionCore] Offline mode activated");
      this.handleOfflineTransition();
    });

    // Initial state
    this.isOfflineMode = !navigator.onLine;
  }

  /**
   * Handle transition to offline mode
   */
  private async handleOfflineTransition() {
    logger.info("[MissionCore] Handling offline transition");

    // Cache critical data
    await this.cacheEmergencyData();

    // Notify system
    window.dispatchEvent(
      new CustomEvent("mission-offline-mode", {
        detail: { timestamp: new Date().toISOString() },
      })
    );
  }

  /**
   * Cache emergency data for offline access
   */
  private async cacheEmergencyData() {
    try {
      // Cache protocols
      const protocolsData = Array.from(this.protocols.values());
      localStorage.setItem("emergency_protocols", JSON.stringify(protocolsData));

      // Cache incident history
      localStorage.setItem("incident_history", JSON.stringify(this.incidentHistory));

      // Cache weather patterns
      localStorage.setItem("weather_patterns", JSON.stringify(this.weatherPatterns));

      logger.info("[MissionCore] Emergency data cached for offline access");
    } catch (error) {
      logger.error("[MissionCore] Failed to cache emergency data", { error });
    }
  }

  /**
   * Make decision based on context
   */
  async makeDecision(context: DecisionContext): Promise<DecisionResult> {
    logger.info("[MissionCore] Making decision", {
      incident: context.incident_type,
      severity: context.severity,
      offline: this.isOfflineMode,
    });

    try {
      // Find matching protocol
      const protocol = this.findMatchingProtocol(context);

      if (!protocol) {
        return this.escalateToHuman(context, "No matching protocol found");
      }

      // Calculate risk score
      const riskScore = this.calculateRiskScore(context, protocol);

      // Determine if human override is required
      const requiresOverride = 
        protocol.requires_human_override || 
        riskScore >= this.riskThreshold ||
        context.severity === "critical";

      // Separate automated and manual steps
      const automatedSteps = protocol.steps
        .filter(s => s.automated && s.risk_level !== "high")
        .map(s => s.action);

      const manualSteps = protocol.steps
        .filter(s => !s.automated || s.risk_level === "high")
        .map(s => s.action);

      // Build reasoning
      const reasoning = this.buildReasoning(context, protocol, riskScore);

      // Calculate confidence based on historical data
      const confidence = this.calculateConfidence(context, protocol);

      const result: DecisionResult = {
        action: requiresOverride ? "suggest" : "act",
        protocol,
        reasoning,
        confidence,
        risk_score: riskScore,
        requires_human_override: requiresOverride,
        automated_steps: automatedSteps,
        manual_steps: manualSteps,
      };

      // Track decision
      await learningCore.trackDecision(
        "mission-core",
        "emergency_response",
        {
          context: {
            incident: context.incident_type,
            severity: context.severity,
          },
          protocol_id: protocol.id,
        },
        {
          action: result.action,
          risk_score: riskScore,
          confidence,
        },
        confidence
      );

      logger.info("[MissionCore] Decision made", {
        action: result.action,
        protocol: protocol.name,
        risk_score: riskScore,
      });

      return result;
    } catch (error) {
      logger.error("[MissionCore] Decision making failed", { error });
      return this.escalateToHuman(context, `Error: ${String(error)}`);
    }
  }

  /**
   * Find matching protocol for context
   */
  private findMatchingProtocol(context: DecisionContext): EmergencyProtocol | null {
    // Check for exact incident type match
    if (context.incident_type) {
      const protocol = this.protocols.get(context.incident_type);
      if (protocol) return protocol;
    }

    // Check system state conditions
    for (const protocol of this.protocols.values()) {
      if (this.matchesConditions(context, protocol)) {
        return protocol;
      }
    }

    return null;
  }

  /**
   * Check if context matches protocol conditions
   */
  private matchesConditions(
    context: DecisionContext,
    protocol: EmergencyProtocol
  ): boolean {
    const conditions = protocol.conditions;
    const state = context.current_state;

    for (const [key, value] of Object.entries(conditions)) {
      if (key === "connectivity" && state.connectivity !== value) return false;
      if (key === "weather_risk" && state.weather?.risk_assessment !== value) return false;
      if (key === "crew_status" && state.crew_status !== value) return false;
    }

    return true;
  }

  /**
   * Calculate risk score (0-10)
   */
  private calculateRiskScore(
    context: DecisionContext,
    protocol: EmergencyProtocol
  ): number {
    let score = 0;

    // Base score from severity
    const severityScores = { low: 2, medium: 4, high: 6, critical: 8 };
    score += severityScores[context.severity];

    // Add for offline mode
    if (this.isOfflineMode) score += 1;

    // Add based on protocol risk
    const protocolRisk = protocol.steps.reduce((max, step) => {
      const stepScores = { low: 0, medium: 1, high: 2 };
      return Math.max(max, stepScores[step.risk_level]);
    }, 0);
    score += protocolRisk;

    // Reduce based on historical success
    const similarIncidents = this.incidentHistory.filter(
      i => i.incident_type === context.incident_type && i.outcome === "resolved"
    );
    if (similarIncidents.length > 3) score -= 1;

    return Math.min(Math.max(score, 0), 10);
  }

  /**
   * Build reasoning for decision
   */
  private buildReasoning(
    context: DecisionContext,
    protocol: EmergencyProtocol,
    riskScore: number
  ): string {
    const reasons: string[] = [];

    reasons.push(`Selected protocol: ${protocol.name}`);
    reasons.push(`Severity level: ${context.severity}`);
    reasons.push(`Risk score: ${riskScore}/10`);

    if (this.isOfflineMode) {
      reasons.push("System is in offline mode");
    }

    const similarIncidents = this.incidentHistory.filter(
      i => i.incident_type === context.incident_type
    );

    if (similarIncidents.length > 0) {
      reasons.push(`Based on ${similarIncidents.length} similar past incidents`);
    }

    if (riskScore >= this.riskThreshold) {
      reasons.push("High risk - human override required");
    }

    return reasons.join(". ");
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    context: DecisionContext,
    protocol: EmergencyProtocol
  ): number {
    let confidence = 0.5;

    // Increase confidence based on historical success
    const similarIncidents = this.incidentHistory.filter(
      i => i.incident_type === context.incident_type
    );
    
    const resolvedIncidents = similarIncidents.filter(
      i => i.outcome === "resolved"
    );

    if (similarIncidents.length > 0) {
      const successRate = resolvedIncidents.length / similarIncidents.length;
      confidence += successRate * 0.3;
    }

    // Increase confidence for well-tested protocols
    if (similarIncidents.length > 5) {
      confidence += 0.1;
    }

    // Reduce confidence in offline mode
    if (this.isOfflineMode) {
      confidence -= 0.1;
    }

    return Math.min(Math.max(confidence, 0), 0.95);
  }

  /**
   * Escalate to human
   */
  private escalateToHuman(context: DecisionContext, reason: string): DecisionResult {
    logger.warn("[MissionCore] Escalating to human", { reason });

    return {
      action: "escalate",
      reasoning: `Escalating to human: ${reason}`,
      confidence: 0,
      risk_score: 10,
      requires_human_override: true,
      automated_steps: [],
      manual_steps: ["Review situation and make manual decision"],
    };
  }

  /**
   * Record incident
   */
  async recordIncident(incident: IncidentHistory): Promise<void> {
    this.incidentHistory.push(incident);

    // Keep only last 100 incidents
    if (this.incidentHistory.length > 100) {
      this.incidentHistory = this.incidentHistory.slice(-100);
    }

    // Save to storage
    localStorage.setItem("incident_history", JSON.stringify(this.incidentHistory));

    logger.info("[MissionCore] Incident recorded", {
      type: incident.incident_type,
      outcome: incident.outcome,
    });

    // Track in learning core
    await learningCore.trackSystemEvent(
      "incident_recorded",
      "mission-core",
      {
        incident_type: incident.incident_type,
        severity: incident.severity,
        outcome: incident.outcome,
      },
      incident.outcome === "resolved" ? "success" : "failure"
    );
  }

  /**
   * Record weather pattern
   */
  recordWeatherPattern(pattern: WeatherPattern): void {
    this.weatherPatterns.push(pattern);

    // Keep only last 50 patterns
    if (this.weatherPatterns.length > 50) {
      this.weatherPatterns = this.weatherPatterns.slice(-50);
    }

    // Save to storage
    localStorage.setItem("weather_patterns", JSON.stringify(this.weatherPatterns));

    logger.info("[MissionCore] Weather pattern recorded", {
      location: pattern.location,
      risk: pattern.risk_assessment,
    });
  }

  /**
   * Get protocol by ID
   */
  getProtocol(protocolId: string): EmergencyProtocol | undefined {
    return this.protocols.get(protocolId);
  }

  /**
   * Get all protocols
   */
  getAllProtocols(): EmergencyProtocol[] {
    return Array.from(this.protocols.values());
  }

  /**
   * Get incident history
   */
  getIncidentHistory(): IncidentHistory[] {
    return [...this.incidentHistory];
  }

  /**
   * Get weather patterns
   */
  getWeatherPatterns(): WeatherPattern[] {
    return [...this.weatherPatterns];
  }

  /**
   * Check if in offline mode
   */
  isOffline(): boolean {
    return this.isOfflineMode;
  }

  /**
   * Set risk threshold
   */
  setRiskThreshold(threshold: number): void {
    if (threshold >= 0 && threshold <= 10) {
      this.riskThreshold = threshold;
      logger.info("[MissionCore] Risk threshold updated", { threshold });
    }
  }
}

// Singleton instance
export const missionCore = new MissionAICore();

export default missionCore;
