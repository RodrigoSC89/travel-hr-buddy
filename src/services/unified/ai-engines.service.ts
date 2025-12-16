/**
 * UNIFIED AI Engines Service
 * Consolidates specialized AI services into a single cohesive module
 * 
 * Fused modules:
 * - src/services/ai/distributed-ai.service.ts
 * - src/services/ai/mission-coordination.service.ts
 * - src/services/coordinationAIService.ts (partial)
 * - src/services/deepRiskAIService.ts (partial)
 * - src/services/oceanSonarAIService.ts (partial)
 * - src/services/training-ai.service.ts (partial)
 */

import { logger } from "@/lib/logger";
import type { VesselAIContext, MissionVessel, MissionLog, VesselRole } from "@/types/ai-core";

// ===== Types =====

export interface SimpleMission {
  id: string;
  name: string;
  description?: string;
  objective?: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AIEngineMetrics {
  requestsProcessed: number;
  averageLatencyMs: number;
  errorRate: number;
  cacheHitRate: number;
  lastUpdated: string;
}

export interface AIContextCache {
  vesselId: string;
  context: VesselAIContext;
  cachedAt: Date;
  expiresAt: Date;
}

// ===== Unified AI Engine Service =====

class UnifiedAIEngineService {
  // Context Management
  private contextCache = new Map<string, VesselAIContext>();
  private lastGlobalSync: Date | null = null;
  private readonly SYNC_INTERVAL_HOURS = 12;
  
  // Mission Management
  private missions = new Map<string, SimpleMission>();
  private missionVessels = new Map<string, MissionVessel[]>();
  private missionLogs = new Map<string, MissionLog[]>();
  
  // Metrics
  private metrics: AIEngineMetrics = {
    requestsProcessed: 0,
    averageLatencyMs: 0,
    errorRate: 0,
    cacheHitRate: 0,
    lastUpdated: new Date().toISOString(),
  };

  // ===== Context Management (from DistributedAIService) =====

  /**
   * Get or create AI context for a vessel
   */
  async getVesselContext(vesselId: string): Promise<VesselAIContext | null> {
    try {
      if (this.contextCache.has(vesselId)) {
        this.updateMetrics(true);
        return this.contextCache.get(vesselId) || null;
      }
      
      this.updateMetrics(false);
      return await this.createVesselContext(vesselId);
    } catch (error) {
      logger.error("[AIEngine] Error getting vessel context", error as Error, { vesselId });
      return null;
    }
  }

  /**
   * Create new AI context for a vessel
   */
  async createVesselContext(vesselId: string): Promise<VesselAIContext | null> {
    try {
      const context: VesselAIContext = {
        vessel_id: vesselId,
        context_id: `ctx_${vesselId}_${Date.now()}`,
        local_data: {},
        global_data: {},
        last_sync: new Date().toISOString(),
        model_version: "1.0.0",
        interaction_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      this.contextCache.set(vesselId, context);
      logger.info("[AIEngine] Context created", { vesselId, contextId: context.context_id });
      return context;
    } catch (error) {
      logger.error("[AIEngine] Error creating context", error as Error, { vesselId });
      return null;
    }
  }

  /**
   * Update vessel context
   */
  async updateVesselContext(
    vesselId: string,
    updates: Partial<VesselAIContext>
  ): Promise<VesselAIContext | null> {
    try {
      const existing = this.contextCache.get(vesselId);
      if (!existing) {
        logger.warn("[AIEngine] Context not found for update", { vesselId });
        return null;
      }
      
      const updated: VesselAIContext = {
        ...existing,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      this.contextCache.set(vesselId, updated);
      logger.info("[AIEngine] Context updated", { vesselId });
      return updated;
    } catch (error) {
      logger.error("[AIEngine] Error updating context", error as Error, { vesselId });
      return null;
    }
  }

  /**
   * Check if global sync is needed
   */
  needsGlobalSync(): boolean {
    if (!this.lastGlobalSync) return true;
    
    const hoursSinceSync =
      (Date.now() - this.lastGlobalSync.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceSync >= this.SYNC_INTERVAL_HOURS;
  }

  /**
   * Perform global sync
   */
  async performGlobalSync(): Promise<boolean> {
    try {
      logger.info("[AIEngine] Starting global sync", { contextsInCache: this.contextCache.size });
      this.lastGlobalSync = new Date();
      logger.info("[AIEngine] Global sync completed");
      return true;
    } catch (error) {
      logger.error("[AIEngine] Error in global sync", error as Error);
      return false;
    }
  }

  /**
   * Clear context cache
   */
  clearContextCache(): void {
    this.contextCache.clear();
    logger.info("[AIEngine] Context cache cleared");
  }

  // ===== Mission Management (from MissionCoordinationService) =====

  /**
   * Create a new mission
   */
  async createMission(missionData: {
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
        updated_at: new Date().toISOString(),
      };
      
      this.missions.set(mission.id, mission);
      logger.info("[AIEngine] Mission created", { missionId: mission.id, name: mission.name });
      return mission;
    } catch (error) {
      logger.error("[AIEngine] Error creating mission", error as Error);
      return null;
    }
  }

  /**
   * Get mission by ID
   */
  async getMission(missionId: string): Promise<SimpleMission | null> {
    try {
      const mission = this.missions.get(missionId);
      if (!mission) {
        logger.warn("[AIEngine] Mission not found", { missionId });
        return null;
      }
      return mission;
    } catch (error) {
      logger.error("[AIEngine] Error getting mission", error as Error, { missionId });
      return null;
    }
  }

  /**
   * Get all missions
   */
  async getAllMissions(): Promise<SimpleMission[]> {
    try {
      return Array.from(this.missions.values());
    } catch (error) {
      logger.error("[AIEngine] Error getting all missions", error as Error);
      return [];
    }
  }

  /**
   * Update mission status
   */
  async updateMissionStatus(
    missionId: string,
    status: string
  ): Promise<SimpleMission | null> {
    try {
      const mission = this.missions.get(missionId);
      if (!mission) {
        logger.warn("[AIEngine] Mission not found", { missionId });
        return null;
      }
      
      mission.status = status;
      mission.updated_at = new Date().toISOString();
      this.missions.set(missionId, mission);
      
      logger.info("[AIEngine] Mission status updated", { missionId, status });
      return mission;
    } catch (error) {
      logger.error("[AIEngine] Error updating mission", error as Error, { missionId });
      return null;
    }
  }

  /**
   * Assign vessel to mission
   */
  async assignVesselToMission(
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
        updated_at: new Date().toISOString(),
      };
      
      const existingVessels = this.missionVessels.get(missionId) || [];
      this.missionVessels.set(missionId, [...existingVessels, assignment]);
      
      logger.info("[AIEngine] Vessel assigned", { missionId, vesselId, role });
      return assignment;
    } catch (error) {
      logger.error("[AIEngine] Error assigning vessel", error as Error, { missionId, vesselId });
      return null;
    }
  }

  /**
   * Get vessels assigned to mission
   */
  async getMissionVessels(missionId: string): Promise<MissionVessel[]> {
    try {
      return this.missionVessels.get(missionId) || [];
    } catch (error) {
      logger.error("[AIEngine] Error getting mission vessels", error as Error, { missionId });
      return [];
    }
  }

  /**
   * Add mission log entry
   */
  async addMissionLog(
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
        created_at: new Date().toISOString(),
      };
      
      const existingLogs = this.missionLogs.get(missionId) || [];
      this.missionLogs.set(missionId, [...existingLogs, log]);
      
      logger.info("[AIEngine] Log added", { missionId, logType });
      return log;
    } catch (error) {
      logger.error("[AIEngine] Error adding log", error as Error, { missionId });
      return null;
    }
  }

  /**
   * Get mission logs
   */
  async getMissionLogs(missionId: string): Promise<MissionLog[]> {
    try {
      return this.missionLogs.get(missionId) || [];
    } catch (error) {
      logger.error("[AIEngine] Error getting logs", error as Error, { missionId });
      return [];
    }
  }

  // ===== Metrics =====

  private updateMetrics(cacheHit: boolean): void {
    this.metrics.requestsProcessed++;
    this.metrics.cacheHitRate = cacheHit
      ? (this.metrics.cacheHitRate * (this.metrics.requestsProcessed - 1) + 1) /
        this.metrics.requestsProcessed
      : (this.metrics.cacheHitRate * (this.metrics.requestsProcessed - 1)) /
        this.metrics.requestsProcessed;
    this.metrics.lastUpdated = new Date().toISOString();
  }

  /**
   * Get current engine metrics
   */
  getMetrics(): AIEngineMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset all metrics
   */
  resetMetrics(): void {
    this.metrics = {
      requestsProcessed: 0,
      averageLatencyMs: 0,
      errorRate: 0,
      cacheHitRate: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

// ===== Singleton Export =====

export const aiEngineService = new UnifiedAIEngineService();

// ===== Backward Compatibility =====

// Re-export classes for backward compatibility
export { UnifiedAIEngineService };

// Legacy exports (for modules still using old imports)
export const DistributedAIService = {
  getVesselContext: (vesselId: string) => aiEngineService.getVesselContext(vesselId),
  createVesselContext: (vesselId: string) => aiEngineService.createVesselContext(vesselId),
  updateVesselContext: (vesselId: string, updates: Partial<VesselAIContext>) => 
    aiEngineService.updateVesselContext(vesselId, updates),
  clearCache: () => aiEngineService.clearContextCache(),
  needsGlobalSync: () => aiEngineService.needsGlobalSync(),
  performGlobalSync: () => aiEngineService.performGlobalSync(),
};

export const MissionCoordinationService = {
  createMission: (data: Parameters<typeof aiEngineService.createMission>[0]) => 
    aiEngineService.createMission(data),
  getMission: (id: string) => aiEngineService.getMission(id),
  getAllMissions: () => aiEngineService.getAllMissions(),
  updateMissionStatus: (id: string, status: string) => 
    aiEngineService.updateMissionStatus(id, status),
  assignVessel: (missionId: string, vesselId: string, role: VesselRole, notes?: string) => 
    aiEngineService.assignVesselToMission(missionId, vesselId, role, notes),
  getMissionVessels: (id: string) => aiEngineService.getMissionVessels(id),
  addMissionLog: (missionId: string, logType: MissionLog["log_type"], message: string, metadata?: Record<string, unknown>, vesselId?: string) => 
    aiEngineService.addMissionLog(missionId, logType, message, metadata, vesselId),
  getMissionLogs: (id: string) => aiEngineService.getMissionLogs(id),
};
