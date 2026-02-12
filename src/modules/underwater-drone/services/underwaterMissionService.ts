/**
 * PATCH 459 - Underwater Missions Persistence Service
 * Service for persisting underwater drone missions, telemetry, and events to database
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Mission, Waypoint } from "../missionUploadSub";

// Dynamic query helper for tables not in generated types
const dynamicFrom = (table: string) => (supabase.from as Function)(table);

export interface UnderwaterMissionRecord {
  id: string;
  user_id: string;
  drone_id?: string;
  name: string;
  description?: string;
  mission_type: string;
  status: string;
  priority?: string;
  start_location: Record<string, unknown>;
  current_location?: Record<string, unknown>;
  waypoints: Array<Record<string, unknown>>;
  trajectory?: Array<Record<string, unknown>>;
  scheduled_start?: string;
  actual_start?: string;
  estimated_end?: string;
  actual_end?: string;
  progress: number;
  distance_covered_m?: number;
  max_depth_reached?: number;
  duration_minutes?: number;
  objectives?: Record<string, unknown>;
  findings?: Record<string, unknown>;
  samples_collected?: Record<string, unknown>;
  incidents?: Array<Record<string, unknown>>;
  success_rate?: number;
  result_summary?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DroneTelemetryRecord {
  id: string;
  mission_id?: string;
  drone_id?: string;
  user_id: string;
  position: Record<string, unknown>;
  orientation?: Record<string, unknown>;
  velocity?: Record<string, unknown>;
  water_temperature?: number;
  pressure?: number;
  visibility?: number;
  current_speed?: number;
  current_direction?: number;
  battery_level: number;
  battery_time_remaining?: number;
  signal_strength: number;
  connection_type?: string;
  thruster_status?: Record<string, unknown>;
  sensor_status?: Record<string, unknown>;
  system_alerts?: Array<Record<string, unknown>>;
  timestamp: string;
  created_at: string;
}

export interface MissionEventRecord {
  id: string;
  mission_id: string;
  user_id: string;
  event_type: string;
  severity: string;
  message: string;
  location?: Record<string, unknown>;
  details?: Record<string, unknown>;
  timestamp: string;
  created_at: string;
}

class UnderwaterMissionService {
  /**
   * Save underwater mission to database
   */
  async saveMission(mission: Mission, userId?: string): Promise<UnderwaterMissionRecord | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn("No authenticated user, skipping mission save");
        return null;
      }

      const missionData = {
        user_id: userId || user.id,
        mission_name: mission.name,
        description: mission.description,
        mission_type: mission.metadata?.missionType || "survey",
        status: mission.status,
        start_location: mission.waypoints[0]?.position || { lat: 0, lon: 0, depth: 0 },
        waypoints: mission.waypoints.map((wp: Waypoint) => ({
          id: wp.id,
          position: wp.position,
          action: wp.action,
          description: wp.description,
          completed: wp.completed,
        })),
        progress: mission.progress,
        scheduled_start: mission.startTime,
        metadata: {
          createdAt: new Date().toISOString(),
          waypointCount: mission.waypoints.length,
        },
      };

      const { data, error } = await dynamicFrom("underwater_missions")
        .insert(missionData)
        .select()
        .single();

      if (error) {
        logger.error("Failed to save underwater mission:", error);
        return null;
      }

      logger.info("Underwater mission saved successfully:", data.id);
      return this.mapMissionFromDB(data);
    } catch (error) {
      logger.error("Error saving underwater mission:", error);
      return null;
    }
  }

  /**
   * Save telemetry data
   */
  async saveTelemetry(
    missionId: string | undefined,
    position: Record<string, unknown>,
    orientation: Record<string, unknown>,
    batteryLevel: number,
    signalStrength: number,
    environmentalData?: {
      temperature?: number;
      pressure?: number;
      visibility?: number;
    }
  ): Promise<DroneTelemetryRecord | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const telemetryData = {
        mission_id: missionId,
        user_id: user.id,
        position,
        orientation,
        battery_level: batteryLevel,
        signal_strength: signalStrength,
        water_temperature: environmentalData?.temperature,
        pressure: environmentalData?.pressure,
        visibility: environmentalData?.visibility,
        timestamp: new Date().toISOString(),
      };

      const { data, error } = await dynamicFrom("drone_telemetry")
        .insert(telemetryData)
        .select()
        .single();

      if (error) {
        logger.error("Failed to save telemetry:", error);
        return null;
      }

      return this.mapTelemetryFromDB(data);
    } catch (error) {
      logger.error("Error saving telemetry:", error);
      return null;
    }
  }

  /**
   * Save mission event
   */
  async saveMissionEvent(
    missionId: string,
    eventType: string,
    severity: string,
    message: string,
    location?: Record<string, unknown>
  ): Promise<MissionEventRecord | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const eventData = {
        mission_id: missionId,
        user_id: user.id,
        event_type: eventType,
        severity,
        message,
        location,
        timestamp: new Date().toISOString(),
      };

      const { data, error } = await dynamicFrom("mission_events")
        .insert(eventData)
        .select()
        .single();

      if (error) {
        logger.error("Failed to save mission event:", error);
        return null;
      }

      return this.mapEventFromDB(data);
    } catch (error) {
      logger.error("Error saving mission event:", error);
      return null;
    }
  }

  /**
   * Get user's missions
   */
  async getUserMissions(limit: number = 50): Promise<UnderwaterMissionRecord[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      const { data, error } = await dynamicFrom("underwater_missions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error("Failed to fetch missions:", error);
        return [];
      }

      return (data || []).map((row: Record<string, unknown>) => this.mapMissionFromDB(row));
    } catch (error) {
      logger.error("Error fetching missions:", error);
      return [];
    }
  }

  /**
   * Get mission statistics
   */
  async getMissionStats(): Promise<{
    totalMissions: number;
    completedMissions: number;
    activeMissions: number;
    avgProgress: number;
    avgSuccessRate: number;
    totalDistance: number;
    maxDepth: number;
  } | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await dynamicFrom("underwater_missions")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        logger.error("Failed to fetch mission stats:", error);
        return null;
      }

      const missions: UnderwaterMissionRecord[] = (data || []).map((row: Record<string, unknown>) => this.mapMissionFromDB(row));

      return {
        totalMissions: missions.length,
        completedMissions: missions.filter((m: UnderwaterMissionRecord) => m.status === "completed").length,
        activeMissions: missions.filter((m: UnderwaterMissionRecord) => m.status === "active").length,
        avgProgress: missions.length > 0 
          ? missions.reduce((sum: number, m: UnderwaterMissionRecord) => sum + m.progress, 0) / missions.length 
          : 0,
        avgSuccessRate: missions.filter((m: UnderwaterMissionRecord) => m.success_rate).length > 0
          ? missions.reduce((sum: number, m: UnderwaterMissionRecord) => sum + (m.success_rate || 0), 0) / missions.filter((m: UnderwaterMissionRecord) => m.success_rate).length
          : 0,
        totalDistance: missions.reduce((sum: number, m: UnderwaterMissionRecord) => sum + (m.distance_covered_m || 0), 0),
        maxDepth: Math.max(...missions.map((m: UnderwaterMissionRecord) => m.max_depth_reached || 0), 0),
      };
    } catch (error) {
      logger.error("Error fetching mission stats:", error);
      return null;
    }
  }

  /**
   * Map database record to UnderwaterMissionRecord
   */
  private mapMissionFromDB(data: Record<string, unknown>): UnderwaterMissionRecord {
    return {
      id: String(data.id),
      user_id: String(data.user_id),
      drone_id: data.drone_id as string | undefined,
      name: String(data.mission_name || data.name || ""),
      description: data.description as string | undefined,
      mission_type: String(data.mission_type || "survey"),
      status: String(data.status || "pending"),
      priority: data.priority as string | undefined,
      start_location: (data.start_location || {}) as Record<string, unknown>,
      current_location: data.current_location as Record<string, unknown> | undefined,
      waypoints: (data.waypoints || []) as Array<Record<string, unknown>>,
      trajectory: data.trajectory as Array<Record<string, unknown>> | undefined,
      scheduled_start: data.scheduled_start as string | undefined,
      actual_start: data.actual_start as string | undefined,
      estimated_end: data.estimated_end as string | undefined,
      actual_end: (data.actual_end || data.end_time) as string | undefined,
      progress: Number(data.progress || data.completion_percentage || 0),
      distance_covered_m: data.distance_covered_m as number | undefined,
      max_depth_reached: (data.max_depth_reached || data.max_depth) as number | undefined,
      duration_minutes: data.duration_minutes as number | undefined,
      objectives: data.objectives as Record<string, unknown> | undefined,
      findings: data.findings as Record<string, unknown> | undefined,
      samples_collected: data.samples_collected as Record<string, unknown> | undefined,
      incidents: data.incidents as Array<Record<string, unknown>> | undefined,
      success_rate: data.success_rate as number | undefined,
      result_summary: data.result_summary as string | undefined,
      metadata: data.metadata as Record<string, unknown> | undefined,
      created_at: String(data.created_at),
      updated_at: String(data.updated_at || data.created_at),
    };
  }

  /**
   * Map database record to DroneTelemetryRecord
   */
  private mapTelemetryFromDB(data: Record<string, unknown>): DroneTelemetryRecord {
    return {
      id: String(data.id),
      mission_id: data.mission_id as string | undefined,
      drone_id: data.drone_id as string | undefined,
      user_id: String(data.user_id || ""),
      position: (data.position || { x: data.position_x, y: data.position_y, z: data.position_z }) as Record<string, unknown>,
      orientation: (data.orientation || { heading: data.heading_degrees, pitch: data.pitch_degrees, roll: data.roll_degrees }) as Record<string, unknown> | undefined,
      velocity: data.velocity as Record<string, unknown> | undefined,
      water_temperature: (data.water_temperature || data.water_temperature_celsius) as number | undefined,
      pressure: (data.pressure || data.pressure_bar) as number | undefined,
      visibility: data.visibility as number | undefined,
      current_speed: data.current_speed as number | undefined,
      current_direction: data.current_direction as number | undefined,
      battery_level: Number(data.battery_level || data.battery_percentage || 0),
      battery_time_remaining: data.battery_time_remaining as number | undefined,
      signal_strength: Number(data.signal_strength || 0),
      connection_type: data.connection_type as string | undefined,
      thruster_status: data.thruster_status as Record<string, unknown> | undefined,
      sensor_status: data.sensor_status as Record<string, unknown> | undefined,
      system_alerts: (data.system_alerts || data.alerts) as Array<Record<string, unknown>> | undefined,
      timestamp: String(data.timestamp),
      created_at: String(data.created_at),
    };
  }

  /**
   * Map database record to MissionEventRecord
   */
  private mapEventFromDB(data: Record<string, unknown>): MissionEventRecord {
    return {
      id: String(data.id),
      mission_id: String(data.mission_id || ""),
      user_id: String(data.user_id || ""),
      event_type: String(data.event_type),
      severity: String(data.severity || "info"),
      message: String(data.message),
      location: data.location as Record<string, unknown> | undefined,
      details: (data.details || data.event_data) as Record<string, unknown> | undefined,
      timestamp: String(data.timestamp || data.created_at),
      created_at: String(data.created_at),
    };
  }
}

export const underwaterMissionService = new UnderwaterMissionService();
