/**
 * Drone Mission Service - PATCH 450
 * Manages underwater drone missions and telemetry data persistence
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface DroneMission {
  id?: string;
  missionName: string;
  droneId: string;
  missionType: "survey" | "inspection" | "maintenance" | "research" | "emergency";
  plannedWaypoints: DroneTelemetryPoint[];
  actualTrajectory?: DroneTelemetryPoint[];
  startTime?: string;
  endTime?: string;
  maxDepthMeters?: number;
  missionObjectives?: string;
  status?: "planned" | "in_progress" | "completed" | "aborted" | "failed";
  completionPercentage?: number;
  userId?: string;
}

export interface DroneTelemetryPoint {
  x?: number;
  y?: number;
  z?: number;
  depth?: number;
  heading?: number;
  pitch?: number;
  roll?: number;
  battery?: number;
  timestamp?: string;
}

interface DroneAlert {
  type: string;
  message: string;
  severity: string;
  timestamp?: string;
}

export interface DroneTelemetryData extends DroneTelemetryPoint {
  missionId?: string;
  droneId: string;
  waterTemperature?: number;
  pressure?: number;
  velocity?: number;
  cameraStatus?: string;
  sonarStatus?: string;
  systemHealth?: string;
  alerts?: DroneAlert[];
}

interface DroneMissionRow {
  id: string;
  mission_name: string;
  drone_id: string;
  mission_type: string;
  planned_waypoints: unknown;
  actual_trajectory: unknown;
  start_time: string | null;
  end_time: string | null;
  max_depth_meters: number | null;
  mission_objectives: string | null;
  status: string;
  completion_percentage: number;
  user_id: string | null;
}

interface DroneTelemetryRow {
  mission_id: string | null;
  drone_id: string;
  timestamp: string;
  position_x: number | null;
  position_y: number | null;
  position_z: number | null;
  depth_meters: number | null;
  heading_degrees: number | null;
  pitch_degrees: number | null;
  roll_degrees: number | null;
  battery_percentage: number | null;
  water_temperature_celsius: number | null;
  pressure_bar: number | null;
  velocity_mps?: number | null;
  camera_status?: string | null;
  sonar_status?: string | null;
  system_health?: string | null;
  alerts?: unknown;
  [key: string]: unknown;
}


class DroneMissionService {
  async createMission(mission: DroneMission): Promise<DroneMission> {
    try {
      logger.info("Creating drone mission", { missionName: mission.missionName });

      const { data, error } = await (supabase.from as Function)("drone_missions")
        .insert({
          mission_name: mission.missionName,
          drone_id: mission.droneId,
          mission_type: mission.missionType,
          planned_waypoints: mission.plannedWaypoints,
          actual_trajectory: mission.actualTrajectory,
          start_time: mission.startTime,
          end_time: mission.endTime,
          max_depth_meters: mission.maxDepthMeters,
          mission_objectives: mission.missionObjectives,
          status: mission.status || "planned",
          completion_percentage: mission.completionPercentage || 0,
          user_id: mission.userId,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapMissionFromDB(data as DroneMissionRow);
    } catch (error) {
      logger.error("Failed to create mission", error);
      throw error;
    }
  }

  async updateMission(
    missionId: string,
    updates: Partial<DroneMission>
  ): Promise<void> {
    try {
      const dbUpdates: Record<string, unknown> = {};
      
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.completionPercentage !== undefined) {
        dbUpdates.completion_percentage = updates.completionPercentage;
      }
      if (updates.actualTrajectory) dbUpdates.actual_trajectory = updates.actualTrajectory;
      if (updates.endTime) dbUpdates.end_time = updates.endTime;

      const { error } = await supabase
        .from("drone_missions")
        .update(dbUpdates)
        .eq("id", missionId);

      if (error) throw error;

      logger.info("Mission updated", { missionId, updates: Object.keys(dbUpdates) });
    } catch (error) {
      logger.error("Failed to update mission", error);
      throw error;
    }
  }

  async getActiveMissions(userId?: string): Promise<DroneMission[]> {
    try {
      let query = supabase
        .from("drone_missions")
        .select("*")
        .in("status", ["planned", "in_progress"])
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data as DroneMissionRow[]).map((row) => this.mapMissionFromDB(row));
    } catch (error) {
      logger.error("Failed to get active missions", error);
      return [];
    }
  }

  async getMission(missionId: string): Promise<DroneMission | null> {
    try {
      const { data, error } = await supabase
        .from("drone_missions")
        .select("*")
        .eq("id", missionId)
        .single();

      if (error) throw error;

      return this.mapMissionFromDB(data as DroneMissionRow);
    } catch (error) {
      logger.error("Failed to get mission", error);
      return null;
    }
  }

  async logTelemetry(telemetry: DroneTelemetryData): Promise<void> {
    try {
      const { error } = await supabase.from("drone_telemetry").insert({
        mission_id: telemetry.missionId,
        drone_id: telemetry.droneId,
        timestamp: telemetry.timestamp || new Date().toISOString(),
        position_x: telemetry.x,
        position_y: telemetry.y,
        position_z: telemetry.z,
        depth_meters: telemetry.depth,
        heading_degrees: telemetry.heading,
        pitch_degrees: telemetry.pitch,
        roll_degrees: telemetry.roll,
        battery_percentage: telemetry.battery,
        water_temperature_celsius: telemetry.waterTemperature,
        pressure_bar: telemetry.pressure,
        velocity_mps: telemetry.velocity,
        camera_status: telemetry.cameraStatus,
        sonar_status: telemetry.sonarStatus,
        system_health: telemetry.systemHealth,
        alerts: telemetry.alerts,
      });

      if (error) throw error;
    } catch (error) {
      logger.error("Failed to log telemetry", error);
    }
  }

  async getMissionTelemetry(
    missionId: string,
    limit = 1000
  ): Promise<DroneTelemetryData[]> {
    try {
      const { data, error } = await supabase
        .from("drone_telemetry")
        .select("*")
        .eq("mission_id", missionId)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data as DroneTelemetryRow[]).map((row) => this.mapTelemetryFromDB(row));
    } catch (error) {
      logger.error("Failed to get mission telemetry", error);
      return [];
    }
  }

  async getRecentTelemetry(
    droneId: string,
    limit = 100
  ): Promise<DroneTelemetryData[]> {
    try {
      const { data, error } = await supabase
        .from("drone_telemetry")
        .select("*")
        .eq("drone_id", droneId)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data as DroneTelemetryRow[]).map((row) => this.mapTelemetryFromDB(row));
    } catch (error) {
      logger.error("Failed to get recent telemetry", error);
      return [];
    }
  }

  async startMission(missionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("drone_missions")
        .update({
          status: "in_progress",
          start_time: new Date().toISOString(),
        })
        .eq("id", missionId);

      if (error) throw error;

      logger.info("Mission started", { missionId });
    } catch (error) {
      logger.error("Failed to start mission", error);
      throw error;
    }
  }

  async completeMission(missionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("drone_missions")
        .update({
          status: "completed",
          end_time: new Date().toISOString(),
          completion_percentage: 100,
        })
        .eq("id", missionId);

      if (error) throw error;

      logger.info("Mission completed", { missionId });
    } catch (error) {
      logger.error("Failed to complete mission", error);
      throw error;
    }
  }

  private mapMissionFromDB(data: DroneMissionRow): DroneMission {
    return {
      id: data.id,
      missionName: data.mission_name,
      droneId: data.drone_id,
      missionType: data.mission_type as DroneMission["missionType"],
      plannedWaypoints: data.planned_waypoints as DroneTelemetryPoint[],
      actualTrajectory: data.actual_trajectory as DroneTelemetryPoint[] | undefined,
      startTime: data.start_time ?? undefined,
      endTime: data.end_time ?? undefined,
      maxDepthMeters: data.max_depth_meters ?? undefined,
      missionObjectives: data.mission_objectives ?? undefined,
      status: data.status as DroneMission["status"],
      completionPercentage: data.completion_percentage,
      userId: data.user_id ?? undefined,
    };
  }

  private mapTelemetryFromDB(data: DroneTelemetryRow): DroneTelemetryData {
    return {
      missionId: data.mission_id ?? undefined,
      droneId: data.drone_id,
      timestamp: data.timestamp,
      x: data.position_x ?? undefined,
      y: data.position_y ?? undefined,
      z: data.position_z ?? undefined,
      depth: data.depth_meters ?? undefined,
      heading: data.heading_degrees ?? undefined,
      pitch: data.pitch_degrees ?? undefined,
      roll: data.roll_degrees ?? undefined,
      battery: data.battery_percentage ?? undefined,
      waterTemperature: data.water_temperature_celsius ?? undefined,
      pressure: data.pressure_bar ?? undefined,
      velocity: data.velocity_mps ?? undefined,
      cameraStatus: data.camera_status ?? undefined,
      sonarStatus: data.sonar_status ?? undefined,
      systemHealth: data.system_health ?? undefined,
      alerts: data.alerts as DroneAlert[] | undefined,
    };
  }
}

export const droneMissionService = new DroneMissionService();
