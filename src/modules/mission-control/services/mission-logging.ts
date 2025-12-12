/**
 * PATCH 272 - Mission Control Logging Service
 */

import { supabase } from "@/integrations/supabase/client";

type LogSeverity = "info" | "warning" | "error" | "critical";

export interface MissionLog {
  id?: string;
  missionId: string;
  userId?: string;
  eventType: string;
  eventData?: Record<string, any>;
  severity: LogSeverity;
  message?: string;
  createdAt?: string;
}

export class MissionLoggingService {
  
  async logEvent(
    missionId: string,
    eventType: string,
    severity: LogSeverity = "info",
    message?: string,
    eventData?: Record<string, any>
  ): Promise<MissionLog | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("mission_control_logs")
        .insert({
          mission_id: missionId,
          user_id: user?.id,
          event_type: eventType,
          event_data: eventData || {},
          severity,
          message
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapToLog(data);
    } catch (error) {
      console.error("Error logging mission event:", error);
      return null;
    }
  }

  async getMissionLogs(missionId: string, limit: number = 100): Promise<MissionLog[]> {
    try {
      const { data, error } = await supabase
        .from("mission_control_logs")
        .select("*")
        .eq("mission_id", missionId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(this.mapToLog);
    } catch (error) {
      console.error("Error fetching mission logs:", error);
      return [];
    }
  }

  async getRecentLogs(limit: number = 50): Promise<MissionLog[]> {
    try {
      const { data, error } = await supabase
        .from("mission_control_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(this.mapToLog);
    } catch (error) {
      console.error("Error fetching recent logs:", error);
      return [];
    }
  }

  async getLogsBySeverity(severity: LogSeverity, limit: number = 100): Promise<MissionLog[]> {
    try {
      const { data, error } = await supabase
        .from("mission_control_logs")
        .select("*")
        .eq("severity", severity)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(this.mapToLog);
    } catch (error) {
      console.error("Error fetching logs by severity:", error);
      return [];
    }
  }

  private mapToLog(data: any): MissionLog {
    return {
      id: data.id,
      missionId: data.mission_id,
      userId: data.user_id,
      eventType: data.event_type,
      eventData: data.event_data,
      severity: data.severity,
      message: data.message,
      createdAt: data.created_at
    });
  }
}

export const missionLoggingService = new MissionLoggingService();
