/**
 * IoT Sensor History Dashboard
 * Trend charts and persistent anomaly alerts
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { 
  Activity, 
  Thermometer, 
  Gauge, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  History,
  Bell,
  Filter,
  RefreshCw,
  Zap,
  Droplets
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { format, subHours, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SensorReading {
  id: string;
  equipment_id: string;
  equipment_name: string;
  sensor_type: string;
  value: number;
  unit: string;
  min_threshold: number | null;
  max_threshold: number | null;
  is_anomaly: boolean;
  created_at: string;
}

interface AnomalyAlert {
  id: string;
  equipment_name: string;
  sensor_type: string;
  value: number;
  unit: string;
  severity: 'warning' | 'critical';
  created_at: string;
  acknowledged: boolean;
}

const SENSOR_ICONS: Record<string, React.ElementType> = {
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
  temperature: '#f97316',
  vibration: '#8b5cf6',
  pressure: '#3b82f6',
  voltage: '#eab308',
  current: '#facc15',
  flow: '#06b6d4',
  rpm: '#10b981',
  fuel: '#22c55e',
};

export function IoTSensorHistory() {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedSensorType, setSelectedSensorType] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [equipmentList, setEquipmentList] = useState<string[]>([]);
  const [sensorTypes, setSensorTypes] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const since = timeRange === '1h' ? subHours(new Date(), 1) :
                    timeRange === '6h' ? subHours(new Date(), 6) :
                    timeRange === '24h' ? subHours(new Date(), 24) :
                    subDays(new Date(), 7);

      // Direct fetch to avoid Supabase type constraints
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/equipment_sensors?created_at=gte.${since.toISOString()}&order=created_at.asc&limit=1000`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          }
        }
      );

      if (!response.ok) {
        console.warn('Sensor data not available:', response.status);
        return;
      }

      const data = await response.json();
      const sensorData = (data || []) as SensorReading[];
      setReadings(sensorData);

      // Extract unique equipment and sensor types
      const equipment = [...new Set(sensorData.map((r: SensorReading) => r.equipment_id))];
      const types = [...new Set(sensorData.map((r: SensorReading) => r.sensor_type))];
      setEquipmentList(equipment);
      setSensorTypes(types);

      // Build anomaly alerts
      const anomalyData = sensorData
        .filter((r: SensorReading) => r.is_anomaly)
        .map((r: SensorReading) => {
          const deviation = r.max_threshold && r.min_threshold
            ? Math.abs(r.value - (r.min_threshold + r.max_threshold) / 2) / ((r.max_threshold - r.min_threshold) / 2)
            : 0;
          
          return {
            id: r.id,
            equipment_name: r.equipment_name,
            sensor_type: r.sensor_type,
            value: r.value,
            unit: r.unit,
            severity: deviation > 0.75 ? 'critical' : 'warning' as 'critical' | 'warning',
            created_at: r.created_at,
            acknowledged: false
          };
        })
        .sort((a: AnomalyAlert, b: AnomalyAlert) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setAnomalies(anomalyData);

    } catch (err) {
      console.error('Failed to fetch sensor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedEquipment, selectedSensorType, timeRange]);

  // Prepare chart data grouped by sensor type
  const chartData = React.useMemo(() => {
    const grouped: Record<string, { time: string; [key: string]: number | string }[]> = {};
    
    readings.forEach(r => {
      const timeKey = format(new Date(r.created_at), 'HH:mm');
      const sensorKey = `${r.equipment_id}_${r.sensor_type}`;
      
      if (!grouped[r.sensor_type]) {
        grouped[r.sensor_type] = [];
      }
      
      const existing = grouped[r.sensor_type].find(d => d.time === timeKey);
      if (existing) {
        existing[sensorKey] = r.value;
      } else {
        grouped[r.sensor_type].push({
          time: timeKey,
          [sensorKey]: r.value
        });
      }
    });

    return grouped;
  }, [readings]);

  // Statistics
  const stats = React.useMemo(() => {
    const total = readings.length;
    const anomalyCount = readings.filter(r => r.is_anomaly).length;
    const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
    const avgValue = readings.length > 0 
      ? readings.reduce((sum, r) => sum + r.value, 0) / readings.length 
      : 0;

    return { total, anomalyCount, criticalCount, avgValue };
  }, [readings, anomalies]);

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            Histórico de Sensores IoT
          </h2>
          <p className="text-muted-foreground">
            Análise de tendências e alertas de anomalia
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 hora</SelectItem>
              <SelectItem value="6h">6 horas</SelectItem>
              <SelectItem value="24h">24 horas</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSensorType} onValueChange={setSelectedSensorType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tipo de Sensor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {sensorTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leituras</p>
                <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Anomalias</p>
                <p className="text-2xl font-bold text-amber-500">{stats.anomalyCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-destructive">{stats.criticalCount}</p>
              </div>
              <Bell className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Anomalia</p>
                <p className="text-2xl font-bold">
                  {stats.total > 0 ? ((stats.anomalyCount / stats.total) * 100).toFixed(1) : 0}%
                </p>
              </div>
              {stats.anomalyCount / stats.total > 0.1 ? (
                <TrendingUp className="h-8 w-8 text-destructive" />
              ) : (
                <TrendingDown className="h-8 w-8 text-emerald-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Charts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendências de Sensores
            </CardTitle>
            <CardDescription>
              Valores ao longo do tempo por tipo de sensor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={sensorTypes[0] || 'temperature'} className="w-full">
              <TabsList className="mb-4">
                {sensorTypes.slice(0, 5).map(type => {
                  const Icon = SENSOR_ICONS[type] || Activity;
                  return (
                    <TabsTrigger key={type} value={type} className="flex items-center gap-1">
                      <Icon className="h-3 w-3" />
                      {type}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {sensorTypes.map(type => (
                <TabsContent key={type} value={type}>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData[type] || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="time" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey={Object.keys(chartData[type]?.[0] || {}).find(k => k !== 'time') || 'value'}
                        stroke={SENSOR_COLORS[type] || '#3b82f6'}
                        fill={SENSOR_COLORS[type] || '#3b82f6'}
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>
              ))}

              {sensorTypes.length === 0 && (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Nenhum dado disponível para o período selecionado
                </div>
              )}
            </Tabs>
          </CardContent>
        </Card>

        {/* Anomaly Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertas de Anomalia
            </CardTitle>
            <CardDescription>
              {anomalies.length} alertas no período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {anomalies.slice(0, 20).map((alert) => {
                  const Icon = SENSOR_ICONS[alert.sensor_type] || Activity;
                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        "p-3 rounded-lg border",
                        alert.severity === 'critical' 
                          ? "border-destructive/50 bg-destructive/5" 
                          : "border-amber-500/50 bg-amber-500/5"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={cn(
                            "h-4 w-4",
                            alert.severity === 'critical' ? "text-destructive" : "text-amber-500"
                          )} />
                          <div>
                            <p className="font-medium text-sm">{alert.equipment_name}</p>
                            <p className="text-xs text-muted-foreground">{alert.sensor_type}</p>
                          </div>
                        </div>
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className={cn(
                          "font-bold",
                          alert.severity === 'critical' ? "text-destructive" : "text-amber-500"
                        )}>
                          {alert.value} {alert.unit}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(alert.created_at), 'HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {anomalies.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
                    <p>Nenhuma anomalia detectada</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default IoTSensorHistory;
