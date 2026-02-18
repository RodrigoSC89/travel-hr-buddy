/**
 * Autonomous Decision Tracker - Wave 19
 * Real-time feed of AI autonomous decisions with approval workflow
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle2, XCircle, Clock, AlertTriangle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AutonomousDecisionTracker() {
  const { data: decisions = [] } = useQuery({
    queryKey: ['adt-decisions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ai_decisions')
        .select('id, title, description, type, confidence, confidence_level, status, impact, created_at')
        .order('created_at', { ascending: false })
        .limit(30);
      return data || [];
    },
    staleTime: 30000,
  });

  const stats = useMemo(() => {
    const pending = decisions.filter((d) => d.status === 'pending').length;
    const approved = decisions.filter((d) => d.status === 'approved' || d.status === 'executed').length;
    const rejected = decisions.filter((d) => d.status === 'rejected').length;
    const avgConf = decisions.length > 0
      ? Math.round(decisions.reduce((s, d) => s + (d.confidence || 0), 0) / decisions.length * 100)
      : 0;
    return { pending, approved, rejected, avgConf, total: decisions.length };
  }, [decisions]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': case 'executed': return <CheckCircle2 className="h-3.5 w-3.5 text-success" />;
      case 'rejected': return <XCircle className="h-3.5 w-3.5 text-destructive" />;
      case 'pending': return <Clock className="h-3.5 w-3.5 text-warning" />;
      default: return <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return <Badge variant="destructive" className="text-[10px] h-4">Alto</Badge>;
      case 'medium': return <Badge variant="outline" className="text-[10px] h-4 bg-warning/10 text-warning">Médio</Badge>;
      default: return <Badge variant="outline" className="text-[10px] h-4">Baixo</Badge>;
    }
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Autonomous Decisions
          </CardTitle>
          <div className="flex gap-2">
            {stats.pending > 0 && (
              <Badge variant="outline" className="bg-warning/10 text-warning text-xs">{stats.pending} pendentes</Badge>
            )}
            <Badge variant="outline" className="text-xs">{stats.avgConf}% confiança</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mini KPIs */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-foreground' },
            { label: 'Aprovadas', value: stats.approved, color: 'text-success' },
            { label: 'Pendentes', value: stats.pending, color: 'text-warning' },
            { label: 'Rejeitadas', value: stats.rejected, color: 'text-destructive' },
          ].map((kpi) => (
            <div key={kpi.label} className="text-center p-1.5 rounded-md bg-muted/30">
              <div className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Decision feed */}
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {decisions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma decisão autônoma registrada</p>
            </div>
          ) : (
            decisions.slice(0, 12).map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                {getStatusIcon(d.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{d.title}</span>
                    {getImpactBadge(d.impact)}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{d.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    <span>{d.type}</span>
                    <span>•</span>
                    <span>{Math.round((d.confidence || 0) * 100)}% conf</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(d.created_at), { addSuffix: true, locale: ptBR })}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
