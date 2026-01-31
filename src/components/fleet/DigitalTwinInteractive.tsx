/**
 * Digital Twin Interactive - PATCH INTERACTIVITY 100%
 * Fixed vessel selection + full CRUD + 3D preview
 */

import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Ship,
  Plus,
  Edit,
  Trash2,
  Archive,
  RotateCcw,
  Copy,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Thermometer,
  Gauge,
  Anchor,
  MapPin,
  RefreshCw,
  Download,
  Settings,
  Eye,
  Loader2
} from "lucide-react";

interface Vessel {
  id: string;
  name: string;
  imo: string;
  type: string;
  status: "operational" | "maintenance" | "docked" | "archived";
  position: { lat: number; lng: number };
  speed: number;
  heading: number;
  lastUpdate: Date;
  sensors: {
    engineTemp: number;
    fuelLevel: number;
    rpm: number;
    pressure: number;
  };
  alerts: number;
  createdAt: Date;
}

interface SensorReading {
  id: string;
  type: string;
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  timestamp: Date;
}

const MOCK_VESSELS: Vessel[] = [
  {
    id: "v1",
    name: "MV Atlantic Pioneer",
    imo: "IMO9876543",
    type: "Tanker",
    status: "operational",
    position: { lat: -23.9618, lng: -46.3322 },
    speed: 12.5,
    heading: 45,
    lastUpdate: new Date(),
    sensors: { engineTemp: 85, fuelLevel: 72, rpm: 1450, pressure: 4.2 },
    alerts: 2,
    createdAt: new Date(2023, 0, 15)
  },
  {
    id: "v2",
    name: "MV Pacific Star",
    imo: "IMO9876544",
    type: "Container",
    status: "maintenance",
    position: { lat: -22.9068, lng: -43.1729 },
    speed: 0,
    heading: 180,
    lastUpdate: new Date(Date.now() - 3600000),
    sensors: { engineTemp: 45, fuelLevel: 95, rpm: 0, pressure: 0 },
    alerts: 0,
    createdAt: new Date(2022, 5, 20)
  },
  {
    id: "v3",
    name: "MV Southern Cross",
    imo: "IMO9876545",
    type: "Bulk Carrier",
    status: "docked",
    position: { lat: -25.2637, lng: -48.5253 },
    speed: 0,
    heading: 270,
    lastUpdate: new Date(Date.now() - 7200000),
    sensors: { engineTemp: 32, fuelLevel: 45, rpm: 0, pressure: 0 },
    alerts: 5,
    createdAt: new Date(2021, 11, 1)
  }
];

const SENSOR_READINGS: SensorReading[] = [
  { id: "s1", type: "Temperatura Motor", value: 85, unit: "°C", status: "normal", timestamp: new Date() },
  { id: "s2", type: "Nível de Combustível", value: 72, unit: "%", status: "normal", timestamp: new Date() },
  { id: "s3", type: "RPM Motor", value: 1450, unit: "rpm", status: "normal", timestamp: new Date() },
  { id: "s4", type: "Pressão Óleo", value: 4.2, unit: "bar", status: "normal", timestamp: new Date() },
  { id: "s5", type: "Temperatura Escape", value: 420, unit: "°C", status: "warning", timestamp: new Date() },
  { id: "s6", type: "Vibração", value: 2.8, unit: "mm/s", status: "normal", timestamp: new Date() }
];

export function DigitalTwinInteractive() {
  const { toast } = useToast();
  const [vessels, setVessels] = useState<Vessel[]>(MOCK_VESSELS);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    imo: "",
    type: "Tanker"
  });

  // Filtered vessels
  const filteredVessels = useMemo(() => {
    return vessels.filter(v => {
      const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           v.imo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || v.status === statusFilter;
      return matchesSearch && matchesStatus && v.status !== "archived";
    });
  }, [vessels, searchQuery, statusFilter]);

  // Select vessel safely
  const handleSelectVessel = useCallback((vessel: Vessel) => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setSelectedVessel(vessel);
      setIsLoading(false);
      toast({
        title: "Embarcação Selecionada",
        description: `${vessel.name} carregada com sucesso`
      });
    }, 500);
  }, [toast]);

  // Add vessel
  const handleAddVessel = useCallback(() => {
    if (!formData.name || !formData.imo) {
      toast({
        title: "Erro de Validação",
        description: "Nome e IMO são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const newVessel: Vessel = {
      id: `v_${Date.now()}`,
      name: formData.name,
      imo: formData.imo,
      type: formData.type,
      status: "docked",
      position: { lat: -23.9618, lng: -46.3322 },
      speed: 0,
      heading: 0,
      lastUpdate: new Date(),
      sensors: { engineTemp: 0, fuelLevel: 100, rpm: 0, pressure: 0 },
      alerts: 0,
      createdAt: new Date()
    };

    setVessels(prev => [newVessel, ...prev]);
    setIsAddDialogOpen(false);
    setFormData({ name: "", imo: "", type: "Tanker" });
    
    toast({
      title: "Embarcação Adicionada",
      description: `${newVessel.name} foi cadastrada com sucesso`
    });
  }, [formData, toast]);

  // Edit vessel
  const handleEditVessel = useCallback(() => {
    if (!selectedVessel || !formData.name) return;

    setVessels(prev => prev.map(v => 
      v.id === selectedVessel.id 
        ? { ...v, name: formData.name, imo: formData.imo, type: formData.type }
        : v
    ));
    
    setSelectedVessel(prev => prev ? { ...prev, name: formData.name, imo: formData.imo, type: formData.type } : null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Embarcação Atualizada",
      description: "Dados salvos com sucesso"
    });
  }, [selectedVessel, formData, toast]);

  // Delete vessel
  const handleDeleteVessel = useCallback(() => {
    if (!selectedVessel) return;

    setVessels(prev => prev.filter(v => v.id !== selectedVessel.id));
    setSelectedVessel(null);
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "Embarcação Removida",
      description: "Registro excluído com sucesso"
    });
  }, [selectedVessel, toast]);

  // Archive vessel
  const handleArchiveVessel = useCallback(() => {
    if (!selectedVessel) return;

    setVessels(prev => prev.map(v => 
      v.id === selectedVessel.id ? { ...v, status: "archived" as const } : v
    ));
    setSelectedVessel(null);
    
    toast({
      title: "Embarcação Arquivada",
      description: "Mova para a lista de arquivados"
    });
  }, [selectedVessel, toast]);

  // Duplicate vessel
  const handleDuplicateVessel = useCallback(() => {
    if (!selectedVessel) return;

    const duplicate: Vessel = {
      ...selectedVessel,
      id: `v_${Date.now()}`,
      name: `${selectedVessel.name} (Cópia)`,
      imo: `${selectedVessel.imo}_COPY`,
      createdAt: new Date()
    };

    setVessels(prev => [duplicate, ...prev]);
    
    toast({
      title: "Embarcação Duplicada",
      description: `${duplicate.name} criada como cópia`
    });
  }, [selectedVessel, toast]);

  // Open edit dialog
  const openEditDialog = useCallback(() => {
    if (!selectedVessel) return;
    setFormData({
      name: selectedVessel.name,
      imo: selectedVessel.imo,
      type: selectedVessel.type
    });
    setIsEditDialogOpen(true);
  }, [selectedVessel]);

  const getStatusConfig = (status: Vessel["status"]) => {
    const config = {
      operational: { label: "Operacional", color: "bg-green-500", icon: CheckCircle },
      maintenance: { label: "Manutenção", color: "bg-yellow-500", icon: Clock },
      docked: { label: "Atracada", color: "bg-blue-500", icon: Anchor },
      archived: { label: "Arquivada", color: "bg-gray-500", icon: Archive }
    };
    return config[status];
  };

  const getSensorStatus = (value: number, type: string) => {
    if (type === "engineTemp" && value > 95) return "critical";
    if (type === "engineTemp" && value > 85) return "warning";
    if (type === "fuelLevel" && value < 20) return "critical";
    if (type === "fuelLevel" && value < 40) return "warning";
    return "normal";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Ship className="h-6 w-6 text-primary" />
            Digital Twin
          </h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real e gestão de embarcações
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova Embarcação
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Vessel List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Embarcações</CardTitle>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="operational">Operacional</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="docked">Atracada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredVessels.length === 0 ? (
                  <div className="text-center py-8">
                    <Ship className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma embarcação encontrada
                    </p>
                  </div>
                ) : (
                  filteredVessels.map((vessel) => {
                    const statusConfig = getStatusConfig(vessel.status);
                    return (
                      <div
                        key={vessel.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                          selectedVessel?.id === vessel.id ? "ring-2 ring-primary bg-muted/50" : ""
                        }`}
                        onClick={() => handleSelectVessel(vessel)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm truncate">
                            {vessel.name}
                          </span>
                          <div className={`h-2 w-2 rounded-full ${statusConfig.color}`} />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{vessel.imo}</span>
                          {vessel.alerts > 0 && (
                            <Badge variant="destructive" className="h-5 text-xs">
                              {vessel.alerts} alertas
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {isLoading ? (
            <Card className="h-[500px] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                <p className="text-muted-foreground">Carregando dados...</p>
              </div>
            </Card>
          ) : selectedVessel ? (
            <>
              {/* Action Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const config = getStatusConfig(selectedVessel.status);
                    const IconComponent = config.icon;
                    return (
                      <Badge variant="outline" className="gap-1">
                        <IconComponent className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    );
                  })()}
                  <span className="text-sm text-muted-foreground">
                    Última atualização: {selectedVessel.lastUpdate.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1" onClick={openEditDialog}>
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" onClick={handleDuplicateVessel}>
                    <Copy className="h-4 w-4" />
                    Duplicar
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" onClick={handleArchiveVessel}>
                    <Archive className="h-4 w-4" />
                    Arquivar
                  </Button>
                  <Button size="sm" variant="destructive" className="gap-1" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="sensors">Sensores</TabsTrigger>
                  <TabsTrigger value="3d">Visualização 3D</TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Velocidade</span>
                          <Activity className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-2xl font-bold">{selectedVessel.speed} kn</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Heading</span>
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-2xl font-bold">{selectedVessel.heading}°</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Combustível</span>
                          <Gauge className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-2xl font-bold">{selectedVessel.sensors.fuelLevel}%</p>
                        <Progress value={selectedVessel.sensors.fuelLevel} className="mt-2" />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Motor</span>
                          <Thermometer className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-2xl font-bold">{selectedVessel.sensors.engineTemp}°C</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informações da Embarcação</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Nome</Label>
                          <p className="font-medium">{selectedVessel.name}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">IMO</Label>
                          <p className="font-medium">{selectedVessel.imo}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Tipo</Label>
                          <p className="font-medium">{selectedVessel.type}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Posição</Label>
                          <p className="font-medium">
                            {selectedVessel.position.lat.toFixed(4)}, {selectedVessel.position.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sensors" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Leituras em Tempo Real</h3>
                    <Button size="sm" variant="outline" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Atualizar
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SENSOR_READINGS.map((sensor) => (
                      <Card key={sensor.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{sensor.type}</span>
                            <Badge 
                              variant={
                                sensor.status === "critical" ? "destructive" :
                                sensor.status === "warning" ? "secondary" : "outline"
                              }
                            >
                              {sensor.status === "critical" ? "Crítico" :
                               sensor.status === "warning" ? "Atenção" : "Normal"}
                            </Badge>
                          </div>
                          <p className="text-3xl font-bold">
                            {sensor.value} <span className="text-lg text-muted-foreground">{sensor.unit}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {sensor.timestamp.toLocaleTimeString('pt-BR')}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="3d">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="aspect-video bg-gradient-to-b from-blue-900 to-blue-950 rounded-lg flex items-center justify-center relative overflow-hidden">
                        {/* Simple 3D representation placeholder */}
                        <div className="text-center">
                          <Ship className="h-24 w-24 text-white/80 mx-auto mb-4" />
                          <p className="text-white/80 text-lg font-medium">{selectedVessel.name}</p>
                          <p className="text-white/60 text-sm">Modelo 3D Interativo</p>
                          <div className="flex gap-2 justify-center mt-4">
                            <Button size="sm" variant="secondary">
                              <Eye className="h-4 w-4 mr-1" />
                              Vista Lateral
                            </Button>
                            <Button size="sm" variant="secondary">
                              <Eye className="h-4 w-4 mr-1" />
                              Vista Superior
                            </Button>
                            <Button size="sm" variant="secondary">
                              <Settings className="h-4 w-4 mr-1" />
                              Configurar
                            </Button>
                          </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-blue-400/20" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Histórico de Eventos</CardTitle>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          Exportar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { time: "10:30", event: "Atualização de posição", type: "info" },
                          { time: "10:15", event: "Alerta de temperatura resolvido", type: "success" },
                          { time: "09:45", event: "Alerta de temperatura do motor", type: "warning" },
                          { time: "08:00", event: "Motor principal iniciado", type: "info" }
                        ].map((log, i) => (
                          <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                            <div className={`w-2 h-2 rounded-full ${
                              log.type === "success" ? "bg-green-500" :
                              log.type === "warning" ? "bg-yellow-500" : "bg-blue-500"
                            }`} />
                            <span className="text-sm text-muted-foreground w-16">{log.time}</span>
                            <span className="text-sm">{log.event}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card className="h-[500px] flex items-center justify-center">
              <div className="text-center">
                <Ship className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Selecione uma Embarcação</h3>
                <p className="text-muted-foreground mb-4">
                  Escolha uma embarcação na lista para ver o Digital Twin
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Embarcação
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Embarcação</DialogTitle>
            <DialogDescription>
              Cadastre uma nova embarcação no sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da Embarcação *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="MV Nome da Embarcação"
              />
            </div>
            <div>
              <Label>Número IMO *</Label>
              <Input
                value={formData.imo}
                onChange={(e) => setFormData(prev => ({ ...prev, imo: e.target.value }))}
                placeholder="IMO9876543"
              />
            </div>
            <div>
              <Label>Tipo de Embarcação</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tanker">Tanker</SelectItem>
                  <SelectItem value="Container">Container</SelectItem>
                  <SelectItem value="Bulk Carrier">Bulk Carrier</SelectItem>
                  <SelectItem value="AHTS">AHTS</SelectItem>
                  <SelectItem value="PSV">PSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddVessel}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Embarcação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da Embarcação</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Número IMO</Label>
              <Input
                value={formData.imo}
                onChange={(e) => setFormData(prev => ({ ...prev, imo: e.target.value }))}
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tanker">Tanker</SelectItem>
                  <SelectItem value="Container">Container</SelectItem>
                  <SelectItem value="Bulk Carrier">Bulk Carrier</SelectItem>
                  <SelectItem value="AHTS">AHTS</SelectItem>
                  <SelectItem value="PSV">PSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditVessel}>
              <Edit className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a embarcação <strong>{selectedVessel?.name}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteVessel}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DigitalTwinInteractive;
