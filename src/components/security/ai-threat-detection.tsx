/**
 * AI Threat Detection - Integrado com ai_access_anomalies e access_logs do Supabase
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, AlertTriangle, CheckCircle, Activity, Lock, Eye, Zap,
  TrendingUp, User, MapPin, Clock, XCircle, RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export const AIThreatDetection: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real anomalies from Supabase
  const { data: anomalies, isLoading } = useQuery({
    queryKey: ["ai-access-anomalies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_access_anomalies")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch access logs for metrics
  const { data: accessLogs } = useQuery({
    queryKey: ["access-logs-security"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("access_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  // Resolve anomaly
  const resolveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("ai_access_anomalies")
        .update({ 
          status, 
          resolved_at: new Date().toISOString() 
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-access-anomalies"] });
      toast({ title: "Atualizado", description: "Status da ameaça atualizado." });
    },
  });

  // Derive threats from anomalies
  const threats = (anomalies || []).map((a) => ({
    id: a.id,
    type: a.anomaly_type as string,
    severity: a.severity as string,
    title: a.description || a.anomaly_type,
    description: a.recommendation || "Anomalia detectada pelo sistema de IA",
    detectedAt: a.created_at,
    source: {
      ip: (a.evidence as Record<string, string>)?.ip || "N/A",
      location: (a.evidence as Record<string, string>)?.location,
      user: a.user_id || undefined,
    },
    status: a.status as string,
    confidence: a.confidence || 0,
    affectedSystems: [] as string[],
    aiAnalysis: a.recommendation || "Análise pendente",
  }));

  // Metrics from real data
  const activeThreats = threats.filter(t => t.status === "active" || t.status === "investigating" || t.status === "pending").length;
  const criticalThreats = threats.filter(t => t.severity === "critical" || t.severity === "high").length;
  const avgConfidence = threats.length > 0 
    ? Math.round(threats.reduce((sum, t) => sum + t.confidence, 0) / threats.length) 
    : 0;
  const failedLogins = (accessLogs || []).filter(l => l.result === "failure" || l.result === "denied").length;

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge variant="destructive">{severity.toUpperCase()}</Badge>;
      case "high": return <Badge className="bg-warning/20 text-warning">{severity.toUpperCase()}</Badge>;
      case "medium": return <Badge variant="secondary">{severity.toUpperCase()}</Badge>;
      default: return <Badge variant="outline">{severity.toUpperCase()}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": case "pending": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "investigating": return <Eye className="h-4 w-4 text-warning" />;
      case "resolved": return <CheckCircle className="h-4 w-4 text-success" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ameaças Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{activeThreats}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Alta Severidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{criticalThreats}</div>
            <p className="text-xs text-muted-foreground">Critical + High</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Confiança IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConfidence}%</div>
            <p className="text-xs text-muted-foreground">Precisão média</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Logins Falhos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedLogins}</div>
            <p className="text-xs text-muted-foreground">Últimas 200 ações</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                AI Threat Detection
              </CardTitle>
              <CardDescription>
                Anomalias detectadas via ai_access_anomalies — dados reais do Supabase
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Activity className="h-3 w-3" />
              {isLoading ? "Carregando..." : `${threats.length} registros`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="threats">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="threats">Ameaças ({threats.length})</TabsTrigger>
              <TabsTrigger value="access-logs">Access Logs</TabsTrigger>
              <TabsTrigger value="protection">Proteção</TabsTrigger>
            </TabsList>

            <TabsContent value="threats" className="space-y-4 mt-4">
              {threats.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Nenhuma anomalia detectada</p>
                  <p className="text-sm">O sistema de IA não identificou ameaças recentes</p>
                </div>
              ) : threats.map((threat) => (
                <Card key={threat.id} className={`border-l-4 ${
                  threat.severity === "critical" ? "border-l-destructive" :
                    threat.severity === "high" ? "border-l-warning" :
                      threat.severity === "medium" ? "border-l-warning/60" :
                        "border-l-info"
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          {getStatusIcon(threat.status)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{threat.title}</CardTitle>
                            {getSeverityBadge(threat.severity)}
                          </div>
                          <CardDescription className="mt-1">{threat.description}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Confiança da IA</span>
                        <span className="font-medium">{(threat.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={threat.confidence * 100} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <MapPin className="h-3 w-3" /> IP/Origem
                        </div>
                        <div className="font-mono text-sm">{threat.source.ip}</div>
                      </div>
                      {threat.source.user && (
                        <div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <User className="h-3 w-3" /> Usuário
                          </div>
                          <div className="text-sm truncate">{threat.source.user}</div>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Clock className="h-3 w-3" /> Detectado
                        </div>
                        <div className="text-sm">
                          {new Date(threat.detectedAt).toLocaleTimeString("pt-BR")}
                        </div>
                      </div>
                    </div>

                    <div className="bg-info/10 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Shield className="h-4 w-4 mt-0.5 text-info" />
                        <div>
                          <div className="text-sm font-medium mb-1">Análise da IA</div>
                          <div className="text-sm text-muted-foreground">{threat.aiAnalysis}</div>
                        </div>
                      </div>
                    </div>

                    {(threat.status === "active" || threat.status === "pending" || threat.status === "investigating") && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => resolveMutation.mutate({ id: threat.id, status: "resolved" })}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" /> Resolver
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => resolveMutation.mutate({ id: threat.id, status: "false_positive" })}
                        >
                          Falso Positivo
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="access-logs" className="space-y-4 mt-4">
              <div className="space-y-2">
                {(accessLogs || []).slice(0, 20).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                    <div className="flex items-center gap-3">
                      <Badge variant={log.result === "success" ? "default" : "destructive"} className="text-xs">
                        {log.result}
                      </Badge>
                      <span>{log.action}</span>
                      <span className="text-muted-foreground">{log.module_accessed}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>{log.severity}</span>
                      <span>{new Date(log.timestamp).toLocaleString("pt-BR")}</span>
                    </div>
                  </div>
                ))}
                {(!accessLogs || accessLogs.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Nenhum log de acesso registrado</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="protection" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Camadas de Proteção</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { name: "RLS (Row Level Security)", status: "active" },
                      { name: "JWT Authentication", status: "active" },
                      { name: "Detecção de Anomalias IA", status: "active" },
                      { name: "Audit Trail Imutável", status: "active" },
                      { name: "Rate Limiting", status: "active" },
                      { name: "Input Sanitization", status: "active" }
                    ].map((layer) => (
                      <div key={layer.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-success" />
                          <span className="text-sm font-medium">{layer.name}</span>
                        </div>
                        <Badge variant="default" className="bg-success">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ações Automáticas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      "Detecção automática de anomalias de acesso",
                      "Registro completo de auditoria imutável",
                      "Notificação em tempo real de alertas",
                      "Isolamento de dados multi-tenant via RLS",
                      "Validação JWT em todas as edge functions",
                      "Log detalhado de todas atividades"
                    ].map((action) => (
                      <div key={action} className="flex items-start gap-2 p-2 bg-info/10 rounded-lg">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-info" />
                        <span className="text-sm">{action}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIThreatDetection;
