import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Map, 
  Route, 
  Anchor, 
  Clock, 
  Plus, 
  Ship, 
  Bot,
  Cloud,
  Fuel
} from "lucide-react";
import { toast } from "sonner";

import VoyagesList from "./components/VoyagesList";
import CreateVoyageDialog from "./components/CreateVoyageDialog";
import VoyageDetailsDialog from "./components/VoyageDetailsDialog";
import VoyageAICopilot from "./components/VoyageAICopilot";
import WeatherPanel from "./components/WeatherPanel";
import { DEMO_VOYAGES, DEMO_WEATHER } from "./data/demo-data";
import type { VoyageRoute } from "./types";

const VoyagePlanner = () => {
  const [voyages, setVoyages] = useState<VoyageRoute[]>(DEMO_VOYAGES);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedVoyage, setSelectedVoyage] = useState<VoyageRoute | null>(null);
  const [activeTab, setActiveTab] = useState("voyages");

  const stats = {
    active: voyages.filter((v) => v.status === "active").length,
    planned: voyages.filter((v) => v.status === "planned").length,
    totalDistance: voyages.reduce((sum, v) => sum + v.distanceNm, 0),
    totalFuel: voyages.reduce((sum, v) => sum + v.fuelConsumption, 0),
    avgDays: Math.round(voyages.reduce((sum, v) => sum + v.estimatedDays, 0) / voyages.length),
    onTimeRate: 94,
  };

  const handleCreateVoyage = (voyage: VoyageRoute) => {
    setVoyages((prev) => [voyage, ...prev]);
    toast.success(`Viagem ${voyage.name} criada com sucesso!`);
  };

  const handleViewDetails = (voyage: VoyageRoute) => {
    setSelectedVoyage(voyage);
    setDetailsDialogOpen(true);
  });

  const handleDeleteVoyage = (id: string) => {
    setVoyages((prev) => prev.filter((v) => v.id !== id));
    toast.success("Viagem removida");
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Map className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Planejador de Viagens</h1>
            <p className="text-muted-foreground">
              Planejamento inteligente de rotas com IA
            </p>
          </div>
        </div>
        <Button onClick={handleSetCreateDialogOpen}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Viagem
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Viagens Ativas</CardTitle>
            <Route className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Planejadas</CardTitle>
            <Ship className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.planned}</div>
            <p className="text-xs text-muted-foreground">Aguardando partida</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Distância Total</CardTitle>
            <Anchor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDistance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Milhas náuticas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDays}d</div>
            <p className="text-xs text-muted-foreground">Por viagem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pontualidade</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.onTimeRate}%</div>
            <p className="text-xs text-muted-foreground">Taxa de chegada</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="voyages" className="flex items-center gap-2">
            <Ship className="w-4 h-4" />
            Viagens
          </TabsTrigger>
          <TabsTrigger value="ai-copilot" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Copiloto IA
          </TabsTrigger>
          <TabsTrigger value="weather" className="flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Meteorologia
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Fuel className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voyages" className="mt-6">
          <VoyagesList
            voyages={voyages}
            onViewDetails={handleViewDetails}
            onDelete={handleDeleteVoyage}
          />
        </TabsContent>

        <TabsContent value="ai-copilot" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VoyageAICopilot voyages={voyages} />
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recursos do Copiloto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Route className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Otimização de Rotas</h4>
                      <p className="text-sm text-muted-foreground">
                        Sugere trajetos otimizados considerando clima e correntes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Cloud className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Análise Meteorológica</h4>
                      <p className="text-sm text-muted-foreground">
                        Monitora condições e alerta sobre riscos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Fuel className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Eficiência de Combustível</h4>
                      <p className="text-sm text-muted-foreground">
                        Calcula consumo e sugere economias
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Previsão de ETA</h4>
                      <p className="text-sm text-muted-foreground">
                        Estima tempo de chegada com precisão
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="weather" className="mt-6">
          <WeatherPanel conditions={DEMO_WEATHER} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Consumo de Combustível</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Planejado</span>
                    <span className="font-bold">{stats.totalFuel.toLocaleString()} ton</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Média por Viagem</span>
                    <span className="font-bold">
                      {Math.round(stats.totalFuel / voyages.length).toLocaleString()} ton
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Economia Potencial (12%)</span>
                    <span className="font-bold text-green-500">
                      {Math.round(stats.totalFuel * 0.12).toLocaleString()} ton
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance de Rotas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Taxa de Pontualidade</span>
                    <Badge className="bg-green-500/10 text-green-500">94%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Viagens Sem Incidentes</span>
                    <Badge className="bg-green-500/10 text-green-500">98%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Desvios por Clima</span>
                    <Badge className="bg-yellow-500/10 text-yellow-500">3 este mês</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Viagens por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-green-500/10">
                    <div className="text-3xl font-bold text-green-500">
                      {voyages.filter((v) => v.status === "active").length}
                    </div>
                    <p className="text-sm text-muted-foreground">Ativas</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-500/10">
                    <div className="text-3xl font-bold text-blue-500">
                      {voyages.filter((v) => v.status === "planned").length}
                    </div>
                    <p className="text-sm text-muted-foreground">Planejadas</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-500/10">
                    <div className="text-3xl font-bold text-gray-500">
                      {voyages.filter((v) => v.status === "completed").length}
                    </div>
                    <p className="text-sm text-muted-foreground">Concluídas</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-500/10">
                    <div className="text-3xl font-bold text-red-500">
                      {voyages.filter((v) => v.status === "cancelled").length}
                    </div>
                    <p className="text-sm text-muted-foreground">Canceladas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateVoyageDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateVoyage={handleCreateVoyage}
      />

      <VoyageDetailsDialog
        voyage={selectedVoyage}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </div>
  );
};

export default VoyagePlanner;
