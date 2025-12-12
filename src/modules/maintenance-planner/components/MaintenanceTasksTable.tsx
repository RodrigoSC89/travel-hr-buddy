import { useEffect, useState, useCallback, useMemo } from "react";;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  MoreVertical,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Wrench,
  Calendar,
  Eye,
  Play,
  Pause,
  CheckCheck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceTask {
  id: string;
  title: string;
  equipment: string;
  equipmentCode: string;
  type: "preventive" | "corrective" | "predictive" | "inspection";
  status: "pending" | "in_progress" | "completed" | "overdue" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  scheduledDate: string;
  completedDate?: string;
  assignee: string;
  estimatedHours: number;
  actualHours?: number;
}

interface MaintenanceTasksTableProps {
  onRefresh: () => void;
}

const demoTasks: MaintenanceTask[] = [
  {
    id: "1",
    title: "Troca de óleo do sistema hidráulico",
    equipment: "Bomba Hidráulica STBD",
    equipmentCode: "HYD-001",
    type: "preventive",
    status: "overdue",
    priority: "critical",
    scheduledDate: "2024-12-02",
    assignee: "João Silva",
    estimatedHours: 4,
  },
  {
    id: "2",
    title: "Inspeção visual do thruster",
    equipment: "Thruster STBD",
    equipmentCode: "THR-001",
    type: "inspection",
    status: "in_progress",
    priority: "high",
    scheduledDate: "2024-12-05",
    assignee: "Carlos Santos",
    estimatedHours: 2,
  },
  {
    id: "3",
    title: "Calibração de sensores DP",
    equipment: "Sistema DP",
    equipmentCode: "DP-001",
    type: "preventive",
    status: "pending",
    priority: "medium",
    scheduledDate: "2024-12-08",
    assignee: "Maria Oliveira",
    estimatedHours: 3,
  },
  {
    id: "4",
    title: "Troca de filtros de ar",
    equipment: "Gerador Principal 1",
    equipmentCode: "GEN-001",
    type: "preventive",
    status: "completed",
    priority: "medium",
    scheduledDate: "2024-12-01",
    completedDate: "2024-12-01",
    assignee: "Pedro Costa",
    estimatedHours: 2,
    actualHours: 1.5,
  },
  {
    id: "5",
    title: "Reparo de vazamento",
    equipment: "Compressor de Ar",
    equipmentCode: "CMP-001",
    type: "corrective",
    status: "completed",
    priority: "high",
    scheduledDate: "2024-11-28",
    completedDate: "2024-11-29",
    assignee: "João Silva",
    estimatedHours: 6,
    actualHours: 8,
  },
  {
    id: "6",
    title: "Análise de vibração",
    equipment: "Thruster PORT",
    equipmentCode: "THR-002",
    type: "predictive",
    status: "pending",
    priority: "low",
    scheduledDate: "2024-12-10",
    assignee: "Carlos Santos",
    estimatedHours: 1,
  },
  {
    id: "7",
    title: "Verificação do sistema de navegação",
    equipment: "Sistema de Navegação",
    equipmentCode: "NAV-001",
    type: "inspection",
    status: "pending",
    priority: "medium",
    scheduledDate: "2024-12-12",
    assignee: "Maria Oliveira",
    estimatedHours: 2,
  },
  {
    id: "8",
    title: "Manutenção do gerador de emergência",
    equipment: "Gerador Principal 2",
    equipmentCode: "GEN-002",
    type: "preventive",
    status: "overdue",
    priority: "high",
    scheduledDate: "2024-12-03",
    assignee: "Pedro Costa",
    estimatedHours: 5,
  },
];

export const MaintenanceTasksTable: React.FC<MaintenanceTasksTableProps> = ({ onRefresh }) => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(demoTasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      pending: { 
        label: "Pendente", 
        className: "bg-muted text-muted-foreground",
        icon: <Clock className="h-3 w-3 mr-1" />
      },
      in_progress: { 
        label: "Em Andamento", 
        className: "bg-blue-500/20 text-blue-500",
        icon: <Play className="h-3 w-3 mr-1" />
      },
      completed: { 
        label: "Concluído", 
        className: "bg-success/20 text-success",
        icon: <CheckCircle className="h-3 w-3 mr-1" />
      },
      overdue: { 
        label: "Vencido", 
        className: "bg-destructive/20 text-destructive",
        icon: <XCircle className="h-3 w-3 mr-1" />
      },
      cancelled: { 
        label: "Cancelado", 
        className: "bg-muted text-muted-foreground line-through",
        icon: <XCircle className="h-3 w-3 mr-1" />
      },
    };
    const config = configs[status] || configs.pending;
    return (
      <Badge className={config.className} variant="secondary">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      preventive: { label: "Preventiva", className: "bg-blue-500/20 text-blue-500" },
      corrective: { label: "Corretiva", className: "bg-orange-500/20 text-orange-500" },
      predictive: { label: "Preditiva", className: "bg-purple-500/20 text-purple-500" },
      inspection: { label: "Inspeção", className: "bg-green-500/20 text-green-500" },
    };
    const config = configs[type] || configs.preventive;
    return <Badge className={config.className} variant="secondary">{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      low: { label: "Baixa", className: "bg-muted text-muted-foreground" },
      medium: { label: "Média", className: "bg-warning/20 text-warning" },
      high: { label: "Alta", className: "bg-orange-500/20 text-orange-500" },
      critical: { label: "Crítica", className: "bg-destructive/20 text-destructive" },
    };
    const config = configs[priority] || configs.medium;
    return <Badge className={config.className} variant="secondary">{config.label}</Badge>;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    onRefresh();
    toast({
      title: "Lista atualizada",
      description: "As tarefas foram atualizadas com sucesso",
    });
  };

  const handleStartTask = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, status: "in_progress" as const } : task
      )
    );
    toast({
      title: "Tarefa iniciada",
      description: "A tarefa foi marcada como em andamento",
    });
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, status: "completed" as const, completedDate: new Date().toISOString().split("T")[0] } 
          : task
      )
    );
    toast({
      title: "Tarefa concluída",
      description: "A tarefa foi marcada como concluída",
    });
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.equipmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesType = typeFilter === "all" || task.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Tarefas de Manutenção
            </CardTitle>
            <CardDescription>
              {filteredTasks.length} tarefas encontradas
            </CardDescription>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, equipamento ou responsável..."
                className="pl-8"
                value={searchTerm}
                onChange={handleChange}
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="overdue">Vencido</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="preventive">Preventiva</SelectItem>
              <SelectItem value="corrective">Corretiva</SelectItem>
              <SelectItem value="predictive">Preditiva</SelectItem>
              <SelectItem value="inspection">Inspeção</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarefa</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Wrench className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                    <p className="text-muted-foreground">Nenhuma tarefa encontrada</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow key={task.id} className={task.status === "overdue" ? "bg-destructive/5" : ""}>
                    <TableCell>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {task.estimatedHours}h estimadas
                        {task.actualHours && ` / ${task.actualHours}h realizadas`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{task.equipment}</div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {task.equipmentCode}
                      </Badge>
                    </TableCell>
                    <TableCell>{getTypeBadge(task.type)}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(task.scheduledDate).toLocaleDateString("pt-BR")}
                      </div>
                      {task.completedDate && (
                        <div className="text-xs text-success flex items-center gap-1 mt-1">
                          <CheckCircle className="h-3 w-3" />
                          {new Date(task.completedDate).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{task.assignee}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          {task.status === "pending" && (
                            <DropdownMenuItem onClick={() => handlehandleStartTask}>
                              <Play className="h-4 w-4 mr-2" />
                              Iniciar Tarefa
                            </DropdownMenuItem>
                          )}
                          {(task.status === "pending" || task.status === "in_progress" || task.status === "overdue") && (
                            <DropdownMenuItem onClick={() => handlehandleCompleteTask}>
                              <CheckCheck className="h-4 w-4 mr-2" />
                              Marcar Concluído
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancelar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
});
