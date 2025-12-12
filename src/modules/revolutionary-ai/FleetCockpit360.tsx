/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * REVOLUTIONARY AI - Fleet Cockpit 360°
 * Funcionalidade 2: Visão 360º de cada embarcação com IA contextual
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Ship, Anchor, Users, Fuel, AlertTriangle, FileCheck, 
  Wrench, Package, MapPin, Activity, Brain, TrendingUp,
  Calendar, ThermometerSun, Gauge, Battery, Clock
} from "lucide-react";
import { motion } from "framer-motion";

interface VesselData {
  id: string;
  name: string;
  imo: string;
  type: string;
  status: "operational" | "maintenance" | "docked" | "offline";
  location: { lat: number; lng: number; port?: string };
  metrics: {
    fuelLevel: number;
    engineHours: number;
    speed: number;
    heading: number;
  };
  crew: { total: number; onboard: number };
  certificates: { total: number; expiring: number; expired: number };
  maintenance: { pending: number; overdue: number; scheduled: number };
  inventory: { critical: number; lowStock: number };
  alerts: { critical: number; warning: number; info: number };
  aiInsight: string;
}

const MOCK_VESSELS: VesselData[] = [
  {
    id: "1",
    name: "Navio Atlas",
    imo: "IMO9876543",
    type: "Tanker",
    status: "operational",
    location: { lat: -23.9, lng: -46.3, port: "Santos" },
    metrics: { fuelLevel: 75, engineHours: 12450, speed: 12.5, heading: 180 },
    crew: { total: 25, onboard: 24 },
    certificates: { total: 45, expiring: 3, expired: 0 },
    maintenance: { pending: 5, overdue: 1, scheduled: 8 },
    inventory: { critical: 0, lowStock: 5 },
    alerts: { critical: 1, warning: 3, info: 7 },
    aiInsight: "O Navio Atlas está 95% operacional. Atenção: 3 certificados vencem em 30 dias e há 1 manutenção atrasada no sistema hidráulico. Recomendo priorizar inspeção do motor auxiliar #2."
  },
  {
    id: "2",
    name: "Navio Vega",
    imo: "IMO9876544",
    type: "Container",
    status: "operational",
    location: { lat: -22.9, lng: -43.1, port: "Rio de Janeiro" },
    metrics: { fuelLevel: 45, engineHours: 8900, speed: 0, heading: 90 },
    crew: { total: 22, onboard: 22 },
    certificates: { total: 42, expiring: 2, expired: 0 },
    maintenance: { pending: 3, overdue: 0, scheduled: 5 },
    inventory: { critical: 1, lowStock: 3 },
    alerts: { critical: 0, warning: 2, info: 4 },
    aiInsight: "O Navio Vega está 100% operacional. Nível de combustível 30% abaixo da média da rota. Sugiro reabastecer antes da próxima viagem. 1 item crítico em estoque precisa de reposição urgente."
  },
  {
    id: "3",
    name: "Navio Sirius",
    imo: "IMO9876545",
    type: "Bulk Carrier",
    status: "maintenance",
    location: { lat: -25.4, lng: -49.2, port: "Paranaguá" },
    metrics: { fuelLevel: 90, engineHours: 15200, speed: 0, heading: 0 },
    crew: { total: 20, onboard: 8 },
    certificates: { total: 40, expiring: 0, expired: 1 },
    maintenance: { pending: 12, overdue: 2, scheduled: 15 },
    inventory: { critical: 0, lowStock: 8 },
    alerts: { critical: 2, warning: 5, info: 3 },
    aiInsight: "Navio Sirius em manutenção programada. Previsão de retorno: 5 dias. 1 certificado expirado requer ação imediata. 2 manutenções críticas em andamento no motor principal."
  }
];

export const FleetCockpit360 = memo(function() {
  const [selectedVessel, setSelectedVessel] = useState<VesselData>(MOCK_VESSELS[0]);
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusColor = (status: string) => {
    const colors = {
      operational: "bg-green-500/20 text-green-400 border-green-500/30",
      maintenance: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      docked: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      offline: "bg-red-500/20 text-red-400 border-red-500/30"
    };
    return colors[status as keyof typeof colors] || "bg-muted";
  });

  const getStatusLabel = (status: string) => {
    const labels = {
      operational: "Operacional",
      maintenance: "Manutenção",
      docked: "Atracado",
      offline: "Offline"
    };
    return labels[status as keyof typeof labels] || status;
  });

  return (
    <div className="space-y-6">
      {/* Fleet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_VESSELS.map((vessel) => (
          <motion.div
            key={vessel.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`cursor-pointer transition-all ${
                selectedVessel.id === vessel.id 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-border/50 hover:border-primary/50"
              }`}
              onClick={handleSetSelectedVessel}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Ship className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{vessel.name}</h3>
                      <p className="text-xs text-muted-foreground">{vessel.imo}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(vessel.status)}>
                    {getStatusLabel(vessel.status)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {vessel.location.port}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {vessel.crew.onboard}/{vessel.crew.total}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Fuel className="h-3 w-3" />
                    {vessel.metrics.fuelLevel}%
                  </div>
                  {vessel.alerts.critical > 0 && (
                    <div className="flex items-center gap-1 text-red-400">
                      <AlertTriangle className="h-3 w-3" />
                      {vessel.alerts.critical} crítico
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Selected Vessel Detail */}
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Ship className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="text-xl">{selectedVessel.name}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className={getStatusColor(selectedVessel.status)}>
                    {getStatusLabel(selectedVessel.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {selectedVessel.type} • {selectedVessel.imo}
                  </span>
                </div>
              </div>
            </CardTitle>
            <div className="text-right text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {selectedVessel.location.port}
              </div>
              <div className="text-xs">
                {selectedVessel.location.lat.toFixed(2)}°, {selectedVessel.location.lng.toFixed(2)}°
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Insight */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-primary font-medium mb-1">Análise IA Contextual</p>
                  <p className="text-sm">{selectedVessel.aiInsight}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="overview">Geral</TabsTrigger>
              <TabsTrigger value="metrics">Métricas</TabsTrigger>
              <TabsTrigger value="crew">Tripulação</TabsTrigger>
              <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Fuel className="h-4 w-4 text-blue-400" />
                      <span className="text-xs text-muted-foreground">Combustível</span>
                    </div>
                    <Progress value={selectedVessel.metrics.fuelLevel} className="h-2 mb-1" />
                    <p className="text-lg font-bold">{selectedVessel.metrics.fuelLevel}%</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-green-400" />
                      <span className="text-xs text-muted-foreground">Tripulação</span>
                    </div>
                    <p className="text-lg font-bold">{selectedVessel.crew.onboard}/{selectedVessel.crew.total}</p>
                    <p className="text-xs text-muted-foreground">a bordo</p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <span className="text-xs text-muted-foreground">Alertas</span>
                    </div>
                    <p className="text-lg font-bold">
                      <span className="text-red-400">{selectedVessel.alerts.critical}</span>
                      <span className="text-muted-foreground mx-1">/</span>
                      <span className="text-amber-400">{selectedVessel.alerts.warning}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">crítico / aviso</p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCheck className="h-4 w-4 text-purple-400" />
                      <span className="text-xs text-muted-foreground">Certificados</span>
                    </div>
                    <p className="text-lg font-bold">{selectedVessel.certificates.total}</p>
                    <p className="text-xs">
                      {selectedVessel.certificates.expiring > 0 && (
                        <span className="text-amber-400">{selectedVessel.certificates.expiring} vencendo</span>
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs text-muted-foreground">Velocidade</span>
                    </div>
                    <p className="text-2xl font-bold">{selectedVessel.metrics.speed}</p>
                    <p className="text-xs text-muted-foreground">nós</p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-green-400" />
                      <span className="text-xs text-muted-foreground">Rumo</span>
                    </div>
                    <p className="text-2xl font-bold">{selectedVessel.metrics.heading}°</p>
                    <p className="text-xs text-muted-foreground">heading</p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-amber-400" />
                      <span className="text-xs text-muted-foreground">Horas Motor</span>
                    </div>
                    <p className="text-2xl font-bold">{selectedVessel.metrics.engineHours.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">horas</p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Battery className="h-4 w-4 text-blue-400" />
                      <span className="text-xs text-muted-foreground">Combustível</span>
                    </div>
                    <Progress value={selectedVessel.metrics.fuelLevel} className="h-3 mb-2" />
                    <p className="text-lg font-bold">{selectedVessel.metrics.fuelLevel}%</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="crew" className="pt-4">
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Tripulação a Bordo</h3>
                    <Badge>{selectedVessel.crew.onboard}/{selectedVessel.crew.total}</Badge>
                  </div>
                  <Progress value={(selectedVessel.crew.onboard / selectedVessel.crew.total) * 100} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedVessel.crew.total - selectedVessel.crew.onboard} tripulantes em licença
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="pt-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardContent className="p-4 text-center">
                    <Wrench className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-400">{selectedVessel.maintenance.overdue}</p>
                    <p className="text-xs text-muted-foreground">Atrasadas</p>
                  </CardContent>
                </Card>
                <Card className="bg-amber-500/10 border-amber-500/20">
                  <CardContent className="p-4 text-center">
                    <Wrench className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-amber-400">{selectedVessel.maintenance.pending}</p>
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-500/10 border-blue-500/20">
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-400">{selectedVessel.maintenance.scheduled}</p>
                    <p className="text-xs text-muted-foreground">Programadas</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="pt-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="p-4 text-center">
                    <FileCheck className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-400">{selectedVessel.certificates.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </CardContent>
                </Card>
                <Card className="bg-amber-500/10 border-amber-500/20">
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-amber-400">{selectedVessel.certificates.expiring}</p>
                    <p className="text-xs text-muted-foreground">Vencendo</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-400">{selectedVessel.certificates.expired}</p>
                    <p className="text-xs text-muted-foreground">Vencidos</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default FleetCockpit360;
