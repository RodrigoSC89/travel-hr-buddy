/**
 * PATCH 391 - Channel Manager with WebSocket/Realtime
 * Real-time channel updates hook
 */

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Channel {
  id: string;
  name: string;
  type?: "public" | "private" | "direct";
  status?: "active" | "inactive" | "archived";
  member_count: number;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
}

export const useRealtimeChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    fetchChannels();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from("communication_channels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setChannels(data as any || []);
    } catch (error) {
      console.error("Error fetching channels:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    channelRef.current = supabase
      .channel("channel-manager-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "communication_channels",
        },
        (payload) => {
          setChannels((prev) => [payload.new as Channel, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "communication_channels",
        },
        (payload) => {
          setChannels((prev) =>
            prev.map((c) => (c.id === payload.new.id ? (payload.new as Channel) : c))
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "communication_channels",
        },
        (payload) => {
          setChannels((prev) => prev.filter((c) => c.id !== payload.old.id));
        }
      )
      .subscribe();
  };

  return { channels, loading, refetch: fetchChannels };
};
