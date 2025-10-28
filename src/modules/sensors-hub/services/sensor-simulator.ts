/**
 * PATCH 428 - Sensor Simulator
 * PATCH 441 - Enhanced with mock sensors (temperature, vibration, depth, pressure)
 */

import { sensorStream, type SensorData } from "../sensorStream";

export interface SensorConfig {
  id: string;
  name: string;
  type: "temperature" | "vibration" | "depth" | "pressure";
  unit: string;
  minValue: number;
  maxValue: number;
  anomalyThreshold: number;
}

export class SensorSimulator {
  private running = false;
  private intervals: NodeJS.Timeout[] = [];
  private sensors: SensorConfig[] = [
    {
      id: "temp-001",
      name: "Engine Temperature",
      type: "temperature",
      unit: "°C",
      minValue: 15,
      maxValue: 95,
      anomalyThreshold: 85,
    },
    {
      id: "vib-001",
      name: "Hull Vibration",
      type: "vibration",
      unit: "Hz",
      minValue: 0,
      maxValue: 50,
      anomalyThreshold: 40,
    },
    {
      id: "depth-001",
      name: "Water Depth",
      type: "depth",
      unit: "m",
      minValue: 5,
      maxValue: 500,
      anomalyThreshold: 450,
    },
    {
      id: "press-001",
      name: "Hydraulic Pressure",
      type: "pressure",
      unit: "bar",
      minValue: 0,
      maxValue: 350,
      anomalyThreshold: 320,
    },
  ];

  start() {
    if (this.running) return;
    
    this.running = true;
    
    // Start simulation for each sensor
    this.sensors.forEach((sensor) => {
      const interval = setInterval(() => {
        this.generateSensorData(sensor);
      }, 2000 + Math.random() * 1000); // Random interval 2-3 seconds
      
      this.intervals.push(interval);
    });
  }

  stop() {
    this.running = false;
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];
  }

  isRunning() {
    return this.running;
  }

  getSensors() {
    return this.sensors;
  }

  private generateSensorData(sensor: SensorConfig) {
    const baseValue = (sensor.minValue + sensor.maxValue) / 2;
    const variance = (sensor.maxValue - sensor.minValue) * 0.15;
    
    // Add occasional anomalies (5% chance)
    const isAnomaly = Math.random() < 0.05;
    const value = isAnomaly
      ? sensor.minValue + Math.random() * (sensor.maxValue - sensor.minValue)
      : baseValue + (Math.random() - 0.5) * variance;

    const data: SensorData = {
      sensorId: sensor.id,
      type: sensor.type === "temperature" ? "temperature" : 
            sensor.type === "pressure" ? "pressure" : "motion",
      value: Math.max(sensor.minValue, Math.min(sensor.maxValue, value)),
      unit: sensor.unit,
      timestamp: new Date(),
    };

    sensorStream.ingestData(data);
  }
}

export const sensorSimulator = new SensorSimulator();
