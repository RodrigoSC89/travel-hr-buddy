/**
 * Maintenance KPI Dashboard - Real data from maintenance_records
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wrench, Clock, TrendingUp, TrendingDown, AlertTriangle, 
  CheckCircle, BarChart3, Target, Activity, Zap 
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/ui/UXStates";

export default function MaintenanceKPIDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["maintenance-kpis"],
    queryFn: async () => {
      const { data: records, error } = await supabase
        .from("maintenance_records")
        .select("id, status, priority, maintenance_type, estimated_duration, actual_duration, cost_estimate, actual_cost, scheduled_date, completed_date, title, vessel_id")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const { data: vessels, error: ve } = await supabase
        .from("vessels")
        .select("id, name")
        .order("name");
      if (ve) throw ve;

      return { records: records || [], vessels: vessels || [] };
    },
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const records = data?.records || [];
  const vessels = data?.vessels || [];

  if (records.length === 0) {
    return (
      <EmptyState
        icon={Wrench}
        title="Sem registros de manutenção"
        message="Crie ordens de serviço para visualizar KPIs de MTBF, MTTR e desempenho de manutenção."
        actionLabel="Ir para PMS"
      />
    );
  }

  const completed = records.filter((r: any) => r.status === "completed");
  const pending = records.filter((r: any) => r.status === "pending");
  const inProgress = records.filter((r: any) => r.status === "in_progress");
  const critical = records.filter((r: any) => r.priority === "critical");

  // Calculate MTBF (estimated from avg interval between completions)
  const avgDurationHours = completed.length > 0
    ? Math.round(completed.reduce((acc: number, r: any) => acc + (r.actual_duration || r.estimated_duration || 4), 0) / completed.length)
    : 0;

  // MTTR = average actual duration of completed work
  const mttr = completed.length > 0
    ? (completed.reduce((acc: number, r: any) => acc + (r.actual_duration || r.estimated_duration || 4), 0) / completed.length).toFixed(1)
    : "N/A";

  // Availability = completed / total * 100
  const availability = records.length > 0
    ? ((completed.length / records.length) * 100).toFixed(1)
    : "0";

  const totalPending = pending.length + inProgress.length;

  // Work orders by priority
  const workOrdersByPriority = [
    { priority: "Crítica", count: records.filter((r: any) => r.priority === "critical").length },
    { priority: "Alta", count: records.filter((r: any) => r.priority === "high").length },
    { priority: "Média", count: records.filter((r: any) => r.priority === "medium").length },
    { priority: "Baixa", count: records.filter((r: any) => r.priority === "low").length },
  ].filter(w => w.count > 0);

  // Equipment health from vessels
  const vesselHealth = vessels.slice(0, 5).map((v: any) => {
    const vRecords = records.filter((r: any) => r.vessel_id === v.id);
    const vCompleted = vRecords.filter((r: any) => r.status === "completed").length;
    const vTotal = vRecords.length;
    const health = vTotal > 0 ? Math.round((vCompleted / vTotal) * 100) : 100;
    const pendingCount = vRecords.filter((r: any) => r.status !== "completed").length;
    return {
      name: v.name,
      health,
      status: health >= 80 ? "good" : health >= 60 ? "warning" : "critical",
      pending: pendingCount,
    };
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Completadas</p>
                <p className="text-2xl font-bold">{completed.length}</p>
                <div className="flex items-center gap-1 text-xs text-success">
                  <CheckCircle className="h-3 w-3" />
                  de {records.length} registros
                </div>
              </div>
              <Clock className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">MTTR (Duração Média)</p>
                <p className="text-2xl font-bold">{mttr}h</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  Tempo médio de reparo
                </div>
              </div>
              <Wrench className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold">{availability}%</p>
                <div className="flex items-center gap-1 text-xs text-success">
                  <CheckCircle className="h-3 w-3" />
                  {completed.length} completadas
                </div>
              </div>
              <Activity className="h-8 w-8 text-cyan-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Ordens Pendentes</p>
                <p className="text-2xl font-bold">{totalPending}</p>
                <div className="flex items-center gap-1 text-xs text-warning">
                  <AlertTriangle className="h-3 w-3" />
                  {critical.length} críticas
                </div>
              </div>
              <Target className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Work Orders by Priority */}
      {workOrdersByPriority.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Ordens por Prioridade
            </CardTitle>
            <CardDescription>Distribuição atual ({records.length} registros)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={workOrdersByPriority} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="priority" type="category" fontSize={12} width={70} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Equipment Health per Vessel */}
      {vesselHealth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Saúde por Embarcação
            </CardTitle>
            <CardDescription>Baseado em registros de manutenção reais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vesselHealth.map((v: any) => (
                <div key={v.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${
                        v.status === "good" ? "bg-success" :
                        v.status === "warning" ? "bg-warning" : "bg-destructive"
                      }`} />
                      <span className="font-medium">{v.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={v.status === "good" ? "default" : v.status === "warning" ? "secondary" : "destructive"}>
                        {v.health}% Health
                      </Badge>
                      {v.pending > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {v.pending} pendente(s)
                        </span>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={v.health}
                    className={`h-2 ${
                      v.status === "good" ? "[&>div]:bg-success" :
                      v.status === "warning" ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"
                    }`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
