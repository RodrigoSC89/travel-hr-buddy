/**
 * Drill Simulator - Emergency Scenarios, Performance Evaluation, Auto Reports
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Siren,
  Play,
  Pause,
  Square,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  Ship,
  Flame,
  Droplets,
  Wind,
  LifeBuoy,
  FileText,
  BarChart3,
  TrendingUp,
  Timer,
  Award,
  Target,
  Brain
} from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface DrillScenario {
  id: string;
  name: string;
  type: "fire" | "abandon_ship" | "mob" | "oil_spill" | "flooding" | "collision" | "security";
  description: string;
  duration: number; // minutes
  participants: number;
  difficulty: "easy" | "medium" | "hard";
  objectives: string[];
  lastRun: Date | null;
}

interface DrillResult {
  id: string;
  scenarioId: string;
  scenarioName: string;
  date: Date;
  duration: number;
  participants: number;
  score: number;
  metrics: {
    responseTime: number;
    communication: number;
    coordination: number;
    procedureCompliance: number;
    equipmentUse: number;
  };
  passed: boolean;
  findings: string[];
  recommendations: string[];
}

interface ActiveDrill {
  scenario: DrillScenario;
  startTime: Date;
  elapsedTime: number;
  currentPhase: number;
  completedObjectives: string[];
  participants: { name: string; role: string; status: "active" | "completed" | "pending" }[];
}

const SCENARIOS: DrillScenario[] = [
  {
    id: "fire",
    name: "Incêndio na Praça de Máquinas",
    type: "fire",
    description: "Simulação de incêndio no compartimento de máquinas com evacuação parcial",
    duration: 30,
    participants: 24,
    difficulty: "medium",
    objectives: ["Detecção em 30s", "Alarme geral", "Equipe de combate mobilizada em 3min", "Contenção em 15min"],
    lastRun: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  {
    id: "abandon",
    name: "Abandono de Navio",
    type: "abandon_ship",
    description: "Evacuação completa do navio para baleeiras e balsas",
    duration: 45,
    participants: 32,
    difficulty: "hard",
    objectives: ["Alarme de abandono", "Muster em 4min", "Embarque em 10min", "Lançamento em 15min"],
    lastRun: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  },
  {
    id: "mob",
    name: "Homem ao Mar (MOB)",
    type: "mob",
    description: "Procedimento de resgate de pessoa caída ao mar",
    duration: 20,
    participants: 12,
    difficulty: "medium",
    objectives: ["Alarme MOB", "Marcação da posição", "Manobra Williamson", "Resgate em 8min"],
    lastRun: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  },
  {
    id: "spill",
    name: "Vazamento de Óleo",
    type: "oil_spill",
    description: "Contenção e limpeza de derramamento de óleo no convés",
    duration: 25,
    participants: 16,
    difficulty: "easy",
    objectives: ["Identificação do vazamento", "Isolamento da área", "Deploy de barreiras", "Limpeza inicial"],
    lastRun: null
  },
  {
    id: "flood",
    name: "Alagamento",
    type: "flooding",
    description: "Controle de alagamento em compartimento abaixo da linha d'água",
    duration: 35,
    participants: 20,
    difficulty: "hard",
    objectives: ["Detecção de ingresso", "Isolamento de válvulas", "Bombeamento de emergência", "Estabilidade verificada"],
    lastRun: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
  }
];

const PAST_RESULTS: DrillResult[] = [
  {
    id: "r1",
    scenarioId: "fire",
    scenarioName: "Incêndio na Praça de Máquinas",
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    duration: 28,
    participants: 24,
    score: 85,
    metrics: { responseTime: 90, communication: 80, coordination: 85, procedureCompliance: 88, equipmentUse: 82 },
    passed: true,
    findings: ["Tempo de resposta inicial excelente", "Comunicação via rádio precisa melhorar"],
    recommendations: ["Treinar uso do rádio", "Revisar procedimento de ventilação"]
  },
  {
    id: "r2",
    scenarioId: "mob",
    scenarioName: "Homem ao Mar (MOB)",
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    duration: 18,
    participants: 12,
    score: 92,
    metrics: { responseTime: 95, communication: 90, coordination: 92, procedureCompliance: 94, equipmentUse: 88 },
    passed: true,
    findings: ["Excelente tempo de resgate", "Uso correto do equipamento de resgate"],
    recommendations: ["Manter frequência de treinamentos"]
  },
  {
    id: "r3",
    scenarioId: "abandon",
    scenarioName: "Abandono de Navio",
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    duration: 52,
    participants: 30,
    score: 72,
    metrics: { responseTime: 70, communication: 68, coordination: 75, procedureCompliance: 78, equipmentUse: 70 },
    passed: true,
    findings: ["Tempo de muster acima do esperado", "Alguns tripulantes sem colete"],
    recommendations: ["Revisar pontos de encontro", "Inspecionar coletes semanalmente"]
  }
];

export function DrillSimulator() {
  const [activeTab, setActiveTab] = useState("scenarios");
  const [selectedScenario, setSelectedScenario] = useState<DrillScenario | null>(null);
  const [activeDrill, setActiveDrill] = useState<ActiveDrill | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && activeDrill) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, activeDrill]);

  const getScenarioIcon = (type: string) => {
    switch (type) {
      case "fire": return <Flame className="h-5 w-5 text-destructive" />;
      case "abandon_ship": return <Ship className="h-5 w-5 text-warning" />;
      case "mob": return <LifeBuoy className="h-5 w-5 text-primary" />;
      case "oil_spill": return <Droplets className="h-5 w-5 text-warning" />;
      case "flooding": return <Droplets className="h-5 w-5 text-info" />;
      case "collision": return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "security": return <AlertTriangle className="h-5 w-5 text-secondary" />;
      default: return <Siren className="h-5 w-5" />;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return <Badge className="bg-success/20 text-success">Fácil</Badge>;
      case "medium": return <Badge className="bg-warning/20 text-warning">Médio</Badge>;
      case "hard": return <Badge className="bg-destructive/20 text-destructive">Difícil</Badge>;
      default: return <Badge variant="secondary">{difficulty}</Badge>;
    }
  };

  const startDrill = (scenario: DrillScenario) => {
    setActiveDrill({
      scenario,
      startTime: new Date(),
      elapsedTime: 0,
      currentPhase: 0,
      completedObjectives: [],
      participants: [
        { name: "Comandante", role: "Master", status: "active" },
        { name: "Imediato", role: "Chief Officer", status: "pending" },
        { name: "Chefe de Máquinas", role: "Chief Engineer", status: "pending" },
        { name: "Oficial de Segurança", role: "SSO", status: "active" }
      ]
    });
    setIsRunning(true);
    setElapsedTime(0);
    toast.success("Drill iniciado!", {
      description: `${scenario.name} em andamento`
    });
  };

  const stopDrill = () => {
    setIsRunning(false);
    toast.info("Drill pausado");
  };

  const endDrill = () => {
    setIsRunning(false);
    setActiveDrill(null);
    setElapsedTime(0);
    toast.success("Drill finalizado!", {
      description: "Relatório será gerado automaticamente"
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const performanceData = PAST_RESULTS.map(r => ({
    name: r.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    score: r.score,
    target: 80
  }));

  const radarData = PAST_RESULTS.length > 0 ? [
    { metric: "Resposta", value: PAST_RESULTS[0].metrics.responseTime },
    { metric: "Comunicação", value: PAST_RESULTS[0].metrics.communication },
    { metric: "Coordenação", value: PAST_RESULTS[0].metrics.coordination },
    { metric: "Procedimentos", value: PAST_RESULTS[0].metrics.procedureCompliance },
    { metric: "Equipamentos", value: PAST_RESULTS[0].metrics.equipmentUse }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl">
            <Siren className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Drill Simulator
              {isRunning && (
                <Badge variant="destructive" className="animate-pulse">
                  <Timer className="h-3 w-3 mr-1" />
                  EM ANDAMENTO
                </Badge>
              )}
            </h2>
            <p className="text-sm text-muted-foreground">
              Simulações de emergência • Avaliação de performance • Relatórios automáticos
            </p>
          </div>
        </div>
      </div>

      {/* Active Drill Banner */}
      {activeDrill && (
        <Card className="border-orange-500/50 bg-orange-500/10">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center">
                  {getScenarioIcon(activeDrill.scenario.type)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{activeDrill.scenario.name}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Timer className="h-4 w-4" />
                      {formatTime(elapsedTime)} / {activeDrill.scenario.duration}:00
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {activeDrill.participants.filter(p => p.status === "active").length}/{activeDrill.participants.length} ativos
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {isRunning ? (
                  <Button variant="outline" onClick={stopDrill}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </Button>
                ) : (
                  <Button onClick={() => setIsRunning(true)}>
                    <Play className="h-4 w-4 mr-2" />
                    Continuar
                  </Button>
                )}
                <Button variant="destructive" onClick={endDrill}>
                  <Square className="h-4 w-4 mr-2" />
                  Finalizar
                </Button>
              </div>
            </div>
            <Progress value={(elapsedTime / (activeDrill.scenario.duration * 60)) * 100} className="h-2 mt-4" />
            
            {/* Objectives */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              {activeDrill.scenario.objectives.map((obj, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border text-sm ${
                    activeDrill.completedObjectives.includes(obj)
                      ? "bg-green-500/20 border-green-500/50"
                      : "bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {activeDrill.completedObjectives.includes(obj) ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-xs">{obj}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="scenarios">
            <Siren className="h-4 w-4 mr-2" />
            Cenários
          </TabsTrigger>
          <TabsTrigger value="history">
            <FileText className="h-4 w-4 mr-2" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SCENARIOS.map((scenario) => (
              <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getScenarioIcon(scenario.type)}
                      <CardTitle className="text-sm">{scenario.name}</CardTitle>
                    </div>
                    {getDifficultyBadge(scenario.difficulty)}
                  </div>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {scenario.duration} min
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {scenario.participants} pessoas
                      </span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {scenario.lastRun ? (
                        `Último: ${scenario.lastRun.toLocaleDateString("pt-BR")}`
                      ) : (
                        "Nunca executado"
                      )}
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => startDrill(scenario)}
                      disabled={!!activeDrill}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Drill
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Drills</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {PAST_RESULTS.map((result) => (
                    <div key={result.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{result.scenarioName}</span>
                            <Badge className={result.passed ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}>
                              {result.passed ? "Aprovado" : "Reprovado"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{result.date.toLocaleDateString("pt-BR")}</span>
                            <span>{result.duration} min</span>
                            <span>{result.participants} participantes</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-yellow-500" />
                            <span className="text-2xl font-bold">{result.score}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-5 gap-2">
                        {Object.entries(result.metrics).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <Progress value={value} className="h-1 mb-1" />
                            <span className="text-xs text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Evolução de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" name="Score" stroke="#22c55e" strokeWidth={2} />
                      <Line type="monotone" dataKey="target" name="Meta" stroke="#ef4444" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Análise de Competências</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar name="Performance" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                Recomendações IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { priority: "high", text: "Aumentar frequência de drills de abandono - último há 60 dias", action: "Agendar para próxima semana" },
                  { priority: "medium", text: "Comunicação por rádio precisa de treinamento adicional", action: "Incluir em próximo drill" },
                  { priority: "low", text: "Considerar drill de vazamento de óleo - nunca executado", action: "Planejar para Q1" }
                ].map((rec, idx) => (
                  <div key={idx} className="p-3 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={
                        rec.priority === "high" ? "bg-red-500/20 text-red-500" :
                        rec.priority === "medium" ? "bg-yellow-500/20 text-yellow-500" :
                        "bg-green-500/20 text-green-500"
                      }>
                        {rec.priority}
                      </Badge>
                      <span className="text-sm">{rec.text}</span>
                    </div>
                    <Button size="sm" variant="outline">{rec.action}</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DrillSimulator;
