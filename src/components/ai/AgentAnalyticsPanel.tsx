/**
 * 📊 AgentAnalyticsPanel - Real-time analytics from ai_audit_logs
 * Checkpoint 3.9: Agent Analytics Dashboard
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3, Clock, Zap, Brain, TrendingUp,
  MessageSquare, CheckCircle2, AlertTriangle
} from "lucide-react";

export default function AgentAnalyticsPanel() {
  // Fetch audit logs for agent interactions
  const { data: auditLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["agent-analytics-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_audit_logs")
        .select("module_name, response_time_ms, confidence_score, tokens_input, tokens_output, model_provider, created_at, interaction_type")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Fetch agent swarm metrics
  const { data: swarmMetrics = [], isLoading: swarmLoading } = useQuery({
    queryKey: ["agent-swarm-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_swarm_metrics")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Fetch AI decisions
  const { data: decisions = [], isLoading: decisionsLoading } = useQuery({
    queryKey: ["agent-decisions-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_decisions")
        .select("type, status, confidence, impact, created_at, confidence_level")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const isLoading = logsLoading || swarmLoading || decisionsLoading;

  // Compute metrics
  const metrics = useMemo(() => {
    const totalInteractions = auditLogs.length;
    const avgResponseTime = auditLogs.length > 0
      ? auditLogs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / auditLogs.length
      : 0;
    const avgConfidence = auditLogs.length > 0
      ? auditLogs.reduce((sum, l) => sum + (l.confidence_score || 0), 0) / auditLogs.filter(l => l.confidence_score).length || 0
      : 0;
    const totalTokens = auditLogs.reduce((sum, l) => sum + (l.tokens_input || 0) + (l.tokens_output || 0), 0);

    // By module
    const byModule = auditLogs.reduce<Record<string, { count: number; avgTime: number; totalTime: number }>>((acc, log) => {
      const mod = log.module_name || "unknown";
      if (!acc[mod]) acc[mod] = { count: 0, avgTime: 0, totalTime: 0 };
      acc[mod].count++;
      acc[mod].totalTime += log.response_time_ms || 0;
      acc[mod].avgTime = acc[mod].totalTime / acc[mod].count;
      return acc;
    }, {});

    // Decision stats
    const approvedDecisions = decisions.filter((d) => d.status === "approved" || d.status === "executed").length;
    const rejectedDecisions = decisions.filter((d) => d.status === "rejected").length;
    const pendingDecisions = decisions.filter((d) => d.status === "pending").length;
    const decisionSuccessRate = decisions.length > 0
      ? ((approvedDecisions / decisions.length) * 100)
      : 0;

    // Swarm stats
    const totalSwarmTasks = swarmMetrics.reduce((sum, m) => sum + (m.task_count || 0), 0);
    const totalSwarmErrors = swarmMetrics.reduce((sum, m) => sum + (m.error_count || 0), 0);
    const swarmSuccessRate = totalSwarmTasks > 0
      ? (((totalSwarmTasks - totalSwarmErrors) / totalSwarmTasks) * 100)
      : 0;

    // Recent activity (last 24h)
    const now = new Date();
    const last24h = auditLogs.filter((l) => {
      const created = new Date(l.created_at || "");
      return now.getTime() - created.getTime() < 24 * 60 * 60 * 1000;
    });

    return {
      totalInteractions,
      avgResponseTime: Math.round(avgResponseTime),
      avgConfidence: Math.round(avgConfidence * 100),
      totalTokens,
      byModule,
      approvedDecisions,
      rejectedDecisions,
      pendingDecisions,
      decisionSuccessRate: Math.round(decisionSuccessRate),
      totalSwarmTasks,
      swarmSuccessRate: Math.round(swarmSuccessRate),
      last24hCount: last24h.length,
      activeAgents: swarmMetrics.length,
    };
  }, [auditLogs, decisions, swarmMetrics]);

  // Top modules sorted by count
  const topModules = useMemo(() => {
    return Object.entries(metrics.byModule)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8);
  }, [metrics.byModule]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Analytics dos Agentes</h2>
          <p className="text-sm text-muted-foreground">
            Métricas reais de {metrics.totalInteractions} interações registradas
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{metrics.totalInteractions}</p>
                <p className="text-xs text-muted-foreground">Total Interações</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.last24hCount} nas últimas 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{metrics.avgResponseTime}ms</p>
                <p className="text-xs text-muted-foreground">Tempo Médio</p>
              </div>
            </div>
            <Badge variant="outline" className={`text-[10px] mt-2 ${metrics.avgResponseTime < 3000 ? "text-success" : "text-warning"}`}>
              {metrics.avgResponseTime < 3000 ? "✅ Bom" : "⚠️ Lento"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-accent-foreground" />
              <div>
                <p className="text-2xl font-bold">{metrics.avgConfidence}%</p>
                <p className="text-xs text-muted-foreground">Confiança Média</p>
              </div>
            </div>
            <Badge variant="outline" className={`text-[10px] mt-2 ${metrics.avgConfidence > 70 ? "text-success" : "text-warning"}`}>
              {metrics.avgConfidence > 70 ? "Alta" : "Moderada"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{metrics.totalTokens.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Tokens Usados</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.activeAgents} agentes ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Decision & Swarm Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Decisões de IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Aprovadas</span>
                <Badge variant="outline" className="bg-success/10 text-success">{metrics.approvedDecisions}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Rejeitadas</span>
                <Badge variant="outline" className="bg-destructive/10 text-destructive">{metrics.rejectedDecisions}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pendentes</span>
                <Badge variant="outline" className="bg-warning/10 text-warning">{metrics.pendingDecisions}</Badge>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="text-sm font-medium">Taxa de Sucesso</span>
                <span className="text-lg font-bold text-primary">{metrics.decisionSuccessRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Swarm Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Tasks</span>
                <Badge variant="outline">{metrics.totalSwarmTasks}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Agentes Ativos</span>
                <Badge variant="outline" className="bg-success/10 text-success">{metrics.activeAgents}</Badge>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="text-sm font-medium">Success Rate</span>
                <span className="text-lg font-bold text-primary">{metrics.swarmSuccessRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Modules */}
      {topModules.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Módulos Mais Utilizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topModules.map(([name, stats]) => {
                const maxCount = topModules[0]?.[1]?.count || 1;
                const barWidth = (stats.count / maxCount) * 100;
                return (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-32 truncate">{name}</span>
                    <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/30 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(barWidth, 5)}%` }}
                      >
                        <span className="text-[10px] font-medium">{stats.count}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground w-16 text-right">
                      ~{Math.round(stats.avgTime)}ms
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
