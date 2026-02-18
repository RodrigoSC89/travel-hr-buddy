/**
 * Wave 47 - AI Swarm Orchestrator
 * Multi-agent coordination dashboard with real-time task distribution
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Zap, Users, Activity, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AISwarmOrchestrator() {
  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['swarm-agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_registry')
        .select('*')
        .order('last_heartbeat', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 15000,
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['swarm-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_swarm_metrics')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 15000,
  });

  const { data: decisions = [] } = useQuery({
    queryKey: ['swarm-decisions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_decisions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const swarmStats = useMemo(() => {
    const activeAgents = agents.filter(a => a.status === 'active').length;
    const totalTasks = metrics.reduce((sum, m) => sum + (m.task_count || 0), 0);
    const totalSuccess = metrics.reduce((sum, m) => sum + (m.success_count || 0), 0);
    const avgResponseTime = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + (m.avg_response_time_ms || 0), 0) / metrics.length
      : 0;
    const successRate = totalTasks > 0 ? (totalSuccess / totalTasks) * 100 : 0;
    const pendingDecisions = decisions.filter(d => d.status === 'pending').length;
    const approvedDecisions = decisions.filter(d => d.status === 'approved' || d.status === 'executed').length;

    return { activeAgents, totalAgents: agents.length, totalTasks, successRate, avgResponseTime, pendingDecisions, approvedDecisions };
  }, [agents, metrics, decisions]);

  if (agentsLoading) return <Skeleton className="h-80" />;

  const kpis = [
    { label: 'Active Agents', value: swarmStats.activeAgents, total: swarmStats.totalAgents, icon: Users, color: 'text-primary' },
    { label: 'Tasks Processed', value: swarmStats.totalTasks.toLocaleString(), icon: Zap, color: 'text-warning' },
    { label: 'Success Rate', value: `${swarmStats.successRate.toFixed(1)}%`, icon: CheckCircle2, color: 'text-success' },
    { label: 'Avg Response', value: `${swarmStats.avgResponseTime.toFixed(0)}ms`, icon: Clock, color: 'text-info' },
  ];

  return (
    <Card className="border-hub-ai/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-hub-ai" />
            <CardTitle className="text-base">AI Swarm Orchestrator</CardTitle>
          </div>
          <div className="flex gap-1.5">
            {swarmStats.pendingDecisions > 0 && (
              <Badge variant="outline" className="bg-warning/10 text-warning text-[10px]">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {swarmStats.pendingDecisions} pending
              </Badge>
            )}
            <Badge variant="outline" className="bg-success/10 text-success text-[10px]">
              <Activity className="h-3 w-3 mr-1" />
              Swarm Active
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="text-center p-3 rounded-lg bg-muted/50 border border-border/40">
              <kpi.icon className={`h-4 w-4 mx-auto mb-1 ${kpi.color}`} />
              <div className="text-lg font-bold text-foreground">
                {kpi.value}
                {'total' in kpi && <span className="text-xs text-muted-foreground font-normal">/{kpi.total}</span>}
              </div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Agent Status Grid */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agent Fleet</h4>
          <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto">
            {agents.slice(0, 8).map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-2 rounded-md bg-background border border-border/30">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${agent.status === 'active' ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
                  <span className="text-xs font-medium truncate max-w-[120px]">{agent.name}</span>
                </div>
                <Badge variant="outline" className="text-[9px] h-5">
                  {agent.status}
                </Badge>
              </div>
            ))}
            {agents.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum agente registrado</p>
            )}
          </div>
        </div>

        {/* Recent Decisions */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Decisions</h4>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {decisions.slice(0, 5).map((d) => (
              <div key={d.id} className="flex items-center justify-between p-2 rounded-md bg-background border border-border/30">
                <span className="text-xs truncate max-w-[180px]">{d.title}</span>
                <Badge variant={d.status === 'approved' || d.status === 'executed' ? 'default' : 'outline'} className="text-[9px] h-5">
                  {d.status}
                </Badge>
              </div>
            ))}
            {decisions.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-3">Sem decisões recentes</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
