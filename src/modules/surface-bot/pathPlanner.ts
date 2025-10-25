/**
 * PATCH 173.0 - Path Planner
 * Defines safe routes based on sensors and map data
 */

import { logger } from "@/lib/logger";
import type { SurfaceBotPosition } from "./surfaceBotCore";

export interface Waypoint {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface SafePath {
  id: string;
  waypoints: Waypoint[];
  totalDistance: number; // nautical miles
  estimatedTime: number; // minutes
  riskLevel: "low" | "medium" | "high";
  obstacles: number;
}

class PathPlanner {
  /**
   * Plan safe path between two points
   */
  planPath(
    start: SurfaceBotPosition,
    end: { latitude: number; longitude: number },
    obstacles: { distance: number; bearing: number }[]
  ): SafePath {
    // Simple path planning - in production would use A* or similar
    const waypoints: Waypoint[] = [
      { latitude: start.latitude, longitude: start.longitude, name: "Start" },
      { latitude: end.latitude, longitude: end.longitude, name: "End" }
    ];

    const distance = this.calculateDistance(
      start.latitude,
      start.longitude,
      end.latitude,
      end.longitude
    );

    const riskLevel = obstacles.length > 10 ? "high" : obstacles.length > 5 ? "medium" : "low";

    return {
      id: `path_${Date.now()}`,
      waypoints,
      totalDistance: distance,
      estimatedTime: (distance / 10) * 60, // Assuming 10 knots
      riskLevel,
      obstacles: obstacles.length
    };
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 3440.065; // Earth's radius in nautical miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}

export const pathPlanner = new PathPlanner();
