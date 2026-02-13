/**
 * PATCH 166.0: Mission Engine
 * Tables: mission_vessels (created in migration)
 * Core engine for multi-vessel mission coordination and management
 * 
 * @module mission-engine
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Json } from "@/integrations/supabase/types";

export type MissionType = "sar" | "evacuation" | "transport" | "patrol" | "training" | "emergency" | "custom";
export type MissionStatus = "planned" | "active" | "completed" | "cancelled" | "failed";
export type MissionPriority = "low" | "normal" | "high" | "critical";
export type VesselRole = "primary" | "support" | "backup" | "observer";

// Flexible interface that works with current DB schema
export interface Mission {
  id: string;
  name: string | null;
  mission_type?: string | null;
  status?: string | null;
  priority?: string | null;
  description?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  estimated_duration?: string | null;
  actual_duration?: string | null;
  coordination_data?: Record<string, unknown> | null;
  ai_recommendations?: Record<string, unknown> | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MissionVessel {
  id: string;
  mission_id?: string | null;
  vessel_id?: string | null;
  role?: string | null;
  assigned_at?: string | null;
  status?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MissionLog {
  id: string;
  mission_id?: string | null;
  vessel_id?: string | null;
  log_type?: string | null;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
  created_by?: string | null;
  created_at?: string | null;
}

export interface Vessel {
  id: string;
  name?: string | null;
  imo_code?: string | null;
  status?: string | null;
  last_known_position?: {
    lat: number;
    lng: number;
    course?: number;
    speed?: number;
  } | null;
  vessel_type?: string | null;
  flag?: string | null;
  built_year?: number | null;
  gross_tonnage?: number | null;
  maintenance_status?: string | null;
}

/**
 * Mission Engine Class
 * Handles multi-vessel mission coordination
 */
export class MissionEngine {
  /**
   * Create a new mission
   */
  static async createMission(mission: Partial<Mission>): Promise<Mission | null> {
    try {
      const { data, error } = await supabase
        .from("missions")
        .insert({
          mission_name: mission.name || "Untitled Mission",
          mission_code: `M-${Date.now()}`,
          mission_type: mission.mission_type || "custom",
          status: mission.status || "planned",
          priority: mission.priority || "normal",
          description: mission.description,
          start_date: mission.start_time,
        })
        .select()
        .single();

      if (error) {
        logger.error("Error creating mission:", error);
        return null;
      }

      logger.info("Mission created:", data);
      return {
        id: data.id,
        name: data.mission_name,
        mission_type: data.mission_type,
        status: data.status,
        priority: data.priority,
        description: data.description,
        start_time: data.start_date,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      logger.error("Error in createMission:", error);
      return null;
    }
  }

  /**
   * Get all missions with optional filtering
   */
  static async getMissions(filters?: {
    status?: MissionStatus;
    mission_type?: MissionType;
    priority?: MissionPriority;
  }): Promise<Mission[]> {
    try {
      let query = supabase.from("missions").select("*").order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.mission_type) {
        query = query.eq("mission_type", filters.mission_type);
      }
      if (filters?.priority) {
        query = query.eq("priority", filters.priority);
      }

      const { data, error } = await query;

      if (error) {
        logger.error("Error fetching missions:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error("Error in getMissions:", error);
      return [];
    }
  }

  /**
   * Get a specific mission by ID with vessel assignments
   */
  static async getMissionById(missionId: string): Promise<Mission & { vessels?: Vessel[] } | null> {
    try {
      const { data: mission, error } = await supabase
        .from("missions")
        .select(`
          *,
          mission_vessels (
            vessel_id,
            role,
            status,
            vessels (*)
          )
        `)
        .eq("id", missionId)
        .single();

      if (error) {
        logger.error("Error fetching mission:", error);
        return null;
      }

      // Transform the data to include vessels array
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase nested join dynamic shape
      const vessels = mission?.mission_vessels?.map((mv: any) => ({
        ...mv.vessels,
        mission_role: String(mv.role || ""),
        mission_status: String(mv.status || "")
      })) || [];

      return {
        ...mission,
        vessels
      };
    } catch (error) {
      logger.error("Error in getMissionById:", error);
      return null;
    }
  }

  /**
   * Assign vessel to mission
   */
  static async assignVesselToMission(
    missionId: string,
    vesselId: string,
    role: VesselRole = "support"
  ): Promise<MissionVessel | null> {
    try {
      const { data, error } = await supabase
        .from("mission_vessels")
        .insert({
          mission_id: missionId,
          vessel_id: vesselId,
          role,
          status: "assigned"
        })
        .select()
        .single();

      if (error) {
        logger.error("Error assigning vessel to mission:", error);
        return null;
      }

      // Log the assignment
      await this.logMissionEvent(missionId, {
        log_type: "coordination",
        message: `Vessel assigned to mission with role: ${role}`,
        vessel_id: vesselId,
        metadata: { role, vessel_id: vesselId }
      });

      logger.info("Vessel assigned to mission:", data);
      return data;
    } catch (error) {
      logger.error("Error in assignVesselToMission:", error);
      return null;
    }
  }

  /**
   * Update mission status
   */
  static async updateMissionStatus(
    missionId: string,
    status: MissionStatus
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("missions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", missionId);

      if (error) {
        logger.error("Error updating mission status:", error);
        return false;
      }

      // Log status change
      await this.logMissionEvent(missionId, {
        log_type: "status_change",
        message: `Mission status changed to: ${status}`,
        metadata: { new_status: status }
      });

      logger.info(`Mission ${missionId} status updated to ${status}`);
      return true;
    } catch (error) {
      logger.error("Error in updateMissionStatus:", error);
      return false;
    }
  }

  /**
   * Log mission event
   */
  static async logMissionEvent(
    missionId: string,
    log: {
      log_type: MissionLog["log_type"];
      message: string;
      vessel_id?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<MissionLog | null> {
    try {
      const { data, error } = await supabase
        .from("mission_logs")
        .insert({
          mission_id: missionId,
          mission_name: "Mission Log",
          log_type: log.log_type,
          message: log.message,
          description: log.message,
          status: "logged",
          mission_date: new Date().toISOString().split('T')[0],
          crew_members: []
        })
        .select()
        .single();

      if (error) {
        logger.error("Error logging mission event:", error);
        return null;
      }

      return {
        id: data.id,
        mission_id: missionId,
        vessel_id: log.vessel_id,
        log_type: log.log_type,
        message: log.message,
        metadata: log.metadata,
        created_at: data.created_at,
      };
    } catch (error) {
      logger.error("Error in logMissionEvent:", error);
      return null;
    }
  }

  /**
   * Get mission logs
   */
  static async getMissionLogs(
    missionId: string,
    filters?: {
      vessel_id?: string;
      log_type?: MissionLog["log_type"];
      limit?: number;
    }
  ): Promise<MissionLog[]> {
    try {
      let query = supabase
        .from("mission_logs")
        .select("*")
        .eq("mission_id", missionId)
        .order("created_at", { ascending: false });

      if (filters?.vessel_id) {
        query = query.eq("vessel_id", filters.vessel_id);
      }
      if (filters?.log_type) {
        query = query.eq("log_type", filters.log_type);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error("Error fetching mission logs:", error);
        return [];
      }

      return (data || []).map(d => ({
        id: d.id,
        mission_id: d.id,
        log_type: d.log_type,
        message: d.message || d.description,
        created_at: d.created_at,
      })) as MissionLog[];
    } catch (error) {
      logger.error("Error in getMissionLogs:", error);
      return [];
    }
  }

  /**
   * Get vessels assigned to a mission
   */
  static async getMissionVessels(missionId: string): Promise<(Vessel & { mission_role: VesselRole })[]> {
    try {
      const { data, error } = await supabase
        .from("mission_vessels")
        .select(`
          role,
          status,
          vessels (*)
        `)
        .eq("mission_id", missionId)
        .eq("status", "active");

      if (error) {
        logger.error("Error fetching mission vessels:", error);
        return [];
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase nested join dynamic shape
      return data?.map((mv: any) => ({
        ...mv.vessels,
        mission_role: String(mv.role || ""),
        mission_status: String(mv.status || "")
      })) || [];
    } catch (error) {
      logger.error("Error in getMissionVessels:", error);
      return [];
    }
  }

  /**
   * Get all vessels available for mission assignment
   */
  static async getAvailableVessels(): Promise<Vessel[]> {
    try {
      const { data, error } = await supabase
        .from("vessels")
        .select("*")
        .in("status", ["active", "maintenance"])
        .order("name");

      if (error) {
        logger.error("Error fetching available vessels:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error("Error in getAvailableVessels:", error);
      return [];
    }
  }

  /**
   * Calculate optimal vessel assignment based on mission requirements
   * This is a basic implementation that can be enhanced with AI
   */
  static async suggestVesselAssignment(
    missionType: MissionType,
    priority: MissionPriority
  ): Promise<{ vessel: Vessel; role: VesselRole; reason: string }[]> {
    try {
      const vessels = await this.getAvailableVessels();
      
      const suggestions: { vessel: Vessel; role: VesselRole; reason: string }[] = [];

      // Simple rule-based assignment logic
      for (const vessel of vessels) {
        if (missionType === "sar" && vessel.vessel_type?.includes("Research")) {
          suggestions.push({
            vessel,
            role: "primary",
            reason: "Research vessels are well-equipped for search operations"
          });
        } else if (missionType === "transport" && vessel.vessel_type?.includes("Cargo")) {
          suggestions.push({
            vessel,
            role: "primary",
            reason: "Cargo ships are optimal for transport missions"
          });
        } else if (vessel.status === "active") {
          suggestions.push({
            vessel,
            role: "support",
            reason: "Active vessel available for support"
          });
        }
      }

      // Sort by priority and vessel capacity
      suggestions.sort((a, b) => {
        if (a.role === "primary" && b.role !== "primary") return -1;
        if (a.role !== "primary" && b.role === "primary") return 1;
        return (b.vessel.gross_tonnage || 0) - (a.vessel.gross_tonnage || 0);
      });

      return suggestions;
    } catch (error) {
      logger.error("Error in suggestVesselAssignment:", error);
      return [];
    }
  }
}
