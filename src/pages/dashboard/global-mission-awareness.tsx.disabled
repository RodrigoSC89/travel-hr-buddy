/**
 * PATCH 600 - Global Mission Awareness Dashboard
 * 
 * Visual interface for global awareness of missions (active, past, and emerging patterns).
 * Implements:
 * - Dashboard with map, timeline, and alerts
 * - Integration with pattern engine (PATCH 598)
 * - Status by mission and regional comparisons
 * - Drill-down for mission details
 */

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe,
  MapPin,
  TrendingUp,
  Zap,
  Eye,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { patternEngine, PatternAlert, MissionPattern } from "@/ai/analytics/pattern-engine";
import { replayAnnotator, TimelineEvent } from "@/ai/tools/mission-replay";

interface GlobalMissionStatus {
  id: string;
  mission_id: string;
  mission_name: string;
  status: "active" | "completed" | "failed" | "paused";
  mission_type: string;
  region: string;
  location_data: {
    lat: number;
    lon: number;
    details?: string;
  } | null;
  metrics: {
    duration_minutes?: number;
    team_size?: number;
    completion?: number;
  };
  alerts: string[];
  start_time: string;
  end_time: string | null;
  updated_at: string;
}

interface RegionalStats {
  region: string;
  active_missions: number;
  completed_missions: number;
  failed_missions: number;
  success_rate: number;
}

export default function GlobalMissionAwarenessDashboard() {
  const [missions, setMissions] = useState<GlobalMissionStatus[]>([]);
  const [patterns, setPatterns] = useState<MissionPattern[]>([]);
  const [alerts, setAlerts] = useState<PatternAlert[]>([]);
  const [recentEvents, setRecentEvents] = useState<TimelineEvent[]>([]);
  const [regionalStats, setRegionalStats] = useState<RegionalStats[]>([]);
  const [selectedMission, setSelectedMission] = useState<GlobalMissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();

    // Setup real-time updates
    const channel = supabase
      .channel("global-mission-awareness")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "global_mission_status" },
        () => {
          console.log("🔄 Mission status updated - refreshing dashboard");
          loadDashboardData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mission_patterns" },
        () => {
          console.log("🔄 Patterns updated - refreshing dashboard");
          loadPatterns();
        }
      )
      .subscribe();

    // Refresh every minute
    const interval = setInterval(loadDashboardData, 60000);

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  async function loadDashboardData() {
    setIsLoading(true);
    
    try {
      await Promise.all([
        loadMissions(),
        loadPatterns(),
        loadRegionalStats(),
      ]);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error("❌ Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMissions() {
    const { data, error } = await supabase
      .from("global_mission_status")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("❌ Error loading missions:", error);
      return;
    }

    setMissions((data || []) as GlobalMissionStatus[]);
  }

  async function loadPatterns() {
    const detectedPatterns = await patternEngine.getPatterns(undefined, undefined, 0.6);
    setPatterns(detectedPatterns);

    // Generate alerts for high-confidence patterns
    const newAlerts: PatternAlert[] = [];
    for (const pattern of detectedPatterns.slice(0, 5)) {
      if (pattern.confidence_score > 0.7) {
        const alert = await patternEngine.emitAlert(pattern);
        newAlerts.push(alert);
      }
    }
    setAlerts(newAlerts);
  }

  async function loadRegionalStats() {
    const stats: Record<string, RegionalStats> = {};

    missions.forEach((mission) => {
      const region = mission.region || "Unknown";
      
      if (!stats[region]) {
        stats[region] = {
          region,
          active_missions: 0,
          completed_missions: 0,
          failed_missions: 0,
          success_rate: 0,
        };
      }

      if (mission.status === "active") stats[region].active_missions++;
      if (mission.status === "completed") stats[region].completed_missions++;
      if (mission.status === "failed") stats[region].failed_missions++;
    });

    // Calculate success rates
    Object.values(stats).forEach((stat) => {
      const total = stat.completed_missions + stat.failed_missions;
      stat.success_rate = total > 0 ? (stat.completed_missions / total) * 100 : 0;
    });

    setRegionalStats(Object.values(stats));
  }

  async function loadMissionEvents(missionId: string) {
    const events = await replayAnnotator.getRecentEvents(missionId, 10);
    setRecentEvents(events);
  }

  function handleMissionClick(mission: GlobalMissionStatus) {
    setSelectedMission(mission);
    loadMissionEvents(mission.mission_id);
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "failed":
        return "bg-red-500";
      case "paused":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "active":
        return <Activity className="h-4 w-4" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4" />;
      case "paused":
        return <Clock className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  }

  function getSeverityColor(severity: string): string {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  }

  const activeMissions = missions.filter((m) => m.status === "active");
  const completedMissions = missions.filter((m) => m.status === "completed");
  const failedMissions = missions.filter((m) => m.status === "failed");
  const totalMissions = missions.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8" />
            Global Mission Awareness
          </h1>
          <p className="text-muted-foreground">
            Real-time visibility of all missions and emerging patterns
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMissions.length}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((activeMissions.length / Math.max(totalMissions, 1)) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedMissions.length}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((completedMissions.length / Math.max(totalMissions, 1)) * 100)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Patterns Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patterns.length}</div>
            <p className="text-xs text-muted-foreground">
              {patterns.filter((p) => p.confidence_score > 0.8).length} high confidence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {alerts.filter((a) => a.severity === "critical").length} critical
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="missions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="missions">Missions</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="regions">Regional View</TabsTrigger>
        </TabsList>

        {/* Missions Tab */}
        <TabsContent value="missions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Mission List */}
            <Card>
              <CardHeader>
                <CardTitle>Mission Status</CardTitle>
                <CardDescription>All missions ordered by recent activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {missions.map((mission) => (
                      <div
                        key={mission.id}
                        className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition"
                        onClick={() => handleMissionClick(mission)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(mission.status)}
                            <span className="font-medium">{mission.mission_name}</span>
                          </div>
                          <Badge className={getStatusColor(mission.status)}>
                            {mission.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            {mission.region || "Unknown region"}
                          </div>
                          <div>Type: {mission.mission_type}</div>
                          <div>Started: {new Date(mission.start_time).toLocaleString()}</div>
                          {mission.alerts.length > 0 && (
                            <div className="flex items-center gap-1 text-orange-600">
                              <AlertTriangle className="h-3 w-3" />
                              {mission.alerts.length} alert(s)
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Mission Details */}
            <Card>
              <CardHeader>
                <CardTitle>Mission Details</CardTitle>
                <CardDescription>
                  {selectedMission
                    ? `Details for ${selectedMission.mission_name}`
                    : "Select a mission to view details"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedMission ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Mission Information</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">ID:</span> {selectedMission.mission_id}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {selectedMission.mission_type}
                        </div>
                        <div>
                          <span className="font-medium">Region:</span> {selectedMission.region}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>{" "}
                          <Badge className={getStatusColor(selectedMission.status)}>
                            {selectedMission.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {selectedMission.metrics && Object.keys(selectedMission.metrics).length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Metrics</h3>
                        <div className="space-y-2 text-sm">
                          {Object.entries(selectedMission.metrics).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium capitalize">{key.replace("_", " ")}:</span>{" "}
                              {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {recentEvents.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Recent Events</h3>
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-2">
                            {recentEvents.map((event, i) => (
                              <div key={i} className="p-3 border rounded text-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <Badge variant={event.type === "critical" ? "destructive" : "default"}>
                                    {event.type}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(event.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <div className="font-medium">{event.title}</div>
                                <div className="text-muted-foreground">{event.ai_annotation}</div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    <div className="text-center">
                      <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Select a mission to view details</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detected Patterns</CardTitle>
              <CardDescription>
                Patterns identified across missions by the AI engine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {patterns.map((pattern) => (
                    <div key={pattern.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={pattern.pattern_type === "failure" ? "destructive" : "default"}>
                          {pattern.pattern_type}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          Confidence: {(pattern.confidence_score * 100).toFixed(0)}%
                        </div>
                      </div>
                      <h4 className="font-semibold mb-2">{pattern.pattern_data.description}</h4>
                      <div className="text-sm space-y-2">
                        <div>
                          <span className="font-medium">Occurrences:</span> {pattern.occurrences}
                        </div>
                        <div>
                          <span className="font-medium">Mission Types:</span>{" "}
                          {pattern.mission_types.join(", ")}
                        </div>
                        {pattern.preventive_actions.length > 0 && (
                          <div>
                            <span className="font-medium">Recommended Actions:</span>
                            <ul className="list-disc list-inside mt-1">
                              {pattern.preventive_actions.map((action, i) => (
                                <li key={i}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>Current alerts based on pattern detection</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {alerts.map((alert, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {new Date(alert.detected_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="font-semibold mb-2">{alert.message}</div>
                      {alert.recommended_actions.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">Recommended Actions:</span>
                          <ul className="list-disc list-inside mt-1">
                            {alert.recommended_actions.map((action, j) => (
                              <li key={j}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No active alerts</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional View Tab */}
        <TabsContent value="regions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regional Comparison</CardTitle>
              <CardDescription>Mission statistics by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionalStats.map((stat) => (
                  <div key={stat.region} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg">{stat.region}</h4>
                      <Badge variant="outline">{stat.success_rate.toFixed(0)}% success</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Active</div>
                        <div className="text-xl font-bold">{stat.active_missions}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Completed</div>
                        <div className="text-xl font-bold text-green-600">
                          {stat.completed_missions}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Failed</div>
                        <div className="text-xl font-bold text-red-600">{stat.failed_missions}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {regionalStats.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No regional data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
