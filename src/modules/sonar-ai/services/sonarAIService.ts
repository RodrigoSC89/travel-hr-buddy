/**
 * Sonar AI Service - PATCH 435
 * Enhanced sonar data processing with logging and visualization
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { SonarAnalysis, SonarReturn, SonarPattern } from "../dataAnalyzer";

export interface SonarDetection {
  id?: string;
  timestamp: string;
  detectionType: "object" | "hazard" | "terrain" | "anomaly";
  location: {
    angle: number;
    distance: number;
    depth: number;
  };
  description: string;
  confidence: number;
  severity: "low" | "medium" | "high" | "critical";
  resolved?: boolean;
  userId?: string;
}

export interface SonarScanLog {
  id?: string;
  timestamp: string;
  scanDepth: number;
  scanRadius: number;
  numPings: number;
  qualityScore: number;
  coverage: number;
  detectionsCount: number;
  analysis: SonarAnalysis;
  userId?: string;
}

export interface VisualizationData {
  timestamp: string;
  waveform: number[]; // Signal intensity over time
  frequencySpectrum: { frequency: number; amplitude: number }[];
  polarPlot: { angle: number; distance: number; intensity: number }[];
}

class SonarAIService {
  /**
   * Log a sonar detection
   */
  async logDetection(detection: SonarDetection): Promise<void> {
    try {
      logger.info("Logging sonar detection", { type: detection.detectionType });

      const { error } = await (supabase as any).from("sonar_detections").insert({
        timestamp: detection.timestamp,
        detection_type: detection.detectionType,
        location: detection.location,
        description: detection.description,
        confidence: detection.confidence,
        severity: detection.severity,
        resolved: detection.resolved || false,
        user_id: detection.userId,
      });

      if (error) throw error;
    } catch (error) {
      logger.error("Failed to log detection", error);
      throw error;
    }
  }

  /**
   * Log a sonar scan
   */
  async logScan(scanLog: SonarScanLog): Promise<void> {
    try {
      logger.info("Logging sonar scan", { depth: scanLog.scanDepth });

      const { error } = await (supabase as any).from("sonar_scans").insert({
        timestamp: scanLog.timestamp,
        scan_depth: scanLog.scanDepth,
        scan_radius: scanLog.scanRadius,
        num_pings: scanLog.numPings,
        quality_score: scanLog.qualityScore,
        coverage: scanLog.coverage,
        detections_count: scanLog.detectionsCount,
        analysis: scanLog.analysis,
        user_id: scanLog.userId,
      });

      if (error) throw error;
    } catch (error) {
      logger.error("Failed to log scan", error);
      throw error;
    }
  }

  /**
   * Get recent detections
   */
  async getRecentDetections(limit = 50): Promise<SonarDetection[]> {
    try {
      const { data, error } = await (supabase as any)
        .from("sonar_detections")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (
        data?.map((d: any) => ({
          id: d.id,
          timestamp: d.timestamp,
          detectionType: d.detection_type,
          location: d.location,
          description: d.description,
          confidence: d.confidence,
          severity: d.severity,
          resolved: d.resolved,
          userId: d.user_id,
        })) || []
      );
    } catch (error) {
      logger.error("Failed to get detections", error);
      return [];
    }
  }

  /**
   * Get scan history
   */
  async getScanHistory(limit = 20): Promise<SonarScanLog[]> {
    try {
      const { data, error } = await (supabase as any)
        .from("sonar_scans")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (
        data?.map((d: any) => ({
          id: d.id,
          timestamp: d.timestamp,
          scanDepth: d.scan_depth,
          scanRadius: d.scan_radius,
          numPings: d.num_pings,
          qualityScore: d.quality_score,
          coverage: d.coverage,
          detectionsCount: d.detections_count,
          analysis: d.analysis,
          userId: d.user_id,
        })) || []
      );
    } catch (error) {
      logger.error("Failed to get scan history", error);
      return [];
    }
  }

  /**
   * Generate visualization data from sonar analysis
   */
  generateVisualizationData(analysis: SonarAnalysis): VisualizationData {
    // Generate waveform data (signal intensity over time)
    const waveform: number[] = [];
    const numSamples = 100;
    
    analysis.returns.forEach((ret, index) => {
      const sample = (ret.ping.intensity * (1 - ret.noise / 100)) || 0;
      if (index < numSamples) {
        waveform.push(sample);
      }
    });

    // Fill remaining samples with noise
    while (waveform.length < numSamples) {
      waveform.push(Math.random() * 20);
    }

    // Generate frequency spectrum (simplified FFT simulation)
    const frequencySpectrum: { frequency: number; amplitude: number }[] = [];
    for (let i = 0; i < 50; i++) {
      const frequency = i * 100; // Hz
      // Simulate amplitude based on returns
      const baseAmplitude = Math.random() * 30;
      const signalBoost = analysis.returns.some(
        (r) => r.ping.intensity > 50 && Math.abs(r.ping.angle - i * 7.2) < 10
      )
        ? 20
        : 0;
      frequencySpectrum.push({
        frequency,
        amplitude: baseAmplitude + signalBoost,
      });
    }

    // Generate polar plot data
    const polarPlot: { angle: number; distance: number; intensity: number }[] = [];
    analysis.returns.forEach((ret) => {
      polarPlot.push({
        angle: ret.ping.angle,
        distance: ret.ping.distance,
        intensity: ret.ping.intensity,
      });
    });

    return {
      timestamp: analysis.timestamp,
      waveform,
      frequencySpectrum,
      polarPlot,
    };
  }

  /**
   * Process detections from analysis
   */
  async processDetections(analysis: SonarAnalysis, userId?: string): Promise<SonarDetection[]> {
    const detections: SonarDetection[] = [];

    // Process patterns as detections
    analysis.patterns.forEach((pattern) => {
      let severity: SonarDetection["severity"] = "low";
      let detectionType: SonarDetection["detectionType"] = "anomaly";

      // Determine severity and type based on pattern
      if (pattern.type === "object") {
        detectionType = "object";
        if (pattern.confidence > 80) severity = "high";
        else if (pattern.confidence > 60) severity = "medium";
      } else if (pattern.type === "anomaly") {
        detectionType = "anomaly";
        if (pattern.confidence > 70) severity = "high";
        else severity = "medium";
      } else if (pattern.type === "structure") {
        detectionType = "hazard";
        severity = "medium";
      } else {
        detectionType = "terrain";
        severity = "low";
      }

      const detection: SonarDetection = {
        timestamp: analysis.timestamp,
        detectionType,
        location: pattern.location,
        description: pattern.description,
        confidence: pattern.confidence,
        severity,
        resolved: false,
        userId,
      };

      detections.push(detection);
    });

    // Log high-severity detections
    for (const detection of detections.filter((d) => d.severity === "high" || d.severity === "critical")) {
      try {
        await this.logDetection(detection);
      } catch (error) {
        console.error("Failed to log detection:", error);
      }
    }

    return detections;
  }

  /**
   * Generate enhanced mock sonar data with realistic patterns
   */
  generateEnhancedMockData(
    depth: number,
    radius: number,
    numPings: number
  ): {
    returns: SonarReturn[];
    includeObjects: boolean;
    objectCount: number;
  } {
    const returns: SonarReturn[] = [];
    let objectCount = 0;
    const includeObjects = Math.random() > 0.3; // 70% chance of objects

    // Generate object locations
    const objects: { angle: number; distance: number; size: number }[] = [];
    if (includeObjects) {
      objectCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < objectCount; i++) {
        objects.push({
          angle: Math.random() * 360,
          distance: Math.random() * radius * 0.8,
          size: Math.random() * 10 + 2,
        });
      }
    }

    // Generate pings
    for (let i = 0; i < numPings; i++) {
      const angle = (i * 360) / numPings;
      const baseDistance = depth + (Math.random() - 0.5) * 20;
      
      // Check if near an object
      let nearObject = false;
      let objectIntensity = 0;
      objects.forEach((obj) => {
        const angleDiff = Math.abs(obj.angle - angle);
        const normalizedDiff = Math.min(angleDiff, 360 - angleDiff);
        if (normalizedDiff < 10 && Math.abs(obj.distance - depth) < 20) {
          nearObject = true;
          objectIntensity = 60 + Math.random() * 30;
        }
      });

      const intensity = nearObject
        ? objectIntensity
        : 30 + Math.random() * 40 - Math.abs(Math.sin((angle * Math.PI) / 180)) * 10;

      const material = nearObject
        ? Math.random() > 0.5
          ? "metal"
          : "rock"
        : Math.random() > 0.7
          ? "rock"
          : "sand";

      returns.push({
        ping: {
          id: `ping-${i}`,
          timestamp: new Date().toISOString(),
          angle,
          distance: baseDistance,
          intensity,
          echoDelay: baseDistance / 1.5, // Simplified
        },
        depth: baseDistance,
        material,
        confidence: 60 + Math.random() * 30,
        noise: 10 + Math.random() * 15,
      } as SonarReturn);
    }

    return { returns, includeObjects, objectCount };
  }

  /**
   * Resolve a detection
   */
  async resolveDetection(detectionId: string): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from("sonar_detections")
        .update({ resolved: true })
        .eq("id", detectionId);

      if (error) throw error;

      logger.info("Detection resolved", { detectionId });
    } catch (error) {
      logger.error("Failed to resolve detection", error);
      throw error;
    }
  }

  /**
   * Save AI analysis results to sonar_ai_results table (PATCH 448)
   */
  async saveAIAnalysis(
    analysis: SonarAnalysis,
    missionId?: string,
    userId?: string
  ): Promise<void> {
    try {
      const hazards = analysis.patterns
        .filter((p) => p.type === "object" || p.type === "anomaly")
        .map((p) => ({
          type: p.type,
          location: p.location,
          confidence: p.confidence,
          description: p.description,
        }));

      const safeZones = analysis.patterns
        .filter((p) => (p.type as any) === "clear" && p.confidence > 70)
        .map((p) => ({
          location: p.location,
          radius: 50, // meters
        }));

      const acousticSignatures = analysis.returns.slice(0, 20).map((ret) => ({
        angle: ret.ping.angle,
        distance: ret.ping.distance,
        intensity: ret.ping.intensity,
        material: ret.material,
        echo_delay: ret.ping.echoDelay,
      }));

      const bathymetricData = analysis.returns.map((ret) => ({
        angle: ret.ping.angle,
        depth: ret.depth,
        confidence: ret.confidence,
      }));

      const { error } = await (supabase as any).from("sonar_ai_results").insert({
        mission_id: missionId,
        analysis_type: "acoustic_pattern_detection",
        detected_patterns: analysis.patterns,
        hazards_detected: hazards,
        safe_zones: safeZones,
        acoustic_signatures: acousticSignatures,
        confidence_level: (analysis as any).confidence || 80,
        ai_model_version: "1.0.0",
        processing_time_ms: 150,
        recommendations: this.generateRecommendations(analysis),
        bathymetric_data: bathymetricData,
        scan_timestamp: new Date(analysis.timestamp).toISOString(),
        user_id: userId,
      });

      if (error) throw error;

      logger.info("AI analysis saved to sonar_ai_results", { missionId });
    } catch (error) {
      logger.error("Failed to save AI analysis", error);
      throw error;
    }
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(analysis: SonarAnalysis): string {
    const hazards = analysis.patterns.filter(
      (p) => p.type === "object" || p.type === "anomaly"
    );
    const clearAreas = analysis.patterns.filter((p) => (p.type as any) === "clear");

    if (hazards.length > 3) {
      return "High hazard density detected. Recommend reducing speed and increasing scan frequency. Consider alternative route.";
    } else if (hazards.length > 0) {
      return `${hazards.length} potential hazard(s) detected. Monitor closely and maintain safe distance.`;
    } else if (clearAreas.length > 10) {
      return "Clear navigation area confirmed. Safe to proceed at planned speed.";
    }

    return "Normal sonar returns. Continue standard monitoring procedures.";
  }
}

export const sonarAIService = new SonarAIService();
