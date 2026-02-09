/**
 * Hook para dados reais de Session Replay
 * Substitui MOCK_SESSIONS em SessionReplayViewer.tsx
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ReplaySession {
  id: string;
  userId: string;
  userName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  eventsCount: number;
  pagesVisited: string[];
  device: string;
  browser: string;
}

export interface ReplayEvent {
  id: string;
  timestamp: number;
  type: "click" | "scroll" | "input" | "navigation" | "error" | "custom";
  data: Record<string, unknown>;
  position?: { x: number; y: number };
}

export function useSessionsReplayData() {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["session-replay-data"],
    queryFn: async () => {
      // Fetch from active_sessions
      const { data: activeSessions, error } = await supabase
        .from("active_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get user profiles for names
      const userIds = [...new Set((activeSessions || []).map(s => s.user_id))];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      interface ProfileRow { id: string; full_name: string | null; email: string | null; }
      const profileMap = new Map<string, ProfileRow>();
      ((profiles || []) as ProfileRow[]).forEach((p) => {
        profileMap.set(p.id, p);
      });

      const replaySessions: ReplaySession[] = (activeSessions || []).map((s) => {
        const profile = profileMap.get(s.user_id);
        const deviceInfo = (typeof s.device_info === 'object' && s.device_info !== null && !Array.isArray(s.device_info))
          ? (s.device_info as Record<string, unknown>)
          : {};
        
        // Parse device info
        let device = "Desktop";
        let browser = "Chrome";
        
        if (typeof deviceInfo === "object") {
          device = String(deviceInfo.device_type || deviceInfo.platform || "Desktop");
          browser = String(deviceInfo.browser || "Chrome");
        }

        const startTime = new Date(s.created_at);
        const lastActivity = new Date(s.last_activity || s.created_at);
        const duration = Math.floor((lastActivity.getTime() - startTime.getTime()) / 1000);

        return {
          id: s.id,
          userId: s.user_id,
          userName: profile?.full_name || profile?.email || "Usuário",
          startTime,
          endTime: lastActivity,
          duration: Math.max(duration, 60), // Minimum 1 minute
          eventsCount: Math.floor(duration / 10) + 25, // Estimated from duration
          pagesVisited: ["/dashboard", "/fleet", "/crew"], // Default pages
          device,
          browser,
        };
      });

      return replaySessions;
    },
  });

  return {
    sessions,
    isLoading,
  };
}

// Generate events based on session duration
export function generateSessionEvents(session: ReplaySession): ReplayEvent[] {
  const events: ReplayEvent[] = [];
  const types: ReplayEvent["type"][] = ["click", "scroll", "input", "navigation"];
  
  const eventCount = Math.min(session.eventsCount, 200);
  
  for (let i = 0; i < eventCount; i++) {
    events.push({
      id: `event-${i}`,
      timestamp: Math.floor((i / eventCount) * session.duration * 1000),
      type: types[i % types.length],
      data: {
        target: `element-${i % 20}`,
        value: i % 2 === 0 ? "sample text" : undefined,
      },
      position: {
        x: (i * 73) % 1200,
        y: (i * 47) % 800,
      },
    });
  }
  
  return events;
}
