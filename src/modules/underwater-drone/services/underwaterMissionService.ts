/**
 * PATCH 459 - Underwater Missions Persistence Service
 * Service for persisting underwater drone missions, telemetry, and events to database
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Mission, Waypoint } from "../missionUploadSub";

// Helper to get dynamic supabase client for untyped tables
const dynamicSupabase = () => supabase as any;

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

      const { data, error } = await dynamicSupabase()
        .from("underwater_missions")
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

      const { data, error } = await dynamicSupabase()
        .from("drone_telemetry")
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

      const { data, error } = await dynamicSupabase()
        .from("mission_events")
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

      const { data, error } = await dynamicSupabase()
        .from("underwater_missions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error("Failed to fetch missions:", error);
        return [];
      }

      return (data || []).map((row: any) => this.mapMissionFromDB(row));
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

      const { data, error } = await dynamicSupabase()
        .from("underwater_missions")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        logger.error("Failed to fetch mission stats:", error);
        return null;
      }

      const missions: UnderwaterMissionRecord[] = (data || []).map((row: any) => this.mapMissionFromDB(row));

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
  private mapMissionFromDB(data: any): UnderwaterMissionRecord {
    return {
      id: data.id,
      user_id: data.user_id,
      drone_id: data.drone_id,
      name: data.mission_name || data.name || "",
      description: data.description,
      mission_type: data.mission_type || "survey",
      status: data.status || "pending",
      priority: data.priority,
      start_location: data.start_location || {},
      current_location: data.current_location,
      waypoints: data.waypoints || [],
      trajectory: data.trajectory,
      scheduled_start: data.scheduled_start,
      actual_start: data.actual_start,
      estimated_end: data.estimated_end,
      actual_end: data.actual_end || data.end_time,
      progress: data.progress || data.completion_percentage || 0,
      distance_covered_m: data.distance_covered_m,
      max_depth_reached: data.max_depth_reached || data.max_depth,
      duration_minutes: data.duration_minutes,
      objectives: data.objectives,
      findings: data.findings,
      samples_collected: data.samples_collected,
      incidents: data.incidents,
      success_rate: data.success_rate,
      result_summary: data.result_summary,
      metadata: data.metadata,
      created_at: data.created_at,
      updated_at: data.updated_at || data.created_at,
    };
  }

  /**
   * Map database record to DroneTelemetryRecord
   */
  private mapTelemetryFromDB(data: any): DroneTelemetryRecord {
    return {
      id: data.id,
      mission_id: data.mission_id,
      drone_id: data.drone_id,
      user_id: data.user_id || "",
      position: data.position || { x: data.position_x, y: data.position_y, z: data.position_z },
      orientation: data.orientation || { heading: data.heading_degrees, pitch: data.pitch_degrees, roll: data.roll_degrees },
      velocity: data.velocity,
      water_temperature: data.water_temperature || data.water_temperature_celsius,
      pressure: data.pressure || data.pressure_bar,
      visibility: data.visibility,
      current_speed: data.current_speed,
      current_direction: data.current_direction,
      battery_level: data.battery_level || data.battery_percentage || 0,
      battery_time_remaining: data.battery_time_remaining,
      signal_strength: data.signal_strength || 0,
      connection_type: data.connection_type,
      thruster_status: data.thruster_status,
      sensor_status: data.sensor_status,
      system_alerts: data.system_alerts || data.alerts,
      timestamp: data.timestamp,
      created_at: data.created_at,
    };
  }

  /**
   * Map database record to MissionEventRecord
   */
  private mapEventFromDB(data: any): MissionEventRecord {
    return {
      id: data.id,
      mission_id: data.mission_id || "",
      user_id: data.user_id || "",
      event_type: data.event_type,
      severity: data.severity || "info",
      message: data.message,
      location: data.location,
      details: data.details || data.event_data,
      timestamp: data.timestamp || data.created_at,
      created_at: data.created_at,
    };
  }
}

export const underwaterMissionService = new UnderwaterMissionService();
