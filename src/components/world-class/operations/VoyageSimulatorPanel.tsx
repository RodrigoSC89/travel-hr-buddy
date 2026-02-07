/**
 * Voyage Simulator Panel - What-if scenario analysis for voyage planning
 */
import { useState } from "react";
import { useVoyageSimulator, VoyageScenario } from "@/hooks/useVoyageSimulator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Play, TrendingUp, Fuel, Clock, AlertTriangle, Brain, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const defaultScenario: VoyageScenario = {
  name: "Base",
  fuelPriceChange: 0,
  weatherDelay: 0,
  portCongestion: 0,
  speedReduction: 0,
  cargoVariation: 0,
};

export function VoyageSimulatorPanel() {
  const { simulations, isLoading, createSimulation } = useVoyageSimulator();
  const [isOpen, setIsOpen] = useState(false);
  const [simName, setSimName] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [scenarios, setScenarios] = useState<VoyageScenario[]>([
    { ...defaultScenario, name: "Cenário Base" },
    { ...defaultScenario, name: "Pessimista", fuelPriceChange: 15, weatherDelay: 24, portCongestion: 48 },
    { ...defaultScenario, name: "Otimista", fuelPriceChange: -5, speedReduction: -5, cargoVariation: 10 },
  ]);

  const updateScenario = (index: number, field: keyof VoyageScenario, value: any) => {
    const updated = [...scenarios];
    (updated[index] as any)[field] = value;
    setScenarios(updated);
  };

  const handleRun = async () => {
    if (!simName || !origin || !destination) return;
    await createSimulation.mutateAsync({
      simulation_name: simName,
      origin_port: origin,
      destination_port: destination,
      scenarios,
    });
    setIsOpen(false);
    setSimName("");
    setOrigin("");
    setDestination("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Voyage Simulator
          </h2>
          <p className="text-sm text-muted-foreground">Simulações what-if para otimização de viagens</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Nova Simulação</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Nova Simulação de Viagem</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div><Label>Nome</Label><Input value={simName} onChange={e => setSimName(e.target.value)} placeholder="Ex: Santos → Rotterdam" /></div>
                  <div><Label>Porto Origem</Label><Input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Santos" /></div>
                  <div><Label>Porto Destino</Label><Input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Rotterdam" /></div>
                </div>

                <div className="space-y-4">
                  {scenarios.map((scenario, idx) => (
                    <Card key={idx}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          <Input value={scenario.name} onChange={e => updateScenario(idx, "name", e.target.value)} className="h-7 text-sm font-semibold" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Variação Preço Combustível</span>
                            <span className="font-mono">{scenario.fuelPriceChange > 0 ? "+" : ""}{scenario.fuelPriceChange}%</span>
                          </div>
                          <Slider value={[scenario.fuelPriceChange]} onValueChange={v => updateScenario(idx, "fuelPriceChange", v[0])} min={-30} max={50} step={1} />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Atraso Meteorológico</span>
                            <span className="font-mono">{scenario.weatherDelay}h</span>
                          </div>
                          <Slider value={[scenario.weatherDelay]} onValueChange={v => updateScenario(idx, "weatherDelay", v[0])} min={0} max={120} step={6} />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Congestionamento Portuário</span>
                            <span className="font-mono">{scenario.portCongestion}h</span>
                          </div>
                          <Slider value={[scenario.portCongestion]} onValueChange={v => updateScenario(idx, "portCongestion", v[0])} min={0} max={96} step={6} />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Redução de Velocidade</span>
                            <span className="font-mono">{scenario.speedReduction}%</span>
                          </div>
                          <Slider value={[scenario.speedReduction]} onValueChange={v => updateScenario(idx, "speedReduction", v[0])} min={-10} max={30} step={1} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button onClick={handleRun} disabled={createSimulation.isPending} className="w-full">
                  <Play className="h-4 w-4 mr-1" />
                  {createSimulation.isPending ? "Simulando..." : "Executar Simulação com IA"}
                </Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Past Simulations */}
      {isLoading ? (
        <div className="space-y-3">{[1, 2].map(i => <Card key={i}><CardContent className="p-6 h-32 animate-pulse bg-muted/30" /></Card>)}</div>
      ) : simulations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhuma simulação ainda</p>
            <p className="text-sm">Crie cenários what-if para otimizar viagens</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {simulations.map((sim, i) => (
            <motion.div key={sim.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{sim.simulation_name}</h3>
                      <Badge variant={sim.status === "completed" ? "default" : "secondary"}>{sim.status}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(sim.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">{sim.origin_port} <ChevronRight className="h-3 w-3" /> {sim.destination_port}</span>
                    {sim.estimated_profit && <span className="flex items-center gap-1 text-emerald-600"><TrendingUp className="h-3 w-3" /> ${sim.estimated_profit?.toLocaleString()}</span>}
                    {sim.estimated_fuel_cost && <span className="flex items-center gap-1"><Fuel className="h-3 w-3" /> ${sim.estimated_fuel_cost?.toLocaleString()}</span>}
                    {sim.estimated_duration_hours && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {sim.estimated_duration_hours}h</span>}
                  </div>
                  {sim.ai_analysis && (
                    <div className="mt-2 p-2 rounded bg-primary/5 border border-primary/10 text-xs">
                      <span className="font-medium text-primary">🧠 Análise AI: </span>
                      {sim.ai_analysis.substring(0, 200)}...
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
