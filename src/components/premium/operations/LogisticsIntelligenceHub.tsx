/**
 * LOGISTICS INTELLIGENCE HUB
 * Gestão de suprimentos com rastreamento em tempo real
 * Benchmark: Flexport, Project44, FourKites
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Package, Truck, MapPin, Clock, CheckCircle2, AlertTriangle,
  Search, Filter, RefreshCw, TrendingUp, DollarSign, Ship,
  Anchor, BarChart3, Brain, Sparkles, Target, Navigation,
  Thermometer, Droplets, Box, ArrowRight, Eye, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

// Interfaces
interface Shipment {
  id: string;
  trackingNumber: string;
  type: "container" | "bulk" | "breakbulk" | "reefer" | "hazmat";
  status: "preparing" | "in_transit" | "at_port" | "customs" | "delivered" | "delayed";
  origin: { port: string; country: string; };
  destination: { port: string; country: string; };
  vessel: string;
  eta: Date;
  etd: Date;
  cargo: {
    description: string;
    weight: number;
    volume: number;
    value: number;
  };
  milestones: {
    name: string;
    status: "completed" | "current" | "pending";
    timestamp?: Date;
    location?: string;
  }[];
  conditions?: {
    temperature?: number;
    humidity?: number;
    shock?: boolean;
  };
  documents: { name: string; status: "pending" | "approved" | "rejected"; }[];
  aiPredictions?: {
    delayRisk: number;
    etaConfidence: number;
    suggestedActions: string[];
  };
}

interface SupplyChainKPI {
  label: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "stable";
  icon: React.ReactNode;
}

// Status configs
const statusConfig = {
  preparing: { label: "Preparando", color: "bg-muted", icon: Box },
  in_transit: { label: "Em Trânsito", color: "bg-primary", icon: Ship },
  at_port: { label: "No Porto", color: "bg-blue-500", icon: Anchor },
  customs: { label: "Alfândega", color: "bg-warning", icon: Clock },
  delivered: { label: "Entregue", color: "bg-success", icon: CheckCircle2 },
  delayed: { label: "Atrasado", color: "bg-destructive", icon: AlertTriangle },
};

const typeConfig = {
  container: { label: "Container", color: "bg-primary/20" },
  bulk: { label: "Bulk", color: "bg-blue-500/20" },
  breakbulk: { label: "Breakbulk", color: "bg-purple-500/20" },
  reefer: { label: "Reefer", color: "bg-cyan-500/20" },
  hazmat: { label: "Hazmat", color: "bg-destructive/20" },
};

// Mock data
const mockShipments: Shipment[] = [
  {
    id: "1",
    trackingNumber: "NTLS-2026-00142",
    type: "container",
    status: "in_transit",
    origin: { port: "Shanghai", country: "CN" },
    destination: { port: "Santos", country: "BR" },
    vessel: "MV Nautilus Star",
    eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    etd: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    cargo: {
      description: "Spare Parts - Main Engine",
      weight: 45.5,
      volume: 120,
      value: 285000,
    },
    milestones: [
      { name: "Booking Confirmed", status: "completed", timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), location: "Shanghai" },
      { name: "Gate In", status: "completed", timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), location: "Shanghai Port" },
      { name: "Loaded on Vessel", status: "completed", timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), location: "MV Nautilus Star" },
      { name: "In Transit", status: "current", location: "South Atlantic" },
      { name: "Arrival at Port", status: "pending" },
      { name: "Customs Clearance", status: "pending" },
      { name: "Delivery", status: "pending" },
    ],
    documents: [
      { name: "Bill of Lading", status: "approved" },
      { name: "Commercial Invoice", status: "approved" },
      { name: "Packing List", status: "approved" },
      { name: "Certificate of Origin", status: "pending" },
    ],
    aiPredictions: {
      delayRisk: 15,
      etaConfidence: 92,
      suggestedActions: ["Monitor weather in South Atlantic", "Pre-clear customs documentation"],
    },
  },
  {
    id: "2",
    trackingNumber: "NTLS-2026-00158",
    type: "reefer",
    status: "at_port",
    origin: { port: "Rotterdam", country: "NL" },
    destination: { port: "Rio de Janeiro", country: "BR" },
    vessel: "MV Atlantic Reefer",
    eta: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    etd: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    cargo: {
      description: "Medical Supplies - Temperature Sensitive",
      weight: 12.3,
      volume: 35,
      value: 450000,
    },
    conditions: {
      temperature: 4.2,
      humidity: 45,
      shock: false,
    },
    milestones: [
      { name: "Booking Confirmed", status: "completed" },
      { name: "Gate In", status: "completed" },
      { name: "Loaded on Vessel", status: "completed" },
      { name: "In Transit", status: "completed" },
      { name: "Arrival at Port", status: "current", timestamp: new Date(), location: "Santos" },
      { name: "Customs Clearance", status: "pending" },
      { name: "Delivery", status: "pending" },
    ],
    documents: [
      { name: "Bill of Lading", status: "approved" },
      { name: "Temperature Log", status: "approved" },
      { name: "Health Certificate", status: "pending" },
    ],
    aiPredictions: {
      delayRisk: 8,
      etaConfidence: 96,
      suggestedActions: ["Expedite health certificate approval", "Coordinate cold chain handover"],
    },
  },
  {
    id: "3",
    trackingNumber: "NTLS-2026-00163",
    type: "hazmat",
    status: "customs",
    origin: { port: "Houston", country: "US" },
    destination: { port: "Paranaguá", country: "BR" },
    vessel: "MV Chemical Carrier",
    eta: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    etd: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    cargo: {
      description: "Industrial Chemicals - IMO Class 8",
      weight: 85.0,
      volume: 200,
      value: 120000,
    },
    milestones: [
      { name: "Booking Confirmed", status: "completed" },
      { name: "Gate In", status: "completed" },
      { name: "Loaded on Vessel", status: "completed" },
      { name: "In Transit", status: "completed" },
      { name: "Arrival at Port", status: "completed" },
      { name: "Customs Clearance", status: "current", location: "Paranaguá Customs" },
      { name: "Delivery", status: "pending" },
    ],
    documents: [
      { name: "Bill of Lading", status: "approved" },
      { name: "MSDS", status: "approved" },
      { name: "DG Declaration", status: "approved" },
      { name: "Import License", status: "pending" },
    ],
    aiPredictions: {
      delayRisk: 35,
      etaConfidence: 78,
      suggestedActions: ["Urgent: Follow up on import license", "Prepare alternative delivery routing"],
    },
  },
];

export function LogisticsIntelligenceHub() {
  const [activeTab, setActiveTab] = useState("tracking");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  // KPIs
  const kpis: SupplyChainKPI[] = [
    { label: "Shipments Ativos", value: mockShipments.length, change: 5, trend: "up", icon: <Package className="h-5 w-5" /> },
    { label: "Em Trânsito", value: mockShipments.filter(s => s.status === "in_transit").length, change: 0, trend: "stable", icon: <Ship className="h-5 w-5" /> },
    { label: "Taxa de Entrega", value: "94.5%", change: 2.3, trend: "up", icon: <Target className="h-5 w-5" /> },
    { label: "Valor Total", value: `$${(mockShipments.reduce((acc, s) => acc + s.cargo.value, 0) / 1000).toFixed(0)}K`, change: 12, trend: "up", icon: <DollarSign className="h-5 w-5" /> },
  ];

  const filteredShipments = mockShipments.filter(s =>
    s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.cargo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.vessel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Logistics Intelligence Hub
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </h2>
          <p className="text-muted-foreground">
            Rastreamento em tempo real com inteligência preditiva
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Shipment
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className={cn(
                      "h-3 w-3",
                      kpi.trend === "up" && "text-success",
                      kpi.trend === "down" && "text-destructive",
                    )} />
                    <span className={cn(
                      "text-xs",
                      kpi.trend === "up" && "text-success",
                      kpi.trend === "down" && "text-destructive",
                    )}>
                      {kpi.change > 0 ? "+" : ""}{kpi.change}%
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  {kpi.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="tracking" className="gap-2">
              <Navigation className="h-4 w-4" />
              Rastreamento
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="gap-2">
              <Brain className="h-4 w-4" />
              Insights IA
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tracking, carga, navio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-4">
          <div className="grid gap-4">
            {filteredShipments.map((shipment) => {
              const StatusIcon = statusConfig[shipment.status].icon;
              return (
                <Card 
                  key={shipment.id} 
                  className={cn(
                    "hover:shadow-md transition-all cursor-pointer",
                    shipment.status === "delayed" && "border-destructive/50"
                  )}
                  onClick={() => setSelectedShipment(shipment)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="font-mono">
                            {shipment.trackingNumber}
                          </Badge>
                          <Badge className={typeConfig[shipment.type].color}>
                            {typeConfig[shipment.type].label}
                          </Badge>
                          <Badge className={statusConfig[shipment.status].color + " text-white"}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[shipment.status].label}
                          </Badge>
                          {shipment.aiPredictions && shipment.aiPredictions.delayRisk > 20 && (
                            <Badge className="bg-warning/20 text-warning">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Risco: {shipment.aiPredictions.delayRisk}%
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-semibold">{shipment.cargo.description}</h3>
                        
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{shipment.origin.port}, {shipment.origin.country}</span>
                          <ArrowRight className="h-4 w-4" />
                          <span>{shipment.destination.port}, {shipment.destination.country}</span>
                          <span className="mx-2">•</span>
                          <Ship className="h-4 w-4" />
                          <span>{shipment.vessel}</span>
                        </div>

                        {/* Conditions for reefer */}
                        {shipment.conditions && (
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline" className="gap-1">
                              <Thermometer className="h-3 w-3" />
                              {shipment.conditions.temperature}°C
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              <Droplets className="h-3 w-3" />
                              {shipment.conditions.humidity}%
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">ETA</p>
                        <p className="font-bold">{format(shipment.eta, "dd/MM/yyyy")}</p>
                        {shipment.aiPredictions && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            <Brain className="h-3 w-3 mr-1" />
                            {shipment.aiPredictions.etaConfidence}% confiança
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Progress milestones */}
                    <div className="mt-4 flex items-center gap-1">
                      {shipment.milestones.map((milestone, idx) => (
                        <React.Fragment key={idx}>
                          <div className={cn(
                            "h-2 rounded-full flex-1 transition-all",
                            milestone.status === "completed" && "bg-success",
                            milestone.status === "current" && "bg-primary animate-pulse",
                            milestone.status === "pending" && "bg-muted",
                          )} />
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>Origem</span>
                      <span>Destino</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance por Rota
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { route: "Asia → South America", onTime: 94, volume: 125 },
                    { route: "Europe → South America", onTime: 89, volume: 87 },
                    { route: "North America → South America", onTime: 96, volume: 64 },
                  ].map((route, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{route.route}</span>
                        <span className="text-muted-foreground">{route.volume} shipments</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={route.onTime} className="flex-1 h-2" />
                        <span className="text-sm font-medium w-12">{route.onTime}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tempo Médio de Trânsito
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "Container", avgDays: 28, trend: -2 },
                    { type: "Bulk", avgDays: 35, trend: 1 },
                    { type: "Reefer", avgDays: 22, trend: -3 },
                    { type: "Hazmat", avgDays: 42, trend: 5 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{item.type}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">{item.avgDays} dias</span>
                        <Badge className={cn(
                          item.trend < 0 ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                        )}>
                          {item.trend > 0 ? "+" : ""}{item.trend}d
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Previsões de Atraso
                </CardTitle>
                <CardDescription>
                  Análise preditiva baseada em dados históricos e condições atuais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockShipments.filter(s => s.aiPredictions).map((shipment) => (
                  <div 
                    key={shipment.id}
                    className={cn(
                      "p-4 rounded-lg border",
                      shipment.aiPredictions!.delayRisk > 30 ? "border-destructive bg-destructive/5" :
                      shipment.aiPredictions!.delayRisk > 15 ? "border-warning bg-warning/5" :
                      "border-success bg-success/5"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{shipment.trackingNumber}</p>
                        <p className="text-sm text-muted-foreground">{shipment.cargo.description}</p>
                      </div>
                      <Badge className={cn(
                        shipment.aiPredictions!.delayRisk > 30 ? "bg-destructive" :
                        shipment.aiPredictions!.delayRisk > 15 ? "bg-warning" :
                        "bg-success",
                        "text-white"
                      )}>
                        Risco: {shipment.aiPredictions!.delayRisk}%
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Ações Sugeridas:</p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {shipment.aiPredictions!.suggestedActions.map((action, idx) => (
                          <li key={idx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Oportunidades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="font-medium text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    Consolidação de Cargas
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    3 shipments para Santos podem ser consolidados. Economia estimada: $12,500
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="font-medium text-sm flex items-center gap-2">
                    <Ship className="h-4 w-4 text-primary" />
                    Rota Alternativa
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Via Transshipment em Colombo reduz tempo em 3 dias para carga NTLS-2026-00142
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="font-medium text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-warning" />
                    Documentação Pendente
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    4 documentos aguardando aprovação podem causar atraso na liberação
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Shipment Detail Modal */}
      {selectedShipment && (
        <Card className="fixed inset-4 md:inset-auto md:fixed md:right-4 md:top-20 md:bottom-4 md:w-96 z-50 overflow-auto shadow-xl">
          <CardHeader className="sticky top-0 bg-background border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Detalhes do Shipment</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedShipment(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="font-mono text-lg font-bold">{selectedShipment.trackingNumber}</p>
              <p className="text-muted-foreground">{selectedShipment.cargo.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Origem</p>
                <p className="font-medium">{selectedShipment.origin.port}, {selectedShipment.origin.country}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Destino</p>
                <p className="font-medium">{selectedShipment.destination.port}, {selectedShipment.destination.country}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Peso</p>
                <p className="font-medium">{selectedShipment.cargo.weight} tons</p>
              </div>
              <div>
                <p className="text-muted-foreground">Valor</p>
                <p className="font-medium">${selectedShipment.cargo.value.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">Milestones</p>
              <div className="space-y-2">
                {selectedShipment.milestones.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      m.status === "completed" && "bg-success",
                      m.status === "current" && "bg-primary animate-pulse",
                      m.status === "pending" && "bg-muted",
                    )} />
                    <span className={cn(
                      "text-sm",
                      m.status === "pending" && "text-muted-foreground"
                    )}>
                      {m.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">Documentos</p>
              <div className="space-y-1">
                {selectedShipment.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span>{doc.name}</span>
                    <Badge variant="outline" className={cn(
                      doc.status === "approved" && "text-success border-success",
                      doc.status === "pending" && "text-warning border-warning",
                      doc.status === "rejected" && "text-destructive border-destructive",
                    )}>
                      {doc.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default LogisticsIntelligenceHub;
