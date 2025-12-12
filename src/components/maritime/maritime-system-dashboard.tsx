
import { memo, memo, useEffect, useState, useCallback, useMemo } from "react";;;
import { supabase } from "@/integrations/supabase/client";
import { IoTSensorData, ChecklistRecord } from "@/types/modules";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Thermometer, Gauge, Zap, CheckSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const MaritimeSystemDashboard = memo(function() {
  const [sensorData, setSensorData] = useState<IoTSensorData[]>([]);
  const [checklists, setChecklists] = useState<ChecklistRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaritimeData();
    
    // Real-time subscription for IoT sensor updates
    const channel = supabase
      .channel("iot_sensor_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "iot_sensor_data"
        },
        () => {
          loadMaritimeData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMaritimeData = async () => {
    try {
      const [sensorsRes, checklistsRes] = await Promise.all([
        supabase
          .from("iot_sensor_data")
          .select("*")
          .order("reading_timestamp", { ascending: false })
          .limit(50),
        supabase
          .from("checklist_records")
          .select("*")
          .order("created_at", { ascending: false })
      ]);

      if (sensorsRes.error) throw sensorsRes.error;
      if (checklistsRes.error) throw checklistsRes.error;

      setSensorData(sensorsRes.data || []);
      setChecklists(checklistsRes.data || []);
    } catch (error) {
      console.error("Error loading maritime data:", error);
      toast.error("Failed to load maritime system data");
    } finally {
      setLoading(false);
    }
  };

  const getSensorIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      temperature: <Thermometer className="h-4 w-4" />,
      pressure: <Gauge className="h-4 w-4" />,
      vibration: <Activity className="h-4 w-4" />,
      fuel_level: <Zap className="h-4 w-4" />,
      engine_rpm: <Activity className="h-4 w-4" />
    };

    return icons[type] || <Activity className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      normal: "text-green-500",
      warning: "text-yellow-500",
      critical: "text-red-500",
      offline: "text-gray-500"
    };

    return colors[status] || "text-gray-500";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      in_progress: "default",
      completed: "outline",
      failed: "destructive",
      expired: "destructive"
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const groupSensorsByType = (sensors: IoTSensorData[]) => {
    const grouped: Record<string, IoTSensorData[]> = {};
    sensors.forEach(sensor => {
      if (!grouped[sensor.sensor_type]) {
        grouped[sensor.sensor_type] = [];
      }
      grouped[sensor.sensor_type].push(sensor);
  };
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading maritime system data...</div>
      </div>
    );
  }

  const groupedSensors = groupSensorsByType(sensorData);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Maritime System</h2>
          <p className="text-sm text-muted-foreground">
            IoT sensor monitoring and operational checklists
          </p>
        </div>
      </div>

      <Tabs defaultValue="sensors" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sensors">
            <Activity className="mr-2 h-4 w-4" />
            IoT Sensors
          </TabsTrigger>
          <TabsTrigger value="checklists">
            <CheckSquare className="mr-2 h-4 w-4" />
            Checklists
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sensors" className="space-y-4">
          {Object.keys(groupedSensors).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No sensor data available</p>
                <Button variant="outline" className="mt-4">
                  Configure Sensors
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(groupedSensors).map(([type, sensors]) => (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center capitalize">
                      {getSensorIcon(type)}
                      <span className="ml-2">{type.replace("_", " ")}</span>
                    </CardTitle>
                    <CardDescription>
                      {sensors.length} sensor{sensors.length !== 1 ? "s" : ""} active
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sensors.slice(0, 3).map((sensor) => (
                        <div key={sensor.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{sensor.sensor_id}</p>
                            <p className="text-xs text-muted-foreground">
                              {sensor.sensor_location || "Unknown location"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">
                              {sensor.value} {sensor.unit}
                            </p>
                            <div className={`flex items-center justify-end ${getStatusColor(sensor.status)}`}>
                              <Activity className="h-3 w-3 mr-1" />
                              <span className="text-xs capitalize">{sensor.status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {sensors.length > 3 && (
                        <Button variant="ghost" size="sm" className="w-full">
                          View all {sensors.length} sensors
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Active Alerts */}
          {sensorData.filter(s => s.is_alert).length > 0 && (
            <Card className="border-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-600">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Active Sensor Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sensorData
                    .filter(s => s.is_alert)
                    .slice(0, 5)
                    .map((sensor) => (
                      <div key={sensor.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{sensor.sensor_id}</p>
                          <p className="text-xs text-muted-foreground">
                            {sensor.sensor_type} - {sensor.sensor_location}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-yellow-600">
                            {sensor.value} {sensor.unit}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Threshold: {sensor.threshold_min} - {sensor.threshold_max}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="checklists" className="space-y-4">
          <div className="grid gap-4">
            {checklists.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No checklists available</p>
                  <Button className="mt-4">
                    Create Checklist
                  </Button>
                </CardContent>
              </Card>
            ) : (
              checklists.map((checklist) => (
                <Card key={checklist.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg capitalize">
                        {checklist.checklist_name}
                      </CardTitle>
                      {getStatusBadge(checklist.status)}
                    </div>
                    <CardDescription>
                      {checklist.checklist_type.replace("_", " ").toUpperCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{checklist.completion_percentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${checklist.completion_percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Checklist Info */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {checklist.assigned_to && (
                          <div>
                            <span className="text-muted-foreground">Assigned to:</span>
                            <p className="font-medium">User {checklist.assigned_to.substring(0, 8)}</p>
                          </div>
                        )}
                        {checklist.due_date && (
                          <div>
                            <span className="text-muted-foreground">Due date:</span>
                            <p className="font-medium">{new Date(checklist.due_date).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>

                      {checklist.items && Array.isArray(checklist.items) && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {checklist.items.length} item{checklist.items.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View Details</Button>
                        {checklist.status === "in_progress" && (
                          <Button size="sm">Continue</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});
