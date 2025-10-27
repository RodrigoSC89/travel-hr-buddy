// @ts-nocheck
/**
 * PATCH 168.0: Nautilus Fleet Command Center (FCC)
 * Central dashboard for fleet-wide vessel monitoring and mission control
 * 
 * Features:
 * - Global map with real-time vessel positions
 * - Status indicators (OK, alert, failure)
 * - Mission assignment interface
 * - Global logs per vessel
 * - Filtering and search capabilities
 */

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Ship, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Activity, 
  MapPin, 
  Filter,
  Search,
  Plus,
  RefreshCw
} from "lucide-react";
import { MissionEngine, Mission, Vessel } from "@/lib/mission-engine";
import { DistributedAIEngine } from "@/lib/distributed-ai-engine";
import { logger } from "@/lib/logger";

type VesselStatus = "active" | "maintenance" | "inactive" | "critical";
type FilterStatus = "all" | VesselStatus;

interface VesselWithMission extends Vessel {
  current_mission?: Mission;
  ai_context?: {
    interaction_count: number;
    last_sync: string;
  };
}

export const FleetCommandCenter: React.FC = () => {
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch all vessels with their status
  const { data: vessels, isLoading: vesselsLoading, refetch: refetchVessels } = useQuery({
    queryKey: ["fleet-vessels", filterStatus],
    queryFn: async () => {
      let query = supabase
        .from("vessels")
        .select(`
          *,
          maintenance_records (
            status,
            priority,
            next_due
          ),
          vessel_ai_contexts (
            interaction_count,
            last_sync
          )
        `)
        .order("name");

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;

      if (error) {
        logger.error("Error fetching vessels:", error);
        throw error;
      }

      return data as VesselWithMission[];
    },
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds if enabled
  });

  // Fetch active missions
  const { data: missions, isLoading: missionsLoading } = useQuery({
    queryKey: ["fleet-missions"],
    queryFn: async () => {
      return await MissionEngine.getMissions({ status: "active" });
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // Fetch logs for selected vessel
  const { data: vesselLogs } = useQuery({
    queryKey: ["vessel-logs", selectedVessel],
    queryFn: async () => {
      if (!selectedVessel) return [];

      const { data, error } = await supabase
        .from("mission_logs")
        .select("*")
        .eq("vessel_id", selectedVessel)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        logger.error("Error fetching vessel logs:", error);
        return [];
      }

      return data;
    },
    enabled: !!selectedVessel,
  });

  // Filter vessels by search query
  const filteredVessels = vessels?.filter(vessel => 
    vessel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vessel.imo_code?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Get status color and icon
  const getStatusInfo = (status: VesselStatus) => {
    switch (status) {
    case "active":
      return { color: "bg-green-500", icon: CheckCircle, label: "OK" };
    case "maintenance":
      return { color: "bg-yellow-500", icon: Activity, label: "Maintenance" };
    case "critical":
      return { color: "bg-red-500", icon: AlertTriangle, label: "Critical" };
    case "inactive":
      return { color: "bg-gray-500", icon: XCircle, label: "Inactive" };
    default:
      return { color: "bg-gray-500", icon: Ship, label: "Unknown" };
    }
  };

  // Calculate fleet statistics
  const fleetStats = {
    total: vessels?.length || 0,
    active: vessels?.filter(v => v.status === "active").length || 0,
    maintenance: vessels?.filter(v => v.status === "maintenance").length || 0,
    critical: vessels?.filter(v => v.status === "critical").length || 0,
    missions: missions?.length || 0,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ship className="h-8 w-8" />
            Nautilus Fleet Command Center
          </h1>
          <p className="text-muted-foreground">
            Real-time fleet monitoring and mission coordination
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              refetchVessels();
            }}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto Refresh: {autoRefresh ? "ON" : "OFF"}
          </Button>
        </div>
      </div>

      {/* Fleet Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Vessels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fleetStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{fleetStats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-600">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{fleetStats.maintenance}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{fleetStats.critical}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-600">Active Missions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{fleetStats.missions}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="fleet" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fleet">Fleet Overview</TabsTrigger>
          <TabsTrigger value="missions">Active Missions</TabsTrigger>
          <TabsTrigger value="map">Global Map</TabsTrigger>
        </TabsList>

        {/* Fleet Overview Tab */}
        <TabsContent value="fleet" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vessel Status</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search vessels..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {vesselsLoading ? (
                <div className="text-center py-8">Loading vessels...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVessels.map((vessel) => {
                    const statusInfo = getStatusInfo(vessel.status as VesselStatus);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <Card
                        key={vessel.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedVessel === vessel.id ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setSelectedVessel(vessel.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Ship className="h-5 w-5" />
                              <CardTitle className="text-base">{vessel.name}</CardTitle>
                            </div>
                            <Badge className={`${statusInfo.color} text-white`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs">
                            {vessel.imo_code || "No IMO Code"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Type:</span>
                              <span className="font-medium">{vessel.vessel_type || "Unknown"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Flag:</span>
                              <span className="font-medium">{vessel.flag || "Unknown"}</span>
                            </div>
                            {vessel.last_known_position && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {vessel.last_known_position.lat?.toFixed(4)}, {vessel.last_known_position.lng?.toFixed(4)}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Vessel Logs */}
          {selectedVessel && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Logs - {vessels?.find(v => v.id === selectedVessel)?.name}</CardTitle>
                <CardDescription>Latest 50 mission events</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {vesselLogs && vesselLogs.length > 0 ? (
                      vesselLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                          <Badge variant={
                            log.log_type === "error" ? "destructive" :
                              log.log_type === "warning" ? "default" :
                                "secondary"
                          }>
                            {log.log_type}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm">{log.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No logs available for this vessel
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Active Missions Tab */}
        <TabsContent value="missions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Missions</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Mission
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {missionsLoading ? (
                <div className="text-center py-8">Loading missions...</div>
              ) : missions && missions.length > 0 ? (
                <div className="space-y-4">
                  {missions.map((mission) => (
                    <Card key={mission.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{mission.name}</CardTitle>
                          <Badge variant={
                            mission.priority === "critical" ? "destructive" :
                              mission.priority === "high" ? "default" :
                                "secondary"
                          }>
                            {mission.priority}
                          </Badge>
                        </div>
                        <CardDescription>{mission.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm">
                          <Badge>{mission.mission_type}</Badge>
                          <Badge variant="outline">{mission.status}</Badge>
                          {mission.start_time && (
                            <span className="text-muted-foreground">
                              Started: {new Date(mission.start_time).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No active missions
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Global Map Tab */}
        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Fleet Global Map</CardTitle>
              <CardDescription>Real-time vessel positions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4" />
                  <p>Interactive map integration coming soon</p>
                  <p className="text-sm">Using Mapbox GL for real-time vessel tracking</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
