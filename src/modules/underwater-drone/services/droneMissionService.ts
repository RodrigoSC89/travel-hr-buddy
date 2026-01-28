/**
 * Drone Mission Service - PATCH 450
 * PATCH 900 - Removed @ts-nocheck, using dynamic table access
 * Manages underwater drone missions and telemetry data persistence
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

// Dynamic table access for unmapped tables
const getDynamicClient = () => supabase as unknown as { from: (table: string) => ReturnType<typeof supabase.from> };

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

export interface DroneTelemetryData extends DroneTelemetryPoint {
  missionId?: string;
  droneId: string;
  waterTemperature?: number;
  pressure?: number;
  velocity?: number;
  cameraStatus?: string;
  sonarStatus?: string;
  systemHealth?: string;
  alerts?: unknown[];
}

class DroneMissionService {
  /**
   * Create a new drone mission
   */
  async createMission(mission: DroneMission): Promise<DroneMission> {
    try {
      logger.info("Creating drone mission", { missionName: mission.missionName });

      const client = getDynamicClient();
      const { data, error } = await client
        .from("drone_missions")
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
        } as never)
        .select()
        .single();

      if (error) throw error;

      return this.mapMissionFromDB(data as Record<string, unknown>);
    } catch (error) {
      logger.error("Failed to create mission", error);
      throw error;
    }
  }

  /**
   * Update mission status and progress
   */
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

      const client = getDynamicClient();
      const { error } = await client
        .from("drone_missions")
        .update(dbUpdates as never)
        .eq("id", missionId);

      if (error) throw error;

      logger.info("Mission updated", { missionId, updates: Object.keys(dbUpdates) });
    } catch (error) {
      logger.error("Failed to update mission", error);
      throw error;
    }
  }

  /**
   * Get active missions
   */
  async getActiveMissions(userId?: string): Promise<DroneMission[]> {
    try {
      const client = getDynamicClient();
      let query = client
        .from("drone_missions")
        .select("*")
        .in("status", ["planned", "in_progress"])
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return ((data as unknown as Record<string, unknown>[]) || []).map((row) => this.mapMissionFromDB(row));
    } catch (error) {
      logger.error("Failed to get active missions", error);
      return [];
    }
  }

  /**
   * Get mission by ID
   */
  async getMission(missionId: string): Promise<DroneMission | null> {
    try {
      const client = getDynamicClient();
      const { data, error } = await client
        .from("drone_missions")
        .select("*")
        .eq("id", missionId)
        .single();

      if (error) throw error;

      return this.mapMissionFromDB(data as Record<string, unknown>);
    } catch (error) {
      logger.error("Failed to get mission", error);
      return null;
    }
  }

  /**
   * Log drone telemetry data
   */
  async logTelemetry(telemetry: DroneTelemetryData): Promise<void> {
    try {
      const client = getDynamicClient();
      const { error } = await client.from("drone_telemetry").insert({
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
      } as never);

      if (error) throw error;
    } catch (error) {
      logger.error("Failed to log telemetry", error);
      // Don't throw - telemetry logging shouldn't break the application
    }
  }

  /**
   * Get telemetry for a mission
   */
  async getMissionTelemetry(
    missionId: string,
    limit = 1000
  ): Promise<DroneTelemetryData[]> {
    try {
      const client = getDynamicClient();
      const { data, error } = await client
        .from("drone_telemetry")
        .select("*")
        .eq("mission_id", missionId)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return ((data as unknown as Record<string, unknown>[]) || []).map((row) => this.mapTelemetryFromDB(row));
    } catch (error) {
      logger.error("Failed to get mission telemetry", error);
      return [];
    }
  }

  /**
   * Get recent telemetry for a drone
   */
  async getRecentTelemetry(
    droneId: string,
    limit = 100
  ): Promise<DroneTelemetryData[]> {
    try {
      const client = getDynamicClient();
      const { data, error } = await client
        .from("drone_telemetry")
        .select("*")
        .eq("drone_id", droneId)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return ((data as unknown as Record<string, unknown>[]) || []).map((row) => this.mapTelemetryFromDB(row));
    } catch (error) {
      logger.error("Failed to get recent telemetry", error);
      return [];
    }
  }

  /**
   * Start mission (update status to in_progress and set start_time)
   */
  async startMission(missionId: string): Promise<void> {
    try {
      const client = getDynamicClient();
      const { error } = await client
        .from("drone_missions")
        .update({
          status: "in_progress",
          start_time: new Date().toISOString(),
        } as never)
        .eq("id", missionId);

      if (error) throw error;

      logger.info("Mission started", { missionId });
    } catch (error) {
      logger.error("Failed to start mission", error);
      throw error;
    }
  }

  /**
   * Complete mission
   */
  async completeMission(missionId: string): Promise<void> {
    try {
      const client = getDynamicClient();
      const { error } = await client
        .from("drone_missions")
        .update({
          status: "completed",
          end_time: new Date().toISOString(),
          completion_percentage: 100,
        } as never)
        .eq("id", missionId);

      if (error) throw error;

      logger.info("Mission completed", { missionId });
    } catch (error) {
      logger.error("Failed to complete mission", error);
      throw error;
    }
  }

  /**
   * Map database record to DroneMission
   */
  private mapMissionFromDB(data: Record<string, unknown>): DroneMission {
    return {
      id: data.id as string,
      missionName: data.mission_name as string,
      droneId: data.drone_id as string,
      missionType: data.mission_type as DroneMission["missionType"],
      plannedWaypoints: data.planned_waypoints as DroneTelemetryPoint[],
      actualTrajectory: data.actual_trajectory as DroneTelemetryPoint[] | undefined,
      startTime: data.start_time as string | undefined,
      endTime: data.end_time as string | undefined,
      maxDepthMeters: data.max_depth_meters as number | undefined,
      missionObjectives: data.mission_objectives as string | undefined,
      status: data.status as DroneMission["status"],
      completionPercentage: data.completion_percentage as number | undefined,
      userId: data.user_id as string | undefined,
    };
  }

  /**
   * Map database record to DroneTelemetryData
   */
  private mapTelemetryFromDB(data: Record<string, unknown>): DroneTelemetryData {
    return {
      missionId: data.mission_id as string | undefined,
      droneId: data.drone_id as string,
      timestamp: data.timestamp as string | undefined,
      x: data.position_x as number | undefined,
      y: data.position_y as number | undefined,
      z: data.position_z as number | undefined,
      depth: data.depth_meters as number | undefined,
      heading: data.heading_degrees as number | undefined,
      pitch: data.pitch_degrees as number | undefined,
      roll: data.roll_degrees as number | undefined,
      battery: data.battery_percentage as number | undefined,
      waterTemperature: data.water_temperature_celsius as number | undefined,
      pressure: data.pressure_bar as number | undefined,
      velocity: data.velocity_mps as number | undefined,
      cameraStatus: data.camera_status as string | undefined,
      sonarStatus: data.sonar_status as string | undefined,
      systemHealth: data.system_health as string | undefined,
      alerts: data.alerts as unknown[] | undefined,
    };
  }
}

export const droneMissionService = new DroneMissionService();
