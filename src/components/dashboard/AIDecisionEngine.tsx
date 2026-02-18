/**
 * AI Decision Engine — Autonomous Intelligence Pipeline
 * Visualizes AI decisions with approval workflow, confidence tracking,
 * and feedback loop. World-class: Surpasses Palantir maritime + DNV Veracity.
 */
import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, CheckCircle2, XCircle, Clock, Zap, TrendingUp, Eye, ChevronRight, ShieldAlert, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const IMPACT_CONFIG: Record<string, { bg: string; text: string }> = {
  critical: { bg: 'bg-destructive/10', text: 'text-destructive' },
  high: { bg: 'bg-warning/10', text: 'text-warning' },
  medium: { bg: 'bg-info/10', text: 'text-info' },
  low: { bg: 'bg-muted', text: 'text-muted-foreground' },
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-warning" />,
  approved: <CheckCircle2 className="h-4 w-4 text-success" />,
  rejected: <XCircle className="h-4 w-4 text-destructive" />,
  executed: <Zap className="h-4 w-4 text-primary" />,
};

// Confidence bar component
const ConfidenceBar = ({ value }: { value: number }) => {
  const pct = Math.round(value * 100);
  const color = pct >= 85 ? 'bg-success' : pct >= 60 ? 'bg-warning' : 'bg-destructive';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{pct}%</span>
    </div>
  );
};

export default function AIDecisionEngine() {
  const queryClient = useQueryClient();

  const { data: decisions = [], isLoading } = useQuery({
    queryKey: ['ai-decisions-engine'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ai_decisions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    },
    staleTime: 30_000,
  });

  // Aggregate metrics
  const metrics = useMemo(() => {
    const total = decisions.length;
    const approved = decisions.filter(d => d.status === 'approved' || d.status === 'executed').length;
    const pending = decisions.filter(d => d.status === 'pending').length;
    const avgConfidence = total > 0
      ? decisions.reduce((sum, d) => sum + (d.confidence || 0), 0) / total
      : 0;
    const feedbackPositive = decisions.filter(d => d.feedback_was_correct === true).length;
    const feedbackTotal = decisions.filter(d => d.feedback_was_correct !== null).length;
    const accuracy = feedbackTotal > 0 ? feedbackPositive / feedbackTotal : 0;
    return { total, approved, pending, avgConfidence, accuracy, feedbackTotal };
  }, [decisions]);

  const updateDecision = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (status === 'executed') update.executed_at = new Date().toISOString();
      const { error } = await supabase.from('ai_decisions').update(update).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-decisions-engine'] });
      toast.success('Decisão atualizada');
    },
  });

  const kpis = [
    { icon: Brain, label: 'Decisões IA', value: metrics.total, sub: 'Total geradas' },
    { icon: CheckCircle2, label: 'Aprovadas', value: metrics.approved, sub: `${metrics.pending} pendentes` },
    { icon: TrendingUp, label: 'Confiança Média', value: `${Math.round(metrics.avgConfidence * 100)}%`, sub: 'Score de confiança' },
    { icon: Sparkles, label: 'Acurácia', value: metrics.feedbackTotal > 0 ? `${Math.round(metrics.accuracy * 100)}%` : '—', sub: `${metrics.feedbackTotal} feedbacks` },
  ];

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg relative">
              <Brain className="h-5 w-5 text-primary" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
              </span>
            </div>
            <div>
              <CardTitle className="text-lg">AI Decision Engine</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Pipeline autônomo com Human-in-the-Loop</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20 text-primary">
            AUTONOMOUS
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* KPI row */}
        <div className="grid grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="text-center p-3 rounded-lg bg-muted/30 border border-border/20"
            >
              <kpi.icon className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Decision Pipeline */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-muted/30 animate-pulse" />
            ))
          ) : decisions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhuma decisão IA registrada</p>
              <p className="text-xs">O motor autônomo gerará decisões conforme dados operacionais chegarem</p>
            </div>
          ) : (
            decisions.map((decision, i) => {
              const impact = IMPACT_CONFIG[decision.impact] || IMPACT_CONFIG.low;
              return (
                <motion.div
                  key={decision.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.04 }}
                  className="p-3 rounded-lg border border-border/30 bg-background/50 hover:bg-muted/20 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      {STATUS_ICON[decision.status] || STATUS_ICON.pending}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">{decision.title}</p>
                          <Badge variant="outline" className={`text-[9px] px-1.5 ${impact.bg} ${impact.text} border-transparent`}>
                            {decision.impact?.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{decision.description}</p>
                        <ConfidenceBar value={decision.confidence || 0} />
                      </div>
                    </div>

                    {/* Action buttons for pending decisions */}
                    {decision.status === 'pending' && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-success hover:bg-success/10"
                          onClick={() => updateDecision.mutate({ id: decision.id, status: 'approved' })}
                          title="Aprovar"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                          onClick={() => updateDecision.mutate({ id: decision.id, status: 'rejected' })}
                          title="Rejeitar"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
