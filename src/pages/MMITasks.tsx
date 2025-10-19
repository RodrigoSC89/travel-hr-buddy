import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, FileText, PlayCircle, Wrench } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import type { MMITask } from "@/types/mmi";
import { fetchTasks, updateTaskStatus, createWorkOrderFromTask } from "@/services/mmi/taskService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MMITasksPage() {
  const [tasks, setTasks] = useState<MMITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<MMITask | null>(null);
  const [creatingOS, setCreatingOS] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await fetchTasks();
      setTasks(data);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("Erro ao carregar tarefas");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "high":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "medium":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "low":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "concluido":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "em_andamento":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "pendente":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "cancelado":
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const handleCreateOS = async (task: MMITask) => {
    try {
      setCreatingOS(true);
      const result = await createWorkOrderFromTask(task.id);
      
      if (result) {
        toast.success(`Ordem de Serviço ${result.os_number} criada com sucesso!`);
        loadTasks(); // Reload to update status
        setSelectedTask(null);
      } else {
        toast.error("Erro ao criar Ordem de Serviço");
      }
    } catch (error) {
      console.error("Error creating OS:", error);
      toast.error("Erro ao criar Ordem de Serviço");
    } finally {
      setCreatingOS(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: "pendente" | "em_andamento" | "concluido" | "cancelado") => {
    try {
      const success = await updateTaskStatus(taskId, newStatus);
      if (success) {
        toast.success("Status atualizado com sucesso");
        loadTasks();
      } else {
        toast.error("Erro ao atualizar status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando tarefas...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tarefas de Manutenção</h1>
          <p className="text-muted-foreground mt-1">
            Tarefas geradas automaticamente pelos forecasts de IA
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nenhuma tarefa encontrada. As tarefas são criadas automaticamente quando novos forecasts são gerados.
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold">{task.title}</h3>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(task.status)}>
                        {task.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>

                    {task.vessel && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Wrench className="w-4 h-4" />
                        <span>{task.vessel.name}</span>
                      </div>
                    )}

                    {task.forecast_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Previsão: {format(new Date(task.forecast_date), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTask(task)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>

                      {task.status === "pendente" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(task.id, "em_andamento")}
                          >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Iniciar
                          </Button>

                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleCreateOS(task)}
                            disabled={creatingOS}
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Criar OS
                          </Button>
                        </>
                      )}

                      {task.status === "em_andamento" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStatusChange(task.id, "concluido")}
                        >
                          Concluir
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Task Details Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
            <DialogDescription>Detalhes da tarefa de manutenção</DialogDescription>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Descrição:</h4>
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                  {selectedTask.description}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Prioridade:</h4>
                  <Badge className={getPriorityColor(selectedTask.priority)}>
                    {selectedTask.priority.toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Status:</h4>
                  <Badge className={getStatusColor(selectedTask.status)}>
                    {selectedTask.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>

                {selectedTask.forecast_date && (
                  <div>
                    <h4 className="font-semibold mb-1">Data Prevista:</h4>
                    <p className="text-sm">
                      {format(new Date(selectedTask.forecast_date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}

                {selectedTask.vessel && (
                  <div>
                    <h4 className="font-semibold mb-1">Embarcação:</h4>
                    <p className="text-sm">{selectedTask.vessel.name}</p>
                  </div>
                )}
              </div>

              {selectedTask.ai_reasoning && (
                <div>
                  <h4 className="font-semibold mb-2">Justificativa IA:</h4>
                  <p className="text-sm bg-muted p-4 rounded-lg">
                    {selectedTask.ai_reasoning}
                  </p>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTask(null)}
                >
                  Fechar
                </Button>
                {selectedTask.status === "pendente" && (
                  <Button
                    onClick={() => {
                      handleCreateOS(selectedTask);
                    }}
                    disabled={creatingOS}
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Criar Ordem de Serviço
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
