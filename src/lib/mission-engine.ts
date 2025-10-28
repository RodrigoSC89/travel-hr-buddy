// @ts-nocheck
/**
 * PATCH 166.0: Mission Engine
 * Core engine for multi-vessel mission coordination and management
 * 
 * @module mission-engine
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type MissionType = "sar" | "evacuation" | "transport" | "patrol" | "training" | "emergency" | "custom";
export type MissionStatus = "planned" | "active" | "completed" | "cancelled" | "failed";
export type MissionPriority = "low" | "normal" | "high" | "critical";
export type VesselRole = "primary" | "support" | "backup" | "observer";

export interface Mission {
  id: string;
  name: string;
  mission_type: MissionType;
  status: MissionStatus;
  priority: MissionPriority;
  description?: string;
  start_time?: string;
  end_time?: string;
  estimated_duration?: string;
  actual_duration?: string;
  coordination_data?: Record<string, any>;
  ai_recommendations?: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MissionVessel {
  id: string;
  mission_id: string;
  vessel_id: string;
  role: VesselRole;
  assigned_at: string;
  status: "assigned" | "active" | "completed" | "withdrawn";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MissionLog {
  id: string;
  mission_id: string;
  vessel_id?: string;
  log_type: "info" | "warning" | "error" | "status_change" | "coordination" | "ai_decision";
  message: string;
  metadata?: Record<string, any>;
  created_by?: string;
  created_at: string;
}

export interface Vessel {
  id: string;
  name: string;
  imo_code?: string;
  status: string;
  last_known_position?: {
    lat: number;
    lng: number;
    course?: number;
    speed?: number;
  };
  vessel_type?: string;
  flag?: string;
  built_year?: number;
  gross_tonnage?: number;
  maintenance_status?: string;
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
          name: mission.name,
          mission_type: mission.mission_type,
          status: mission.status || "planned",
          priority: mission.priority || "normal",
          description: mission.description,
          start_time: mission.start_time,
          coordination_data: mission.coordination_data || {},
          ai_recommendations: mission.ai_recommendations || {}
        })
        .select()
        .single();

      if (error) {
        logger.error("Error creating mission:", error);
        return null;
      }

      logger.info("Mission created:", data);
      return data;
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
      const vessels = mission?.mission_vessels?.map((mv: any) => ({
        ...mv.vessels,
        mission_role: mv.role,
        mission_status: mv.status
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
      metadata?: Record<string, any>;
    }
  ): Promise<MissionLog | null> {
    try {
      const { data, error } = await supabase
        .from("mission_logs")
        .insert({
          mission_id: missionId,
          vessel_id: log.vessel_id,
          log_type: log.log_type,
          message: log.message,
          metadata: log.metadata || {}
        })
        .select()
        .single();

      if (error) {
        logger.error("Error logging mission event:", error);
        return null;
      }

      return data;
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

      return data || [];
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

      return data?.map((mv: any) => ({
        ...mv.vessels,
        mission_role: mv.role,
        mission_status: mv.status
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
