/**
 * PATCH 405 - Sensor Hub Dashboard
 * IoT sensor management with real-time data visualization
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Plus,
  Thermometer,
  Droplet,
  Wind,
  Zap,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Radio,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Sensor {
  id: string;
  name: string;
  sensor_type: string;
  location: string | null;
  description: string | null;
  status: string;
  last_reading: any;
  last_reading_at: string | null;
  configuration: any;
  is_active: boolean;
  created_at: string;
}

interface SensorLog {
  id: string;
  sensor_id: string;
  log_type: string;
  message: string;
  details: any;
  is_acknowledged: boolean;
  created_at: string;
}

const SensorHubPage = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [logs, setLogs] = useState<SensorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewSensor, setShowNewSensor] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    sensor_type: "temperature",
    location: "",
    description: "",
  });

  useEffect(() => {
    loadSensors();
    loadLogs();

    // Set up realtime subscription
    const channel = supabase
      .channel("sensor_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sensors",
        },
        () => {
          loadSensors();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sensor_logs",
        },
        () => {
          loadLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSensors = async () => {
    try {
      const { data, error } = await supabase
        .from("sensors")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSensors(data || []);
    } catch (error: any) {
      console.error("Error loading sensors:", error);
      toast({
        title: "Error loading sensors",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("sensor_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error("Error loading logs:", error);
    }
  };

  const createSensor = async () => {
    try {
      const { error } = await supabase.from("sensors").insert({
        name: formData.name,
        sensor_type: formData.sensor_type,
        location: formData.location || null,
        description: formData.description || null,
        status: "offline",
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "✅ Sensor Created",
        description: "Sensor has been registered successfully",
      });

      setShowNewSensor(false);
      setFormData({
        name: "",
        sensor_type: "temperature",
        location: "",
        description: "",
      });
      loadSensors();
    } catch (error: any) {
      toast({
        title: "Error creating sensor",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateSensorStatus = async (sensorId: string, newStatus: string) => {
    try {
      const { error } = await supabase.rpc("update_sensor_status", {
        p_sensor_id: sensorId,
        p_status: newStatus,
      });

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Sensor status changed to ${newStatus}`,
      });

      loadSensors();
      loadLogs();
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const simulateReading = async (sensor: Sensor) => {
    try {
      // Simulate sensor reading based on type
      let reading, value, unit;
      
      switch (sensor.sensor_type) {
        case "temperature":
          value = 20 + Math.random() * 10;
          unit = "°C";
          reading = { temperature: value, unit };
          break;
        case "humidity":
          value = 40 + Math.random() * 40;
          unit = "%";
          reading = { humidity: value, unit };
          break;
        case "pressure":
          value = 980 + Math.random() * 40;
          unit = "hPa";
          reading = { pressure: value, unit };
          break;
        default:
          value = Math.random() * 100;
          unit = "units";
          reading = { value, unit };
      }

      const { error } = await supabase.rpc("record_sensor_reading", {
        p_sensor_id: sensor.id,
        p_reading: reading,
        p_reading_value: value,
        p_unit: unit,
      });

      if (error) throw error;

      toast({
        title: "Reading Recorded",
        description: `${sensor.name}: ${value.toFixed(2)} ${unit}`,
      });

      loadSensors();
    } catch (error: any) {
      toast({
        title: "Error recording reading",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case "temperature":
        return <Thermometer className="h-5 w-5" />;
      case "humidity":
        return <Droplet className="h-5 w-5" />;
      case "pressure":
      case "gas":
        return <Wind className="h-5 w-5" />;
      case "energy":
        return <Zap className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "offline":
        return "text-gray-400";
      case "error":
        return "text-red-600";
      case "maintenance":
        return "text-yellow-600";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4" />;
      case "offline":
        return <XCircle className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Radio className="h-4 w-4" />;
    }
  };

  const activeSensors = sensors.filter((s) => s.status === "active");
  const offlineSensors = sensors.filter((s) => s.status === "offline");
  const errorSensors = sensors.filter((s) => s.status === "error");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sensor Hub</h1>
          <p className="text-muted-foreground">
            Monitor and manage IoT sensors in real-time
          </p>
        </div>
        <Dialog open={showNewSensor} onOpenChange={setShowNewSensor}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Register Sensor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Sensor</DialogTitle>
              <DialogDescription>
                Add a new IoT sensor to the monitoring system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Sensor Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Server Room Temperature"
                />
              </div>
              <div>
                <Label htmlFor="sensor_type">Sensor Type</Label>
                <Select
                  value={formData.sensor_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sensor_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temperature">Temperature</SelectItem>
                    <SelectItem value="humidity">Humidity</SelectItem>
                    <SelectItem value="pressure">Pressure</SelectItem>
                    <SelectItem value="motion">Motion</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="gas">Gas/Air Quality</SelectItem>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="energy">Energy</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Building A, Floor 3"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this sensor"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewSensor(false)}>
                Cancel
              </Button>
              <Button onClick={createSensor}>Register Sensor</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sensors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sensors.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered sensors
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeSensors.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Operational sensors
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <XCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">
              {offlineSensors.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Not connected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {errorSensors.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sensors List and Logs */}
      <Tabs defaultValue="sensors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sensors">
            Sensors ({sensors.length})
          </TabsTrigger>
          <TabsTrigger value="logs">
            Logs ({logs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sensors" className="space-y-4">
          {loading ? (
            <div className="text-center py-12">Loading sensors...</div>
          ) : sensors.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No sensors registered yet. Register your first sensor to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sensors.map((sensor) => (
                <Card key={sensor.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={getStatusColor(sensor.status)}>
                          {getSensorIcon(sensor.sensor_type)}
                        </div>
                        <div>
                          <CardTitle className="text-base">{sensor.name}</CardTitle>
                          <CardDescription className="line-clamp-1">
                            {sensor.location || "No location"}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={sensor.status === "active" ? "default" : "secondary"}
                        className={getStatusColor(sensor.status)}
                      >
                        <span className="flex items-center gap-1">
                          {getStatusIcon(sensor.status)}
                          {sensor.status}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Last Reading</p>
                        {sensor.last_reading ? (
                          <div className="text-lg font-semibold">
                            {JSON.stringify(sensor.last_reading)}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No readings yet</p>
                        )}
                        {sensor.last_reading_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(sensor.last_reading_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => simulateReading(sensor)}
                        >
                          Simulate Reading
                        </Button>
                        <Select
                          value={sensor.status}
                          onValueChange={(value) =>
                            updateSensorStatus(sensor.id, value)
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Event Logs</CardTitle>
              <CardDescription>
                Recent events, alerts, and system messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No logs available
                </p>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => {
                    const logTypeColors: Record<string, string> = {
                      info: "text-blue-600",
                      warning: "text-yellow-600",
                      error: "text-red-600",
                      alert: "text-orange-600",
                      maintenance: "text-gray-600",
                    };
                    
                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <div className={logTypeColors[log.log_type]}>
                          <AlertCircle className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <p className="font-medium">{log.message}</p>
                            <Badge variant="outline">{log.log_type}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SensorHubPage;
