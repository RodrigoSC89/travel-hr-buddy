// PATCH 506: AI Memory Layer Service
import { supabase } from "@/integrations/supabase/client";
import { Logger } from "@/lib/utils/logger";

export interface AIMemoryEvent {
  id?: string;
  user_id?: string;
  organization_id?: string;
  event_type: string;
  event_data: Record<string, any>;
  context?: string;
  metadata?: Record<string, any>;
  confidence?: number;
  created_at?: string;
}

export class AIMemoryService {
  static async storeEvent(event: AIMemoryEvent): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      const { error } = await supabase
        .from("ai_memory_events")
        .insert({
          user_id: user.id,
          event_type: event.event_type,
          event_data: event.event_data,
          context: event.context,
          metadata: event.metadata || {},
          confidence: event.confidence || 0.0,
          organization_id: event.organization_id
        });

      if (error) {
        Logger.error("Error storing AI memory event", error, "AIMemoryService");
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      Logger.error("Exception storing AI memory event", error, "AIMemoryService");
      return { success: false, error: String(error) };
    }
  }

  static async getRecentEvents(limit = 20): Promise<AIMemoryEvent[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      const { data, error } = await supabase
        .from("ai_memory_events")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        Logger.error("Error fetching recent AI memory events", error, "AIMemoryService");
        return [];
      }

      return (data || []).map(d => ({
        id: d.id,
        user_id: d.user_id || undefined,
        organization_id: d.organization_id || undefined,
        event_type: d.event_type,
        event_data: d.event_data as Record<string, any>,
        context: d.context || undefined,
        metadata: d.metadata as Record<string, any>,
        confidence: d.confidence || undefined,
        created_at: d.created_at
      }));
    } catch (error) {
      Logger.error("Exception fetching recent AI memory events", error, "AIMemoryService");
      return [];
    }
  }

  static async searchByContext(query: string, limit = 10): Promise<AIMemoryEvent[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      const { data, error } = await supabase
        .from("ai_memory_events")
        .select("*")
        .eq("user_id", user.id)
        .ilike("context", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        Logger.error("Error searching AI memory events", error, "AIMemoryService");
        return [];
      }

      return (data || []).map(d => ({
        id: d.id,
        user_id: d.user_id || undefined,
        organization_id: d.organization_id || undefined,
        event_type: d.event_type,
        event_data: d.event_data as Record<string, any>,
        context: d.context || undefined,
        metadata: d.metadata as Record<string, any>,
        confidence: d.confidence || undefined,
        created_at: d.created_at
      }));
    } catch (error) {
      Logger.error("Exception searching AI memory events", error, "AIMemoryService");
      return [];
    }
  }

  static async getEventsByType(eventType: string, limit = 50): Promise<AIMemoryEvent[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      const { data, error } = await supabase
        .from("ai_memory_events")
        .select("*")
        .eq("user_id", user.id)
        .eq("event_type", eventType)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        Logger.error("Error fetching AI memory events", error, "AIMemoryService");
        return [];
      }

      return (data || []).map(d => ({
        id: d.id,
        user_id: d.user_id || undefined,
        organization_id: d.organization_id || undefined,
        event_type: d.event_type,
        event_data: d.event_data as Record<string, any>,
        context: d.context || undefined,
        metadata: d.metadata as Record<string, any>,
        confidence: d.confidence || undefined,
        created_at: d.created_at
      }));
    } catch (error) {
      Logger.error("Exception fetching AI memory events", error, "AIMemoryService");
      return [];
    }
  }
}
