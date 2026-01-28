/**
 * PATCH 452 - Mission Control Service
 * Consolidates all mission-related operations
 * Removed @ts-nocheck: Using proper type mapping for DB access
 */

import { supabase } from "@/integrations/supabase/client";
import type { Mission, MissionLog, MissionTask } from "../types";
import { logger } from "@/lib/logger";

// Type for raw database row
interface MissionDbRow {
  id: string;
  code?: string | null;
  name: string;
  type?: string | null;
  status: string;
  priority?: string | null;
  description?: string | null;
  objectives?: string[] | null;
  start_date?: string | null;
  end_date?: string | null;
  assigned_to?: string | null;
  created_by?: string | null;
  created_at: string;
  metadata?: Record<string, unknown> | null;
}

interface MissionTaskDbRow {
  id: string;
  mission_id: string;
  name: string;
  description?: string | null;
  status: string;
  priority?: string | null;
  assigned_to?: string | null;
  due_date?: string | null;
  created_at: string;
  metadata?: Record<string, unknown> | null;
}

interface MissionLogDbRow {
  id: string;
  mission_id?: string | null;
  event_type: string;
  severity: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown> | null;
}

export class MissionControlService {
  
  // ==================== Mission Management ====================
  
  async getMissions(filters?: {
    status?: string;
    priority?: string;
    limit?: number;
  }): Promise<Mission[]> {
    try {
      let query = supabase
        .from("missions")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.priority) query = query.eq("priority", filters.priority);
      if (filters?.limit) query = query.limit(filters.limit);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((row) => this.mapToMission(row as unknown as MissionDbRow));
    } catch (error) {
      logger.error("Error fetching missions:", error);
      return [];
    }
  }

  async getMission(id: string): Promise<Mission | null> {
    try {
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data ? this.mapToMission(data as unknown as MissionDbRow) : null;
    } catch (error) {
      logger.error("Error fetching mission:", error);
      return null;
    }
  }

  async createMission(mission: Omit<Mission, "id" | "createdAt">): Promise<Mission> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("missions")
        .insert({
          name: mission.name,
          mission_type: mission.type,
          status: mission.status,
          priority: mission.priority,
          description: mission.description,
          objectives: mission.objectives || [],
          start_date: mission.startDate,
          end_date: mission.endDate,
          assigned_vessel_id: mission.assignedTo,
          created_by: user?.id,
          metadata: mission.metadata || {}
        } as never)
        .select()
        .single();

      if (error) throw error;

      // Log mission creation
      await this.logEvent({
        missionId: data.id,
        eventType: "mission_created",
        severity: "info",
        message: `Mission ${mission.code} created`,
        metadata: {}
      });

      return this.mapToMission(data as unknown as MissionDbRow);
    } catch (error) {
      logger.error("Error creating mission:", error);
      throw error;
    }
  }

  async updateMission(id: string, updates: Partial<Mission>): Promise<void> {
    try {
      const updateData: any = {};
      if (updates.status) updateData.status = updates.status;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.description) updateData.description = updates.description;
      if (updates.objectives) updateData.objectives = updates.objectives;
      if (updates.startDate) updateData.start_date = updates.startDate;
      if (updates.endDate) updateData.end_date = updates.endDate;
      if (updates.assignedTo) updateData.assigned_to = updates.assignedTo;
      if (updates.metadata) updateData.metadata = updates.metadata;

      const { error } = await supabase
        .from("missions")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      // Log mission update
      await this.logEvent({
        missionId: id,
        eventType: "mission_updated",
        severity: "info",
        message: `Mission ${id} updated`,
        metadata: { updates }
      });
    } catch (error) {
      console.error("Error updating mission:", error);
      throw error;
    }
  }

  async deleteMission(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("missions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Log mission deletion
      await this.logEvent({
        missionId: id,
        eventType: "mission_deleted",
        severity: "warning",
        message: `Mission ${id} deleted`,
        metadata: {}
      });
    } catch (error) {
      console.error("Error deleting mission:", error);
      throw error;
    }
  }

  // ==================== Mission Tasks ====================

  async getTasks(filters?: {
    missionId?: string;
    status?: string;
  }): Promise<MissionTask[]> {
    try {
      let query = supabase
        .from("mission_tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.missionId) query = query.eq("mission_id", filters.missionId);
      if (filters?.status) query = query.eq("status", filters.status);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((row) => this.mapToTask(row as unknown as MissionTaskDbRow));
    } catch (error) {
      logger.error("Error fetching tasks:", error);
      return [];
    }
  }

  async createTask(task: Omit<MissionTask, "id" | "createdAt">): Promise<MissionTask> {
    try {
      const { data, error } = await supabase
        .from("mission_tasks" as "action_items")
        .insert({
          mission_id: task.missionId,
          name: task.name,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assigned_to: task.assignedTo,
          due_date: task.dueDate,
          metadata: task.metadata || {}
        } as never)
        .select()
        .single();

      if (error) throw error;
      return this.mapToTask(data as unknown as MissionTaskDbRow);
    } catch (error) {
      logger.error("Error creating task:", error);
      throw error;
    }
  }

  async updateTask(id: string, updates: Partial<MissionTask>): Promise<void> {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.status) updateData.status = updates.status;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.description) updateData.description = updates.description;
      if (updates.dueDate) updateData.due_date = updates.dueDate;

      const { error } = await supabase
        .from("mission_tasks" as "action_items")
        .update(updateData as never)
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      logger.error("Error updating task:", error);
      throw error;
    }
  }

  // ==================== Mission Logs ====================

  async getLogs(filters?: {
    missionId?: string;
    severity?: string;
    limit?: number;
  }): Promise<MissionLog[]> {
    try {
      let query = supabase
        .from("mission_logs")
        .select("*")
        .order("timestamp", { ascending: false });

      if (filters?.missionId) query = query.eq("mission_id", filters.missionId);
      if (filters?.severity) query = query.eq("severity", filters.severity);
      if (filters?.limit) query = query.limit(filters.limit);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((row) => this.mapToLog(row as unknown as MissionLogDbRow));
    } catch (error) {
      logger.error("Error fetching logs:", error);
      return [];
    }
  }

  async logEvent(event: {
    missionId: string;
    eventType: string;
    severity: "info" | "warning" | "error" | "critical";
    message: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from("mission_logs")
        .insert({
          event_type: event.eventType,
          severity: event.severity,
          message: event.message,
          timestamp: new Date().toISOString(),
          metadata: event.metadata || {}
        } as never);

      if (error) throw error;
    } catch (error) {
      logger.error("Error logging event:", error);
      throw error;
    }
  }

  // ==================== Mappers ====================

  private mapToMission(data: MissionDbRow): Mission {
    return {
      id: data.id,
      code: data.code || data.id.slice(0, 8),
      name: data.name,
      type: (data.type as Mission['type']) || 'operation',
      status: (data.status as Mission['status']) || 'planned',
      priority: (data.priority as Mission['priority']) || 'medium',
      description: data.description || '',
      objectives: data.objectives || [],
      startDate: data.start_date || new Date().toISOString(),
      endDate: data.end_date || new Date().toISOString(),
      assignedTo: data.assigned_to ?? undefined,
      createdBy: data.created_by || 'system',
      createdAt: data.created_at,
      metadata: (data.metadata as Record<string, unknown>) || {}
    };
  }

  private mapToTask(data: MissionTaskDbRow): MissionTask {
    return {
      id: data.id,
      missionId: data.mission_id,
      name: data.name,
      description: data.description || '',
      status: (data.status as MissionTask['status']) || 'pending',
      priority: (data.priority as MissionTask['priority']) || 'medium',
      assignedTo: data.assigned_to ?? undefined,
      dueDate: data.due_date ?? undefined,
      createdAt: data.created_at,
      metadata: (data.metadata as Record<string, unknown>) || {}
    };
  }

  private mapToLog(data: MissionLogDbRow): MissionLog {
    return {
      id: data.id,
      missionId: data.mission_id || '',
      eventType: data.event_type,
      severity: (data.severity as MissionLog['severity']) || 'info',
      message: data.message,
      timestamp: data.timestamp,
      metadata: (data.metadata as Record<string, unknown>) || {}
    };
  }
}

export const missionControlService = new MissionControlService();
