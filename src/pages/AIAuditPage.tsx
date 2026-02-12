/**
 * AI Audit Page - Connected to real Supabase data
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList, FileText, Clock, Brain, MessageSquare, CheckCircle2 } from "lucide-react";
import { useAIControlTowerData } from "@/hooks/useAIControlTowerData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AIAuditPage() {
  const { auditLogs, decisions, metrics, isLoading } = useAIControlTowerData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={`audit-skel-${i}`} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Auditoria de IA</h2>
          <p className="text-muted-foreground">Logs e registros de todas as ações de IA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Interações</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{auditLogs.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Decisões Aprovadas</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-success">{metrics.approvedDecisions}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-warning">{metrics.pendingDecisions}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria</CardTitle>
          <CardDescription>Últimas ações registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {auditLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Nenhum log registrado</h3>
                  <p>Interações com a IA serão registradas automaticamente</p>
                </div>
              ) : (
                auditLogs.slice(0, 20).map((log: Record<string, unknown>) => (
                  <div key={String(log.id)} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center gap-4">
                      <Brain className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{String(log.user_input || "Interação IA").slice(0, 80)}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {typeof log.model_version === "string" && <Badge variant="outline" className="text-xs">{log.model_version}</Badge>}
                          <Clock className="h-3 w-3 ml-2" />
                          <span>{format(new Date(String(log.created_at)), "dd/MM HH:mm", { locale: ptBR })}</span>
                          {typeof log.response_time_ms === "number" && <span className="text-xs">({log.response_time_ms}ms)</span>}
                        </div>
                      </div>
                    </div>
                    <Badge variant="default">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Registrado
                    </Badge>
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
