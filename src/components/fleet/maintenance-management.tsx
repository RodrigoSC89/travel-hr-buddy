import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Wrench, 
  Plus, 
  Search, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  Edit,
  FileText,
  DollarSign,
  User,
  Settings,
  Activity,
  TrendingUp,
  Zap,
  Shield,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceRecord {
  id: string;
  vessel_name: string;
  vessel_id: string;
  maintenance_type: "preventive" | "corrective" | "emergency" | "inspection";
  priority: "low" | "medium" | "high" | "critical";
  status: "scheduled" | "in_progress" | "completed" | "overdue" | "cancelled";
  title: string;
  description: string;
  scheduled_date: string;
  completed_date?: string;
  estimated_duration: number; // hours
  actual_duration?: number; // hours
  cost_estimate: number;
  actual_cost?: number;
  assigned_technician: string;
  location: string;
  parts_required: string[];
  created_at: string;
  next_maintenance?: string;
}

const MaintenanceManagement: React.FC = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Form state for new maintenance
  const [newMaintenance, setNewMaintenance] = useState({
    vessel_name: "",
    vessel_id: "",
    maintenance_type: "",
    priority: "",
    title: "",
    description: "",
    scheduled_date: "",
    estimated_duration: "",
    cost_estimate: "",
    assigned_technician: "",
    location: "",
    parts_required: ""
  });

  useEffect(() => {
    loadMaintenanceRecords();
  }, []);

  const loadMaintenanceRecords = () => {
    // Mock data for maintenance records
    const mockRecords: MaintenanceRecord[] = [
      {
        id: "1",
        vessel_name: "MV Atlântico Explorer",
        vessel_id: "1",
        maintenance_type: "preventive",
        priority: "medium",
        status: "scheduled",
        title: "Inspeção Anual do Motor Principal",
        description: "Inspeção completa do motor principal incluindo filtros, válvulas e sistema de refrigeração",
        scheduled_date: "2024-02-15T09:00:00Z",
        estimated_duration: 48,
        cost_estimate: 25000,
        assigned_technician: "Carlos Silva",
        location: "Porto de Santos",
        parts_required: ["Filtro de óleo", "Junta do cabeçote", "Válvula de segurança"],
        created_at: "2024-01-10T00:00:00Z",
        next_maintenance: "2025-02-15"
      },
      {
        id: "2",
        vessel_name: "MV Pacífico Star",
        vessel_id: "2",
        maintenance_type: "corrective",
        priority: "high",
        status: "in_progress",
        title: "Reparo do Sistema de Navegação",
        description: "Correção de falha no sistema GPS e atualização do software de navegação",
        scheduled_date: "2024-01-20T14:00:00Z",
        estimated_duration: 24,
        cost_estimate: 15000,
        actual_cost: 18500,
        assigned_technician: "Maria Santos",
        location: "Porto de Paranaguá",
        parts_required: ["Módulo GPS", "Antena de comunicação"],
        created_at: "2024-01-15T00:00:00Z"
      },
      {
        id: "3",
        vessel_name: "MV Índico Pioneer",
        vessel_id: "3",
        maintenance_type: "emergency",
        priority: "critical",
        status: "completed",
        title: "Reparo Emergencial do Leme",
        description: "Reparo urgente do sistema de direção após falha durante navegação",
        scheduled_date: "2024-01-12T02:00:00Z",
        completed_date: "2024-01-13T18:00:00Z",
        estimated_duration: 12,
        actual_duration: 16,
        cost_estimate: 35000,
        actual_cost: 42000,
        assigned_technician: "João Oliveira",
        location: "Estaleiro Suape",
        parts_required: ["Sistema hidráulico", "Bomba de direção", "Sensores"],
        created_at: "2024-01-12T00:00:00Z"
      },
      {
        id: "4",
        vessel_name: "MV Mediterrâneo",
        vessel_id: "4",
        maintenance_type: "inspection",
        priority: "medium",
        status: "overdue",
        title: "Inspeção de Segurança Trimestral",
        description: "Inspeção obrigatória de equipamentos de segurança e sistemas de emergência",
        scheduled_date: "2024-01-10T08:00:00Z",
        estimated_duration: 8,
        cost_estimate: 5000,
        assigned_technician: "Ana Costa",
        location: "Porto de Vitória",
        parts_required: ["Botes salva-vidas", "Extintores"],
        created_at: "2024-01-05T00:00:00Z"
      }
    ];

    setMaintenanceRecords(mockRecords);
    setIsLoading(false);
  };

  const handleAddMaintenance = () => {
    const newRecord: MaintenanceRecord = {
      id: Math.random().toString(),
      vessel_name: newMaintenance.vessel_name,
      vessel_id: newMaintenance.vessel_id,
      maintenance_type: newMaintenance.maintenance_type as any,
      priority: newMaintenance.priority as any,
      status: "scheduled",
      title: newMaintenance.title,
      description: newMaintenance.description,
      scheduled_date: new Date(newMaintenance.scheduled_date).toISOString(),
      estimated_duration: parseInt(newMaintenance.estimated_duration),
      cost_estimate: parseFloat(newMaintenance.cost_estimate),
      assigned_technician: newMaintenance.assigned_technician,
      location: newMaintenance.location,
      parts_required: newMaintenance.parts_required.split(",").map(p => p.trim()),
      created_at: new Date().toISOString()
    };

    setMaintenanceRecords([newRecord, ...maintenanceRecords]);
    setShowAddDialog(false);
    
    // Reset form
    setNewMaintenance({
      vessel_name: "",
      vessel_id: "",
      maintenance_type: "",
      priority: "",
      title: "",
      description: "",
      scheduled_date: "",
      estimated_duration: "",
      cost_estimate: "",
      assigned_technician: "",
      location: "",
      parts_required: ""
    });

    toast({
      title: "Manutenção Agendada",
      description: `${newRecord.title} foi agendada com sucesso`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "scheduled": return "bg-info text-info-foreground";
    case "in_progress": return "bg-warning text-warning-foreground";
    case "completed": return "bg-success text-success-foreground";
    case "overdue": return "bg-destructive text-destructive-foreground";
    case "cancelled": return "bg-muted text-muted-foreground";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
    case "scheduled": return "Agendada";
    case "in_progress": return "Em Andamento";
    case "completed": return "Concluída";
    case "overdue": return "Atrasada";
    case "cancelled": return "Cancelada";
    default: return "Desconhecido";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "low": return "text-success";
    case "medium": return "text-warning";
    case "high": return "text-orange-500";
    case "critical": return "text-destructive";
    default: return "text-muted-foreground";
    }
  };

  const getMaintenanceTypeIcon = (type: string) => {
    switch (type) {
    case "preventive": return <Shield className="h-4 w-4 text-success" />;
    case "corrective": return <Wrench className="h-4 w-4 text-warning" />;
    case "emergency": return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case "inspection": return <CheckCircle className="h-4 w-4 text-info" />;
    default: return <Settings className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const filteredRecords = maintenanceRecords.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.vessel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.assigned_technician.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || record.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate stats
  const stats = {
    total: maintenanceRecords.length,
    scheduled: maintenanceRecords.filter(r => r.status === "scheduled").length,
    inProgress: maintenanceRecords.filter(r => r.status === "in_progress").length,
    overdue: maintenanceRecords.filter(r => r.status === "overdue").length,
    completed: maintenanceRecords.filter(r => r.status === "completed").length,
    totalCost: maintenanceRecords.reduce((sum, r) => sum + (r.actual_cost || r.cost_estimate), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Wrench className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Agendadas</p>
                <p className="text-2xl font-bold text-info">{stats.scheduled}</p>
              </div>
              <Calendar className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-warning">{stats.inProgress}</p>
              </div>
              <Activity className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Atrasadas</p>
                <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold text-success">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                  }).format(stats.totalCost)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Gestão de Manutenção
          </h2>
          <p className="text-muted-foreground">
            Controle completo de manutenções preventivas e corretivas
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Agendar Manutenção
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agendar Nova Manutenção</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vessel_name">Embarcação *</Label>
                <Input
                  id="vessel_name"
                  value={newMaintenance.vessel_name}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, vessel_name: e.target.value })}
                  placeholder="Nome da embarcação"
                />
              </div>
              <div>
                <Label htmlFor="maintenance_type">Tipo de Manutenção *</Label>
                <Select 
                  value={newMaintenance.maintenance_type} 
                  onValueChange={(value) => setNewMaintenance({ ...newMaintenance, maintenance_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventiva</SelectItem>
                    <SelectItem value="corrective">Corretiva</SelectItem>
                    <SelectItem value="emergency">Emergência</SelectItem>
                    <SelectItem value="inspection">Inspeção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Prioridade *</Label>
                <Select 
                  value={newMaintenance.priority} 
                  onValueChange={(value) => setNewMaintenance({ ...newMaintenance, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="scheduled_date">Data Agendada *</Label>
                <Input
                  id="scheduled_date"
                  type="datetime-local"
                  value={newMaintenance.scheduled_date}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, scheduled_date: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="title">Título da Manutenção *</Label>
                <Input
                  id="title"
                  value={newMaintenance.title}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, title: e.target.value })}
                  placeholder="Ex: Inspeção do Motor Principal"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newMaintenance.description}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                  placeholder="Descrição detalhada da manutenção..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="estimated_duration">Duração Estimada (horas)</Label>
                <Input
                  id="estimated_duration"
                  type="number"
                  value={newMaintenance.estimated_duration}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, estimated_duration: e.target.value })}
                  placeholder="Ex: 24"
                />
              </div>
              <div>
                <Label htmlFor="cost_estimate">Custo Estimado (R$)</Label>
                <Input
                  id="cost_estimate"
                  type="number"
                  step="0.01"
                  value={newMaintenance.cost_estimate}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, cost_estimate: e.target.value })}
                  placeholder="Ex: 15000.00"
                />
              </div>
              <div>
                <Label htmlFor="assigned_technician">Técnico Responsável</Label>
                <Input
                  id="assigned_technician"
                  value={newMaintenance.assigned_technician}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, assigned_technician: e.target.value })}
                  placeholder="Nome do técnico"
                />
              </div>
              <div>
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={newMaintenance.location}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, location: e.target.value })}
                  placeholder="Ex: Porto de Santos"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="parts_required">Peças Necessárias</Label>
                <Input
                  id="parts_required"
                  value={newMaintenance.parts_required}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, parts_required: e.target.value })}
                  placeholder="Ex: Filtro de óleo, Junta do cabeçote (separadas por vírgula)"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleAddMaintenance} className="flex-1">
                Agendar Manutenção
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, embarcação ou técnico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="scheduled">Agendada</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="overdue">Atrasada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Records */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span>Carregando registros de manutenção...</span>
            </div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Nenhuma manutenção encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all" 
                  ? "Tente ajustar os filtros de busca" 
                  : "Agende a primeira manutenção para sua frota"}
              </p>
              {!searchTerm && statusFilter === "all" && priorityFilter === "all" && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar Manutenção
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex flex-col items-center gap-2">
                      {getMaintenanceTypeIcon(record.maintenance_type)}
                      <Badge className={getStatusColor(record.status)} variant="secondary">
                        {getStatusText(record.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{record.title}</h3>
                        <Badge 
                          variant="outline" 
                          className={getPriorityColor(record.priority)}
                        >
                          {record.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{record.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Embarcação:</span>
                          <p>{record.vessel_name}</p>
                        </div>
                        <div>
                          <span className="font-medium">Data Agendada:</span>
                          <p>{new Date(record.scheduled_date).toLocaleDateString("pt-BR")}</p>
                        </div>
                        <div>
                          <span className="font-medium">Técnico:</span>
                          <p>{record.assigned_technician}</p>
                        </div>
                        <div>
                          <span className="font-medium">Local:</span>
                          <p>{record.location}</p>
                        </div>
                      </div>
                      
                      {record.status === "in_progress" && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progresso</span>
                            <span>60%</span>
                          </div>
                          <Progress value={60} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedRecord(record);
                        setShowDetailsDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Detalhes
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Maintenance Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRecord && getMaintenanceTypeIcon(selectedRecord.maintenance_type)}
              {selectedRecord?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="parts">Peças e Custos</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedRecord.status)}>
                        {getStatusText(selectedRecord.status)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Prioridade</Label>
                    <p className={`mt-1 text-sm font-medium ${getPriorityColor(selectedRecord.priority)}`}>
                      {selectedRecord.priority}
                    </p>
                  </div>
                  <div>
                    <Label>Embarcação</Label>
                    <p className="mt-1 text-sm">{selectedRecord.vessel_name}</p>
                  </div>
                  <div>
                    <Label>Técnico Responsável</Label>
                    <p className="mt-1 text-sm">{selectedRecord.assigned_technician}</p>
                  </div>
                  <div>
                    <Label>Data Agendada</Label>
                    <p className="mt-1 text-sm">
                      {new Date(selectedRecord.scheduled_date).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <Label>Duração Estimada</Label>
                    <p className="mt-1 text-sm">{selectedRecord.estimated_duration} horas</p>
                  </div>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <p className="mt-1 text-sm">{selectedRecord.description}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="parts" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Custo Estimado</Label>
                    <p className="mt-1 text-lg font-semibold text-success">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL"
                      }).format(selectedRecord.cost_estimate)}
                    </p>
                  </div>
                  {selectedRecord.actual_cost && (
                    <div>
                      <Label>Custo Real</Label>
                      <p className="mt-1 text-lg font-semibold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL"
                        }).format(selectedRecord.actual_cost)}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Peças Necessárias</Label>
                  <div className="mt-2 space-y-2">
                    {selectedRecord.parts_required.map((part, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm">{part}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Clock className="h-4 w-4 text-info" />
                    <div>
                      <p className="font-medium text-sm">Manutenção Agendada</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedRecord.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  
                  {selectedRecord.status === "in_progress" && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Activity className="h-4 w-4 text-warning" />
                      <div>
                        <p className="font-medium text-sm">Manutenção Iniciada</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(selectedRecord.scheduled_date).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {selectedRecord.completed_date && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <div>
                        <p className="font-medium text-sm">Manutenção Concluída</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(selectedRecord.completed_date).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenanceManagement;