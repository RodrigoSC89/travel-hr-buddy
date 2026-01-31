/**
 * PATCH 548 - Mission Control Mobile Sync Service
 * Auto-sync with Supabase when online with network state monitoring
 * 
 * Type-safe implementation aligned with Supabase schema
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import {
  getMissionsOffline,
  saveMissionOffline,
  getSyncQueue,
  removeFromSyncQueue,
  addToSyncQueue,
  type Mission,
} from "./offlineStorage";

type NetworkStatus = "online" | "offline" | "reconnecting";
type SyncCallback = (status: NetworkStatus) => void;

/**
 * Maps local Mission to Supabase missions table structure
 */
function mapMissionToSupabase(mission: Mission) {
  return {
    id: mission.id,
    title: mission.title,
    description: mission.description || null,
    status: mission.status,
    priority: mission.priority,
    start_date: mission.startDate || null,
    end_date: mission.endDate || null,
    vessel_id: mission.vesselId || null,
  };
}

/**
 * Maps Supabase mission row to local Mission interface
 */
function mapSupabaseToMission(row: Record<string, unknown>): Mission {
  return {
    id: String(row.id || ''),
    title: String(row.title || 'Untitled Mission'),
    status: (row.status as Mission['status']) || 'pending',
    priority: (row.priority as Mission['priority']) || 'medium',
    description: String(row.description || ''),
    assignedTo: row.assigned_agents ? String(row.assigned_agents) : undefined,
    startDate: row.start_date ? String(row.start_date) : undefined,
    endDate: row.end_date ? String(row.end_date) : undefined,
    vesselId: row.vessel_id ? String(row.vessel_id) : undefined,
    notifications: 0,
    lastUpdated: String(row.updated_at || row.created_at || new Date().toISOString()),
    syncStatus: 'synced',
  };
}

class MissionSyncService {
  // PATCH v26: Sempre assumir online - navigator.onLine não é confiável no iOS PWA
  private isOnline: boolean = true;
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
   * PATCH v26: Listeners mantidos para compatibilidade, mas sempre assumimos online
   */
  private setupNetworkListeners() {
    window.addEventListener("online", () => {
      logger.debug("Network event: Online");
      this.isOnline = true;
      this.reconnectAttempts = 0;
      this.notifyCallbacks("online");
      this.syncWithSupabase();
    });

    window.addEventListener("offline", () => {
      logger.debug("Network: Offline");
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
      logger.debug(`Processing ${syncQueue.length} items from sync queue`);

      for (const item of syncQueue) {
        try {
          switch (item.operation) {
          case "create":
          case "update":
            // Use type assertion since we know the structure is correct
            const missionData = mapMissionToSupabase(item.data) as Record<string, unknown>;
            const { error: upsertError } = await supabase
              .from("missions")
              .upsert(missionData as never);
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
          logger.error(`Error syncing item ${item.id}:`, error);
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
          await saveMissionOffline(mapSupabaseToMission(mission));
        }
      }

      this.reconnectAttempts = 0;
      this.notifyCallbacks("online");
      logger.debug("Sync completed successfully");

      return { success: true };
    } catch (error) {
      logger.error("Sync error:", error);
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
      logger.error("Error loading missions:", error);
      return getMissionsOffline();
    }
  }

  /**
   * Create mission (save locally and queue for sync)
   */
  public async createMission(missionInput: Partial<Mission>) {
    const newMission: Mission = {
      id: crypto.randomUUID(),
      title: missionInput.title || 'New Mission',
      description: missionInput.description || '',
      status: missionInput.status || 'pending',
      priority: missionInput.priority || 'medium',
      assignedTo: missionInput.assignedTo,
      startDate: missionInput.startDate,
      endDate: missionInput.endDate,
      vesselId: missionInput.vesselId,
      notifications: 0,
      lastUpdated: new Date().toISOString(),
      syncStatus: 'pending',
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
  public async updateMission(missionId: string, updates: Partial<Mission>) {
    const missions = await getMissionsOffline();
    const mission = missions.find((m) => m.id === missionId);

    if (!mission) {
      throw new Error("Mission not found");
    }

    const updatedMission: Mission = {
      ...mission,
      ...updates,
      lastUpdated: new Date().toISOString(),
      syncStatus: 'pending',
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
