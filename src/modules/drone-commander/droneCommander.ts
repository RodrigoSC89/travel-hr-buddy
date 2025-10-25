/**
 * PATCH 172.0 - Drone Commander
 * Controls and commands UAV drones with pre-programmed routes
 * Supports up to 5 simultaneous drones
 */

import { logger } from "@/lib/logger";

export interface DronePosition {
  latitude: number;
  longitude: number;
  altitude: number; // meters
  heading: number; // degrees 0-360
}

export interface DroneWaypoint {
  id: string;
  position: DronePosition;
  action?: "hover" | "capture_image" | "scan" | "wait";
  duration?: number; // seconds
  order: number;
}

export interface DroneRoute {
  id: string;
  name: string;
  waypoints: DroneWaypoint[];
  loopMode: boolean;
  maxSpeed: number; // m/s
  minAltitude: number; // meters
  maxAltitude: number; // meters
}

export interface DroneCommand {
  id: string;
  droneId: string;
  type: "takeoff" | "land" | "goto" | "hover" | "return_home" | "emergency_stop" | "follow_route";
  timestamp: Date;
  parameters?: Record<string, any>;
  status: "pending" | "executing" | "completed" | "failed";
}

export interface DroneStatus {
  id: string;
  name: string;
  status: "idle" | "flying" | "hovering" | "landing" | "takeoff" | "emergency" | "offline";
  position: DronePosition;
  battery: number; // percentage
  signal: number; // percentage
  speed: number; // m/s
  connectedSince: Date;
  lastUpdate: Date;
  activeRoute?: string;
  currentWaypoint?: number;
}

export interface DroneCommandResult {
  success: boolean;
  commandId: string;
  droneId: string;
  message: string;
  timestamp: Date;
}

class DroneCommander {
  private drones: Map<string, DroneStatus> = new Map();
  private routes: Map<string, DroneRoute> = new Map();
  private commandQueue: Map<string, DroneCommand[]> = new Map();
  private commandHistory: DroneCommand[] = [];
  private maxDrones = 5;
  private maxCommandHistory = 100;

  /**
   * Register a new drone
   */
  registerDrone(drone: Omit<DroneStatus, "connectedSince" | "lastUpdate">): boolean {
    if (this.drones.size >= this.maxDrones) {
      logger.error(`[Drone Commander] Maximum drones (${this.maxDrones}) already registered`);
      return false;
    }

    if (this.drones.has(drone.id)) {
      logger.warn(`[Drone Commander] Drone ${drone.id} already registered`);
      return false;
    }

    const status: DroneStatus = {
      ...drone,
      connectedSince: new Date(),
      lastUpdate: new Date()
    };

    this.drones.set(drone.id, status);
    this.commandQueue.set(drone.id, []);

    logger.info(`[Drone Commander] Drone ${drone.id} registered successfully`);
    return true;
  }

  /**
   * Unregister a drone
   */
  unregisterDrone(droneId: string): boolean {
    if (!this.drones.has(droneId)) {
      logger.warn(`[Drone Commander] Drone ${droneId} not found`);
      return false;
    }

    this.drones.delete(droneId);
    this.commandQueue.delete(droneId);

    logger.info(`[Drone Commander] Drone ${droneId} unregistered`);
    return true;
  }

  /**
   * Send command to drone
   */
  sendCommand(
    droneId: string,
    type: DroneCommand["type"],
    parameters?: Record<string, any>
  ): DroneCommandResult {
    const drone = this.drones.get(droneId);
    
    if (!drone) {
      return {
        success: false,
        commandId: "",
        droneId,
        message: `Drone ${droneId} not found`,
        timestamp: new Date()
      };
    }

    if (drone.status === "offline") {
      return {
        success: false,
        commandId: "",
        droneId,
        message: "Drone is offline",
        timestamp: new Date()
      };
    }

    const command: DroneCommand = {
      id: `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      droneId,
      type,
      timestamp: new Date(),
      parameters,
      status: "pending"
    };

    // Add to queue
    const queue = this.commandQueue.get(droneId) || [];
    queue.push(command);
    this.commandQueue.set(droneId, queue);

    // Add to history
    this.commandHistory.unshift(command);
    if (this.commandHistory.length > this.maxCommandHistory) {
      this.commandHistory = this.commandHistory.slice(0, this.maxCommandHistory);
    }

    logger.info(`[Drone Commander] Command ${type} sent to drone ${droneId}`, {
      commandId: command.id,
      parameters
    });

    // Simulate command execution
    this.executeCommand(command);

    return {
      success: true,
      commandId: command.id,
      droneId,
      message: `Command ${type} queued successfully`,
      timestamp: new Date()
    };
  }

  /**
   * Execute command (simulated)
   */
  private async executeCommand(command: DroneCommand): Promise<void> {
    // Mark as executing
    command.status = "executing";

    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const drone = this.drones.get(command.droneId);
    if (!drone) {
      command.status = "failed";
      return;
    }

    // Update drone status based on command
    switch (command.type) {
      case "takeoff":
        drone.status = "takeoff";
        setTimeout(() => {
          if (drone.status === "takeoff") {
            drone.status = "flying";
            drone.position.altitude = 50; // Default takeoff altitude
          }
        }, 3000);
        break;

      case "land":
        drone.status = "landing";
        setTimeout(() => {
          if (drone.status === "landing") {
            drone.status = "idle";
            drone.position.altitude = 0;
          }
        }, 3000);
        break;

      case "hover":
        drone.status = "hovering";
        break;

      case "goto":
        if (command.parameters?.position) {
          drone.status = "flying";
          // In a real implementation, would navigate to position
          const target = command.parameters.position as DronePosition;
          drone.position = { ...target };
        }
        break;

      case "return_home":
        drone.status = "flying";
        // Would navigate to home position
        break;

      case "emergency_stop":
        drone.status = "emergency";
        drone.speed = 0;
        break;

      case "follow_route":
        if (command.parameters?.routeId) {
          const route = this.routes.get(command.parameters.routeId);
          if (route) {
            drone.activeRoute = route.id;
            drone.currentWaypoint = 0;
            drone.status = "flying";
          }
        }
        break;
    }

    drone.lastUpdate = new Date();
    command.status = "completed";

    logger.info(`[Drone Commander] Command ${command.type} completed for drone ${command.droneId}`);
  }

  /**
   * Define a new route
   */
  defineRoute(route: DroneRoute): boolean {
    if (this.routes.has(route.id)) {
      logger.warn(`[Drone Commander] Route ${route.id} already exists`);
      return false;
    }

    // Validate waypoints
    if (route.waypoints.length === 0) {
      logger.error("[Drone Commander] Route must have at least one waypoint");
      return false;
    }

    // Sort waypoints by order
    route.waypoints.sort((a, b) => a.order - b.order);

    this.routes.set(route.id, route);
    logger.info(`[Drone Commander] Route ${route.id} defined with ${route.waypoints.length} waypoints`);
    
    return true;
  }

  /**
   * Get route by ID
   */
  getRoute(routeId: string): DroneRoute | null {
    return this.routes.get(routeId) || null;
  }

  /**
   * List all routes
   */
  listRoutes(): DroneRoute[] {
    return Array.from(this.routes.values());
  }

  /**
   * Delete route
   */
  deleteRoute(routeId: string): boolean {
    if (!this.routes.has(routeId)) {
      return false;
    }

    // Check if any drone is following this route
    const dronesOnRoute = Array.from(this.drones.values()).filter(
      d => d.activeRoute === routeId
    );

    if (dronesOnRoute.length > 0) {
      logger.warn(
        `[Drone Commander] Cannot delete route ${routeId} - ${dronesOnRoute.length} drone(s) using it`
      );
      return false;
    }

    this.routes.delete(routeId);
    logger.info(`[Drone Commander] Route ${routeId} deleted`);
    return true;
  }

  /**
   * Assign route to drone
   */
  assignRoute(droneId: string, routeId: string): DroneCommandResult {
    const route = this.routes.get(routeId);
    if (!route) {
      return {
        success: false,
        commandId: "",
        droneId,
        message: `Route ${routeId} not found`,
        timestamp: new Date()
      };
    }

    return this.sendCommand(droneId, "follow_route", { routeId });
  }

  /**
   * Get drone status
   */
  getDroneStatus(droneId: string): DroneStatus | null {
    return this.drones.get(droneId) || null;
  }

  /**
   * List all drones
   */
  listDrones(): DroneStatus[] {
    return Array.from(this.drones.values());
  }

  /**
   * Get command history for a drone
   */
  getDroneCommandHistory(droneId: string, limit: number = 20): DroneCommand[] {
    return this.commandHistory
      .filter(cmd => cmd.droneId === droneId)
      .slice(0, limit);
  }

  /**
   * Get all command history
   */
  getAllCommandHistory(limit: number = 50): DroneCommand[] {
    return this.commandHistory.slice(0, limit);
  }

  /**
   * Update drone telemetry (called by telemetry stream)
   */
  updateTelemetry(droneId: string, updates: Partial<DroneStatus>): void {
    const drone = this.drones.get(droneId);
    if (!drone) {
      return;
    }

    Object.assign(drone, updates, { lastUpdate: new Date() });
  }

  /**
   * Emergency stop all drones
   */
  emergencyStopAll(): void {
    logger.warn("[Drone Commander] EMERGENCY STOP ALL initiated");
    
    this.drones.forEach((drone, droneId) => {
      this.sendCommand(droneId, "emergency_stop");
    });
  }

  /**
   * Get fleet statistics
   */
  getFleetStatistics(): {
    total: number;
    active: number;
    idle: number;
    offline: number;
    emergency: number;
    averageBattery: number;
    averageSignal: number;
  } {
    const drones = Array.from(this.drones.values());
    
    const stats = {
      total: drones.length,
      active: drones.filter(d => d.status === "flying" || d.status === "hovering").length,
      idle: drones.filter(d => d.status === "idle").length,
      offline: drones.filter(d => d.status === "offline").length,
      emergency: drones.filter(d => d.status === "emergency").length,
      averageBattery: drones.reduce((sum, d) => sum + d.battery, 0) / (drones.length || 1),
      averageSignal: drones.reduce((sum, d) => sum + d.signal, 0) / (drones.length || 1)
    };

    return stats;
  }

  /**
   * Check drone health and send warnings
   */
  checkHealth(): { droneId: string; issue: string }[] {
    const issues: { droneId: string; issue: string }[] = [];

    this.drones.forEach((drone, droneId) => {
      if (drone.battery < 20) {
        issues.push({
          droneId,
          issue: `Low battery: ${drone.battery}%`
        });
      }

      if (drone.signal < 30) {
        issues.push({
          droneId,
          issue: `Weak signal: ${drone.signal}%`
        });
      }

      const timeSinceUpdate = Date.now() - drone.lastUpdate.getTime();
      if (timeSinceUpdate > 60000) { // 1 minute
        issues.push({
          droneId,
          issue: "No telemetry update for over 1 minute"
        });
      }
    });

    if (issues.length > 0) {
      logger.warn("[Drone Commander] Health issues detected", issues);
    }

    return issues;
  }

  /**
   * Reset commander state
   */
  reset(): void {
    this.drones.clear();
    this.routes.clear();
    this.commandQueue.clear();
    this.commandHistory = [];
    logger.info("[Drone Commander] Reset completed");
  }
}

// Export singleton instance
export const droneCommander = new DroneCommander();
