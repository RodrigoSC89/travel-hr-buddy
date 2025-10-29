/**
 * PATCH 548 - Mission Control Mobile Dashboard
 * Mobile-optimized dashboard with offline support
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  Circle,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { missionSyncService } from "./syncService";
import { getDBStats, type Mission } from "./offlineStorage";
import { toast } from "sonner";

const statusIcons = {
  active: <Circle className="h-4 w-4 text-blue-500" />,
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  cancelled: <XCircle className="h-4 w-4 text-red-500" />,
};

const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export const MissionControlMobileDashboard: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [networkStatus, setNetworkStatus] = useState<"online" | "offline" | "reconnecting">("online");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState({ totalMissions: 0, activeMissions: 0, pendingSync: 0, queueLength: 0 });

  useEffect(() => {
    // Set up network status listener
    const unsubscribe = missionSyncService.onNetworkChange((status) => {
      setNetworkStatus(status);
      if (status === "online") {
        toast.success("Back online - syncing data...");
        loadMissions();
      } else if (status === "offline") {
        toast.error("You are offline - changes will sync when reconnected");
      }
    });

    loadMissions();
    loadStats();

    return () => {
      unsubscribe();
    };
  }, []);

  const loadMissions = async () => {
    try {
      setIsLoading(true);
      const data = await missionSyncService.loadMissions();
      setMissions(data);
    } catch (error) {
      console.error("Error loading missions:", error);
      toast.error("Failed to load missions");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const dbStats = await getDBStats();
      setStats(dbStats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await missionSyncService.forceSyncNow();
      if (result.success) {
        toast.success("Sync completed successfully");
        await loadMissions();
        await loadStats();
      } else {
        toast.error(result.error || "Sync failed");
      }
    } catch (error) {
      toast.error("Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStatusUpdate = async (missionId: string, newStatus: Mission["status"]) => {
    try {
      await missionSyncService.updateMission(missionId, { status: newStatus });
      await loadMissions();
      await loadStats();
      toast.success("Mission status updated");
    } catch (error) {
      toast.error("Failed to update mission");
    }
  };

  const NetworkStatusBadge = () => (
    <Badge variant={networkStatus === "online" ? "default" : "destructive"} className="flex items-center gap-1">
      {networkStatus === "online" ? (
        <>
          <Wifi className="h-3 w-3" />
          Online
        </>
      ) : networkStatus === "reconnecting" ? (
        <>
          <RefreshCw className="h-3 w-3 animate-spin" />
          Reconnecting...
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          Offline
        </>
      )}
    </Badge>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mission Control Mobile</CardTitle>
              <CardDescription>Offline-first tactical operations dashboard</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <NetworkStatusBadge />
              <Button
                onClick={handleSync}
                disabled={isSyncing || networkStatus === "offline"}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                Sync
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.totalMissions}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{stats.activeMissions}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">{stats.pendingSync}</p>
            <p className="text-xs text-muted-foreground">Pending Sync</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-500">{stats.queueLength}</p>
            <p className="text-xs text-muted-foreground">Queue</p>
          </CardContent>
        </Card>
      </div>

      {/* Missions List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Missions</CardTitle>
          <CardDescription>{missions.length} missions loaded</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {missions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No missions available
                </div>
              ) : (
                missions.map((mission) => (
                  <Card key={mission.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            {statusIcons[mission.status]}
                            <h4 className="font-medium">{mission.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{mission.description}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={priorityColors[mission.priority]}>
                              {mission.priority}
                            </Badge>
                            <Badge variant="outline">{mission.status}</Badge>
                            {mission.syncStatus === "pending" && (
                              <Badge variant="secondary" className="text-xs">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Sync pending
                              </Badge>
                            )}
                            {mission.notifications && mission.notifications > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {mission.notifications} notifications
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
