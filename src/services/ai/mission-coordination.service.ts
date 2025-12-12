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
import { logger } from "@/lib/logger";

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
      });

      this.missions.set(mission.id, mission);
      logger.info("[MissionCoordination] Mission created", { missionId: mission.id, name: mission.name, priority: mission.priority });
      return mission;
    } catch (error) {
      logger.error("[MissionCoordination] Error in createMission", error as Error, { missionData });
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
        logger.warn("[MissionCoordination] Mission not found", { missionId });
        return null;
      }
      return mission;
    } catch (error) {
      logger.error("[MissionCoordination] Error in getMission", error as Error, { missionId });
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
      });

      const existingVessels = this.vessels.get(missionId) || [];
      this.vessels.set(missionId, [...existingVessels, assignment]);

      logger.info("[MissionCoordination] Vessel assigned", { assignmentId: assignment.id, missionId, vesselId, role });
      return assignment;
    } catch (error) {
      logger.error("[MissionCoordination] Error in assignVessel", error as Error, { missionId, vesselId, role });
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
        logger.warn("[MissionCoordination] Mission not found", { missionId });
        return null;
      }

      mission.status = status;
      mission.updated_at = new Date().toISOString();
      this.missions.set(missionId, mission);

      logger.info("[MissionCoordination] Mission status updated", { missionId, oldStatus: mission.status, newStatus: status });
      return mission;
    } catch (error) {
      logger.error("[MissionCoordination] Error in updateMissionStatus", error as Error, { missionId, status });
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
      });

      const existingLogs = this.logs.get(missionId) || [];
      this.logs.set(missionId, [...existingLogs, log]);

      logger.info("[MissionCoordination] Log added", { logId: log.id, missionId, logType, vesselId });
      return log;
    } catch (error) {
      logger.error("[MissionCoordination] Error in addMissionLog", error as Error, { missionId, logType, vesselId });
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
      logger.error("[MissionCoordination] Error in getMissionVessels", error as Error, { missionId });
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
      logger.error("[MissionCoordination] Error in getMissionLogs", error as Error, { missionId });
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
      logger.error("[MissionCoordination] Error in getAllMissions", error as Error);
      return [];
    }
  }
}
