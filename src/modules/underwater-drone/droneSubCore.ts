/**
 * PATCH 181.0 - Underwater Drone Core
 * 3D Movement Logic for ROV/AUV
 * 
 * Handles:
 * - Pitch, yaw, roll control
 * - Depth control
 * - Thruster management
 * - Position tracking
 */

export interface DronePosition {
  lat: number;
  lon: number;
  depth: number; // meters below surface
  altitude: number; // meters above seafloor
}

export interface DroneOrientation {
  pitch: number; // degrees (-90 to 90)
  yaw: number; // degrees (0 to 360)
  roll: number; // degrees (-180 to 180)
}

export interface ThrusterState {
  forward: number; // -100 to 100
  lateral: number; // -100 to 100
  vertical: number; // -100 to 100
  rotation: number; // -100 to 100
}

export interface DroneState {
  position: DronePosition;
  orientation: DroneOrientation;
  thrusters: ThrusterState;
  speed: number; // knots
  heading: number; // degrees
  status: "idle" | "moving" | "hovering" | "ascending" | "descending" | "emergency";
}

export interface MovementCommand {
  type: "move" | "rotate" | "depth" | "hover" | "surface" | "emergency_stop";
  target?: Partial<DronePosition>;
  orientation?: Partial<DroneOrientation>;
  speed?: number;
}

class DroneSubCore {
  private state: DroneState;
  private maxDepth = 500; // meters
  private maxSpeed = 5; // knots
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(initialPosition: DronePosition) {
    this.state = {
      position: initialPosition,
      orientation: { pitch: 0, yaw: 0, roll: 0 },
      thrusters: { forward: 0, lateral: 0, vertical: 0, rotation: 0 },
      speed: 0,
      heading: 0,
      status: "idle",
    };
  }

  /**
   * Get current drone state
   */
  getState(): DroneState {
    return { ...this.state };
  }

  /**
   * Execute movement command
   */
  executeCommand(command: MovementCommand): void {
    switch (command.type) {
    case "move":
      this.moveTo(command.target!, command.speed || 2);
      break;
    case "rotate":
      this.rotateTo(command.orientation!);
      break;
    case "depth":
      this.changeDepth(command.target?.depth || 0);
      break;
    case "hover":
      this.hover();
      break;
    case "surface":
      this.surface();
      break;
    case "emergency_stop":
      this.emergencyStop();
      break;
    }
  }

  /**
   * Move drone to target position
   */
  private moveTo(target: Partial<DronePosition>, speed: number): void {
    this.state.status = "moving";
    this.state.speed = Math.min(speed, this.maxSpeed);

    // Calculate direction
    if (target.lat !== undefined && target.lon !== undefined) {
      const deltaLat = target.lat - this.state.position.lat;
      const deltaLon = target.lon - this.state.position.lon;
      this.state.heading = (Math.atan2(deltaLon, deltaLat) * 180) / Math.PI;
      
      // Set thruster power based on direction
      this.state.thrusters.forward = 70;
      this.state.thrusters.rotation = 0;
    }

    if (target.depth !== undefined) {
      this.changeDepth(target.depth);
    }
  }

  /**
   * Rotate drone to target orientation
   */
  private rotateTo(orientation: Partial<DroneOrientation>): void {
    if (orientation.yaw !== undefined) {
      const delta = orientation.yaw - this.state.orientation.yaw;
      this.state.thrusters.rotation = Math.sign(delta) * 50;
    }
    
    if (orientation.pitch !== undefined) {
      const delta = orientation.pitch - this.state.orientation.pitch;
      this.state.thrusters.vertical = Math.sign(delta) * 30;
    }

    if (orientation.roll !== undefined) {
      // Adjust lateral thrusters for roll compensation
      this.state.thrusters.lateral = Math.sign(orientation.roll) * 20;
    }
  }

  /**
   * Change depth (positive = deeper, negative = shallower)
   */
  private changeDepth(targetDepth: number): void {
    const safeDepth = Math.max(0, Math.min(targetDepth, this.maxDepth));
    const delta = safeDepth - this.state.position.depth;

    if (delta > 0) {
      this.state.status = "descending";
      this.state.thrusters.vertical = -60; // Negative for down
    } else if (delta < 0) {
      this.state.status = "ascending";
      this.state.thrusters.vertical = 60; // Positive for up
    } else {
      this.state.status = "hovering";
      this.state.thrusters.vertical = 0;
    }
  }

  /**
   * Hover at current position
   */
  private hover(): void {
    this.state.status = "hovering";
    this.state.thrusters.forward = 0;
    this.state.thrusters.lateral = 0;
    this.state.thrusters.vertical = 0;
    this.state.thrusters.rotation = 0;
    this.state.speed = 0;
  }

  /**
   * Surface drone (emergency or end of mission)
   */
  private surface(): void {
    this.state.status = "ascending";
    this.state.thrusters.vertical = 100; // Maximum upward thrust
    this.state.thrusters.forward = 0;
    this.state.thrusters.lateral = 0;
  }

  /**
   * Emergency stop - all thrusters to zero
   */
  private emergencyStop(): void {
    this.state.status = "emergency";
    this.state.thrusters.forward = 0;
    this.state.thrusters.lateral = 0;
    this.state.thrusters.vertical = 0;
    this.state.thrusters.rotation = 0;
    this.state.speed = 0;
  }

  /**
   * Update drone state (physics simulation)
   */
  updateState(deltaTime: number): void {
    // Update position based on thrusters
    const speedFactor = this.state.speed / this.maxSpeed;
    const thrustFactor = this.state.thrusters.forward / 100;

    // Simplified physics - in production would use proper 3D physics engine
    if (this.state.thrusters.forward !== 0) {
      const radians = (this.state.heading * Math.PI) / 180;
      this.state.position.lat += Math.cos(radians) * speedFactor * deltaTime * 0.0001;
      this.state.position.lon += Math.sin(radians) * speedFactor * deltaTime * 0.0001;
    }

    // Update depth
    if (this.state.thrusters.vertical !== 0) {
      const depthChange = (this.state.thrusters.vertical / 100) * -2 * deltaTime;
      this.state.position.depth = Math.max(
        0,
        Math.min(this.maxDepth, this.state.position.depth + depthChange)
      );
    }

    // Update orientation
    if (this.state.thrusters.rotation !== 0) {
      const yawChange = (this.state.thrusters.rotation / 100) * 30 * deltaTime;
      this.state.orientation.yaw = (this.state.orientation.yaw + yawChange + 360) % 360;
    }

    // Auto-stabilize pitch and roll
    this.state.orientation.pitch *= 0.95;
    this.state.orientation.roll *= 0.95;

    // Update status
    if (this.state.position.depth < 0.5 && this.state.status === "ascending") {
      this.state.status = "idle";
      this.state.thrusters.vertical = 0;
    }
  }

  /**
   * Start automatic state updates
   */
  startSimulation(intervalMs: number = 100): void {
    this.stopSimulation();
    this.updateInterval = setInterval(() => {
      this.updateState(intervalMs / 1000);
    }, intervalMs);
  }

  /**
   * Stop automatic state updates
   */
  stopSimulation(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Calculate distance to target
   */
  distanceTo(target: DronePosition): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (this.state.position.lat * Math.PI) / 180;
    const φ2 = (target.lat * Math.PI) / 180;
    const Δφ = ((target.lat - this.state.position.lat) * Math.PI) / 180;
    const Δλ = ((target.lon - this.state.position.lon) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const horizontalDistance = R * c;
    const depthDiff = Math.abs(this.state.position.depth - target.depth);

    return Math.sqrt(horizontalDistance * horizontalDistance + depthDiff * depthDiff);
  }
}

export default DroneSubCore;
