import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wrench,
  Settings,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  QrCode,
  Gauge,
  Battery,
  Thermometer,
  Zap,
  Fuel,
  Activity,
  MapPin,
} from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  type: "safety" | "navigation" | "communication" | "propulsion" | "electrical" | "fire-safety";
  model: string;
  serialNumber: string;
  location: string;
  status: "operational" | "maintenance" | "failure" | "offline";
  lastMaintenance: string;
  nextMaintenance: string;
  condition: number; // 0-100
  criticality: "low" | "medium" | "high" | "critical";
}

interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  type: "preventive" | "corrective" | "emergency" | "inspection";
  description: string;
  performedBy: string;
  performedAt: string;
  duration: number;
  cost: number;
  partsUsed: string[];
  nextAction?: string;
}

export const PeotramEquipmentManager: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>(getDemoEquipment());
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(
    getDemoMaintenanceRecords()
  );
  const [isNewEquipmentOpen, setIsNewEquipmentOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  function getDemoEquipment(): Equipment[] {
    return [
      {
        id: "EQ001",
        name: "Radar de Navegação Principal",
        type: "navigation",
        model: "NavTech 5000X",
        serialNumber: "NT5000X-2024-001",
        location: "Ponte de Comando",
        status: "operational",
        lastMaintenance: "2024-01-15",
        nextMaintenance: "2024-04-15",
        condition: 92,
        criticality: "critical",
      },
      {
        id: "EQ002",
        name: "Motor Principal Port",
        type: "propulsion",
        model: "MarineEngine 2000HP",
        serialNumber: "ME2000-2023-015",
        location: "Praça de Máquinas",
        status: "maintenance",
        lastMaintenance: "2024-01-20",
        nextMaintenance: "2024-02-20",
        condition: 78,
        criticality: "critical",
      },
      {
        id: "EQ003",
        name: "Sistema de Combate a Incêndio",
        type: "fire-safety",
        model: "FireSafe Pro",
        serialNumber: "FSP-2024-008",
        location: "Distribuído",
        status: "operational",
        lastMaintenance: "2024-01-10",
        nextMaintenance: "2024-07-10",
        condition: 95,
        criticality: "critical",
      },
    ];
  }

  function getDemoMaintenanceRecords(): MaintenanceRecord[] {
    return [
      {
        id: "MR001",
        equipmentId: "EQ001",
        type: "preventive",
        description: "Inspeção geral e calibração do radar",
        performedBy: "Carlos Silva",
        performedAt: "2024-01-15",
        duration: 4,
        cost: 1200,
        partsUsed: ["Filtro de ar", "Óleo lubrificante"],
        nextAction: "Verificar alinhamento em 3 meses",
      },
      {
        id: "MR002",
        equipmentId: "EQ002",
        type: "corrective",
        description: "Substituição de válvula de pressão",
        performedBy: "João Santos",
        performedAt: "2024-01-20",
        duration: 6,
        cost: 2500,
        partsUsed: ["Válvula pressão", "Vedações", "Parafusos"],
        nextAction: "Monitorar pressão por 2 semanas",
      },
    ];
  }

  const getStatusColor = (status: string) => {
    switch (status) {
    case "operational":
      return "bg-success/20 text-success border-success/30";
    case "maintenance":
      return "bg-warning/20 text-warning border-warning/30";
    case "failure":
      return "bg-destructive/20 text-destructive border-destructive/30";
    case "offline":
      return "bg-muted/20 text-muted-foreground border-muted/30";
    default:
      return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
    case "critical":
      return "bg-destructive/20 text-destructive border-destructive/30";
    case "high":
      return "bg-warning/20 text-warning border-warning/30";
    case "medium":
      return "bg-info/20 text-info border-info/30";
    case "low":
      return "bg-muted/20 text-muted-foreground border-muted/30";
    default:
      return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "navigation":
      return <MapPin className="w-4 h-4" />;
    case "propulsion":
      return <Fuel className="w-4 h-4" />;
    case "electrical":
      return <Zap className="w-4 h-4" />;
    case "fire-safety":
      return <AlertTriangle className="w-4 h-4" />;
    case "communication":
      return <Activity className="w-4 h-4" />;
    case "safety":
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Settings className="w-4 h-4" />;
    }
  };

  const getConditionColor = (condition: number) => {
    if (condition >= 90) return "text-success";
    if (condition >= 70) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Equipamentos</h2>
          <p className="text-muted-foreground">
            Monitoramento e manutenção de equipamentos críticos
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <QrCode className="w-4 h-4 mr-2" />
            Escanear QR
          </Button>
          <Dialog open={isNewEquipmentOpen} onOpenChange={setIsNewEquipmentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Equipamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Equipamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipment-name">Nome</Label>
                    <Input id="equipment-name" placeholder="Nome do equipamento" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="equipment-type">Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de equipamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="navigation">Navegação</SelectItem>
                        <SelectItem value="propulsion">Propulsão</SelectItem>
                        <SelectItem value="electrical">Elétrico</SelectItem>
                        <SelectItem value="fire-safety">Combate a Incêndio</SelectItem>
                        <SelectItem value="communication">Comunicação</SelectItem>
                        <SelectItem value="safety">Segurança</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipment-model">Modelo</Label>
                    <Input id="equipment-model" placeholder="Modelo do equipamento" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="equipment-serial">Número de Série</Label>
                    <Input id="equipment-serial" placeholder="Número de série" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipment-location">Localização</Label>
                  <Input id="equipment-location" placeholder="Local de instalação" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewEquipmentOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsNewEquipmentOpen(false)}>Cadastrar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{equipment.length}</p>
                    <p className="text-sm text-muted-foreground">Total Equipamentos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-8 h-8 text-success" />
                  <div>
                    <p className="text-2xl font-bold">
                      {equipment.filter(e => e.status === "operational").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Operacionais</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Wrench className="w-8 h-8 text-warning" />
                  <div>
                    <p className="text-2xl font-bold">
                      {equipment.filter(e => e.status === "maintenance").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Em Manutenção</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                  <div>
                    <p className="text-2xl font-bold">
                      {equipment.filter(e => e.status === "failure").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Com Falha</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Equipamentos Críticos - Próximas Manutenções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {equipment
                  .filter(e => e.criticality === "critical")
                  .map(eq => (
                    <div
                      key={eq.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getTypeIcon(eq.type)}
                        <div>
                          <p className="font-medium">{eq.name}</p>
                          <p className="text-sm text-muted-foreground">{eq.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm">Próxima manutenção:</p>
                          <p className="text-sm font-medium">
                            {new Date(eq.nextMaintenance).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`text-2xl font-bold ${getConditionColor(eq.condition)}`}>
                          {eq.condition}%
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipment.map(eq => (
              <Card key={eq.id} className="cursor-pointer hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(eq.type)}
                      <CardTitle className="text-lg">{eq.name}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getStatusColor(eq.status)}>
                        {eq.status}
                      </Badge>
                      <Badge variant="outline" className={getCriticalityColor(eq.criticality)}>
                        {eq.criticality}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {eq.model} - {eq.serialNumber}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{eq.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(eq.nextMaintenance).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Condição</span>
                      <span className={getConditionColor(eq.condition)}>{eq.condition}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          eq.condition >= 90
                            ? "bg-success"
                            : eq.condition >= 70
                              ? "bg-warning"
                              : "bg-destructive"
                        }`}
                        style={{ width: `${eq.condition}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Wrench className="w-3 h-3 mr-1" />
                      Manutenção
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Gauge className="w-3 h-3 mr-1" />
                      Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="space-y-4">
            {maintenanceRecords.map(record => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{record.description}</CardTitle>
                      <CardDescription>
                        {equipment.find(e => e.id === record.equipmentId)?.name}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        record.type === "emergency"
                          ? "bg-destructive/20 text-destructive border-destructive/30"
                          : record.type === "corrective"
                            ? "bg-warning/20 text-warning border-warning/30"
                            : "bg-info/20 text-info border-info/30"
                      }
                    >
                      {record.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Executado por:</p>
                      <p className="font-medium">{record.performedBy}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duração:</p>
                      <p className="font-medium">{record.duration}h</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Custo:</p>
                      <p className="font-medium">R$ {record.cost.toLocaleString()}</p>
                    </div>
                  </div>

                  {record.partsUsed.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Peças utilizadas:</p>
                      <div className="flex flex-wrap gap-2">
                        {record.partsUsed.map((part, index) => (
                          <Badge key={index} variant="secondary">
                            {part}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {record.nextAction && (
                    <div className="p-3 bg-info/10 rounded-lg">
                      <p className="text-sm">
                        <strong>Próxima ação:</strong> {record.nextAction}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="text-center p-8">
            <Gauge className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Análise de Performance</h3>
            <p className="text-muted-foreground mb-4">
              Relatórios detalhados sobre performance e custos de manutenção
            </p>
            <Button>
              <Activity className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
