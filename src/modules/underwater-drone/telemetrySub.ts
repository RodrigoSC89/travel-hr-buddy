/**
 * PATCH 181.0 - Telemetry Subsystem
 * Monitors underwater drone sensors
 * 
 * Sensors:
 * - Depth sensor
 * - Orientation (IMU)
 * - Temperature
 * - Pressure
 * - Battery
 * - Communication signal
 */

import { DronePosition, DroneOrientation } from "./droneSubCore";

export interface TelemetryData {
  timestamp: string;
  depth: number; // meters
  temperature: number; // celsius
  pressure: number; // bar
  orientation: DroneOrientation;
  battery: BatteryStatus;
  communication: CommunicationStatus;
  environmental: EnvironmentalData;
}

export interface BatteryStatus {
  level: number; // 0-100%
  voltage: number; // volts
  current: number; // amps
  timeRemaining: number; // minutes
  charging: boolean;
}

export interface CommunicationStatus {
  signalStrength: number; // 0-100%
  latency: number; // milliseconds
  dataRate: number; // kbps
  connectionType: "tether" | "acoustic" | "satellite" | "none";
}

export interface EnvironmentalData {
  salinity: number; // ppt (parts per thousand)
  visibility: number; // meters
  currentSpeed: number; // knots
  currentDirection: number; // degrees
  turbidity: number; // NTU (Nephelometric Turbidity Units)
}

export interface TelemetryAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  type: "battery" | "depth" | "temperature" | "pressure" | "communication" | "environment";
  message: string;
  timestamp: string;
  value?: number;
  threshold?: number;
}

class TelemetrySub {
  private telemetry: TelemetryData;
  private alerts: TelemetryAlert[] = [];
  private alertCallback?: (alert: TelemetryAlert) => void;

  // Thresholds
  private readonly THRESHOLDS = {
    batteryLow: 20,
    batteryCritical: 10,
    depthMax: 500,
    depthWarning: 450,
    tempMax: 35,
    tempMin: -2,
    pressureMax: 50, // bar
    signalLow: 30,
  };

  constructor(initialPosition: DronePosition) {
    this.telemetry = {
      timestamp: new Date().toISOString(),
      depth: initialPosition.depth,
      temperature: this.simulateTemperature(initialPosition.depth),
      pressure: this.calculatePressure(initialPosition.depth),
      orientation: { pitch: 0, yaw: 0, roll: 0 },
      battery: {
        level: 100,
        voltage: 48.0,
        current: 0,
        timeRemaining: 240,
        charging: false,
      },
      communication: {
        signalStrength: 85,
        latency: 120,
        dataRate: 1500,
        connectionType: "tether",
      },
      environmental: {
        salinity: 35,
        visibility: 15,
        currentSpeed: 0.5,
        currentDirection: 180,
        turbidity: 5,
      },
    };
  }

  /**
   * Update telemetry data
   */
  updateTelemetry(
    position: DronePosition,
    orientation: DroneOrientation,
    thrusterLoad: number
  ): void {
    this.telemetry.timestamp = new Date().toISOString();
    this.telemetry.depth = position.depth;
    this.telemetry.orientation = orientation;
    this.telemetry.temperature = this.simulateTemperature(position.depth);
    this.telemetry.pressure = this.calculatePressure(position.depth);

    // Update battery based on thruster load
    this.updateBattery(thrusterLoad);

    // Update communication based on depth
    this.updateCommunication(position.depth);

    // Update environmental data
    this.updateEnvironmental(position);

    // Check for alerts
    this.checkAlerts();
  }

  /**
   * Get current telemetry data
   */
  getTelemetry(): TelemetryData {
    return { ...this.telemetry };
  }

  /**
   * Get active alerts
   */
  getAlerts(): TelemetryAlert[] {
    return [...this.alerts];
  }

  /**
   * Set alert callback
   */
  onAlert(callback: (alert: TelemetryAlert) => void): void {
    this.alertCallback = callback;
  }

  /**
   * Calculate pressure based on depth
   * Formula: P = P0 + ρgh
   * Where P0 = 1 bar (atmospheric), ρ = 1025 kg/m³ (seawater), g = 9.81 m/s²
   */
  private calculatePressure(depth: number): number {
    const atmosphericPressure = 1; // bar
    const waterDensity = 1025; // kg/m³
    const gravity = 9.81; // m/s²
    const pascalToBar = 100000; // 1 bar = 100000 Pa

    const pressure = atmosphericPressure + (waterDensity * gravity * depth) / pascalToBar;
    return Math.round(pressure * 100) / 100;
  }

  /**
   * Simulate water temperature (decreases with depth)
   */
  private simulateTemperature(depth: number): number {
    const surfaceTemp = 20; // °C
    const thermoclineDepth = 100; // meters
    const deepWaterTemp = 4; // °C

    if (depth < thermoclineDepth) {
      // Linear decrease in thermocline
      return surfaceTemp - ((surfaceTemp - deepWaterTemp) * depth) / thermoclineDepth;
    } else {
      // Stable deep water temperature
      return deepWaterTemp + Math.random() * 0.5 - 0.25; // Small variations
    }
  }

  /**
   * Update battery status
   */
  private updateBattery(thrusterLoad: number): void {
    const drainRate = 0.01 + thrusterLoad * 0.001; // % per update
    this.telemetry.battery.level = Math.max(0, this.telemetry.battery.level - drainRate);
    
    // Update voltage (drops with battery level)
    this.telemetry.battery.voltage = 42 + (this.telemetry.battery.level / 100) * 6;
    
    // Update current (proportional to thruster load)
    this.telemetry.battery.current = thrusterLoad * 0.5;
    
    // Calculate time remaining
    if (drainRate > 0) {
      this.telemetry.battery.timeRemaining = Math.floor(
        (this.telemetry.battery.level / drainRate) * 0.1
      );
    }
  }

  /**
   * Update communication status based on depth
   */
  private updateCommunication(depth: number): void {
    if (depth < 50) {
      // Shallow - good tether connection
      this.telemetry.communication.connectionType = "tether";
      this.telemetry.communication.signalStrength = 90 - depth * 0.2;
      this.telemetry.communication.latency = 50 + depth;
      this.telemetry.communication.dataRate = 2000 - depth * 10;
    } else if (depth < 200) {
      // Medium depth - acoustic modem
      this.telemetry.communication.connectionType = "acoustic";
      this.telemetry.communication.signalStrength = 70 - depth * 0.1;
      this.telemetry.communication.latency = 200 + depth * 2;
      this.telemetry.communication.dataRate = 100;
    } else {
      // Deep - limited or no connection
      this.telemetry.communication.connectionType = "acoustic";
      this.telemetry.communication.signalStrength = Math.max(10, 50 - depth * 0.05);
      this.telemetry.communication.latency = 500 + depth * 3;
      this.telemetry.communication.dataRate = 50;
    }
  }

  /**
   * Update environmental data
   */
  private updateEnvironmental(position: DronePosition): void {
    // Simulate realistic changes
    this.telemetry.environmental.salinity = 35 + Math.random() * 0.5 - 0.25;
    
    // Visibility decreases with depth and turbidity
    this.telemetry.environmental.visibility = Math.max(
      1,
      20 - position.depth * 0.05 - this.telemetry.environmental.turbidity
    );
    
    // Random current variations
    this.telemetry.environmental.currentSpeed = Math.max(
      0,
      0.5 + Math.random() * 1.0 - 0.5
    );
    this.telemetry.environmental.currentDirection =
      (this.telemetry.environmental.currentDirection + Math.random() * 10 - 5 + 360) % 360;
  }

  /**
   * Check for alert conditions
   */
  private checkAlerts(): void {
    const newAlerts: TelemetryAlert[] = [];

    // Battery alerts
    if (this.telemetry.battery.level <= this.THRESHOLDS.batteryCritical) {
      newAlerts.push(this.createAlert(
        "critical",
        "battery",
        `Critical battery level: ${this.telemetry.battery.level.toFixed(1)}%`,
        this.telemetry.battery.level,
        this.THRESHOLDS.batteryCritical
      ));
    } else if (this.telemetry.battery.level <= this.THRESHOLDS.batteryLow) {
      newAlerts.push(this.createAlert(
        "warning",
        "battery",
        `Low battery: ${this.telemetry.battery.level.toFixed(1)}%`,
        this.telemetry.battery.level,
        this.THRESHOLDS.batteryLow
      ));
    }

    // Depth alerts
    if (this.telemetry.depth >= this.THRESHOLDS.depthMax) {
      newAlerts.push(this.createAlert(
        "critical",
        "depth",
        `Maximum depth reached: ${this.telemetry.depth.toFixed(1)}m`,
        this.telemetry.depth,
        this.THRESHOLDS.depthMax
      ));
    } else if (this.telemetry.depth >= this.THRESHOLDS.depthWarning) {
      newAlerts.push(this.createAlert(
        "warning",
        "depth",
        `Approaching maximum depth: ${this.telemetry.depth.toFixed(1)}m`,
        this.telemetry.depth,
        this.THRESHOLDS.depthWarning
      ));
    }

    // Temperature alerts
    if (
      this.telemetry.temperature < this.THRESHOLDS.tempMin ||
      this.telemetry.temperature > this.THRESHOLDS.tempMax
    ) {
      newAlerts.push(this.createAlert(
        "warning",
        "temperature",
        `Temperature out of range: ${this.telemetry.temperature.toFixed(1)}°C`,
        this.telemetry.temperature
      ));
    }

    // Communication alerts
    if (this.telemetry.communication.signalStrength < this.THRESHOLDS.signalLow) {
      newAlerts.push(this.createAlert(
        "warning",
        "communication",
        `Weak signal: ${this.telemetry.communication.signalStrength.toFixed(0)}%`,
        this.telemetry.communication.signalStrength,
        this.THRESHOLDS.signalLow
      ));
    }

    // Add new alerts and notify
    newAlerts.forEach(alert => {
      this.alerts.unshift(alert);
      if (this.alertCallback) {
        this.alertCallback(alert);
      }
    });

    // Keep only last 50 alerts
    this.alerts = this.alerts.slice(0, 50);
  }

  /**
   * Create alert object
   */
  private createAlert(
    severity: TelemetryAlert["severity"],
    type: TelemetryAlert["type"],
    message: string,
    value?: number,
    threshold?: number
  ): TelemetryAlert {
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      severity,
      type,
      message,
      timestamp: new Date().toISOString(),
      value,
      threshold,
    };
  }

  /**
   * Clear old alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Get telemetry summary for logging
   */
  getSummary(): string {
    return `Depth: ${this.telemetry.depth.toFixed(1)}m | ` +
      `Temp: ${this.telemetry.temperature.toFixed(1)}°C | ` +
      `Battery: ${this.telemetry.battery.level.toFixed(0)}% | ` +
      `Signal: ${this.telemetry.communication.signalStrength.toFixed(0)}%`;
  }
}

export default TelemetrySub;
