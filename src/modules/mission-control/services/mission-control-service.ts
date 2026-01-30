// @ts-nocheck
/**
 * PATCH 452 - Mission Control Service
 * Consolidates all mission-related operations
 */

import { supabase } from "@/integrations/supabase/client";
import type { Mission, MissionLog, MissionTask } from "../types";

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

      return (data || []).map(this.mapToMission);
    } catch (error) {
      console.error("Error fetching missions:", error);
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
      return data ? this.mapToMission(data) : null;
    } catch (error) {
      console.error("Error fetching mission:", error);
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
          type: mission.type,
          status: mission.status,
          priority: mission.priority,
          description: mission.description,
          objectives: mission.objectives || [],
          start_date: mission.startDate,
          end_date: mission.endDate,
          assigned_to: mission.assignedTo,
          created_by: user?.id,
          metadata: mission.metadata || {}
        })
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

      return this.mapToMission(data);
    } catch (error) {
      console.error("Error creating mission:", error);
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

      return (data || []).map(this.mapToTask);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  }

  async createTask(task: Omit<MissionTask, "id" | "createdAt">): Promise<MissionTask> {
    try {
      const { data, error } = await (supabase as any)
        .from("mission_tasks")
        .insert({
          mission_id: task.missionId,
          name: task.name,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assigned_to: task.assignedTo,
          due_date: task.dueDate,
          metadata: task.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapToTask(data);
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  async updateTask(id: string, updates: Partial<MissionTask>): Promise<void> {
    try {
      const updateData: any = {};
      if (updates.status) updateData.status = updates.status;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.description) updateData.description = updates.description;
      if (updates.dueDate) updateData.due_date = updates.dueDate;

      const { error } = await (supabase as any)
        .from("mission_tasks")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating task:", error);
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

      return (data || []).map(this.mapToLog);
    } catch (error) {
      console.error("Error fetching logs:", error);
      return [];
    }
  }

  async logEvent(event: {
    missionId: string;
    eventType: string;
    severity: "info" | "warning" | "error" | "critical";
    message: string;
    metadata?: Record<string, any>;
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
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error logging event:", error);
      throw error;
    }
  }

  // ==================== Mappers ====================

  private mapToMission(data: any): Mission {
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      type: data.type,
      status: data.status,
      priority: data.priority,
      description: data.description,
      objectives: data.objectives || [],
      startDate: data.start_date,
      endDate: data.end_date,
      assignedTo: data.assigned_to,
      createdBy: data.created_by,
      createdAt: data.created_at,
      metadata: data.metadata || {}
    };
  }

  private mapToTask(data: any): MissionTask {
    return {
      id: data.id,
      missionId: data.mission_id,
      name: data.name,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignedTo: data.assigned_to,
      dueDate: data.due_date,
      createdAt: data.created_at,
      metadata: data.metadata || {}
    };
  }

  private mapToLog(data: any): MissionLog {
    return {
      id: data.id,
      missionId: data.mission_id,
      eventType: data.event_type,
      severity: data.severity,
      message: data.message,
      timestamp: data.timestamp,
      metadata: data.metadata || {}
    };
  }
}

export const missionControlService = new MissionControlService();
