/**
 * Digital Twin Dashboard - Real-time vessel state visualization
 * with predictive maintenance and equipment health monitoring
 */

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Activity,
  Gauge,
  Thermometer,
  Droplets,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Ship,
  Wrench,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from '@/lib/logger';

interface EquipmentHealth {
  equipment_id: string;
  equipment_name: string;
  health_score: number;
  failure_probability: number;
  recommended_action: string;
  estimated_rul_days: number;
  anomaly_detected: boolean;
  anomaly_details?: string;
}

interface MaintenanceScheduleItem {
  equipment_id: string;
  equipment_name: string;
  recommended_date: string;
  maintenance_type: string;
  priority: "low" | "medium" | "high" | "critical";
  estimated_cost: number;
  health_score: number;
  failure_probability: number;
}

interface DigitalTwinState {
  vessel_id: string;
  vessel_info: any;
  state_timestamp: string;
  sensors: {
    latest_readings: any[];
    health_metrics: {
      overall_score: number;
      sensor_count: number;
      sensor_types: number;
    };
  };
  crew: {
    onboard_count: number;
    crew_members: any[];
  };
  operations: {
    current_voyage: any;
    status: string;
  };
  position: { lat: number; lng: number } | null;
  overall_health_score: number;
}

interface DigitalTwinDashboardProps {
  vesselId?: string;
}

export function DigitalTwinDashboard({ vesselId }: DigitalTwinDashboardProps) {
  const [selectedVessel, setSelectedVessel] = useState<string>(vesselId || "");
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();

  // Fetch vessels list
  const { data: vessels = [] } = useQuery({
    queryKey: ["vessels-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, status")
        .order("name");
      if (error) throw error;
      return (data || []) as Array<{ id: string; name: string; status: string }>;
    },
  });

  // Fetch digital twin state
  const { data: twinState, isLoading: stateLoading, refetch: refetchState } = useQuery({
    queryKey: ["digital-twin-state", selectedVessel],
    queryFn: async () => {
      if (!selectedVessel) return null;
      
      const { data, error } = await supabase.functions.invoke("digital-twin", {
        body: { action: "get_vessel_state", vessel_id: selectedVessel },
      });
      
      if (error) throw error;
      return data as DigitalTwinState;
    },
    enabled: !!selectedVessel,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch equipment health
  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ["equipment-health", selectedVessel],
    queryFn: async () => {
      if (!selectedVessel) return null;
      
      const { data, error } = await supabase.functions.invoke("digital-twin", {
        body: { action: "analyze_equipment_health", vessel_id: selectedVessel },
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedVessel,
  });

  // Fetch predictive maintenance
  const { data: maintenanceData, isLoading: maintenanceLoading } = useQuery({
    queryKey: ["predictive-maintenance", selectedVessel],
    queryFn: async () => {
      if (!selectedVessel) return null;
      
      const { data, error } = await supabase.functions.invoke("digital-twin", {
        body: { action: "predict_maintenance", vessel_id: selectedVessel },
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedVessel,
  });

  // Fetch state forecast
  const { data: forecastData } = useQuery({
    queryKey: ["state-forecast", selectedVessel],
    queryFn: async () => {
      if (!selectedVessel) return null;
      
      const { data, error } = await supabase.functions.invoke("digital-twin", {
        body: { action: "forecast_state", vessel_id: selectedVessel, hours_ahead: 72 },
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedVessel,
  });

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return "bg-green-500/20";
    if (score >= 60) return "bg-yellow-500/20";
    if (score >= 40) return "bg-orange-500/20";
    return "bg-red-500/20";
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      critical: "bg-red-500 text-white",
      high: "bg-orange-500 text-white",
      medium: "bg-yellow-500 text-black",
      low: "bg-green-500 text-white",
    };
    return variants[priority] || "bg-muted";
  };

  const getSensorIcon = (type: string) => {
    if (type.includes("temperature")) return Thermometer;
    if (type.includes("pressure")) return Gauge;
    if (type.includes("fuel") || type.includes("oil")) return Droplets;
    if (type.includes("load") || type.includes("power")) return Zap;
    return Activity;
  };

  const handleVesselSelect = (vesselId: string) => {
    try {
      setSelectedVessel(vesselId);
      toast.success("Embarcação selecionada");
    } catch (error) {
      logger.error("Error selecting vessel:", error);
      toast.error("Erro ao selecionar embarcação");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Ship className="h-6 w-6 text-primary" />
            Digital Twin Dashboard
          </h2>
          <p className="text-muted-foreground">
            Real-time vessel state and predictive maintenance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedVessel} onValueChange={handleVesselSelect}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select vessel" />
            </SelectTrigger>
            <SelectContent>
              {vessels.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              refetchState();
              queryClient.invalidateQueries({ queryKey: ["equipment-health"] });
              queryClient.invalidateQueries({ queryKey: ["predictive-maintenance"] });
              toast.success("Data refreshed");
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!selectedVessel ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Ship className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a vessel to view its digital twin</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Health</p>
                    <p className={cn("text-3xl font-bold", getHealthColor(twinState?.overall_health_score || 0))}>
                      {twinState?.overall_health_score || 0}%
                    </p>
                  </div>
                  <div className={cn("p-3 rounded-full", getHealthBg(twinState?.overall_health_score || 0))}>
                    <Activity className={cn("h-6 w-6", getHealthColor(twinState?.overall_health_score || 0))} />
                  </div>
                </div>
                <Progress 
                  value={twinState?.overall_health_score || 0} 
                  className="mt-3 h-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Sensors</p>
                    <p className="text-3xl font-bold">
                      {twinState?.sensors?.health_metrics?.sensor_count || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-500/20">
                    <Gauge className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {twinState?.sensors?.health_metrics?.sensor_types || 0} types monitored
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Crew Onboard</p>
                    <p className="text-3xl font-bold">{twinState?.crew?.onboard_count || 0}</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-500/20">
                    <CheckCircle className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Status: {twinState?.operations?.status || "Unknown"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Maintenance Tasks</p>
                    <p className="text-3xl font-bold">
                      {maintenanceData?.maintenance_schedule?.length || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-orange-500/20">
                    <Wrench className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {maintenanceData?.critical_alerts?.length || 0} critical alerts
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Equipment Health</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance Schedule</TabsTrigger>
              <TabsTrigger value="forecast">State Forecast</TabsTrigger>
              <TabsTrigger value="sensors">Sensor Readings</TabsTrigger>
            </TabsList>

            {/* Equipment Health Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Equipment Health Analysis</CardTitle>
                  <CardDescription>
                    AI-powered health scoring and failure prediction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {healthLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {(healthData?.equipment_health || []).map((eq: EquipmentHealth) => {
                        const Icon = getSensorIcon(eq.equipment_id);
                        return (
                          <Card key={eq.equipment_id} className={cn(
                            "border-l-4",
                            eq.health_score >= 80 ? "border-l-green-500" :
                            eq.health_score >= 60 ? "border-l-yellow-500" :
                            eq.health_score >= 40 ? "border-l-orange-500" : "border-l-red-500"
                          )}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Icon className={cn("h-5 w-5", getHealthColor(eq.health_score))} />
                                  <span className="font-medium text-sm">{eq.equipment_name}</span>
                                </div>
                                {eq.anomaly_detected && (
                                  <Badge variant="destructive" className="text-xs">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Anomaly
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Health</span>
                                  <span className={cn("font-bold", getHealthColor(eq.health_score))}>
                                    {eq.health_score}%
                                  </span>
                                </div>
                                <Progress value={eq.health_score} className="h-1.5" />
                                
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Failure Risk</span>
                                  <span className={eq.failure_probability > 0.3 ? "text-red-500" : "text-muted-foreground"}>
                                    {(eq.failure_probability * 100).toFixed(1)}%
                                  </span>
                                </div>
                                
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">RUL</span>
                                  <span>{eq.estimated_rul_days} days</span>
                                </div>
                              </div>
                              
                              <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                                {eq.recommended_action}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Maintenance Schedule Tab */}
            <TabsContent value="maintenance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Predictive Maintenance Schedule</CardTitle>
                  <CardDescription>
                    AI-generated maintenance recommendations based on equipment health
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {maintenanceLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {(maintenanceData?.maintenance_schedule || []).map((item: MaintenanceScheduleItem, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-4 rounded-lg border bg-card"
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "p-2 rounded-lg",
                                getPriorityBadge(item.priority)
                              )}>
                                <Wrench className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">{item.equipment_name}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>{item.recommended_date}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {item.maintenance_type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-sm font-medium">
                                <DollarSign className="h-4 w-4" />
                                {item.estimated_cost.toLocaleString()}
                              </div>
                              <Badge className={getPriorityBadge(item.priority)}>
                                {item.priority.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {(!maintenanceData?.maintenance_schedule || maintenanceData.maintenance_schedule.length === 0) && (
                          <div className="text-center py-8 text-muted-foreground">
                            <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No maintenance tasks scheduled</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* State Forecast Tab */}
            <TabsContent value="forecast" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>72-Hour State Forecast</CardTitle>
                  <CardDescription>
                    Predicted equipment states and identified risks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {forecastData ? (
                    <div className="space-y-6">
                      {/* Overall Risk */}
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                        <div className={cn(
                          "p-3 rounded-full",
                          forecastData.overall_risk === "high" ? "bg-red-500/20" :
                          forecastData.overall_risk === "medium" ? "bg-yellow-500/20" : "bg-green-500/20"
                        )}>
                          <AlertTriangle className={cn(
                            "h-6 w-6",
                            forecastData.overall_risk === "high" ? "text-red-500" :
                            forecastData.overall_risk === "medium" ? "text-yellow-500" : "text-green-500"
                          )} />
                        </div>
                        <div>
                          <p className="font-medium">Overall Risk Level: {forecastData.overall_risk?.toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">
                            {forecastData.identified_risks?.length || 0} potential issues identified
                          </p>
                        </div>
                      </div>

                      {/* Sensor Forecasts */}
                      <div className="grid gap-3 md:grid-cols-2">
                        {Object.entries(forecastData.sensor_forecasts || {}).map(([sensor, data]: [string, any]) => {
                          const TrendIcon = data.trend === "increasing" ? TrendingUp :
                                           data.trend === "decreasing" ? TrendingDown : Minus;
                          return (
                            <div
                              key={sensor}
                              className={cn(
                                "p-4 rounded-lg border",
                                data.risk_level === "critical" ? "border-red-500 bg-red-500/5" :
                                data.risk_level === "warning" ? "border-yellow-500 bg-yellow-500/5" : ""
                              )}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">
                                  {sensor.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                <TrendIcon className={cn(
                                  "h-4 w-4",
                                  data.trend === "increasing" ? "text-red-500" :
                                  data.trend === "decreasing" ? "text-green-500" : "text-muted-foreground"
                                )} />
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold">{data.current_value}</span>
                                <span className="text-muted-foreground">→</span>
                                <span className={cn(
                                  "text-lg",
                                  data.risk_level !== "low" ? "text-red-500" : "text-muted-foreground"
                                )}>
                                  {data.forecasted_value}
                                </span>
                                {data.threshold?.unit && (
                                  <span className="text-sm text-muted-foreground">{data.threshold.unit}</span>
                                )}
                              </div>
                              {data.risk_level !== "low" && (
                                <Badge variant="destructive" className="mt-2 text-xs">
                                  {data.risk_level.toUpperCase()} RISK
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Insufficient data for forecasting</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sensor Readings Tab */}
            <TabsContent value="sensors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Latest Sensor Readings</CardTitle>
                  <CardDescription>
                    Real-time data from vessel equipment sensors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {(twinState?.sensors?.latest_readings || []).map((reading: any, idx: number) => {
                        const Icon = getSensorIcon(reading.sensor_type);
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {reading.sensor_type?.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium">
                                {reading.sensor_value} {reading.unit}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(reading.recorded_at).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {(!twinState?.sensors?.latest_readings || twinState.sensors.latest_readings.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Gauge className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No sensor data available</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

export default DigitalTwinDashboard;
