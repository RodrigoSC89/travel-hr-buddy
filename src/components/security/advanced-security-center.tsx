import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, AlertTriangle, CheckCircle, Eye, Lock, Key,
  Globe, Server, Clock, TrendingUp, RefreshCw, Download, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SecurityAlert {
  id: string;
  type: "threat" | "vulnerability" | "policy" | "access";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  timestamp: Date;
  status: "active" | "investigating" | "resolved";
  affectedAssets: string[];
}

export const AdvancedSecurityCenter: React.FC = () => {
  const { toast } = useToast();
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  // Real security alerts from access_logs
  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ["security-alerts"],
    queryFn: async () => {
      const { data: logs } = await supabase
        .from("access_logs")
        .select("id, action, result, severity, timestamp, module_accessed")
        .order("timestamp", { ascending: false })
        .limit(50);

      return (logs || [])
        .filter((l) => l.severity === "high" || l.severity === "critical" || l.result === "failure")
        .slice(0, 10)
        .map((l): SecurityAlert => ({
          id: l.id,
          type: l.result === "failure" ? "threat" : "policy",
          severity: l.severity === "critical" ? "critical" : l.severity === "high" ? "high" : "medium",
          title: `${l.action} - ${l.module_accessed}`,
          description: `Evento de ${l.result} em ${l.module_accessed}`,
          timestamp: new Date(l.timestamp),
          status: "active",
          affectedAssets: [l.module_accessed],
        }));
    },
    staleTime: 30000,
  });

  // Real metrics from access_logs and active_sessions
  const { data: metrics } = useQuery({
    queryKey: ["security-metrics"],
    queryFn: async () => {
      const [{ count: totalLogs }, { count: failedLogs }, { count: activeSessions }] = await Promise.all([
        supabase.from("access_logs").select("*", { count: "exact", head: true }),
        supabase.from("access_logs").select("*", { count: "exact", head: true }).eq("result", "failure"),
        supabase.from("active_sessions").select("*", { count: "exact", head: true }).eq("is_active", true),
      ]);

      const total = totalLogs || 1;
      const failed = failedLogs || 0;
      const successRate = Math.round(((total - failed) / total) * 100);

      return {
        securityScore: Math.min(100, successRate),
        totalEvents: total,
        failedAttempts: failed,
        activeSessions: activeSessions || 0,
        successRate,
      };
    },
    staleTime: 30000,
  });

  const securityScore = metrics?.securityScore ?? 0;

  const handleResolveAlert = (alertId: string) => {
    setResolvedIds(prev => new Set(prev).add(alertId));
    toast({ title: "Alerta resolvido", description: "O alerta foi marcado como resolvido." });
  };

  const handleRunScan = () => {
    refetch();
    toast({ title: "Varredura concluída", description: "Dados de segurança atualizados." });
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === "critical" || severity === "high") return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (severity === "medium") return <AlertTriangle className="h-4 w-4 text-warning" />;
    return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
  };

  const getScoreColor = (score: number) => score >= 90 ? "text-success" : score >= 70 ? "text-warning" : "text-destructive";

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const activeAlerts = alerts.filter(a => !resolvedIds.has(a.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Central de Segurança</h2>
          <p className="text-muted-foreground">Monitoramento avançado e gestão de segurança</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />Relatório</Button>
          <Button onClick={handleRunScan}><RefreshCw className="h-4 w-4 mr-2" />Varredura</Button>
        </div>
      </div>

      {/* Security Score */}
      <Card>
        <CardHeader><CardTitle className="flex items-center space-x-2"><Shield className="h-5 w-5" /><span>Score de Segurança</span></CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(securityScore)}`}>{securityScore}</div>
              <p className="text-sm text-muted-foreground">de 100</p>
            </div>
            <div className="flex-1">
              <Progress value={securityScore} className="h-3" />
              <div className="mt-2 text-sm text-muted-foreground">
                {securityScore >= 90 ? "Excelente" : securityScore >= 70 ? "Bom" : "Necessita Atenção"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Eventos Totais", value: metrics?.totalEvents || 0, icon: <Server className="h-5 w-5" />, color: "text-primary" },
          { name: "Tentativas Falhas", value: metrics?.failedAttempts || 0, icon: <AlertTriangle className="h-5 w-5" />, color: "text-destructive" },
          { name: "Sessões Ativas", value: metrics?.activeSessions || 0, icon: <Eye className="h-5 w-5" />, color: "text-success" },
          { name: "Taxa de Sucesso", value: `${metrics?.successRate || 0}%`, icon: <TrendingUp className="h-5 w-5" />, color: "text-primary" },
        ].map(m => (
          <Card key={m.name}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{m.name}</p>
                  <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                </div>
                <div className={m.color}>{m.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Alertas ({activeAlerts.length})</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Alertas de Segurança</CardTitle><CardDescription>Eventos de alta severidade e falhas de acesso</CardDescription></CardHeader>
            <CardContent>
              {activeAlerts.length === 0 ? (
                <div className="text-center py-12"><CheckCircle className="h-12 w-12 mx-auto mb-4 text-success/50" /><p className="text-muted-foreground">Nenhum alerta ativo</p></div>
              ) : (
                <div className="space-y-4">
                  {activeAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-4 p-4 border border-border rounded-lg">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>{alert.severity}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center"><Clock className="h-3 w-3 mr-1" />{alert.timestamp.toLocaleString('pt-BR')}</span>
                          <Button size="sm" variant="outline" onClick={() => handleResolveAlert(alert.id)}>Resolver</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Status de Compliance</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "LGPD", value: 95 },
                    { name: "ISO 27001", value: 88 },
                    { name: "SOC 2", value: 92 },
                    { name: "MLC 2006", value: 96 },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-sm">{item.name}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={item.value} className="w-20 h-2" />
                        <span className="text-sm font-medium">{item.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Controles de Acesso</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "MFA Habilitado", icon: <Lock className="h-4 w-4" />, active: true },
                    { label: "SSO Configurado", icon: <Key className="h-4 w-4" />, active: true },
                    { label: "IP Whitelisting", icon: <Globe className="h-4 w-4" />, active: false },
                    { label: "Auditoria Ativa", icon: <Eye className="h-4 w-4" />, active: true },
                  ].map((control) => (
                    <div key={control.label} className="flex items-center justify-between p-2 rounded border border-border">
                      <div className="flex items-center space-x-2">{control.icon}<span className="text-sm">{control.label}</span></div>
                      <Badge variant={control.active ? "default" : "secondary"}>{control.active ? "Ativo" : "Inativo"}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
