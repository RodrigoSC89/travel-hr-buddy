/**
 * PATCH 172.0 - Mission Uploader
 * Uploads and manages automated drone missions in JSON format
 */

import { logger } from "@/lib/logger";
import { droneCommander, type DroneRoute, type DroneWaypoint } from "./droneCommander";

export interface MissionMetadata {
  id: string;
  name: string;
  description: string;
  author: string;
  createdAt: Date;
  version: string;
  tags: string[];
}

export interface MissionConfig {
  maxFlightTime: number; // minutes
  returnHomeOnLowBattery: boolean;
  lowBatteryThreshold: number; // percentage
  autoLand: boolean;
  emergencyProcedure: "land" | "return_home" | "hover";
}

export interface Mission {
  metadata: MissionMetadata;
  config: MissionConfig;
  routes: DroneRoute[];
  droneAssignments: Record<string, string>; // droneId -> routeId
}

export interface MissionUploadResult {
  success: boolean;
  missionId: string;
  errors: string[];
  warnings: string[];
  routesLoaded: number;
  timestamp: Date;
}

export interface MissionValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

class MissionUploader {
  private missions: Map<string, Mission> = new Map();
  private activeMissions: Set<string> = new Set();
  private maxMissions = 50;

  /**
   * Validate mission JSON structure
   */
  validateMission(mission: any): MissionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required metadata
    if (!mission.metadata) {
      errors.push("Missing required field: metadata");
    } else {
      if (!mission.metadata.id) errors.push("Missing metadata.id");
      if (!mission.metadata.name) errors.push("Missing metadata.name");
    }

    // Check required config
    if (!mission.config) {
      errors.push("Missing required field: config");
    } else {
      if (typeof mission.config.maxFlightTime !== "number") {
        errors.push("config.maxFlightTime must be a number");
      }
      if (typeof mission.config.lowBatteryThreshold !== "number") {
        errors.push("config.lowBatteryThreshold must be a number");
      }
    }

    // Check routes
    if (!mission.routes || !Array.isArray(mission.routes)) {
      errors.push("Missing or invalid field: routes (must be an array)");
    } else {
      if (mission.routes.length === 0) {
        warnings.push("Mission has no routes defined");
      }

      mission.routes.forEach((route: any, index: number) => {
        if (!route.id) errors.push(`Route ${index}: missing id`);
        if (!route.name) errors.push(`Route ${index}: missing name`);
        if (!route.waypoints || !Array.isArray(route.waypoints)) {
          errors.push(`Route ${index}: missing or invalid waypoints`);
        } else if (route.waypoints.length === 0) {
          errors.push(`Route ${index}: must have at least one waypoint`);
        } else {
          // Validate waypoints
          route.waypoints.forEach((wp: any, wpIndex: number) => {
            if (!wp.id) errors.push(`Route ${index}, Waypoint ${wpIndex}: missing id`);
            if (!wp.position) {
              errors.push(`Route ${index}, Waypoint ${wpIndex}: missing position`);
            } else {
              if (typeof wp.position.latitude !== "number") {
                errors.push(`Route ${index}, Waypoint ${wpIndex}: invalid latitude`);
              }
              if (typeof wp.position.longitude !== "number") {
                errors.push(`Route ${index}, Waypoint ${wpIndex}: invalid longitude`);
              }
              if (typeof wp.position.altitude !== "number") {
                errors.push(`Route ${index}, Waypoint ${wpIndex}: invalid altitude`);
              }
            }
          });
        }
      });
    }

    // Check drone assignments
    if (!mission.droneAssignments) {
      warnings.push("No drone assignments defined");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Upload mission from JSON
   */
  uploadMission(missionJson: string | Mission): MissionUploadResult {
    const result: MissionUploadResult = {
      success: false,
      missionId: "",
      errors: [],
      warnings: [],
      routesLoaded: 0,
      timestamp: new Date()
    };

    try {
      // Parse JSON if string
      const mission: Mission = typeof missionJson === "string" 
        ? JSON.parse(missionJson)
        : missionJson;

      // Validate mission
      const validation = this.validateMission(mission);
      result.errors = validation.errors;
      result.warnings = validation.warnings;

      if (!validation.valid) {
        logger.error("[Mission Uploader] Mission validation failed", {
          errors: validation.errors
        });
        return result;
      }

      // Check mission limit
      if (this.missions.size >= this.maxMissions) {
        result.errors.push(`Maximum missions (${this.maxMissions}) reached`);
        return result;
      }

      // Check for duplicate mission ID
      if (this.missions.has(mission.metadata.id)) {
        result.errors.push(`Mission ID ${mission.metadata.id} already exists`);
        return result;
      }

      // Normalize dates
      if (typeof mission.metadata.createdAt === "string") {
        mission.metadata.createdAt = new Date(mission.metadata.createdAt);
      } else if (!mission.metadata.createdAt) {
        mission.metadata.createdAt = new Date();
      }

      // Load routes into drone commander
      let routesLoaded = 0;
      for (const route of mission.routes) {
        if (droneCommander.defineRoute(route)) {
          routesLoaded++;
        } else {
          result.warnings.push(`Failed to load route: ${route.name}`);
        }
      }

      result.routesLoaded = routesLoaded;

      // Store mission
      this.missions.set(mission.metadata.id, mission);

      result.success = true;
      result.missionId = mission.metadata.id;

      logger.info(`[Mission Uploader] Mission ${mission.metadata.name} uploaded successfully`, {
        missionId: mission.metadata.id,
        routesLoaded
      });

      return result;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : "Unknown error");
      logger.error("[Mission Uploader] Failed to upload mission", error);
      return result;
    }
  }

  /**
   * Upload mission from file
   */
  async uploadMissionFromFile(file: File): Promise<MissionUploadResult> {
    try {
      const text = await file.text();
      return this.uploadMission(text);
    } catch (error) {
      return {
        success: false,
        missionId: "",
        errors: [error instanceof Error ? error.message : "Failed to read file"],
        warnings: [],
        routesLoaded: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get mission by ID
   */
  getMission(missionId: string): Mission | null {
    return this.missions.get(missionId) || null;
  }

  /**
   * List all missions
   */
  listMissions(): Mission[] {
    return Array.from(this.missions.values());
  }

  /**
   * Delete mission
   */
  deleteMission(missionId: string): boolean {
    if (!this.missions.has(missionId)) {
      logger.warn(`[Mission Uploader] Mission ${missionId} not found`);
      return false;
    }

    // Check if mission is active
    if (this.activeMissions.has(missionId)) {
      logger.warn(`[Mission Uploader] Cannot delete active mission ${missionId}`);
      return false;
    }

    const mission = this.missions.get(missionId)!;

    // Remove routes from drone commander
    for (const route of mission.routes) {
      droneCommander.deleteRoute(route.id);
    }

    this.missions.delete(missionId);
    logger.info(`[Mission Uploader] Mission ${missionId} deleted`);
    
    return true;
  }

  /**
   * Activate mission (assign routes to drones)
   */
  activateMission(missionId: string): { success: boolean; message: string } {
    const mission = this.missions.get(missionId);
    
    if (!mission) {
      return {
        success: false,
        message: `Mission ${missionId} not found`
      };
    }

    if (this.activeMissions.has(missionId)) {
      return {
        success: false,
        message: "Mission is already active"
      };
    }

    // Assign routes to drones
    let assignedCount = 0;
    for (const [droneId, routeId] of Object.entries(mission.droneAssignments)) {
      const result = droneCommander.assignRoute(droneId, routeId);
      if (result.success) {
        assignedCount++;
      } else {
        logger.warn(`[Mission Uploader] Failed to assign route ${routeId} to drone ${droneId}: ${result.message}`);
      }
    }

    if (assignedCount === 0) {
      return {
        success: false,
        message: "Failed to assign any routes to drones"
      };
    }

    this.activeMissions.add(missionId);
    
    logger.info(`[Mission Uploader] Mission ${mission.metadata.name} activated`, {
      missionId,
      routesAssigned: assignedCount
    });

    return {
      success: true,
      message: `Mission activated with ${assignedCount} route(s) assigned`
    };
  }

  /**
   * Deactivate mission
   */
  deactivateMission(missionId: string): boolean {
    if (!this.activeMissions.has(missionId)) {
      return false;
    }

    this.activeMissions.delete(missionId);
    logger.info(`[Mission Uploader] Mission ${missionId} deactivated`);
    
    return true;
  }

  /**
   * Check if mission is active
   */
  isMissionActive(missionId: string): boolean {
    return this.activeMissions.has(missionId);
  }

  /**
   * Get active missions
   */
  getActiveMissions(): Mission[] {
    return Array.from(this.activeMissions)
      .map(id => this.missions.get(id))
      .filter((m): m is Mission => m !== undefined);
  }

  /**
   * Export mission to JSON
   */
  exportMission(missionId: string): string | null {
    const mission = this.missions.get(missionId);
    if (!mission) {
      return null;
    }

    return JSON.stringify(mission, null, 2);
  }

  /**
   * Create mission template
   */
  createTemplate(name: string): Mission {
    return {
      metadata: {
        id: `mission_${Date.now()}`,
        name,
        description: "Mission template",
        author: "System",
        createdAt: new Date(),
        version: "1.0.0",
        tags: ["template"]
      },
      config: {
        maxFlightTime: 30,
        returnHomeOnLowBattery: true,
        lowBatteryThreshold: 20,
        autoLand: true,
        emergencyProcedure: "return_home"
      },
      routes: [],
      droneAssignments: {}
    };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalMissions: number;
    activeMissions: number;
    totalRoutes: number;
    averageRoutesPerMission: number;
  } {
    const missions = Array.from(this.missions.values());
    const totalRoutes = missions.reduce((sum, m) => sum + m.routes.length, 0);

    return {
      totalMissions: missions.length,
      activeMissions: this.activeMissions.size,
      totalRoutes,
      averageRoutesPerMission: missions.length > 0 ? totalRoutes / missions.length : 0
    };
  }

  /**
   * Clear all missions
   */
  clear(): void {
    this.missions.clear();
    this.activeMissions.clear();
    logger.info("[Mission Uploader] All missions cleared");
  }
}

// Export singleton instance
export const missionUploader = new MissionUploader();
