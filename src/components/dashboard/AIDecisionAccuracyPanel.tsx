/**
 * AI Decision Accuracy Panel
 * Tracks AI decision confidence, accuracy and feedback loop
 * Uses ai_decisions for real decision data
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';

export function AIDecisionAccuracyPanel() {
  const { data: decisions = [], isLoading } = useQuery({
    queryKey: ['ai-decision-accuracy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_decisions')
        .select('id, title, type, confidence, confidence_level, status, impact, feedback_was_correct, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const withFeedback = decisions.filter(d => d.feedback_was_correct !== null);
  const correct = withFeedback.filter(d => d.feedback_was_correct === true).length;
  const accuracy = withFeedback.length > 0 ? Math.round((correct / withFeedback.length) * 100) : null;
  const avgConfidence = decisions.length > 0
    ? Math.round((decisions.reduce((s, d) => s + (d.confidence || 0), 0) / decisions.length) * 100)
    : 0;

  const byStatus = {
    approved: decisions.filter(d => d.status === 'approved' || d.status === 'executed').length,
    pending: decisions.filter(d => d.status === 'pending' || d.status === 'pending_review').length,
    rejected: decisions.filter(d => d.status === 'rejected').length,
  };

  const byImpact = {
    high: decisions.filter(d => d.impact === 'high' || d.impact === 'critical').length,
    medium: decisions.filter(d => d.impact === 'medium').length,
    low: decisions.filter(d => d.impact === 'low').length,
  };

  if (isLoading) {
    return <Card><CardContent className="p-6"><div className="h-64 animate-pulse bg-muted rounded" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-5 w-5 text-hub-ai" />
            AI Decision Accuracy
          </CardTitle>
          <div className="flex gap-2">
            {accuracy !== null && (
              <Badge variant={accuracy >= 80 ? 'default' : accuracy >= 60 ? 'secondary' : 'destructive'} className="text-xs">
                {accuracy}% accuracy
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">{decisions.length} decisions</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Brain className="h-4 w-4 mx-auto mb-1 text-hub-ai" />
            <div className="text-xl font-bold">{avgConfidence}%</div>
            <div className="text-[10px] text-muted-foreground">Avg Confidence</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-success" />
            <div className="text-xl font-bold">{accuracy !== null ? `${accuracy}%` : 'N/A'}</div>
            <div className="text-[10px] text-muted-foreground">Accuracy Rate</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Target className="h-4 w-4 mx-auto mb-1 text-primary" />
            <div className="text-xl font-bold">{withFeedback.length}</div>
            <div className="text-[10px] text-muted-foreground">With Feedback</div>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Decision Status</h4>
          {[
            { label: 'Approved/Executed', count: byStatus.approved, icon: CheckCircle, color: 'text-success' },
            { label: 'Pending Review', count: byStatus.pending, icon: Clock, color: 'text-warning' },
            { label: 'Rejected', count: byStatus.rejected, icon: XCircle, color: 'text-destructive' },
          ].map(({ label, count, icon: Icon, color }) => (
            <div key={label} className="flex items-center justify-between p-2 rounded bg-muted/30">
              <div className="flex items-center gap-2">
                <Icon className={`h-3.5 w-3.5 ${color}`} />
                <span className="text-sm">{label}</span>
              </div>
              <span className="text-sm font-semibold">{count}</span>
            </div>
          ))}
        </div>

        {/* Impact distribution */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Impact Level</h4>
          <div className="flex gap-2">
            {[
              { label: 'High', count: byImpact.high, cls: 'bg-destructive/15 text-destructive border-destructive/20' },
              { label: 'Medium', count: byImpact.medium, cls: 'bg-warning/15 text-warning border-warning/20' },
              { label: 'Low', count: byImpact.low, cls: 'bg-success/15 text-success border-success/20' },
            ].map(({ label, count, cls }) => (
              <div key={label} className={`flex-1 text-center p-2 rounded-lg border ${cls}`}>
                <div className="text-lg font-bold">{count}</div>
                <div className="text-[10px]">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {decisions.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Nenhuma decisão de IA registrada
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AIDecisionAccuracyPanel;
