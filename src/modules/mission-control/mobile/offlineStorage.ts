/**
 * PATCH 548 - Mission Control Mobile Dashboard
 * Offline-first architecture with IndexedDB and auto-sync
 */

export interface Mission {
  id: string;
  title: string;
  status: "active" | "completed" | "pending" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  description: string;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  notifications?: number;
  lastUpdated: string;
  syncStatus: "synced" | "pending" | "error";
}

interface SyncQueueItem {
  id: string;
  operation: "create" | "update" | "delete";
  data: Mission;
  timestamp: number;
}

const DB_NAME = "mission_control_mobile";
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB database
 */
export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Missions store
      if (!db.objectStoreNames.contains("missions")) {
        const missionStore = db.createObjectStore("missions", { keyPath: "id" });
        missionStore.createIndex("by-status", "status", { unique: false });
        missionStore.createIndex("by-priority", "priority", { unique: false });
        missionStore.createIndex("by-syncStatus", "syncStatus", { unique: false });
      }

      // Sync queue store
      if (!db.objectStoreNames.contains("syncQueue")) {
        db.createObjectStore("syncQueue", { keyPath: "id" });
      }
    };
  });
}

/**
 * Get all missions from IndexedDB
 */
export async function getMissionsOffline(): Promise<Mission[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("missions", "readonly");
    const store = transaction.objectStore("missions");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as Mission[]);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get active missions from IndexedDB
 */
export async function getActiveMissionsOffline(): Promise<Mission[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("missions", "readonly");
    const store = transaction.objectStore("missions");
    const index = store.index("by-status");
    const request = index.getAll("active");

    request.onsuccess = () => resolve(request.result as Mission[]);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save mission to IndexedDB
 */
export async function saveMissionOffline(mission: Mission): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("missions", "readwrite");
    const store = transaction.objectStore("missions");
    const request = store.put(mission);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete mission from IndexedDB
 */
export async function deleteMissionOffline(missionId: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("missions", "readwrite");
    const store = transaction.objectStore("missions");
    const request = store.delete(missionId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Add operation to sync queue
 */
export async function addToSyncQueue(
  operation: "create" | "update" | "delete",
  mission: Mission
): Promise<void> {
  const db = await initDB();
  const queueItem: SyncQueueItem = {
    id: `${operation}_${mission.id}_${Date.now()}`,
    operation,
    data: mission,
    timestamp: Date.now(),
  };
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("syncQueue", "readwrite");
    const store = transaction.objectStore("syncQueue");
    const request = store.put(queueItem);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all items in sync queue
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("syncQueue", "readonly");
    const store = transaction.objectStore("syncQueue");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as SyncQueueItem[]);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear sync queue after successful sync
 */
export async function clearSyncQueue(): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("syncQueue", "readwrite");
    const store = transaction.objectStore("syncQueue");
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Remove specific item from sync queue
 */
export async function removeFromSyncQueue(itemId: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("syncQueue", "readwrite");
    const store = transaction.objectStore("syncQueue");
    const request = store.delete(itemId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Update mission status in IndexedDB
 */
export async function updateMissionStatusOffline(
  missionId: string,
  status: Mission["status"]
): Promise<void> {
  const db = await initDB();
  return new Promise(async (resolve, reject) => {
    const transaction = db.transaction("missions", "readwrite");
    const store = transaction.objectStore("missions");
    const getRequest = store.get(missionId);

    getRequest.onsuccess = async () => {
      const mission = getRequest.result as Mission;
      if (mission) {
        mission.status = status;
        mission.lastUpdated = new Date().toISOString();
        mission.syncStatus = "pending";
        const putRequest = store.put(mission);
        
        putRequest.onsuccess = async () => {
          await addToSyncQueue("update", mission);
          resolve();
        };
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        reject(new Error("Mission not found"));
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * Clear all offline data
 */
export async function clearOfflineData(): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["missions", "syncQueue"], "readwrite");
    const missionStore = transaction.objectStore("missions");
    const queueStore = transaction.objectStore("syncQueue");

    const missionRequest = missionStore.clear();
    const queueRequest = queueStore.clear();

    let completed = 0;
    const checkComplete = () => {
      completed++;
      if (completed === 2) resolve();
    };

    missionRequest.onsuccess = checkComplete;
    queueRequest.onsuccess = checkComplete;
    missionRequest.onerror = () => reject(missionRequest.error);
    queueRequest.onerror = () => reject(queueRequest.error);
  });
}

/**
 * Get database statistics
 */
export async function getDBStats() {
  const missions = await getMissionsOffline();
  const syncQueue = await getSyncQueue();

  return {
    totalMissions: missions.length,
    activeMissions: missions.filter((m) => m.status === "active").length,
    pendingSync: missions.filter((m) => m.syncStatus === "pending").length,
    queueLength: syncQueue.length,
  };
}
