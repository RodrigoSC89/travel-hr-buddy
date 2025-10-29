// @ts-nocheck
/**
 * PATCH 456 - Navigation AI Logs Service
 * Service for persisting navigation AI calculations and alerts to database
 */

import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import type { NavigationRoute, Coordinates, WeatherAlert } from "../index";

export interface NavigationLogInput {
  origin: Coordinates;
  destination: Coordinates;
  route: NavigationRoute;
  optimizationOptions?: {
    avoidStorms?: boolean;
    maxWindSpeed?: number;
    maxWaveHeight?: number;
    preferShorterDistance?: boolean;
    considerFuelEfficiency?: boolean;
  };
  userId?: string;
}

export interface NavigationLog {
  id: string;
  user_id: string;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  route_id: string;
  route_type: string;
  waypoints: Array<{ lat: number; lng: number; timestamp?: number; speed?: number; heading?: number }>;
  distance_nm: number;
  estimated_duration: number;
  eta_with_ai: string;
  risk_score: number;
  weather_alerts: WeatherAlert[];
  recommended: boolean;
  optimization_options?: Record<string, unknown>;
  ai_metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

class NavigationAILogsService {
  /**
   * Save navigation route calculation to database
   */
  async saveNavigationLog(input: NavigationLogInput): Promise<NavigationLog | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn("No authenticated user, skipping navigation log save");
        return null;
      }

      const logData = {
        user_id: input.userId || user.id,
        origin: input.origin,
        destination: input.destination,
        route_id: input.route.id,
        route_type: input.route.id, // 'direct', 'alternative', etc.
        waypoints: input.route.waypoints,
        distance_nm: input.route.distance,
        estimated_duration: input.route.estimatedDuration,
        eta_with_ai: input.route.etaWithAI,
        risk_score: input.route.riskScore,
        weather_alerts: input.route.weatherAlerts,
        recommended: input.route.recommended,
        optimization_options: input.optimizationOptions,
        ai_metadata: {
          calculatedAt: new Date().toISOString(),
          waypointCount: input.route.waypoints.length,
          alertCount: input.route.weatherAlerts.length,
        },
      };

      const { data, error } = await supabase
        .from("navigation_ai_logs")
        .insert(logData)
        .select()
        .single();

      if (error) {
        logger.error("Failed to save navigation log:", error);
        return null;
      }

      logger.info("Navigation log saved successfully:", data.id);
      return data as NavigationLog;
    } catch (error) {
      logger.error("Error saving navigation log:", error);
      return null;
    }
  }

  /**
   * Get navigation logs for current user
   */
  async getUserNavigationLogs(limit: number = 50): Promise<NavigationLog[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn("No authenticated user");
        return [];
      }

      const { data, error } = await supabase
        .from("navigation_ai_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error("Failed to fetch navigation logs:", error);
        return [];
      }

      return (data as NavigationLog[]) || [];
    } catch (error) {
      logger.error("Error fetching navigation logs:", error);
      return [];
    }
  }

  /**
   * Get statistics for user's navigation logs
   */
  async getNavigationStats(): Promise<{
    totalLogs: number;
    recommendedCount: number;
    avgRiskScore: number;
    totalDistance: number;
    totalAlerts: number;
  } | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from("navigation_ai_logs")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        logger.error("Failed to fetch navigation stats:", error);
        return null;
      }

      const logs = (data as NavigationLog[]) || [];

      return {
        totalLogs: logs.length,
        recommendedCount: logs.filter(log => log.recommended).length,
        avgRiskScore: logs.length > 0 
          ? logs.reduce((sum, log) => sum + log.risk_score, 0) / logs.length 
          : 0,
        totalDistance: logs.reduce((sum, log) => sum + log.distance_nm, 0),
        totalAlerts: logs.reduce((sum, log) => sum + (log.weather_alerts?.length || 0), 0),
      };
    } catch (error) {
      logger.error("Error fetching navigation stats:", error);
      return null;
    }
  }
}

export const navigationAILogsService = new NavigationAILogsService();
