
/**
 * PATCH 457 - Sonar Data Persistence Service
 * Service for persisting sonar readings and AI predictions to database
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { BathymetricData, SonarReading } from "./sonarEngine";

export interface SonarReadingRecord {
  id: string;
  mission_id?: string;
  user_id: string;
  location: { lat: number; lon: number };
  depth: number;
  timestamp: string;
  terrain_type: string;
  risk_level: string;
  temperature?: number;
  pressure?: number;
  visibility?: number;
  reading_data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SonarAIPredictionRecord {
  id: string;
  reading_id?: string;
  user_id: string;
  prediction_type: string;
  confidence: number;
  location: { lat: number; lon: number };
  depth_range?: { min: number; max: number };
  description?: string;
  detected_objects?: Array<unknown>;
  safe_route_recommendation?: Array<{ lat: number; lon: number }>;
  warnings?: string[];
  ai_model?: string;
  processed_at: string;
  created_at: string;
  updated_at: string;
}

class SonarPersistenceService {
  /**
   * Save bathymetric scan data to database
   */
  async saveBathymetricScan(
    data: BathymetricData,
    missionId?: string
  ): Promise<{ success: boolean; readingsCount: number }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn("No authenticated user, skipping sonar save");
        return { success: false, readingsCount: 0 };
      }

      // Batch insert sonar readings
      const readingsToInsert = data.readings.map((reading) => ({
        mission_id: missionId,
        user_id: user.id,
        location: { lat: reading.lat, lon: reading.lon },
        depth: reading.depth,
        terrain_type: reading.terrain,
        risk_level: reading.riskLevel,
        reading_data: {
          id: reading.id,
          frequency: reading.frequency,
        },
        metadata: {
          scanId: data.scanId,
          centerLat: data.centerLat,
          centerLon: data.centerLon,
          radiusKm: data.radiusKm,
        },
      }));

      const { data: insertedReadings, error } = await supabase
        .from("sonar_readings")
        .insert(readingsToInsert)
        .select();

      if (error) {
        logger.error("Failed to save sonar readings:", error);
        return { success: false, readingsCount: 0 };
      }

      logger.info(`Saved ${insertedReadings.length} sonar readings`);
      return { success: true, readingsCount: insertedReadings.length };
    } catch (error) {
      logger.error("Error saving sonar readings:", error);
      return { success: false, readingsCount: 0 };
    }
  }

  /**
   * Save AI prediction and analysis
   */
  async saveAIPrediction(
    recommendation: string,
    safePath: Array<{ lat: number; lon: number }>,
    warnings: string[],
    location: { lat: number; lon: number },
    confidence: number = 85
  ): Promise<SonarAIPredictionRecord | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn("No authenticated user, skipping AI prediction save");
        return null;
      }

      const predictionData = {
        user_id: user.id,
        prediction_type: "feature",
        confidence,
        location,
        description: recommendation,
        safe_route_recommendation: safePath,
        warnings,
        ai_model: "sonar-analysis-v1",
        processed_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("sonar_ai_predictions")
        .insert(predictionData)
        .select()
        .single();

      if (error) {
        logger.error("Failed to save AI prediction:", error);
        return null;
      }

      logger.info("AI prediction saved successfully:", data.id);
      return data as SonarAIPredictionRecord;
    } catch (error) {
      logger.error("Error saving AI prediction:", error);
      return null;
    }
  }

  /**
   * Get recent sonar readings
   */
  async getRecentReadings(limit: number = 100): Promise<SonarReadingRecord[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from("sonar_readings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error("Failed to fetch sonar readings:", error);
        return [];
      }

      return (data as SonarReadingRecord[]) || [];
    } catch (error) {
      logger.error("Error fetching sonar readings:", error);
      return [];
    }
  }

  /**
   * Get recent AI predictions
   */
  async getRecentPredictions(limit: number = 20): Promise<SonarAIPredictionRecord[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from("sonar_ai_predictions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error("Failed to fetch AI predictions:", error);
        return [];
      }

      return (data as SonarAIPredictionRecord[]) || [];
    } catch (error) {
      logger.error("Error fetching AI predictions:", error);
      return [];
    }
  }

  /**
   * Get sonar statistics
   */
  async getSonarStats(): Promise<{
    totalReadings: number;
    safeReadings: number;
    cautionReadings: number;
    dangerReadings: number;
    avgDepth: number;
    minDepth: number;
    maxDepth: number;
    totalPredictions: number;
  } | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data: readings, error: readingsError } = await supabase
        .from("sonar_readings")
        .select("*")
        .eq("user_id", user.id);

      const { data: predictions, error: predictionsError } = await supabase
        .from("sonar_ai_predictions")
        .select("id")
        .eq("user_id", user.id);

      if (readingsError || predictionsError) {
        logger.error("Failed to fetch sonar stats");
        return null;
      }

      const readingsData = (readings as SonarReadingRecord[]) || [];
      const depths = readingsData.map((r) => r.depth);

      return {
        totalReadings: readingsData.length,
        safeReadings: readingsData.filter((r) => r.risk_level === "safe").length,
        cautionReadings: readingsData.filter((r) => r.risk_level === "caution").length,
        dangerReadings: readingsData.filter((r) => r.risk_level === "danger").length,
        avgDepth: depths.length > 0 ? depths.reduce((a, b) => a + b, 0) / depths.length : 0,
        minDepth: depths.length > 0 ? Math.min(...depths) : 0,
        maxDepth: depths.length > 0 ? Math.max(...depths) : 0,
        totalPredictions: predictions?.length || 0,
      };
    } catch (error) {
      logger.error("Error fetching sonar stats:", error);
      return null;
    }
  }
}

export const sonarPersistenceService = new SonarPersistenceService();
