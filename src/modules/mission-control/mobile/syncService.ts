// @ts-nocheck
/**
 * PATCH 548 - Mission Control Mobile Sync Service
 * Auto-sync with Supabase when online with network state monitoring
 */

import { supabase } from "@/integrations/supabase/client";
import {
  getMissionsOffline,
  saveMissionOffline,
  getSyncQueue,
  clearSyncQueue,
  removeFromSyncQueue,
  addToSyncQueue,
} from "./offlineStorage";

type NetworkStatus = "online" | "offline" | "reconnecting";
type SyncCallback = (status: NetworkStatus) => void;

class MissionSyncService {
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private syncCallbacks: SyncCallback[] = [];
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor() {
    this.setupNetworkListeners();
    this.startAutoSync();
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners() {
    window.addEventListener("online", () => {
      console.log("Network: Online");
      this.isOnline = true;
      this.reconnectAttempts = 0;
      this.notifyCallbacks("online");
      this.syncWithSupabase();
    });

    window.addEventListener("offline", () => {
      console.log("Network: Offline");
      this.isOnline = false;
      this.notifyCallbacks("offline");
    });
  }

  /**
   * Start automatic sync every 30 seconds when online
   */
  private startAutoSync() {
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncWithSupabase();
      }
    }, 30000); // 30 seconds
  }

  /**
   * Stop automatic sync
   */
  public stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Register callback for network status changes
   */
  public onNetworkChange(callback: SyncCallback) {
    this.syncCallbacks.push(callback);
    return () => {
      this.syncCallbacks = this.syncCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Notify all callbacks of network status change
   */
  private notifyCallbacks(status: NetworkStatus) {
    this.syncCallbacks.forEach((callback) => callback(status));
  }

  /**
   * Get current network status
   */
  public getNetworkStatus(): NetworkStatus {
    if (!this.isOnline) return "offline";
    if (this.reconnectAttempts > 0) return "reconnecting";
    return "online";
  }

  /**
   * Sync local data with Supabase
   */
  public async syncWithSupabase(): Promise<{ success: boolean; error?: string }> {
    if (!this.isOnline) {
      return { success: false, error: "Offline" };
    }

    if (this.isSyncing) {
      return { success: false, error: "Sync already in progress" };
    }

    this.isSyncing = true;
    this.notifyCallbacks("reconnecting");

    try {
      // Step 1: Process sync queue (pending changes)
      const syncQueue = await getSyncQueue();
      console.log(`Processing ${syncQueue.length} items from sync queue`);

      for (const item of syncQueue) {
        try {
          switch (item.operation) {
            case "create":
            case "update":
              const { error: upsertError } = await supabase
                .from("missions")
                .upsert({
                  id: item.data.id,
                  title: item.data.title,
                  description: item.data.description,
                  status: item.data.status,
                  priority: item.data.priority,
                  start_date: item.data.startDate,
                  end_date: item.data.endDate,
                  vessel_id: item.data.vesselId,
                });
              if (upsertError) throw upsertError;
              break;

            case "delete":
              const { error: deleteError } = await supabase
                .from("missions")
                .delete()
                .eq("id", item.data.id);
              if (deleteError) throw deleteError;
              break;
          }

          // Remove from queue after successful sync
          await removeFromSyncQueue(item.id);
        } catch (error) {
          console.error(`Error syncing item ${item.id}:`, error);
          // Keep item in queue for retry
        }
      }

      // Step 2: Fetch latest missions from Supabase
      const { data: missions, error: fetchError } = await supabase
        .from("missions")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(100);

      if (fetchError) {
        throw fetchError;
      }

      // Step 3: Update local storage with latest data
      if (missions) {
        for (const mission of missions) {
          await saveMissionOffline({
            id: mission.id,
            title: mission.title || "Untitled Mission",
            status: (mission.status as any) || "pending",
            priority: (mission.priority as any) || "medium",
            description: mission.description || "",
            assignedTo: (mission.assigned_agents as any)?.toString() || undefined,
            startDate: mission.start_date || undefined,
            endDate: mission.end_date || undefined,
            vesselId: mission.vessel_id || undefined,
            notifications: 0,
            lastUpdated: mission.updated_at || mission.created_at || new Date().toISOString(),
            syncStatus: "synced",
          });
        }
      }

      this.reconnectAttempts = 0;
      this.notifyCallbacks("online");
      console.log("Sync completed successfully");

      return { success: true };
    } catch (error) {
      console.error("Sync error:", error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.notifyCallbacks("offline");
        return {
          success: false,
          error: "Max reconnect attempts reached",
        };
      }

      return { success: false, error: String(error) };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Force sync now
   */
  public async forceSyncNow(): Promise<{ success: boolean; error?: string }> {
    if (!this.isOnline) {
      return { success: false, error: "Device is offline" };
    }
    return this.syncWithSupabase();
  }

  /**
   * Load missions (from local storage if offline, from Supabase if online)
   */
  public async loadMissions() {
    try {
      if (this.isOnline) {
        // Try to fetch from Supabase first
        const syncResult = await this.syncWithSupabase();
        if (syncResult.success) {
          return getMissionsOffline();
        }
      }

      // Fallback to local storage
      return getMissionsOffline();
    } catch (error) {
      console.error("Error loading missions:", error);
      return getMissionsOffline();
    }
  }

  /**
   * Create mission (save locally and queue for sync)
   */
  public async createMission(mission: Omit<any, "id">) {
    const newMission = {
      ...mission,
      id: crypto.randomUUID(),
      lastUpdated: new Date().toISOString(),
      syncStatus: this.isOnline ? "pending" : "pending",
    };

    await saveMissionOffline(newMission);
    await addToSyncQueue("create", newMission);

    if (this.isOnline) {
      this.syncWithSupabase();
    }

    return newMission;
  }

  /**
   * Update mission (save locally and queue for sync)
   */
  public async updateMission(missionId: string, updates: Partial<any>) {
    const missions = await getMissionsOffline();
    const mission = missions.find((m) => m.id === missionId);

    if (!mission) {
      throw new Error("Mission not found");
    }

    const updatedMission = {
      ...mission,
      ...updates,
      lastUpdated: new Date().toISOString(),
      syncStatus: "pending" as const,
    };

    await saveMissionOffline(updatedMission);
    await addToSyncQueue("update", updatedMission);

    if (this.isOnline) {
      this.syncWithSupabase();
    }

    return updatedMission;
  }
}

// Export singleton instance
export const missionSyncService = new MissionSyncService();
