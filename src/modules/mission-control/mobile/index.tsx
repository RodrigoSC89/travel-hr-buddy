/**
 * PATCH 548 – Mission Control Mobile Dashboard
 * Versão mobile do painel tático de Missões
 */

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { Mission } from "../types";

// IndexedDB for offline storage
const DB_NAME = "mission_control_offline";
const DB_VERSION = 1;
const STORE_NAME = "missions";

interface MobileMissionDashboardProps {
  userId?: string;
}

const STATUS_CONFIG = {
  planned: { icon: Clock, color: "bg-blue-500", label: "Planejada" },
  "in-progress": {
    icon: Target,
    color: "bg-yellow-500",
    label: "Em Andamento",
  },
  completed: { icon: CheckCircle2, color: "bg-green-500", label: "Concluída" },
  cancelled: { icon: AlertCircle, color: "bg-red-500", label: "Cancelada" },
  paused: { icon: Clock, color: "bg-gray-500", label: "Pausada" },
} as const;

export const MobileMissionDashboard: React.FC<
  MobileMissionDashboardProps
> = ({ userId }) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [db, setDb] = useState<IDBDatabase | null>(null);

  useEffect(() => {
    initIndexedDB();
    setupNetworkListeners();
    return () => cleanupNetworkListeners();
  }, []);

  useEffect(() => {
    if (db) {
      loadMissions();
    }
  }, [db, isOnline]);

  // Initialize IndexedDB
  const initIndexedDB = () => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("Error opening IndexedDB");
    };

    request.onsuccess = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      setDb(database);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });
        objectStore.createIndex("status", "status", { unique: false });
        objectStore.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  };

  // Setup network listeners
  const setupNetworkListeners = () => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
  };

  const cleanupNetworkListeners = () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };

  const handleOnline = () => {
    setIsOnline(true);
    syncWithServer();
  };

  const handleOffline = () => {
    setIsOnline(false);
  };

  // Load missions from Supabase or IndexedDB
  const loadMissions = async () => {
    try {
      setLoading(true);

      if (isOnline) {
        // Load from Supabase when online
        let query = supabase
          .from("missions")
          .select("*")
          .in("status", ["planned", "in-progress"])
          .order("createdAt", { ascending: false });

        if (userId) {
          query = query.eq("assigned_to", userId);
        }

        const { data, error } = await query;

        if (error) throw error;

        const formattedMissions = (data || []).map((m: any) => ({
          id: m.id,
          code: m.code,
          name: m.name,
          type: m.type,
          status: m.status,
          priority: m.priority,
          description: m.description,
          objectives: m.objectives || [],
          startDate: m.start_date,
          endDate: m.end_date,
          assignedTo: m.assigned_to,
          createdBy: m.created_by,
          createdAt: m.created_at,
          metadata: m.metadata || {},
        }));

        setMissions(formattedMissions);
        setLastSync(new Date());

        // Save to IndexedDB
        await saveToIndexedDB(formattedMissions);
      } else {
        // Load from IndexedDB when offline
        const cachedMissions = await loadFromIndexedDB();
        setMissions(cachedMissions);
      }
    } catch (error) {
      console.error("Error loading missions:", error);

      // Fallback to IndexedDB
      if (db) {
        const cachedMissions = await loadFromIndexedDB();
        setMissions(cachedMissions);
      }
    } finally {
      setLoading(false);
    }
  };

  // Save missions to IndexedDB
  const saveToIndexedDB = async (missionsData: Mission[]): Promise<void> => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const objectStore = transaction.objectStore(STORE_NAME);

      // Clear existing data
      objectStore.clear();

      // Add new data
      missionsData.forEach((mission) => {
        objectStore.add(mission);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  };

  // Load missions from IndexedDB
  const loadFromIndexedDB = async (): Promise<Mission[]> => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  };

  // Sync with server
  const syncWithServer = async () => {
    if (!isOnline) return;
    await loadMissions();
  };

  const handleRefresh = () => {
    loadMissions();
  };

  if (loading) {
    return (
      <Card className="p-6 m-4">
        <div className="flex items-center justify-center h-40">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-screen-sm mx-auto p-4 space-y-4">
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Missões</h1>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="h-5 w-5 text-green-600" />
              <span className="text-xs text-green-600">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-5 w-5 text-orange-600" />
              <span className="text-xs text-orange-600">Offline</span>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={!isOnline}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {lastSync && (
        <p className="text-xs text-muted-foreground">
          Última sincronização: {lastSync.toLocaleTimeString("pt-BR")}
        </p>
      )}

      {/* Missions list */}
      {missions.length === 0 ? (
        <Card className="p-8 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhuma missão ativa</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {missions.map((mission) => {
            const statusConfig =
              STATUS_CONFIG[mission.status as keyof typeof STATUS_CONFIG];
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={mission.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{mission.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {mission.code}
                      </p>
                    </div>
                    <Badge
                      className={`${statusConfig.color} text-white shrink-0`}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {/* Description */}
                  {mission.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {mission.description}
                    </p>
                  )}

                  {/* Meta info */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="capitalize">{mission.type}</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      {mission.priority}
                    </Badge>
                  </div>

                  {/* Dates */}
                  <div className="text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {new Date(mission.startDate).toLocaleDateString("pt-BR")} -{" "}
                    {new Date(mission.endDate).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
