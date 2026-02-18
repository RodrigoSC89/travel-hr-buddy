/**
 * Wave 34: IoT Anomaly Detector
 * Real-time IoT sensor anomaly detection, alert correlation, severity mapping
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Radio, AlertTriangle, Activity, Cpu, Shield, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function IoTAnomalyDetector() {
  const { data: anomalies = [], isLoading } = useQuery({
    queryKey: ['iot-anomalies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('iot_anomaly_detections')
        .select('id, sensor_id, anomaly_type, severity, confidence, detected_at, resolved_at, auto_action_taken')
        .order('detected_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
    staleTime: 15000,
  });

  const { data: sensors = [] } = useQuery({
    queryKey: ['iot-sensors-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('iot_sensors')
        .select('id, sensor_id, sensor_type, status, vessel_id')
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const metrics = useMemo(() => {
    const activeAnomalies = anomalies.filter(a => !a.resolved_at);
    const critical = activeAnomalies.filter(a => a.severity === 'critical' || a.severity === 'high');
    const avgConfidence = anomalies.length > 0
      ? anomalies.reduce((s, a) => s + (a.confidence || 0), 0) / anomalies.length
      : 0;

    const activeSensors = sensors.filter(s => s.status === 'active' || s.status === 'online');
    const offlineSensors = sensors.filter(s => s.status === 'offline' || s.status === 'error');

    // By type
    const byType: Record<string, number> = {};
    anomalies.forEach(a => {
      const t = a.anomaly_type || 'unknown';
      byType[t] = (byType[t] || 0) + 1;
    });

    return {
      totalAnomalies: anomalies.length,
      activeAnomalies: activeAnomalies.length,
      criticalAnomalies: critical.length,
      avgConfidence: Math.round(avgConfidence * 100),
      totalSensors: sensors.length,
      activeSensors: activeSensors.length,
      offlineSensors: offlineSensors.length,
      byType: Object.entries(byType).sort(([,a],[,b]) => b - a).slice(0, 4),
    };
  }, [anomalies, sensors]);

  if (isLoading) return <Skeleton className="h-[400px]" />;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Radio className="h-5 w-5 text-hub-tracking" />
            IoT Anomaly Detector
          </CardTitle>
          {metrics.criticalAnomalies > 0 ? (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
              {metrics.criticalAnomalies} críticas
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              Normal
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Grid */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Cpu, value: metrics.activeSensors, label: 'Sensores', color: 'text-success' },
            { icon: AlertTriangle, value: metrics.activeAnomalies, label: 'Anomalias', color: 'text-destructive' },
            { icon: Shield, value: `${metrics.avgConfidence}%`, label: 'Confiança', color: 'text-primary' },
            { icon: Zap, value: metrics.offlineSensors, label: 'Offline', color: 'text-warning' },
          ].map((kpi, i) => (
            <div key={i} className="text-center p-2 rounded-lg bg-muted/50">
              <kpi.icon className={`h-4 w-4 mx-auto ${kpi.color} mb-1`} />
              <div className="text-lg font-bold text-foreground">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Sensor Health */}
        {metrics.totalSensors > 0 && (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> Saúde dos Sensores</span>
              <span>{metrics.activeSensors}/{metrics.totalSensors} online</span>
            </div>
            <Progress value={(metrics.activeSensors / metrics.totalSensors) * 100} className="h-2" />
          </div>
        )}

        {/* Anomaly Type Breakdown */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Anomalias por Tipo</p>
          {metrics.byType.map(([type, count]) => (
            <div key={type} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
              <span className="text-sm text-foreground capitalize">{type.replace(/_/g, ' ')}</span>
              <div className="flex items-center gap-2">
                <div className="w-16">
                  <Progress value={(count / Math.max(metrics.totalAnomalies, 1)) * 100} className="h-1.5" />
                </div>
                <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
              </div>
            </div>
          ))}
          {metrics.byType.length === 0 && metrics.totalSensors > 0 && (
            <p className="text-xs text-success text-center py-2">✅ Nenhuma anomalia detectada</p>
          )}
        </div>

        {/* Recent Critical Anomalies */}
        {anomalies.filter(a => !a.resolved_at && (a.severity === 'critical' || a.severity === 'high')).length > 0 && (
          <div className="border-t border-border/50 pt-3 space-y-1.5">
            <p className="text-xs font-medium text-destructive">🔴 Anomalias Críticas Ativas</p>
            {anomalies.filter(a => !a.resolved_at && (a.severity === 'critical' || a.severity === 'high'))
              .slice(0, 3).map(a => (
                <div key={a.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-destructive/5">
                  <span className="truncate text-foreground">{a.anomaly_type} — Sensor {a.sensor_id?.slice(0, 8)}</span>
                  <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive">
                    {a.severity}
                  </Badge>
                </div>
              ))}
          </div>
        )}

        {metrics.totalSensors === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum sensor IoT registrado</p>
        )}
      </CardContent>
    </Card>
  );
}
