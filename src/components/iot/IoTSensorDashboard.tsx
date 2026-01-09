import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Thermometer, Gauge, Waves, Wind, Battery, Wifi, AlertTriangle, CheckCircle, RefreshCw, Zap } from 'lucide-react';

interface SensorReading {
  id: string;
  sensorId: string;
  sensorName: string;
  sensorType: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  lastUpdate: string;
  location: string;
  threshold: { min: number; max: number };
}

interface AlertData {
  id: string;
  sensorName: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  acknowledged: boolean;
}

const mockSensors: SensorReading[] = [
  {
    id: '1',
    sensorId: 'TEMP-001',
    sensorName: 'Engine Room Temperature',
    sensorType: 'temperature',
    value: 42,
    unit: '°C',
    status: 'normal',
    lastUpdate: '2 sec ago',
    location: 'Engine Room',
    threshold: { min: 20, max: 60 }
  },
  {
    id: '2',
    sensorId: 'FUEL-001',
    sensorName: 'Main Fuel Tank Level',
    sensorType: 'level',
    value: 72,
    unit: '%',
    status: 'normal',
    lastUpdate: '5 sec ago',
    location: 'Tank Deck',
    threshold: { min: 20, max: 100 }
  },
  {
    id: '3',
    sensorId: 'PRESS-001',
    sensorName: 'Hydraulic Pressure',
    sensorType: 'pressure',
    value: 285,
    unit: 'bar',
    status: 'warning',
    lastUpdate: '1 sec ago',
    location: 'Steering Gear',
    threshold: { min: 200, max: 280 }
  },
  {
    id: '4',
    sensorId: 'VIB-001',
    sensorName: 'Main Engine Vibration',
    sensorType: 'vibration',
    value: 2.8,
    unit: 'mm/s',
    status: 'normal',
    lastUpdate: '3 sec ago',
    location: 'Engine Room',
    threshold: { min: 0, max: 4.5 }
  },
  {
    id: '5',
    sensorId: 'TEMP-002',
    sensorName: 'Exhaust Gas Temperature',
    sensorType: 'temperature',
    value: 485,
    unit: '°C',
    status: 'critical',
    lastUpdate: '1 sec ago',
    location: 'Funnel',
    threshold: { min: 300, max: 450 }
  },
  {
    id: '6',
    sensorId: 'WIND-001',
    sensorName: 'Wind Speed',
    sensorType: 'wind',
    value: 18,
    unit: 'knots',
    status: 'normal',
    lastUpdate: '2 sec ago',
    location: 'Bridge',
    threshold: { min: 0, max: 50 }
  }
];

const mockAlerts: AlertData[] = [
  {
    id: '1',
    sensorName: 'Exhaust Gas Temperature',
    message: 'Temperature exceeds safe threshold (485°C > 450°C)',
    severity: 'critical',
    timestamp: '2024-01-20 14:32:15',
    acknowledged: false
  },
  {
    id: '2',
    sensorName: 'Hydraulic Pressure',
    message: 'Pressure approaching upper limit (285 bar)',
    severity: 'warning',
    timestamp: '2024-01-20 14:30:45',
    acknowledged: false
  },
  {
    id: '3',
    sensorName: 'Fuel Tank Level',
    message: 'Tank level below 75% - schedule refueling',
    severity: 'info',
    timestamp: '2024-01-20 14:25:00',
    acknowledged: true
  }
];

export const IoTSensorDashboard: React.FC = () => {
  const [sensors, setSensors] = useState<SensorReading[]>(mockSensors);
  const [isLive, setIsLive] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setSensors(prev => prev.map(sensor => ({
        ...sensor,
        value: sensor.value + (Math.random() - 0.5) * 2,
        lastUpdate: `${Math.floor(Math.random() * 5) + 1} sec ago`
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature': return Thermometer;
      case 'pressure': return Gauge;
      case 'level': return Waves;
      case 'wind': return Wind;
      case 'vibration': return Activity;
      default: return Zap;
    }
  };

  const getValueProgress = (sensor: SensorReading) => {
    const range = sensor.threshold.max - sensor.threshold.min;
    const normalized = ((sensor.value - sensor.threshold.min) / range) * 100;
    return Math.min(Math.max(normalized, 0), 100);
  };

  const stats = {
    total: sensors.length,
    normal: sensors.filter(s => s.status === 'normal').length,
    warning: sensors.filter(s => s.status === 'warning').length,
    critical: sensors.filter(s => s.status === 'critical').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
          <span className="text-sm text-muted-foreground">
            {isLive ? 'Live Data Stream' : 'Paused'}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsLive(!isLive)}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLive ? 'animate-spin' : ''}`} />
          {isLive ? 'Pause' : 'Resume'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Wifi className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connected Sensors</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Normal</p>
                <p className="text-2xl font-bold text-green-400">{stats.normal}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.warning}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sensors" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="sensors">Sensor Grid</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({mockAlerts.filter(a => !a.acknowledged).length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="sensors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sensors.map((sensor) => {
              const Icon = getSensorIcon(sensor.sensorType);
              return (
                <Card key={sensor.id} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${getStatusColor(sensor.status).split(' ')[0]}`}>
                          <Icon className={`h-4 w-4 ${getStatusColor(sensor.status).split(' ')[1]}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{sensor.sensorName}</p>
                          <p className="text-xs text-muted-foreground">{sensor.location}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(sensor.status)}>
                        {sensor.status}
                      </Badge>
                    </div>

                    <div className="text-center mb-3">
                      <p className="text-3xl font-bold">{sensor.value.toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">{sensor.unit}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>{sensor.threshold.min}{sensor.unit}</span>
                        <span>{sensor.threshold.max}{sensor.unit}</span>
                      </div>
                      <Progress 
                        value={getValueProgress(sensor)} 
                        className={`h-2 ${sensor.status === 'critical' ? '[&>div]:bg-red-500' : sensor.status === 'warning' ? '[&>div]:bg-yellow-500' : ''}`}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                      <span>{sensor.sensorId}</span>
                      <span>Updated {sensor.lastUpdate}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.severity === 'critical' 
                        ? 'border-red-500/30 bg-red-500/10' 
                        : alert.severity === 'warning'
                        ? 'border-yellow-500/30 bg-yellow-500/10'
                        : 'border-blue-500/30 bg-blue-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'normal')}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{alert.sensorName}</span>
                      </div>
                      {!alert.acknowledged && (
                        <Button size="sm" variant="outline">
                          Acknowledge
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{alert.timestamp}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Sensor Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Historical analytics and trends</p>
                <p className="text-sm">Time-series charts and anomaly detection coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IoTSensorDashboard;
