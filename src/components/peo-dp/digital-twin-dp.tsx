import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Box,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Zap,
  Activity,
  Cpu,
  Settings,
  TrendingUp,
  Shield,
  Target,
  RefreshCw,
  Download,
  Brain,
  Ship,
  Gauge,
  Power,
  Anchor
} from "lucide-react";

interface SimulationScenario {
  id: string;
  name: string;
  type: "failure" | "training" | "validation" | "stress";
  description: string;
  components: string[];
  duration: number;
  difficulty: "easy" | "medium" | "hard";
}

interface ComponentHealth {
  id: string;
  name: string;
  category: "thruster" | "power" | "sensor" | "reference" | "control";
  healthScore: number;
  predictedFailure?: string;
  lastMaintenance: string;
  hoursToFailure?: number;
}

const mockScenarios: SimulationScenario[] = [
  { id: "SIM-001", name: "Perda de Thruster #1", type: "failure", description: "Simula perda súbita do thruster principal", components: ["THR-01"], duration: 15, difficulty: "medium" },
  { id: "SIM-002", name: "Blackout Parcial", type: "failure", description: "Perda de 50% da capacidade de geração", components: ["GEN-01", "GEN-02"], duration: 20, difficulty: "hard" },
  { id: "SIM-003", name: "Falha de Referência PRS", type: "failure", description: "Perda de referência de posicionamento", components: ["PRS-01"], duration: 10, difficulty: "medium" },
  { id: "SIM-004", name: "Stress Test - Condições Extremas", type: "stress", description: "Operação em limites de ASOG", components: ["ALL"], duration: 30, difficulty: "hard" },
  { id: "SIM-005", name: "Treinamento TAM/CAM", type: "training", description: "Transição de modos de operação", components: ["DP-CTRL"], duration: 25, difficulty: "easy" },
  { id: "SIM-006", name: "Validação FMEA", type: "validation", description: "Teste de cenários FMEA documentados", components: ["ALL"], duration: 45, difficulty: "hard" }
];

const mockComponents: ComponentHealth[] = [
  { id: "THR-01", name: "Thruster Azimuthal #1", category: "thruster", healthScore: 92, lastMaintenance: "2024-10-15", hoursToFailure: 2500 },
  { id: "THR-02", name: "Thruster Azimuthal #2", category: "thruster", healthScore: 88, lastMaintenance: "2024-09-20", hoursToFailure: 1800 },
  { id: "THR-03", name: "Bow Thruster", category: "thruster", healthScore: 75, predictedFailure: "Bearing degradation", lastMaintenance: "2024-08-10", hoursToFailure: 500 },
  { id: "GEN-01", name: "Generator #1", category: "power", healthScore: 95, lastMaintenance: "2024-11-01" },
  { id: "GEN-02", name: "Generator #2", category: "power", healthScore: 91, lastMaintenance: "2024-10-25" },
  { id: "PRS-01", name: "DGPS Reference", category: "reference", healthScore: 98, lastMaintenance: "2024-11-10" },
  { id: "PRS-02", name: "Hydroacoustic System", category: "reference", healthScore: 85, lastMaintenance: "2024-09-15" },
  { id: "MRU-01", name: "Motion Reference Unit", category: "sensor", healthScore: 94, lastMaintenance: "2024-10-20" },
  { id: "GYRO-01", name: "Gyrocompass", category: "sensor", healthScore: 97, lastMaintenance: "2024-11-05" },
  { id: "DP-CTRL", name: "DP Control System", category: "control", healthScore: 99, lastMaintenance: "2024-11-15" }
];

export const DigitalTwinDP: React.FC = () => {
  const [activeTab, setActiveTab] = useState("sandbox");
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [environmentalParams, setEnvironmentalParams] = useState({
    windSpeed: 15,
    waveHeight: 1.5,
    current: 0.8
  };
  const [liveComparison, setLiveComparison] = useState(false);

  const handleStartSimulation = () => {
    if (!selectedScenario) {
      toast.error("Selecione um cenário de simulação");
      return;
    }
    setIsSimulating(true);
    setSimulationProgress(0);
    
    const interval = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulating(false);
          toast.success("Simulação concluída");
          return 100;
        }
        return prev + 5;
  };
    }, 500);
  };

  const handleStopSimulation = () => {
    setIsSimulating(false);
    toast.info("Simulação pausada");
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
    case "thruster": return <Anchor className="h-4 w-4" />;
    case "power": return <Power className="h-4 w-4" />;
    case "sensor": return <Gauge className="h-4 w-4" />;
    case "reference": return <Target className="h-4 w-4" />;
    case "control": return <Cpu className="h-4 w-4" />;
    default: return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Box className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Digital Twin DP</h2>
            <p className="text-muted-foreground">Simulação e diagnóstico preditivo do sistema DP</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Comparação Live</span>
            <Switch checked={liveComparison} onCheckedChange={setLiveComparison} />
          </div>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Exportar Relatório</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saúde Geral</p>
                <p className="text-2xl font-bold">91%</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Simulações Hoje</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Play className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Preditivos</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Desvio Real/Sim</p>
                <p className="text-2xl font-bold">2.3%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sandbox" className="flex items-center gap-2"><Play className="w-4 h-4" />Sandbox</TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center gap-2"><Brain className="w-4 h-4" />Preditivo</TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2"><RefreshCw className="w-4 h-4" />Comparativo</TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2"><Target className="w-4 h-4" />Treinamento</TabsTrigger>
        </TabsList>

        <TabsContent value="sandbox" className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            {/* Scenario Selection */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Cenários de Simulação</CardTitle>
                <CardDescription>Selecione um cenário para executar no sandbox</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {mockScenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedScenario?.id === scenario.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={handleSetSelectedScenario}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={scenario.type === "failure" ? "destructive" : scenario.type === "stress" ? "default" : "secondary"}>
                          {scenario.type === "failure" ? "Falha" : scenario.type === "stress" ? "Stress" : scenario.type === "training" ? "Treinamento" : "Validação"}
                        </Badge>
                        <Badge variant="outline" className={scenario.difficulty === "hard" ? "border-red-500 text-red-500" : scenario.difficulty === "medium" ? "border-yellow-500 text-yellow-500" : "border-green-500 text-green-500"}>
                          {scenario.difficulty === "hard" ? "Difícil" : scenario.difficulty === "medium" ? "Médio" : "Fácil"}
                        </Badge>
                      </div>
                      <h4 className="font-medium">{scenario.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{scenario.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">⏱️ {scenario.duration} min</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Environmental Parameters */}
            <Card>
              <CardHeader>
                <CardTitle>Parâmetros Ambientais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Vento</span>
                    <span className="font-medium">{environmentalParams.windSpeed} kn</span>
                  </div>
                  <Slider
                    value={[environmentalParams.windSpeed]}
                    onValueChange={([v]) => setEnvironmentalParams(p => ({ ...p, windSpeed: v }))}
                    max={50}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Onda</span>
                    <span className="font-medium">{environmentalParams.waveHeight} m</span>
                  </div>
                  <Slider
                    value={[environmentalParams.waveHeight * 10]}
                    onValueChange={([v]) => setEnvironmentalParams(p => ({ ...p, waveHeight: v / 10 }))}
                    max={50}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Corrente</span>
                    <span className="font-medium">{environmentalParams.current} kn</span>
                  </div>
                  <Slider
                    value={[environmentalParams.current * 10]}
                    onValueChange={([v]) => setEnvironmentalParams(p => ({ ...p, current: v / 10 }))}
                    max={30}
                    step={1}
                  />
                </div>

                <div className="pt-4 space-y-3">
                  {isSimulating ? (
                    <>
                      <Progress value={simulationProgress} className="h-3" />
                      <p className="text-sm text-center text-muted-foreground">{simulationProgress}% concluído</p>
                      <Button className="w-full" variant="destructive" onClick={handleStopSimulation}>
                        <Pause className="w-4 h-4 mr-2" />Pausar
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full" onClick={handleStartSimulation} disabled={!selectedScenario}>
                      <Play className="w-4 h-4 mr-2" />Iniciar Simulação
                    </Button>
                  )}
                  <Button className="w-full" variant="outline" onClick={handleSetSimulationProgress}>
                    <RotateCcw className="w-4 h-4 mr-2" />Resetar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Análise Preditiva de Componentes
              </CardTitle>
              <CardDescription>Machine Learning para previsão de falhas e envelhecimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockComponents.map((component) => (
                  <div key={component.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-muted ${getHealthColor(component.healthScore)}`}>
                          {getCategoryIcon(component.category)}
                        </div>
                        <div>
                          <h4 className="font-medium">{component.name}</h4>
                          <p className="text-xs text-muted-foreground">{component.id} • Última manutenção: {new Date(component.lastMaintenance).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {component.hoursToFailure && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Previsão de falha</p>
                            <p className={`font-medium ${component.hoursToFailure < 1000 ? "text-red-500" : "text-green-500"}`}>
                              {component.hoursToFailure}h
                            </p>
                          </div>
                        )}
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Saúde</p>
                          <p className={`text-xl font-bold ${getHealthColor(component.healthScore)}`}>{component.healthScore}%</p>
                        </div>
                      </div>
                    </div>
                    {component.predictedFailure && (
                      <div className="mt-3 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                        <p className="text-sm text-yellow-600 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Falha prevista: {component.predictedFailure}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Real</CardTitle>
                <CardDescription>Dados do sistema DP em operação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Consumo de Potência</span>
                    <span className="font-bold">4.2 MW</span>
                  </div>
                  <Progress value={70} className="h-2" />
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Utilização Thrusters</span>
                    <span className="font-bold">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Precisão de Posição</span>
                    <span className="font-bold">±0.8m</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Simulada</CardTitle>
                <CardDescription>Modelo digital twin calculado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Consumo de Potência</span>
                    <span className="font-bold">4.1 MW</span>
                  </div>
                  <Progress value={68} className="h-2" />
                  <p className="text-xs text-green-500 mt-1">-2.4% vs real</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Utilização Thrusters</span>
                    <span className="font-bold">62%</span>
                  </div>
                  <Progress value={62} className="h-2" />
                  <p className="text-xs text-green-500 mt-1">-4.6% vs real</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Precisão de Posição</span>
                    <span className="font-bold">±0.7m</span>
                  </div>
                  <Progress value={95} className="h-2" />
                  <p className="text-xs text-green-500 mt-1">+3.3% vs real</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cenários de Treinamento Offboard</CardTitle>
              <CardDescription>Treinamento em ambiente seguro baseado em dados reais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {mockScenarios.filter(s => s.type === "training" || s.type === "validation").map((scenario) => (
                  <Card key={scenario.id} className="hover:shadow-lg transition-all">
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2">{scenario.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge>{scenario.duration} min</Badge>
                        <Button size="sm"><Play className="w-3 h-3 mr-1" />Iniciar</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default DigitalTwinDP;
