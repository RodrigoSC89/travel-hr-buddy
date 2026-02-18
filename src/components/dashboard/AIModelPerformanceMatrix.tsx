/**
 * AI Model Performance Matrix - Wave 19
 * Real-time monitoring of AI model accuracy, latency & token usage
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, Zap, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIModelPerformanceMatrix() {
  const { data: logs = [] } = useQuery({
    queryKey: ['ai-perf-logs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ai_logs')
        .select('model, service, status, response_time_ms, tokens_used, created_at')
        .order('created_at', { ascending: false })
        .limit(500);
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: decisions = [] } = useQuery({
    queryKey: ['ai-perf-decisions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ai_decisions')
        .select('confidence, status, type, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      return data || [];
    },
    staleTime: 60000,
  });

  const modelStats = useMemo(() => {
    const byModel = new Map<string, { calls: number; errors: number; totalMs: number; totalTokens: number }>();
    
    logs.forEach((l) => {
      const model = l.model || l.service || 'unknown';
      const entry = byModel.get(model) || { calls: 0, errors: 0, totalMs: 0, totalTokens: 0 };
      entry.calls++;
      if (l.status === 'error') entry.errors++;
      entry.totalMs += l.response_time_ms || 0;
      entry.totalTokens += l.tokens_used || 0;
      byModel.set(model, entry);
    });

    return Array.from(byModel.entries())
      .map(([model, stats]) => ({
        model,
        calls: stats.calls,
        successRate: stats.calls > 0 ? ((stats.calls - stats.errors) / stats.calls * 100) : 0,
        avgLatency: stats.calls > 0 ? Math.round(stats.totalMs / stats.calls) : 0,
        totalTokens: stats.totalTokens,
      }))
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 8);
  }, [logs]);

  const globalStats = useMemo(() => {
    const totalCalls = logs.length;
    const errors = logs.filter((l) => l.status === 'error').length;
    const avgConfidence = decisions.length > 0
      ? Math.round(decisions.reduce((s, d) => s + (d.confidence || 0), 0) / decisions.length * 100)
      : 0;
    const approvedRate = decisions.length > 0
      ? Math.round(decisions.filter((d) => d.status === 'approved' || d.status === 'executed').length / decisions.length * 100)
      : 0;

    return { totalCalls, errorRate: totalCalls ? Math.round(errors / totalCalls * 100) : 0, avgConfidence, approvedRate };
  }, [logs, decisions]);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            AI Model Performance
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">{globalStats.totalCalls} calls</Badge>
            <Badge variant="outline" className={`text-xs ${globalStats.errorRate > 5 ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
              {100 - globalStats.errorRate}% uptime
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Global KPIs */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Calls', value: globalStats.totalCalls, icon: BarChart3, color: 'text-primary' },
            { label: 'Avg Confidence', value: `${globalStats.avgConfidence}%`, icon: TrendingUp, color: 'text-success' },
            { label: 'Approval Rate', value: `${globalStats.approvedRate}%`, icon: Zap, color: 'text-warning' },
            { label: 'Error Rate', value: `${globalStats.errorRate}%`, icon: Clock, color: globalStats.errorRate > 5 ? 'text-destructive' : 'text-muted-foreground' },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="text-center p-2 rounded-lg bg-muted/30"
            >
              <kpi.icon className={`h-4 w-4 mx-auto mb-1 ${kpi.color}`} />
              <div className="text-lg font-bold">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Per-model breakdown */}
        {modelStats.length > 0 ? (
          <div className="space-y-2">
            {modelStats.map((m, i) => (
              <motion.div
                key={m.model}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate block">{m.model}</span>
                  <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                    <span>{m.calls} calls</span>
                    <span>{m.avgLatency}ms avg</span>
                    <span>{(m.totalTokens / 1000).toFixed(1)}k tokens</span>
                  </div>
                </div>
                <div className="w-24 h-2 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${m.successRate >= 95 ? 'bg-success' : m.successRate >= 80 ? 'bg-warning' : 'bg-destructive'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${m.successRate}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                  />
                </div>
                <span className={`text-xs font-bold w-12 text-right ${m.successRate >= 95 ? 'text-success' : m.successRate >= 80 ? 'text-warning' : 'text-destructive'}`}>
                  {m.successRate.toFixed(0)}%
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum log de IA registrado ainda</p>
        )}
      </CardContent>
    </Card>
  );
}
