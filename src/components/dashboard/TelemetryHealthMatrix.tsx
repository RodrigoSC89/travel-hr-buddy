/**
 * Telemetry Health Matrix - Wave 20
 * Real-time sensor health and IoT telemetry overview
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Wifi, WifiOff, AlertTriangle, Radio, Thermometer } from 'lucide-react';
import { motion } from 'framer-motion';

interface SensorGroup {
  type: string;
  total: number;
  active: number;
  alerting: number;
  avgValue: number;
  unit: string;
}

export default function TelemetryHealthMatrix() {
  const { data: sensors = [] } = useQuery({
    queryKey: ['thm-sensors'],
    queryFn: async () => {
      const { data } = await supabase
        .from('iot_sensors')
        .select('id, sensor_type, status, current_value, unit, vessel_id, last_reading_at')
        .limit(200);
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['thm-alerts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('telemetry_alerts')
        .select('id, sensor_id, severity, resolved')
        .eq('resolved', false)
        .limit(100);
      return data || [];
    },
    staleTime: 30000,
  });

  const sensorGroups: SensorGroup[] = useMemo(() => {
    const groups = new Map<string, { total: number; active: number; alerting: number; values: number[]; unit: string }>();
    const alertSensorIds = new Set(alerts.map((a) => a.sensor_id));

    sensors.forEach((s) => {
      const type = s.sensor_type || 'unknown';
      const g = groups.get(type) || { total: 0, active: 0, alerting: 0, values: [], unit: s.unit || '' };
      g.total++;
      if (s.status === 'active') g.active++;
      if (alertSensorIds.has(s.id)) g.alerting++;
      if (s.current_value != null) g.values.push(Number(s.current_value));
      if (!g.unit && s.unit) g.unit = s.unit;
      groups.set(type, g);
    });

    return Array.from(groups.entries())
      .map(([type, g]) => ({
        type,
        total: g.total,
        active: g.active,
        alerting: g.alerting,
        avgValue: g.values.length > 0 ? Math.round(g.values.reduce((a, b) => a + b, 0) / g.values.length * 10) / 10 : 0,
        unit: g.unit,
      }))
      .sort((a, b) => b.total - a.total);
  }, [sensors, alerts]);

  const globalStats = useMemo(() => ({
    totalSensors: sensors.length,
    activeSensors: sensors.filter((s) => s.status === 'active').length,
    openAlerts: alerts.length,
  }), [sensors, alerts]);

  const getHealthColor = (active: number, total: number) => {
    const ratio = total > 0 ? active / total : 0;
    if (ratio >= 0.9) return 'bg-success/10 border-success/20';
    if (ratio >= 0.7) return 'bg-warning/10 border-warning/20';
    return 'bg-destructive/10 border-destructive/20';
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Telemetry Health Matrix
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-success/10 text-success text-xs">
              <Wifi className="h-3 w-3 mr-1" />{globalStats.activeSensors}/{globalStats.totalSensors}
            </Badge>
            {globalStats.openAlerts > 0 && (
              <Badge variant="destructive" className="text-xs">{globalStats.openAlerts} alertas</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sensorGroups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Radio className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum sensor IoT configurado</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sensorGroups.map((group, i) => (
              <motion.div
                key={group.type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-lg border p-3 ${getHealthColor(group.active, group.total)} transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                  {group.alerting > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-destructive">
                      <AlertTriangle className="h-3 w-3" />{group.alerting}
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold capitalize truncate">{group.type.replace(/_/g, ' ')}</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg font-bold">{group.avgValue}</span>
                  <span className="text-[10px] text-muted-foreground">{group.unit}</span>
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    {group.active === group.total ? (
                      <Wifi className="h-2.5 w-2.5 text-success" />
                    ) : (
                      <WifiOff className="h-2.5 w-2.5 text-destructive" />
                    )}
                    {group.active}/{group.total}
                  </span>
                  <span>{Math.round(group.active / Math.max(group.total, 1) * 100)}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
