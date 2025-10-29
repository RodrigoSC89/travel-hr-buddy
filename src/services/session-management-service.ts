// PATCH 510: Session Management Service
import { supabase } from "@/integrations/supabase/client";
import { Logger } from "@/lib/utils/logger";

export interface ActiveSession {
  id?: string;
  user_id: string;
  session_token: string;
  refresh_token?: string | null;
  ip_address?: string;
  user_agent?: string | null;
  device_info?: Record<string, any>;
  last_activity: string;
  expires_at: string;
  created_at?: string;
  is_active: boolean | null;
}

export class SessionManagementService {
  /**
   * Get all active sessions for current user
   */
  static async getActiveSessions(): Promise<ActiveSession[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      const { data, error } = await supabase
        .from("active_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("last_activity", { ascending: false });

      if (error) {
        Logger.error("Error fetching active sessions", error, "SessionManagementService");
        return [];
      }

      return (data || []).map(d => ({
        id: d.id,
        user_id: d.user_id,
        session_token: d.session_token,
        refresh_token: d.refresh_token,
        ip_address: d.ip_address ? String(d.ip_address) : undefined,
        user_agent: d.user_agent,
        device_info: (d.device_info as any) || {},
        last_activity: d.last_activity,
        expires_at: d.expires_at,
        created_at: d.created_at,
        is_active: d.is_active
      }));
    } catch (error) {
      Logger.error("Exception fetching active sessions", error, "SessionManagementService");
      return [];
    }
  }

  /**
   * Revoke a specific session
   */
  static async revokeSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      const { error } = await supabase
        .from("active_sessions")
        .update({ is_active: false })
        .eq("id", sessionId)
        .eq("user_id", user.id);

      if (error) {
        Logger.error("Error revoking session", error, "SessionManagementService");
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      Logger.error("Exception revoking session", error, "SessionManagementService");
      return { success: false, error: String(error) };
    }
  }

  /**
   * Revoke all sessions except current
   */
  static async revokeAllOtherSessions(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return { success: false, error: "No active session" };
      }

      const { error } = await supabase
        .from("active_sessions")
        .update({ is_active: false })
        .eq("user_id", session.user.id)
        .neq("session_token", session.access_token);

      if (error) {
        Logger.error("Error revoking other sessions", error, "SessionManagementService");
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      Logger.error("Exception revoking other sessions", error, "SessionManagementService");
      return { success: false, error: String(error) };
    }
  }

  /**
   * Update last activity timestamp
   */
  static async updateActivity(sessionId: string): Promise<void> {
    try {
      await supabase
        .from("active_sessions")
        .update({ last_activity: new Date().toISOString() })
        .eq("id", sessionId);
    } catch (error) {
      Logger.warn("Exception updating session activity", error, "SessionManagementService");
    }
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return 0;

      const { data, error } = await supabase
        .from("active_sessions")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .lt("expires_at", new Date().toISOString())
        .select();

      if (error) {
        Logger.error("Error cleaning up expired sessions", error, "SessionManagementService");
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      Logger.error("Exception cleaning up expired sessions", error, "SessionManagementService");
      return 0;
    }
  }
}
