/**
 * AI Observability Page - Connected to real Supabase data
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Activity, AlertCircle, CheckCircle2, Clock, MessageSquare, Brain } from "lucide-react";
import { useAIControlTowerData } from "@/hooks/useAIControlTowerData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AIObservabilityPage() {
  const { agents, auditLogs, metrics, isLoading } = useAIControlTowerData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- hook returns dynamic shape
  const activeAgents = agents.filter((a: any) => a.status === "active" || a.status === "online").length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- hook returns dynamic shape
  const errorAgents = agents.filter((a: any) => a.status === "error").length;

  const observabilityMetrics = [
    {
      label: "Latência Média",
      value: `${metrics.avgResponseTime}ms`,
      status: metrics.avgResponseTime < 2000 ? "good" : "warning"
    },
    {
      label: "Agentes Ativos",
      value: `${activeAgents}/${agents.length}`,
      status: errorAgents === 0 ? "good" : "warning"
    },
    {
      label: "Total Interações",
      value: auditLogs.length.toLocaleString(),
      status: "good"
    },
    {
      label: "Confiança Média",
      value: `${metrics.avgConfidence}%`,
      status: metrics.avgConfidence >= 80 ? "good" : "warning"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Eye className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Observabilidade IA</h2>
          <p className="text-muted-foreground">Monitoramento em tempo real dos sistemas de IA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {observabilityMetrics.map((metric, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{metric.value}</span>
                {metric.status === "good" ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-warning" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade Recente ({auditLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {auditLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                  <p>Nenhuma atividade registrada ainda</p>
                </div>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- audit log shape from hook
                auditLogs.slice(0, 30).map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex items-center gap-3">
                      <Brain className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm font-medium">{(log.user_input || "").slice(0, 60)}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(log.created_at), "dd/MM HH:mm", { locale: ptBR })}</span>
                          {log.model_version && <Badge variant="outline" className="text-xs">{log.model_version}</Badge>}
                          {log.response_time_ms && <span>{log.response_time_ms}ms</span>}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">Concluído</Badge>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
