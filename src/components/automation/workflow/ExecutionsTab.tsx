import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Activity, XCircle, Pause, Clock } from "lucide-react";
import { WorkflowExecution, WorkflowItem } from "./types";

const getExecutionStatusIcon = (status: string) => {
  switch (status) {
    case "completed": return <CheckCircle className="w-4 h-4 text-success" />;
    case "running": return <Activity className="w-4 h-4 text-info animate-pulse" />;
    case "failed": return <XCircle className="w-4 h-4 text-destructive" />;
    case "cancelled": return <Pause className="w-4 h-4 text-muted-foreground" />;
    default: return <Clock className="w-4 h-4 text-warning" />;
  }
};

interface ExecutionsTabProps {
  executions: WorkflowExecution[];
  workflows: WorkflowItem[];
}

export const ExecutionsTab: React.FC<ExecutionsTabProps> = ({ executions, workflows }) => (
  <Card>
    <CardHeader>
      <CardTitle>Execuções Recentes</CardTitle>
      <CardDescription>Histórico de execuções de workflows em tempo real</CardDescription>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {executions.map((execution) => {
            const workflow = workflows.find(w => w.id === execution.workflowId);
            return (
              <div key={execution.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2">
                  {getExecutionStatusIcon(execution.status)}
                  <div>
                    <h4 className="font-medium">{workflow?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {execution.status === "running" ? "Em execução" :
                        execution.status === "completed" ? "Concluído" :
                          execution.status === "failed" ? "Falhou" : "Cancelado"}
                    </p>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso</span>
                    <span>
                      {execution.steps.filter(s => s.status === "completed").length}/{execution.steps.length} etapas
                    </span>
                  </div>
                  <Progress
                    value={(execution.steps.filter(s => s.status === "completed").length / execution.steps.length) * 100}
                    className="h-2"
                  />
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium">{execution.startedAt.toLocaleTimeString()}</div>
                  <div className="text-muted-foreground">
                    {execution.duration ? `${execution.duration}s` : "Em andamento"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
);
