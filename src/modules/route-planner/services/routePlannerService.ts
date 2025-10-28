/**
 * Route Planner Service - PATCH 431
 * Integrates route planning with weather, forecast, and risk assessment
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
  etaArrival: string;
  weatherAlerts: WeatherAlert[];
  riskScore: number;
  status: "draft" | "planned" | "active" | "completed";
  recommended?: boolean;
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
   * Save route to database
   */
  async saveRoute(route: Route, userId: string): Promise<Route> {
    try {
      logger.info("Saving route to database", { routeName: route.name, userId });

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
