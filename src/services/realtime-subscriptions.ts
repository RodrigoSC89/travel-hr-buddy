/**
 * B7: Real-time Subscriptions for Nauti One
 * Provides real-time updates for notifications, vessel tracking, maintenance, and incidents
 */

import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type SubscriptionCallback = (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;

/**
 * Real-time subscription utilities for the maritime management system
 */
export const realtimeSubscriptions = {
  /**
   * Subscribe to user notifications
   */
  userNotifications: (userId: string, callback: SubscriptionCallback): RealtimeChannel => {
    return supabase
      .channel(`user-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  /**
   * Subscribe to vessel position updates
   */
  vesselTracking: (vesselId: string, callback: SubscriptionCallback): RealtimeChannel => {
    return supabase
      .channel(`vessel-tracking-${vesselId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "vessel_positions",
          filter: `vessel_id=eq.${vesselId}`,
        },
        callback
      )
      .subscribe();
  },

  /**
   * Subscribe to maintenance record updates
   */
  maintenanceUpdates: (organizationId: string, callback: SubscriptionCallback): RealtimeChannel => {
    return supabase
      .channel(`maintenance-updates-${organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "maintenance_records",
        },
        callback
      )
      .subscribe();
  },

  /**
   * Subscribe to new incident alerts
   */
  incidentAlerts: (organizationId: string, callback: SubscriptionCallback): RealtimeChannel => {
    return supabase
      .channel(`incident-alerts-${organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "incidents",
        },
        callback
      )
      .subscribe();
  },

  /**
   * Subscribe to certificate expiry alerts
   */
  certificateAlerts: (callback: SubscriptionCallback): RealtimeChannel => {
    return supabase
      .channel("certificate-alerts")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "maritime_certificates",
        },
        callback
      )
      .subscribe();
  },

  /**
   * Subscribe to voyage status changes
   */
  voyageUpdates: (vesselId: string, callback: SubscriptionCallback): RealtimeChannel => {
    return supabase
      .channel(`voyage-updates-${vesselId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "voyages",
          filter: `vessel_id=eq.${vesselId}`,
        },
        callback
      )
      .subscribe();
  },

  /**
   * Track online user presence
   */
  userPresence: (organizationId: string) => {
    const channel = supabase.channel(`online-users-${organizationId}`, {
      config: {
        presence: {
          key: organizationId,
        },
      },
    });

    return {
      /**
       * Track a user as online
       */
      track: (user: { id: string; name: string; avatar?: string }) => {
        return channel.track({
          user_id: user.id,
          user_name: user.name,
          avatar: user.avatar,
          online_at: new Date().toISOString(),
        });
      },

      /**
       * Remove user from presence
       */
      untrack: () => channel.untrack(),

      /**
       * Subscribe to presence changes
       */
      subscribe: (callback: (state: Record<string, unknown[]>) => void): RealtimeChannel => {
        return channel
          .on("presence", { event: "sync" }, () => {
            callback(channel.presenceState());
          })
          .subscribe();
      },

      /**
       * Get current presence state
       */
      getState: () => channel.presenceState(),
    };
  },

  /**
   * Subscribe to SOC (Security Operations Center) alerts
   */
  socAlerts: (organizationId: string, callback: SubscriptionCallback): RealtimeChannel => {
    return supabase
      .channel(`soc-alerts-${organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "soc_alerts",
          filter: `organization_id=eq.${organizationId}`,
        },
        callback
      )
      .subscribe();
  },

  /**
   * Subscribe to AI decisions requiring approval
   */
  aiDecisions: (callback: SubscriptionCallback): RealtimeChannel => {
    return supabase
      .channel("ai-decisions")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ai_decisions",
          filter: "status=eq.pending",
        },
        callback
      )
      .subscribe();
  },
};

/**
 * Hook to manage real-time subscriptions with automatic cleanup
 */
export function createSubscriptionManager() {
  const channels: RealtimeChannel[] = [];

  return {
    add: (channel: RealtimeChannel) => {
      channels.push(channel);
      return channel;
    },

    cleanup: async () => {
      await Promise.all(
        channels.map((channel) => supabase.removeChannel(channel))
      );
      channels.length = 0;
    },
  };
}

export default realtimeSubscriptions;
