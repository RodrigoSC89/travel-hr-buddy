/**
 * Real-time Sensor Monitor - PATCH 1000
 * Supabase Realtime integration for equipment sensors
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Thermometer, 
  Activity,
  Gauge,
  Zap,
  Droplets,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Radio
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface SensorReading {
  id: string;
  equipment_id: string;
  equipment_name: string;
  sensor_type: 'temperature' | 'vibration' | 'pressure' | 'flow' | 'voltage' | 'current' | 'rpm' | 'fuel';
  value: number;
  unit: string;
  min_threshold: number | null;
  max_threshold: number | null;
  is_anomaly: boolean;
  created_at: string;
}

const SENSOR_ICONS: Record<string, React.ComponentType<any>> = {
  temperature: Thermometer,
  vibration: Activity,
  pressure: Gauge,
  voltage: Zap,
  current: Zap,
  flow: Droplets,
  rpm: Activity,
  fuel: Droplets,
};

const SENSOR_COLORS: Record<string, string> = {
  temperature: 'text-orange-500',
  vibration: 'text-violet-500',
  pressure: 'text-blue-500',
  voltage: 'text-amber-500',
  current: 'text-yellow-500',
  flow: 'text-cyan-500',
  rpm: 'text-emerald-500',
  fuel: 'text-green-500',
};

// Simulated sensor data generator
const generateSensorData = (): Omit<SensorReading, 'id' | 'created_at'> => {
  const sensors = [
    { equipment_id: 'eng-001', equipment_name: 'Main Engine #1', type: 'temperature', min: 60, max: 95, unit: '°C' },
    { equipment_id: 'eng-001', equipment_name: 'Main Engine #1', type: 'vibration', min: 0, max: 4.5, unit: 'mm/s' },
    { equipment_id: 'gen-001', equipment_name: 'Generator #1', type: 'voltage', min: 380, max: 420, unit: 'V' },
    { equipment_id: 'gen-001', equipment_name: 'Generator #1', type: 'current', min: 0, max: 100, unit: 'A' },
    { equipment_id: 'pump-001', equipment_name: 'Ballast Pump', type: 'pressure', min: 2, max: 8, unit: 'bar' },
    { equipment_id: 'comp-001', equipment_name: 'Air Compressor', type: 'temperature', min: 40, max: 90, unit: '°C' },
  ];

  const sensor = sensors[Math.floor(Math.random() * sensors.length)];
  const range = sensor.max - sensor.min;
  const value = sensor.min + Math.random() * range;
  
  // 10% chance of anomaly
  const isAnomaly = Math.random() < 0.1;
  const anomalyValue = isAnomaly 
    ? (Math.random() > 0.5 ? sensor.max * 1.15 : sensor.min * 0.85)
    : value;

  return {
    equipment_id: sensor.equipment_id,
    equipment_name: sensor.equipment_name,
    sensor_type: sensor.type as any,
    value: Math.round(anomalyValue * 100) / 100,
    unit: sensor.unit,
    min_threshold: sensor.min,
    max_threshold: sensor.max,
    is_anomaly: isAnomaly,
  };
};

export function RealtimeSensorMonitor() {
  const [sensors, setSensors] = useState<SensorReading[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [anomalyCount, setAnomalyCount] = useState(0);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('sensor-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'equipment_sensors'
        },
        (payload) => {
          const newSensor = payload.new as SensorReading;
          setSensors(prev => [newSensor, ...prev].slice(0, 50));
          if (newSensor.is_anomaly) {
            setAnomalyCount(prev => prev + 1);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Simulate sensor data (for demo)
  useEffect(() => {
    const interval = setInterval(() => {
      const newReading: SensorReading = {
        ...generateSensorData(),
        id: `sensor-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        created_at: new Date().toISOString(),
      };
      
      setSensors(prev => [newReading, ...prev].slice(0, 50));
      if (newReading.is_anomaly) {
        setAnomalyCount(prev => prev + 1);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const latestByEquipment = sensors.reduce((acc, sensor) => {
    const key = `${sensor.equipment_id}-${sensor.sensor_type}`;
    if (!acc[key]) {
      acc[key] = sensor;
    }
    return acc;
  }, {} as Record<string, SensorReading>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Monitor de Sensores em Tempo Real
            </CardTitle>
            <CardDescription>
              Dados de sensores via Supabase Realtime
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                "flex items-center gap-1",
                isConnected ? "text-emerald-600 border-emerald-500" : "text-amber-600 border-amber-500"
              )}
            >
              <div className={cn(
                "h-2 w-2 rounded-full",
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              )} />
              {isConnected ? 'Conectado' : 'Conectando...'}
            </Badge>
            {anomalyCount > 0 && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {anomalyCount} anomalias
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Object.values(latestByEquipment).map((sensor) => {
            const Icon = SENSOR_ICONS[sensor.sensor_type] || Activity;
            const colorClass = SENSOR_COLORS[sensor.sensor_type] || 'text-muted-foreground';
            
            return (
              <div
                key={`${sensor.equipment_id}-${sensor.sensor_type}`}
                className={cn(
                  "p-4 rounded-lg border",
                  sensor.is_anomaly ? "border-destructive bg-destructive/5" : ""
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-5 w-5", colorClass)} />
                    <span className="font-medium text-sm">{sensor.equipment_name}</span>
                  </div>
                  {sensor.is_anomaly ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={cn(
                    "text-2xl font-bold",
                    sensor.is_anomaly ? "text-destructive" : ""
                  )}>
                    {sensor.value}
                  </span>
                  <span className="text-sm text-muted-foreground">{sensor.unit}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{sensor.sensor_type}</span>
                  <span>
                    {sensor.min_threshold} - {sensor.max_threshold} {sensor.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <h4 className="font-medium mb-3">Histórico Recente</h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {sensors.slice(0, 20).map((sensor) => {
                const Icon = SENSOR_ICONS[sensor.sensor_type] || Activity;
                
                return (
                  <div
                    key={sensor.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded border text-sm",
                      sensor.is_anomaly ? "border-destructive/50 bg-destructive/5" : ""
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", SENSOR_COLORS[sensor.sensor_type])} />
                      <span>{sensor.equipment_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {sensor.sensor_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "font-medium",
                        sensor.is_anomaly ? "text-destructive" : ""
                      )}>
                        {sensor.value} {sensor.unit}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(sensor.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

export default RealtimeSensorMonitor;
