/**
 * Wave 27: AI Model Observatory
 * Training pipeline monitoring, model drift detection, accuracy tracking
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Brain, TrendingUp, AlertTriangle, Activity, Cpu, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AIModelObservatory() {
  const { data: models = [], isLoading } = useQuery({
    queryKey: ['ai-model-observatory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ml_model_registry')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: trainingRuns = [] } = useQuery({
    queryKey: ['ai-training-runs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ml_training_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const metrics = useMemo(() => {
    const activeModels = models.filter(m => m.status === 'active' || m.status === 'deployed');
    const avgAccuracy = models.length > 0
      ? models.reduce((sum, m) => sum + (typeof m.accuracy === 'number' ? m.accuracy : 0), 0) / Math.max(models.filter(m => typeof m.accuracy === 'number').length, 1)
      : 0;
    const completedRuns = trainingRuns.filter(r => r.status === 'completed');
    const failedRuns = trainingRuns.filter(r => r.status === 'failed');
    
    return {
      totalModels: models.length,
      activeModels: activeModels.length,
      avgAccuracy: Math.round(avgAccuracy * 100),
      totalRuns: trainingRuns.length,
      completedRuns: completedRuns.length,
      failedRuns: failedRuns.length,
    };
  }, [models, trainingRuns]);

  if (isLoading) return <Skeleton className="h-[400px]" />;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            AI Model Observatory
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {metrics.activeModels} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Cpu className="h-4 w-4 mx-auto text-primary mb-1" />
            <div className="text-xl font-bold text-foreground">{metrics.totalModels}</div>
            <div className="text-[10px] text-muted-foreground">Modelos</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <TrendingUp className="h-4 w-4 mx-auto text-success mb-1" />
            <div className="text-xl font-bold text-foreground">{metrics.avgAccuracy}%</div>
            <div className="text-[10px] text-muted-foreground">Acurácia Média</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Zap className="h-4 w-4 mx-auto text-warning mb-1" />
            <div className="text-xl font-bold text-foreground">{metrics.totalRuns}</div>
            <div className="text-[10px] text-muted-foreground">Training Runs</div>
          </div>
        </div>

        {/* Model List */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {models.slice(0, 6).map((model) => {
            const accuracy = typeof model.accuracy === 'number' ? model.accuracy * 100 : 0;
            const isDrifting = accuracy < 70;
            return (
              <div key={model.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`h-2 w-2 rounded-full ${model.status === 'active' || model.status === 'deployed' ? 'bg-success' : 'bg-muted-foreground'}`} />
                  <span className="text-sm font-medium truncate text-foreground">{model.model_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isDrifting && (
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                  )}
                  <div className="w-16">
                    <Progress value={accuracy} className="h-1.5" />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {accuracy.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
          {models.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum modelo registrado</p>
          )}
        </div>

        {/* Training Pipeline */}
        <div className="border-t border-border/50 pt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> Training Pipeline</span>
            <span>{metrics.completedRuns}/{metrics.totalRuns} concluídos</span>
          </div>
          {metrics.totalRuns > 0 && (
            <Progress value={(metrics.completedRuns / metrics.totalRuns) * 100} className="h-2" />
          )}
          {metrics.failedRuns > 0 && (
            <p className="text-xs text-destructive mt-1">{metrics.failedRuns} runs com falha</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
