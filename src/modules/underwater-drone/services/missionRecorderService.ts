/**
 * PATCH 533 - Mission Recorder Service
 * Records drone commands and trajectories for later replay and analysis
 */

import { logger } from "@/lib/logger";
import type { DronePosition } from "../droneSubCore";

export interface RecordedCommand {
  timestamp: number;
  type: "movement" | "depth_change" | "orientation" | "system";
  command: string;
  parameters: Record<string, any>;
  position: DronePosition;
}

export interface RecordedTrajectory {
  timestamp: number;
  position: DronePosition;
  velocity: {
    forward: number;
    lateral: number;
    vertical: number;
  };
  orientation: {
    pitch: number;
    roll: number;
    yaw: number;
  };
  telemetry: {
    battery: number;
    temperature: number;
    pressure: number;
    signalStrength: number;
  };
}

export interface MissionRecording {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  commands: RecordedCommand[];
  trajectory: RecordedTrajectory[];
  metadata: {
    missionType: string;
    droneId: string;
    operator: string;
    status: "recording" | "completed" | "aborted";
  };
  analysis?: MissionAnalysis;
}

export interface MissionAnalysis {
  totalDistance: number; // meters
  avgDepth: number; // meters
  maxDepth: number; // meters
  avgSpeed: number; // m/s
  energyUsed: number; // percentage
  attentionPoints: AttentionPoint[];
  summary: string;
}

export interface AttentionPoint {
  timestamp: number;
  position: DronePosition;
  type: "anomaly" | "rapid_movement" | "depth_change" | "system_warning" | "poi";
  severity: "low" | "medium" | "high";
  description: string;
}

class MissionRecorderService {
  private currentRecording: MissionRecording | null = null;
  private isRecording: boolean = false;
  private recordingInterval: NodeJS.Timeout | null = null;
  private trajectoryUpdateRate: number = 100; // ms

  /**
   * Start recording a mission
   */
  startRecording(missionName: string, droneId: string, operator: string): MissionRecording {
    if (this.isRecording) {
      throw new Error("Already recording a mission");
    }

    this.currentRecording = {
      id: `mission-${Date.now()}`,
      name: missionName,
      startTime: Date.now(),
      commands: [],
      trajectory: [],
      metadata: {
        missionType: "standard",
        droneId,
        operator,
        status: "recording",
      },
    };

    this.isRecording = true;
    logger.info("Mission recording started", { 
      id: this.currentRecording.id, 
      name: missionName 
    });

    return this.currentRecording;
  }

  /**
   * Stop recording and analyze the mission
   */
  stopRecording(): MissionRecording | null {
    if (!this.isRecording || !this.currentRecording) {
      return null;
    }

    this.currentRecording.endTime = Date.now();
    this.currentRecording.duration = 
      (this.currentRecording.endTime - this.currentRecording.startTime) / 1000; // seconds
    this.currentRecording.metadata.status = "completed";

    // Analyze the mission
    this.currentRecording.analysis = this.analyzeMission(this.currentRecording);

    this.isRecording = false;
    logger.info("Mission recording stopped", {
      id: this.currentRecording.id,
      duration: this.currentRecording.duration,
    });

    const recording = this.currentRecording;
    this.currentRecording = null;

    return recording;
  }

  /**
   * Record a command during the mission
   */
  recordCommand(
    type: RecordedCommand["type"],
    command: string,
    parameters: Record<string, any>,
    position: DronePosition
  ): void {
    if (!this.isRecording || !this.currentRecording) {
      return;
    }

    const recordedCommand: RecordedCommand = {
      timestamp: Date.now(),
      type,
      command,
      parameters,
      position,
    };

    this.currentRecording.commands.push(recordedCommand);
    logger.debug("Command recorded", recordedCommand);
  }

  /**
   * Record a trajectory point
   */
  recordTrajectory(
    position: DronePosition,
    velocity: RecordedTrajectory["velocity"],
    orientation: RecordedTrajectory["orientation"],
    telemetry: RecordedTrajectory["telemetry"]
  ): void {
    if (!this.isRecording || !this.currentRecording) {
      return;
    }

    const trajectoryPoint: RecordedTrajectory = {
      timestamp: Date.now(),
      position,
      velocity,
      orientation,
      telemetry,
    };

    this.currentRecording.trajectory.push(trajectoryPoint);
  }

  /**
   * Analyze a completed mission
   */
  private analyzeMission(recording: MissionRecording): MissionAnalysis {
    const trajectory = recording.trajectory;
    
    if (trajectory.length === 0) {
      return {
        totalDistance: 0,
        avgDepth: 0,
        maxDepth: 0,
        avgSpeed: 0,
        energyUsed: 0,
        attentionPoints: [],
        summary: "No trajectory data available",
      };
    }

    // Calculate total distance
    let totalDistance = 0;
    for (let i = 1; i < trajectory.length; i++) {
      const prev = trajectory[i - 1].position;
      const curr = trajectory[i].position;
      const dist = this.calculateDistance(prev, curr);
      totalDistance += dist;
    }

    // Calculate average and max depth
    const depths = trajectory.map(t => t.position.depth);
    const avgDepth = depths.reduce((sum, d) => sum + d, 0) / depths.length;
    const maxDepth = Math.max(...depths);

    // Calculate average speed
    const speeds = trajectory.map(t => {
      const v = t.velocity;
      return Math.sqrt(v.forward ** 2 + v.lateral ** 2 + v.vertical ** 2);
    });
    const avgSpeed = speeds.reduce((sum, s) => sum + s, 0) / speeds.length;

    // Estimate energy used based on battery
    const startBattery = trajectory[0].telemetry.battery;
    const endBattery = trajectory[trajectory.length - 1].telemetry.battery;
    const energyUsed = startBattery - endBattery;

    // Find attention points
    const attentionPoints = this.findAttentionPoints(trajectory, recording.commands);

    // Generate summary
    const summary = this.generateMissionSummary({
      totalDistance,
      avgDepth,
      maxDepth,
      avgSpeed,
      energyUsed,
      attentionPoints,
    });

    return {
      totalDistance,
      avgDepth,
      maxDepth,
      avgSpeed,
      energyUsed,
      attentionPoints,
      summary,
    });
  }

  /**
   * Calculate distance between two positions
   */
  private calculateDistance(pos1: DronePosition, pos2: DronePosition): number {
    // Simplified 3D distance calculation
    const dx = (pos2.lat - pos1.lat) * 111000; // Rough meters
    const dy = (pos2.lon - pos1.lon) * 111000 * Math.cos(pos1.lat * Math.PI / 180);
    const dz = pos2.depth - pos1.depth;
    
    return Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
  }

  /**
   * Find points of interest and anomalies
   */
  private findAttentionPoints(
    trajectory: RecordedTrajectory[],
    commands: RecordedCommand[]
  ): AttentionPoint[] {
    const points: AttentionPoint[] = [];

    // Check for rapid depth changes
    for (let i = 1; i < trajectory.length; i++) {
      const depthChange = Math.abs(trajectory[i].position.depth - trajectory[i - 1].position.depth);
      const timeDiff = (trajectory[i].timestamp - trajectory[i - 1].timestamp) / 1000;
      const depthRate = depthChange / timeDiff;

      if (depthRate > 5) { // More than 5m/s
        points.push({
          timestamp: trajectory[i].timestamp,
          position: trajectory[i].position,
          type: "rapid_movement",
          severity: "high",
          description: `Rapid depth change: ${depthRate.toFixed(1)} m/s`,
        });
      }
    }

    // Check for low battery events
    trajectory.forEach((point, i) => {
      if (point.telemetry.battery < 20 && (i === 0 || trajectory[i - 1].telemetry.battery >= 20)) {
        points.push({
          timestamp: point.timestamp,
          position: point.position,
          type: "system_warning",
          severity: "high",
          description: `Low battery: ${point.telemetry.battery.toFixed(0)}%`,
        });
      }
    });

    // Check for temperature warnings
    trajectory.forEach((point, i) => {
      if (point.telemetry.temperature > 40) {
        points.push({
          timestamp: point.timestamp,
          position: point.position,
          type: "system_warning",
          severity: "medium",
          description: `High temperature: ${point.telemetry.temperature.toFixed(1)}°C`,
        });
      }
    });

    return points.sort((a, b) => b.severity.localeCompare(a.severity));
  }

  /**
   * Generate mission summary
   */
  private generateMissionSummary(analysis: Omit<MissionAnalysis, "summary">): string {
    const parts = [
      `Mission covered ${analysis.totalDistance.toFixed(0)}m`,
      `Average depth: ${analysis.avgDepth.toFixed(1)}m`,
      `Maximum depth: ${analysis.maxDepth.toFixed(1)}m`,
      `Average speed: ${analysis.avgSpeed.toFixed(2)}m/s`,
      `Energy consumed: ${analysis.energyUsed.toFixed(1)}%`,
    ];

    if (analysis.attentionPoints.length > 0) {
      parts.push(`${analysis.attentionPoints.length} attention points detected`);
    }

    return parts.join(". ") + ".";
  }

  /**
   * Check if currently recording
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get current recording
   */
  getCurrentRecording(): MissionRecording | null {
    return this.currentRecording;
  }
}

export const missionRecorderService = new MissionRecorderService();
