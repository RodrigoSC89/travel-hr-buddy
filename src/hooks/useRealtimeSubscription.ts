/**
 * React hook for real-time subscriptions with automatic cleanup
 */

import { useEffect, useRef, useCallback } from "react";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { realtimeSubscriptions, createSubscriptionManager } from "@/services/realtime-subscriptions";
import { useToast } from "@/hooks/use-toast";

type PayloadType = RealtimePostgresChangesPayload<Record<string, unknown>>;

interface UseRealtimeOptions {
  enabled?: boolean;
  showToast?: boolean;
  toastTitle?: string;
}

/**
 * Hook for subscribing to user notifications
 */
export function useNotificationSubscription(
  userId: string | undefined,
  onNotification?: (payload: PayloadType) => void,
  options: UseRealtimeOptions = {}
) {
  const { toast } = useToast();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userId || options.enabled === false) return;

    channelRef.current = realtimeSubscriptions.userNotifications(userId, (payload) => {
      if (options.showToast !== false) {
        const newRecord = payload.new as { title?: string; message?: string };
        toast({
          title: options.toastTitle || newRecord.title || "New Notification",
          description: newRecord.message,
        });
      }
      onNotification?.(payload);
    });

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [userId, options.enabled, options.showToast, options.toastTitle, onNotification, toast]);

  return channelRef.current;
}

/**
 * Hook for subscribing to vessel tracking updates
 */
export function useVesselTrackingSubscription(
  vesselId: string | undefined,
  onUpdate?: (payload: PayloadType) => void,
  options: UseRealtimeOptions = {}
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!vesselId || options.enabled === false) return;

    channelRef.current = realtimeSubscriptions.vesselTracking(vesselId, (payload) => {
      onUpdate?.(payload);
    });

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [vesselId, options.enabled, onUpdate]);

  return channelRef.current;
}

/**
 * Hook for subscribing to maintenance updates
 */
export function useMaintenanceSubscription(
  organizationId: string | undefined,
  onUpdate?: (payload: PayloadType) => void,
  options: UseRealtimeOptions = {}
) {
  const { toast } = useToast();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!organizationId || options.enabled === false) return;

    channelRef.current = realtimeSubscriptions.maintenanceUpdates(organizationId, (payload) => {
      if (options.showToast && payload.eventType === "INSERT") {
        toast({
          title: "Maintenance Scheduled",
          description: "A new maintenance task has been added",
        });
      }
      onUpdate?.(payload);
    });

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [organizationId, options.enabled, options.showToast, onUpdate, toast]);

  return channelRef.current;
}

/**
 * Hook for subscribing to incident alerts
 */
export function useIncidentSubscription(
  organizationId: string | undefined,
  onIncident?: (payload: PayloadType) => void,
  options: UseRealtimeOptions = {}
) {
  const { toast } = useToast();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!organizationId || options.enabled === false) return;

    channelRef.current = realtimeSubscriptions.incidentAlerts(organizationId, (payload) => {
      if (options.showToast !== false) {
        const incident = payload.new as { severity?: string; description?: string };
        toast({
          title: `Incident Alert: ${incident.severity?.toUpperCase() || "NEW"}`,
          description: incident.description || "A new incident has been reported",
          variant: incident.severity === "critical" ? "destructive" : "default",
        });
      }
      onIncident?.(payload);
    });

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [organizationId, options.enabled, options.showToast, onIncident, toast]);

  return channelRef.current;
}

/**
 * Hook for managing user presence
 */
export function useUserPresence(
  organizationId: string | undefined,
  user: { id: string; name: string; avatar?: string } | undefined
) {
  const presenceRef = useRef<ReturnType<typeof realtimeSubscriptions.userPresence> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!organizationId || !user) return;

    presenceRef.current = realtimeSubscriptions.userPresence(organizationId);
    
    // Track user as online
    presenceRef.current.track(user);

    return () => {
      presenceRef.current?.untrack();
    };
  }, [organizationId, user]);

  const subscribeToPresence = useCallback(
    (callback: (state: Record<string, unknown[]>) => void) => {
      if (presenceRef.current) {
        channelRef.current = presenceRef.current.subscribe(callback);
      }
      return () => {
        channelRef.current?.unsubscribe();
      };
    },
    []
  );

  const getOnlineUsers = useCallback(() => {
    return presenceRef.current?.getState() || {};
  }, []);

  return {
    subscribeToPresence,
    getOnlineUsers,
  };
}

/**
 * Generic hook for multiple subscriptions
 */
export function useMultipleSubscriptions() {
  const manager = useRef(createSubscriptionManager());

  useEffect(() => {
    return () => {
      manager.current.cleanup();
    };
  }, []);

  return {
    add: manager.current.add,
    cleanup: manager.current.cleanup,
  };
}
