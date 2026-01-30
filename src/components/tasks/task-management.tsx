import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTaskManagementData, Task } from "@/hooks/useTaskManagementData";
import { TaskKanbanBoard } from "./TaskKanbanBoard";
import { TaskCalendarView } from "./TaskCalendarView";
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Calendar,
  User,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Settings,
  LayoutGrid,
  Loader2
} from "lucide-react";

export const TaskManagement: React.FC = () => {
  const { tasks, stats, isLoading, createTask, updateTask } = useTaskManagementData();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  // Form state for new task
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    assigned_to_name: "",
    due_date: "",
    vessel_id: ""
  });

  const handleAddTask = async () => {
    try {
      await createTask.mutateAsync({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        assigned_to_name: newTask.assigned_to_name,
        due_date: newTask.due_date || undefined,
        vessel_id: newTask.vessel_id || undefined,
      });
      
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        assigned_to_name: "",
        due_date: "",
        vessel_id: ""
      });
      setShowAddDialog(false);
      
      toast({
        title: "Tarefa Criada",
        description: `${newTask.title} foi criada com sucesso`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a tarefa",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task["status"]) => {
    try {
      await updateTask.mutateAsync({ id: taskId, status: newStatus });
      
      toast({
        title: "Status Atualizado",
        description: "Status da tarefa foi atualizado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "high": return "bg-red-500 text-azure-50";
    case "medium": return "bg-yellow-500 text-azure-50";
    case "low": return "bg-green-500 text-azure-50";
    default: return "bg-gray-500 text-azure-50";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
    case "high": return "Alta";
    case "medium": return "Média";
    case "low": return "Baixa";
    default: return "Normal";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "pending": return "bg-gray-500 text-azure-50";
    case "in_progress": return "bg-blue-500 text-azure-50";
    case "completed": return "bg-green-500 text-azure-50";
    case "cancelled": return "bg-red-500 text-azure-50";
    default: return "bg-gray-500 text-azure-50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
    case "pending": return "Pendente";
    case "in_progress": return "Em Andamento";
    case "completed": return "Concluída";
    case "cancelled": return "Cancelada";
    default: return "Desconhecido";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "pending": return <Clock className="h-4 w-4" />;
    case "in_progress": return <Settings className="h-4 w-4" />;
    case "completed": return <CheckCircle2 className="h-4 w-4" />;
    case "cancelled": return <AlertTriangle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assigned_to_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const tasksByStatus = {
    pending: tasks.filter(t => t.status === "pending").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
    overdue: stats?.overdue || 0
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando tarefas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            Gestão de Tarefas
          </h2>
          <p className="text-muted-foreground">
            Organize e acompanhe todas as tarefas da operação
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título da Tarefa</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Ex: Inspeção de Segurança"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Descreva os detalhes da tarefa..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select 
                    value={newTask.priority} 
                    onValueChange={(value: "low" | "medium" | "high") => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assigned">Responsável</Label>
                  <Input
                    id="assigned"
                    value={newTask.assigned_to_name}
                    onChange={(e) => setNewTask({ ...newTask, assigned_to_name: e.target.value })}
                    placeholder="Nome do responsável"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="due_date">Data de Vencimento</Label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                />
              </div>
              {/* Vessel ID pode ser adicionado futuramente com dados reais */}
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddTask} className="flex-1">
                Criar Tarefa
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-3xl font-bold">{tasksByStatus.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-3xl font-bold text-blue-600">{tasksByStatus.in_progress}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                <p className="text-3xl font-bold text-green-600">{tasksByStatus.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Atrasadas</p>
                <p className="text-3xl font-bold text-red-600">{tasksByStatus.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="list" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="list">Lista de Tarefas</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="list" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tarefas ({filteredTasks.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredTasks.map((task) => (
                      <div 
                        key={task.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedTask?.id === task.id ? "border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{task.title}</h3>
                              <Badge className={getPriorityColor(task.priority)} variant="secondary">
                                {getPriorityText(task.priority)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {task.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {task.assigned_to_name || "Não atribuído"}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {task.due_date ? new Date(task.due_date).toLocaleDateString("pt-BR") : "Sem prazo"}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getStatusColor(task.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(task.status)}
                                {getStatusText(task.status)}
                              </span>
                            </Badge>
                            {task.status !== "completed" && task.status !== "cancelled" && (
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateTaskStatus(task.id, task.status === "pending" ? "in_progress" : "completed");
                                  }}
                                >
                                  {task.status === "pending" ? "Iniciar" : "Concluir"}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Task Details */}
            <div>
              {selectedTask ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckSquare className="h-5 w-5" />
                      Detalhes da Tarefa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">{selectedTask.title}</h3>
                      <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                    </div>

                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(selectedTask.priority)}>
                        {getPriorityText(selectedTask.priority)}
                      </Badge>
                      <Badge className={getStatusColor(selectedTask.status)}>
                        {getStatusText(selectedTask.status)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Responsável:</span>
                        <span className="text-sm font-medium">{selectedTask.assigned_to_name || "Não atribuído"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Criado em:</span>
                        <span className="text-sm font-medium">
                          {selectedTask.created_at ? new Date(selectedTask.created_at).toLocaleDateString("pt-BR") : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Vencimento:</span>
                        <span className="text-sm font-medium">
                          {selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString("pt-BR") : "Sem prazo"}
                        </span>
                      </div>
                      {selectedTask.vessel_name && (
                        <div className="flex justify-between">
                          <span className="text-sm">Embarcação:</span>
                          <span className="text-sm font-medium">{selectedTask.vessel_name}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 space-y-2">
                      {selectedTask.status === "pending" && (
                        <Button 
                          className="w-full"
                          onClick={() => handleUpdateTaskStatus(selectedTask.id, "in_progress")}
                        >
                          Iniciar Tarefa
                        </Button>
                      )}
                      {selectedTask.status === "in_progress" && (
                        <Button 
                          className="w-full"
                          onClick={() => handleUpdateTaskStatus(selectedTask.id, "completed")}
                        >
                          Marcar como Concluída
                        </Button>
                      )}
                      <Button variant="outline" className="w-full">
                        Editar Tarefa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Selecione uma tarefa para ver os detalhes
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="kanban">
          <TaskKanbanBoard 
            tasks={filteredTasks}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onSelectTask={setSelectedTask}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <TaskCalendarView 
            tasks={tasks}
            onSelectTask={setSelectedTask}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};