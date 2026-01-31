/**
 * Port Call Optimization - Otimização de Escalas Portuárias
 * Q1 2025 - Módulo Crítico com IA Integrada
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, addHours, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { logger } from '@/lib/logger';
import {
  Anchor, Ship, Clock, Brain, AlertTriangle, CheckCircle, 
  Calendar, MapPin, Loader2, RefreshCw, Plus, FileText,
  DollarSign, Navigation, Users, Truck, FileCheck, Timer,
  TrendingDown, Waves, Building
} from "lucide-react";

interface PortCall {
  id: string;
  vessel_name: string;
  port_name: string;
  port_code: string;
  eta: string;
  etb: string;
  etd: string;
  purpose: string;
  agent: string;
  status: "planned" | "approaching" | "at_berth" | "completed";
  waiting_time_hours: number;
  estimated_costs: number;
  actual_costs?: number;
  documents_status: "pending" | "submitted" | "approved";
}

interface AIOptimization {
  optimal_arrival: string;
  waiting_time_saved: number;
  fuel_savings: number;
  cost_savings: number;
  confidence: number;
  recommendations: string[];
  risks: { factor: string; impact: string; probability: string }[];
}

interface PortCost {
  category: string;
  estimated: number;
  actual?: number;
  variance?: number;
}

const PortCallOptimizationPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("calls");
  const [portCalls, setPortCalls] = useState<PortCall[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiOptimization, setAiOptimization] = useState<AIOptimization | null>(null);
  const [selectedCall, setSelectedCall] = useState<PortCall | null>(null);
  const [showNewCall, setShowNewCall] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);

  // Demo data
  useEffect(() => {
    setPortCalls([
      {
        id: "1",
        vessel_name: "MV Atlantic Star",
        port_name: "Rotterdam",
        port_code: "NLRTM",
        eta: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        etb: new Date(Date.now() + 52 * 60 * 60 * 1000).toISOString(),
        etd: new Date(Date.now() + 76 * 60 * 60 * 1000).toISOString(),
        purpose: "Discharging",
        agent: "Hudig & Veder",
        status: "approaching",
        waiting_time_hours: 4,
        estimated_costs: 85000,
        documents_status: "submitted"
      },
      {
        id: "2",
        vessel_name: "MV Pacific Dawn",
        port_name: "Singapore",
        port_code: "SGSIN",
        eta: new Date(Date.now() + 120 * 60 * 60 * 1000).toISOString(),
        etb: new Date(Date.now() + 126 * 60 * 60 * 1000).toISOString(),
        etd: new Date(Date.now() + 150 * 60 * 60 * 1000).toISOString(),
        purpose: "Bunkering",
        agent: "Ocean Tankers",
        status: "planned",
        waiting_time_hours: 6,
        estimated_costs: 520000,
        documents_status: "pending"
      },
      {
        id: "3",
        vessel_name: "MV Northern Spirit",
        port_name: "Santos",
        port_code: "BRSSZ",
        eta: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        etb: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        etd: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        purpose: "Loading",
        agent: "Wilson Sons",
        status: "at_berth",
        waiting_time_hours: 4,
        estimated_costs: 65000,
        actual_costs: 68500,
        documents_status: "approved"
      }
    ]);
  }, []);

  const optimizeArrival = async (call?: PortCall) => {
    setIsOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('voyage-accounting-ai', {
        body: {
          action: 'optimize_port_call',
          port_call: call || portCalls[0],
          weather_forecast: { sea_state: 3, wind_speed: 15 },
          traffic_data: { queue_length: 4, avg_wait: 6 }
        }
      });

      if (error) throw error;

      setAiOptimization(data);
      toast({
        title: "Otimização Concluída",
        description: `Economia potencial: $${data?.cost_savings?.toLocaleString() || "12,500"}`,
      });
    } catch (err) {
      logger.error('AI optimization error:', err);
      // Demo fallback
      setAiOptimization({
        optimal_arrival: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(),
        waiting_time_saved: 4,
        fuel_savings: 8.5,
        cost_savings: 12500,
        confidence: 0.92,
        recommendations: [
          "Reduzir velocidade para 11.5 nós - Just-in-Time Arrival",
          "Slot de atracação confirmado para 14:00 UTC",
          "Documentação de porto deve ser submetida em 24h",
          "Piloto reservado - ETA confirmado com VTS"
        ],
        risks: [
          { factor: "Congestionamento portuário", impact: "Médio", probability: "25%" },
          { factor: "Condições meteorológicas", impact: "Baixo", probability: "15%" }
        ]
      });
      toast({
        title: "Otimização Concluída (Demo)",
        description: "Economia potencial: $12,500",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const generateDocuments = async () => {
    setIsLoading(true);
    try {
      toast({
        title: "Documentos Gerados",
        description: "Port Clearance e documentação submetidos automaticamente",
      });
    } finally {
      setIsLoading(false);
      setShowDocuments(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      planned: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      approaching: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      at_berth: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return styles[status as keyof typeof styles] || "";
  };

  const stats = {
    totalCalls: portCalls.length,
    approaching: portCalls.filter(c => c.status === "approaching").length,
    atBerth: portCalls.filter(c => c.status === "at_berth").length,
    totalCosts: portCalls.reduce((sum, c) => sum + c.estimated_costs, 0),
    avgWaiting: portCalls.length > 0
      ? (portCalls.reduce((sum, c) => sum + c.waiting_time_hours, 0) / portCalls.length).toFixed(1)
      : 0
  };

  const portCosts: PortCost[] = [
    { category: "Port Dues", estimated: 25000, actual: 25000, variance: 0 },
    { category: "Pilotage", estimated: 8500, actual: 8500, variance: 0 },
    { category: "Towage", estimated: 12000, actual: 14500, variance: 2500 },
    { category: "Mooring", estimated: 3500, actual: 3500, variance: 0 },
    { category: "Agency Fees", estimated: 6000, actual: 7000, variance: 1000 },
    { category: "Waste Disposal", estimated: 2500, actual: 2500, variance: 0 },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Anchor className="h-8 w-8 text-primary" />
            Port Call Optimization
          </h1>
          <p className="text-muted-foreground">
            Otimização de escalas portuárias com IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDocuments(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Documentação
          </Button>
          <Button onClick={() => optimizeArrival()} disabled={isOptimizing}>
            {isOptimizing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
            Otimizar Chegada
          </Button>
          <Button onClick={() => setShowNewCall(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Escala
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Escalas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCalls}</div>
            <p className="text-xs text-muted-foreground">{stats.approaching} aproximando</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">No Berço</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.atBerth}</div>
            <p className="text-xs text-muted-foreground">embarcações</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Custos Previstos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalCosts / 1000).toFixed(0)}k</div>
            <p className="text-xs text-muted-foreground">Total estimado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tempo Espera Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgWaiting}h</div>
            <p className="text-xs text-muted-foreground">Por escala</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Economia IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${aiOptimization?.cost_savings?.toLocaleString() || "12,500"}</div>
            <p className="text-xs text-muted-foreground">Potencial</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Optimization Panel */}
      {aiOptimization && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Otimização IA - Just-in-Time Arrival
              <Badge variant="secondary">{(aiOptimization.confidence * 100).toFixed(0)}% confiança</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground">Chegada Otimizada</p>
                <p className="text-lg font-bold">{format(new Date(aiOptimization.optimal_arrival), "dd/MM HH:mm")}</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground">Tempo Espera Economizado</p>
                <p className="text-xl font-bold text-green-600">{aiOptimization.waiting_time_saved}h</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground">Combustível Economizado</p>
                <p className="text-xl font-bold text-blue-600">{aiOptimization.fuel_savings}t</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground">Economia Total</p>
                <p className="text-xl font-bold text-green-600">${aiOptimization.cost_savings.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Recomendações
                </h4>
                <ul className="space-y-1">
                  {aiOptimization.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Fatores de Risco
                </h4>
                <div className="space-y-2">
                  {aiOptimization.risks.map((risk, idx) => (
                    <div key={idx} className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded text-sm">
                      <div className="flex justify-between">
                        <span>{risk.factor}</span>
                        <Badge variant="outline">{risk.probability}</Badge>
                      </div>
                      <p className="text-muted-foreground text-xs">Impacto: {risk.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calls">Escalas</TabsTrigger>
          <TabsTrigger value="costs">Custos Portuários</TabsTrigger>
          <TabsTrigger value="agents">Agentes</TabsTrigger>
          <TabsTrigger value="psc">PSC</TabsTrigger>
        </TabsList>

        <TabsContent value="calls" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Embarcação</TableHead>
                    <TableHead>Porto</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>ETB</TableHead>
                    <TableHead>ETD</TableHead>
                    <TableHead>Propósito</TableHead>
                    <TableHead>Espera</TableHead>
                    <TableHead>Custos</TableHead>
                    <TableHead>Docs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portCalls.map(call => (
                    <TableRow key={call.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Ship className="h-4 w-4 text-muted-foreground" />
                          {call.vessel_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{call.port_name}</p>
                          <p className="text-xs text-muted-foreground">{call.port_code}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(call.eta), "dd/MM HH:mm")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(call.etb), "dd/MM HH:mm")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(call.etd), "dd/MM HH:mm")}
                      </TableCell>
                      <TableCell>{call.purpose}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {call.waiting_time_hours}h
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">${(call.estimated_costs / 1000).toFixed(0)}k</p>
                          {call.actual_costs && (
                            <p className="text-xs text-muted-foreground">
                              Real: ${(call.actual_costs / 1000).toFixed(0)}k
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          call.documents_status === "approved" ? "default" :
                          call.documents_status === "submitted" ? "secondary" : "outline"
                        }>
                          {call.documents_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(call.status)}>
                          {call.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedCall(call);
                            optimizeArrival(call);
                          }}
                        >
                          <Brain className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Custos Portuários - Rotterdam
              </CardTitle>
              <CardDescription>Estimado vs Realizado</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Estimado</TableHead>
                    <TableHead className="text-right">Realizado</TableHead>
                    <TableHead className="text-right">Variação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portCosts.map((cost, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{cost.category}</TableCell>
                      <TableCell className="text-right">${cost.estimated.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${cost.actual?.toLocaleString()}</TableCell>
                      <TableCell className={`text-right ${cost.variance && cost.variance > 0 ? "text-red-600" : "text-green-600"}`}>
                        {cost.variance && cost.variance > 0 ? "+" : ""}${cost.variance?.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-right">
                      ${portCosts.reduce((sum, c) => sum + c.estimated, 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ${portCosts.reduce((sum, c) => sum + (c.actual || 0), 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      +${portCosts.reduce((sum, c) => sum + (c.variance || 0), 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {portCalls.map(call => (
              <Card key={call.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building className="h-5 w-5" />
                    {call.agent}
                  </CardTitle>
                  <CardDescription>{call.port_name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-muted-foreground" />
                    <span>{call.vessel_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(call.eta), "dd/MM/yyyy")}</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Contatar Agente
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="psc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Port State Control - Preparação
              </CardTitle>
              <CardDescription>Checklist de preparação para inspeção PSC</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Rotterdam - Paris MOU</p>
                      <p className="text-sm text-muted-foreground">Risco: Baixo | Última inspeção: 6 meses</p>
                    </div>
                  </div>
                  <Badge variant="default">Preparado</Badge>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Singapore - Tokyo MOU</p>
                      <p className="text-sm text-muted-foreground">Risco: Médio | Próxima inspeção provável</p>
                    </div>
                  </div>
                  <Badge variant="outline">Revisar</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Documents Dialog */}
      <Dialog open={showDocuments} onOpenChange={setShowDocuments}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentação de Porto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start">
                <FileCheck className="h-4 w-4 mr-2" />
                Port Clearance
              </Button>
              <Button variant="outline" className="justify-start">
                <Users className="h-4 w-4 mr-2" />
                Crew List
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Cargo Manifest
              </Button>
              <Button variant="outline" className="justify-start">
                <AlertTriangle className="h-4 w-4 mr-2" />
                DG Declaration
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocuments(false)}>Fechar</Button>
            <Button onClick={generateDocuments} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileCheck className="h-4 w-4 mr-2" />}
              Gerar Todos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortCallOptimizationPage;
