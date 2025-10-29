// @ts-nocheck
/**
 * PATCH 458 - Planned Routes Persistence Service
 * Service for persisting planned routes and optimization history to database
 */

import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import type { Route } from "./routePlannerService";

export interface PlannedRouteRecord {
  id: string;
  user_id: string;
  vessel_id?: string;
  name: string;
  description?: string;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  waypoints: Array<Record<string, unknown>>;
  distance_nm: number;
  estimated_duration: number;
  fuel_consumption_estimate?: number;
  status: string;
  route_type: string;
  optimization_factors?: Record<string, unknown>;
  weather_data?: Record<string, unknown>;
  traffic_data?: Record<string, unknown>;
  risk_score: number;
  weather_alerts: Array<Record<string, unknown>>;
  recommended: boolean;
  eta_prediction?: string;
  route_geometry?: Record<string, unknown>;
  ai_analysis?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

class PlannedRoutesService {
  /**
   * Save a planned route to database
   */
  async savePlannedRoute(route: Route, userId?: string, vesselId?: string): Promise<PlannedRouteRecord | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn("No authenticated user, skipping route save");
        return null;
      }

      const routeData = {
        user_id: userId || user.id,
        vessel_id: vesselId,
        name: route.name,
        description: route.description,
        origin: route.origin,
        destination: route.destination,
        waypoints: route.waypoints,
        distance_nm: route.distance,
        estimated_duration: route.estimatedDuration,
        status: route.status || 'planned',
        route_type: route.riskScore < 30 ? 'optimized' : route.recommended ? 'direct' : 'alternative',
        risk_score: route.riskScore,
        weather_alerts: route.weatherAlerts || [],
        recommended: route.recommended,
        ai_analysis: {
          calculatedAt: new Date().toISOString(),
          waypointCount: route.waypoints.length,
          alertCount: route.weatherAlerts?.length || 0,
        },
      };

      const { data, error } = await supabase
        .from("planned_routes")
        .insert(routeData)
        .select()
        .single();

      if (error) {
        logger.error("Failed to save planned route:", error);
        return null;
      }

      logger.info("Planned route saved successfully:", data.id);
      return data as PlannedRouteRecord;
    } catch (error) {
      logger.error("Error saving planned route:", error);
      return null;
    }
  }

  /**
   * Get user's planned routes
   */
  async getUserPlannedRoutes(limit: number = 50): Promise<PlannedRouteRecord[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from("planned_routes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error("Failed to fetch planned routes:", error);
        return [];
      }

      return (data as PlannedRouteRecord[]) || [];
    } catch (error) {
      logger.error("Error fetching planned routes:", error);
      return [];
    }
  }

  /**
   * Get route statistics
   */
  async getRouteStats(): Promise<{
    totalRoutes: number;
    plannedCount: number;
    activeCount: number;
    completedCount: number;
    avgDistance: number;
    totalDistance: number;
    avgRiskScore: number;
  } | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from("planned_routes")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        logger.error("Failed to fetch route stats:", error);
        return null;
      }

      const routes = (data as PlannedRouteRecord[]) || [];

      return {
        totalRoutes: routes.length,
        plannedCount: routes.filter(r => r.status === 'planned').length,
        activeCount: routes.filter(r => r.status === 'active').length,
        completedCount: routes.filter(r => r.status === 'completed').length,
        avgDistance: routes.length > 0 
          ? routes.reduce((sum, r) => sum + r.distance_nm, 0) / routes.length 
          : 0,
        totalDistance: routes.reduce((sum, r) => sum + r.distance_nm, 0),
        avgRiskScore: routes.length > 0 
          ? routes.reduce((sum, r) => sum + r.risk_score, 0) / routes.length 
          : 0,
      };
    } catch (error) {
      logger.error("Error fetching route stats:", error);
      return null;
    }
  }
}

export const plannedRoutesService = new PlannedRoutesService();
