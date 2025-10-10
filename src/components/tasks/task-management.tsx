import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
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

export const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Form state for new task
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    assigned_to: "",
    due_date: "",
    tags: [] as string[],
    related_vessel: "",
    related_crew: "",
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);

      // Using mock data for now - database integration will be added later
      // Mock data
      const mockTasks: Task[] = [
        {
          id: "1",
          title: "Inspeção de Segurança - MV Atlântico",
          description: "Realizar inspeção completa dos equipamentos de segurança",
          priority: "high",
          status: "pending",
          assigned_to: "Carlos Silva",
          created_by: "Admin",
          due_date: "2024-01-20T10:00:00Z",
          tags: ["segurança", "inspeção"],
          related_vessel: "MV Atlântico",
          created_at: "2024-01-10T09:00:00Z",
        },
        {
          id: "2",
          title: "Manutenção Preventiva - Motor Principal",
          description: "Verificar óleo, filtros e componentes do motor principal",
          priority: "medium",
          status: "in_progress",
          assigned_to: "João Santos",
          created_by: "Admin",
          due_date: "2024-01-18T14:00:00Z",
          tags: ["manutenção", "motor"],
          related_vessel: "MV Pacífico",
          created_at: "2024-01-08T11:00:00Z",
        },
        {
          id: "3",
          title: "Renovação de Certificados STCW",
          description: "Verificar e renovar certificados STCW da tripulação",
          priority: "high",
          status: "pending",
          assigned_to: "Maria Oliveira",
          created_by: "RH",
          due_date: "2024-01-25T16:00:00Z",
          tags: ["certificação", "rh"],
          related_crew: "Ana Costa",
          created_at: "2024-01-05T08:00:00Z",
        },
        {
          id: "4",
          title: "Abastecimento - Porto de Santos",
          description: "Coordenar abastecimento de combustível e água potável",
          priority: "medium",
          status: "completed",
          assigned_to: "Pedro Lima",
          created_by: "Operações",
          due_date: "2024-01-15T12:00:00Z",
          completed_at: "2024-01-15T11:30:00Z",
          tags: ["abastecimento", "porto"],
          related_vessel: "MV Atlântico",
          created_at: "2024-01-12T07:00:00Z",
        },
      ];

      setTasks(mockTasks);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async () => {
    try {
      const task: Task = {
        id: Math.random().toString(),
        ...newTask,
        status: "pending",
        created_by: "Current User",
        created_at: new Date().toISOString(),
      };

      setTasks([...tasks, task]);
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        assigned_to: "",
        due_date: "",
        tags: [],
        related_vessel: "",
        related_crew: "",
      });
      setShowAddDialog(false);

      toast({
        title: "Tarefa Criada",
        description: `${task.title} foi criada com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a tarefa",
        variant: "destructive",
      });
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: Task["status"]) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              completed_at: newStatus === "completed" ? new Date().toISOString() : undefined,
            }
          : task
      )
    );

    toast({
      title: "Status Atualizado",
      description: "Status da tarefa foi atualizado com sucesso",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-azure-50";
      case "medium":
        return "bg-yellow-500 text-azure-50";
      case "low":
        return "bg-green-500 text-azure-50";
      default:
        return "bg-gray-500 text-azure-50";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return "Normal";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-500 text-azure-50";
      case "in_progress":
        return "bg-blue-500 text-azure-50";
      case "completed":
        return "bg-green-500 text-azure-50";
      case "cancelled":
        return "bg-red-500 text-azure-50";
      default:
        return "bg-gray-500 text-azure-50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "in_progress":
        return "Em Andamento";
      case "completed":
        return "Concluída";
      case "cancelled":
        return "Cancelada";
      default:
        return "Desconhecido";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <Settings className="h-4 w-4" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "cancelled":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assigned_to?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const tasksByStatus = {
    pending: tasks.filter(t => t.status === "pending").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
    overdue: tasks.filter(
      t => t.status !== "completed" && t.due_date && new Date(t.due_date) < new Date()
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            Gestão de Tarefas
          </h2>
          <p className="text-muted-foreground">Organize e acompanhe todas as tarefas da operação</p>
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
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Ex: Inspeção de Segurança"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Descreva os detalhes da tarefa..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setNewTask({ ...newTask, priority: value })
                    }
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
                    value={newTask.assigned_to}
                    onChange={e => setNewTask({ ...newTask, assigned_to: e.target.value })}
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
                  onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vessel">Embarcação Relacionada</Label>
                  <Select
                    value={newTask.related_vessel}
                    onValueChange={value => setNewTask({ ...newTask, related_vessel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a embarcação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MV Atlântico">MV Atlântico</SelectItem>
                      <SelectItem value="MV Pacífico">MV Pacífico</SelectItem>
                      <SelectItem value="MV Índico">MV Índico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="crew">Tripulante Relacionado</Label>
                  <Select
                    value={newTask.related_crew}
                    onValueChange={value => setNewTask({ ...newTask, related_crew: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tripulante" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Carlos Silva">Carlos Silva</SelectItem>
                      <SelectItem value="Ana Costa">Ana Costa</SelectItem>
                      <SelectItem value="João Santos">João Santos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                onChange={e => setSearchTerm(e.target.value)}
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
                    {filteredTasks.map(task => (
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
                              <Badge
                                className={getPriorityColor(task.priority)}
                                variant="secondary"
                              >
                                {getPriorityText(task.priority)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {task.assigned_to || "Não atribuído"}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {task.due_date
                                  ? new Date(task.due_date).toLocaleDateString("pt-BR")
                                  : "Sem prazo"}
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
                                  onClick={e => {
                                    e.stopPropagation();
                                    updateTaskStatus(
                                      task.id,
                                      task.status === "pending" ? "in_progress" : "completed"
                                    );
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
                        <span className="text-sm font-medium">
                          {selectedTask.assigned_to || "Não atribuído"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Criado por:</span>
                        <span className="text-sm font-medium">{selectedTask.created_by}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Vencimento:</span>
                        <span className="text-sm font-medium">
                          {selectedTask.due_date
                            ? new Date(selectedTask.due_date).toLocaleDateString("pt-BR")
                            : "Sem prazo"}
                        </span>
                      </div>
                      {selectedTask.related_vessel && (
                        <div className="flex justify-between">
                          <span className="text-sm">Embarcação:</span>
                          <span className="text-sm font-medium">{selectedTask.related_vessel}</span>
                        </div>
                      )}
                      {selectedTask.related_crew && (
                        <div className="flex justify-between">
                          <span className="text-sm">Tripulante:</span>
                          <span className="text-sm font-medium">{selectedTask.related_crew}</span>
                        </div>
                      )}
                    </div>

                    {selectedTask.tags.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Tags</p>
                        <div className="flex gap-1 flex-wrap">
                          {selectedTask.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 space-y-2">
                      {selectedTask.status === "pending" && (
                        <Button
                          className="w-full"
                          onClick={() => updateTaskStatus(selectedTask.id, "in_progress")}
                        >
                          Iniciar Tarefa
                        </Button>
                      )}
                      {selectedTask.status === "in_progress" && (
                        <Button
                          className="w-full"
                          onClick={() => updateTaskStatus(selectedTask.id, "completed")}
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
          <Card>
            <CardContent className="p-8 text-center">
              <CheckSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Visualização Kanban será implementada em breve
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Visualização de Calendário será implementada em breve
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
