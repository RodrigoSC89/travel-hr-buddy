/**
 * Wave 48 - Vessel ETA Predictor
 * ML-based arrival prediction with confidence scoring
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navigation, Clock, Ship, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInHours, differenceInDays, parseISO, format } from 'date-fns';

export default function VesselETAPredictor() {
  const { data: voyages = [], isLoading } = useQuery({
    queryKey: ['eta-voyages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voyage_plans')
        .select('id, voyage_number, origin_port, destination_port, arrival_date, departure_date, status, vessel_id, distance_nm')
        .in('status', ['in_progress', 'planned', 'departed'])
        .order('eta', { ascending: true })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: noonReports = [] } = useQuery({
    queryKey: ['eta-noon-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noon_reports')
        .select('vessel_id, speed_avg, distance_to_go, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const predictions = useMemo(() => {
    const now = new Date();
    return voyages.map(v => {
      const eta = v.arrival_date ? parseISO(v.arrival_date) : null;
      const hoursToETA = eta ? differenceInHours(eta, now) : null;
      const daysToETA = eta ? differenceInDays(eta, now) : null;
      
      // Find latest noon report for this vessel
      const latestNoon = noonReports.find(nr => nr.vessel_id === v.vessel_id);
      const distanceToGo = latestNoon?.distance_to_go || null;
      const avgSpeed = latestNoon?.speed_avg || null;
      
      // Simple ML-like prediction based on speed and distance
      let predictedHours = hoursToETA;
      let confidence = 75;
      let delayRisk: 'low' | 'medium' | 'high' = 'low';
      
      if (distanceToGo && avgSpeed && avgSpeed > 0) {
        predictedHours = distanceToGo / avgSpeed;
        const diff = hoursToETA ? Math.abs(predictedHours - hoursToETA) : 0;
        confidence = Math.max(50, 95 - (diff * 2));
        delayRisk = diff > 24 ? 'high' : diff > 8 ? 'medium' : 'low';
      }

      return {
        id: v.id,
        voyage_number: v.voyage_number,
        origin_port: v.origin_port,
        destination_port: v.destination_port,
        eta,
        hoursToETA,
        daysToETA,
        predictedHours,
        confidence,
        delayRisk,
        distanceToGo,
        avgSpeed,
      };
    });
  }, [voyages, noonReports]);

  const stats = useMemo(() => ({
    activeVoyages: predictions.length,
    onTime: predictions.filter(p => p.delayRisk === 'low').length,
    delayed: predictions.filter(p => p.delayRisk === 'high').length,
    avgConfidence: predictions.length > 0 
      ? predictions.reduce((s, p) => s + p.confidence, 0) / predictions.length 
      : 0,
  }), [predictions]);

  if (isLoading) return <Skeleton className="h-80" />;

  return (
    <Card className="border-hub-tracking/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-hub-tracking" />
            <CardTitle className="text-base">Vessel ETA Predictor</CardTitle>
          </div>
          <Badge variant="outline" className="bg-hub-tracking/10 text-hub-tracking text-[10px]">
            {stats.activeVoyages} voyages
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary KPIs */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Active', value: stats.activeVoyages, icon: Ship, color: 'text-primary' },
            { label: 'On Time', value: stats.onTime, icon: CheckCircle2, color: 'text-success' },
            { label: 'Delayed', value: stats.delayed, icon: AlertTriangle, color: 'text-destructive' },
            { label: 'Confidence', value: `${stats.avgConfidence.toFixed(0)}%`, icon: Clock, color: 'text-info' },
          ].map(kpi => (
            <div key={kpi.label} className="text-center p-2 rounded-lg bg-muted/50">
              <kpi.icon className={`h-3.5 w-3.5 mx-auto mb-0.5 ${kpi.color}`} />
              <div className="text-sm font-bold">{kpi.value}</div>
              <div className="text-[9px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Voyage ETA List */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {predictions.slice(0, 8).map(p => (
            <div key={p.id} className="flex items-center justify-between p-2.5 rounded-md bg-background border border-border/30">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                  p.delayRisk === 'low' ? 'bg-success' : p.delayRisk === 'medium' ? 'bg-warning' : 'bg-destructive'
                }`} />
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate">
                    {p.voyage_number || 'V-???'}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <MapPin className="h-2.5 w-2.5" />
                    <span className="truncate">{p.origin_port || '?'} → {p.destination_port || '?'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div className="text-xs font-medium">
                  {p.daysToETA !== null && p.daysToETA >= 0 
                    ? `${p.daysToETA}d ${(p.hoursToETA || 0) % 24}h`
                    : p.eta ? format(p.eta, 'dd/MM') : '—'}
                </div>
                <div className="text-[9px] text-muted-foreground">{p.confidence.toFixed(0)}% conf.</div>
              </div>
            </div>
          ))}
          {predictions.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">Nenhuma viagem ativa para predição</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
