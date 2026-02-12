/**
 * IoT Sensor Dashboard - World-Class Component
 * Real-time sensor monitoring, health status, alerts, and readings
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Thermometer, Droplets, Wind, Gauge, Activity, Wifi,
  WifiOff, RefreshCw, AlertTriangle, CheckCircle2, XCircle,
  Bell, BellOff, Loader2, Sparkles, Cpu, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { trackingIntelligence, type IoTSensor, type IoTAlert } from '@/services/tracking/tracking-intelligence.service';
import { logger } from '@/lib/logger';

const SENSOR_ICONS: Record<string, React.ComponentType<any>> = {
  temperature: Thermometer,
  humidity: Droplets,
  pressure: Gauge,
  wind: Wind,
  fuel: Droplets,
  engine: Activity,
  vibration: Activity,
  gps: Wifi,
  default: Cpu,
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-destructive/10 text-destructive border-destructive/30',
  high: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  low: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
};

export function IoTSensorDashboard() {
  const [sensors, setSensors] = useState<IoTSensor[]>([]);
  const [alerts, setAlerts] = useState<IoTAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSensors: 0, activeSensors: 0, criticalAlerts: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await trackingIntelligence.getDashboardData();
      setSensors(data.sensors);
      setAlerts(data.iotAlerts);
      setStats({
        totalSensors: data.stats.totalSensors,
        activeSensors: data.stats.activeSensors,
        criticalAlerts: data.stats.criticalAlerts,
      });
    } catch (err) {
      logger.error('IoT dashboard error', err as Error);
      toast.error('Erro ao carregar dados IoT');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAcknowledge = async (alertId: string) => {
    const success = await trackingIntelligence.acknowledgeAlert(alertId, 'iot_sensor_alerts');
    if (success) {
      toast.success('Alerta reconhecido');
      fetchData();
    } else {
      toast.error('Erro ao reconhecer alerta');
    }
  };

  const handleResolve = async (alertId: string) => {
    const success = await trackingIntelligence.resolveAlert(alertId, 'iot_sensor_alerts');
    if (success) {
      toast.success('Alerta resolvido');
      fetchData();
    } else {
      toast.error('Erro ao resolver alerta');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={`iot-wc-skeleton-${i}`} className="animate-pulse">
            <CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const sensorsByType = sensors.reduce((acc, s) => {
    const type = s.sensorType || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(s);
    return acc;
  }, {} as Record<string, IoTSensor[]>);

  const unresolvedAlerts = alerts.filter(a => !a.resolved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl">
            <Cpu className="h-6 w-6 text-cyan-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">IoT Sensor Dashboard</h2>
            <p className="text-sm text-muted-foreground">Monitoramento de sensores em tempo real</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Cpu className="h-5 w-5 text-cyan-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.totalSensors}</p>
            <p className="text-xs text-muted-foreground">Total Sensores</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Wifi className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.activeSensors}</p>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <WifiOff className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.totalSensors - stats.activeSensors}</p>
            <p className="text-xs text-muted-foreground">Offline</p>
          </CardContent>
        </Card>
        <Card className={stats.criticalAlerts > 0 ? 'border-destructive/30' : ''}>
          <CardContent className="p-4 text-center">
            <AlertTriangle className={`h-5 w-5 mx-auto mb-1 ${stats.criticalAlerts > 0 ? 'text-destructive' : 'text-emerald-500'}`} />
            <p className="text-2xl font-bold">{stats.criticalAlerts}</p>
            <p className="text-xs text-muted-foreground">Alertas Críticos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sensors by Type */}
        <div className="lg:col-span-2 space-y-3">
          {Object.entries(sensorsByType).length > 0 ? (
            Object.entries(sensorsByType).map(([type, typeSensors]) => {
              const IconComp = SENSOR_ICONS[type] || SENSOR_ICONS.default;
              return (
                <Card key={type}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComp className="h-4 w-4 text-cyan-500" />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </div>
                      <Badge variant="outline" className="text-xs">{typeSensors.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {typeSensors.slice(0, 6).map(sensor => (
                        <div key={sensor.id} className="p-3 rounded-lg border border-border/50 bg-muted/20">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium truncate max-w-[120px]">{sensor.sensorId}</span>
                            <Badge variant={sensor.status === 'active' || sensor.status === 'online' ? 'default' : 'secondary'} className="text-xs">
                              {sensor.status || 'unknown'}
                            </Badge>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold">
                              {sensor.currentValue != null ? sensor.currentValue.toFixed(1) : '—'}
                            </span>
                            <span className="text-xs text-muted-foreground">{sensor.unit || ''}</span>
                          </div>
                          {sensor.location && (
                            <p className="text-xs text-muted-foreground mt-1">{sensor.location}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Cpu className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium mb-1">Nenhum sensor IoT registrado</p>
                <p className="text-sm text-muted-foreground">Configure sensores para monitoramento em tempo real</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Alerts Panel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-500" />
              Alertas ({unresolvedAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[400px]">
              {unresolvedAlerts.length > 0 ? unresolvedAlerts.map(alert => (
                <div key={alert.id} className={`p-3 border-b border-border/50 ${SEVERITY_COLORS[alert.severity] || ''}`}>
                  <div className="flex items-start justify-between mb-1">
                    <Badge variant="outline" className="text-xs">{alert.severity}</Badge>
                    <span className="text-xs text-muted-foreground">{alert.createdAt?.split('T')[0]}</span>
                  </div>
                  <p className="text-xs font-medium mb-1">{alert.message}</p>
                  {alert.recommendedAction && (
                    <p className="text-xs text-muted-foreground mb-2">💡 {alert.recommendedAction}</p>
                  )}
                  <div className="flex gap-1">
                    {!alert.acknowledged && (
                      <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => handleAcknowledge(alert.id)}>
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Reconhecer
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => handleResolve(alert.id)}>
                      <XCircle className="h-3 w-3 mr-1" /> Resolver
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="p-6 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Nenhum alerta pendente</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
