// @ts-nocheck
/**
 * PATCH 419: Real-Time Mission Dashboard
 * Displays mission execution status with live updates
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

export const RealTimeMissionDashboard = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [recentLogs, setRecentLogs] = useState<MissionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { toast } = useToast();

  // PATCH 549: Wrapped in useCallback to prevent re-creation
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
        setMissions(data as Mission[]);
      }
    } catch (error) {
      console.error("Error loading missions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // PATCH 549: Wrapped in useCallback to prevent re-creation
  const loadRecentLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("mission_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(10);

      if (error) throw error;
      if (data) {
        setRecentLogs(data as MissionLog[]);
      }
    } catch (error) {
      console.error("Error loading logs:", error);
    }
  }, []);

  // PATCH 549: useEffect with proper dependencies and cleanup
  useEffect(() => {
    loadMissions();
    loadRecentLogs();

    // Polling every 5 seconds for real-time updates
    const interval = setInterval(() => {
      loadMissions();
      loadRecentLogs();
      setLastUpdate(new Date());
    }, 5000);

    // Real-time subscription
    const missionsChannel = supabase
      .channel("missions_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "missions"
        },
        (payload) => {
          if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
            loadMissions();
            toast({
              title: "Mission Updated",
              description: "Mission status changed",
            });
          }
        }
      )
      .subscribe();

    const logsChannel = supabase
      .channel("mission_logs_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mission_logs"
        },
        () => {
          loadRecentLogs();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(missionsChannel);
      supabase.removeChannel(logsChannel);
    };
  }, [loadMissions, loadRecentLogs, toast]);

  const getStatusIcon = (status: Mission["status"]) => {
    switch (status) {
    case "in_progress":
      return <Activity className="w-4 h-4 text-blue-400 animate-pulse" />;
    case "completed":
      return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    case "error":
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    case "paused":
      return <Pause className="w-4 h-4 text-yellow-400" />;
    case "planning":
      return <Clock className="w-4 h-4 text-gray-400" />;
    case "cancelled":
      return <XCircle className="w-4 h-4 text-gray-400" />;
    default:
      return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Mission["status"]) => {
    switch (status) {
    case "in_progress":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "completed":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "error":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "paused":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "planning":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    case "cancelled":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getPriorityColor = (priority: Mission["priority"]) => {
    switch (priority) {
    case "critical":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "high":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "normal":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "low":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const stats = {
    total: missions.length,
    inProgress: missions.filter(m => m.status === "in_progress").length,
    completed: missions.filter(m => m.status === "completed").length,
    errors: missions.filter(m => m.status === "error").length
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Active Missions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-zinc-400 mt-1">Total running</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Play className="w-4 h-4 text-blue-400" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">{stats.inProgress}</div>
            <p className="text-xs text-zinc-400 mt-1">Currently executing</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
            <p className="text-xs text-zinc-400 mt-1">Successfully finished</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">{stats.errors}</div>
            <p className="text-xs text-zinc-400 mt-1">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Status Indicator */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 rounded-lg border border-zinc-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-zinc-300">Live Updates Active</span>
        </div>
        <div className="text-xs text-zinc-500">
          Last update: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Mission List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Active Missions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {loading ? (
                <div className="text-center py-8 text-zinc-400">Loading missions...</div>
              ) : missions.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No active missions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {missions.map((mission) => (
                    <div 
                      key={mission.id}
                      className="p-4 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(mission.status)}
                          <h3 className="font-semibold text-white">{mission.name}</h3>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className={getPriorityColor(mission.priority)}>
                            {mission.priority}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(mission.status)}>
                            {mission.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {mission.description && (
                        <p className="text-sm text-zinc-400 mb-3">{mission.description}</p>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                          <span>Progress</span>
                          <span>{mission.progress_percentage}%</span>
                        </div>
                        <Progress value={mission.progress_percentage} className="h-2" />
                      </div>

                      {mission.estimated_duration_hours && (
                        <div className="mt-2 text-xs text-zinc-500">
                          <Clock className="inline w-3 h-3 mr-1" />
                          Est. Duration: {mission.estimated_duration_hours}h
                          {mission.actual_duration_hours && (
                            <span className="ml-2">
                              (Actual: {mission.actual_duration_hours.toFixed(1)}h)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card className="bg-zinc-900/50 border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {recentLogs.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentLogs.map((log) => (
                    <div 
                      key={log.id}
                      className="p-3 rounded-lg border border-zinc-700 bg-zinc-800/30"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <Badge variant="outline" className="text-xs">
                          {log.log_type}
                        </Badge>
                        <span className="text-xs text-zinc-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300">{log.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
