/**
 * Deep Risk AI Service - PATCH 433
 * DEBT-FIX: Removed (supabase as any) - mapped risk_events → system_observations, weather_forecasts → graceful fallback
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface RiskFactors {
  depth: number;
  pressure: number;
  temperature: number;
  current: number;
  visibility: number;
  sonarQuality: number;
  weatherConditions?: string;
  waveHeight?: number;
  windSpeed?: number;
}

export interface RiskScore {
  overall: number;
  categories: {
    environmental: number;
    mechanical: number;
    operational: number;
    communication: number;
  };
  level: "minimal" | "low" | "moderate" | "high" | "severe" | "critical";
  timestamp: string;
}

export interface RiskRecommendation {
  id: string;
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  recommendation: string;
  reasoning: string;
  timestamp: string;
}

export interface RiskEvent {
  id?: string;
  timestamp: string;
  eventType: "risk_assessment" | "incident" | "alert" | "prediction";
  riskScore: number;
  riskLevel: string;
  factors: RiskFactors;
  recommendations: RiskRecommendation[];
  resolved?: boolean;
  notes?: string;
}

export interface IncidentData {
  id: string;
  type: string;
  severity: string;
  timestamp: string;
  description: string;
  location?: string;
  resolved: boolean;
}

class DeepRiskAIService {
  async calculateRiskScore(factors: RiskFactors): Promise<RiskScore> {
    try {
      logger.info("Calculating deep risk assessment", { factors });

      const incidents = await this.getRecentIncidents();
      const forecastData = await this.getForecastData();

      let envRisk = this.calculateEnvironmentalRisk(factors, forecastData);
      let mechRisk = this.calculateMechanicalRisk(factors);
      let opRisk = this.calculateOperationalRisk(factors, incidents);
      let commRisk = this.calculateCommunicationRisk(factors);

      const historicalWeights = this.calculateHistoricalWeights(incidents);
      envRisk *= historicalWeights.environmental;
      mechRisk *= historicalWeights.mechanical;
      opRisk *= historicalWeights.operational;
      commRisk *= historicalWeights.communication;

      const RISK_NORMALIZATION_FACTOR = 1.4;
      const overall = Math.min(100, (envRisk + mechRisk + opRisk + commRisk) / RISK_NORMALIZATION_FACTOR);

      let level: RiskScore["level"];
      if (overall < 15) level = "minimal";
      else if (overall < 30) level = "low";
      else if (overall < 50) level = "moderate";
      else if (overall < 70) level = "high";
      else if (overall < 85) level = "severe";
      else level = "critical";

      return {
        overall,
        categories: {
          environmental: Math.min(100, envRisk),
          mechanical: Math.min(100, mechRisk),
          operational: Math.min(100, opRisk),
          communication: Math.min(100, commRisk),
        },
        level,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Failed to calculate risk score", error);
      throw error;
    }
  }

  async generateRecommendations(factors: RiskFactors, score: RiskScore): Promise<RiskRecommendation[]> {
    const recs: RiskRecommendation[] = [];

    if (factors.depth > 200) {
      recs.push({ id: `rec-depth-${Date.now()}`, priority: "critical", category: "Depth Management", recommendation: "Reduce operational depth or enhance pressure ratings immediately", reasoning: `Current depth (${factors.depth}m) exceeds safe operational limits.`, timestamp: new Date().toISOString() });
    } else if (factors.depth > 150) {
      recs.push({ id: `rec-depth-${Date.now()}`, priority: "high", category: "Depth Management", recommendation: "Monitor depth closely and prepare for ascent if conditions worsen", reasoning: `Approaching critical depth threshold (${factors.depth}m).`, timestamp: new Date().toISOString() });
    }

    if (factors.current > 2.5) {
      recs.push({ id: `rec-current-${Date.now()}`, priority: "high", category: "Current Mitigation", recommendation: "Increase thruster power allocation and implement dynamic positioning", reasoning: `Strong currents (${factors.current} knots) detected.`, timestamp: new Date().toISOString() });
    }

    if (factors.visibility < 10) {
      recs.push({ id: `rec-visibility-${Date.now()}`, priority: factors.visibility < 5 ? "high" : "medium", category: "Visibility Enhancement", recommendation: "Deploy additional lighting and rely more on sonar navigation", reasoning: `Limited visibility (${factors.visibility}m).`, timestamp: new Date().toISOString() });
    }

    if (factors.sonarQuality < 70) {
      recs.push({ id: `rec-sonar-${Date.now()}`, priority: factors.sonarQuality < 50 ? "critical" : "high", category: "Communication", recommendation: "Check sonar transducers and consider acoustic modem backup", reasoning: `Poor sonar quality (${factors.sonarQuality}%).`, timestamp: new Date().toISOString() });
    }

    if (score.overall > 70) {
      recs.push({ id: `rec-overall-${Date.now()}`, priority: "critical", category: "Mission Planning", recommendation: "Consider postponing mission or implementing additional safety protocols", reasoning: `Overall risk score (${score.overall.toFixed(0)}) indicates hazardous conditions.`, timestamp: new Date().toISOString() });
    } else if (score.overall > 50) {
      recs.push({ id: `rec-overall-${Date.now()}`, priority: "high", category: "Safety Protocols", recommendation: "Enhanced monitoring and ready contingency plans", reasoning: `Moderate-to-high risk conditions detected (${score.overall.toFixed(0)}).`, timestamp: new Date().toISOString() });
    }

    if (factors.windSpeed && factors.windSpeed > 30) {
      recs.push({ id: `rec-weather-${Date.now()}`, priority: "high", category: "Weather Conditions", recommendation: "Consider delaying surface operations until wind subsides", reasoning: `High wind speeds (${factors.windSpeed} kts) detected.`, timestamp: new Date().toISOString() });
    }

    return recs;
  }

  async logRiskEvent(event: RiskEvent): Promise<void> {
    try {
      const insertData = {
        observation_type: "risk_event",
        module_name: "deep_risk_ai",
        message: `Risk ${event.eventType}: score ${event.riskScore}, level ${event.riskLevel}`,
        severity: event.riskLevel === "critical" || event.riskLevel === "severe" ? "critical" : event.riskLevel === "high" ? "high" : "info",
        metadata: {
          event_type: event.eventType,
          risk_score: event.riskScore,
          risk_level: event.riskLevel,
          factors: event.factors,
          recommendations: event.recommendations,
          resolved: event.resolved || false,
          notes: event.notes,
        },
      };
      const { error } = await supabase.from("system_observations").insert(insertData as never);

      if (error) throw error;
      logger.info("Risk event logged", { eventType: event.eventType, riskScore: event.riskScore });
    } catch (error) {
      logger.error("Failed to log risk event", error);
      throw error;
    }
  }

  async getRiskEventHistory(limit = 50): Promise<RiskEvent[]> {
    try {
      const { data, error } = await supabase
        .from("system_observations")
        .select("*")
        .eq("observation_type", "risk_event")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- system_observations dynamic JSON
      return (data || []).map((d: any) => {
        const meta = d.metadata as Record<string, unknown> | null;
        return {
          id: d.id,
          timestamp: d.created_at || new Date().toISOString(),
          eventType: (meta?.event_type as RiskEvent["eventType"]) || "risk_assessment",
          riskScore: (meta?.risk_score as number) || 0,
          riskLevel: (meta?.risk_level as string) || "low",
          factors: (meta?.factors as RiskFactors) || {} as RiskFactors,
          recommendations: (meta?.recommendations as RiskRecommendation[]) || [],
          resolved: (meta?.resolved as boolean) || false,
          notes: meta?.notes as string | undefined,
        };
      });
    } catch (error) {
      logger.error("Failed to get risk history", error);
      return [];
    }
  }

  async predictRisk(factors: RiskFactors): Promise<{
    predictedScore: number;
    confidence: number;
    trendDirection: "increasing" | "stable" | "decreasing";
    recommendation: string;
  }> {
    try {
      const history = await this.getRiskEventHistory(10);

      if (history.length < 3) {
        return { predictedScore: 0, confidence: 0, trendDirection: "stable", recommendation: "Insufficient historical data for prediction" };
      }

      const recentScores = history.slice(0, 5).map((h) => h.riskScore);
      const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      const olderScores = history.slice(5, 10).map((h) => h.riskScore);
      const avgOlder = olderScores.reduce((a, b) => a + b, 0) / Math.max(olderScores.length, 1);

      const trendDirection = avgRecent > avgOlder + 5 ? "increasing" : avgRecent < avgOlder - 5 ? "decreasing" : "stable";

      const currentScore = await this.calculateRiskScore(factors);
      const trendFactor = trendDirection === "increasing" ? 1.15 : trendDirection === "decreasing" ? 0.85 : 1.0;
      const predictedScore = Math.min(100, currentScore.overall * trendFactor);
      const confidence = history.length >= 10 ? 85 : history.length * 8.5;

      let recommendation = "";
      if (trendDirection === "increasing" && predictedScore > 60) recommendation = "Urgente: Tendência de aumento no risco detectada.";
      else if (trendDirection === "increasing") recommendation = "Monitorar de perto: Risco em tendência de crescimento.";
      else if (trendDirection === "decreasing") recommendation = "Positivo: Condições melhorando.";
      else recommendation = "Estável: Condições constantes.";

      return { predictedScore, confidence, trendDirection, recommendation };
    } catch (error) {
      logger.error("Failed to predict risk", error);
      throw error;
    }
  }

  private calculateEnvironmentalRisk(factors: RiskFactors, _forecastData: Record<string, unknown>): number {
    let risk = 0;
    if (factors.depth > 200) risk += 30;
    else if (factors.depth > 100) risk += 15;
    if (factors.temperature < 4 || factors.temperature > 30) risk += 15;
    if (factors.current > 3) risk += 25;
    else if (factors.current > 2) risk += 10;
    if (factors.windSpeed) { if (factors.windSpeed > 40) risk += 20; else if (factors.windSpeed > 25) risk += 10; }
    if (factors.waveHeight) { if (factors.waveHeight > 4) risk += 15; else if (factors.waveHeight > 3) risk += 8; }
    return risk;
  }

  private calculateMechanicalRisk(factors: RiskFactors): number {
    let risk = 0;
    if (factors.pressure > 30) risk += 40;
    else if (factors.pressure > 20) risk += 25;
    else if (factors.pressure > 10) risk += 10;
    return risk;
  }

  private calculateOperationalRisk(factors: RiskFactors, incidents: IncidentData[]): number {
    let risk = 0;
    if (factors.visibility < 5) risk += 30;
    else if (factors.visibility < 10) risk += 15;
    const recentIncidents = incidents.filter((i) => Date.now() - new Date(i.timestamp).getTime() < 24 * 60 * 60 * 1000);
    risk += recentIncidents.length * 5;
    return risk;
  }

  private calculateCommunicationRisk(factors: RiskFactors): number {
    let risk = 0;
    if (factors.sonarQuality < 50) risk += 35;
    else if (factors.sonarQuality < 70) risk += 20;
    else if (factors.sonarQuality < 85) risk += 10;
    return risk;
  }

  private async getRecentIncidents(): Promise<IncidentData[]> {
    try {
      const { data } = await supabase
        .from("incidents")
        .select("*")
        .gte("timestamp", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order("timestamp", { ascending: false })
        .limit(50);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- incidents dynamic columns
      return (data || []).map((d: any) => ({
        id: d.id as string,
        type: d.type as string,
        severity: d.severity as string,
        timestamp: d.timestamp as string,
        description: d.description as string,
        location: d.location as string | undefined,
        resolved: (d.resolved as boolean) || false,
      }));
    } catch (error) {
      logger.error("Failed to fetch incidents", error);
      return [];
    }
  }

  private async getForecastData(): Promise<Record<string, unknown>> {
    // weather_forecasts table doesn't exist in schema - return empty gracefully
    logger.debug("Weather forecasts table not available, using empty forecast data");
    return {};
  }

  private calculateHistoricalWeights(incidents: IncidentData[]) {
    const weights = { environmental: 1.0, mechanical: 1.0, operational: 1.0, communication: 1.0 };
    incidents.forEach((incident) => {
      const type = incident.type?.toLowerCase() || "";
      if (type.includes("weather") || type.includes("current")) weights.environmental += 0.02;
      if (type.includes("mechanical") || type.includes("equipment")) weights.mechanical += 0.02;
      if (type.includes("operational") || type.includes("human")) weights.operational += 0.02;
      if (type.includes("communication") || type.includes("sonar")) weights.communication += 0.02;
    });
    return weights;
  }
}

export const deepRiskAIService = new DeepRiskAIService();
