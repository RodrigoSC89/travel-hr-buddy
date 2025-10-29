// PATCH 487.0 - Drone Simulator
// Realistic UAV simulation with battery drain, signal fluctuation, and auto-landing

export interface DroneStatus {
  id: string;
  name: string;
  status: "idle" | "flying" | "hovering" | "returning" | "landing" | "offline";
  battery: number; // 0-100%
  altitude: number; // meters
  speed: number; // m/s
  signal: number; // 0-100%
  latitude: number;
  longitude: number;
  lastUpdate: string;
}

export interface CommandResult {
  success: boolean;
  message: string;
  executionTime: number;
  timestamp: string;
  droneId: string;
  command: string;
}

export type DroneCommand = 
  | "takeoff"
  | "land"
  | "hover"
  | "return_home"
  | "set_altitude"
  | "emergency_stop"
  | "go_to_waypoint";

class DroneSimulator {
  private drones: Map<string, DroneStatus> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private mqttConnected: boolean = false;

  constructor() {
    this.initializeDrones();
  }

  private initializeDrones() {
    // Initialize 5 UAVs with unique characteristics
    const droneDefinitions = [
      { id: "drone-001", name: "Alpha-1", lat: -23.55, lon: -46.63, battery: 95 },
      { id: "drone-002", name: "Bravo-2", lat: -23.56, lon: -46.64, battery: 78 },
      { id: "drone-003", name: "Charlie-3", lat: -23.54, lon: -46.62, battery: 62 },
      { id: "drone-004", name: "Delta-4", lat: -23.57, lon: -46.65, battery: 88 },
      { id: "drone-005", name: "Echo-5", lat: -23.53, lon: -46.61, battery: 42 },
    ];

    droneDefinitions.forEach((def) => {
      this.drones.set(def.id, {
        id: def.id,
        name: def.name,
        status: "idle",
        battery: def.battery,
        altitude: 0,
        speed: 0,
        signal: 100,
        latitude: def.lat,
        longitude: def.lon,
        lastUpdate: new Date().toISOString(),
      });
    });
  }

  public getDrones(): DroneStatus[] {
    return Array.from(this.drones.values());
  }

  public getDrone(id: string): DroneStatus | undefined {
    return this.drones.get(id);
  }

  public async sendCommand(
    droneId: string,
    command: DroneCommand,
    params?: { altitude?: number; latitude?: number; longitude?: number }
  ): Promise<CommandResult> {
    const startTime = Date.now();
    const drone = this.drones.get(droneId);

    if (!drone) {
      return {
        success: false,
        message: `Drone ${droneId} not found`,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        droneId,
        command,
      };
    }

    // Simulate network latency
    await this.simulateLatency();

    // Check battery for operations
    if (command !== "land" && command !== "emergency_stop" && drone.battery < 20) {
      return {
        success: false,
        message: `${drone.name}: Battery too low (${drone.battery}%). Auto-landing required.`,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        droneId,
        command,
      };
    }

    // Execute command
    let result: CommandResult;
    switch (command) {
      case "takeoff":
        result = await this.executeTakeoff(drone, startTime);
        break;
      case "land":
        result = await this.executeLand(drone, startTime);
        break;
      case "hover":
        result = await this.executeHover(drone, startTime);
        break;
      case "return_home":
        result = await this.executeReturnHome(drone, startTime);
        break;
      case "set_altitude":
        result = await this.executeSetAltitude(drone, params?.altitude || 0, startTime);
        break;
      case "emergency_stop":
        result = await this.executeEmergencyStop(drone, startTime);
        break;
      case "go_to_waypoint":
        result = await this.executeGoToWaypoint(
          drone,
          params?.latitude || drone.latitude,
          params?.longitude || drone.longitude,
          startTime
        );
        break;
      default:
        result = {
          success: false,
          message: `Unknown command: ${command}`,
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          droneId,
          command,
        };
    }

    // Update last update time
    drone.lastUpdate = new Date().toISOString();
    this.drones.set(droneId, drone);

    return result;
  }

  private async executeTakeoff(drone: DroneStatus, startTime: number): Promise<CommandResult> {
    if (drone.status === "flying" || drone.status === "hovering") {
      return {
        success: false,
        message: `${drone.name} is already airborne`,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        droneId: drone.id,
        command: "takeoff",
      };
    }

    drone.status = "flying";
    drone.altitude = 50; // Default takeoff altitude
    drone.speed = 5;
    drone.battery -= 2; // Battery consumption

    return {
      success: true,
      message: `${drone.name} taking off to ${drone.altitude}m`,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      droneId: drone.id,
      command: "takeoff",
    };
  }

  private async executeLand(drone: DroneStatus, startTime: number): Promise<CommandResult> {
    if (drone.status === "idle") {
      return {
        success: false,
        message: `${drone.name} is already on the ground`,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        droneId: drone.id,
        command: "land",
      };
    }

    drone.status = "landing";
    drone.speed = 2;
    
    // Simulate landing sequence
    setTimeout(() => {
      drone.status = "idle";
      drone.altitude = 0;
      drone.speed = 0;
      this.drones.set(drone.id, drone);
    }, 2000);

    return {
      success: true,
      message: `${drone.name} landing initiated`,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      droneId: drone.id,
      command: "land",
    };
  }

  private async executeHover(drone: DroneStatus, startTime: number): Promise<CommandResult> {
    if (drone.status !== "flying") {
      return {
        success: false,
        message: `${drone.name} must be flying to hover`,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        droneId: drone.id,
        command: "hover",
      };
    }

    drone.status = "hovering";
    drone.speed = 0;
    drone.battery -= 1;

    return {
      success: true,
      message: `${drone.name} hovering at ${drone.altitude}m`,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      droneId: drone.id,
      command: "hover",
    };
  }

  private async executeReturnHome(drone: DroneStatus, startTime: number): Promise<CommandResult> {
    if (drone.status === "idle") {
      return {
        success: false,
        message: `${drone.name} is already at home`,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        droneId: drone.id,
        command: "return_home",
      };
    }

    drone.status = "returning";
    drone.speed = 8;
    drone.battery -= 3;

    // Simulate return home sequence
    setTimeout(() => {
      drone.status = "landing";
      setTimeout(() => {
        drone.status = "idle";
        drone.altitude = 0;
        drone.speed = 0;
        this.drones.set(drone.id, drone);
      }, 2000);
    }, 3000);

    return {
      success: true,
      message: `${drone.name} returning to home base`,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      droneId: drone.id,
      command: "return_home",
    };
  }

  private async executeSetAltitude(
    drone: DroneStatus,
    targetAltitude: number,
    startTime: number
  ): Promise<CommandResult> {
    if (drone.status !== "flying" && drone.status !== "hovering") {
      return {
        success: false,
        message: `${drone.name} must be airborne to change altitude`,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        droneId: drone.id,
        command: "set_altitude",
      };
    }

    if (targetAltitude < 0 || targetAltitude > 500) {
      return {
        success: false,
        message: `Invalid altitude: ${targetAltitude}m (range: 0-500m)`,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        droneId: drone.id,
        command: "set_altitude",
      };
    }

    const oldAltitude = drone.altitude;
    drone.altitude = targetAltitude;
    drone.status = "flying";
    drone.speed = Math.abs(targetAltitude - oldAltitude) / 10;
    drone.battery -= 1;

    return {
      success: true,
      message: `${drone.name} adjusting altitude from ${oldAltitude}m to ${targetAltitude}m`,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      droneId: drone.id,
      command: "set_altitude",
    };
  }

  private async executeEmergencyStop(drone: DroneStatus, startTime: number): Promise<CommandResult> {
    drone.status = "landing";
    drone.speed = 0;
    
    // Immediate emergency landing
    setTimeout(() => {
      drone.status = "offline";
      drone.altitude = 0;
      drone.speed = 0;
      this.drones.set(drone.id, drone);
    }, 1000);

    return {
      success: true,
      message: `${drone.name} EMERGENCY STOP activated - immediate landing`,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      droneId: drone.id,
      command: "emergency_stop",
    };
  }

  private async executeGoToWaypoint(
    drone: DroneStatus,
    targetLat: number,
    targetLon: number,
    startTime: number
  ): Promise<CommandResult> {
    if (drone.status !== "flying" && drone.status !== "hovering") {
      return {
        success: false,
        message: `${drone.name} must be airborne to navigate`,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        droneId: drone.id,
        command: "go_to_waypoint",
      };
    }

    drone.status = "flying";
    drone.speed = 10;
    drone.battery -= 2;

    // Simulate gradual movement towards waypoint
    const steps = 10;
    const latStep = (targetLat - drone.latitude) / steps;
    const lonStep = (targetLon - drone.longitude) / steps;

    for (let i = 0; i < steps; i++) {
      setTimeout(() => {
        drone.latitude += latStep;
        drone.longitude += lonStep;
        this.drones.set(drone.id, drone);
      }, i * 500);
    }

    return {
      success: true,
      message: `${drone.name} navigating to waypoint (${targetLat.toFixed(4)}, ${targetLon.toFixed(4)})`,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      droneId: drone.id,
      command: "go_to_waypoint",
    };
  }

  private async simulateLatency(): Promise<void> {
    // Simulate network latency between 50-200ms
    const latency = Math.floor(Math.random() * 150) + 50;
    return new Promise((resolve) => setTimeout(resolve, latency));
  }

  public startSimulation(): void {
    if (this.updateInterval) {
      console.warn("Simulation already running");
      return;
    }

    console.log("Starting drone simulation...");
    this.mqttConnected = true;

    // Update drone states every 2 seconds
    this.updateInterval = setInterval(() => {
      this.updateDroneStates();
    }, 2000);
  }

  public stopSimulation(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      this.mqttConnected = false;
      console.log("Drone simulation stopped");
    }
  }

  public isMQTTConnected(): boolean {
    return this.mqttConnected;
  }

  private updateDroneStates(): void {
    this.drones.forEach((drone) => {
      // Battery drain
      if (drone.status !== "idle" && drone.status !== "offline") {
        drone.battery = Math.max(0, drone.battery - 0.5);

        // Auto-landing at low battery
        if (drone.battery < 20 && drone.status !== "landing") {
          console.log(`${drone.name}: Low battery! Auto-landing initiated.`);
          drone.status = "landing";
          setTimeout(() => {
            drone.status = "idle";
            drone.altitude = 0;
            drone.speed = 0;
            this.drones.set(drone.id, drone);
          }, 2000);
        }
      }

      // Signal fluctuation (85-100%)
      drone.signal = Math.floor(Math.random() * 15) + 85;

      // Natural battery recovery when idle
      if (drone.status === "idle" && drone.battery < 100) {
        drone.battery = Math.min(100, drone.battery + 0.1);
      }

      drone.lastUpdate = new Date().toISOString();
      this.drones.set(drone.id, drone);
    });
  }
}

// Singleton instance
export const droneSimulator = new DroneSimulator();
