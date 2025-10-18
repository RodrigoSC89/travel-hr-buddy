import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Activity, RefreshCw, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CronJob, CronJobStats, CronJobExecution } from "@/types/cron";

export default function CronMonitorPage() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  // Fetch cron statistics
  const { data: stats } = useQuery<CronJobStats>({
    queryKey: ["cron-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_cron_stats");
      
      if (error) throw error;
      return data as CronJobStats;
    },
  });

  // Fetch cron jobs
  const { data: jobs = [], isLoading, refetch } = useQuery<CronJob[]>({
    queryKey: ["cron-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cron_jobs")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as CronJob[];
    },
  });

  // Fetch executions for selected job
  const { data: executions = [] } = useQuery<CronJobExecution[]>({
    queryKey: ["cron-executions", selectedJob],
    queryFn: async () => {
      if (!selectedJob) return [];

      const { data, error } = await supabase
        .from("cron_job_executions")
        .select("*")
        .eq("job_id", selectedJob)
        .order("started_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as CronJobExecution[];
    },
    enabled: !!selectedJob,
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      active: { className: "bg-green-100 text-green-800", label: "Ativo" },
      inactive: { className: "bg-gray-100 text-gray-800", label: "Inativo" },
      error: { className: "bg-red-100 text-red-800", label: "Erro" },
    };
    return variants[status] || variants.inactive;
  };

  const getExecutionStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      success: { className: "bg-green-100 text-green-800", label: "Sucesso" },
      failed: { className: "bg-red-100 text-red-800", label: "Falhou" },
      running: { className: "bg-blue-100 text-blue-800", label: "Executando" },
      cancelled: { className: "bg-gray-100 text-gray-800", label: "Cancelado" },
    };
    return variants[status] || variants.cancelled;
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return "N/A";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Monitor de Tarefas Automáticas</h1>
          <p className="text-muted-foreground mt-2">
            Painel de monitoramento de cron jobs e tarefas SGSO
          </p>
        </div>
        <Button onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Ativos</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.active_jobs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              de {stats?.total_jobs || 0} jobs totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Execuções Hoje</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.total_executions_today || 0}
            </div>
            <p className="text-xs text-muted-foreground">execuções realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.success_rate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">de todas as execuções</p>
          </CardContent>
        </Card>
      </div>

      {/* Cron Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Tarefas Agendadas</CardTitle>
          <CardDescription>
            Lista de todos os cron jobs configurados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando tarefas...</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma tarefa configurada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Job</th>
                    <th className="text-left p-3">Última Execução</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Taxa de Sucesso</th>
                    <th className="text-left p-3">Tempo Médio</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    const successRate = job.execution_count > 0
                      ? ((job.success_count / job.execution_count) * 100).toFixed(1)
                      : "0.0";
                    const statusBadge = getStatusBadge(job.status);

                    return (
                      <tr
                        key={job.id}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{job.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {job.description}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Schedule: {job.schedule}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          {job.last_run ? (
                            <div className="text-sm">
                              {new Date(job.last_run).toLocaleString("pt-BR")}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Nunca</span>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge className={statusBadge.className}>
                            {statusBadge.label}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{successRate}%</span>
                            <span className="text-xs text-muted-foreground">
                              ({job.success_count}/{job.execution_count})
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          {formatDuration(job.average_duration_ms)}
                        </td>
                        <td className="p-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedJob(job.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Logs
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Execution History */}
      {selectedJob && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Histórico de Execuções</CardTitle>
                <CardDescription>
                  Últimas 50 execuções do job selecionado
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => setSelectedJob(null)}>
                Fechar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {executions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma execução registrada
              </div>
            ) : (
              <div className="space-y-2">
                {executions.map((execution) => {
                  const statusBadge = getExecutionStatusBadge(execution.status);
                  return (
                    <div
                      key={execution.id}
                      className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={statusBadge.className}>
                              {statusBadge.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(execution.started_at).toLocaleString("pt-BR")}
                            </span>
                          </div>
                          {execution.duration_ms && (
                            <p className="text-sm">
                              Duração: {formatDuration(execution.duration_ms)}
                            </p>
                          )}
                          {execution.error_message && (
                            <p className="text-sm text-red-600 mt-2">
                              Erro: {execution.error_message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
