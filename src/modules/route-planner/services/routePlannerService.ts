/**
 * Route Planner Service - PATCH 494 (Enhanced with AI)
 * AI-powered route optimization with weather integration
 * Optimizes for minimum time and fuel consumption
 */

import { navigationCopilot, type Coordinates, type WeatherData } from "@/modules/navigation-copilot/index";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface Waypoint {
  id?: string;
  longitude: number;
  latitude: number;
  name: string;
  order: number;
  eta?: string;
  weather?: WeatherData;
  riskLevel?: "low" | "medium" | "high" | "critical";
}

export interface Route {
  id?: string;
  name: string;
  description?: string;
  origin: Coordinates;
  destination: Coordinates;
  waypoints: Waypoint[];
  distance: number; // nautical miles
  estimatedDuration: number; // hours
  estimatedFuelConsumption?: number; // liters - PATCH 494
  fuelSavings?: number; // percentage - PATCH 494
  timeSavings?: number; // hours - PATCH 494
  etaArrival: string;
  weatherAlerts: WeatherAlert[];
  riskScore: number;
  status: "draft" | "planned" | "active" | "completed";
  recommended?: boolean;
  aiOptimized?: boolean; // PATCH 494
  optimizationReason?: string; // PATCH 494
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

export interface WeatherAlert {
  id: string;
  location: Coordinates;
  type: "storm" | "high_winds" | "poor_visibility" | "high_waves";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  validUntil: number;
}

export interface RouteCalculationOptions {
  avoidStorms?: boolean;
  maxWindSpeed?: number;
  maxWaveHeight?: number;
  preferShorterDistance?: boolean;
  considerFuelEfficiency?: boolean;
}

class RoutePlannerService {
  /**
   * PATCH 494: AI-powered route optimization
   * Suggests optimal route considering time and fuel efficiency
   */
  async suggestOptimalRoute(
    origin: Coordinates,
    destination: Coordinates,
    vesselSpeed: number = 12, // knots
    fuelConsumptionRate: number = 50 // liters per hour
  ): Promise<Route> {
    try {
      logger.info("Calculating AI-optimized route", { origin, destination });

      // Calculate multiple routes
      const routes = await this.calculateRoutes(origin, destination, {
        avoidStorms: true,
        considerFuelEfficiency: true,
      });

      if (routes.length === 0) {
        throw new Error("No routes available");
      }

      // AI optimization: score routes based on multiple factors
      const scoredRoutes = routes.map(route => {
        // Calculate fuel consumption
        const fuelConsumption = route.estimatedDuration * fuelConsumptionRate;
        
        // Scoring factors (normalized 0-100)
        const timeScore = 100 - (route.estimatedDuration / 168) * 100; // Lower time = higher score
        const fuelScore = 100 - (fuelConsumption / 10000) * 100; // Lower fuel = higher score
        const safetyScore = 100 - route.riskScore; // Lower risk = higher score
        const weatherScore = route.weatherAlerts.length === 0 ? 100 : 
          Math.max(0, 100 - (route.weatherAlerts.length * 20));
        
        // Weighted scoring (time and fuel are most important)
        const totalScore = (
          timeScore * 0.35 +
          fuelScore * 0.35 +
          safetyScore * 0.20 +
          weatherScore * 0.10
        );

        return {
          ...route,
          aiScore: totalScore,
          estimatedFuelConsumption: fuelConsumption,
        };
      });

      // Sort by AI score and get the best route
      const bestRoute = scoredRoutes.sort((a, b) => b.aiScore - a.aiScore)[0];
      
      // Calculate savings compared to the longest route
      const longestRoute = routes.reduce((prev, current) => 
        current.estimatedDuration > prev.estimatedDuration ? current : prev
      );
      
      const timeSavings = longestRoute.estimatedDuration - bestRoute.estimatedDuration;
      const fuelSavings = ((longestRoute.estimatedDuration - bestRoute.estimatedDuration) * 
        fuelConsumptionRate / (longestRoute.estimatedDuration * fuelConsumptionRate)) * 100;

      // Save AI suggestion log
      await this.saveAISuggestionLog({
        origin,
        destination,
        suggestedRoute: bestRoute.name,
        timeSavings,
        fuelSavings,
        weatherConditions: bestRoute.weatherAlerts.length,
        riskScore: bestRoute.riskScore
      });

      return {
        ...bestRoute,
        aiOptimized: true,
        recommended: true,
        timeSavings,
        fuelSavings,
        optimizationReason: `AI suggests this route for ${timeSavings.toFixed(1)}h time savings and ${fuelSavings.toFixed(1)}% fuel savings`,
      };
    } catch (error) {
      logger.error("Failed to calculate AI-optimized route", error);
      throw error;
    }
  }

  /**
   * PATCH 494: Save AI suggestion log for tracking
   */
  async saveAISuggestionLog(data: {
    origin: Coordinates;
    destination: Coordinates;
    suggestedRoute: string;
    timeSavings: number;
    fuelSavings: number;
    weatherConditions: number;
    riskScore: number;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('route_ai_suggestions')
        .insert({
          origin: data.origin,
          destination: data.destination,
          suggested_route: data.suggestedRoute,
          time_savings_hours: data.timeSavings,
          fuel_savings_percentage: data.fuelSavings,
          weather_alerts_count: data.weatherConditions,
          risk_score: data.riskScore,
          created_at: new Date().toISOString()
        });

      if (error) {
        logger.error("Failed to save AI suggestion log", error);
      }
    } catch (error) {
      logger.error("Error saving AI suggestion log", error);
    }
  }

  /**
   * Calculate optimized routes with weather integration
   */
  async calculateRoutes(
    origin: Coordinates,
    destination: Coordinates,
    options: RouteCalculationOptions = {}
  ): Promise<Route[]> {
    try {
      logger.info("Calculating routes with weather integration", { origin, destination });

      // Use Navigation Copilot to calculate routes with weather
      const navRoutes = await navigationCopilot.calculateRoute(origin, destination, options);

      // Convert to Route format
      const routes: Route[] = navRoutes.map((navRoute) => {
        const waypoints: Waypoint[] = navRoute.waypoints.map((wp, index) => ({
          longitude: wp.lng,
          latitude: wp.lat,
          name: `Waypoint ${index + 1}`,
          order: index,
          riskLevel: this.determineWaypointRisk(wp, navRoute.weatherAlerts),
        }));

return {
  id: navRoute.id,
  name: navRoute.recommended ? "Rota Recomendada" : "Rota Alternativa",
  description: `Rota ${navRoute.recommended ? "otimizada" : "alternativa"} com análise meteorológica`,
  origin: navRoute.origin,
  destination: navRoute.destination,
  waypoints,
  distance: navRoute.distance,
  estimatedDuration: navRoute.estimatedDuration,
  etaArrival: navRoute.etaWithAI,
  weatherAlerts: navRoute.weatherAlerts,
  riskScore: navRoute.riskScore,
  status: "planned",
  recommended: navRoute.recommended,
};
      });

      return routes;
    } catch (error) {
      logger.error("Failed to calculate routes", error);
      throw error;
    }
  }

  /**
   * Save route to database (PATCH 449 - Enhanced with planned_routes table)
   */
  async saveRoute(route: Route, userId: string): Promise<Route> {
    try {
      logger.info("Saving route to database", { routeName: route.name, userId });

      // Calculate weather factor
      const weatherFactor = this.calculateWeatherFactor(route.weatherAlerts);

      // Save to both routes table (legacy) and planned_routes (PATCH 449)
      const { data, error } = await supabase
        .from("routes")
        .insert({
          name: route.name,
          description: route.description,
          origin: route.origin,
          destination: route.destination,
          waypoints: route.waypoints,
          distance: route.distance,
          estimated_duration: route.estimatedDuration,
          eta_arrival: route.etaArrival,
          weather_alerts: route.weatherAlerts,
          risk_score: route.riskScore,
          status: route.status,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      // Also save to planned_routes table (PATCH 449)
      await (supabase as any)
        .from("planned_routes")
        .insert({
          user_id: userId,
          route_name: route.name,
          description: route.description,
          waypoints: route.waypoints,
          origin: route.origin,
          destination: route.destination,
          distance_nm: route.distance,
          estimated_duration_hours: route.estimatedDuration,
          weather_integrated: true,
          weather_factor: weatherFactor,
          eta: new Date(Date.now() + route.estimatedDuration * 3600000).toISOString(),
          status: route.status,
        });

      return this.mapDatabaseRoute(data);
    } catch (error) {
      logger.error("Failed to save route", error);
      throw error;
    }
  }

  /**
   * Get saved routes for user
   */
  async getUserRoutes(userId: string): Promise<Route[]> {
    try {
      const { data, error } = await supabase
        .from("routes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map(this.mapDatabaseRoute);
    } catch (error) {
      logger.error("Failed to get user routes", error);
      return [];
    }
  }

  /**
   * Update route status
   */
  async updateRouteStatus(routeId: string, status: Route["status"]): Promise<void> {
    try {
      const { error } = await supabase
        .from("routes")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", routeId);

      if (error) throw error;

      logger.info("Route status updated", { routeId, status });
    } catch (error) {
      logger.error("Failed to update route status", error);
      throw error;
    }
  }

  /**
   * Get weather data for waypoints
   */
  async enrichRouteWithWeather(route: Route): Promise<Route> {
    try {
      const enrichedWaypoints = await Promise.all(
        route.waypoints.map(async (waypoint) => {
          const weather = await navigationCopilot.getWeatherData({
            lat: waypoint.latitude,
            lng: waypoint.longitude,
          });

          return {
            ...waypoint,
            weather,
            riskLevel: this.mapWeatherSeverityToRisk(weather.severity),
          };
        })
      );

      return {
        ...route,
        waypoints: enrichedWaypoints,
      };
    } catch (error) {
      logger.error("Failed to enrich route with weather", error);
      return route;
    }
  }

  /**
   * Calculate ETA dynamically based on current conditions
   */
  calculateDynamicETA(
    route: Route,
    currentPosition: Coordinates,
    currentSpeed: number // knots
  ): { eta: string; remainingDistance: number; remainingTime: number } {
    // Find closest waypoint to current position
    let minDistance = Infinity;
    let closestWaypointIndex = 0;

    route.waypoints.forEach((wp, index) => {
      const distance = this.calculateDistance(
        currentPosition,
        { lat: wp.latitude, lng: wp.longitude }
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestWaypointIndex = index;
      }
    });

    // Calculate remaining distance from current position
    let remainingDistance = minDistance;
    for (let i = closestWaypointIndex; i < route.waypoints.length - 1; i++) {
      const wp1 = route.waypoints[i];
      const wp2 = route.waypoints[i + 1];
      remainingDistance += this.calculateDistance(
        { lat: wp1.latitude, lng: wp1.longitude },
        { lat: wp2.latitude, lng: wp2.longitude }
      );
    }

    // Calculate remaining time
    const remainingTime = currentSpeed > 0 ? remainingDistance / currentSpeed : route.estimatedDuration;

    // Calculate ETA
    const eta = new Date(Date.now() + remainingTime * 60 * 60 * 1000);

    return {
      eta: eta.toLocaleString(),
      remainingDistance,
      remainingTime,
    };
  }

  /**
   * Helper: Calculate distance between two coordinates (Haversine)
   */
  private calculateDistance(p1: Coordinates, p2: Coordinates): number {
    const R = 3440.065; // Earth's radius in nautical miles
    const dLat = this.toRad(p2.lat - p1.lat);
    const dLon = this.toRad(p2.lng - p1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(p1.lat)) *
        Math.cos(this.toRad(p2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Helper: Calculate weather factor for ETA adjustment
   */
  private calculateWeatherFactor(alerts: WeatherAlert[]): number {
    if (alerts.length === 0) return 1.0;

    let factor = 1.0;
    alerts.forEach((alert) => {
      switch (alert.severity) {
        case "low":
          factor *= 1.05; // 5% delay
          break;
        case "medium":
          factor *= 1.15; // 15% delay
          break;
        case "high":
          factor *= 1.30; // 30% delay
          break;
        case "critical":
          factor *= 1.50; // 50% delay
          break;
      }
    });

    return Math.min(factor, 2.0); // Cap at 2x
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Helper: Determine waypoint risk based on weather alerts
   */
  private determineWaypointRisk(
    waypoint: Coordinates,
    alerts: WeatherAlert[]
  ): Waypoint["riskLevel"] {
    const nearbyAlerts = alerts.filter((alert) => {
      const distance = this.calculateDistance(waypoint, alert.location);
      return distance < 30; // within 30 nautical miles
    });

    if (nearbyAlerts.length === 0) return "low";

    const maxSeverity = Math.max(
      ...nearbyAlerts.map((a) => {
        switch (a.severity) {
          case "critical":
            return 4;
          case "high":
            return 3;
          case "medium":
            return 2;
          default:
            return 1;
        }
      })
    );

    if (maxSeverity >= 4) return "critical";
    if (maxSeverity >= 3) return "high";
    if (maxSeverity >= 2) return "medium";
    return "low";
  }

  /**
   * Helper: Map weather severity to risk level
   */
  private mapWeatherSeverityToRisk(severity: string): Waypoint["riskLevel"] {
    switch (severity) {
      case "danger":
        return "critical";
      case "caution":
        return "medium";
      default:
        return "low";
    }
  }

  /**
   * Helper: Map database record to Route
   */
  private mapDatabaseRoute(data: any): Route {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      origin: data.origin,
      destination: data.destination,
      waypoints: data.waypoints,
      distance: data.distance,
      estimatedDuration: data.estimated_duration,
      etaArrival: data.eta_arrival,
      weatherAlerts: data.weather_alerts || [],
      riskScore: data.risk_score,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      userId: data.user_id,
    };
  }
}

export const routePlannerService = new RoutePlannerService();
