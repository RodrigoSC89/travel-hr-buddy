/**
 * PATCH 548 - Mission Coordination Service
 * Modularized service for multi-vessel mission operations
 * In-memory implementation (database integration pending)
 */

import type { 
  MissionVessel, 
  MissionLog,
  VesselRole 
} from "@/types/ai-core";

interface SimpleMission {
  id: string;
  name: string;
  description?: string;
  objective?: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export class MissionCoordinationService {
  private static missions = new Map<string, SimpleMission>();
  private static vessels = new Map<string, MissionVessel[]>();
  private static logs = new Map<string, MissionLog[]>();

  /**
   * Create a new mission
   */
  static async createMission(missionData: {
    name: string;
    description?: string;
    objective?: string;
    priority?: string;
  }): Promise<SimpleMission | null> {
    try {
      const mission: SimpleMission = {
        id: `mission_${Date.now()}`,
        name: missionData.name,
        description: missionData.description,
        objective: missionData.objective,
        priority: missionData.priority || "medium",
        status: "planned",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.missions.set(mission.id, mission);
      console.info("[MissionCoordination] Mission created:", mission.id);
      return mission;
    } catch (error) {
      console.error("[MissionCoordination] Error in createMission:", error);
      return null;
    }
  }

  /**
   * Get mission by ID
   */
  static async getMission(missionId: string): Promise<SimpleMission | null> {
    try {
      const mission = this.missions.get(missionId);
      if (!mission) {
        console.warn("[MissionCoordination] Mission not found:", missionId);
        return null;
      }
      return mission;
    } catch (error) {
      console.error("[MissionCoordination] Error in getMission:", error);
      return null;
    }
  }

  /**
   * Assign vessel to mission
   */
  static async assignVessel(
    missionId: string,
    vesselId: string,
    role: VesselRole,
    notes?: string
  ): Promise<MissionVessel | null> {
    try {
      const assignment: MissionVessel = {
        id: `mv_${Date.now()}`,
        mission_id: missionId,
        vessel_id: vesselId,
        role,
        status: "assigned",
        notes,
        assigned_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const existingVessels = this.vessels.get(missionId) || [];
      this.vessels.set(missionId, [...existingVessels, assignment]);

      console.info("[MissionCoordination] Vessel assigned:", assignment.id);
      return assignment;
    } catch (error) {
      console.error("[MissionCoordination] Error in assignVessel:", error);
      return null;
    }
  }

  /**
   * Update mission status
   */
  static async updateMissionStatus(
    missionId: string,
    status: string
  ): Promise<SimpleMission | null> {
    try {
      const mission = this.missions.get(missionId);
      if (!mission) {
        console.warn("[MissionCoordination] Mission not found:", missionId);
        return null;
      }

      mission.status = status;
      mission.updated_at = new Date().toISOString();
      this.missions.set(missionId, mission);

      console.info("[MissionCoordination] Mission status updated:", missionId, status);
      return mission;
    } catch (error) {
      console.error("[MissionCoordination] Error in updateMissionStatus:", error);
      return null;
    }
  }

  /**
   * Add mission log entry
   */
  static async addMissionLog(
    missionId: string,
    logType: MissionLog["log_type"],
    message: string,
    metadata?: Record<string, unknown>,
    vesselId?: string
  ): Promise<MissionLog | null> {
    try {
      const log: MissionLog = {
        id: `ml_${Date.now()}`,
        mission_id: missionId,
        vessel_id: vesselId,
        log_type: logType,
        message,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      };

      const existingLogs = this.logs.get(missionId) || [];
      this.logs.set(missionId, [...existingLogs, log]);

      console.info("[MissionCoordination] Log added:", log.id);
      return log;
    } catch (error) {
      console.error("[MissionCoordination] Error in addMissionLog:", error);
      return null;
    }
  }

  /**
   * Get mission vessels
   */
  static async getMissionVessels(missionId: string): Promise<MissionVessel[]> {
    try {
      return this.vessels.get(missionId) || [];
    } catch (error) {
      console.error("[MissionCoordination] Error in getMissionVessels:", error);
      return [];
    }
  }

  /**
   * Get mission logs
   */
  static async getMissionLogs(missionId: string): Promise<MissionLog[]> {
    try {
      return this.logs.get(missionId) || [];
    } catch (error) {
      console.error("[MissionCoordination] Error in getMissionLogs:", error);
      return [];
    }
  }

  /**
   * Get all missions
   */
  static async getAllMissions(): Promise<SimpleMission[]> {
    try {
      return Array.from(this.missions.values());
    } catch (error) {
      console.error("[MissionCoordination] Error in getAllMissions:", error);
      return [];
    }
  }
}
