import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CronJob } from "@/types/cron";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";

export const CronJobsPanel = () => {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["cron-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cron_jobs")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as CronJob[];
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "OK":
      return (
        <Badge variant="default" className="bg-green-600">
          <CheckCircle className="mr-1 h-3 w-3" />
            OK
        </Badge>
      );
    case "FAILED":
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
            Falhou
        </Badge>
      );
    case "RUNNING":
      return (
        <Badge variant="secondary">
          <Clock className="mr-1 h-3 w-3" />
            Executando
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Carregando tarefas agendadas...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📆 Tarefas Agendadas (Cron)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Job</th>
                <th className="text-left p-2">Última Execução</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Taxa de Sucesso</th>
                <th className="text-left p-2">Logs</th>
              </tr>
            </thead>
            <tbody>
              {jobs && jobs.length > 0 ? (
                jobs.map((job) => (
                  <tr key={job.id} className="border-b hover:bg-accent/50">
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{job.name}</div>
                        {job.description && (
                          <div className="text-xs text-muted-foreground">
                            {job.description}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          Schedule: {job.schedule}
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      {job.last_run ? (
                        <div className="text-sm">
                          {format(new Date(job.last_run), "dd/MM/yyyy HH:mm")}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Nunca executado</span>
                      )}
                    </td>
                    <td className="p-2">{getStatusBadge(job.status)}</td>
                    <td className="p-2">
                      <div className="text-sm">
                        {job.execution_count > 0 ? (
                          <>
                            {job.success_count} / {job.execution_count}
                            <div className="text-xs text-muted-foreground">
                              {Math.round((job.success_count / job.execution_count) * 100)}%
                            </div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      {job.log_url ? (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={job.log_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhuma tarefa agendada encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
