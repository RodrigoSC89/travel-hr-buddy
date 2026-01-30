// @ts-nocheck
/**
 * PATCH 459 - Underwater Missions Persistence Service
 * Service for persisting underwater drone missions, telemetry, and events to database
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Mission } from "../missionUploadSub";

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
        name: mission.name,
        description: mission.description,
        mission_type: mission.missionType || "survey",
        status: mission.status,
        start_location: mission.waypoints[0]?.position || { lat: 0, lon: 0, depth: 0 },
        waypoints: mission.waypoints.map(wp => ({
          id: wp.id,
          position: wp.position,
          actions: wp.actions,
          description: wp.description,
          completed: wp.completed,
        })),
        progress: mission.progress,
        scheduled_start: mission.scheduledStart,
        objectives: mission.objectives,
        metadata: {
          createdAt: new Date().toISOString(),
          waypointCount: mission.waypoints.length,
        },
      };

      const { data, error } = await supabase
        .from("underwater_missions")
        .insert(missionData)
        .select()
        .single();

      if (error) {
        logger.error("Failed to save underwater mission:", error);
        return null;
      }

      logger.info("Underwater mission saved successfully:", data.id);
      return data as UnderwaterMissionRecord;
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

      const { data, error } = await supabase
        .from("drone_telemetry")
        .insert(telemetryData)
        .select()
        .single();

      if (error) {
        logger.error("Failed to save telemetry:", error);
        return null;
      }

      return data as DroneTelemetryRecord;
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

      const { data, error } = await supabase
        .from("mission_events")
        .insert(eventData)
        .select()
        .single();

      if (error) {
        logger.error("Failed to save mission event:", error);
        return null;
      }

      return data as MissionEventRecord;
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

      const { data, error } = await supabase
        .from("underwater_missions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error("Failed to fetch missions:", error);
        return [];
      }

      return (data as UnderwaterMissionRecord[]) || [];
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

      const { data, error } = await supabase
        .from("underwater_missions")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        logger.error("Failed to fetch mission stats:", error);
        return null;
      }

      const missions = (data as UnderwaterMissionRecord[]) || [];

      return {
        totalMissions: missions.length,
        completedMissions: missions.filter(m => m.status === "completed").length,
        activeMissions: missions.filter(m => m.status === "active").length,
        avgProgress: missions.length > 0 
          ? missions.reduce((sum, m) => sum + m.progress, 0) / missions.length 
          : 0,
        avgSuccessRate: missions.filter(m => m.success_rate).length > 0
          ? missions.reduce((sum, m) => sum + (m.success_rate || 0), 0) / missions.filter(m => m.success_rate).length
          : 0,
        totalDistance: missions.reduce((sum, m) => sum + (m.distance_covered_m || 0), 0),
        maxDepth: Math.max(...missions.map(m => m.max_depth_reached || 0), 0),
      };
    } catch (error) {
      logger.error("Error fetching mission stats:", error);
      return null;
    }
  }
}

export const underwaterMissionService = new UnderwaterMissionService();
