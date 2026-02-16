/**
 * Real-Time System Monitor - Connected to Supabase
 * Live health checks, access logs, and real-time metrics
 */
import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Zap, Clock, TrendingUp, Activity, Users, Database, Globe, Cpu,
  HardDrive, Wifi, AlertTriangle, CheckCircle, ArrowUp, ArrowDown, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface HealthCheck {
  service: string;
  latency: number;
  status: "good" | "warning" | "critical";
}

export const RealTimeSystemMonitor: React.FC = () => {
  const queryClient = useQueryClient();
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  // Fetch real access logs
  const { data: accessLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ['system-monitor-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_logs')
        .select('id, action, module_accessed, result, severity, timestamp, user_id')
        .order('timestamp', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  // Fetch real active sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ['system-monitor-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('active_sessions')
        .select('id, is_active, last_activity, security_level')
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  // Fetch AI logs for system metrics
  const { data: aiLogs = [] } = useQuery({
    queryKey: ['system-monitor-ai'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_logs')
        .select('id, service, status, response_time_ms, tokens_used, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 60000,
  });

  // Real health check function
  const runHealthChecks = async () => {
    setIsChecking(true);
    const checks: HealthCheck[] = [];

    // Database check
    const dbStart = performance.now();
    try {
      await supabase.from('vessels').select('id').limit(1);
      const dbLatency = Math.round(performance.now() - dbStart);
      checks.push({ service: 'Database', latency: dbLatency, status: dbLatency < 500 ? 'good' : dbLatency < 1500 ? 'warning' : 'critical' });
    } catch { checks.push({ service: 'Database', latency: -1, status: 'critical' }); }

    // Auth check
    const authStart = performance.now();
    try {
      await supabase.auth.getSession();
      const authLatency = Math.round(performance.now() - authStart);
      checks.push({ service: 'Auth', latency: authLatency, status: authLatency < 300 ? 'good' : authLatency < 1000 ? 'warning' : 'critical' });
    } catch { checks.push({ service: 'Auth', latency: -1, status: 'critical' }); }

    // Storage check
    const storageStart = performance.now();
    try {
      await supabase.storage.listBuckets();
      const storageLatency = Math.round(performance.now() - storageStart);
      checks.push({ service: 'Storage', latency: storageLatency, status: storageLatency < 500 ? 'good' : storageLatency < 1500 ? 'warning' : 'critical' });
    } catch { checks.push({ service: 'Storage', latency: -1, status: 'critical' }); }

    // Realtime check
    const rtStart = performance.now();
    try {
      const ch = supabase.channel('health-check');
      ch.subscribe();
      supabase.removeChannel(ch);
      const rtLatency = Math.round(performance.now() - rtStart);
      checks.push({ service: 'Realtime', latency: rtLatency, status: rtLatency < 500 ? 'good' : rtLatency < 2000 ? 'warning' : 'critical' });
    } catch { checks.push({ service: 'Realtime', latency: -1, status: 'critical' }); }

    setHealthChecks(checks);
    setIsChecking(false);
    toast.success('Health check completo');
  };

  useEffect(() => { runHealthChecks(); }, []);

  // Computed metrics
  const activeSessions = sessions.length;
  const avgAIResponseTime = aiLogs.length > 0
    ? Math.round(aiLogs.reduce((s, l) => s + (l.response_time_ms || 0), 0) / aiLogs.length)
    : 0;
  const aiSuccessRate = aiLogs.length > 0
    ? ((aiLogs.filter(l => l.status === 'success').length / aiLogs.length) * 100).toFixed(1)
    : '100';
  const totalTokens = aiLogs.reduce((s, l) => s + (l.tokens_used || 0), 0);

  const overallHealth = healthChecks.length > 0
    ? Math.round(healthChecks.filter(c => c.status === 'good').length / healthChecks.length * 100)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "text-success";
      case "warning": return "text-warning";
      case "critical": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "border-destructive/20 bg-destructive/5";
      case "high": case "warning": return "border-warning/20 bg-warning/5";
      default: return "border-border bg-muted/50";
    }
  };

  if (loadingLogs && healthChecks.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Monitoramento em Tempo Real</h1>
            <Badge variant="secondary" className="animate-pulse">
              <div className="w-2 h-2 bg-success rounded-full mr-2" />
              LIVE
            </Badge>
          </div>
          <p className="text-muted-foreground">Health checks reais do Supabase e métricas de sistema</p>
        </div>
        <Button onClick={runHealthChecks} disabled={isChecking} size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          Verificar
        </Button>
      </div>

      {/* Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            Saúde do Sistema — {overallHealth}%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {healthChecks.map(check => (
              <div key={check.service} className="text-center p-3 border rounded-lg">
                <div className={`text-2xl font-bold ${getStatusColor(check.status)}`}>
                  {check.latency >= 0 ? `${check.latency}ms` : 'DOWN'}
                </div>
                <p className="text-sm text-muted-foreground">{check.service}</p>
                <Badge variant={check.status === 'good' ? 'default' : check.status === 'warning' ? 'secondary' : 'destructive'} className="mt-1">
                  {check.status === 'good' ? 'OK' : check.status === 'warning' ? 'Lento' : 'Crítico'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-medium">Sessões Ativas</span>
            </div>
            <div className="text-3xl font-bold">{activeSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-info" />
              <span className="font-medium">Tempo Resp. IA</span>
            </div>
            <div className="text-3xl font-bold">{avgAIResponseTime}ms</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <span className="font-medium">AI Success Rate</span>
            </div>
            <div className="text-3xl font-bold">{aiSuccessRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-5 h-5 text-warning" />
              <span className="font-medium">Tokens Consumidos</span>
            </div>
            <div className="text-3xl font-bold">{totalTokens.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Access Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Logs de Acesso Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {accessLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhum log registrado</p>
              ) : accessLogs.map((log: any) => (
                <div key={log.id} className={`p-3 border rounded-lg ${getSeverityColor(log.severity)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{log.action}</span>
                    <Badge variant="outline" className="text-xs">{log.module_accessed}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={log.result === 'success' ? 'default' : 'destructive'} className="text-xs">{log.result}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              Performance IA (Últimas 50 chamadas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {aiLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhum log de IA</p>
              ) : aiLogs.slice(0, 15).map((log: any) => (
                <div key={log.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{log.service}</span>
                    <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                      {log.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{log.response_time_ms || 0}ms · {log.tokens_used || 0} tokens</span>
                    <span>{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader><CardTitle>Ações Rápidas</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={runHealthChecks}>
              <Zap className="w-4 h-4 mr-2" />
              Re-check Health
            </Button>
            <Button variant="outline" size="sm" onClick={async () => { toast.info('Invalidando cache...'); await queryClient.invalidateQueries(); toast.success('Cache invalidado com sucesso'); }}>
              <HardDrive className="w-4 h-4 mr-2" />
              Limpar Cache
            </Button>
            <Button variant="outline" size="sm" onClick={() => { const reportData = { healthChecks, activeSessions, aiLogs: aiLogs?.length || 0, timestamp: new Date().toISOString() }; const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `system-report-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url); toast.success('Relatório exportado'); }}>
              <Activity className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open(`https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb`, '_blank')}>
              <Globe className="w-4 h-4 mr-2" />
              Supabase Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
