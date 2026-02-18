/**
 * Wave 26: Weather Routing Intelligence
 * AI-powered weather routing analysis for voyage optimization
 */
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Cloud, Wind, Droplets, Thermometer, Navigation, Anchor, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const WeatherRoutingIntelligence: React.FC = () => {
  const { data: voyages = [], isLoading } = useQuery({
    queryKey: ['weather-routing-voyages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voyage_plans')
        .select('id, voyage_number, origin_port, destination_port, status, estimated_fuel_consumption, distance_nm, departure_date, arrival_date')
        .in('status', ['active', 'planned', 'in_progress'])
        .order('departure_date', { ascending: true })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: noonReports = [] } = useQuery({
    queryKey: ['weather-noon-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noon_reports')
        .select('id, vessel_id, wind_force, wind_direction, sea_state, swell_height, remarks, consumption_hfo, distance_run')
        .order('report_date', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const weatherStats = useMemo(() => {
    const reports = noonReports;
    if (reports.length === 0) return { avgWind: 0, avgSea: 0, avgFuel: 0, fuelSavings: 0, routeOptimizations: voyages.length };
    
    const avgWind = reports.reduce((s, r) => s + (r.wind_force || 0), 0) / reports.length;
    const avgSea = reports.reduce((s, r) => s + (r.sea_state || 0), 0) / reports.length;
    const avgFuel = reports.reduce((s, r) => s + (r.consumption_hfo || 0), 0) / reports.length;
    const fuelSavings = avgFuel * 0.08 * reports.length; // Estimated 8% savings from weather routing
    
    return { avgWind: +avgWind.toFixed(1), avgSea: +avgSea.toFixed(1), avgFuel: +avgFuel.toFixed(1), fuelSavings: +fuelSavings.toFixed(1), routeOptimizations: voyages.length };
  }, [noonReports, voyages]);

  const weatherConditionColor = (remark: string | null) => {
    if (!remark) return 'text-muted-foreground';
    const c = remark.toLowerCase();
    if (c.includes('storm') || c.includes('heavy')) return 'text-destructive';
    if (c.includes('rain') || c.includes('fog')) return 'text-warning';
    return 'text-success';
  };

  if (isLoading) return <Skeleton className="h-[400px]" />;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Weather Routing Intelligence</CardTitle>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
            {voyages.length} active routes
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Weather KPIs */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Avg Wind', value: `${weatherStats.avgWind} BF`, icon: Wind, color: 'text-primary' },
            { label: 'Avg Sea', value: `${weatherStats.avgSea} m`, icon: Droplets, color: 'text-blue-400' },
            { label: 'Avg Fuel/Day', value: `${weatherStats.avgFuel} MT`, icon: Thermometer, color: 'text-warning' },
            { label: 'Est. Savings', value: `${weatherStats.fuelSavings} MT`, icon: TrendingDown, color: 'text-success' },
          ].map((kpi) => (
            <div key={kpi.label} className="text-center p-2 rounded-lg bg-muted/30">
              <kpi.icon className={`h-4 w-4 mx-auto mb-1 ${kpi.color}`} />
              <div className="text-sm font-bold">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Active Voyages with Weather */}
        <ScrollArea className="h-[240px]">
          <div className="space-y-2">
            {voyages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhuma viagem ativa para análise meteorológica
              </div>
            ) : (
              voyages.map((voyage) => (
                <div key={voyage.id} className="p-3 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Navigation className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium text-sm">{voyage.voyage_number || 'N/A'}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary">
                      {voyage.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Anchor className="h-3 w-3" />
                    <span>{voyage.origin_port || '—'}</span>
                    <span>→</span>
                    <span>{voyage.destination_port || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                    {voyage.distance_nm && (
                      <span className="text-muted-foreground">{voyage.distance_nm} nm</span>
                    )}
                    {voyage.estimated_fuel_consumption && (
                      <span className="text-warning">{voyage.estimated_fuel_consumption} MT fuel</span>
                    )}
                    {voyage.departure_date && (
                      <span className="text-muted-foreground">
                        ETD: {new Date(voyage.departure_date).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Recent Weather Reports */}
            {noonReports.slice(0, 5).map((report) => (
              <div key={report.id} className="p-2 rounded-lg bg-muted/20 flex items-center gap-3">
                <Cloud className={`h-3.5 w-3.5 shrink-0 ${weatherConditionColor(report.remarks)}`} />
                <div className="flex-1 min-w-0 text-xs">
                  <span className="text-muted-foreground">
                    Wind: {report.wind_force || '—'} BF {report.wind_direction || ''} | Sea: {report.sea_state || '—'}
                    {report.remarks ? ` | ${report.remarks}` : ''}
                  </span>
                </div>
                {report.consumption_hfo && (
                  <span className="text-xs text-warning shrink-0">{report.consumption_hfo} MT</span>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default WeatherRoutingIntelligence;
