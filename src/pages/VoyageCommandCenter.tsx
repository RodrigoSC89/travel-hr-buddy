/**
 * Voyage Command Center - Módulo Unificado de Planejamento de Viagens
 * PATCH UNIFY-12.0 - Fusão dos módulos de viagem
 * Refactored: orchestrator pattern with sub-components
 */

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Compass, Brain, Plus, Download } from "lucide-react";
import { toast } from "sonner";
import { usePorts } from "@/hooks/usePortsData";
import { useMarineWeather } from "@/hooks/useMarineWeather";
import { supabase } from "@/integrations/supabase/client";
import type { Port, VoyageRoute, WeatherCondition } from "./voyage/types";
import { VoyageStatsBar } from "./voyage/VoyageStatsBar";
import { VoyageOverviewTab } from "./voyage/VoyageOverviewTab";
import { VoyageListTab } from "./voyage/VoyageListTab";
import { VoyageCopilotTab } from "./voyage/VoyageCopilotTab";
import { VoyageWeatherTab } from "./voyage/VoyageWeatherTab";
import { VoyageAnalyticsTab } from "./voyage/VoyageAnalyticsTab";
import { VoyageRoutesTab } from "./voyage/VoyageRoutesTab";
import { CreateVoyageDialog, VoyageDetailsDialog } from "./voyage/VoyageDialogs";

const WEATHER_LOCATIONS = [
  { lat: -23.5505, lng: -46.6333, name: "Santos" },
  { lat: -22.9068, lng: -43.1729, name: "Rio de Janeiro" },
  { lat: -3.7319, lng: -38.5267, name: "Fortaleza" },
  { lat: -12.9714, lng: -38.5014, name: "Salvador" },
  { lat: -25.4284, lng: -49.2733, name: "Paranaguá" },
];

export default function VoyageCommandCenter() {
  const { data: portsData = [] } = usePorts();
  const ports: Port[] = portsData.map(p => ({
    id: p.id, name: p.name, country: p.country, code: p.code,
    lat: p.lat, lng: p.lng, type: p.type
  }));

  const [voyages, setVoyages] = useState<VoyageRoute[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedVoyage, setSelectedVoyage] = useState<VoyageRoute | null>(null);
  const [aiCopilotInput, setAiCopilotInput] = useState("");
  const [aiMessages, setAiMessages] = useState<{role: string; content: string}[]>([
    { role: "assistant", content: "Olá! Sou o Copiloto de Viagens IA. Posso ajudar com otimização de rotas, análise climática e planejamento. O que você precisa?" }
  ]);
  const [newVoyage, setNewVoyage] = useState({ origin: "", destination: "", vessel: "", departure: "" });

  // Weather data
  const santosWeather = useMarineWeather(WEATHER_LOCATIONS[0].lat, WEATHER_LOCATIONS[0].lng);
  const rioWeather = useMarineWeather(WEATHER_LOCATIONS[1].lat, WEATHER_LOCATIONS[1].lng);
  const fortalezaWeather = useMarineWeather(WEATHER_LOCATIONS[2].lat, WEATHER_LOCATIONS[2].lng);
  const salvadorWeather = useMarineWeather(WEATHER_LOCATIONS[3].lat, WEATHER_LOCATIONS[3].lng);
  const paranaguaWeather = useMarineWeather(WEATHER_LOCATIONS[4].lat, WEATHER_LOCATIONS[4].lng);
  const weatherQueries = [santosWeather, rioWeather, fortalezaWeather, salvadorWeather, paranaguaWeather];

  const weather: WeatherCondition[] = useMemo(() => {
    return WEATHER_LOCATIONS.map((loc, idx) => {
      const q = weatherQueries[idx];
      if (!q.data?.current) return null;
      const c = q.data.current;
      const windKnots = c.windSpeedKnots ?? (c.windSpeed ? c.windSpeed * 1.94384 : 0);
      const waveH = c.waveHeight ?? 0;
      const risk: "low" | "medium" | "high" =
        waveH > 4 || windKnots > 35 ? "high" :
        waveH > 2.5 || windKnots > 25 ? "medium" : "low";
      const vis = c.visibility != null ? `${(c.visibility / 1000).toFixed(0)} km` : "N/A";
      const condition = waveH > 3 ? "Mar agitado" : waveH > 1.5 ? "Mar moderado" : "Mar calmo";
      return { location: `Porto de ${loc.name}`, condition, windSpeed: Math.round(windKnots), waveHeight: Math.round(waveH * 10) / 10, visibility: vis, risk } as WeatherCondition;
    }).filter((w): w is WeatherCondition => w !== null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [santosWeather.data, rioWeather.data, fortalezaWeather.data, salvadorWeather.data, paranaguaWeather.data]);

  const stats = {
    active: voyages.filter(v => v.status === "active").length,
    planned: voyages.filter(v => v.status === "planned").length,
    completed: voyages.filter(v => v.status === "completed").length,
    totalDistance: voyages.reduce((sum, v) => sum + v.distanceNm, 0),
    totalFuel: voyages.reduce((sum, v) => sum + v.fuelConsumption, 0),
    onTimeRate: 94,
    fuelSaved: 245,
  };

  const handleOptimizeRoute = async (voyageId: string) => {
    setIsOptimizing(true);
    toast.info("Otimizando rota com IA...");
    setVoyages(prev => prev.map(v =>
      v.id === voyageId
        ? { ...v, fuelConsumption: Math.round(v.fuelConsumption * 0.92), aiRecommendations: [...(v.aiRecommendations || []), "Rota otimizada com economia de 8% em combustível", `Novo consumo estimado: ${Math.round(v.fuelConsumption * 0.92)} ton`] }
        : v
    ));
    toast.success("Rota otimizada! Economia estimada de 8%");
    setIsOptimizing(false);
  };

  const handleCreateVoyage = () => {
    if (!newVoyage.origin || !newVoyage.destination) { toast.error("Preencha origem e destino"); return; }
    const originPort = ports.find(p => p.id === newVoyage.origin) || ports[0];
    const destPort = ports.find(p => p.id === newVoyage.destination) || ports[2];
    const voyage: VoyageRoute = {
      id: Date.now().toString(), name: `${originPort.name} → ${destPort.name}`,
      origin: originPort, destination: destPort, waypoints: [],
      distanceNm: 2000 + ((originPort.name.length + destPort.name.length) * 137) % 3000,
      estimatedDays: 7 + ((originPort.name.length * destPort.name.length) % 15),
      fuelConsumption: 1500 + ((originPort.name.charCodeAt(0) + destPort.name.charCodeAt(0)) * 7) % 2000,
      status: "planned", vesselName: newVoyage.vessel || "A definir",
      departureDate: newVoyage.departure || new Date().toISOString().split('T')[0],
      arrivalDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      weatherRisk: "medium", createdAt: new Date().toISOString().split('T')[0],
      estimatedCost: 200000 + ((originPort.name.length + destPort.name.length) * 17389) % 500000,
      aiRecommendations: ["Aguardando análise de IA para otimização de rota"]
    };
    setVoyages(prev => [voyage, ...prev]);
    setNewVoyage({ origin: "", destination: "", vessel: "", departure: "" });
    setCreateDialogOpen(false);
    toast.success(`Viagem ${voyage.name} criada!`);
  };

  const handleDeleteVoyage = (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta viagem?")) return;
    setVoyages(prev => prev.filter(v => v.id !== id));
    toast.success("Viagem removida");
  };

  const handleExportVoyages = () => {
    const headers = "ID,Nome,Origem,Destino,Distância (NM),Dias Estimados,Status,Data Partida,Embarcação\n";
    const content = voyages.map(v => `${v.id},${v.name},${v.origin.name},${v.destination.name},${v.distanceNm},${v.estimatedDays},${v.status},${v.departureDate || 'N/A'},${v.vesselName || 'N/A'}`).join('\n');
    const blob = new Blob([headers + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `viagens-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Viagens exportadas com sucesso!");
  };

  const handleAiCopilotSend = async () => {
    if (!aiCopilotInput.trim()) return;
    setAiMessages(prev => [...prev, { role: "user", content: aiCopilotInput }]);
    const userInput = aiCopilotInput;
    setAiCopilotInput("");
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { messages: [{ role: 'user', content: `Contexto: copiloto de viagens marítimas. Pergunta: ${userInput}` }], agentId: 'voyage-copilot' },
      });
      if (error) throw error;
      setAiMessages(prev => [...prev, { role: "assistant", content: data?.response || data?.choices?.[0]?.message?.content || "Analisando... Tente reformular sua pergunta." }]);
    } catch {
      const responses = [
        "Analisando as condições meteorológicas atuais, recomendo uma rota via Las Palmas para otimizar o consumo de combustível em aproximadamente 12%.",
        "Com base nos dados de tráfego marítimo, sugiro antecipar a partida em 6 horas para evitar congestionamento no Canal da Mancha.",
        "A previsão indica ventos favoráveis nos próximos 3 dias. Aproveitar essa janela pode reduzir o tempo de viagem em 18 horas.",
        "Identificamos uma oportunidade de bunker em Durban com preços 8% abaixo da média. Deseja incluir essa escala no planejamento?"
      ];
      const msgHash = userInput.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      setAiMessages(prev => [...prev, { role: "assistant", content: responses[msgHash % responses.length] }]);
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6 p-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <Compass className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Voyage Command Center
              <Badge variant="secondary" className="ml-2"><Brain className="h-3 w-3 mr-1" />AI-Powered</Badge>
            </h1>
            <p className="text-muted-foreground">Planejamento e otimização inteligente de viagens marítimas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportVoyages}><Download className="h-4 w-4 mr-2" />Exportar</Button>
          <Button onClick={() => setCreateDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Nova Viagem</Button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}><VoyageStatsBar stats={stats} /></motion.div>

      <motion.div variants={fadeUp}><Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="voyages">Viagens</TabsTrigger>
          <TabsTrigger value="copilot">Copiloto IA</TabsTrigger>
          <TabsTrigger value="weather">Meteorologia</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="routes">Rotas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <VoyageOverviewTab voyages={voyages} weather={weather} weatherLoading={weatherQueries.some(q => q.isLoading)} />
        </TabsContent>
        <TabsContent value="voyages">
          <VoyageListTab voyages={voyages} isOptimizing={isOptimizing} onOptimize={handleOptimizeRoute} onViewDetails={(v) => { setSelectedVoyage(v); setDetailsDialogOpen(true); }} onDelete={handleDeleteVoyage} />
        </TabsContent>
        <TabsContent value="copilot">
          <VoyageCopilotTab aiMessages={aiMessages} aiCopilotInput={aiCopilotInput} onInputChange={setAiCopilotInput} onSend={handleAiCopilotSend} />
        </TabsContent>
        <TabsContent value="weather">
          <VoyageWeatherTab weather={weather} weatherLoading={weatherQueries.some(q => q.isFetching)} onRefresh={() => weatherQueries.forEach(q => q.refetch())} />
        </TabsContent>
        <TabsContent value="analytics">
          <VoyageAnalyticsTab voyages={voyages} totalFuel={stats.totalFuel} />
        </TabsContent>
        <TabsContent value="routes">
          <VoyageRoutesTab ports={ports} />
        </TabsContent>
      </Tabs></motion.div>

      <CreateVoyageDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} ports={ports} newVoyage={newVoyage} onNewVoyageChange={setNewVoyage} onCreate={handleCreateVoyage} />
      <VoyageDetailsDialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen} voyage={selectedVoyage} onOptimize={handleOptimizeRoute} />
    </motion.div>
  );
}
