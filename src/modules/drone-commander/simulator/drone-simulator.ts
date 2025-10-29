/**
 * PATCH 487 - Drone Simulator
 * Simulates multiple drones with online/offline status and command responses
 */

import { supabase } from "@/integrations/supabase/client";
import type { DroneStatus } from "../types";

export interface DroneSimulation {
  id: string;
  name: string;
  model: string;
  status: "online" | "offline" | "flying" | "hovering" | "idle" | "emergency";
  battery: number;
  signal: number;
  position: {
    latitude: number;
    longitude: number;
    altitude: number;
    heading: number;
  };
  speed: number;
  lastUpdate: Date;
}

export interface CommandResponse {
  success: boolean;
  message: string;
  timestamp: Date;
  droneId: string;
  command: string;
  executionTime: number;
}

class DroneSimulator {
  private drones: Map<string, DroneSimulation> = new Map();
  private commandHistory: CommandResponse[] = [];
  private simulationInterval: NodeJS.Timeout | null = null;
  private mqttConnected: boolean = false;

  constructor() {
    this.initializeSimulation();
  }

  /**
   * Initialize simulated drone fleet
   */
  private initializeSimulation() {
    const simulatedDrones: DroneSimulation[] = [
      {
        id: "drone-001",
        name: "Alpha-1",
        model: "DJI Mavic 3",
        status: "online",
        battery: 95,
        signal: 98,
        position: {
          latitude: -23.5505,
          longitude: -46.6333,
          altitude: 0,
          heading: 0
        },
        speed: 0,
        lastUpdate: new Date()
      },
      {
        id: "drone-002",
        name: "Beta-2",
        model: "DJI Phantom 4",
        status: "flying",
        battery: 78,
        signal: 92,
        position: {
          latitude: -23.5515,
          longitude: -46.6343,
          altitude: 150,
          heading: 45
        },
        speed: 12,
        lastUpdate: new Date()
      },
      {
        id: "drone-003",
        name: "Gamma-3",
        model: "DJI Mavic 3",
        status: "hovering",
        battery: 65,
        signal: 88,
        position: {
          latitude: -23.5525,
          longitude: -46.6353,
          altitude: 200,
          heading: 90
        },
        speed: 0,
        lastUpdate: new Date()
      },
      {
        id: "drone-004",
        name: "Delta-4",
        model: "DJI Inspire 2",
        status: "idle",
        battery: 100,
        signal: 95,
        position: {
          latitude: -23.5535,
          longitude: -46.6363,
          altitude: 0,
          heading: 0
        },
        speed: 0,
        lastUpdate: new Date()
      },
      {
        id: "drone-005",
        name: "Epsilon-5",
        model: "DJI Matrice 300",
        status: "offline",
        battery: 0,
        signal: 0,
        position: {
          latitude: -23.5545,
          longitude: -46.6373,
          altitude: 0,
          heading: 0
        },
        speed: 0,
        lastUpdate: new Date()
      }
    ];

    simulatedDrones.forEach(drone => {
      this.drones.set(drone.id, drone);
    });
  }

  /**
   * Start simulation updates
   */
  startSimulation() {
    if (this.simulationInterval) return;

    this.simulationInterval = setInterval(() => {
      this.updateDrones();
    }, 2000); // Update every 2 seconds

    console.log("Drone simulation started");
  }

  /**
   * Stop simulation updates
   */
  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    console.log("Drone simulation stopped");
  }

  /**
   * Update drone states (simulate behavior)
   */
  private updateDrones() {
    this.drones.forEach((drone, id) => {
      // Skip offline drones
      if (drone.status === "offline") return;

      // Simulate battery drain
      if (drone.status === "flying") {
        drone.battery = Math.max(0, drone.battery - Math.random() * 0.5);
      } else if (drone.status === "hovering") {
        drone.battery = Math.max(0, drone.battery - Math.random() * 0.2);
      }

      // Simulate signal fluctuation
      drone.signal = Math.min(100, Math.max(70, drone.signal + (Math.random() - 0.5) * 5));

      // Simulate movement for flying drones
      if (drone.status === "flying") {
        drone.position.latitude += (Math.random() - 0.5) * 0.001;
        drone.position.longitude += (Math.random() - 0.5) * 0.001;
        drone.position.altitude += (Math.random() - 0.5) * 10;
        drone.position.heading = (drone.position.heading + (Math.random() - 0.5) * 10) % 360;
      }

      // Auto-land on low battery
      if (drone.battery < 20 && drone.status === "flying") {
        drone.status = "hovering";
        this.commandHistory.push({
          success: true,
          message: `Auto-landing initiated due to low battery (${drone.battery.toFixed(1)}%)`,
          timestamp: new Date(),
          droneId: id,
          command: "auto_land",
          executionTime: 0
        });
      }

      drone.lastUpdate = new Date();
    });
  }

  /**
   * Get all drones
   */
  getDrones(): DroneSimulation[] {
    return Array.from(this.drones.values());
  }

  /**
   * Get specific drone
   */
  getDrone(id: string): DroneSimulation | undefined {
    return this.drones.get(id);
  }

  /**
   * Send command to drone
   */
  async sendCommand(droneId: string, command: string, params?: any): Promise<CommandResponse> {
    const startTime = Date.now();
    const drone = this.drones.get(droneId);

    if (!drone) {
      return {
        success: false,
        message: `Drone ${droneId} not found`,
        timestamp: new Date(),
        droneId,
        command,
        executionTime: Date.now() - startTime
      };
    }

    if (drone.status === "offline") {
      return {
        success: false,
        message: `Drone ${drone.name} is offline`,
        timestamp: new Date(),
        droneId,
        command,
        executionTime: Date.now() - startTime
      };
    }

    // Simulate command execution delay (50-200ms)
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 150));

    let response: CommandResponse;

    switch (command) {
      case "takeoff":
        if (drone.status === "idle" || drone.status === "online") {
          drone.status = "flying";
          drone.position.altitude = 10;
          response = {
            success: true,
            message: `${drone.name} taking off`,
            timestamp: new Date(),
            droneId,
            command,
            executionTime: Date.now() - startTime
          };
        } else {
          response = {
            success: false,
            message: `${drone.name} cannot take off from current status: ${drone.status}`,
            timestamp: new Date(),
            droneId,
            command,
            executionTime: Date.now() - startTime
          };
        }
        break;

      case "land":
        if (drone.status === "flying" || drone.status === "hovering") {
          drone.status = "idle";
          drone.position.altitude = 0;
          drone.speed = 0;
          response = {
            success: true,
            message: `${drone.name} landing`,
            timestamp: new Date(),
            droneId,
            command,
            executionTime: Date.now() - startTime
          };
        } else {
          response = {
            success: false,
            message: `${drone.name} is not airborne`,
            timestamp: new Date(),
            droneId,
            command,
            executionTime: Date.now() - startTime
          };
        }
        break;

      case "return_home":
        if (drone.status === "flying" || drone.status === "hovering") {
          drone.status = "flying";
          // Simulate returning to home position
          response = {
            success: true,
            message: `${drone.name} returning to home`,
            timestamp: new Date(),
            droneId,
            command,
            executionTime: Date.now() - startTime
          };
        } else {
          response = {
            success: false,
            message: `${drone.name} cannot return home from current status`,
            timestamp: new Date(),
            droneId,
            command,
            executionTime: Date.now() - startTime
          };
        }
        break;

      case "emergency_stop":
        drone.status = "hovering";
        drone.speed = 0;
        response = {
          success: true,
          message: `EMERGENCY STOP - ${drone.name} hovering in place`,
          timestamp: new Date(),
          droneId,
          command,
          executionTime: Date.now() - startTime
        };
        break;

      case "hover":
        if (drone.status === "flying") {
          drone.status = "hovering";
          drone.speed = 0;
          response = {
            success: true,
            message: `${drone.name} hovering`,
            timestamp: new Date(),
            droneId,
            command,
            executionTime: Date.now() - startTime
          };
        } else {
          response = {
            success: false,
            message: `${drone.name} is not flying`,
            timestamp: new Date(),
            droneId,
            command,
            executionTime: Date.now() - startTime
          };
        }
        break;

      case "set_altitude":
        if (drone.status === "flying" || drone.status === "hovering") {
          const targetAltitude = params?.altitude || 100;
          drone.position.altitude = targetAltitude;
          response = {
            success: true,
            message: `${drone.name} adjusting altitude to ${targetAltitude}m`,
            timestamp: new Date(),
            droneId,
            command,
            executionTime: Date.now() - startTime
          };
        } else {
          response = {
            success: false,
            message: `${drone.name} must be airborne to adjust altitude`,
            timestamp: new Date(),
            droneId,
            command,
            executionTime: Date.now() - startTime
          };
        }
        break;

      case "go_to_waypoint":
        if (drone.status === "flying" || drone.status === "hovering") {
          if (params?.latitude && params?.longitude) {
            drone.status = "flying";
            // Would navigate to waypoint in real scenario
            response = {
              success: true,
              message: `${drone.name} navigating to waypoint (${params.latitude.toFixed(4)}, ${params.longitude.toFixed(4)})`,
              timestamp: new Date(),
              droneId,
              command,
              executionTime: Date.now() - startTime
            };
          } else {
            response = {
              success: false,
              message: `Invalid waypoint coordinates`,
              timestamp: new Date(),
              droneId,
              command,
              executionTime: Date.now() - startTime
            };
          }
        } else {
          response = {
            success: false,
            message: `${drone.name} must be airborne to navigate`,
            timestamp: new Date(),
            droneId,
            command,
            executionTime: Date.now() - startTime
          };
        }
        break;

      default:
        response = {
          success: false,
          message: `Unknown command: ${command}`,
          timestamp: new Date(),
          droneId,
          command,
          executionTime: Date.now() - startTime
        };
    }

    this.commandHistory.push(response);
    return response;
  }

  /**
   * Get command history
   */
  getCommandHistory(limit: number = 50): CommandResponse[] {
    return this.commandHistory.slice(-limit);
  }

  /**
   * Clear command history
   */
  clearCommandHistory() {
    this.commandHistory = [];
  }

  /**
   * Simulate MQTT connection
   */
  connectMQTT(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.mqttConnected = true;
        console.log("MQTT connection simulated");
        resolve(true);
      }, 500);
    });
  }

  /**
   * Check MQTT connection status
   */
  isMQTTConnected(): boolean {
    return this.mqttConnected;
  }

  /**
   * Disconnect MQTT
   */
  disconnectMQTT() {
    this.mqttConnected = false;
    console.log("MQTT disconnected");
  }
}

export const droneSimulator = new DroneSimulator();
