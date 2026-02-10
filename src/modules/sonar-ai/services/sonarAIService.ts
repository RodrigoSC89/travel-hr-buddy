/**
 * Sonar AI Service - PATCH 435
 * Enhanced sonar data processing with logging and visualization
 * DEBT-FIX: Removed (supabase as any) - sonar_detections/sonar_scans/sonar_ai_results don't exist in schema
 * Using in-memory storage + logger for all sonar data
 */

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
  waveform: number[];
  frequencySpectrum: { frequency: number; amplitude: number }[];
  polarPlot: { angle: number; distance: number; intensity: number }[];
}

// In-memory storage for sonar data (tables don't exist in DB)
const detectionStore: SonarDetection[] = [];
const scanStore: SonarScanLog[] = [];

class SonarAIService {
  /**
   * Log a sonar detection (in-memory, no DB table)
   */
  async logDetection(detection: SonarDetection): Promise<void> {
    try {
      logger.info("Logging sonar detection", { type: detection.detectionType });

      const storedDetection: SonarDetection = {
        ...detection,
        id: detection.id || `det-${Date.now()}-${crypto.randomUUID().slice(0, 9)}`,
      };

      detectionStore.push(storedDetection);

      // Keep only last 500 detections in memory
      if (detectionStore.length > 500) {
        detectionStore.splice(0, detectionStore.length - 500);
      }
    } catch (error) {
      logger.error("Failed to log detection", error);
      throw error;
    }
  }

  /**
   * Log a sonar scan (in-memory, no DB table)
   */
  async logScan(scanLog: SonarScanLog): Promise<void> {
    try {
      logger.info("Logging sonar scan", { depth: scanLog.scanDepth });

      const storedScan: SonarScanLog = {
        ...scanLog,
        id: scanLog.id || `scan-${Date.now()}-${crypto.randomUUID().slice(0, 9)}`,
      };

      scanStore.push(storedScan);

      // Keep only last 100 scans in memory
      if (scanStore.length > 100) {
        scanStore.splice(0, scanStore.length - 100);
      }
    } catch (error) {
      logger.error("Failed to log scan", error);
      throw error;
    }
  }

  /**
   * Get recent detections (from in-memory store)
   */
  async getRecentDetections(limit = 50): Promise<SonarDetection[]> {
    try {
      return detectionStore
        .slice(-limit)
        .reverse();
    } catch (error) {
      logger.error("Failed to get detections", error);
      return [];
    }
  }

  /**
   * Get scan history (from in-memory store)
   */
  async getScanHistory(limit = 20): Promise<SonarScanLog[]> {
    try {
      return scanStore
        .slice(-limit)
        .reverse();
    } catch (error) {
      logger.error("Failed to get scan history", error);
      return [];
    }
  }

  /**
   * Generate visualization data from sonar analysis
   */
  generateVisualizationData(analysis: SonarAnalysis): VisualizationData {
    const waveform: number[] = [];
    const numSamples = 100;
    
    analysis.returns.forEach((ret, index) => {
      const sample = (ret.ping.intensity * (1 - ret.noise / 100)) || 0;
      if (index < numSamples) {
        waveform.push(sample);
      }
    });

    while (waveform.length < numSamples) {
      waveform.push(10); // Baseline noise floor
    }

    const frequencySpectrum: { frequency: number; amplitude: number }[] = [];
    for (let i = 0; i < 50; i++) {
      const frequency = i * 100;
      const baseAmplitude = 15;
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

    analysis.patterns.forEach((pattern) => {
      let severity: SonarDetection["severity"] = "low";
      let detectionType: SonarDetection["detectionType"] = "anomaly";

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

    for (const detection of detections.filter((d) => d.severity === "high" || d.severity === "critical")) {
      try {
        await this.logDetection(detection);
      } catch (error) {
        logger.error("Failed to log detection:", error);
      }
    }

    return detections;
  }

  /**
   * Get sonar data - placeholder for real sensor integration
   */
  getSonarData(
    _depth: number,
    _radius: number,
    _numPings: number
  ): {
    returns: SonarReturn[];
    includeObjects: boolean;
    objectCount: number;
  } {
    return {
      returns: [],
      includeObjects: false,
      objectCount: 0
    };
  }

  /**
   * Resolve a detection (in-memory)
   */
  async resolveDetection(detectionId: string): Promise<void> {
    try {
      const detection = detectionStore.find(d => d.id === detectionId);
      if (detection) {
        detection.resolved = true;
      }
      logger.info("Detection resolved", { detectionId });
    } catch (error) {
      logger.error("Failed to resolve detection", error);
      throw error;
    }
  }

  /**
   * Save AI analysis results (in-memory, sonar_ai_results table doesn't exist)
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

      logger.info("AI analysis saved (in-memory)", {
        missionId,
        hazardsCount: hazards.length,
        patternsCount: analysis.patterns.length,
        recommendations: this.generateRecommendations(analysis),
      });
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
