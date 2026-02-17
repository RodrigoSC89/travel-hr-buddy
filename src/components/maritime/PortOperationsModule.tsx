import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Container, Anchor, Clock, Ship, Package, Truck, 
  ArrowUpDown, AlertTriangle, CheckCircle2, Timer,
  TrendingUp, Calendar, Search, Filter, Brain, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PortOperation {
  id: string;
  vesselName: string;
  port: string;
  berth: string;
  operationType: 'loading' | 'unloading' | 'bunkering' | 'maintenance';
  status: 'scheduled' | 'in_progress' | 'delayed' | 'completed';
  progress: number;
  eta: string;
  etd: string;
  cargoType: string;
  cargoTonnage: number;
  cranes: number;
  gangsWorking: number;
  efficiency: number;
}

const operations: PortOperation[] = [
  {
    id: '1',
    vesselName: 'MV Nautilus Star',
    port: 'Santos',
    berth: 'Berth 12A',
    operationType: 'loading',
    status: 'in_progress',
    progress: 65,
    eta: '2024-12-30T08:00',
    etd: '2025-01-02T14:00',
    cargoType: 'Containers',
    cargoTonnage: 25000,
    cranes: 3,
    gangsWorking: 2,
    efficiency: 94
  },
  {
    id: '2',
    vesselName: 'MV Ocean Pride',
    port: 'Rio de Janeiro',
    berth: 'Terminal 5',
    operationType: 'unloading',
    status: 'in_progress',
    progress: 82,
    eta: '2024-12-28T06:00',
    etd: '2024-12-31T10:00',
    cargoType: 'Bulk Grain',
    cargoTonnage: 45000,
    cranes: 2,
    gangsWorking: 3,
    efficiency: 88
  },
  {
    id: '3',
    vesselName: 'MV Atlantic Voyager',
    port: 'Paranaguá',
    berth: 'Berth 8',
    operationType: 'bunkering',
    status: 'scheduled',
    progress: 0,
    eta: '2025-01-05T12:00',
    etd: '2025-01-05T20:00',
    cargoType: 'Marine Fuel',
    cargoTonnage: 2500,
    cranes: 0,
    gangsWorking: 0,
    efficiency: 0
  },
  {
    id: '4',
    vesselName: 'MV Pacific Dream',
    port: 'Itajaí',
    berth: 'Pier 3',
    operationType: 'loading',
    status: 'delayed',
    progress: 35,
    eta: '2024-12-27T14:00',
    etd: '2024-12-30T08:00',
    cargoType: 'Refrigerated Cargo',
    cargoTonnage: 12000,
    cranes: 2,
    gangsWorking: 1,
    efficiency: 72
  }
];

const operationTypeConfig = {
  loading: { label: 'Carregamento', color: 'bg-info/20 text-info', icon: ArrowUpDown },
  unloading: { label: 'Descarga', color: 'bg-warning/20 text-warning', icon: Package },
  bunkering: { label: 'Abastecimento', color: 'bg-primary/20 text-primary', icon: Container },
  maintenance: { label: 'Manutenção', color: 'bg-accent/20 text-accent-foreground', icon: Anchor }
};

const statusConfig = {
  scheduled: { label: 'Agendado', color: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'Em Andamento', color: 'bg-success/20 text-success' },
  delayed: { label: 'Atrasado', color: 'bg-destructive/20 text-destructive' },
  completed: { label: 'Concluído', color: 'bg-info/20 text-info' }
};

export function PortOperationsModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredOperations = operations.filter(op => {
    const matchesSearch = 
      op.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.port.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && op.status === activeTab;
  });

  const stats = {
    inProgress: operations.filter(o => o.status === 'in_progress').length,
    delayed: operations.filter(o => o.status === 'delayed').length,
    avgEfficiency: Math.round(operations.filter(o => o.efficiency > 0).reduce((a, o) => a + o.efficiency, 0) / operations.filter(o => o.efficiency > 0).length),
    totalTonnage: operations.reduce((a, o) => a + o.cargoTonnage, 0)
  };

  const handleOptimize = (operation: PortOperation) => {
    toast.success(`IA otimizando operação: ${operation.vesselName}`, {
      description: 'Calculando melhor alocação de recursos...'
    });
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
              <Ship className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atrasados</p>
                <p className="text-2xl font-bold text-destructive">{stats.delayed}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eficiência Média</p>
                <p className="text-2xl font-bold">{stats.avgEfficiency}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tonelagem Total</p>
                <p className="text-2xl font-bold">{(stats.totalTonnage / 1000).toFixed(0)}K</p>
              </div>
              <Package className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar embarcação ou porto..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="in_progress">Em Andamento</TabsTrigger>
            <TabsTrigger value="delayed">Atrasadas</TabsTrigger>
            <TabsTrigger value="scheduled">Agendadas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Operations List */}
      <div className="space-y-4">
        {filteredOperations.map((operation) => {
          const OpIcon = operationTypeConfig[operation.operationType].icon;
          
          return (
            <Card key={operation.id} className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Vessel Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Ship className="h-6 w-6 text-primary" />
                      <h3 className="text-lg font-semibold">{operation.vesselName}</h3>
                      <Badge className={statusConfig[operation.status].color}>
                        {statusConfig[operation.status].label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Anchor className="h-4 w-4" />
                        {operation.port} - {operation.berth}
                      </span>
                      <Badge className={operationTypeConfig[operation.operationType].color}>
                        <OpIcon className="h-3 w-3 mr-1" />
                        {operationTypeConfig[operation.operationType].label}
                      </Badge>
                      <span>{operation.cargoType} ({operation.cargoTonnage.toLocaleString()} t)</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="w-full lg:w-48">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{operation.progress}%</span>
                    </div>
                    <Progress value={operation.progress} className="h-2" />
                  </div>

                  {/* Resources */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold">{operation.cranes}</p>
                      <p className="text-xs text-muted-foreground">Guindastes</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{operation.gangsWorking}</p>
                      <p className="text-xs text-muted-foreground">Equipes</p>
                    </div>
                    <div>
                     <p className={cn(
                        "text-lg font-bold",
                        operation.efficiency >= 90 ? 'text-success' :
                        operation.efficiency >= 80 ? 'text-warning' : 'text-destructive'
                      )}>
                        {operation.efficiency > 0 ? `${operation.efficiency}%` : '-'}
                      </p>
                      <p className="text-xs text-muted-foreground">Eficiência</p>
                    </div>
                  </div>

                  {/* Times */}
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-success" />
                      <span className="text-muted-foreground">ETA:</span>
                      <span>{new Date(operation.eta).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-info" />
                      <span className="text-muted-foreground">ETD:</span>
                      <span>{new Date(operation.etd).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOptimize(operation)}
                  >
                    <Brain className="h-4 w-4 mr-1" />
                    Otimizar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Insights */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Insights de IA - Operações Portuárias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Alerta de Congestionamento
              </h4>
              <p className="text-sm text-muted-foreground">
                Porto de Santos com 85% de ocupação. Considere ajustar ETAs para janelas alternativas.
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                Otimização Sugerida
              </h4>
              <p className="text-sm text-muted-foreground">
                Adicionar 1 guindaste ao MV Pacific Dream pode reduzir tempo de operação em 18%.
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-info" />
                Previsão Meteorológica
              </h4>
              <p className="text-sm text-muted-foreground">
                Ventos fortes previstos em Paranaguá dia 05/01. Operações podem ser afetadas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
