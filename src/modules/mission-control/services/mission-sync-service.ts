/**
 * PATCH 396 - Mission Control WebSocket Synchronization Service
 * Provides real-time synchronization of mission status across multiple clients
 */

import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface MissionStatusUpdate {
  missionId: string;
  status: string;
  updateType: "status_change" | "assignment" | "alert" | "completion" | "telemetry";
  data: Record<string, any>;
  timestamp: string;
  instanceId: string;
}

export class MissionSyncService {
  private channel: RealtimeChannel | null = null;
  private instanceId: string;
  private listeners: Map<string, (update: MissionStatusUpdate) => void> = new Map();

  constructor() {
    // Generate unique instance ID for this client
    this.instanceId = `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize WebSocket connection for mission synchronization
   */
  async initialize(): Promise<void> {
    try {
      // Subscribe to mission status changes
      this.channel = supabase.channel("mission-control-sync", {
        config: {
          broadcast: { self: false }, // Don't receive own messages
        },
      });

      // Listen for mission status updates
      this.channel
        .on("broadcast", { event: "mission-status-update" }, (payload) => {
          const update = payload.payload as MissionStatusUpdate;
          
          // Notify all listeners
          this.listeners.forEach((callback) => {
            callback(update);
          });

          // Update local sync status
          this.updateSyncStatus(update.missionId, "synced", update);
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("✅ Mission Control WebSocket connected");
          }
        });

    } catch (error) {
      console.error("Error initializing mission sync:", error);
      throw error;
    }
  }

  /**
   * Broadcast mission status update to all connected clients
   */
  async broadcastStatusUpdate(
    missionId: string,
    updateType: MissionStatusUpdate["updateType"],
    data: Record<string, any>
  ): Promise<void> {
    if (!this.channel) {
      console.warn("WebSocket channel not initialized");
      return;
    }

    const update: MissionStatusUpdate = {
      missionId,
      status: data.status || "unknown",
      updateType,
      data,
      timestamp: new Date().toISOString(),
      instanceId: this.instanceId,
    };

    try {
      await this.channel.send({
        type: "broadcast",
        event: "mission-status-update",
        payload: update,
      });

      // Log the broadcast
      await this.logSyncEvent(missionId, updateType, update);
    } catch (error) {
      console.error("Error broadcasting status update:", error);
      throw error;
    }
  }

  /**
   * Subscribe to mission status updates
   */
  subscribe(listenerId: string, callback: (update: MissionStatusUpdate) => void): void {
    this.listeners.set(listenerId, callback);
  }

  /**
   * Unsubscribe from mission status updates
   */
  unsubscribe(listenerId: string): void {
    this.listeners.delete(listenerId);
  }

  /**
   * Update sync status in database
   */
  private async updateSyncStatus(
    missionId: string,
    syncStatus: "synced" | "pending" | "conflict",
    syncData: Record<string, any>
  ): Promise<void> {
    try {
      await supabase.from("mission_status_sync").upsert({
        mission_id: missionId,
        instance_id: this.instanceId,
        sync_status: syncStatus,
        sync_data: syncData,
        last_sync_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating sync status:", error);
    }
  }

  /**
   * Log sync event for telemetry
   */
  private async logSyncEvent(
    missionId: string,
    eventType: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      await supabase.from("mission_control_logs").insert({
        mission_id: missionId,
        event_type: `sync_${eventType}`,
        event_data: data,
        severity: "info",
        source_module: "mission_sync",
        telemetry_data: {
          instanceId: this.instanceId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error logging sync event:", error);
    }
  }

  /**
   * Get sync status for a mission
   */
  async getSyncStatus(missionId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("mission_status_sync")
        .select("*")
        .eq("mission_id", missionId)
        .order("last_sync_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching sync status:", error);
      return [];
    }
  }

  /**
   * Cleanup and disconnect
   */
  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
    }
    this.listeners.clear();
    console.log("Mission Control WebSocket disconnected");
  }
}

// Singleton instance
export const missionSyncService = new MissionSyncService();
