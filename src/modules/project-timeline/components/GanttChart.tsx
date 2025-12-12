import { useCallback, useMemo, useEffect, useState } from "react";;
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, addDays, parseISO } from "date-fns";
import { Calendar, Plus, Link as LinkIcon, Edit, Trash2, ArrowRight } from "lucide-react";

interface Task {
  id: string;
  task_name: string;
  project_name: string;
  start_date: string;
  end_date: string;
  status: string;
  priority: string;
  progress: number;
  parent_task_id?: string | null;
  dependencies?: string[];
  subtasks?: Task[];
}

export const GanttChart = memo(() => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dependencyMode, setDependencyMode] = useState(false);
  const [dependencySource, setDependencySource] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    project_name: "",
    task_name: "",
    start_date: "",
    end_date: "",
    priority: "medium",
    description: "",
    parent_task_id: null as string | null
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("project_tasks")
      .select("*")
      .order("start_date");

    if (error) {
      toast({ title: "Erro ao carregar tarefas", variant: "destructive" });
      return;
    }

    setTasks(data || []);
  };

  const createTask = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: orgData } = await supabase
      .from("organization_users")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!orgData) return;

    const { error } = await supabase
      .from("project_tasks")
      .insert({
        ...newTask,
        project_id: crypto.randomUUID(),
        organization_id: orgData.organization_id,
        created_by: user.id
      });

    if (error) {
      toast({ title: "Erro ao criar tarefa", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Tarefa criada com sucesso!" });
    setIsCreating(false);
    fetchTasks();
  };

  const updateTaskProgress = async (taskId: string, progress: number) => {
    const status = progress === 100 ? "completed" : progress > 0 ? "in_progress" : "pending";
    
    const { error } = await supabase
      .from("project_tasks")
      .update({ progress, status })
      .eq("id", taskId);

    if (error) {
      toast({ title: "Erro ao atualizar progresso", variant: "destructive" });
      return;
    }

    fetchTasks();
  };

  const getTaskBarColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-gray-400",
      in_progress: "bg-blue-500",
      completed: "bg-green-500",
      blocked: "bg-red-500",
      cancelled: "bg-gray-300"
    };
    return colors[status] || "bg-gray-400";
  };

  const calculatePosition = (startDate: string) => {
    const earliest = tasks.length > 0 
      ? new Date(Math.min(...tasks.map(t => new Date(t.start_date).getTime())))
      : new Date();
    const days = differenceInDays(new Date(startDate), earliest);
    return (days * 40);
  };

  const calculateWidth = (startDate: string, endDate: string) => {
    const days = Math.max(1, differenceInDays(new Date(endDate), new Date(startDate)));
    return (days * 40);
  };

  // Enhanced drag & drop functionality
  const handleDragStart = (task: Task) => {
    setIsDragging(true);
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedTask(null);
  };

  const handleDrop = async (newStartDate: Date) => {
    if (!draggedTask) return;

    const duration = differenceInDays(new Date(draggedTask.end_date), new Date(draggedTask.start_date));
    const newEndDate = addDays(newStartDate, duration);

    const { error } = await supabase
      .from("project_tasks")
      .update({
        start_date: format(newStartDate, "yyyy-MM-dd"),
        end_date: format(newEndDate, "yyyy-MM-dd")
      })
      .eq("id", draggedTask.id);

    if (error) {
      toast({ title: "Erro ao atualizar tarefa", variant: "destructive" });
      return;
    }

    toast({ title: "Tarefa reposicionada com sucesso!" });
    fetchTasks();
  };

  // Inline editing
  const handleInlineEdit = async (taskId: string, field: string, value: string | number) => {
    const { error } = await supabase
      .from("project_tasks")
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq("id", taskId);

    if (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
      return;
    }

    fetchTasks();
  };

  // Dependencies management
  const handleDependencyClick = (task: Task) => {
    if (!dependencyMode) {
      setDependencyMode(true);
      setDependencySource(task);
      toast({ title: "Selecione a tarefa dependente" });
    } else if (dependencySource && dependencySource.id !== task.id) {
      createDependency(dependencySource.id, task.id);
      setDependencyMode(false);
      setDependencySource(null);
    }
  };

  const createDependency = async (sourceId: string, targetId: string) => {
    const { error } = await supabase
      .from("project_dependencies")
      .insert({
        task_id: targetId,
        depends_on_task_id: sourceId,
        dependency_type: "finish_to_start"
      });

    if (error) {
      toast({ title: "Erro ao criar dependência", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Dependência criada com sucesso!" });
    fetchTasks();
  };

  const deleteDependency = async (sourceId: string, targetId: string) => {
    const { error } = await supabase
      .from("project_dependencies")
      .delete()
      .eq("task_id", targetId)
      .eq("depends_on_task_id", sourceId);

    if (error) {
      toast({ title: "Erro ao remover dependência", variant: "destructive" });
      return;
    }

    toast({ title: "Dependência removida!" });
    fetchTasks();
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from("project_tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      toast({ title: "Erro ao deletar tarefa", variant: "destructive" });
      return;
    }

    toast({ title: "Tarefa deletada com sucesso!" });
    fetchTasks();
  };

  // Organize tasks in hierarchy (up to 3 levels)
  const organizeTaskHierarchy = (allTasks: Task[]): Task[] => {
    const taskMap = new Map<string, Task>();
    const rootTasks: Task[] = [];

    // First pass: create map
    allTasks.forEach(task => {
      taskMap.set(task.id, { ...task, subtasks: [] });
    });

    // Second pass: build hierarchy
    allTasks.forEach(task => {
      const taskWithSubtasks = taskMap.get(task.id)!;
      if (task.parent_task_id) {
        const parent = taskMap.get(task.parent_task_id);
        if (parent) {
          parent.subtasks = parent.subtasks || [];
          parent.subtasks.push(taskWithSubtasks);
        }
      } else {
        rootTasks.push(taskWithSubtasks);
      };
    });

    return rootTasks;
  };

  const renderTaskRow = (task: Task, level: number = 0) => {
    const indent = level * 20;
    
    return (
      <div key={task.id}>
        <div 
          className={`mb-2 flex items-center gap-4 group hover:bg-accent/50 p-2 rounded ${
            dependencyMode && dependencySource?.id === task.id ? "bg-blue-100" : ""
          }`}
          draggable
          onDragStart={() => handleDragStart(task}
          onDragEnd={handleDragEnd}
        >
          <div className="w-56 shrink-0" style={{ paddingLeft: `${indent}px` }}>
            <Input
              value={task.task_name}
              onChange={handleChange}
              className="font-medium text-sm border-0 p-1 h-7 bg-transparent hover:bg-white focus:bg-white"
            />
            <p className="text-xs text-muted-foreground">{task.project_name}</p>
            <Badge variant={task.priority === "critical" ? "destructive" : task.priority === "high" ? "default" : "secondary"} className="text-xs mt-1">
              {task.priority}
            </Badge>
          </div>
          
          <div className="relative flex-1 h-12 bg-muted rounded">
            <div
              className={`absolute h-full ${getTaskBarColor(task.status)} rounded flex items-center justify-between px-2 cursor-move`}
              style={{
                left: `${calculatePosition(task.start_date)}px`,
                width: `${calculateWidth(task.start_date, task.end_date)}px`,
                minWidth: "40px"
              }}
            >
              <span className="text-xs text-white font-medium">
                {task.progress}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Input
              type="date"
              value={task.start_date}
              onChange={handleChange}
              className="w-32 h-8 text-xs"
            />
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={task.end_date}
              onChange={handleChange}
              className="w-32 h-8 text-xs"
            />
          </div>

          <div className="w-32 shrink-0">
            <Input
              type="range"
              min="0"
              max="100"
              value={task.progress}
              onChange={handleChange}
              className="h-2"
            />
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => handlehandleDependencyClick}
              className="h-7 w-7 p-0"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={handleSetEditingTask}
              className="h-7 w-7 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => handledeleteTask}
              className="h-7 w-7 p-0 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Render subtasks */}
        {task.subtasks && task.subtasks.length > 0 && level < 2 && (
          <div className="ml-4">
            {task.subtasks.map(subtask => renderTaskRow(subtask, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Timeline Gantt Completo</h2>
        </div>
        <div className="flex gap-2">
          {dependencyMode && (
            <Button variant="outline" onClick={() => {
              setDependencyMode(false);
              setDependencySource(null);
            }}>
              Cancelar Dependência
            </Button>
          )}
          <Button onClick={handleSetIsCreating}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gantt com Drag & Drop e Dependências</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            <p>✨ Arraste tarefas para reposicionar • ✏️ Edição inline de nome e datas</p>
            <p>🔗 Clique no ícone de link para criar dependências • 📊 Até 3 níveis de profundidade</p>
          </div>
          <div className="relative overflow-x-auto">
            <div className="min-w-[1000px]">
              {organizeTaskHierarchy(tasks).map(task => renderTaskRow(task, 0))}
              {tasks.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma tarefa criada. Clique em "Nova Tarefa" para começar.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome do Projeto</Label>
              <Input
                value={newTask.project_name}
                onChange={handleChange})}
              />
            </div>
            <div className="grid gap-2">
              <Label>Nome da Tarefa</Label>
              <Input
                value={newTask.task_name}
                onChange={handleChange})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Data Início</Label>
                <Input
                  type="date"
                  value={newTask.start_date}
                  onChange={handleChange})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Data Fim</Label>
                <Input
                  type="date"
                  value={newTask.end_date}
                  onChange={handleChange})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Prioridade</Label>
              <Select value={newTask.priority} onValueChange={(v) => setNewTask({...newTask, priority: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Tarefa Pai (Opcional)</Label>
              <Select value={newTask.parent_task_id || "none"} onValueChange={(v) => setNewTask({...newTask, parent_task_id: v === "none" ? null : v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sem tarefa pai" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem tarefa pai</SelectItem>
                  {tasks.map(task => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.project_name} - {task.task_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={createTask} className="w-full">Criar Tarefa</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
