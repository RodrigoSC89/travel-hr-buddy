/**
 * Wave 43 - Noon Report Analytics
 * Análise de performance de viagem baseada em noon reports reais
 * Schema: noon_reports (distance_run, consumption_hfo/mdo/mgo, speed_avg, wind_force, sea_state, vessel_id)
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navigation, Fuel, Wind, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function NoonReportAnalytics() {
  const { data: noonReports = [], isLoading } = useQuery({
    queryKey: ['noon-report-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noon_reports')
        .select('id, report_date, vessel_id, speed_avg, distance_run, consumption_hfo, consumption_mdo, consumption_mgo, sea_state, wind_force, created_at')
        .order('report_date', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const metrics = useMemo(() => {
    if (noonReports.length === 0) return null;

    const totalDistance = noonReports.reduce((sum, r) => sum + (r.distance_run || 0), 0);
    const totalFuel = noonReports.reduce((sum, r) => sum + (r.consumption_hfo || 0) + (r.consumption_mdo || 0) + (r.consumption_mgo || 0), 0);
    const avgSpeed = noonReports.reduce((sum, r) => sum + (r.speed_avg || 0), 0) / noonReports.length;
    const avgWindForce = noonReports.filter(r => r.wind_force).reduce((sum, r) => sum + (r.wind_force || 0), 0) / (noonReports.filter(r => r.wind_force).length || 1);
    const fuelEfficiency = totalDistance > 0 ? totalFuel / totalDistance : 0;

    const seaStates: Record<string, number> = {};
    noonReports.forEach(r => {
      const state = r.sea_state != null ? `SS ${r.sea_state}` : 'N/A';
      seaStates[state] = (seaStates[state] || 0) + 1;
    });

    const uniqueVessels = new Set(noonReports.map(r => r.vessel_id).filter(Boolean)).size;

    return {
      totalReports: noonReports.length,
      totalDistance: Math.round(totalDistance),
      totalFuel: Math.round(totalFuel * 10) / 10,
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      avgWindForce: Math.round(avgWindForce * 10) / 10,
      fuelEfficiency: Math.round(fuelEfficiency * 100) / 100,
      seaStates,
      uniqueVessels,
    };
  }, [noonReports]);

  if (isLoading) return <Skeleton className="h-[400px]" />;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Noon Report Analytics</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {metrics?.totalReports || 0} reports
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!metrics ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum noon report registrado.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Navigation className="h-4 w-4 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold">{metrics.totalDistance.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">NM Navegadas</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Fuel className="h-4 w-4 mx-auto text-warning mb-1" />
                <p className="text-lg font-bold">{metrics.totalFuel.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">MT Consumidas</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <TrendingUp className="h-4 w-4 mx-auto text-success mb-1" />
                <p className="text-lg font-bold">{metrics.avgSpeed} kn</p>
                <p className="text-[10px] text-muted-foreground">Velocidade Média</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Wind className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-bold">BF {metrics.avgWindForce}</p>
                <p className="text-[10px] text-muted-foreground">Força do Vento</p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
              <div>
                <p className="text-sm font-medium">Eficiência de Combustível</p>
                <p className="text-xs text-muted-foreground">{metrics.uniqueVessels} embarcações reportando</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{metrics.fuelEfficiency}</p>
                <p className="text-[10px] text-muted-foreground">MT/NM</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium mb-2 text-muted-foreground">Condições de Mar</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(metrics.seaStates).slice(0, 6).map(([state, count]) => (
                  <Badge key={state} variant="secondary" className="text-[10px]">
                    {state}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
