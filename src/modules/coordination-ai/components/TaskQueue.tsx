/**
 * PATCH 471 - Task Queue Component
 * Displays and manages the task queue for agent coordination
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ListTodo,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Plus,
} from "lucide-react";
import { coordinationService, type Task, type TaskPriority } from "../services/coordinationService";
import { toast } from "sonner";

export const TaskQueue: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadTasks = async () => {
    try {
      const taskList = await coordinationService.getRecentTasks(30);
      setTasks(taskList);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  };

  const handleAddSampleTask = async () => {
    setIsAdding(true);
    try {
      await coordinationService.simulateCoordination();
      toast.success("Tarefas adicionadas à fila");
      await loadTasks();
    } catch (error) {
      console.error("Failed to add task:", error);
      toast.error("Falha ao adicionar tarefa");
    } finally {
      setIsAdding(false);
    }
  };

  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
    case "critical":
      return "bg-red-500";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
    case "completed":
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case "failed":
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case "in_progress":
      return <Play className="w-4 h-4 text-blue-500 animate-pulse" />;
    case "assigned":
      return <Clock className="w-4 h-4 text-yellow-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const statusCounts = {
    pending: tasks.filter((t) => t.status === "pending").length,
    in_progress: tasks.filter((t) => t.status === "in_progress" || t.status === "assigned").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    failed: tasks.filter((t) => t.status === "failed").length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-primary" />
            Fila de Tarefas
          </CardTitle>
          <Button
            size="sm"
            onClick={handleAddSampleTask}
            disabled={isAdding}
          >
            <Plus className="w-4 h-4 mr-2" />
            Simular Coordenação
          </Button>
        </div>
        <div className="flex gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-muted-foreground">Pendente: {statusCounts.pending}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">Em progresso: {statusCounts.in_progress}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-muted-foreground">Completas: {statusCounts.completed}</span>
          </div>
          {statusCounts.failed > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-muted-foreground">Falhas: {statusCounts.failed}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ListTodo className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma tarefa na fila</p>
              <p className="text-sm mt-1">Clique em "Simular Coordenação" para adicionar tarefas</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(task.status)}
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                        {task.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {task.description}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(task.createdAt).toLocaleTimeString()}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>Status:</span>
                    <Badge variant="outline" className="text-xs">
                      {task.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                  {task.assignedTo && (
                    <div className="flex items-center gap-1">
                      <span>Agente:</span>
                      <Badge variant="outline" className="text-xs">
                        {task.agentType?.replace("-", " ").toUpperCase()}
                      </Badge>
                    </div>
                  )}
                  {task.completedAt && (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      <span>
                        Completa em{" "}
                        {new Date(task.completedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>

                {task.errorMessage && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-500">
                    Erro: {task.errorMessage}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskQueue;
