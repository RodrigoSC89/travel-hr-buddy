/**
 * Gestão Detalhada de Tanques - MARPOL Compliant
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Droplets,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  Fuel,
  Ship,
  FileText,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface Tank {
  id: string;
  name: string;
  type: "oily" | "sewage" | "bilge" | "sludge" | "garbage";
  capacity: number;
  currentLevel: number;
  unit: string;
  status: "ok" | "warning" | "critical";
  lastDischarge: string;
  lastInspection: string;
  nextInspection: string;
  vessel: string;
}

const initialTanks: Tank[] = [
  { id: "1", name: "Tanque de Óleo Usado", type: "oily", capacity: 5000, currentLevel: 3200, unit: "L", status: "warning", lastDischarge: "2024-01-10", lastInspection: "2024-01-01", nextInspection: "2024-04-01", vessel: "PSV Atlantic Explorer" },
  { id: "2", name: "Tanque de Esgoto", type: "sewage", capacity: 8000, currentLevel: 2100, unit: "L", status: "ok", lastDischarge: "2024-01-12", lastInspection: "2024-01-05", nextInspection: "2024-04-05", vessel: "PSV Atlantic Explorer" },
  { id: "3", name: "Água de Porão", type: "bilge", capacity: 3000, currentLevel: 2800, unit: "L", status: "critical", lastDischarge: "2024-01-05", lastInspection: "2024-01-02", nextInspection: "2024-04-02", vessel: "AHTS Pacific Star" },
  { id: "4", name: "Tanque de Lodo", type: "sludge", capacity: 2000, currentLevel: 1200, unit: "L", status: "warning", lastDischarge: "2024-01-08", lastInspection: "2024-01-03", nextInspection: "2024-04-03", vessel: "OSV Caribbean Wind" },
  { id: "5", name: "Resíduos Sólidos", type: "garbage", capacity: 500, currentLevel: 180, unit: "kg", status: "ok", lastDischarge: "2024-01-14", lastInspection: "2024-01-06", nextInspection: "2024-04-06", vessel: "PSV Gulf Stream" },
];

const typeLabels = {
  oily: { label: "Óleo Usado", color: "bg-amber-500", icon: Fuel },
  sewage: { label: "Esgoto", color: "bg-stone-500", icon: Droplets },
  bilge: { label: "Água de Porão", color: "bg-blue-500", icon: Droplets },
  sludge: { label: "Lodo", color: "bg-orange-500", icon: Droplets },
  garbage: { label: "Resíduos Sólidos", color: "bg-green-500", icon: Trash2 },
};

export function TanksManagement() {
  const [tanks, setTanks] = useState<Tank[]>(initialTanks);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDischargeDialogOpen, setIsDischargeDialogOpen] = useState(false);
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null);
  const [filterVessel, setFilterVessel] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const [newTank, setNewTank] = useState({
    name: "",
    type: "oily" as Tank["type"],
    capacity: 0,
    currentLevel: 0,
    unit: "L",
    vessel: "",
  });

  const [dischargeData, setDischargeData] = useState({
    quantity: 0,
    location: "",
    method: "",
    notes: "",
  });

  const handleAddTank = () => {
    const tank: Tank = {
      id: Date.now().toString(),
      ...newTank,
      status: "ok",
      lastDischarge: "-",
      lastInspection: new Date().toISOString().split("T")[0],
      nextInspection: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };
    setTanks([...tanks, tank]);
    setIsAddDialogOpen(false);
    setNewTank({ name: "", type: "oily", capacity: 0, currentLevel: 0, unit: "L", vessel: "" });
    toast.success("Tanque adicionado com sucesso!");
  };

  const handleDischarge = () => {
    if (!selectedTank) return;
    
    const updatedTanks = tanks.map(t => {
      if (t.id === selectedTank.id) {
        const newLevel = Math.max(0, t.currentLevel - dischargeData.quantity);
        return {
          ...t,
          currentLevel: newLevel,
          lastDischarge: new Date().toISOString().split("T")[0],
          status: newLevel / t.capacity < 0.6 ? "ok" : newLevel / t.capacity < 0.8 ? "warning" : "critical",
        };
      }
      return t;
    });
    
    setTanks(updatedTanks as Tank[]);
    setIsDischargeDialogOpen(false);
    setDischargeData({ quantity: 0, location: "", method: "", notes: "" });
    toast.success(`Descarte de ${dischargeData.quantity} ${selectedTank.unit} registrado!`);
  };

  const handleDeleteTank = (id: string) => {
    setTanks(tanks.filter(t => t.id !== id));
    toast.success("Tanque removido!");
  };

  const filteredTanks = tanks.filter(tank => {
    if (filterVessel !== "all" && tank.vessel !== filterVessel) return false;
    if (filterType !== "all" && tank.type !== filterType) return false;
    return true;
  });

  const vessels = [...new Set(tanks.map(t => t.vessel))];

  const criticalCount = tanks.filter(t => t.status === "critical").length;
  const warningCount = tanks.filter(t => t.status === "warning").length;
  const totalCapacity = tanks.reduce((acc, t) => acc + t.capacity, 0);
  const totalUsed = tanks.reduce((acc, t) => acc + t.currentLevel, 0);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Tanques</p>
                <p className="text-2xl font-bold">{tanks.length}</p>
              </div>
              <Droplets className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ocupação Média</p>
                <p className="text-2xl font-bold">{Math.round((totalUsed / totalCapacity) * 100)}%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Alerta</p>
                <p className="text-2xl font-bold">{warningCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Select value={filterVessel} onValueChange={setFilterVessel}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por embarcação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Embarcações</SelectItem>
              {vessels.map(v => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              {Object.entries(typeLabels).map(([key, val]) => (
                <SelectItem key={key} value={key}>{val.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Tanque
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Tanque</DialogTitle>
              <DialogDescription>
                Cadastre um novo tanque de resíduos para monitoramento.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Tanque</Label>
                <Input
                  id="name"
                  value={newTank.name}
                  onChange={(e) => setNewTank({ ...newTank, name: e.target.value })}
                  placeholder="Ex: Tanque de Óleo Usado #2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select value={newTank.type} onValueChange={(v: Tank["type"]) => setNewTank({ ...newTank, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Embarcação</Label>
                  <Select value={newTank.vessel} onValueChange={(v) => setNewTank({ ...newTank, vessel: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {vessels.map(v => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Capacidade</Label>
                  <Input
                    type="number"
                    value={newTank.capacity}
                    onChange={(e) => setNewTank({ ...newTank, capacity: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Nível Atual</Label>
                  <Input
                    type="number"
                    value={newTank.currentLevel}
                    onChange={(e) => setNewTank({ ...newTank, currentLevel: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Unidade</Label>
                  <Select value={newTank.unit} onValueChange={(v) => setNewTank({ ...newTank, unit: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Litros (L)</SelectItem>
                      <SelectItem value="m³">Metros Cúbicos (m³)</SelectItem>
                      <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddTank}>Adicionar Tanque</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tanks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTanks.map((tank) => {
          const TypeIcon = typeLabels[tank.type].icon;
          const percentage = Math.round((tank.currentLevel / tank.capacity) * 100);
          
          return (
            <Card key={tank.id} className={`relative overflow-hidden ${
              tank.status === "critical" ? "border-red-500/50" : 
              tank.status === "warning" ? "border-amber-500/50" : ""
            }`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${typeLabels[tank.type].color} text-white`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    {tank.name}
                  </CardTitle>
                  <Badge variant={tank.status === "critical" ? "destructive" : tank.status === "warning" ? "secondary" : "outline"}>
                    {tank.status === "critical" ? "Crítico" : tank.status === "warning" ? "Atenção" : "Normal"}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <Ship className="h-3 w-3" />
                  {tank.vessel}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{tank.currentLevel} / {tank.capacity} {tank.unit}</span>
                    <span className={percentage > 80 ? "text-red-500 font-medium" : percentage > 60 ? "text-amber-500 font-medium" : "text-muted-foreground"}>
                      {percentage}%
                    </span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={`h-3 ${tank.status === "critical" ? "[&>div]:bg-red-500" : tank.status === "warning" ? "[&>div]:bg-amber-500" : "[&>div]:bg-green-500"}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Último descarte: {tank.lastDischarge}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Próx. inspeção: {tank.nextInspection}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedTank(tank);
                      setIsDischargeDialogOpen(true);
                    }}
                  >
                    <TrendingDown className="h-4 w-4 mr-1" />
                    Registrar Descarte
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteTank(tank.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Discharge Dialog */}
      <Dialog open={isDischargeDialogOpen} onOpenChange={setIsDischargeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Descarte</DialogTitle>
            <DialogDescription>
              {selectedTank?.name} - Nível atual: {selectedTank?.currentLevel} {selectedTank?.unit}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Quantidade Descartada ({selectedTank?.unit})</Label>
              <Input
                type="number"
                value={dischargeData.quantity}
                onChange={(e) => setDischargeData({ ...dischargeData, quantity: Number(e.target.value) })}
                max={selectedTank?.currentLevel}
              />
            </div>
            <div className="grid gap-2">
              <Label>Local de Descarte</Label>
              <Input
                value={dischargeData.location}
                onChange={(e) => setDischargeData({ ...dischargeData, location: e.target.value })}
                placeholder="Ex: Porto de Macaé"
              />
            </div>
            <div className="grid gap-2">
              <Label>Método de Descarte</Label>
              <Select 
                value={dischargeData.method} 
                onValueChange={(v) => setDischargeData({ ...dischargeData, method: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empresa_credenciada">Empresa Credenciada</SelectItem>
                  <SelectItem value="caminhao_limpa_fossa">Caminhão Limpa-fossa</SelectItem>
                  <SelectItem value="rerrefino">Re-refino</SelectItem>
                  <SelectItem value="incineracao">Incineração</SelectItem>
                  <SelectItem value="aterro_sanitario">Aterro Sanitário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Observações</Label>
              <Textarea
                value={dischargeData.notes}
                onChange={(e) => setDischargeData({ ...dischargeData, notes: e.target.value })}
                placeholder="Informações adicionais sobre o descarte..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDischargeDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleDischarge}>Confirmar Descarte</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
