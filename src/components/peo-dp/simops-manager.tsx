import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Layers,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Ship,
  Anchor,
  Target,
  Shield,
  Zap,
  Radio,
  Eye,
  Plus,
  Calendar,
  Users,
  Activity,
  CircleDot,
  AlertCircle
} from "lucide-react";

interface SimopsOperation {
  id: string;
  name: string;
  type: "ROV" | "Diving" | "Crane" | "Offloading" | "Anchor" | "Survey";
  status: "planned" | "active" | "paused" | "completed";
  vessel: string;
  startTime: string;
  endTime?: string;
  zone: { radius: number; center: { lat: number; lon: number } };
  personnel: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  restrictions: string[];
}

interface SimopsConflict {
  id: string;
  type: "zone_overlap" | "resource_conflict" | "environmental" | "timing";
  severity: "warning" | "critical";
  operations: string[];
  description: string;
  recommendation: string;
}

interface SimopsZone {
  id: string;
  name: string;
  type: "exclusion" | "caution" | "operational";
  radius: number;
  center: { lat: number; lon: number };
  active: boolean;
}

const mockOperations: SimopsOperation[] = [
  {
    id: "SIMOP-001",
    name: "ROV Inspeção Riser #3",
    type: "ROV",
    status: "active",
    vessel: "MV Atlantic Explorer",
    startTime: "2024-12-04T08:00:00",
    zone: { radius: 200, center: { lat: -22.9068, lon: -43.1729 } },
    personnel: 6,
    riskLevel: "medium",
    restrictions: ["Sem manobras de guindaste", "DP modo TAM obrigatório"]
  },
  {
    id: "SIMOP-002",
    name: "Offloading FPSO Santos",
    type: "Offloading",
    status: "active",
    vessel: "MV Atlantic Explorer",
    startTime: "2024-12-04T06:00:00",
    zone: { radius: 500, center: { lat: -22.9070, lon: -43.1730 } },
    personnel: 12,
    riskLevel: "high",
    restrictions: ["Zona de 500m exclusiva", "Comunicação contínua com FPSO"]
  },
  {
    id: "SIMOP-003",
    name: "Crane Operation - Deck Cargo",
    type: "Crane",
    status: "planned",
    vessel: "MV Atlantic Explorer",
    startTime: "2024-12-04T14:00:00",
    zone: { radius: 50, center: { lat: -22.9068, lon: -43.1729 } },
    personnel: 4,
    riskLevel: "medium",
    restrictions: ["ROV deve estar recolhido", "Vento máximo 25 kn"]
  },
  {
    id: "SIMOP-004",
    name: "Survey Batimétrico",
    type: "Survey",
    status: "planned",
    vessel: "OSV Petrobras XXI",
    startTime: "2024-12-04T10:00:00",
    zone: { radius: 300, center: { lat: -22.9100, lon: -43.1750 } },
    personnel: 3,
    riskLevel: "low",
    restrictions: []
  }
];

const mockConflicts: SimopsConflict[] = [
  {
    id: "CONF-001",
    type: "zone_overlap",
    severity: "warning",
    operations: ["SIMOP-001", "SIMOP-003"],
    description: "Operação de guindaste planejada conflita com ROV ativo",
    recommendation: "Aguardar finalização do ROV ou recolher equipamento antes de iniciar operação de guindaste"
  },
  {
    id: "CONF-002",
    type: "timing",
    severity: "critical",
    operations: ["SIMOP-002", "SIMOP-003"],
    description: "Operação de guindaste durante offloading viola procedimentos de segurança",
    recommendation: "Reprogramar operação de guindaste para após conclusão do offloading"
  }
];

const mockZones: SimopsZone[] = [
  { id: "ZONE-001", name: "Zona de Exclusão FPSO", type: "exclusion", radius: 500, center: { lat: -22.9070, lon: -43.1730 }, active: true },
  { id: "ZONE-002", name: "Área de Operação ROV", type: "operational", radius: 200, center: { lat: -22.9068, lon: -43.1729 }, active: true },
  { id: "ZONE-003", name: "Zona de Cautela", type: "caution", radius: 1000, center: { lat: -22.9070, lon: -43.1730 }, active: true }
];

const operationTypeConfig = {
  ROV: { icon: Target, color: "bg-blue-500" },
  Diving: { icon: Users, color: "bg-purple-500" },
  Crane: { icon: Anchor, color: "bg-yellow-500" },
  Offloading: { icon: Ship, color: "bg-orange-500" },
  Anchor: { icon: Anchor, color: "bg-green-500" },
  Survey: { icon: MapPin, color: "bg-cyan-500" }
};

export const SIMOPSManager: React.FC = () => {
  const [operations, setOperations] = useState<SimopsOperation[]>(mockOperations);
  const [conflicts] = useState<SimopsConflict[]>(mockConflicts);
  const [zones, setZones] = useState<SimopsZone[]>(mockZones);
  const [selectedOperation, setSelectedOperation] = useState<SimopsOperation | null>(null);
  const [showNewOperation, setShowNewOperation] = useState(false);

  const activeOperations = operations.filter(op => op.status === "active");
  const plannedOperations = operations.filter(op => op.status === "planned");
  const criticalConflicts = conflicts.filter(c => c.severity === "critical");

  const handleToggleZone = (zoneId: string) => {
    setZones(zones.map(z => z.id === zoneId ? { ...z, active: !z.active } : z));
    toast.success("Zona atualizada");
  };

  const handleStartOperation = (opId: string) => {
    setOperations(operations.map(op => op.id === opId ? { ...op, status: "active" } : op));
    toast.success("Operação iniciada");
  };

  const handlePauseOperation = (opId: string) => {
    setOperations(operations.map(op => op.id === opId ? { ...op, status: "paused" } : op));
    toast.warning("Operação pausada");
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "critical": return <Badge variant="destructive">Crítico</Badge>;
      case "high": return <Badge className="bg-orange-500">Alto</Badge>;
      case "medium": return <Badge className="bg-yellow-500 text-black">Médio</Badge>;
      default: return <Badge variant="secondary">Baixo</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500">Ativo</Badge>;
      case "planned": return <Badge className="bg-blue-500">Planejado</Badge>;
      case "paused": return <Badge className="bg-yellow-500 text-black">Pausado</Badge>;
      case "completed": return <Badge variant="secondary">Concluído</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Layers className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">SIMOPS Manager</h2>
            <p className="text-muted-foreground">Gerenciamento de Operações Simultâneas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Radio className="w-4 h-4 mr-2" />Comunicações</Button>
          <Button onClick={() => setShowNewOperation(true)}><Plus className="w-4 h-4 mr-2" />Nova Operação</Button>
        </div>
      </div>

      {/* Alerts */}
      {criticalConflicts.length > 0 && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-600">Conflitos Críticos Detectados ({criticalConflicts.length})</p>
                <div className="mt-2 space-y-2">
                  {criticalConflicts.map(conflict => (
                    <div key={conflict.id} className="p-2 bg-red-500/10 rounded border border-red-500/20">
                      <p className="text-sm font-medium">{conflict.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">Recomendação: {conflict.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Operações Ativas</p>
                <p className="text-2xl font-bold">{activeOperations.length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Planejadas</p>
                <p className="text-2xl font-bold">{plannedOperations.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zonas Ativas</p>
                <p className="text-2xl font-bold">{zones.filter(z => z.active).length}</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conflitos</p>
                <p className="text-2xl font-bold">{conflicts.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pessoal Envolvido</p>
                <p className="text-2xl font-bold">{activeOperations.reduce((acc, op) => acc + op.personnel, 0)}</p>
              </div>
              <Users className="h-8 w-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Operations Map Visualization */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Mapa de Operações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-[400px] bg-gradient-to-b from-blue-900/20 to-blue-950/40 rounded-lg border overflow-hidden">
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
              
              {/* Zones */}
              {zones.filter(z => z.active).map((zone, i) => {
                const colors = {
                  exclusion: "border-red-500 bg-red-500/10",
                  caution: "border-yellow-500 bg-yellow-500/10",
                  operational: "border-blue-500 bg-blue-500/10"
                };
                const sizes = { 500: "w-48 h-48", 200: "w-24 h-24", 1000: "w-64 h-64", 300: "w-32 h-32", 50: "w-12 h-12" };
                const size = sizes[zone.radius as keyof typeof sizes] || "w-24 h-24";
                
                return (
                  <div
                    key={zone.id}
                    className={`absolute rounded-full border-2 border-dashed ${colors[zone.type]} ${size}`}
                    style={{ top: `${30 + i * 10}%`, left: `${30 + i * 15}%`, transform: "translate(-50%, -50%)" }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <Badge variant="outline" className="text-xs">{zone.name}</Badge>
                    </div>
                  </div>
                );
              })}

              {/* Operations markers */}
              {operations.filter(op => op.status === "active" || op.status === "planned").map((op, i) => {
                const config = operationTypeConfig[op.type];
                const IconComponent = config.icon;
                
                return (
                  <div
                    key={op.id}
                    className={`absolute w-10 h-10 rounded-full ${config.color} flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${op.status === "active" ? "animate-pulse" : "opacity-60"}`}
                    style={{ top: `${40 + i * 15}%`, left: `${40 + i * 12}%` }}
                    onClick={() => setSelectedOperation(op)}
                  >
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                );
              })}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3">
                <p className="text-xs font-medium mb-2">Legenda</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full border-2 border-dashed border-red-500" />
                    <span>Zona de Exclusão</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full border-2 border-dashed border-yellow-500" />
                    <span>Zona de Cautela</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full border-2 border-dashed border-blue-500" />
                    <span>Zona Operacional</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operations List & Zones */}
        <div className="space-y-4">
          {/* Active Operations */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Operações Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[180px]">
                <div className="space-y-2">
                  {activeOperations.map(op => {
                    const config = operationTypeConfig[op.type];
                    const IconComponent = config.icon;
                    return (
                      <div key={op.id} className="p-2 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedOperation(op)}>
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${config.color}`}>
                            <IconComponent className="h-3 w-3 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{op.name}</p>
                            <p className="text-xs text-muted-foreground">{op.vessel}</p>
                          </div>
                          {getRiskBadge(op.riskLevel)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Zone Controls */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Controle de Zonas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {zones.map(zone => (
                  <div key={zone.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <CircleDot className={`h-4 w-4 ${zone.type === "exclusion" ? "text-red-500" : zone.type === "caution" ? "text-yellow-500" : "text-blue-500"}`} />
                      <div>
                        <p className="text-sm font-medium">{zone.name}</p>
                        <p className="text-xs text-muted-foreground">{zone.radius}m</p>
                      </div>
                    </div>
                    <Switch checked={zone.active} onCheckedChange={() => handleToggleZone(zone.id)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conflicts Panel */}
      {conflicts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Conflitos e Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {conflicts.map(conflict => (
                <div key={conflict.id} className={`p-4 rounded-lg border ${conflict.severity === "critical" ? "border-red-500/50 bg-red-500/5" : "border-yellow-500/50 bg-yellow-500/5"}`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${conflict.severity === "critical" ? "text-red-500" : "text-yellow-500"}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{conflict.description}</p>
                        <Badge variant={conflict.severity === "critical" ? "destructive" : "outline"}>{conflict.severity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">💡 {conflict.recommendation}</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">Aceitar Recomendação</Button>
                        <Button size="sm" variant="ghost">Ignorar</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operation Detail Dialog */}
      <Dialog open={!!selectedOperation} onOpenChange={() => setSelectedOperation(null)}>
        <DialogContent className="max-w-2xl">
          {selectedOperation && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedOperation.name}
                  {getStatusBadge(selectedOperation.status)}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium">{selectedOperation.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Embarcação</p>
                    <p className="font-medium">{selectedOperation.vessel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Início</p>
                    <p className="font-medium">{new Date(selectedOperation.startTime).toLocaleString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nível de Risco</p>
                    {getRiskBadge(selectedOperation.riskLevel)}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Restrições</p>
                  <div className="space-y-1">
                    {selectedOperation.restrictions.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-yellow-500" />
                        {r}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  {selectedOperation.status === "planned" && (
                    <Button onClick={() => { handleStartOperation(selectedOperation.id); setSelectedOperation(null); }}>
                      <Zap className="w-4 h-4 mr-2" />Iniciar Operação
                    </Button>
                  )}
                  {selectedOperation.status === "active" && (
                    <Button variant="outline" onClick={() => { handlePauseOperation(selectedOperation.id); setSelectedOperation(null); }}>
                      <Clock className="w-4 h-4 mr-2" />Pausar Operação
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SIMOPSManager;
