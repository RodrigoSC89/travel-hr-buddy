/**
 * Wave 50 - PSC Detention Predictor
 * Port State Control detention risk analysis with scoring
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Anchor, AlertTriangle, CheckCircle2, Shield, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInDays, parseISO } from 'date-fns';
import { Progress } from '@/components/ui/progress';

export default function PSCDetentionPredictor() {
  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ['psc-inspections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('psc_inspections')
        .select('*')
        .order('inspection_date', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: ncs = [] } = useQuery({
    queryKey: ['psc-ncs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('non_conformities')
        .select('vessel_id, status, severity, category')
        .eq('status', 'open');
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: vessels = [] } = useQuery({
    queryKey: ['psc-vessels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vessels')
        .select('id, name, status, flag_state, vessel_type, gross_tonnage')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data || [];
    },
    staleTime: 120000,
  });

  const predictions = useMemo(() => {
    return vessels.map(v => {
      const vesselInspections = inspections.filter(i => i.vessel_id === v.id);
      const vesselNCs = ncs.filter(n => n.vessel_id === v.id);
      const detentions = vesselInspections.filter(i => i.detention === true).length;
      const deficiencies = vesselInspections.reduce((sum, i) => sum + (i.deficiencies_count || 0), 0);
      
      // Risk scoring algorithm
      let riskScore = 30; // Base risk
      
      // Tonnage factor (proxy for complexity/age)
      const tonnage = v.gross_tonnage || 5000;
      const age = tonnage > 30000 ? 18 : tonnage > 15000 ? 12 : 8;
      if (age > 15) riskScore += 12;
      else if (age > 10) riskScore += 5;

      // History factor
      riskScore += detentions * 15;
      riskScore += Math.min(deficiencies * 3, 20);

      // Open NCs factor
      const criticalNCs = vesselNCs.filter(nc => nc.severity === 'critical' || nc.severity === 'major').length;
      riskScore += criticalNCs * 10;
      riskScore += vesselNCs.length * 3;

      // Flag state factor (simplified)
      const highRiskFlags = ['panama', 'liberia', 'marshall islands'];
      if (v.flag_state && highRiskFlags.includes(v.flag_state.toLowerCase())) {
        riskScore += 5;
      }

      riskScore = Math.min(100, Math.max(0, riskScore));
      const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 45 ? 'medium' : 'low';

      return {
        vessel: v,
        riskScore,
        riskLevel,
        detentions,
        deficiencies,
        openNCs: vesselNCs.length,
        criticalNCs,
        inspectionCount: vesselInspections.length,
        age,
      };
    }).sort((a, b) => b.riskScore - a.riskScore);
  }, [vessels, inspections, ncs]);

  const stats = useMemo(() => ({
    highRisk: predictions.filter(p => p.riskLevel === 'high').length,
    mediumRisk: predictions.filter(p => p.riskLevel === 'medium').length,
    lowRisk: predictions.filter(p => p.riskLevel === 'low').length,
    avgScore: predictions.length > 0 ? predictions.reduce((s, p) => s + p.riskScore, 0) / predictions.length : 0,
  }), [predictions]);

  if (isLoading) return <Skeleton className="h-80" />;

  return (
    <Card className="border-destructive/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Anchor className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base">PSC Detention Predictor</CardTitle>
          </div>
          <Badge variant="outline" className={`text-[10px] ${
            stats.avgScore < 40 ? 'bg-success/10 text-success' : stats.avgScore < 60 ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
          }`}>
            Fleet Risk: {stats.avgScore.toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Distribution */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="h-3.5 w-3.5 mx-auto mb-0.5 text-destructive" />
            <div className="text-lg font-bold text-destructive">{stats.highRisk}</div>
            <div className="text-[9px] text-muted-foreground">High Risk</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-warning/10 border border-warning/20">
            <Shield className="h-3.5 w-3.5 mx-auto mb-0.5 text-warning" />
            <div className="text-lg font-bold text-warning">{stats.mediumRisk}</div>
            <div className="text-[9px] text-muted-foreground">Medium</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-success/10 border border-success/20">
            <CheckCircle2 className="h-3.5 w-3.5 mx-auto mb-0.5 text-success" />
            <div className="text-lg font-bold text-success">{stats.lowRisk}</div>
            <div className="text-[9px] text-muted-foreground">Low Risk</div>
          </div>
        </div>

        {/* Vessel Risk List */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {predictions.slice(0, 8).map(p => (
            <div key={p.vessel.id} className="p-2.5 rounded-md bg-background border border-border/30">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium truncate max-w-[140px]">{p.vessel.name}</span>
                <Badge variant="outline" className={`text-[9px] h-5 ${
                  p.riskLevel === 'high' ? 'bg-destructive/10 text-destructive' : 
                  p.riskLevel === 'medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                }`}>
                  {p.riskScore.toFixed(0)}% risk
                </Badge>
              </div>
              <Progress value={p.riskScore} className="h-1.5 mb-1" />
              <div className="flex gap-2 text-[9px] text-muted-foreground">
                <span>{p.age}yr old</span>
                <span>•</span>
                <span>{p.deficiencies} def.</span>
                <span>•</span>
                <span>{p.openNCs} NCs</span>
                {p.detentions > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-destructive">{p.detentions} detentions</span>
                  </>
                )}
              </div>
            </div>
          ))}
          {predictions.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">Nenhuma embarcação ativa para análise PSC</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
