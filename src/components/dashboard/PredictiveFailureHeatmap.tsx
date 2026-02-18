/**
 * Wave 24: Predictive Failure Heatmap
 * AI-driven equipment failure probability visualization
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Brain, AlertTriangle, Shield, Zap } from 'lucide-react';

export default function PredictiveFailureHeatmap() {
  const { data: predictions = [] } = useQuery({
    queryKey: ['predictive-failure-heatmap'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_maintenance_predictions')
        .select('id, equipment_id, equipment_name, failure_probability, confidence, predicted_failure_date, recommended_action, status, vessel_id')
        .order('failure_probability', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: vessels = [] } = useQuery({
    queryKey: ['pred-failure-vessels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vessels')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data || [];
    },
    staleTime: 120000,
  });

  const analytics = useMemo(() => {
    const critical = predictions.filter(p => (p.failure_probability || 0) >= 0.8);
    const warning = predictions.filter(p => (p.failure_probability || 0) >= 0.5 && (p.failure_probability || 0) < 0.8);
    const normal = predictions.filter(p => (p.failure_probability || 0) < 0.5);
    const avgConfidence = predictions.length > 0
      ? predictions.reduce((s, p) => s + (p.confidence || 0), 0) / predictions.length
      : 0;

    // Group by vessel
    const byVessel: Record<string, typeof predictions> = {};
    predictions.forEach(p => {
      const vid = p.vessel_id || 'unassigned';
      if (!byVessel[vid]) byVessel[vid] = [];
      byVessel[vid].push(p);
    });

    return { critical, warning, normal, avgConfidence, byVessel, total: predictions.length };
  }, [predictions]);

  const getRiskColor = (prob: number) => {
    if (prob >= 0.8) return 'bg-red-500';
    if (prob >= 0.6) return 'bg-orange-500';
    if (prob >= 0.4) return 'bg-amber-500';
    if (prob >= 0.2) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getRiskBg = (prob: number) => {
    if (prob >= 0.8) return 'bg-red-500/10 border-red-500/30';
    if (prob >= 0.6) return 'bg-orange-500/10 border-orange-500/30';
    if (prob >= 0.4) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-emerald-500/10 border-emerald-500/30';
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">Predictive Failure Heatmap</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            AI Confidence: {(analytics.avgConfidence * 100).toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
            <AlertTriangle className="h-4 w-4 mx-auto text-red-500 mb-1" />
            <p className="text-2xl font-bold text-red-500">{analytics.critical.length}</p>
            <p className="text-[10px] text-muted-foreground">CRITICAL</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
            <Zap className="h-4 w-4 mx-auto text-amber-500 mb-1" />
            <p className="text-2xl font-bold text-amber-500">{analytics.warning.length}</p>
            <p className="text-[10px] text-muted-foreground">WARNING</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
            <Shield className="h-4 w-4 mx-auto text-emerald-500 mb-1" />
            <p className="text-2xl font-bold text-emerald-500">{analytics.normal.length}</p>
            <p className="text-[10px] text-muted-foreground">NORMAL</p>
          </div>
        </div>

        {/* Heatmap Grid */}
        {analytics.total > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Equipment Risk Matrix</p>
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-1">
              {predictions.slice(0, 24).map((pred) => (
                <div
                  key={pred.id}
                  className={`aspect-square rounded-md flex items-center justify-center cursor-default transition-transform hover:scale-110 ${getRiskColor(pred.failure_probability || 0)}`}
                  title={`${pred.equipment_name}: ${((pred.failure_probability || 0) * 100).toFixed(0)}% risk`}
                >
                  <span className="text-[9px] font-bold text-white">
                    {((pred.failure_probability || 0) * 100).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-2 text-[9px] text-muted-foreground">
              <span>🟢 Low Risk</span>
              <span>🟡 Medium</span>
              <span>🟠 High</span>
              <span>🔴 Critical</span>
            </div>
          </div>
        )}

        {/* Critical Equipment List */}
        {analytics.critical.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Critical Equipment</p>
            <div className="space-y-2">
              {analytics.critical.slice(0, 5).map(pred => (
                <div key={pred.id} className={`rounded-lg border p-2.5 ${getRiskBg(pred.failure_probability || 0)}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{pred.equipment_name}</span>
                    <Badge variant="destructive" className="text-[10px]">
                      {((pred.failure_probability || 0) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  {pred.recommended_action && (
                    <p className="text-[10px] text-muted-foreground mt-1 truncate">
                      💡 {pred.recommended_action}
                    </p>
                  )}
                  {pred.predicted_failure_date && (
                    <p className="text-[10px] text-muted-foreground">
                      ⏰ Previsão: {new Date(pred.predicted_failure_date).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {analytics.total === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Nenhuma predição de falha disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
}
