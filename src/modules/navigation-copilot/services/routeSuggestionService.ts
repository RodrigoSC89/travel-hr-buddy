/**
 * Route Suggestion Service - PATCH 447
 * Persists AI-generated route suggestions to database
 */

import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import type { NavigationRoute, Coordinates } from "../index";

export interface RouteSuggestionRecord {
  id?: string;
  userId: string;
  routeName: string;
  origin: Coordinates;
  destination: Coordinates;
  suggestedRoute: any[];
  distanceNm: number;
  estimatedDurationHours: number;
  riskScore: number;
  aiConfidence: number;
  weatherConditions?: any[];
  optimizationFactors?: any;
  recommended: boolean;
  status?: string;
  validUntil?: string;
}

class RouteSuggestionService {
  /**
   * Save route suggestion to database
   */
  async saveRouteSuggestion(
    route: NavigationRoute,
    userId: string,
    optimizationOptions?: any
  ): Promise<RouteSuggestionRecord> {
    try {
      const aiConfidence = route.recommended ? 95 : 75;
      const validUntil = new Date(Date.now() + 6 * 60 * 60 * 1000); // Valid for 6 hours

      const { data, error } = await supabase
        .from("route_suggestions")
        .insert({
          user_id: userId,
          route_name: route.id,
          origin: route.origin,
          destination: route.destination,
          suggested_route: route.waypoints,
          distance_nm: route.distance,
          estimated_duration_hours: route.estimatedDuration,
          risk_score: route.riskScore,
          ai_confidence: aiConfidence,
          weather_conditions: route.weatherAlerts,
          optimization_factors: optimizationOptions,
          recommended: route.recommended,
          status: "active",
          valid_until: validUntil.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      logger.info("Route suggestion saved", { routeId: route.id, userId });

      return this.mapToRecord(data);
    } catch (error) {
      logger.error("Failed to save route suggestion", error);
      throw error;
    }
  }

  /**
   * Get active route suggestions for user
   */
  async getUserRouteSuggestions(userId: string): Promise<RouteSuggestionRecord[]> {
    try {
      const { data, error } = await supabase
        .from("route_suggestions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .gte("valid_until", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map(this.mapToRecord);
    } catch (error) {
      logger.error("Failed to get route suggestions", error);
      return [];
    }
  }

  /**
   * Accept a route suggestion
   */
  async acceptRouteSuggestion(suggestionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("route_suggestions")
        .update({ status: "accepted" })
        .eq("id", suggestionId);

      if (error) throw error;

      logger.info("Route suggestion accepted", { suggestionId });
    } catch (error) {
      logger.error("Failed to accept route suggestion", error);
      throw error;
    }
  }

  /**
   * Reject a route suggestion
   */
  async rejectRouteSuggestion(suggestionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("route_suggestions")
        .update({ status: "rejected" })
        .eq("id", suggestionId);

      if (error) throw error;

      logger.info("Route suggestion rejected", { suggestionId });
    } catch (error) {
      logger.error("Failed to reject route suggestion", error);
      throw error;
    }
  }

  /**
   * Clean up expired suggestions
   */
  async cleanupExpiredSuggestions(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from("route_suggestions")
        .update({ status: "expired" })
        .eq("status", "active")
        .lt("valid_until", new Date().toISOString())
        .select();

      if (error) throw error;

      const count = data?.length || 0;
      logger.info("Expired suggestions cleaned up", { count });

      return count;
    } catch (error) {
      logger.error("Failed to clean up expired suggestions", error);
      return 0;
    }
  }

  /**
   * Map database record to RouteSuggestionRecord
   */
  private mapToRecord(data: any): RouteSuggestionRecord {
    return {
      id: data.id,
      userId: data.user_id,
      routeName: data.route_name,
      origin: data.origin,
      destination: data.destination,
      suggestedRoute: data.suggested_route,
      distanceNm: data.distance_nm,
      estimatedDurationHours: data.estimated_duration_hours,
      riskScore: data.risk_score,
      aiConfidence: data.ai_confidence,
      weatherConditions: data.weather_conditions,
      optimizationFactors: data.optimization_factors,
      recommended: data.recommended,
      status: data.status,
      validUntil: data.valid_until,
    };
  }
}

export const routeSuggestionService = new RouteSuggestionService();
