// @ts-nocheck
// PATCH 228 - Joint Tasking
import { supabase } from "@/integrations/supabase/client";

export interface ExternalEntity {
  entity_id: string;
  name: string;
  entity_type: string;
  trust_score?: number;
  status?: 'active' | 'inactive' | 'suspended';
  metadata?: Record<string, any>;
}

export interface JointMissionTask {
  mission_id: string;
  task_name: string;
  assigned_entity: string;
  payload: any;
  status?: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
}

// Register external entity
export async function registerExternalEntity(entity: ExternalEntity) {
  const { data, error } = await supabase
    .from('external_entities')
    .insert({
      entity_id: entity.entity_id,
      name: entity.name,
      entity_type: entity.entity_type,
      trust_score: entity.trust_score || 50.0,
      status: entity.status || 'active',
      metadata: entity.metadata || {}
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Assign mission task to external entity
export async function assignMissionTask(task: JointMissionTask) {
  // Validate entity exists and is active
  const { data: entity, error: entityError } = await supabase
    .from('external_entities')
    .select('*')
    .eq('entity_id', task.assigned_entity)
    .single();

  if (entityError || !entity) {
    throw new Error(`External entity ${task.assigned_entity} not found`);
  }

  if (entity.status !== 'active') {
    throw new Error(`External entity ${task.assigned_entity} is not active`);
  }

  // Create mission task
  const { data: taskData, error: taskError } = await supabase
    .from('joint_mission_tasks')
    .insert({
      mission_id: task.mission_id,
      task_name: task.task_name,
      assigned_entity: task.assigned_entity,
      payload: task.payload,
      status: 'assigned'
    })
    .select()
    .single();

  if (taskError) throw taskError;

  // Log mission event
  await logMissionEvent(task.mission_id, 'task_assigned', {
    task_id: taskData.id,
    task_name: task.task_name,
    entity_id: task.assigned_entity,
    entity_name: entity.name
  }, 'info');

  return taskData;
}

// Update task status (simulating remote entity status sync)
export async function updateTaskStatus(
  taskId: string,
  status: 'in_progress' | 'completed' | 'failed',
  result?: any
) {
  const updates: any = {
    status: status,
    updated_at: new Date().toISOString()
  };

  if (status === 'completed' || status === 'failed') {
    updates.completed_at = new Date().toISOString();
    if (result) {
      updates.result = result;
    }
  }

  const { data, error } = await supabase
    .from('joint_mission_tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;

  // Log status change
  await logMissionEvent(data.mission_id, 'task_status_change', {
    task_id: taskId,
    old_status: 'assigned',
    new_status: status,
    result: result
  }, status === 'failed' ? 'warning' : 'info');

  return data;
}

// Get mission tasks
export async function getMissionTasks(missionId: string) {
  const { data, error } = await supabase
    .from('joint_mission_tasks')
    .select(`
      *,
      external_entities:assigned_entity (
        entity_id,
        name,
        entity_type,
        trust_score,
        status
      )
    `)
    .eq('mission_id', missionId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Get all external entities
export async function getExternalEntities(status?: string) {
  let query = supabase
    .from('external_entities')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Log mission event
async function logMissionEvent(
  missionId: string,
  eventType: string,
  details: any,
  severity: 'info' | 'warning' | 'error' | 'critical' = 'info'
) {
  await supabase.from('joint_mission_log').insert({
    mission_id: missionId,
    event_type: eventType,
    details: details,
    severity: severity
  });
}

// Get mission logs
export async function getMissionLogs(missionId: string, limit: number = 100) {
  const { data, error } = await supabase
    .from('joint_mission_log')
    .select('*')
    .eq('mission_id', missionId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
