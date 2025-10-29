/**
 * PATCH 516 - Sensor Hub Avançado v2
 * Advanced sensor monitoring with real-time updates, MQTT/Realtime, and filtering
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  AlertTriangle,
  Waves,
  Box,
  Brain,
  Navigation,
  RefreshCw,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type SensorType = 'all' | 'oceanic' | 'structural' | 'ai' | 'navigation';

interface SensorReading {
  id: string;
  sensor_id: string;
  value: number;
  unit: string;
  status: string;
  timestamp: string;
}

interface SensorConfig {
  id: string;
  sensor_id: string;
  sensor_name: string;
  sensor_type: string;
  unit: string;
  anomaly_threshold: number;
  alert_enabled: boolean;
}

export default function SensorsHubPage() {
  const [selectedType, setSelectedType] = useState<SensorType>('all');
  const [sensors, setSensors] = useState<SensorConfig[]>([]);
  const [readings, setReadings] = useState<Map<string, SensorReading>>(new Map());
  const [loading, setLoading] = useState(true);
  const [isRealtime, setIsRealtime] = useState(false);

  useEffect(() => {
    loadSensors();
    initializeRealtime();

    return () => {
      // Cleanup realtime subscriptions
    };
  }, []);

  useEffect(() => {
    if (sensors.length > 0) {
      loadLatestReadings();
      // Poll for updates every 2 seconds
      const interval = setInterval(loadLatestReadings, 2000);
      return () => clearInterval(interval);
    }
  }, [sensors]);

  const loadSensors = async () => {
    try {
      const { data, error } = await supabase
        .from('sensor_config')
        .select('*')
        .order('sensor_name');

      if (error) throw error;
      setSensors(data || []);
    } catch (error) {
      console.error('Error loading sensors:', error);
      toast.error('Failed to load sensors');
    } finally {
      setLoading(false);
    }
  };

  const loadLatestReadings = async () => {
    if (sensors.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .in('sensor_id', sensors.map(s => s.sensor_id))
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Get the latest reading for each sensor
      const readingsMap = new Map<string, SensorReading>();
      (data || []).forEach((reading: SensorReading) => {
        if (!readingsMap.has(reading.sensor_id)) {
          readingsMap.set(reading.sensor_id, reading);
        }
      });

      setReadings(readingsMap);
    } catch (error) {
      console.error('Error loading readings:', error);
    }
  };

  const initializeRealtime = () => {
    const channel = supabase
      .channel('sensor-readings-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_readings'
        },
        (payload) => {
          const newReading = payload.new as SensorReading;
          setReadings(prev => new Map(prev.set(newReading.sensor_id, newReading)));
          setIsRealtime(true);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          toast.success('Real-time updates enabled');
        }
      });

    return () => {
      channel.unsubscribe();
    };
  };

  const filteredSensors = sensors.filter(sensor => 
    selectedType === 'all' || sensor.sensor_type === selectedType
  );

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'oceanic': return Waves;
      case 'structural': return Box;
      case 'ai': return Brain;
      case 'navigation': return Navigation;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      case 'offline': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Sensor Hub Avançado v2
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            PATCH 516 - Real-time sensor monitoring with MQTT/Supabase Realtime
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isRealtime && (
            <Badge className="bg-green-500">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              Live
            </Badge>
          )}
          <Button onClick={loadLatestReadings} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sensors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sensors.length}</div>
            <p className="text-xs text-muted-foreground">Active sensors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Normal Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {Array.from(readings.values()).filter(r => r.status === 'normal').length}
            </div>
            <p className="text-xs text-muted-foreground">Operating normally</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {Array.from(readings.values()).filter(r => r.status === 'warning').length}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {Array.from(readings.values()).filter(r => r.status === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">Urgent action</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as SensorType)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            <Filter className="h-4 w-4 mr-2" />
            All
          </TabsTrigger>
          <TabsTrigger value="oceanic">
            <Waves className="h-4 w-4 mr-2" />
            Oceanic
          </TabsTrigger>
          <TabsTrigger value="structural">
            <Box className="h-4 w-4 mr-2" />
            Structural
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Brain className="h-4 w-4 mr-2" />
            AI
          </TabsTrigger>
          <TabsTrigger value="navigation">
            <Navigation className="h-4 w-4 mr-2" />
            Navigation
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Readings</CardTitle>
              <CardDescription>
                Real-time data from {filteredSensors.length} {selectedType === 'all' ? '' : selectedType} sensors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Loading sensors...</p>
                </div>
              ) : filteredSensors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No sensors found for this type</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSensors.map(sensor => {
                    const reading = readings.get(sensor.sensor_id);
                    const Icon = getSensorIcon(sensor.sensor_type);
                    
                    return (
                      <Card key={sensor.id} className="hover:border-primary transition-colors">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {sensor.sensor_name}
                          </CardTitle>
                          <Badge variant="outline" className="w-fit">
                            {sensor.sensor_type}
                          </Badge>
                        </CardHeader>
                        <CardContent>
                          {reading ? (
                            <div>
                              <div className={`text-2xl font-bold ${getStatusColor(reading.status)}`}>
                                {reading.value.toFixed(2)} {reading.unit}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(reading.timestamp).toLocaleString()}
                              </div>
                              {reading.status !== 'normal' && (
                                <Badge variant={reading.status === 'critical' ? 'destructive' : 'default'} className="mt-2">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {reading.status.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <div className="text-muted-foreground">No data available</div>
                          )}
                        </CardContent>
                      </Card>
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
}
