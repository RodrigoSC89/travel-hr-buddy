/**
 * Voyage Simulator Panel - What-if scenario analysis for voyage planning
 * ENHANCED: Full CRUD, vessel selector, detailed results, comparison view
 */
import { useState, useMemo } from "react";
import { useVoyageSimulator, VoyageScenario } from "@/hooks/useVoyageSimulator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Plus, Play, TrendingUp, Fuel, Clock, AlertTriangle, Brain, ChevronRight, 
  Ship, Trash2, Eye, Download, RefreshCw, MapPin, DollarSign, 
  BarChart3, Shield, Anchor, Navigation, Copy, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const defaultScenario: VoyageScenario = {
  name: "Base",
  fuelPriceChange: 0,
  weatherDelay: 0,
  portCongestion: 0,
  speedReduction: 0,
  cargoVariation: 0,
};

const COMMON_PORTS = [
  "Santos", "Rotterdam", "Singapore", "Shanghai", "Houston", "Fujairah",
  "Paranaguá", "Rio Grande", "Antwerp", "Hamburg", "Piraeus", "Dubai",
  "Tokyo", "Busan", "Mumbai", "Cape Town", "New York", "Los Angeles",
  "Itajaí", "São Luís", "Manaus", "Suape", "Pecém", "Vitória"
];

function PortInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filtered = COMMON_PORTS.filter(p => 
    p.toLowerCase().includes(value.toLowerCase()) && p.toLowerCase() !== value.toLowerCase()
  ).slice(0, 6);

  return (
    <div className="relative">
      <Label className="text-xs">{label}</Label>
      <div className="relative">
        <MapPin className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input 
          value={value} 
          onChange={e => { onChange(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Ex: Santos" 
          className="pl-8 h-9"
        />
      </div>
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-36 overflow-y-auto">
          {filtered.map(port => (
            <button
              key={port}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors"
              onMouseDown={() => { onChange(port); setShowSuggestions(false); }}
            >
              {port}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ScenarioSlider({ label, value, onChange, min, max, step, unit, icon: Icon }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; unit: string; icon: React.ElementType;
}) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="h-3 w-3" />
          {label}
        </span>
        <span className={`font-mono font-medium ${isPositive ? "text-destructive" : isNegative ? "text-success" : ""}`}>
          {value > 0 ? "+" : ""}{value}{unit}
        </span>
      </div>
      <Slider value={[value]} onValueChange={v => onChange(v[0])} min={min} max={max} step={step} />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- simulation result has dynamic shape from Supabase
function SimulationDetailView({ sim, onClose }: { sim: any; onClose: () => void }) {
  const scenarios = Array.isArray(sim.scenarios) ? sim.scenarios : [];
  const riskFactors = Array.isArray(sim.risk_factors) ? sim.risk_factors : [];

  return (
    <DialogContent className="max-w-3xl max-h-[90vh]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          {sim.simulation_name}
        </DialogTitle>
        <DialogDescription>
          {sim.origin_port} → {sim.destination_port} • {new Date(sim.created_at).toLocaleDateString("pt-BR")}
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="max-h-[70vh] pr-4">
        <div className="space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-l-4 border-l-success">
              <CardContent className="p-3">
                <p className="text-[10px] text-muted-foreground uppercase">Lucro Estimado</p>
                <p className="text-lg font-bold text-success">
                  ${sim.estimated_profit?.toLocaleString() || "—"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-warning">
              <CardContent className="p-3">
                <p className="text-[10px] text-muted-foreground uppercase">Custo Combustível</p>
                <p className="text-lg font-bold text-warning">
                  ${sim.estimated_fuel_cost?.toLocaleString() || "—"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-3">
                <p className="text-[10px] text-muted-foreground uppercase">Duração</p>
                <p className="text-lg font-bold">
                  {sim.estimated_duration_hours ? `${sim.estimated_duration_hours}h` : "—"}
                </p>
                {sim.estimated_duration_hours && (
                  <p className="text-[10px] text-muted-foreground">
                    {Math.round(sim.estimated_duration_hours / 24)} dias
                  </p>
                )}
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-3">
                <p className="text-[10px] text-muted-foreground uppercase">Cenário Recomendado</p>
                <p className="text-lg font-bold">
                  {sim.recommended_scenario != null && scenarios[sim.recommended_scenario]
                    ? scenarios[sim.recommended_scenario].name
                    : "—"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis */}
          {sim.ai_analysis && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  Análise de IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                  {sim.ai_analysis}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scenarios Comparison */}
          {scenarios.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Cenários Comparados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {scenarios.map((s: VoyageScenario, i: number) => (
                    <div 
                      key={`scenario-${s.name}-${i}`} 
                      className={`p-3 rounded-lg border ${
                        sim.recommended_scenario === i ? "border-primary bg-primary/5 ring-1 ring-primary/30" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{s.name}</span>
                        {sim.recommended_scenario === i && (
                          <Badge variant="default" className="text-[10px]">Recomendado</Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Combustível</span>
                          <span className={s.fuelPriceChange > 0 ? "text-destructive" : s.fuelPriceChange < 0 ? "text-success" : ""}>
                            {s.fuelPriceChange > 0 ? "+" : ""}{s.fuelPriceChange}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Atraso Meteo</span>
                          <span>{s.weatherDelay}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Congestionamento</span>
                          <span>{s.portCongestion}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Velocidade</span>
                          <span>{s.speedReduction > 0 ? "-" : ""}{s.speedReduction}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Factors */}
          {riskFactors.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-warning" />
                  Fatores de Risco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- risk factors from AI have dynamic shape */}
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- risk factors from AI have dynamic shape */}
                  {riskFactors.map((rf: any, i: number) => (
                    <div key={`rf-${i}-${rf.factor}`} className="flex items-start gap-3 p-2 rounded border">
                      <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                        rf.severity === "high" || rf.impact === "high" ? "text-destructive" : 
                        rf.severity === "medium" || rf.impact === "medium" ? "text-warning" : "text-muted-foreground"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{rf.factor}</p>
                        {rf.mitigation && <p className="text-xs text-muted-foreground mt-0.5">{rf.mitigation}</p>}
                      </div>
                      <Badge variant="outline" className="text-[10px] flex-shrink-0">
                        {rf.severity || rf.probability || "—"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </DialogContent>
  );
}

export function VoyageSimulatorPanel() {
  const { simulations, isLoading, createSimulation, deleteSimulation, refetch } = useVoyageSimulator();
  const [isOpen, setIsOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- simulation result dynamic shape
  const [selectedSim, setSelectedSim] = useState<any>(null);
  const [simName, setSimName] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedVessel, setSelectedVessel] = useState<string>("");
  const [scenarios, setScenarios] = useState<VoyageScenario[]>([
    { ...defaultScenario, name: "Cenário Base" },
    { ...defaultScenario, name: "Pessimista", fuelPriceChange: 15, weatherDelay: 24, portCongestion: 48 },
    { ...defaultScenario, name: "Otimista", fuelPriceChange: -5, speedReduction: -5, cargoVariation: 10 },
  ]);

  // Fetch vessels for selector
  const { data: vessels = [] } = useQuery({
    queryKey: ["voyage-sim-vessels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, vessel_type, status")
        .order("name");
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const updateScenario = (index: number, field: keyof VoyageScenario, value: string | number | boolean) => {
    const updated = [...scenarios];
    updated[index] = { ...updated[index], [field]: value };
    setScenarios(updated);
  };

  const addScenario = () => {
    if (scenarios.length >= 5) {
      toast.warning("Máximo de 5 cenários por simulação");
      return;
    }
    setScenarios([...scenarios, { ...defaultScenario, name: `Cenário ${scenarios.length + 1}` }]);
  };

  const removeScenario = (idx: number) => {
    if (scenarios.length <= 1) return;
    setScenarios(scenarios.filter((_, i) => i !== idx));
  };

  const duplicateScenario = (idx: number) => {
    if (scenarios.length >= 5) return;
    const copy = { ...scenarios[idx], name: `${scenarios[idx].name} (cópia)` };
    setScenarios([...scenarios, copy]);
  };

  const handleRun = async () => {
    if (!simName.trim()) { toast.error("Informe o nome da simulação"); return; }
    if (!origin.trim()) { toast.error("Informe o porto de origem"); return; }
    if (!destination.trim()) { toast.error("Informe o porto de destino"); return; }
    
    await createSimulation.mutateAsync({
      vessel_id: selectedVessel || undefined,
      simulation_name: simName,
      origin_port: origin,
      destination_port: destination,
      scenarios,
    });
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSimName("");
    setOrigin("");
    setDestination("");
    setSelectedVessel("");
    setScenarios([
      { ...defaultScenario, name: "Cenário Base" },
      { ...defaultScenario, name: "Pessimista", fuelPriceChange: 15, weatherDelay: 24, portCongestion: 48 },
      { ...defaultScenario, name: "Otimista", fuelPriceChange: -5, speedReduction: -5, cargoVariation: 10 },
    ]);
  };

  const handleDelete = async (id: string) => {
    await deleteSimulation.mutateAsync(id);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- simulation result dynamic shape
  const handleExport = (sim: any) => {
    const blob = new Blob([JSON.stringify(sim, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voyage-sim-${sim.simulation_name?.replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Simulação exportada");
  };

  // Stats
  const stats = useMemo(() => {
    const completed = simulations.filter(s => s.status === "completed");
    const avgProfit = completed.length > 0 
      ? completed.reduce((a, s) => a + (s.estimated_profit || 0), 0) / completed.length 
      : 0;
    return { total: simulations.length, completed: completed.length, avgProfit };
  }, [simulations]);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Voyage Simulator
            </h2>
            <p className="text-sm text-muted-foreground">Simulações what-if para otimização de viagens</p>
          </div>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Atualizar</TooltipContent>
            </Tooltip>
            <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Simulação</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-primary" />
                    Nova Simulação de Viagem
                  </DialogTitle>
                  <DialogDescription>
                    Configure a rota e cenários para análise what-if com IA
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[65vh] pr-4">
                  <div className="space-y-5">
                    {/* Route Info */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Nome da Simulação</Label>
                          <Input 
                            value={simName} 
                            onChange={e => setSimName(e.target.value)} 
                            placeholder="Ex: Santos → Rotterdam Q1/2026"
                            className="h-9"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Embarcação (opcional)</Label>
                          <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Selecionar embarcação..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhuma</SelectItem>
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- vessels from Supabase query */}
                              {vessels.map((v) => (
                                <SelectItem key={v.id} value={v.id}>
                                  <span className="flex items-center gap-2">
                                    <Ship className="h-3 w-3" />
                                    {v.name}
                                    <Badge variant="outline" className="text-[9px] ml-1">{v.vessel_type}</Badge>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <PortInput value={origin} onChange={setOrigin} label="Porto de Origem" />
                        <PortInput value={destination} onChange={setDestination} label="Porto de Destino" />
                      </div>
                    </div>

                    <Separator />

                    {/* Scenarios */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Cenários ({scenarios.length}/5)</Label>
                        <Button variant="outline" size="sm" onClick={addScenario} disabled={scenarios.length >= 5}>
                          <Plus className="h-3 w-3 mr-1" /> Adicionar
                        </Button>
                      </div>

                      {scenarios.map((scenario, idx) => (
                        <Card key={`edit-scenario-${scenario.name}-${idx}`} className="relative">
                          <CardHeader className="pb-2 pt-3 px-4">
                            <div className="flex items-center justify-between">
                              <Input 
                                value={scenario.name} 
                                onChange={e => updateScenario(idx, "name", e.target.value)} 
                                className="h-7 text-sm font-semibold w-48 border-none px-0 focus-visible:ring-0" 
                              />
                              <div className="flex gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => duplicateScenario(idx)}>
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Duplicar</TooltipContent>
                                </Tooltip>
                                {scenarios.length > 1 && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeScenario(idx)}>
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Remover</TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3 px-4 pb-4">
                            <ScenarioSlider
                              label="Variação Preço Combustível"
                              value={scenario.fuelPriceChange}
                              onChange={v => updateScenario(idx, "fuelPriceChange", v)}
                              min={-30} max={50} step={1} unit="%" icon={Fuel}
                            />
                            <ScenarioSlider
                              label="Atraso Meteorológico"
                              value={scenario.weatherDelay}
                              onChange={v => updateScenario(idx, "weatherDelay", v)}
                              min={0} max={120} step={6} unit="h" icon={AlertTriangle}
                            />
                            <ScenarioSlider
                              label="Congestionamento Portuário"
                              value={scenario.portCongestion}
                              onChange={v => updateScenario(idx, "portCongestion", v)}
                              min={0} max={96} step={6} unit="h" icon={Anchor}
                            />
                            <ScenarioSlider
                              label="Redução de Velocidade"
                              value={scenario.speedReduction}
                              onChange={v => updateScenario(idx, "speedReduction", v)}
                              min={-10} max={30} step={1} unit="%" icon={Navigation}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                  <Button onClick={handleRun} disabled={createSimulation.isPending} className="gap-2">
                    <Play className="h-4 w-4" />
                    {createSimulation.isPending ? "Simulando..." : "Executar com IA"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        {simulations.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                  <p className="text-lg font-bold">{stats.completed}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <DollarSign className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lucro Médio</p>
                  <p className="text-lg font-bold">${Math.round(stats.avgProfit).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Past Simulations */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i}><CardContent className="p-6 h-28 animate-pulse bg-muted/30" /></Card>
            ))}
          </div>
        ) : simulations.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Navigation className="h-8 w-8 text-primary/60" />
              </div>
              <p className="font-semibold text-lg mb-1">Nenhuma simulação ainda</p>
              <p className="text-sm text-muted-foreground mb-4">
                Crie cenários what-if para otimizar rotas, custos de combustível e lucro das viagens
              </p>
              <Button onClick={() => setIsOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Primeira Simulação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {simulations.map((sim, i) => (
                <motion.div 
                  key={sim.id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="hover:shadow-md transition-all group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className="font-semibold text-sm truncate">{sim.simulation_name}</h3>
                            <Badge variant={sim.status === "completed" ? "default" : sim.status === "analyzing" ? "secondary" : "outline"}>
                              {sim.status === "completed" ? "Concluída" : sim.status === "analyzing" ? "Analisando..." : sim.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {sim.origin_port} <ChevronRight className="h-3 w-3" /> {sim.destination_port}
                            </span>
                            {sim.estimated_profit != null && (
                              <span className="flex items-center gap-1 text-success font-medium">
                                <TrendingUp className="h-3 w-3" /> ${sim.estimated_profit?.toLocaleString()}
                              </span>
                            )}
                            {sim.estimated_fuel_cost != null && (
                              <span className="flex items-center gap-1">
                                <Fuel className="h-3 w-3" /> ${sim.estimated_fuel_cost?.toLocaleString()}
                              </span>
                            )}
                            {sim.estimated_duration_hours != null && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {sim.estimated_duration_hours}h ({Math.round(sim.estimated_duration_hours / 24)}d)
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(sim.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          {sim.ai_analysis && (
                            <div className="mt-2 p-2 rounded bg-primary/5 border border-primary/10 text-xs line-clamp-2">
                              <span className="font-medium text-primary">🧠 IA: </span>
                              {sim.ai_analysis.substring(0, 200)}...
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedSim(sim)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalhes</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleExport(sim)}>
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Exportar JSON</TooltipContent>
                          </Tooltip>
                          <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Excluir</TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir simulação?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. A simulação "{sim.simulation_name}" será permanentemente removida.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(sim.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Detail View Dialog */}
        <Dialog open={!!selectedSim} onOpenChange={() => setSelectedSim(null)}>
          {selectedSim && <SimulationDetailView sim={selectedSim} onClose={() => setSelectedSim(null)} />}
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
