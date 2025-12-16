/**
 * PATCH 539 - Drone Command Service
 * Centralized command service for submarine drones via MQTT WebSocket
 */

import mqtt, { MqttClient } from "mqtt";
import { logger } from "@/lib/logger";

const MQTT_URL = import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt";
const DRONE_TOPIC_PREFIX = "nautilus/drones";

export type DroneCommand = 
  | "move" 
  | "pause" 
  | "resume" 
  | "return" 
  | "dive" 
  | "surface" 
  | "scan" 
  | "emergency_stop";

export type DroneStatus = 
  | "idle" 
  | "active" 
  | "paused" 
  | "returning" 
  | "error" 
  | "offline";

export interface DroneState {
  id: string;
  name: string;
  status: DroneStatus;
  position?: {
    lat: number;
    lng: number;
    depth: number;
  };
  battery: number;
  signal: number;
  temperature?: number;
  lastUpdate: string;
  mission?: string;
  errors?: string[];
}

export interface CommandPayload {
  droneId: string;
  command: DroneCommand;
  params?: Record<string, any>;
  timestamp: string;
}

export interface CommandResponse {
  success: boolean;
  droneId: string;
  command: DroneCommand;
  message: string;
  timestamp: string;
}

export interface CommandValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Drone Command Service
 * Handles communication with submarine drones via MQTT
 */
export class DroneCommandService {
  private client: MqttClient | null = null;
  private drones: Map<string, DroneState> = new Map();
  private commandQueue: CommandPayload[] = [];
  private listeners: Set<(drones: DroneState[]) => void> = new Set();
  private connected: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize MQTT connection
   */
  private initialize() {
    try {
      this.client = mqtt.connect(MQTT_URL, {
        clientId: `drone-commander-${Math.random().toString(16).substr(2, 8)}`,
        clean: true,
        reconnectPeriod: 5000
      });

      this.client.on("connect", () => {
        this.connected = true;
        logger.info("Drone Commander connected to MQTT");
        
        // Subscribe to drone status updates
        this.client?.subscribe(`${DRONE_TOPIC_PREFIX}/+/status`, (err) => {
          if (err) {
            logger.error("Failed to subscribe to drone status:", err);
          }
        });

        // Subscribe to command responses
        this.client?.subscribe(`${DRONE_TOPIC_PREFIX}/+/response`, (err) => {
          if (err) {
            logger.error("Failed to subscribe to command responses:", err);
          }
        });
      });

      this.client.on("message", (topic, message) => {
        this.handleMessage(topic, message);
      });

      this.client.on("error", (error) => {
        logger.error("MQTT connection error:", error);
        this.connected = false;
      });

      this.client.on("close", () => {
        this.connected = false;
        logger.warn("MQTT connection closed");
      });
    } catch (error) {
      logger.error("Failed to initialize MQTT client:", error);
    }
  }

  /**
   * Handle incoming MQTT messages
   */
  private handleMessage(topic: string, message: Buffer) {
    try {
      const data = JSON.parse(message.toString());
      
      if (topic.includes("/status")) {
        this.updateDroneState(data);
      } else if (topic.includes("/response")) {
        this.handleCommandResponse(data);
      }
    } catch (error) {
      logger.error("Error handling MQTT message:", error);
    }
  }

  /**
   * Update drone state
   */
  private updateDroneState(stateData: Partial<DroneState> & { id: string }) {
    const existingState = this.drones.get(stateData.id);
    const updatedState: DroneState = {
      ...existingState,
      ...stateData,
      lastUpdate: new Date().toISOString()
    } as DroneState;

    this.drones.set(stateData.id, updatedState);
    this.notifyListeners();
  }

  /**
   * Handle command response
   */
  private handleCommandResponse(response: CommandResponse) {
    logger.info("Command response received:", response);
    
    if (!response.success) {
      logger.error(`Command failed for drone ${response.droneId}:`, response.message);
    }
  }

  /**
   * Validate command before sending
   */
  validateCommand(droneId: string, command: DroneCommand, params?: Record<string, any>): CommandValidationResult {
    const errors: string[] = [];
    const drone = this.drones.get(droneId);

    if (!drone) {
      errors.push("Drone not found or offline");
      return { valid: false, errors };
    }

    // Check drone status
    if (drone.status === "offline") {
      errors.push("Drone is offline");
    }

    if (drone.status === "error") {
      errors.push("Drone is in error state");
    }

    // Check battery level
    if (drone.battery < 10 && command !== "return" && command !== "emergency_stop") {
      errors.push("Battery too low for this operation (use 'return' command)");
    }

    // Check signal strength
    if (drone.signal < 20 && command !== "return" && command !== "emergency_stop") {
      errors.push("Signal too weak for safe operation");
    }

    // Validate move command
    if (command === "move") {
      if (!params?.target) {
        errors.push("Move command requires target position");
      }
      if (params?.target && !this.isValidPosition(params.target)) {
        errors.push("Invalid target position");
      }
    }

    // Validate dive command
    if (command === "dive") {
      const targetDepth = params?.depth || 0;
      if (targetDepth < 0 || targetDepth > 500) {
        errors.push("Dive depth must be between 0 and 500 meters");
      }
      if (drone.position && drone.position.depth >= 400 && targetDepth > drone.position.depth) {
        errors.push("Maximum safe depth reached");
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate position
   */
  private isValidPosition(position: any): boolean {
    if (!position || typeof position !== "object") return false;
    if (typeof position.lat !== "number" || typeof position.lng !== "number") return false;
    if (position.lat < -90 || position.lat > 90) return false;
    if (position.lng < -180 || position.lng > 180) return false;
    return true;
  }

  /**
   * Send command to drone
   */
  async sendCommand(
    droneId: string, 
    command: DroneCommand, 
    params?: Record<string, any>
  ): Promise<CommandResponse> {
    // Validate command
    const validation = this.validateCommand(droneId, command, params);
    if (!validation.valid) {
      logger.error("Command validation failed:", validation.errors);
      return {
        success: false,
        droneId,
        command,
        message: validation.errors.join("; "),
        timestamp: new Date().toISOString()
      };
    }

    if (!this.connected || !this.client) {
      logger.error("MQTT client not connected");
      return {
        success: false,
        droneId,
        command,
        message: "Not connected to MQTT broker",
        timestamp: new Date().toISOString()
      };
    }

    const payload: CommandPayload = {
      droneId,
      command,
      params,
      timestamp: new Date().toISOString()
    };

    return new Promise((resolve) => {
      const topic = `${DRONE_TOPIC_PREFIX}/${droneId}/command`;
      
      this.client?.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
        if (err) {
          logger.error("Failed to send command:", err);
          resolve({
            success: false,
            droneId,
            command,
            message: `Failed to send command: ${err.message}`,
            timestamp: new Date().toISOString()
          });
        } else {
          logger.info(`Command sent to ${droneId}:`, command);
          resolve({
            success: true,
            droneId,
            command,
            message: "Command sent successfully",
            timestamp: new Date().toISOString()
          });
        }
      });
    });
  }

  /**
   * Register mock drone (for testing)
   */
  registerMockDrone(drone: DroneState) {
    this.drones.set(drone.id, drone);
    this.notifyListeners();
  }

  /**
   * Get all drones
   */
  getDrones(): DroneState[] {
    return Array.from(this.drones.values());
  }

  /**
   * Get drone by ID
   */
  getDrone(droneId: string): DroneState | undefined {
    return this.drones.get(droneId);
  }

  /**
   * Subscribe to drone state updates
   */
  subscribe(listener: (drones: DroneState[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners() {
    const drones = this.getDrones();
    this.listeners.forEach(listener => {
      try {
        listener(drones);
      } catch (error) {
        logger.error("Error in listener:", error);
      }
    });
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Disconnect
   */
  disconnect() {
    if (this.client) {
      this.client.end();
      this.connected = false;
    }
  }

  /**
   * Clear all drones
   */
  clear() {
    this.drones.clear();
    this.notifyListeners();
  }
}

// Singleton instance
export const droneCommandService = new DroneCommandService();
