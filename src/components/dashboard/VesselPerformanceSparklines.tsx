/**
 * Vessel Performance Sparklines
 * Shows key vessel performance trends using noon_reports data
 * Speed, consumption, distance trends per vessel
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ship, TrendingUp, Fuel, Navigation } from 'lucide-react';

interface NoonRow {
  vessel_id: string | null;
  speed_avg: number | null;
  distance_run: number | null;
  consumption_hfo: number | null;
  consumption_mdo: number | null;
  report_date: string | null;
}

function MiniSparkline({ values, color = 'text-primary' }: { values: number[]; color?: string }) {
  if (values.length < 2) return <span className="text-xs text-muted-foreground">—</span>;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const h = 24;
  const w = 80;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className={`inline-block ${color}`} viewBox={`0 0 ${w} ${h}`}>
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={points} />
    </svg>
  );
}

export function VesselPerformanceSparklines() {
  const { data: noonReports = [], isLoading } = useQuery({
    queryKey: ['vessel-perf-sparklines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noon_reports')
        .select('vessel_id, speed_avg, distance_run, consumption_hfo, consumption_mdo, report_date')
        .order('report_date', { ascending: true })
        .limit(500);
      if (error) throw error;
      return (data || []) as NoonRow[];
    },
    staleTime: 60000,
  });

  const { data: vessels = [] } = useQuery({
    queryKey: ['sparkline-vessels'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vessels').select('id, name').limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 120000,
  });

  const vesselMap = Object.fromEntries(vessels.map(v => [v.id, v.name]));

  // Group by vessel
  const byVessel = noonReports.reduce<Record<string, NoonRow[]>>((acc, r) => {
    if (!r.vessel_id) return acc;
    if (!acc[r.vessel_id]) acc[r.vessel_id] = [];
    acc[r.vessel_id].push(r);
    return acc;
  }, {});

  const vesselPerfs = Object.entries(byVessel)
    .map(([vesselId, reports]) => {
      const speeds = reports.map(r => r.speed_avg || 0);
      const fuels = reports.map(r => (r.consumption_hfo || 0) + (r.consumption_mdo || 0));
      const distances = reports.map(r => r.distance_run || 0);
      const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
      const totalFuel = fuels.reduce((a, b) => a + b, 0);
      const totalDist = distances.reduce((a, b) => a + b, 0);

      return {
        vesselId,
        name: vesselMap[vesselId] || vesselId.slice(0, 8),
        reports: reports.length,
        avgSpeed: Math.round(avgSpeed * 10) / 10,
        totalFuel: Math.round(totalFuel),
        totalDist: Math.round(totalDist),
        speedTrend: speeds.slice(-10),
        fuelTrend: fuels.slice(-10),
      };
    })
    .sort((a, b) => b.reports - a.reports)
    .slice(0, 8);

  if (isLoading) {
    return <Card><CardContent className="p-6"><div className="h-64 animate-pulse bg-muted rounded" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-hub-tracking" />
            Vessel Performance Trends
          </CardTitle>
          <Badge variant="outline" className="text-xs">{vesselPerfs.length} vessels</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {vesselPerfs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Ship className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Nenhum noon report registrado
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header */}
            <div className="grid grid-cols-[1fr_80px_80px_60px_60px] gap-2 text-[10px] text-muted-foreground uppercase tracking-wider px-2">
              <span>Vessel</span>
              <span className="text-center">Speed</span>
              <span className="text-center">Fuel</span>
              <span className="text-right">Avg kn</span>
              <span className="text-right">Total MT</span>
            </div>

            {vesselPerfs.map((v) => (
              <div key={v.vesselId} className="grid grid-cols-[1fr_80px_80px_60px_60px] gap-2 items-center p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <Ship className="h-3.5 w-3.5 text-hub-tracking shrink-0" />
                  <span className="text-sm font-medium truncate">{v.name}</span>
                  <span className="text-[10px] text-muted-foreground">({v.reports})</span>
                </div>
                <div className="text-center">
                  <MiniSparkline values={v.speedTrend} color="text-primary" />
                </div>
                <div className="text-center">
                  <MiniSparkline values={v.fuelTrend} color="text-warning" />
                </div>
                <div className="text-right text-sm font-semibold">{v.avgSpeed}</div>
                <div className="text-right text-sm font-semibold">{v.totalFuel}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default VesselPerformanceSparklines;
