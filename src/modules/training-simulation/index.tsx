/**
 * PATCH: Módulo de Treinamento & Simulação
 * Simulações interativas com cenários de emergência e operações
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  Anchor,
  Users,
  Stethoscope,
  Ship,
  Target,
  Award,
  Clock,
  Brain
} from "lucide-react";
import { toast } from "sonner";

interface Simulation {
  id: string;
  title: string;
  description: string;
  type: "emergency" | "operation" | "navigation" | "maintenance";
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number;
  icon: React.ElementType;
  completed?: boolean;
  score?: number;
}

interface SimulationStep {
  id: number;
  instruction: string;
  options: { text: string; correct: boolean; feedback: string }[];
}

const simulations: Simulation[] = [
  {
    id: "fire-drill",
    title: "Combate a Incêndio",
    description: "Simulação completa de resposta a incêndio em praça de máquinas",
    type: "emergency",
    difficulty: "intermediate",
    duration: 15,
    icon: Flame,
  },
  {
    id: "man-overboard",
    title: "Homem ao Mar",
    description: "Procedimentos de resgate MOB com manobra Williamson",
    type: "emergency",
    difficulty: "advanced",
    duration: 20,
    icon: Users,
  },
  {
    id: "docking",
    title: "Atracação em Porto",
    description: "Manobras de aproximação e atracação segura",
    type: "navigation",
    difficulty: "intermediate",
    duration: 25,
    icon: Anchor,
  },
  {
    id: "medical-emergency",
    title: "Emergência Médica",
    description: "Primeiros socorros e estabilização de paciente",
    type: "emergency",
    difficulty: "beginner",
    duration: 10,
    icon: Stethoscope,
  },
  {
    id: "engine-failure",
    title: "Falha de Motor Principal",
    description: "Diagnóstico e procedimentos de contingência",
    type: "maintenance",
    difficulty: "advanced",
    duration: 30,
    icon: Ship,
  },
];

const simulationSteps: SimulationStep[] = [
  {
    id: 1,
    instruction: "Alarme de incêndio detectado na praça de máquinas. Qual é a primeira ação?",
    options: [
      { text: "Correr para o local do incêndio", correct: false, feedback: "Incorreto. Primeiro avalie a situação de forma segura." },
      { text: "Acionar o alarme geral e comunicar ao passadiço", correct: true, feedback: "Correto! A comunicação imediata é essencial." },
      { text: "Buscar extintores", correct: false, feedback: "Importante, mas a comunicação vem primeiro." },
    ],
  },
  {
    id: 2,
    instruction: "O passadiço foi notificado. Próximo passo?",
    options: [
      { text: "Reunir equipe de combate a incêndio", correct: true, feedback: "Correto! A equipe treinada deve ser mobilizada." },
      { text: "Desligar todas as máquinas", correct: false, feedback: "Pode ser necessário, mas depende da avaliação." },
      { text: "Abandonar o navio", correct: false, feedback: "Prematuro. Primeiro tente controlar a situação." },
    ],
  },
  {
    id: 3,
    instruction: "Equipe reunida. Como proceder para combater o incêndio?",
    options: [
      { text: "Usar água em qualquer tipo de fogo", correct: false, feedback: "Perigoso! Água pode espalhar fogo de óleo." },
      { text: "Identificar classe do fogo e usar agente apropriado", correct: true, feedback: "Correto! Classe B requer CO2 ou espuma." },
      { text: "Fechar todas as portas estanques", correct: false, feedback: "Útil para confinamento, mas não combate direto." },
    ],
  },
];

export default function TrainingSimulation() {
  const [activeSimulation, setActiveSimulation] = useState<Simulation | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completedSimulations, setCompletedSimulations] = useState<string[]>([]);

  const startSimulation = (sim: Simulation) => {
    setActiveSimulation(sim);
    setIsRunning(true);
    setCurrentStep(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    toast.info(`Iniciando simulação: ${sim.title}`);
  };

  const handleAnswer = (optionIndex: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(optionIndex);
    setShowFeedback(true);
    
    const isCorrect = simulationSteps[currentStep].options[optionIndex].correct;
    if (isCorrect) {
      setScore(prev => prev + 100);
      toast.success("Resposta correta!");
    } else {
      toast.error("Resposta incorreta");
    }
  };

  const nextStep = () => {
    if (currentStep < simulationSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // Simulation complete
      setIsRunning(false);
      setCompletedSimulations(prev => [...prev, activeSimulation!.id]);
      toast.success(`Simulação concluída! Pontuação: ${score + (selectedAnswer !== null && simulationSteps[currentStep].options[selectedAnswer].correct ? 100 : 0)}/${simulationSteps.length * 100}`);
    }
  };

  const resetSimulation = () => {
    setCurrentStep(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    toast.info("Simulação reiniciada");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/20 text-green-400";
      case "intermediate": return "bg-yellow-500/20 text-yellow-400";
      case "advanced": return "bg-red-500/20 text-red-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "emergency": return "bg-red-500/20 text-red-400";
      case "operation": return "bg-blue-500/20 text-blue-400";
      case "navigation": return "bg-cyan-500/20 text-cyan-400";
      case "maintenance": return "bg-orange-500/20 text-orange-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            Treinamento & Simulação
          </h1>
          <p className="text-muted-foreground mt-1">
            Simulações interativas para capacitação da tripulação
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{completedSimulations.length}</div>
            <div className="text-xs text-muted-foreground">Completadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{Math.round((completedSimulations.length / simulations.length) * 100)}%</div>
            <div className="text-xs text-muted-foreground">Progresso</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="simulations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="simulations">Simulações Disponíveis</TabsTrigger>
          <TabsTrigger value="active">Simulação Ativa</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="simulations">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {simulations.map((sim) => {
              const Icon = sim.icon;
              const isCompleted = completedSimulations.includes(sim.id);
              
              return (
                <Card key={sim.id} className={`hover:border-primary/50 transition-colors ${isCompleted ? 'border-green-500/50' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                    </div>
                    <CardTitle className="text-lg">{sim.title}</CardTitle>
                    <CardDescription>{sim.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getTypeColor(sim.type)}>
                        {sim.type === "emergency" ? "Emergência" : 
                         sim.type === "operation" ? "Operação" :
                         sim.type === "navigation" ? "Navegação" : "Manutenção"}
                      </Badge>
                      <Badge className={getDifficultyColor(sim.difficulty)}>
                        {sim.difficulty === "beginner" ? "Iniciante" :
                         sim.difficulty === "intermediate" ? "Intermediário" : "Avançado"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{sim.duration} minutos</span>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => startSimulation(sim)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isCompleted ? "Refazer" : "Iniciar"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="active">
          {activeSimulation && isRunning ? (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <activeSimulation.icon className="h-6 w-6 text-primary" />
                    <CardTitle>{activeSimulation.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Passo {currentStep + 1}/{simulationSteps.length}
                    </Badge>
                    <Badge className="bg-primary/20 text-primary">
                      <Award className="h-3 w-3 mr-1" />
                      {score} pts
                    </Badge>
                  </div>
                </div>
                <Progress value={(currentStep / simulationSteps.length) * 100} className="mt-4" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-primary mt-0.5" />
                    <p className="font-medium">{simulationSteps[currentStep].instruction}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {simulationSteps[currentStep].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={showFeedback}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        selectedAnswer === idx
                          ? option.correct
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-red-500 bg-red-500/10'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-sm ${
                          selectedAnswer === idx
                            ? option.correct ? 'bg-green-500 border-green-500 text-white' : 'bg-red-500 border-red-500 text-white'
                            : 'border-muted-foreground'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span>{option.text}</span>
                      </div>
                      {showFeedback && selectedAnswer === idx && (
                        <p className={`mt-2 text-sm ${option.correct ? 'text-green-400' : 'text-red-400'}`}>
                          {option.feedback}
                        </p>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={resetSimulation}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reiniciar
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={nextStep}
                    disabled={!showFeedback}
                  >
                    {currentStep < simulationSteps.length - 1 ? "Próximo" : "Concluir"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Selecione uma simulação para começar
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Simulações</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {completedSimulations.length > 0 ? (
                  <div className="space-y-3">
                    {completedSimulations.map((simId) => {
                      const sim = simulations.find(s => s.id === simId);
                      if (!sim) return null;
                      return (
                        <div key={simId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <sim.icon className="h-5 w-5 text-primary" />
                            <span className="font-medium">{sim.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-green-400">Concluída</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma simulação concluída ainda
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
