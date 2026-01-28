/**
 * PATCH 881 - Joint Tasking System
 * Type-safe using direct Supabase queries with proper typing
 * Mission management for delegation and synchronization
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import * as protocolAdapter from "@/core/interop/protocolAdapter";
import type { Json } from "@/integrations/supabase/types";

// Mission Types
export type MissionType = 
  | "surveillance"
  | "rescue"
  | "transport"
  | "maintenance"
  | "training"
  | "combat"
  | "humanitarian"
  | "intelligence";

export type MissionStatus = 
  | "planning"
  | "assigned"
  | "executing"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export type MissionPriority = "low" | "medium" | "high" | "critical" | "emergency";
export type SyncStatus = "pending" | "synced" | "partial" | "failed";

// Task Interface
export interface MissionTask {
  id: string;
  name: string;
  description: string;
  type: string;
  priority: MissionPriority;
  assignedTo?: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  startTime?: Date;
  endTime?: Date;
  estimatedDuration?: number;
  dependencies?: string[];
  metadata?: Record<string, unknown>;
}

// External Entity
export interface ExternalEntity {
  id: string;
  type: "system" | "vessel" | "aircraft" | "unit" | "station";
  name: string;
  protocol: protocolAdapter.ProtocolType;
  endpoint?: string;
  capabilities: string[];
  status: "available" | "busy" | "offline";
  metadata?: Record<string, unknown>;
}

// Joint Mission
export interface JointMission {
  id: string;
  name: string;
  type: MissionType;
  status: MissionStatus;
  priority: MissionPriority;
  tasks: MissionTask[];
  externalEntities: ExternalEntity[];
  internalSystems: string[];
  commander?: string;
  participants?: string[];
  startTime?: Date;
  endTime?: Date;
  estimatedDurationHours?: number;
  actualDurationHours?: number;
  completionPercentage: number;
  syncStatus: SyncStatus;
  syncErrors: string[];
  lastSyncAt?: Date;
  missionData?: Record<string, unknown>;
}

// Sync Result
export interface SyncResult {
  missionId: string;
  success: boolean;
  syncedTasks: number;
  failedTasks: number;
  errors: string[];
  latencyMs: number;
}

// In-memory mission store (simulating DB for tables that may not exist)
const missionStore = new Map<string, JointMission>();

/**
 * Create a new joint mission
 */
export async function createMission(
  mission: Omit<JointMission, "id" | "completionPercentage" | "syncStatus" | "syncErrors">
): Promise<{ success: boolean; missionId?: string; error?: string }> {
  logger.info(`[JointTasking] Creating mission: ${mission.name}`);

  try {
    const missionId = `mission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newMission: JointMission = {
      ...mission,
      id: missionId,
      completionPercentage: 0,
      syncStatus: "pending",
      syncErrors: [],
    };

    // Store in memory (fallback if table doesn't exist)
    missionStore.set(missionId, newMission);

    // Try to store in action_items as a workaround
    try {
      await supabase.from("action_items").insert({
        title: `Mission: ${newMission.name}`,
        description: JSON.stringify({
          type: "joint_mission",
          missionId: newMission.id,
          missionType: newMission.type,
          status: newMission.status,
          priority: newMission.priority,
          tasks: newMission.tasks,
          externalEntities: newMission.externalEntities,
          internalSystems: newMission.internalSystems,
        }),
        source_module: "joint-tasking",
        priority: newMission.priority,
        status: "pending",
      });
    } catch (dbError) {
      logger.warn("[JointTasking] Could not persist to DB, using in-memory store", { error: dbError });
    }

    logger.info(`[JointTasking] Mission created: ${missionId}`);
    return { success: true, missionId };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error("[JointTasking] Failed to create mission:", error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Divide mission into tasks
 */
export function divideMission(
  mission: JointMission,
  divisionStrategy: "capability" | "priority" | "sequential" = "capability"
): MissionTask[] {
  logger.info(`[JointTasking] Dividing mission ${mission.id} using ${divisionStrategy} strategy`);

  const tasks: MissionTask[] = [];

  switch (divisionStrategy) {
  case "capability":
    mission.externalEntities.forEach((entity, index) => {
      entity.capabilities.forEach(capability => {
        tasks.push({
          id: `task-${mission.id}-${index}-${capability}`,
          name: `${capability} Task`,
          description: `Execute ${capability} for ${mission.name}`,
          type: capability,
          priority: mission.priority,
          status: "pending",
          metadata: {
            entityId: entity.id,
            capability,
          },
        });
      });
    });
    break;

  case "priority":
    const priorities: MissionPriority[] = ["emergency", "critical", "high", "medium", "low"];
    priorities.forEach((priority, index) => {
      if (index <= priorities.indexOf(mission.priority)) {
        tasks.push({
          id: `task-${mission.id}-p${index}`,
          name: `${priority.toUpperCase()} Priority Task`,
          description: `Handle ${priority} priority aspects of ${mission.name}`,
          type: "general",
          priority,
          status: "pending",
        });
      }
    });
    break;

  case "sequential":
    const phases = ["preparation", "execution", "completion"];
    phases.forEach((phase, index) => {
      tasks.push({
        id: `task-${mission.id}-s${index}`,
        name: `${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase`,
        description: `${phase} phase for ${mission.name}`,
        type: phase,
        priority: mission.priority,
        status: "pending",
        dependencies: index > 0 ? [`task-${mission.id}-s${index - 1}`] : undefined,
      });
    });
    break;
  }

  logger.info(`[JointTasking] Created ${tasks.length} tasks for mission ${mission.id}`);
  return tasks;
}

/**
 * Map tasks to external entities
 */
export function mapTasksToEntities(
  tasks: MissionTask[],
  entities: ExternalEntity[]
): Map<string, MissionTask[]> {
  logger.info(`[JointTasking] Mapping ${tasks.length} tasks to ${entities.length} entities`);

  const mapping = new Map<string, MissionTask[]>();

  entities.forEach(entity => {
    mapping.set(entity.id, []);
  });

  tasks.forEach(task => {
    const suitableEntities = entities.filter(entity =>
      entity.status === "available" &&
      (entity.capabilities.includes(task.type) || entity.capabilities.includes("general"))
    );

    if (suitableEntities.length > 0) {
      const selectedEntity = suitableEntities.reduce((prev, curr) => {
        const prevTasks = mapping.get(prev.id)?.length || 0;
        const currTasks = mapping.get(curr.id)?.length || 0;
        return currTasks < prevTasks ? curr : prev;
      });

      task.assignedTo = selectedEntity.id;
      mapping.get(selectedEntity.id)?.push(task);
    } else {
      logger.warn(`[JointTasking] No suitable entity found for task ${task.id}`);
    }
  });

  return mapping;
}

/**
 * Synchronize mission status with external entities
 */
export async function syncMissionStatus(mission: JointMission): Promise<SyncResult> {
  const startTime = Date.now();
  logger.info(`[JointTasking] Syncing mission status: ${mission.id}`);

  const errors: string[] = [];
  let syncedTasks = 0;
  let failedTasks = 0;

  try {
    const syncPromises = mission.externalEntities.map(async (entity) => {
      try {
        const entityTasks = mission.tasks.filter(t => t.assignedTo === entity.id);

        if (entityTasks.length === 0) {
          return;
        }

        const message: protocolAdapter.ProtocolMessage = {
          protocol: entity.protocol,
          direction: "outbound",
          sourceSystem: "joint-tasking-system",
          targetSystem: entity.id,
          payload: {
            missionId: mission.id,
            missionName: mission.name,
            tasks: entityTasks.map(t => ({
              taskId: t.id,
              name: t.name,
              status: t.status,
              priority: t.priority,
            })),
            timestamp: new Date().toISOString(),
          },
        };

        const result = await protocolAdapter.processMessage(message);

        if (result.success) {
          syncedTasks += entityTasks.length;
          logger.info(`[JointTasking] Synced ${entityTasks.length} tasks with ${entity.name}`);
        } else {
          failedTasks += entityTasks.length;
          errors.push(`Failed to sync with ${entity.name}: ${result.error}`);
        }
      } catch (error) {
        failedTasks += mission.tasks.filter(t => t.assignedTo === entity.id).length;
        errors.push(`Error syncing with ${entity.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    });

    await Promise.all(syncPromises);

    const latencyMs = Date.now() - startTime;
    const success = failedTasks === 0;

    // Update in-memory store
    const storedMission = missionStore.get(mission.id);
    if (storedMission) {
      storedMission.syncStatus = success ? "synced" : (syncedTasks > 0 ? "partial" : "failed");
      storedMission.syncErrors = errors;
      storedMission.lastSyncAt = new Date();
    }

    logger.info(`[JointTasking] Sync complete: ${syncedTasks} synced, ${failedTasks} failed`);

    return {
      missionId: mission.id,
      success,
      syncedTasks,
      failedTasks,
      errors,
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error("[JointTasking] Sync error:", error);

    return {
      missionId: mission.id,
      success: false,
      syncedTasks,
      failedTasks: mission.tasks.length,
      errors: [...errors, errorMsg],
      latencyMs,
    };
  }
}

/**
 * Update mission task status
 */
export async function updateTaskStatus(
  missionId: string,
  taskId: string,
  status: MissionTask["status"],
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  logger.info(`[JointTasking] Updating task ${taskId} status to ${status}`);

  try {
    const mission = missionStore.get(missionId);

    if (!mission) {
      return { success: false, error: "Mission not found" };
    }

    const taskIndex = mission.tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      return { success: false, error: "Task not found" };
    }

    mission.tasks[taskIndex].status = status;
    if (metadata) {
      mission.tasks[taskIndex].metadata = { ...mission.tasks[taskIndex].metadata, ...metadata };
    }

    if (status === "completed") {
      mission.tasks[taskIndex].endTime = new Date();
    }

    const completedTasks = mission.tasks.filter(t => t.status === "completed").length;
    mission.completionPercentage = Math.round((completedTasks / mission.tasks.length) * 100);

    if (mission.completionPercentage === 100) {
      mission.status = "completed";
    }

    logger.info(`[JointTasking] Task ${taskId} updated successfully`);
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error("[JointTasking] Failed to update task status:", error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Get mission details
 */
export async function getMission(missionId: string): Promise<JointMission | null> {
  try {
    const mission = missionStore.get(missionId);

    if (!mission) {
      logger.error("[JointTasking] Mission not found:", missionId);
      return null;
    }

    return mission;
  } catch (error) {
    logger.error("[JointTasking] Error fetching mission:", error);
    return null;
  }
}
