/**
 * TaskKanbanBoard - Visualização Kanban de Tarefas
 * Implementação completa com drag-and-drop
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Clock,
  User,
  Ship,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  GripVertical,
  Calendar
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  assigned_to?: string;
  created_by: string;
  due_date?: string;
  completed_at?: string;
  tags: string[];
  related_vessel?: string;
  related_crew?: string;
  created_at: string;
}

interface TaskKanbanBoardProps {
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, newStatus: Task["status"]) => void;
  onSelectTask: (task: Task) => void;
}

const COLUMNS: { id: Task["status"]; title: string; color: string; icon: React.ReactNode }[] = [
  { id: "pending", title: "Pendentes", color: "bg-yellow-500", icon: <Clock className="h-4 w-4" /> },
  { id: "in_progress", title: "Em Andamento", color: "bg-blue-500", icon: <Play className="h-4 w-4" /> },
  { id: "completed", title: "Concluídas", color: "bg-green-500", icon: <CheckCircle2 className="h-4 w-4" /> },
  { id: "cancelled", title: "Canceladas", color: "bg-gray-500", icon: <Pause className="h-4 w-4" /> },
];

const priorityColors = {
  low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const priorityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

export const TaskKanbanBoard: React.FC<TaskKanbanBoardProps> = ({
  tasks,
  onUpdateTaskStatus,
  onSelectTask,
}) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: Task["status"]) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedTask && draggedTask.status !== columnId) {
      onUpdateTaskStatus(draggedTask.id, columnId);
      toast.success(`Tarefa movida para "${COLUMNS.find(c => c.id === columnId)?.title}"`);
    }
    setDraggedTask(null);
  };

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter(task => task.status === status);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === "completed" || task.status === "cancelled") return false;
    return new Date(task.due_date) < new Date();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        const isOver = dragOverColumn === column.id;
        
        return (
          <Card 
            key={column.id}
            className={`transition-all duration-200 ${
              isOver ? "ring-2 ring-primary bg-primary/5" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md text-white ${column.color}`}>
                    {column.icon}
                  </div>
                  {column.title}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {columnTasks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[500px] pr-2">
                <div className="space-y-3">
                  {columnTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                      Nenhuma tarefa
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onClick={() => onSelectTask(task)}
                        className={`p-3 rounded-lg border bg-card cursor-pointer hover:shadow-md transition-all ${
                          draggedTask?.id === task.id ? "opacity-50" : ""
                        } ${isOverdue(task) ? "border-red-300 dark:border-red-700" : ""}`}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 cursor-grab" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                          </div>
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 ml-6">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-1.5 mb-2 ml-6">
                          <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                            {priorityLabels[task.priority]}
                          </Badge>
                          {isOverdue(task) && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Atrasada
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground ml-6">
                          <div className="flex items-center gap-2">
                            {task.assigned_to && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {task.assigned_to.split(" ")[0]}
                              </span>
                            )}
                            {task.related_vessel && (
                              <span className="flex items-center gap-1">
                                <Ship className="h-3 w-3" />
                                {task.related_vessel.replace("MV ", "")}
                              </span>
                            )}
                          </div>
                          {task.due_date && (
                            <span className={`flex items-center gap-1 ${isOverdue(task) ? "text-red-500" : ""}`}>
                              <Calendar className="h-3 w-3" />
                              {formatDate(task.due_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
