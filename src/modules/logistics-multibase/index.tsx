/**
import { useState, useCallback } from "react";;
 * REABASTECIMENTO LOGÍSTICO INTELIGENTE MULTIBASE
 * Cálculo automático do melhor ponto logístico com IA
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MapPin, Truck, Ship, Package, Clock, 
  DollarSign, Route, Brain, Sparkles, CheckCircle,
  AlertTriangle, TrendingUp, Calendar, Fuel
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNautilusEnhancementAI } from "@/hooks/useNautilusEnhancementAI";

interface LogisticsBase {
  id: string;
  name: string;
  type: "port" | "terminal" | "warehouse" | "offshore";
  location: { lat: number; lng: number };
  capabilities: string[];
  currentLoad: number;
  maxCapacity: number;
  leadTime: number; // hours
  costFactor: number; // relative cost 1-5
}

interface SupplyRequest {
  id: string;
  vessel: string;
  items: { name: string; quantity: number; priority: "low" | "medium" | "high" | "urgent" }[];
  deadline: Date;
  status: "pending" | "optimizing" | "routed" | "in_transit" | "delivered";
  selectedBase?: string;
  estimatedCost?: number;
  estimatedTime?: number;
}

interface AIRecommendation {
  baseId: string;
  baseName: string;
  score: number;
  reasons: string[];
  estimatedCost: number;
  estimatedTime: number;
  savings: number;
}

const mockBases: LogisticsBase[] = [
  {
    id: "1",
    name: "Terminal Santos",
    type: "port",
    location: { lat: -23.9618, lng: -46.3322 },
    capabilities: ["combustível", "peças", "provisões", "equipamentos"],
    currentLoad: 65,
    maxCapacity: 100,
    leadTime: 24,
    costFactor: 3
  },
  {
    id: "2",
    name: "Base Macaé",
    type: "terminal",
    location: { lat: -22.3835, lng: -41.7868 },
    capabilities: ["combustível", "peças", "equipamentos offshore"],
    currentLoad: 45,
    maxCapacity: 80,
    leadTime: 12,
    costFactor: 4
  },
  {
    id: "3",
    name: "Porto do Rio",
    type: "port",
    location: { lat: -22.8935, lng: -43.1729 },
    capabilities: ["provisões", "tripulação", "manutenção"],
    currentLoad: 78,
    maxCapacity: 120,
    leadTime: 18,
    costFactor: 2
  },
  {
    id: "4",
    name: "FPSO P-70",
    type: "offshore",
    location: { lat: -23.5, lng: -42.8 },
    capabilities: ["transferência combustível", "emergência"],
    currentLoad: 30,
    maxCapacity: 50,
    leadTime: 6,
    costFactor: 5
  }
];

const mockRequests: SupplyRequest[] = [
  {
    id: "1",
    vessel: "MV Atlântico Sul",
    items: [
      { name: "Filtros de Óleo", quantity: 12, priority: "high" },
      { name: "Provisões", quantity: 500, priority: "medium" },
      { name: "Água Potável", quantity: 50, priority: "low" }
    ],
    deadline: new Date(Date.now() + 3 * 24 * 3600000),
    status: "pending"
  },
  {
    id: "2",
    vessel: "PSV Oceano Azul",
    items: [
      { name: "Combustível MGO", quantity: 80, priority: "urgent" },
      { name: "Peças Motor", quantity: 5, priority: "high" }
    ],
    deadline: new Date(Date.now() + 1 * 24 * 3600000),
    status: "routed",
    selectedBase: "Base Macaé",
    estimatedCost: 45000,
    estimatedTime: 18
  }
];

export default function LogisticsMultibase() {
  const { toast } = useToast();
  const { optimizeLogistics, isLoading } = useNautilusEnhancementAI();
  const [bases, setBases] = useState<LogisticsBase[]>(mockBases);
  const [requests, setRequests] = useState<SupplyRequest[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  const handleOptimizeRoute = async (requestId: string) => {
    setSelectedRequest(requestId);
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: "optimizing" } : r
    ));

    toast({ title: "Otimizando...", description: "IA calculando melhor rota logística" });

    const result = await optimizeLogistics(
      bases.map(b => ({ id: b.id, name: b.name, capabilities: b.capabilities, costFactor: b.costFactor })),
      { items: request.items, deadline: request.deadline }
    );

    // Simulate AI recommendations
    const mockRecommendations: AIRecommendation[] = [
      {
        baseId: "2",
        baseName: "Base Macaé",
        score: 95,
        reasons: [
          "Menor tempo de entrega (12h)",
          "Disponibilidade imediata de todos os itens",
          "Proximidade geográfica"
        ],
        estimatedCost: 42000,
        estimatedTime: 14,
        savings: 8500
      },
      {
        baseId: "1",
        baseName: "Terminal Santos",
        score: 78,
        reasons: [
          "Custo 15% menor",
          "Capacidade disponível alta"
        ],
        estimatedCost: 35000,
        estimatedTime: 28,
        savings: 0
      },
      {
        baseId: "3",
        baseName: "Porto do Rio",
        score: 65,
        reasons: [
          "Itens parcialmente disponíveis",
          "Custo intermediário"
        ],
        estimatedCost: 38000,
        estimatedTime: 22,
        savings: 4000
      }
    ];

    setRecommendations(mockRecommendations);
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: "pending" } : r
    ));

    toast({ title: "Otimização Concluída", description: "3 opções de rota disponíveis" });
  };

  const handleSelectBase = (requestId: string, rec: AIRecommendation) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { 
        ...r, 
        status: "routed",
        selectedBase: rec.baseName,
        estimatedCost: rec.estimatedCost,
        estimatedTime: rec.estimatedTime
      } : r
    ));
    setRecommendations([]);
    setSelectedRequest(null);
    toast({ title: "Rota Selecionada", description: `${rec.baseName} confirmada` });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "port": return <Ship className="h-4 w-4" />;
    case "terminal": return <Truck className="h-4 w-4" />;
    case "warehouse": return <Package className="h-4 w-4" />;
    case "offshore": return <Fuel className="h-4 w-4" />;
    default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "urgent": return "bg-red-500/20 text-red-600";
    case "high": return "bg-orange-500/20 text-orange-600";
    case "medium": return "bg-amber-500/20 text-amber-600";
    default: return "bg-blue-500/20 text-blue-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "delivered": return "bg-green-500/20 text-green-600";
    case "in_transit": return "bg-blue-500/20 text-blue-600";
    case "routed": return "bg-purple-500/20 text-purple-600";
    case "optimizing": return "bg-amber-500/20 text-amber-600";
    default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <Route className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Logística Multibase
              <Badge variant="secondary">
                <Brain className="h-3 w-3 mr-1" />
                AI-Optimized
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Otimização inteligente de rotas e pontos de suprimento
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bases Ativas</p>
                <p className="text-2xl font-bold">{bases.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Solicitações</p>
                <p className="text-2xl font-bold">{requests.length}</p>
              </div>
              <Package className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Trânsito</p>
                <p className="text-2xl font-bold">{requests.filter(r => r.status === "in_transit").length}</p>
              </div>
              <Truck className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Economia IA</p>
                <p className="text-2xl font-bold text-green-600">R$ 45k</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Solicitações</TabsTrigger>
          <TabsTrigger value="bases">Bases Logísticas</TabsTrigger>
          <TabsTrigger value="optimization">Otimização IA</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <div className="space-y-4">
            {requests.map(request => (
              <Card key={request.id} className={request.status === "pending" ? "border-amber-500/50" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Ship className="h-5 w-5" />
                        {request.vessel}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        Prazo: {request.deadline.toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status === "pending" ? "Pendente" :
                        request.status === "optimizing" ? "Otimizando..." :
                          request.status === "routed" ? "Rota Definida" :
                            request.status === "in_transit" ? "Em Trânsito" : "Entregue"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {request.items.map((item, idx) => (
                      <div key={idx} className="p-2 bg-muted/30 rounded text-sm">
                        <div className="flex items-center justify-between">
                          <span>{item.name}</span>
                          <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">Qtd: {item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {request.selectedBase && (
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-700">Base Selecionada: {request.selectedBase}</span>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          R$ {request.estimatedCost?.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {request.estimatedTime}h
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedRequest === request.id && recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary" />
                        Recomendações IA
                      </h4>
                      {recommendations.map(rec => (
                        <div 
                          key={rec.baseId} 
                          className="p-3 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                          onClick={() => handlehandleSelectBase}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{rec.baseName}</span>
                              <Badge variant="outline">{rec.score}% match</Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                R$ {rec.estimatedCost.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {rec.estimatedTime}h
                              </span>
                              {rec.savings > 0 && (
                                <span className="text-green-600 font-medium">
                                  -R$ {rec.savings.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {rec.reasons.map((reason, idx) => (
                              <li key={idx} className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {request.status === "pending" && (
                    <Button 
                      className="w-full" 
                      onClick={() => handlehandleOptimizeRoute}
                      disabled={isLoading}
                    >
                      <Sparkles className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                      Otimizar com IA
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bases">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bases.map(base => (
              <Card key={base.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {getTypeIcon(base.type)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{base.name}</CardTitle>
                        <CardDescription>{base.type}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">Lead: {base.leadTime}h</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {base.capabilities.map(cap => (
                      <Badge key={cap} variant="secondary" className="text-xs">{cap}</Badge>
                    ))}
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Capacidade</span>
                      <span>{base.currentLoad}/{base.maxCapacity}</span>
                    </div>
                    <Progress value={(base.currentLoad / base.maxCapacity) * 100} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Custo: {"$".repeat(base.costFactor)}
                    </span>
                    <Button variant="ghost" size="sm">Ver Detalhes</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Otimizações</CardTitle>
              <CardDescription>Economia e eficiência geradas pela IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Brain className="h-12 w-12 mx-auto mb-4 text-primary opacity-50" />
                <p className="text-muted-foreground">Histórico de otimizações será exibido aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
