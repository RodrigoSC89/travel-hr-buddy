/**
 * PATCH 878 - Underwater Missions Persistence Service
 * Type-safe using Supabase Database types
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Database, Json } from "@/integrations/supabase/types";

type UnderwaterMissionRow = Database["public"]["Tables"]["underwater_missions"]["Row"];
type UnderwaterMissionInsert = Database["public"]["Tables"]["underwater_missions"]["Insert"];
type DroneTelemetryInsert = Database["public"]["Tables"]["drone_telemetry"]["Insert"];
type MissionEventInsert = Database["public"]["Tables"]["mission_events"]["Insert"];

export interface Mission {
  id?: string;
  name: string;
  description?: string;
  missionType?: string;
  status: string;
  waypoints: Array<{
    id: string;
    position: { lat: number; lon: number; depth: number };
    actions?: string[];
    description?: string;
    completed?: boolean;
  }>;
  progress?: number;
  scheduledStart?: string;
  objectives?: string[];
}

export interface UnderwaterMissionRecord {
  id: string;
  user_id: string;
  organization_id?: string | null;
  mission_name: string;
  mission_type: string;
  status: string;
  start_time?: string | null;
  end_time?: string | null;
  target_location?: Json | null;
  depth_target?: number | null;
  max_depth?: number | null;
  battery_level?: number | null;
  notes?: string | null;
  metadata?: Json | null;
  created_at: string;
  updated_at: string;
}

export interface DroneTelemetryRecord {
  id: string;
  drone_id: string;
  mission_id?: string | null;
  battery_percentage?: number | null;
  signal_strength_dbm?: number | null;
  depth_meters?: number | null;
  water_temperature_celsius?: number | null;
  pressure_bar?: number | null;
  position_x?: number | null;
  position_y?: number | null;
  position_z?: number | null;
  timestamp: string;
  created_at: string;
}

export interface MissionEventRecord {
  id: string;
  mission_id?: string | null;
  event_type: string;
  severity?: string | null;
  message: string;
  event_data?: Json | null;
  timestamp?: string | null;
  created_at?: string | null;
}

function mapRowToRecord(row: UnderwaterMissionRow): UnderwaterMissionRecord {
  return {
    id: row.id,
    user_id: row.user_id,
    organization_id: row.organization_id,
    mission_name: row.mission_name,
    mission_type: row.mission_type,
    status: row.status,
    start_time: row.start_time,
    end_time: row.end_time,
    target_location: row.target_location,
    depth_target: row.depth_target,
    max_depth: row.max_depth,
    battery_level: row.battery_level,
    notes: row.notes,
    metadata: row.metadata,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

class UnderwaterMissionService {
  async saveMission(mission: Mission, userId?: string): Promise<UnderwaterMissionRecord | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn("No authenticated user, skipping mission save");
        return null;
      }

      const missionData: UnderwaterMissionInsert = {
        user_id: userId || user.id,
        mission_name: mission.name,
        mission_type: mission.missionType || "survey",
        status: mission.status,
        target_location: mission.waypoints[0]?.position as unknown as Json || { lat: 0, lon: 0, depth: 0 },
        notes: mission.description,
        metadata: {
          waypoints: mission.waypoints,
          objectives: mission.objectives,
          scheduledStart: mission.scheduledStart,
          createdAt: new Date().toISOString(),
        } as Json,
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
      return mapRowToRecord(data);
    } catch (error) {
      logger.error("Error saving underwater mission:", error);
      return null;
    }
  }

  async saveTelemetry(
    missionId: string | undefined,
    droneId: string,
    position: { x?: number; y?: number; z?: number },
    batteryLevel: number,
    signalStrength: number,
    environmentalData?: {
      temperature?: number;
      pressure?: number;
      depth?: number;
    }
  ): Promise<DroneTelemetryRecord | null> {
    try {
      const telemetryData: DroneTelemetryInsert = {
        drone_id: droneId,
        mission_id: missionId,
        position_x: position.x,
        position_y: position.y,
        position_z: position.z,
        battery_percentage: batteryLevel,
        signal_strength_dbm: signalStrength,
        water_temperature_celsius: environmentalData?.temperature,
        pressure_bar: environmentalData?.pressure,
        depth_meters: environmentalData?.depth,
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

      return data as unknown as DroneTelemetryRecord;
    } catch (error) {
      logger.error("Error saving telemetry:", error);
      return null;
    }
  }

  async saveMissionEvent(
    missionId: string,
    eventType: string,
    severity: string,
    message: string,
    eventData?: Record<string, unknown>
  ): Promise<MissionEventRecord | null> {
    try {
      const eventInsert: MissionEventInsert = {
        mission_id: missionId,
        event_type: eventType,
        severity,
        message,
        event_data: eventData as Json,
        timestamp: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("mission_events")
        .insert(eventInsert)
        .select()
        .single();

      if (error) {
        logger.error("Failed to save mission event:", error);
        return null;
      }

      return data as unknown as MissionEventRecord;
    } catch (error) {
      logger.error("Error saving mission event:", error);
      return null;
    }
  }

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

      return (data || []).map(mapRowToRecord);
    } catch (error) {
      logger.error("Error fetching missions:", error);
      return [];
    }
  }

  async getMissionStats(): Promise<{
    totalMissions: number;
    completedMissions: number;
    activeMissions: number;
    avgDepth: number;
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

      const missions = (data || []).map(mapRowToRecord);
      const depths = missions.map(m => m.max_depth || 0).filter(d => d > 0);

      return {
        totalMissions: missions.length,
        completedMissions: missions.filter(m => m.status === "completed").length,
        activeMissions: missions.filter(m => m.status === "active").length,
        avgDepth: depths.length > 0 ? depths.reduce((a, b) => a + b, 0) / depths.length : 0,
        maxDepth: depths.length > 0 ? Math.max(...depths) : 0,
      };
    } catch (error) {
      logger.error("Error fetching mission stats:", error);
      return null;
    }
  }
}

export const underwaterMissionService = new UnderwaterMissionService();
