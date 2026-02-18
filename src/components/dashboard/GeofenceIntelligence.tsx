/**
 * Wave 28: Fleet Geofence Intelligence
 * Geofence zone monitoring, ETA predictions, boundary alerts
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Clock, AlertTriangle, Anchor, Navigation, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function GeofenceIntelligence() {
  const { data: portCalls = [], isLoading } = useQuery({
    queryKey: ['geofence-port-calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('port_calls')
        .select('id, vessel_id, port_name, eta, etd, ata, atd, status')
        .order('eta', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['geofence-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telemetry_alerts')
        .select('*')
        .eq('alert_type', 'geofence')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    staleTime: 15000,
  });

  const metrics = useMemo(() => {
    const now = new Date();
    const upcoming = portCalls.filter(pc => pc.eta && new Date(pc.eta) > now);
    const inPort = portCalls.filter(pc => pc.ata && !pc.atd);
    const activeAlerts = alerts.filter(a => !a.resolved);

    // ETA accuracy: compare ETA vs ATA
    const withBoth = portCalls.filter(pc => pc.eta && pc.ata);
    let avgDeviationHrs = 0;
    if (withBoth.length > 0) {
      const totalDev = withBoth.reduce((sum, pc) => {
        const diff = Math.abs(new Date(pc.ata!).getTime() - new Date(pc.eta!).getTime());
        return sum + diff / (1000 * 60 * 60);
      }, 0);
      avgDeviationHrs = totalDev / withBoth.length;
    }

    return {
      upcomingArrivals: upcoming.length,
      inPort: inPort.length,
      activeAlerts: activeAlerts.length,
      avgETADeviation: avgDeviationHrs.toFixed(1),
      totalPortCalls: portCalls.length,
    };
  }, [portCalls, alerts]);

  if (isLoading) return <Skeleton className="h-[400px]" />;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-hub-tracking" />
            Geofence Intelligence
          </CardTitle>
          {metrics.activeAlerts > 0 && (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
              {metrics.activeAlerts} alertas
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Grid */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Navigation, value: metrics.upcomingArrivals, label: 'Chegadas', color: 'text-primary' },
            { icon: Anchor, value: metrics.inPort, label: 'Em Porto', color: 'text-success' },
            { icon: Clock, value: `${metrics.avgETADeviation}h`, label: 'Desvio ETA', color: 'text-warning' },
            { icon: AlertTriangle, value: metrics.activeAlerts, label: 'Alertas', color: 'text-destructive' },
          ].map((kpi, i) => (
            <div key={i} className="text-center p-2 rounded-lg bg-muted/50">
              <kpi.icon className={`h-4 w-4 mx-auto ${kpi.color} mb-1`} />
              <div className="text-lg font-bold text-foreground">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Upcoming Port Calls */}
        <div className="space-y-2 max-h-44 overflow-y-auto">
          <p className="text-xs font-medium text-muted-foreground">Próximas Escalas</p>
          {portCalls.filter(pc => pc.eta).slice(0, 6).map((pc) => {
            const etaDate = pc.eta ? new Date(pc.eta) : null;
            const isOverdue = etaDate && etaDate < new Date() && !pc.ata;
            return (
              <div key={pc.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Shield className={`h-3.5 w-3.5 ${isOverdue ? 'text-destructive' : 'text-success'}`} />
                  <span className="text-sm font-medium text-foreground">{pc.port_name || 'Porto desconhecido'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${
                    pc.ata && !pc.atd ? 'bg-success/10 text-success' : 
                    isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-muted'
                  }`}>
                    {pc.ata && !pc.atd ? 'Em Porto' : isOverdue ? 'Atrasado' : 'A caminho'}
                  </Badge>
                  {etaDate && (
                    <span className="text-xs text-muted-foreground">
                      {etaDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {portCalls.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma escala registrada</p>
          )}
        </div>

        {/* Geofence Alerts */}
        {alerts.length > 0 && (
          <div className="border-t border-border/50 pt-3 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Alertas de Geofence Recentes</p>
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center gap-2 text-xs p-1.5 rounded bg-destructive/5">
                <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                <span className="truncate text-foreground">{alert.message}</span>
                <span className="text-muted-foreground shrink-0">
                  {new Date(alert.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
