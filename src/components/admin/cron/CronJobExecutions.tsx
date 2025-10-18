import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CronJobExecution } from "@/types/cron";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export const CronJobExecutions = () => {
  const { data: executions, isLoading } = useQuery({
    queryKey: ["cron-executions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cron_job_executions")
        .select("*, cron_jobs(name)")
        .order("started_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as (CronJobExecution & { cron_jobs: { name: string } })[];
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "OK":
      return (
        <Badge variant="default" className="bg-green-600">
          <CheckCircle className="mr-1 h-3 w-3" />
            Sucesso
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
            Em execução
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
            Carregando histórico de execuções...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Execuções (últimas 50)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {executions && executions.length > 0 ? (
            executions.map((execution) => (
              <div 
                key={execution.id} 
                className="border rounded-lg p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{execution.cron_jobs?.name}</span>
                      {getStatusBadge(execution.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Iniciado: {format(new Date(execution.started_at), "dd/MM/yyyy HH:mm:ss")}
                    </div>
                    {execution.completed_at && (
                      <div className="text-sm text-muted-foreground">
                        Concluído: {format(new Date(execution.completed_at), "dd/MM/yyyy HH:mm:ss")}
                      </div>
                    )}
                    {execution.duration_ms && (
                      <div className="text-sm text-muted-foreground">
                        Duração: {execution.duration_ms}ms
                      </div>
                    )}
                  </div>
                </div>
                {execution.error_message && (
                  <div className="mt-2 pt-2 border-t">
                    <div className="text-sm text-red-600 font-medium">Erro:</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {execution.error_message}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma execução registrada
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
