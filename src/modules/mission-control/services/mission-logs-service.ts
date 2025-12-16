/**
 * PATCH 266 - Mission Logs Service
 */

import { supabase } from "@/integrations/supabase/client";

export interface MissionLog {
  id?: string;
  missionId?: string;
  missionName: string;
  missionDate: string;
  crewMembers: string[];
  status: "planned" | "in-progress" | "completed" | "cancelled";
  description?: string;
  location?: string;
  metadata?: Record<string, any>;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class MissionLogsService {
  
  async createLog(log: MissionLog): Promise<MissionLog> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("mission_logs")
        .insert({
          mission_id: log.missionId,
          mission_name: log.missionName,
          mission_date: log.missionDate,
          crew_members: log.crewMembers,
          status: log.status,
          description: log.description,
          location: log.location,
          metadata: log.metadata || {},
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapToLog(data);
    } catch (error) {
      console.error("Error creating mission log:", error);
      throw error;
    }
  }

  async updateLog(id: string, log: Partial<MissionLog>): Promise<MissionLog> {
    try {
      const updateData: any = {};
      if (log.missionName) updateData.mission_name = log.missionName;
      if (log.missionDate) updateData.mission_date = log.missionDate;
      if (log.crewMembers) updateData.crew_members = log.crewMembers;
      if (log.status) updateData.status = log.status;
      if (log.description !== undefined) updateData.description = log.description;
      if (log.location !== undefined) updateData.location = log.location;
      if (log.metadata) updateData.metadata = log.metadata;

      const { data, error } = await supabase
        .from("mission_logs")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return this.mapToLog(data);
    } catch (error) {
      console.error("Error updating mission log:", error);
      throw error;
    }
  }

  async deleteLog(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("mission_logs")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting mission log:", error);
      throw error;
    }
  }

  async getLogs(filters?: { status?: string; dateFrom?: string; dateTo?: string }): Promise<MissionLog[]> {
    try {
      let query = supabase
        .from("mission_logs")
        .select("*")
        .order("mission_date", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.dateFrom) {
        query = query.gte("mission_date", filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte("mission_date", filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(this.mapToLog);
    } catch (error) {
      console.error("Error fetching mission logs:", error);
      return [];
    }
  }

  async getLog(id: string): Promise<MissionLog | null> {
    try {
      const { data, error } = await supabase
        .from("mission_logs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data ? this.mapToLog(data) : null;
    } catch (error) {
      console.error("Error fetching mission log:", error);
      return null;
    }
  }

  private mapToLog(data: any): MissionLog {
    return {
      id: data.id,
      missionId: data.mission_id,
      missionName: data.mission_name,
      missionDate: data.mission_date,
      crewMembers: data.crew_members || [],
      status: data.status,
      description: data.description,
      location: data.location,
      metadata: data.metadata || {},
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

export const missionLogsService = new MissionLogsService();
