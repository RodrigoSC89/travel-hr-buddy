/**
 * PATCH 452 - Mission Control Service
 * Consolidates all mission-related operations
 * PATCH DEBT-FIX: Removed (supabase as any), aligned with real schema
 */

import { supabase } from "@/integrations/supabase/client";
import type { Mission, MissionLog, MissionTask } from "../types";
import { logger } from '@/lib/logger';

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
      return data ? this.mapToMission(data) : null;
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
          mission_name: mission.name,
          mission_code: mission.code || `MSN-${Date.now()}`,
          mission_type: mission.type || "operation",
          name: mission.name,
          type: mission.type,
          status: mission.status,
          priority: mission.priority,
          description: mission.description,
          objectives: mission.objectives || [],
          start_date: mission.startDate,
          end_date: mission.endDate,
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
        message: `Mission ${data.mission_code} created`,
        metadata: {}
      });

      return this.mapToMission(data);
    } catch (error) {
      logger.error("Error creating mission:", error);
      throw error;
    }
  }

  async updateMission(id: string, updates: Partial<Mission>): Promise<void> {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.status) updateData.status = updates.status;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.description) updateData.description = updates.description;
      if (updates.objectives) updateData.objectives = updates.objectives;
      if (updates.startDate) updateData.start_date = updates.startDate;
      if (updates.endDate) updateData.end_date = updates.endDate;
      if (updates.metadata) updateData.metadata = updates.metadata;
      if (updates.name) {
        updateData.name = updates.name;
        updateData.mission_name = updates.name;
      }

      const { error } = await supabase
        .from("missions")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      await this.logEvent({
        missionId: id,
        eventType: "mission_updated",
        severity: "info",
        message: `Mission ${id} updated`,
        metadata: { updates }
      });
    } catch (error) {
      logger.error("Error updating mission:", error);
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

      await this.logEvent({
        missionId: id,
        eventType: "mission_deleted",
        severity: "warning",
        message: `Mission ${id} deleted`,
        metadata: {}
      });
    } catch (error) {
      logger.error("Error deleting mission:", error);
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
      logger.error("Error fetching tasks:", error);
      return [];
    }
  }

  async createTask(task: Omit<MissionTask, "id" | "createdAt">): Promise<MissionTask> {
    try {
      const { data, error } = await supabase
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
        .from("mission_tasks")
        .update(updateData)
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
        .order("created_at", { ascending: false });

      if (filters?.missionId) query = query.eq("mission_id", filters.missionId);
      if (filters?.limit) query = query.limit(filters.limit);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(this.mapToLog);
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
      // Log event silently - non-critical
      await supabase
        .from("access_logs")
        .insert([{
          action: event.eventType,
          module_accessed: "mission_control",
          result: event.message,
          severity: event.severity,
        }]);
    } catch (error) {
      logger.error("Error logging event:", error);
    }
  }

  // ==================== Mappers ====================

  private mapToMission(data: Record<string, unknown>): Mission {
    const validTypes: Mission["type"][] = ["operation", "maintenance", "inspection", "emergency", "training"];
    const validStatuses: Mission["status"][] = ["planned", "in-progress", "completed", "cancelled", "paused"];
    const validPriorities: Mission["priority"][] = ["low", "medium", "high", "critical"];

    const rawType = (data.type || data.mission_type || "operation") as string;
    const rawStatus = (data.status || "planned") as string;
    const rawPriority = (data.priority || "medium") as string;

    return {
      id: data.id as string,
      code: (data.code || data.mission_code || "") as string,
      name: (data.name || data.mission_name || "") as string,
      type: validTypes.includes(rawType as Mission["type"]) ? rawType as Mission["type"] : "operation",
      status: validStatuses.includes(rawStatus as Mission["status"]) ? rawStatus as Mission["status"] : "planned",
      priority: validPriorities.includes(rawPriority as Mission["priority"]) ? rawPriority as Mission["priority"] : "medium",
      description: (data.description || "") as string,
      objectives: (data.objectives || []) as string[],
      startDate: (data.start_date || "") as string,
      endDate: (data.end_date || "") as string,
      assignedTo: data.assigned_to as string | undefined,
      createdBy: (data.created_by || "") as string,
      createdAt: (data.created_at || "") as string,
      metadata: (data.metadata || {}) as Record<string, unknown>
    };
  }

  private mapToTask(data: Record<string, unknown>): MissionTask {
    const validStatuses: MissionTask["status"][] = ["pending", "in-progress", "completed", "failed"];
    const validPriorities: MissionTask["priority"][] = ["low", "medium", "high"];

    const rawStatus = (data.status || "pending") as string;
    const rawPriority = (data.priority || "medium") as string;

    return {
      id: data.id as string,
      missionId: (data.mission_id || "") as string,
      name: (data.name || "") as string,
      description: (data.description || "") as string,
      status: validStatuses.includes(rawStatus as MissionTask["status"]) ? rawStatus as MissionTask["status"] : "pending",
      priority: validPriorities.includes(rawPriority as MissionTask["priority"]) ? rawPriority as MissionTask["priority"] : "medium",
      assignedTo: data.assigned_to as string | undefined,
      dueDate: data.due_date as string | undefined,
      createdAt: (data.created_at || "") as string,
      metadata: (data.metadata || {}) as Record<string, unknown>
    };
  }

  private mapToLog(data: Record<string, unknown>): MissionLog {
    const validSeverities: MissionLog["severity"][] = ["info", "warning", "error", "critical"];
    const rawSeverity = (data.status || "info") as string;

    return {
      id: data.id as string,
      missionId: (data.mission_id || "") as string,
      eventType: (data.log_type || "") as string,
      severity: validSeverities.includes(rawSeverity as MissionLog["severity"]) ? rawSeverity as MissionLog["severity"] : "info",
      message: (data.message || data.description || "") as string,
      timestamp: (data.timestamp || data.created_at || "") as string,
      metadata: (data.metadata || {}) as Record<string, unknown>
    };
  }
}

export const missionControlService = new MissionControlService();
