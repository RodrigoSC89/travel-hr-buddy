/**
 * PATCH 228 - Joint Tasking System
 * Mission management for delegation and synchronization between external and internal systems
 * Integrates with protocolAdapter for status synchronization
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import * as protocolAdapter from "@/core/interop/protocolAdapter";

// Mission Types
export type MissionType = 
  | 'surveillance'
  | 'rescue'
  | 'transport'
  | 'maintenance'
  | 'training'
  | 'combat'
  | 'humanitarian'
  | 'intelligence';

export type MissionStatus = 
  | 'planning'
  | 'assigned'
  | 'executing'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type MissionPriority = 'low' | 'medium' | 'high' | 'critical' | 'emergency';
export type SyncStatus = 'pending' | 'synced' | 'partial' | 'failed';

// Task Interface
export interface MissionTask {
  id: string;
  name: string;
  description: string;
  type: string;
  priority: MissionPriority;
  assignedTo?: string; // Entity ID
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  estimatedDuration?: number; // hours
  dependencies?: string[]; // Task IDs
  metadata?: Record<string, any>;
}

// External Entity (system, vessel, unit, etc.)
export interface ExternalEntity {
  id: string;
  type: 'system' | 'vessel' | 'aircraft' | 'unit' | 'station';
  name: string;
  protocol: protocolAdapter.ProtocolType;
  endpoint?: string;
  capabilities: string[];
  status: 'available' | 'busy' | 'offline';
  metadata?: Record<string, any>;
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
  missionData?: Record<string, any>;
}

// Task Assignment Result
export interface TaskAssignmentResult {
  taskId: string;
  entityId: string;
  success: boolean;
  error?: string;
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

/**
 * Create a new joint mission
 */
export async function createMission(
  mission: Omit<JointMission, 'id' | 'completionPercentage' | 'syncStatus' | 'syncErrors'>
): Promise<{ success: boolean; missionId?: string; error?: string }> {
  logger.info(`[JointTasking] Creating mission: ${mission.name}`);

  try {
    const missionId = `mission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newMission: JointMission = {
      ...mission,
      id: missionId,
      completionPercentage: 0,
      syncStatus: 'pending',
      syncErrors: [],
    };

    // Store in database
    const { error } = await supabase.from('joint_mission_log').insert({
      mission_id: newMission.id,
      mission_name: newMission.name,
      mission_type: newMission.type,
      mission_status: newMission.status,
      priority: newMission.priority,
      tasks: newMission.tasks,
      external_entities: newMission.externalEntities,
      internal_systems: newMission.internalSystems,
      sync_status: newMission.syncStatus,
      sync_errors: newMission.syncErrors,
      completion_percentage: newMission.completionPercentage,
      start_time: newMission.startTime?.toISOString(),
      end_time: newMission.endTime?.toISOString(),
      estimated_duration_hours: newMission.estimatedDurationHours,
      commander: newMission.commander,
      participants: newMission.participants || [],
      mission_data: newMission.missionData || {},
    });

    if (error) {
      logger.error('[JointTasking] Database error:', error);
      return { success: false, error: error.message };
    }

    logger.info(`[JointTasking] Mission created: ${missionId}`);
    return { success: true, missionId };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('[JointTasking] Failed to create mission:', error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Divide mission into tasks
 */
export function divideMission(
  mission: JointMission,
  divisionStrategy: 'capability' | 'priority' | 'sequential' = 'capability'
): MissionTask[] {
  logger.info(`[JointTasking] Dividing mission ${mission.id} using ${divisionStrategy} strategy`);

  const tasks: MissionTask[] = [];

  switch (divisionStrategy) {
    case 'capability':
      // Divide based on entity capabilities
      mission.externalEntities.forEach((entity, index) => {
        entity.capabilities.forEach(capability => {
          tasks.push({
            id: `task-${mission.id}-${index}-${capability}`,
            name: `${capability} Task`,
            description: `Execute ${capability} for ${mission.name}`,
            type: capability,
            priority: mission.priority,
            status: 'pending',
            metadata: {
              entityId: entity.id,
              capability,
            },
          });
        });
      });
      break;

    case 'priority':
      // Create tasks by priority levels
      const priorities: MissionPriority[] = ['emergency', 'critical', 'high', 'medium', 'low'];
      priorities.forEach((priority, index) => {
        if (index <= priorities.indexOf(mission.priority)) {
          tasks.push({
            id: `task-${mission.id}-p${index}`,
            name: `${priority.toUpperCase()} Priority Task`,
            description: `Handle ${priority} priority aspects of ${mission.name}`,
            type: 'general',
            priority,
            status: 'pending',
          });
        }
      });
      break;

    case 'sequential':
      // Create sequential tasks
      const phases = ['preparation', 'execution', 'completion'];
      phases.forEach((phase, index) => {
        tasks.push({
          id: `task-${mission.id}-s${index}`,
          name: `${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase`,
          description: `${phase} phase for ${mission.name}`,
          type: phase,
          priority: mission.priority,
          status: 'pending',
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

  // Initialize mapping
  entities.forEach(entity => {
    mapping.set(entity.id, []);
  });

  // Assign tasks based on capabilities and availability
  tasks.forEach(task => {
    const suitableEntities = entities.filter(entity =>
      entity.status === 'available' &&
      (entity.capabilities.includes(task.type) || entity.capabilities.includes('general'))
    );

    if (suitableEntities.length > 0) {
      // Assign to entity with least tasks (simple load balancing)
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
 * Synchronize mission status with external entities via protocolAdapter
 */
export async function syncMissionStatus(mission: JointMission): Promise<SyncResult> {
  const startTime = Date.now();
  logger.info(`[JointTasking] Syncing mission status: ${mission.id}`);

  const errors: string[] = [];
  let syncedTasks = 0;
  let failedTasks = 0;

  try {
    // Sync with each external entity
    const syncPromises = mission.externalEntities.map(async (entity) => {
      try {
        // Get tasks assigned to this entity
        const entityTasks = mission.tasks.filter(t => t.assignedTo === entity.id);

        if (entityTasks.length === 0) {
          return;
        }

        // Create status update message
        const message: protocolAdapter.ProtocolMessage = {
          protocol: entity.protocol,
          direction: 'outbound',
          sourceSystem: 'joint-tasking-system',
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

        // Send via protocol adapter
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

    // Update mission sync status in database
    await supabase
      .from('joint_mission_log')
      .update({
        sync_status: success ? 'synced' : (syncedTasks > 0 ? 'partial' : 'failed'),
        sync_errors: errors,
        last_sync_at: new Date().toISOString(),
      })
      .eq('mission_id', mission.id);

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
    logger.error('[JointTasking] Sync error:', error);

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
  status: MissionTask['status'],
  metadata?: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  logger.info(`[JointTasking] Updating task ${taskId} status to ${status}`);

  try {
    // Fetch current mission
    const { data: missions, error: fetchError } = await supabase
      .from('joint_mission_log')
      .select('*')
      .eq('mission_id', missionId)
      .single();

    if (fetchError || !missions) {
      return { success: false, error: 'Mission not found' };
    }

    const tasks = missions.tasks as MissionTask[];
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      return { success: false, error: 'Task not found' };
    }

    // Update task
    tasks[taskIndex].status = status;
    if (metadata) {
      tasks[taskIndex].metadata = { ...tasks[taskIndex].metadata, ...metadata };
    }

    if (status === 'completed') {
      tasks[taskIndex].endTime = new Date();
    }

    // Calculate completion percentage
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const completionPercentage = Math.round((completedTasks / tasks.length) * 100);

    // Update mission in database
    const { error: updateError } = await supabase
      .from('joint_mission_log')
      .update({
        tasks,
        completion_percentage: completionPercentage,
        mission_status: completionPercentage === 100 ? 'completed' : missions.mission_status,
      })
      .eq('mission_id', missionId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    logger.info(`[JointTasking] Task ${taskId} updated successfully`);
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('[JointTasking] Failed to update task status:', error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Get mission details
 */
export async function getMission(missionId: string): Promise<JointMission | null> {
  try {
    const { data, error } = await supabase
      .from('joint_mission_log')
      .select('*')
      .eq('mission_id', missionId)
      .single();

    if (error || !data) {
      logger.error('[JointTasking] Mission not found:', missionId);
      return null;
    }

    return {
      id: data.mission_id,
      name: data.mission_name,
      type: data.mission_type as MissionType,
      status: data.mission_status as MissionStatus,
      priority: data.priority as MissionPriority,
      tasks: data.tasks as MissionTask[],
      externalEntities: data.external_entities as ExternalEntity[],
      internalSystems: data.internal_systems as string[],
      commander: data.commander,
      participants: data.participants,
      startTime: data.start_time ? new Date(data.start_time) : undefined,
      endTime: data.end_time ? new Date(data.end_time) : undefined,
      estimatedDurationHours: data.estimated_duration_hours,
      actualDurationHours: data.actual_duration_hours,
      completionPercentage: data.completion_percentage,
      syncStatus: data.sync_status as SyncStatus,
      syncErrors: data.sync_errors || [],
      lastSyncAt: data.last_sync_at ? new Date(data.last_sync_at) : undefined,
      missionData: data.mission_data,
    };
  } catch (error) {
    logger.error('[JointTasking] Error fetching mission:', error);
    return null;
  }
}
