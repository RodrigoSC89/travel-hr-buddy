/**
 * Wave 49 - Fleet Risk Heatmap
 * Real-time multi-dimensional risk visualization per vessel
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, Ship } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const RISK_DIMENSIONS = ['Compliance', 'Maintenance', 'Crew', 'Safety', 'Financial'] as const;

function getRiskColor(score: number): string {
  if (score >= 80) return 'bg-success/80 text-success-foreground';
  if (score >= 60) return 'bg-warning/60 text-warning-foreground';
  if (score >= 40) return 'bg-orange-500/60 text-white';
  return 'bg-destructive/70 text-destructive-foreground';
}

export default function FleetRiskHeatmap() {
  const { data: vessels = [], isLoading } = useQuery({
    queryKey: ['risk-heatmap-vessels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vessels')
        .select('id, name, status, vessel_type')
        .eq('status', 'active')
        .order('name')
        .limit(12);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: workOrders = [] } = useQuery({
    queryKey: ['risk-heatmap-wo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pms_work_orders')
        .select('vessel_id, status, priority')
        .in('status', ['open', 'in_progress', 'overdue']);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: ncs = [] } = useQuery({
    queryKey: ['risk-heatmap-ncs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('non_conformities')
        .select('vessel_id, status, severity')
        .eq('status', 'open');
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: certs = [] } = useQuery({
    queryKey: ['risk-heatmap-certs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_certifications')
        .select('crew_member_id, expiry_date, status');
      if (error) throw error;
      return data || [];
    },
    staleTime: 120000,
  });

  const { data: crewMembers = [] } = useQuery({
    queryKey: ['risk-heatmap-crew'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('id, vessel_id, status')
        .eq('status', 'active');
      if (error) throw error;
      return data || [];
    },
    staleTime: 120000,
  });

  const heatmapData = useMemo(() => {
    return vessels.map(v => {
      const vesselWOs = workOrders.filter(w => w.vessel_id === v.id);
      const vesselNCs = ncs.filter(n => n.vessel_id === v.id);
      const overdueWOs = vesselWOs.filter(w => w.status === 'overdue').length;
      const criticalNCs = vesselNCs.filter(n => n.severity === 'critical' || n.severity === 'major').length;

      // Crew score from real crew & certification data
      const vesselCrew = crewMembers.filter(c => c.vessel_id === v.id);
      const vesselCrewCerts = certs.filter(c => vesselCrew.some(cm => cm.id === c.crew_member_id));
      const expiredCerts = vesselCrewCerts.filter(c => c.expiry_date && new Date(c.expiry_date) < new Date()).length;
      const totalCrewCerts = vesselCrewCerts.length || 1;

      const compliance = Math.max(20, 100 - (vesselNCs.length * 15) - (criticalNCs * 20));
      const maintenance = Math.max(20, 100 - (overdueWOs * 20) - (vesselWOs.length * 5));
      const crew = Math.max(30, 100 - Math.round((expiredCerts / totalCrewCerts) * 60) - (vesselCrew.length === 0 ? 30 : 0));
      const safety = Math.max(25, 100 - (criticalNCs * 25) - (vesselNCs.length * 8));
      const financial = Math.max(30, 100 - (overdueWOs * 10));

      const scores = { Compliance: compliance, Maintenance: maintenance, Crew: crew, Safety: safety, Financial: financial };
      const avgRisk = Object.values(scores).reduce((s, v) => s + v, 0) / 5;

      return { vessel: v, scores, avgRisk };
    });
  }, [vessels, workOrders, ncs, certs, crewMembers]);

  const overallRisk = useMemo(() => {
    if (heatmapData.length === 0) return 0;
    return heatmapData.reduce((s, h) => s + h.avgRisk, 0) / heatmapData.length;
  }, [heatmapData]);

  if (isLoading) return <Skeleton className="h-80" />;

  return (
    <Card className="border-hub-command/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-hub-command" />
            <CardTitle className="text-base">Fleet Risk Heatmap</CardTitle>
          </div>
          <Badge variant="outline" className={`text-[10px] ${
            overallRisk >= 75 ? 'bg-success/10 text-success' : overallRisk >= 50 ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
          }`}>
            Fleet Score: {overallRisk.toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {heatmapData.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">Nenhuma embarcação ativa para análise</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left p-1.5 text-muted-foreground font-medium">
                    <Ship className="h-3 w-3 inline mr-1" />Vessel
                  </th>
                  {RISK_DIMENSIONS.map(dim => (
                    <th key={dim} className="text-center p-1.5 text-muted-foreground font-medium">{dim}</th>
                  ))}
                  <th className="text-center p-1.5 text-muted-foreground font-medium">Avg</th>
                </tr>
              </thead>
              <tbody>
                {heatmapData.map(row => (
                  <tr key={row.vessel.id} className="border-t border-border/20">
                    <td className="p-1.5 font-medium truncate max-w-[100px]">{row.vessel.name}</td>
                    {RISK_DIMENSIONS.map(dim => (
                      <td key={dim} className="p-1">
                        <div className={`text-center rounded px-1.5 py-0.5 text-[10px] font-bold ${getRiskColor(row.scores[dim])}`}>
                          {row.scores[dim].toFixed(0)}
                        </div>
                      </td>
                    ))}
                    <td className="p-1">
                      <div className={`text-center rounded px-1.5 py-0.5 text-[10px] font-bold ${getRiskColor(row.avgRisk)}`}>
                        {row.avgRisk.toFixed(0)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-border/30">
          <span className="text-[10px] text-muted-foreground">Risk Scale:</span>
          {[
            { label: '80-100', color: 'bg-success/80' },
            { label: '60-79', color: 'bg-warning/60' },
            { label: '40-59', color: 'bg-orange-500/60' },
            { label: '0-39', color: 'bg-destructive/70' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className={`h-2.5 w-5 rounded ${l.color}`} />
              <span className="text-[9px] text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
