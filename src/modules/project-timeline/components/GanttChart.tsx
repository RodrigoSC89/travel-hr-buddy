import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, addDays } from "date-fns";
import { Calendar, Plus, Link as LinkIcon } from "lucide-react";

interface Task {
  id: string;
  task_name: string;
  project_name: string;
  start_date: string;
  end_date: string;
  status: string;
  priority: string;
  progress: number;
  dependencies?: string[];
}

export const GanttChart = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    project_name: "",
    task_name: "",
    start_date: "",
    end_date: "",
    priority: "medium",
    description: ""
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Timeline Gantt</h2>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visão Geral do Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <div className="min-w-[800px]">
              {tasks.map((task) => (
                <div key={task.id} className="mb-4 flex items-center gap-4">
                  <div className="w-48 shrink-0">
                    <p className="font-medium text-sm">{task.task_name}</p>
                    <p className="text-xs text-muted-foreground">{task.project_name}</p>
                  </div>
                  <div className="relative flex-1 h-10 bg-muted rounded">
                    <div
                      className={`absolute h-full ${getTaskBarColor(task.status)} rounded flex items-center justify-between px-2`}
                      style={{
                        left: `${calculatePosition(task.start_date)}px`,
                        width: `${calculateWidth(task.start_date, task.end_date)}px`
                      }}
                    >
                      <span className="text-xs text-white font-medium">
                        {task.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="w-32 shrink-0 text-sm">
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      value={task.progress}
                      onChange={(e) => updateTaskProgress(task.id, parseInt(e.target.value))}
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
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
                onChange={(e) => setNewTask({...newTask, project_name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label>Nome da Tarefa</Label>
              <Input
                value={newTask.task_name}
                onChange={(e) => setNewTask({...newTask, task_name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Data Início</Label>
                <Input
                  type="date"
                  value={newTask.start_date}
                  onChange={(e) => setNewTask({...newTask, start_date: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Data Fim</Label>
                <Input
                  type="date"
                  value={newTask.end_date}
                  onChange={(e) => setNewTask({...newTask, end_date: e.target.value})}
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
          </div>
          <Button onClick={createTask} className="w-full">Criar Tarefa</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
