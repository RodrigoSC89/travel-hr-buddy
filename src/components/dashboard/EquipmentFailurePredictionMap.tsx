/**
 * Equipment Failure Prediction Map
 * Heatmap of predicted equipment failures across fleet
 * Uses ai_maintenance_predictions for real failure probabilities
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Wrench, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PredictionRow {
  id: string;
  equipment_name: string;
  failure_probability: number;
  predicted_failure_date: string | null;
  recommended_action: string | null;
  status: string | null;
  confidence: number | null;
  vessel_id: string | null;
}

export function EquipmentFailurePredictionMap() {
  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ['equipment-failure-predictions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_maintenance_predictions')
        .select('id, equipment_name, failure_probability, predicted_failure_date, recommended_action, status, confidence, vessel_id')
        .order('failure_probability', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as PredictionRow[];
    },
    staleTime: 60000,
  });

  const { data: vessels = [] } = useQuery({
    queryKey: ['prediction-vessels'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vessels').select('id, name').limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 120000,
  });

  const vesselMap = Object.fromEntries(vessels.map(v => [v.id, v.name]));

  const getColor = (prob: number) => {
    if (prob >= 0.7) return 'bg-destructive/20 text-destructive border-destructive/30';
    if (prob >= 0.4) return 'bg-warning/20 text-warning border-warning/30';
    return 'bg-success/20 text-success border-success/30';
  };

  const getBarColor = (prob: number) => {
    if (prob >= 0.7) return 'bg-destructive';
    if (prob >= 0.4) return 'bg-warning';
    return 'bg-success';
  };

  const criticalCount = predictions.filter(p => p.failure_probability >= 0.7).length;
  const avgProbability = predictions.length > 0
    ? Math.round((predictions.reduce((s, p) => s + p.failure_probability, 0) / predictions.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <Card><CardContent className="p-6"><div className="h-64 animate-pulse bg-muted rounded" /></CardContent></Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Equipment Failure Predictions
          </CardTitle>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-xs">{criticalCount} critical</Badge>
            )}
            <Badge variant="outline" className="text-xs">Avg Risk: {avgProbability}%</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {predictions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Nenhuma predição de falha registrada
          </div>
        ) : (
          predictions.slice(0, 10).map((pred) => {
            const prob = Math.round(pred.failure_probability * 100);
            const daysUntil = pred.predicted_failure_date
              ? Math.max(0, Math.ceil((new Date(pred.predicted_failure_date).getTime() - Date.now()) / 86400000))
              : null;

            return (
              <Tooltip key={pred.id}>
                <TooltipTrigger asChild>
                  <div className={`flex items-center gap-3 p-2.5 rounded-lg border ${getColor(pred.failure_probability)} cursor-default transition-colors hover:opacity-90`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{pred.equipment_name}</span>
                        {pred.vessel_id && vesselMap[pred.vessel_id] && (
                          <span className="text-xs opacity-70">• {vesselMap[pred.vessel_id]}</span>
                        )}
                      </div>
                      <div className="mt-1.5 w-full bg-muted/50 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${getBarColor(pred.failure_probability)} transition-all`}
                          style={{ width: `${prob}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-bold">{prob}%</span>
                      {daysUntil !== null && (
                        <div className="flex items-center gap-1 text-xs opacity-70">
                          <Clock className="h-3 w-3" />
                          {daysUntil}d
                        </div>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <p className="font-medium">{pred.equipment_name}</p>
                  {pred.recommended_action && <p className="text-xs mt-1">{pred.recommended_action}</p>}
                  {pred.confidence && <p className="text-xs mt-1 opacity-70">Confidence: {Math.round(pred.confidence * 100)}%</p>}
                </TooltipContent>
              </Tooltip>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export default EquipmentFailurePredictionMap;
