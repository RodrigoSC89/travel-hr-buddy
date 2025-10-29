/**
 * PATCH 479: Enhanced Sonar AI Service with ONNX Classification
 * Provides AI-powered sonar data analysis and risk assessment
 */

import { supabase } from "@/integrations/supabase/client";

export interface SonarEvent {
  id?: string;
  vessel_id: string | null;
  event_type: "detection" | "anomaly" | "hazard" | "echo" | "noise";
  detection_type?: "object" | "vessel" | "underwater_obstacle" | "marine_life" | "debris" | "unknown";
  confidence_score: number;
  distance_meters: number;
  depth_meters: number;
  bearing_degrees: number;
  frequency_khz: number;
  amplitude_db: number;
  classification: string;
  ai_model_version: string;
  raw_data?: any;
  metadata?: any;
  detected_at?: string;
}

export interface SonarRisk {
  id?: string;
  event_id?: string;
  vessel_id: string | null;
  risk_level: "low" | "medium" | "high" | "critical";
  risk_type: "collision" | "grounding" | "obstruction" | "navigation_hazard" | "equipment_anomaly" | "environmental";
  risk_score: number;
  description: string;
  recommended_action: string;
  urgency: "low" | "medium" | "high" | "immediate";
  status?: "active" | "acknowledged" | "mitigated" | "resolved" | "false_positive";
  metadata?: any;
}

export interface SpectrogramData {
  frequencies: number[];
  timeSteps: number[];
  intensities: number[][];
}

class EnhancedSonarAIService {
  private modelVersion = "v1.0.0-onnx";

  /**
   * Simulate ONNX-based classification
   * In production, this would load and run an actual ONNX model
   */
  async classifySignal(
    frequency: number,
    amplitude: number,
    duration: number,
    spectrogramData?: SpectrogramData
  ): Promise<{
    classification: string;
    confidence: number;
    detectionType: SonarEvent["detection_type"];
  }> {
    // Simulate ONNX inference delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simple rule-based classification (simulating ONNX output)
    let classification = "unknown";
    let detectionType: SonarEvent["detection_type"] = "unknown";
    let confidence = 0;

    if (frequency < 50 && amplitude > -40) {
      classification = "large_vessel";
      detectionType = "vessel";
      confidence = 0.85 + Math.random() * 0.12;
    } else if (frequency >= 50 && frequency < 150 && amplitude > -50) {
      classification = "underwater_obstacle";
      detectionType = "underwater_obstacle";
      confidence = 0.75 + Math.random() * 0.15;
    } else if (frequency >= 150 && frequency < 300) {
      classification = "marine_life";
      detectionType = "marine_life";
      confidence = 0.70 + Math.random() * 0.20;
    } else if (amplitude < -70) {
      classification = "background_noise";
      detectionType = "unknown";
      confidence = 0.60 + Math.random() * 0.20;
    } else {
      classification = "debris";
      detectionType = "debris";
      confidence = 0.55 + Math.random() * 0.25;
    }

    return {
      classification,
      confidence: Math.min(0.99, confidence),
      detectionType,
    };
  }

  /**
   * Generate spectrogram data for visualization
   */
  generateSpectrogram(
    pingData: Array<{ frequency: number; amplitude: number }>,
    timeSteps: number = 100
  ): SpectrogramData {
    const frequencies = Array.from({ length: 50 }, (_, i) => i * 10); // 0-500 kHz
    const timeStepsArray = Array.from({ length: timeSteps }, (_, i) => i);
    
    // Generate intensity matrix
    const intensities: number[][] = [];
    for (let t = 0; t < timeSteps; t++) {
      const row: number[] = [];
      for (let f = 0; f < frequencies.length; f++) {
        // Simulate intensity based on frequency and time
        const baseIntensity = Math.random() * 50 + 20;
        const timeVariation = Math.sin(t / 10) * 10;
        const freqVariation = Math.cos(f / 5) * 10;
        row.push(baseIntensity + timeVariation + freqVariation);
      }
      intensities.push(row);
    }

    return {
      frequencies,
      timeSteps: timeStepsArray,
      intensities,
    };
  }

  /**
   * Save sonar event to database
   */
  async saveSonarEvent(event: SonarEvent): Promise<string | null> {
    const { data, error } = await supabase
      .from("sonar_events")
      .insert({
        ...event,
        ai_model_version: this.modelVersion,
        detected_at: event.detected_at || new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error saving sonar event:", error);
      return null;
    }

    return data?.id || null;
  }

  /**
   * Assess risk from sonar event
   */
  assessRisk(event: SonarEvent): SonarRisk {
    let riskLevel: SonarRisk["risk_level"] = "low";
    let riskType: SonarRisk["risk_type"] = "navigation_hazard";
    let urgency: SonarRisk["urgency"] = "low";
    let riskScore = 0;

    // Distance-based risk
    const distanceKm = event.distance_meters / 1000;
    if (distanceKm < 0.5) {
      riskScore += 40;
      urgency = "immediate";
    } else if (distanceKm < 1) {
      riskScore += 30;
      urgency = "high";
    } else if (distanceKm < 5) {
      riskScore += 20;
      urgency = "medium";
    } else {
      riskScore += 10;
    }

    // Detection type-based risk
    if (event.detection_type === "vessel") {
      riskScore += 30;
      riskType = "collision";
    } else if (event.detection_type === "underwater_obstacle") {
      riskScore += 35;
      riskType = "grounding";
    } else if (event.detection_type === "debris") {
      riskScore += 20;
      riskType = "obstruction";
    }

    // Confidence-based adjustment
    riskScore = riskScore * (event.confidence_score / 100);

    // Determine risk level
    if (riskScore >= 70) {
      riskLevel = "critical";
    } else if (riskScore >= 50) {
      riskLevel = "high";
    } else if (riskScore >= 30) {
      riskLevel = "medium";
    } else {
      riskLevel = "low";
    }

    return {
      vessel_id: event.vessel_id,
      risk_level: riskLevel,
      risk_type: riskType,
      risk_score: Math.round(riskScore),
      description: this.generateRiskDescription(event, riskLevel, riskType),
      recommended_action: this.generateRecommendedAction(riskLevel, riskType, distanceKm),
      urgency,
      status: "active",
    };
  }

  /**
   * Save sonar risk to database
   */
  async saveSonarRisk(risk: SonarRisk): Promise<string | null> {
    const { data, error } = await supabase
      .from("sonar_risks")
      .insert(risk)
      .select("id")
      .single();

    if (error) {
      console.error("Error saving sonar risk:", error);
      return null;
    }

    return data?.id || null;
  }

  /**
   * Get recent sonar events
   */
  async getRecentEvents(limit: number = 50): Promise<SonarEvent[]> {
    const { data, error } = await supabase
      .from("sonar_events")
      .select("*")
      .order("detected_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching sonar events:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Get active risks
   */
  async getActiveRisks(vesselId?: string): Promise<SonarRisk[]> {
    let query = supabase
      .from("sonar_risks")
      .select("*")
      .eq("status", "active")
      .order("risk_score", { ascending: false });

    if (vesselId) {
      query = query.eq("vessel_id", vesselId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching sonar risks:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Update risk status
   */
  async updateRiskStatus(
    riskId: string,
    status: SonarRisk["status"],
    resolutionNotes?: string
  ): Promise<boolean> {
    const update: any = { status };
    
    if (status === "acknowledged") {
      update.acknowledged_at = new Date().toISOString();
    } else if (status === "resolved" || status === "mitigated" || status === "false_positive") {
      update.resolved_at = new Date().toISOString();
      if (resolutionNotes) {
        update.resolution_notes = resolutionNotes;
      }
    }

    const { error } = await supabase
      .from("sonar_risks")
      .update(update)
      .eq("id", riskId);

    if (error) {
      console.error("Error updating risk status:", error);
      return false;
    }

    return true;
  }

  /**
   * Get risk statistics
   */
  async getRiskStatistics(vesselId?: string): Promise<{
    total: number;
    byLevel: Record<string, number>;
    byType: Record<string, number>;
  }> {
    let query = supabase
      .from("sonar_risks")
      .select("risk_level, risk_type")
      .eq("status", "active");

    if (vesselId) {
      query = query.eq("vessel_id", vesselId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching risk statistics:", error);
      return { total: 0, byLevel: {}, byType: {} };
    }

    const byLevel: Record<string, number> = {};
    const byType: Record<string, number> = {};

    data?.forEach(risk => {
      byLevel[risk.risk_level] = (byLevel[risk.risk_level] || 0) + 1;
      byType[risk.risk_type] = (byType[risk.risk_type] || 0) + 1;
    });

    return {
      total: data?.length || 0,
      byLevel,
      byType,
    };
  }

  private generateRiskDescription(
    event: SonarEvent,
    riskLevel: string,
    riskType: string
  ): string {
    const distanceKm = (event.distance_meters / 1000).toFixed(2);
    const bearing = event.bearing_degrees.toFixed(0);
    
    return `${event.classification} detectado a ${distanceKm} km, azimute ${bearing}°. ` +
      `Nível de confiança: ${event.confidence_score.toFixed(0)}%. ` +
      `Risco de ${riskType} classificado como ${riskLevel}.`;
  }

  private generateRecommendedAction(
    riskLevel: string,
    riskType: string,
    distanceKm: number
  ): string {
    if (riskLevel === "critical") {
      return "AÇÃO IMEDIATA: Alterar curso imediatamente e reduzir velocidade. Notificar tripulação.";
    } else if (riskLevel === "high") {
      return "Monitorar de perto e preparar manobra evasiva. Manter velocidade reduzida.";
    } else if (riskLevel === "medium") {
      return "Continuar monitoramento. Preparar plano de ação contingencial.";
    } else {
      return "Monitoramento rotineiro. Nenhuma ação específica necessária no momento.";
    }
  }
}

export const enhancedSonarAIService = new EnhancedSonarAIService();
