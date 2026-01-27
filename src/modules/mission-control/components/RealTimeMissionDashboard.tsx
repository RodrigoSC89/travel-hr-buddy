/**
 * PATCH 872: Real-Time Mission Dashboard
 * Displays mission execution status with live updates
 * Full type-safety aligned with missions and mission_logs tables
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Zap,
  Play,
  Pause,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import type { Database } from "@/integrations/supabase/types";

type MissionRow = Database["public"]["Tables"]["missions"]["Row"];

interface Mission {
  id: string;
  mission_id: string;
  name: string;
  description: string;
  status: "planning" | "in_progress" | "paused" | "completed" | "error" | "cancelled";
  priority: "low" | "normal" | "high" | "critical";
  progress_percentage: number;
  start_date?: string;
  estimated_duration_hours?: number;
  actual_duration_hours?: number;
  updated_at: string;
}

interface MissionLog {
  id: string;
  mission_id: string;
  log_type: string;
  message: string;
  timestamp: string;
}

// Map DB row to UI interface using actual DB columns
function mapMissionRow(row: MissionRow): Mission {
  return {
    id: row.id,
    mission_id: row.mission_id || row.id,
    name: row.name || row.mission_name || "Unnamed Mission",
    description: row.description || "",
    status: (row.status as Mission["status"]) || "planning",
    priority: (row.priority as Mission["priority"]) || "normal",
    progress_percentage: Number(row.progress_percentage ?? row.progress_percent ?? 0),
    start_date: row.start_date || undefined,
    estimated_duration_hours: undefined, // Not in DB
    actual_duration_hours: undefined, // Not in DB
    updated_at: row.updated_at || row.created_at || new Date().toISOString(),
  };
}

export const RealTimeMissionDashboard = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [recentLogs, setRecentLogs] = useState<MissionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { toast } = useToast();

  const loadMissions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .in("status", ["planning", "in_progress", "paused", "error"])
        .order("priority", { ascending: false })
        .order("updated_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setMissions(data.map(mapMissionRow));
      }
    } catch (error) {
      logger.error("Error loading missions", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRecentLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("mission_logs")
        .select("id, mission_id, mission_name, description, log_type, message, timestamp, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      if (data) {
        // Map mission_logs schema to UI interface
        setRecentLogs(data.map(log => ({
          id: log.id,
          mission_id: log.mission_id || "",
          log_type: log.log_type || "info",
          message: log.message || log.description || log.mission_name || "Log entry",
          timestamp: log.timestamp || log.created_at || new Date().toISOString(),
        })));
      }
    } catch (error) {
      logger.error("Error loading logs", error);
    }
  }, []);

  useEffect(() => {
    loadMissions();
    loadRecentLogs();

    // Polling every 5 seconds for real-time updates
    const interval = setInterval(() => {
      loadMissions();
      loadRecentLogs();
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [loadMissions, loadRecentLogs]);

  const getStatusColor = (status: Mission["status"]): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "secondary";
      case "error": return "destructive";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: Mission["status"]) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-4 w-4" />;
      case "in_progress": return <Play className="h-4 w-4" />;
      case "paused": return <Pause className="h-4 w-4" />;
      case "error": return <AlertCircle className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Mission["priority"]): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "default";
      case "normal": return "secondary";
      default: return "outline";
    }
  };

  // Stats
  const inProgress = missions.filter(m => m.status === "in_progress").length;
  const paused = missions.filter(m => m.status === "paused").length;
  const errors = missions.filter(m => m.status === "error").length;
  const avgProgress = missions.length > 0
    ? Math.round(missions.reduce((acc, m) => acc + m.progress_percentage, 0) / missions.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mission Control</h2>
          <p className="text-muted-foreground text-sm">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          Live
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Pause className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold">{paused}</p>
                <p className="text-xs text-muted-foreground">Paused</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{errors}</p>
                <p className="text-xs text-muted-foreground">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{avgProgress}%</p>
                <p className="text-xs text-muted-foreground">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Missions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Active Missions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {missions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No active missions
                </p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {missions.map((mission) => (
                      <Card key={mission.id} className="border-l-4" style={{
                        borderLeftColor: mission.priority === "critical" ? "hsl(var(--destructive))" :
                          mission.priority === "high" ? "hsl(var(--warning))" :
                          "hsl(var(--primary))"
                      }}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{mission.name}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {mission.description}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant={getStatusColor(mission.status)}>
                                {getStatusIcon(mission.status)}
                                <span className="ml-1 capitalize">{mission.status.replace("_", " ")}</span>
                              </Badge>
                              <Badge variant={getPriorityColor(mission.priority)}>
                                {mission.priority}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{mission.progress_percentage}%</span>
                            </div>
                            <Progress value={mission.progress_percentage} className="h-2" />
                          </div>
                          {mission.estimated_duration_hours && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Est. duration: {mission.estimated_duration_hours}h
                              {mission.actual_duration_hours && ` | Actual: ${mission.actual_duration_hours}h`}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Logs */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {recentLogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No recent activity
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentLogs.map((log) => (
                      <div key={log.id} className="border-l-2 border-muted pl-3 py-1">
                        <p className="text-sm">{log.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
