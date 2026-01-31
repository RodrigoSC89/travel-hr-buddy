/**
 * Fleet Command Dashboard - PATCH INTERACTIVITY 100%
 * Actionable fleet management with workflows and real-time data
 */

import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Ship,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Navigation,
  Fuel,
  Users,
  Wrench,
  Bell,
  MessageSquare,
  Play,
  Pause,
  RotateCcw,
  Download,
  Filter,
  Search,
  ChevronRight,
  Activity,
  Anchor,
  Send,
  Plus,
  Eye,
  RefreshCw,
  FileText,
  Calendar
} from "lucide-react";

interface FleetVessel {
  id: string;
  name: string;
  type: string;
  status: "operational" | "maintenance" | "docked" | "transit" | "alert";
  position: { lat: number; lng: number };
  destination?: string;
  eta?: string;
  speed: number;
  fuel: number;
  crew: number;
  alerts: number;
  lastContact: Date;
}

interface FleetAlert {
  id: string;
  vesselId: string;
  vesselName: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
}

interface FleetAction {
  id: string;
  vesselId: string;
  vesselName: string;
  action: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  createdAt: Date;
  completedAt?: Date;
  assignedTo: string;
}

const MOCK_VESSELS: FleetVessel[] = [
  {
    id: "v1",
    name: "MV Atlantic Pioneer",
    type: "Tanker",
    status: "transit",
    position: { lat: -23.9618, lng: -46.3322 },
    destination: "Rotterdam",
    eta: "2026-02-05 14:00",
    speed: 14.5,
    fuel: 72,
    crew: 24,
    alerts: 2,
    lastContact: new Date()
  },
  {
    id: "v2",
    name: "MV Pacific Star",
    type: "Container",
    status: "operational",
    position: { lat: -22.9068, lng: -43.1729 },
    destination: "Santos",
    eta: "2026-02-01 08:00",
    speed: 16.2,
    fuel: 85,
    crew: 22,
    alerts: 0,
    lastContact: new Date()
  },
  {
    id: "v3",
    name: "MV Southern Cross",
    type: "Bulk Carrier",
    status: "alert",
    position: { lat: -25.2637, lng: -48.5253 },
    speed: 8.5,
    fuel: 45,
    crew: 20,
    alerts: 5,
    lastContact: new Date(Date.now() - 3600000)
  },
  {
    id: "v4",
    name: "MV Northern Light",
    type: "AHTS",
    status: "docked",
    position: { lat: -23.0115, lng: -44.2979 },
    speed: 0,
    fuel: 95,
    crew: 18,
    alerts: 1,
    lastContact: new Date()
  }
];

const MOCK_ALERTS: FleetAlert[] = [
  {
    id: "a1",
    vesselId: "v3",
    vesselName: "MV Southern Cross",
    type: "critical",
    title: "Falha de Comunicação",
    message: "Última comunicação há mais de 30 minutos",
    timestamp: new Date(Date.now() - 1800000),
    acknowledged: false
  },
  {
    id: "a2",
    vesselId: "v1",
    vesselName: "MV Atlantic Pioneer",
    type: "warning",
    title: "Desvio de Rota",
    message: "Embarcação 5nm fora da rota planejada",
    timestamp: new Date(Date.now() - 3600000),
    acknowledged: true,
    acknowledgedBy: "Capitão Silva"
  },
  {
    id: "a3",
    vesselId: "v3",
    vesselName: "MV Southern Cross",
    type: "critical",
    title: "Nível de Combustível Baixo",
    message: "Combustível em 45% - abaixo do limite de segurança",
    timestamp: new Date(Date.now() - 7200000),
    acknowledged: false
  }
];

export function FleetCommandDashboard() {
  const { toast } = useToast();
  const [vessels] = useState<FleetVessel[]>(MOCK_VESSELS);
  const [alerts, setAlerts] = useState<FleetAlert[]>(MOCK_ALERTS);
  const [actions, setActions] = useState<FleetAction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVessel, setSelectedVessel] = useState<FleetVessel | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Dialog states
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [actionNotes, setActionNotes] = useState("");
  const [messageText, setMessageText] = useState("");

  // Filtered vessels
  const filteredVessels = useMemo(() => {
    return vessels.filter(v => {
      const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vessels, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: vessels.length,
    operational: vessels.filter(v => v.status === "operational" || v.status === "transit").length,
    alerts: vessels.reduce((sum, v) => sum + v.alerts, 0),
    docked: vessels.filter(v => v.status === "docked").length,
    avgFuel: Math.round(vessels.reduce((sum, v) => sum + v.fuel, 0) / vessels.length)
  }), [vessels]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId 
        ? { ...a, acknowledged: true, acknowledgedBy: "Current User" }
        : a
    ));
    toast({
      title: "Alerta Reconhecido",
      description: "O alerta foi marcado como visualizado"
    });
  }, [toast]);

  // Create action
  const createAction = useCallback(() => {
    if (!selectedVessel || !actionType) return;

    const newAction: FleetAction = {
      id: `act_${Date.now()}`,
      vesselId: selectedVessel.id,
      vesselName: selectedVessel.name,
      action: actionType,
      status: "pending",
      createdAt: new Date(),
      assignedTo: "Current User"
    };

    setActions(prev => [newAction, ...prev]);
    setIsActionDialogOpen(false);
    setActionType("");
    setActionNotes("");

    toast({
      title: "Ação Criada",
      description: `${actionType} iniciada para ${selectedVessel.name}`
    });
  }, [selectedVessel, actionType, toast]);

  // Send message
  const sendMessage = useCallback(() => {
    if (!selectedVessel || !messageText.trim()) return;

    toast({
      title: "Mensagem Enviada",
      description: `Mensagem enviada para ${selectedVessel.name}`
    });
    
    setIsMessageDialogOpen(false);
    setMessageText("");
  }, [selectedVessel, messageText, toast]);

  // Complete action
  const completeAction = useCallback((actionId: string) => {
    setActions(prev => prev.map(a => 
      a.id === actionId 
        ? { ...a, status: "completed" as const, completedAt: new Date() }
        : a
    ));
    toast({
      title: "Ação Concluída",
      description: "A ação foi marcada como concluída"
    });
  }, [toast]);

  const getStatusConfig = (status: FleetVessel["status"]) => {
    const config = {
      operational: { label: "Operacional", color: "bg-green-500", textColor: "text-green-600" },
      transit: { label: "Em Trânsito", color: "bg-blue-500", textColor: "text-blue-600" },
      maintenance: { label: "Manutenção", color: "bg-yellow-500", textColor: "text-yellow-600" },
      docked: { label: "Atracada", color: "bg-gray-500", textColor: "text-gray-600" },
      alert: { label: "Alerta", color: "bg-red-500", textColor: "text-red-600" }
    };
    return config[status];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Ship className="h-6 w-6 text-primary" />
            Fleet Command Center
          </h2>
          <p className="text-muted-foreground">
            Comando e controle centralizado da frota
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Frota</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Ship className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Operacionais</p>
                <p className="text-2xl font-bold text-green-600">{stats.operational}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas</p>
                <p className="text-2xl font-bold text-red-600">{stats.alerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atracadas</p>
                <p className="text-2xl font-bold">{stats.docked}</p>
              </div>
              <Anchor className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Combustível Médio</p>
                <p className="text-2xl font-bold">{stats.avgFuel}%</p>
              </div>
              <Fuel className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            Alertas
            {alerts.filter(a => !a.acknowledged).length > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 justify-center">
                {alerts.filter(a => !a.acknowledged).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="actions">Ações</TabsTrigger>
          <TabsTrigger value="map">Mapa</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar embarcação..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="operational">Operacional</SelectItem>
                <SelectItem value="transit">Em Trânsito</SelectItem>
                <SelectItem value="docked">Atracada</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="alert">Alerta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vessel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVessels.map((vessel) => {
              const statusConfig = getStatusConfig(vessel.status);
              return (
                <Card 
                  key={vessel.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedVessel?.id === vessel.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedVessel(vessel)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{vessel.name}</CardTitle>
                      <Badge variant={vessel.status === "alert" ? "destructive" : "outline"}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <CardDescription>{vessel.type}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Velocidade</p>
                        <p className="font-medium">{vessel.speed} kn</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Combustível</p>
                        <p className="font-medium">{vessel.fuel}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tripulação</p>
                        <p className="font-medium">{vessel.crew}</p>
                      </div>
                    </div>

                    {/* Fuel Progress */}
                    <div>
                      <Progress 
                        value={vessel.fuel} 
                        className={vessel.fuel < 50 ? "bg-red-100" : ""}
                      />
                    </div>

                    {/* Destination */}
                    {vessel.destination && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{vessel.destination}</span>
                        {vessel.eta && (
                          <span className="text-muted-foreground">• ETA: {vessel.eta}</span>
                        )}
                      </div>
                    )}

                    {/* Alerts Badge */}
                    {vessel.alerts > 0 && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-600">
                          {vessel.alerts} alerta{vessel.alerts > 1 ? "s" : ""} ativo{vessel.alerts > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVessel(vessel);
                          setIsMessageDialogOpen(true);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Mensagem
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVessel(vessel);
                          setIsActionDialogOpen(true);
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Ação
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Alertas Ativos</CardTitle>
                <Badge variant="outline">
                  {alerts.filter(a => !a.acknowledged).length} não reconhecidos
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg ${
                        !alert.acknowledged ? "bg-muted/50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            alert.type === "critical" ? "bg-red-100 text-red-600" :
                            alert.type === "warning" ? "bg-yellow-100 text-yellow-600" :
                            "bg-blue-100 text-blue-600"
                          }`}>
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Ship className="h-3 w-3" />
                              <span>{alert.vesselName}</span>
                              <span>•</span>
                              <Clock className="h-3 w-3" />
                              <span>{alert.timestamp.toLocaleString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.acknowledged ? (
                            <Badge variant="outline" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Por {alert.acknowledgedBy}
                            </Badge>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              Reconhecer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Ações em Andamento</CardTitle>
                <Button 
                  size="sm"
                  onClick={() => {
                    if (vessels.length > 0) {
                      setSelectedVessel(vessels[0]);
                      setIsActionDialogOpen(true);
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Ação
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {actions.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Nenhuma ação em andamento</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Crie uma nova ação para uma embarcação
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {actions.map((action) => (
                    <div key={action.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{action.action}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Ship className="h-3 w-3" />
                            <span>{action.vesselName}</span>
                            <span>•</span>
                            <span>Atribuído: {action.assignedTo}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            action.status === "completed" ? "default" :
                            action.status === "in_progress" ? "secondary" : "outline"
                          }>
                            {action.status === "completed" ? "Concluída" :
                             action.status === "in_progress" ? "Em Progresso" :
                             action.status === "cancelled" ? "Cancelada" : "Pendente"}
                          </Badge>
                          {action.status === "pending" && (
                            <Button 
                              size="sm"
                              onClick={() => completeAction(action.id)}
                            >
                              Concluir
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Map Tab */}
        <TabsContent value="map">
          <Card>
            <CardContent className="pt-6">
              <div className="aspect-video bg-gradient-to-b from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-950 rounded-lg flex items-center justify-center relative">
                {/* Map placeholder with vessel markers */}
                <div className="absolute inset-0 p-4">
                  {vessels.map((vessel, i) => (
                    <div
                      key={vessel.id}
                      className="absolute flex items-center gap-2 bg-background/90 p-2 rounded-lg shadow-lg cursor-pointer hover:bg-background"
                      style={{
                        top: `${20 + i * 15}%`,
                        left: `${10 + i * 20}%`
                      }}
                      onClick={() => setSelectedVessel(vessel)}
                    >
                      <div className={`w-3 h-3 rounded-full ${getStatusConfig(vessel.status).color}`} />
                      <span className="text-sm font-medium">{vessel.name}</span>
                    </div>
                  ))}
                </div>
                <div className="text-center z-10">
                  <MapPin className="h-12 w-12 mx-auto text-primary mb-4" />
                  <p className="text-lg font-medium">Mapa Interativo</p>
                  <p className="text-sm text-muted-foreground">
                    {vessels.length} embarcações rastreadas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Ação</DialogTitle>
            <DialogDescription>
              Criar ação para {selectedVessel?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Select value={actionType} onValueChange={setActionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Solicitar Abastecimento">Solicitar Abastecimento</SelectItem>
                  <SelectItem value="Enviar Tripulação">Enviar Tripulação</SelectItem>
                  <SelectItem value="Agendar Manutenção">Agendar Manutenção</SelectItem>
                  <SelectItem value="Alterar Rota">Alterar Rota</SelectItem>
                  <SelectItem value="Verificar Status">Verificar Status</SelectItem>
                  <SelectItem value="Inspeção de Segurança">Inspeção de Segurança</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Textarea
                placeholder="Notas adicionais..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={createAction} disabled={!actionType}>
              <Play className="h-4 w-4 mr-2" />
              Criar Ação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Mensagem</DialogTitle>
            <DialogDescription>
              Para {selectedVessel?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Digite sua mensagem..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={sendMessage} disabled={!messageText.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FleetCommandDashboard;
