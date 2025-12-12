import { useEffect, useState, useCallback, useMemo } from "react";;
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  Play,
  Pause,
  Square,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  FileText,
  Timer,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmergencyPlan {
  id: string;
  type: string;
  title: string;
  status: string;
  last_drill: string;
  next_drill: string;
  drill_frequency_days: number;
  responsible: string;
  contacts: number;
}

interface DrillSimulationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: EmergencyPlan | null;
}

interface DrillStep {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  completed: boolean;
  startedAt?: Date;
  completedAt?: Date;
}

const getDrillSteps = (planType: string): DrillStep[] => {
  const steps: Record<string, DrillStep[]> = {
    fire: [
      { id: "1", title: "Alarme Soado", description: "Acionar alarme de incêndio geral", timeLimit: 30, completed: false },
      { id: "2", title: "Equipe Reunida", description: "Reunir equipe de combate no ponto designado", timeLimit: 120, completed: false },
      { id: "3", title: "Área Evacuada", description: "Evacuar área afetada", timeLimit: 180, completed: false },
      { id: "4", title: "Combate Iniciado", description: "Iniciar combate com extintores/mangueiras", timeLimit: 60, completed: false },
      { id: "5", title: "Incêndio Controlado", description: "Situação sob controle", timeLimit: 300, completed: false },
      { id: "6", title: "Área Verificada", description: "Verificar ausência de focos residuais", timeLimit: 120, completed: false }
    ],
    oil_spill: [
      { id: "1", title: "Vazamento Identificado", description: "Localizar e identificar fonte do derramamento", timeLimit: 60, completed: false },
      { id: "2", title: "Equipe Acionada", description: "Acionar equipe de resposta ambiental", timeLimit: 90, completed: false },
      { id: "3", title: "Contenção Primária", description: "Estancar vazamento se possível", timeLimit: 180, completed: false },
      { id: "4", title: "Barreiras Instaladas", description: "Instalar barreiras de contenção", timeLimit: 300, completed: false },
      { id: "5", title: "Recolhimento Iniciado", description: "Iniciar operação de skimming/absorção", timeLimit: 120, completed: false },
      { id: "6", title: "IBAMA Notificado", description: "Comunicar autoridade ambiental", timeLimit: 60, completed: false }
    ],
    man_overboard: [
      { id: "1", title: "Alarme MOB", description: "Gritar 'Homem ao Mar!' e manter visual", timeLimit: 10, completed: false },
      { id: "2", title: "Boia Lançada", description: "Lançar boia salva-vidas com luz", timeLimit: 20, completed: false },
      { id: "3", title: "Manobra Iniciada", description: "Executar manobra de retorno (Williamson)", timeLimit: 60, completed: false },
      { id: "4", title: "Bote Preparado", description: "Preparar bote de resgate", timeLimit: 120, completed: false },
      { id: "5", title: "Vítima Resgatada", description: "Resgatar pessoa da água", timeLimit: 180, completed: false },
      { id: "6", title: "Atendimento Médico", description: "Prestar primeiros socorros", timeLimit: 60, completed: false }
    ],
    medical: [
      { id: "1", title: "Emergência Identificada", description: "Avaliação inicial da situação", timeLimit: 30, completed: false },
      { id: "2", title: "Enfermaria Acionada", description: "Chamar equipe médica de bordo", timeLimit: 60, completed: false },
      { id: "3", title: "Vítima Estabilizada", description: "Estabilizar sinais vitais", timeLimit: 180, completed: false },
      { id: "4", title: "Telemedicina Ativa", description: "Contatar médico em terra", timeLimit: 120, completed: false },
      { id: "5", title: "Tratamento Aplicado", description: "Seguir orientações médicas", timeLimit: 300, completed: false },
      { id: "6", title: "Monitoramento Contínuo", description: "Manter observação da vítima", timeLimit: 60, completed: false }
    ],
    abandon_ship: [
      { id: "1", title: "Alarme Geral", description: "Soar alarme de abandonar navio", timeLimit: 30, completed: false },
      { id: "2", title: "Pontos de Reunião", description: "Todos nos pontos designados", timeLimit: 180, completed: false },
      { id: "3", title: "Contagem de Pessoal", description: "Verificar presença de todos tripulantes", timeLimit: 120, completed: false },
      { id: "4", title: "Coletes Distribuídos", description: "Distribuir coletes salva-vidas", timeLimit: 120, completed: false },
      { id: "5", title: "Balsas Preparadas", description: "Preparar balsas para lançamento", timeLimit: 180, completed: false },
      { id: "6", title: "Embarque Completo", description: "Todos embarcados nas balsas", timeLimit: 300, completed: false }
    ]
  };
  
  return steps[planType] || steps.fire;
};

export const DrillSimulationDialog: React.FC<DrillSimulationDialogProps> = ({
  open,
  onOpenChange,
  plan
}) => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [steps, setSteps] = useState<DrillStep[]>([]);
  const [observations, setObservations] = useState("");
  const [drillStarted, setDrillStarted] = useState(false);

  useEffect(() => {
    if (plan) {
      setSteps(getDrillSteps(plan.type));
      setElapsedTime(0);
      setIsRunning(false);
      setIsPaused(false);
      setDrillStarted(false);
      setObservations("");
    }
  }, [plan]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  if (!plan) return null;

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartDrill = () => {
    setIsRunning(true);
    setDrillStarted(true);
    setIsPaused(false);
    toast({
      title: "Simulado Iniciado",
      description: `${plan.title} em andamento`,
    };
  };

  const handlePauseDrill = () => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "Simulado Retomado" : "Simulado Pausado",
      description: isPaused ? "Cronômetro retomado" : "Cronômetro pausado",
    };
  };

  const handleStopDrill = () => {
    setIsRunning(false);
    toast({
      title: "Simulado Encerrado",
      description: `Duração total: ${formatTime(elapsedTime)}`,
      variant: "destructive"
    };
  };

  const handleStepToggle = (stepId: string) => {
    setSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        const newCompleted = !step.completed;
        return {
          ...step,
          completed: newCompleted,
          completedAt: newCompleted ? new Date() : undefined
        };
      }
      return step;
    }));
  };

  const handleSaveReport = () => {
    toast({
      title: "Relatório Salvo",
      description: "O relatório do simulado foi salvo com sucesso",
    };
    onOpenChange(false);
  };

  const allCompleted = steps.every(s => s.completed);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Activity className="h-6 w-6 text-orange-600" />
            Simulado: {plan.title}
          </DialogTitle>
          <DialogDescription>
            Execute e registre o simulado de emergência
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Timer and Controls */}
          <Card className={`${isRunning ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Tempo Decorrido</p>
                    <p className={`text-4xl font-mono font-bold ${isRunning && !isPaused ? "text-orange-600" : ""}`}>
                      {formatTime(elapsedTime)}
                    </p>
                  </div>
                  <Separator orientation="vertical" className="h-12" />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Progresso</p>
                    <p className="text-2xl font-bold">{completedSteps}/{steps.length}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!drillStarted ? (
                    <Button onClick={handleStartDrill} className="bg-green-600 hover:bg-green-700">
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Simulado
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={handlePauseDrill}
                        disabled={!isRunning}
                      >
                        {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleStopDrill}
                        disabled={!isRunning}
                      >
                        <Square className="h-4 w-4 mr-2" />
                        Encerrar
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              <Progress value={progress} className="mt-4 h-2" />
            </CardContent>
          </Card>

          {/* Steps Checklist */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Etapas do Simulado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[250px]">
                <div className="space-y-3">
                  {steps.map((step, idx) => (
                    <div 
                      key={step.id} 
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        step.completed 
                          ? "bg-green-50 dark:bg-green-950/30 border-green-200" 
                          : "bg-muted/30"
                      }`}
                    >
                      <Checkbox
                        checked={step.completed}
                        onCheckedChange={() => handleStepToggle(step.id}
                        disabled={!drillStarted}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium ${step.completed ? "text-green-700 dark:text-green-400 line-through" : ""}`}>
                            {idx + 1}. {step.title}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            <Timer className="h-3 w-3 mr-1" />
                            {step.timeLimit}s
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Observations */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observações do Simulado</Label>
            <Textarea
              id="observations"
              placeholder="Registre observações, não-conformidades ou pontos de melhoria..."
              value={observations}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Summary */}
          {allCompleted && (
            <Card className="border-green-500 bg-green-50 dark:bg-green-950/30">
              <CardContent className="p-4 flex items-center gap-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
                <div>
                  <p className="font-bold text-green-700 dark:text-green-400">
                    Simulado Concluído com Sucesso!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tempo total: {formatTime(elapsedTime)} | Todas as {steps.length} etapas completadas
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => handleonOpenChange}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveReport}
            disabled={!drillStarted}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Relatório
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
