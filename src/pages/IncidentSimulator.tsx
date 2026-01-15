/**
 * Incident Simulator - Interactive Training with AI
 * Operational incident scenarios with AI-generated timelines and feedback
 */

import React, { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Play,
  RefreshCw,
  Trophy,
  Clock,
  Users,
  FileText,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Brain,
  Flame,
  Droplets,
  Shield,
  Wrench,
  Ship,
  Target,
  Sparkles,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Scenario {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  duration: string;
  category: "safety" | "compliance" | "technical" | "environmental";
}

interface TimelineEvent {
  id: string;
  time: string;
  description: string;
  actor: string;
  type: "info" | "action" | "decision" | "consequence";
}

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string; isCorrect: boolean; feedback: string }[];
  context: string;
}

interface SimulationState {
  phase: "selection" | "briefing" | "simulation" | "decision" | "feedback" | "results";
  scenario: Scenario | null;
  timeline: TimelineEvent[];
  questions: Question[];
  currentQuestionIndex: number;
  answers: { questionId: string; answerId: string; correct: boolean }[];
  score: number;
  startTime: Date | null;
  endTime: Date | null;
}

const SCENARIOS: Scenario[] = [
  {
    id: "oil_spill",
    name: "Vazamento de Óleo",
    icon: <Droplets className="h-6 w-6 text-warning" />,
    description: "Vazamento de óleo combustível detectado no compartimento de máquinas durante navegação.",
    difficulty: "hard",
    duration: "15-20 min",
    category: "environmental"
  },
  {
    id: "compliance_breach",
    name: "Incidente de Compliance",
    icon: <Shield className="h-6 w-6 text-destructive" />,
    description: "Documentação de tripulante vencida detectada durante inspeção de bandeira.",
    difficulty: "medium",
    duration: "10-15 min",
    category: "compliance"
  },
  {
    id: "engine_failure",
    name: "Falha Técnica",
    icon: <Wrench className="h-6 w-6 text-info" />,
    description: "Falha no motor principal durante manobra de aproximação ao porto.",
    difficulty: "hard",
    duration: "15-20 min",
    category: "technical"
  },
  {
    id: "fire_drill",
    name: "Incêndio a Bordo",
    icon: <Flame className="h-6 w-6 text-destructive" />,
    description: "Alarme de incêndio acionado na praça de máquinas durante operação noturna.",
    difficulty: "hard",
    duration: "20-25 min",
    category: "safety"
  },
  {
    id: "man_overboard",
    name: "Homem ao Mar",
    icon: <Users className="h-6 w-6 text-destructive" />,
    description: "Tripulante cai no mar durante operação de convés em mar agitado.",
    difficulty: "hard",
    duration: "15-20 min",
    category: "safety"
  },
  {
    id: "cargo_damage",
    name: "Avaria de Carga",
    icon: <Ship className="h-6 w-6 text-warning" />,
    description: "Detecção de danos em containers durante travessia com mau tempo.",
    difficulty: "medium",
    duration: "10-15 min",
    category: "technical"
  }
];

const generateTimeline = (scenarioId: string): TimelineEvent[] => {
  const timelines: Record<string, TimelineEvent[]> = {
    oil_spill: [
      { id: "1", time: "08:00", description: "Sensor detecta vazamento no compartimento de máquinas", actor: "Sistema Automático", type: "info" },
      { id: "2", time: "08:02", description: "Alarme de vazamento acionado na ponte", actor: "Sistema de Alarmes", type: "action" },
      { id: "3", time: "08:05", description: "Oficial de máquinas confirma vazamento de 50L de óleo", actor: "Chief Engineer", type: "info" },
      { id: "4", time: "08:08", description: "Capitão notificado e assume comando da emergência", actor: "Master", type: "action" },
      { id: "5", time: "08:15", description: "Equipe de contenção acionada", actor: "Damage Control Team", type: "action" }
    ],
    compliance_breach: [
      { id: "1", time: "09:00", description: "Inspetor de bandeira solicita documentação da tripulação", actor: "Flag State Inspector", type: "info" },
      { id: "2", time: "09:15", description: "Certificado STCW de marinheiro identificado como vencido há 15 dias", actor: "Inspector", type: "info" },
      { id: "3", time: "09:20", description: "Oficial de segurança convocado para esclarecimentos", actor: "Safety Officer", type: "action" },
      { id: "4", time: "09:30", description: "Inspetor registra não-conformidade no relatório", actor: "Inspector", type: "consequence" }
    ],
    engine_failure: [
      { id: "1", time: "14:00", description: "Motor principal apresenta vibração anormal", actor: "Engine Monitoring", type: "info" },
      { id: "2", time: "14:05", description: "Alarme de sobreaquecimento ativo", actor: "Sistema de Alarmes", type: "action" },
      { id: "3", time: "14:08", description: "Motor desliga automaticamente por proteção", actor: "Sistema Automático", type: "consequence" },
      { id: "4", time: "14:10", description: "Navio perde propulsão a 2 milhas do porto", actor: "Bridge Team", type: "info" },
      { id: "5", time: "14:12", description: "Capitão declara situação de emergência", actor: "Master", type: "action" }
    ],
    fire_drill: [
      { id: "1", time: "02:00", description: "Detector de fumaça acionado na praça de máquinas", actor: "Fire Detection System", type: "info" },
      { id: "2", time: "02:01", description: "Alarme geral de incêndio ativado", actor: "Sistema de Alarmes", type: "action" },
      { id: "3", time: "02:03", description: "Equipe de emergência se reúne no ponto de encontro", actor: "Emergency Team", type: "action" },
      { id: "4", time: "02:05", description: "Confirmação visual de fogo no painel elétrico", actor: "Chief Engineer", type: "info" }
    ],
    man_overboard: [
      { id: "1", time: "16:30", description: "Grito de 'Homem ao mar!' ouvido no convés", actor: "Deck Crew", type: "info" },
      { id: "2", time: "16:30", description: "Boia salva-vidas lançada imediatamente", actor: "Bosun", type: "action" },
      { id: "3", time: "16:31", description: "Alarme MOB acionado na ponte", actor: "OOW", type: "action" },
      { id: "4", time: "16:32", description: "Manobra de Williamson iniciada", actor: "Master", type: "action" }
    ],
    cargo_damage: [
      { id: "1", time: "10:00", description: "Balanço severo do navio em tempestade", actor: "Weather Conditions", type: "info" },
      { id: "2", time: "10:15", description: "Som de impacto reportado pelo vigia", actor: "Deck Watch", type: "info" },
      { id: "3", time: "10:20", description: "Container deslocado identificado na inspeção", actor: "Chief Officer", type: "info" },
      { id: "4", time: "10:25", description: "Danos estruturais em 3 containers confirmados", actor: "Surveyor", type: "consequence" }
    ]
  };

  return timelines[scenarioId] || [];
};

const generateQuestions = (scenarioId: string): Question[] => {
  const questions: Record<string, Question[]> = {
    oil_spill: [
      {
        id: "q1",
        text: "Qual é a primeira ação que você deve tomar ao confirmar o vazamento?",
        context: "O vazamento foi confirmado como 50L de óleo combustível.",
        options: [
          { id: "a", text: "Isolar a fonte do vazamento e parar a transferência", isCorrect: true, feedback: "Correto! Isolar a fonte é prioridade para evitar agravamento." },
          { id: "b", text: "Notificar as autoridades portuárias imediatamente", isCorrect: false, feedback: "A notificação é importante, mas primeiro deve-se conter o vazamento." },
          { id: "c", text: "Iniciar limpeza do óleo derramado", isCorrect: false, feedback: "A limpeza vem depois de conter a fonte do vazamento." },
          { id: "d", text: "Documentar o incidente com fotos", isCorrect: false, feedback: "Documentação é importante, mas não é a primeira prioridade." }
        ]
      },
      {
        id: "q2",
        text: "De acordo com MARPOL, quando você deve notificar as autoridades?",
        context: "O vazamento está contido, mas houve derramamento para o mar.",
        options: [
          { id: "a", text: "Apenas se o vazamento exceder 100L", isCorrect: false, feedback: "Qualquer descarga de óleo ao mar deve ser reportada." },
          { id: "b", text: "Imediatamente após confirmar descarga ao mar", isCorrect: true, feedback: "Correto! MARPOL exige notificação imediata de qualquer descarga de óleo ao mar." },
          { id: "c", text: "Dentro de 24 horas do incidente", isCorrect: false, feedback: "A notificação deve ser imediata, não há período de espera." },
          { id: "d", text: "Apenas quando chegar ao próximo porto", isCorrect: false, feedback: "A notificação deve ser imediata, não pode esperar." }
        ]
      }
    ],
    compliance_breach: [
      {
        id: "q1",
        text: "Como você deve responder ao inspetor sobre a documentação vencida?",
        context: "O certificado STCW do marinheiro está vencido há 15 dias.",
        options: [
          { id: "a", text: "Alegar desconhecimento e culpar o tripulante", isCorrect: false, feedback: "A responsabilidade é do armador/operador, não apenas do tripulante." },
          { id: "b", text: "Reconhecer a falha, apresentar plano de ação imediato", isCorrect: true, feedback: "Correto! Transparência e ação corretiva demonstram compromisso com compliance." },
          { id: "c", text: "Solicitar extensão de prazo para regularização", isCorrect: false, feedback: "Extensões podem ser solicitadas, mas a falha precisa ser reconhecida primeiro." },
          { id: "d", text: "Questionar a autoridade do inspetor", isCorrect: false, feedback: "Isso pode agravar a situação e gerar sanções adicionais." }
        ]
      }
    ],
    engine_failure: [
      {
        id: "q1",
        text: "Com o motor parado a 2 milhas do porto, qual é sua prioridade?",
        context: "O navio perdeu propulsão e está derivando em área de tráfego intenso.",
        options: [
          { id: "a", text: "Tentar reiniciar o motor imediatamente", isCorrect: false, feedback: "Reiniciar sem diagnóstico pode causar danos maiores." },
          { id: "b", text: "Largar âncora e estabelecer comunicação com VTS", isCorrect: true, feedback: "Correto! Assegurar posição e coordenar com tráfego são prioridades." },
          { id: "c", text: "Aguardar rebocador chegar", isCorrect: false, feedback: "Aguardar passivamente sem ações de segurança é inadequado." },
          { id: "d", text: "Evacuar tripulação não essencial", isCorrect: false, feedback: "A situação não requer evacuação neste momento." }
        ]
      }
    ],
    fire_drill: [
      {
        id: "q1",
        text: "Qual sistema de extinção deve ser considerado para fogo elétrico na praça de máquinas?",
        context: "Fogo confirmado em painel elétrico na praça de máquinas.",
        options: [
          { id: "a", text: "Água sob pressão", isCorrect: false, feedback: "Água pode causar choque elétrico e propagar o fogo." },
          { id: "b", text: "CO2 fixo após evacuação", isCorrect: true, feedback: "Correto! CO2 é eficaz para fogos elétricos, mas requer evacuação prévia." },
          { id: "c", text: "Espuma de baixa expansão", isCorrect: false, feedback: "Espuma não é ideal para fogos elétricos." },
          { id: "d", text: "Pó químico seco apenas", isCorrect: false, feedback: "Pó químico pode danificar equipamentos e não é a primeira escolha." }
        ]
      }
    ],
    man_overboard: [
      {
        id: "q1",
        text: "Qual manobra deve ser executada imediatamente após o alarme MOB?",
        context: "Tripulante caiu ao mar pelo boreste em mar agitado.",
        options: [
          { id: "a", text: "Parar máquinas imediatamente", isCorrect: false, feedback: "Parar pode afastar o navio da vítima." },
          { id: "b", text: "Girar o leme a boreste para afastar a popa da vítima", isCorrect: true, feedback: "Correto! Afastar a popa evita que hélices atinjam a vítima." },
          { id: "c", text: "Lançar bote de resgate imediatamente", isCorrect: false, feedback: "Primeiro deve-se manobrar o navio, depois lançar bote." },
          { id: "d", text: "Chamar guarda costeira", isCorrect: false, feedback: "A comunicação é importante, mas a manobra imediata tem prioridade." }
        ]
      }
    ],
    cargo_damage: [
      {
        id: "q1",
        text: "Qual é o primeiro passo após confirmar danos nos containers?",
        context: "3 containers com danos estruturais identificados.",
        options: [
          { id: "a", text: "Continuar viagem e reportar no destino", isCorrect: false, feedback: "Danos podem se agravar e causar perdas maiores." },
          { id: "b", text: "Documentar danos e notificar armador/P&I Club", isCorrect: true, feedback: "Correto! Documentação imediata protege interesses e permite ação rápida." },
          { id: "c", text: "Tentar reparar os containers com recursos de bordo", isCorrect: false, feedback: "Reparos inadequados podem piorar a situação." },
          { id: "d", text: "Descartar a carga danificada ao mar", isCorrect: false, feedback: "Descarte ao mar é ilegal e causa poluição." }
        ]
      }
    ]
  };

  return questions[scenarioId] || [];
};

export default function IncidentSimulator() {
  const navigate = useNavigate();
  const [state, setState] = useState<SimulationState>({
    phase: "selection",
    scenario: null,
    timeline: [],
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    score: 0,
    startTime: null,
    endTime: null
  });
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string>("");

  const selectScenario = (scenario: Scenario) => {
    setState(prev => ({
      ...prev,
      scenario,
      phase: "briefing",
      timeline: generateTimeline(scenario.id),
      questions: generateQuestions(scenario.id)
    }));
  };

  const startSimulation = () => {
    setState(prev => ({
      ...prev,
      phase: "simulation",
      startTime: new Date()
    }));
  };

  const proceedToDecision = () => {
    setState(prev => ({ ...prev, phase: "decision" }));
  };

  const submitAnswer = async () => {
    if (!selectedAnswer || !state.scenario) return;

    const currentQuestion = state.questions[state.currentQuestionIndex];
    const selectedOption = currentQuestion.options.find(o => o.id === selectedAnswer);
    const isCorrect = selectedOption?.isCorrect || false;

    const newAnswers = [
      ...state.answers,
      { questionId: currentQuestion.id, answerId: selectedAnswer, correct: isCorrect }
    ];

    setState(prev => ({
      ...prev,
      answers: newAnswers,
      phase: "feedback"
    }));

    setSelectedAnswer(null);
  };

  const nextQuestion = () => {
    const nextIndex = state.currentQuestionIndex + 1;
    
    if (nextIndex >= state.questions.length) {
      // Calculate final score
      const correctAnswers = state.answers.filter(a => a.correct).length;
      const score = Math.round((correctAnswers / state.questions.length) * 100);
      
      setState(prev => ({
        ...prev,
        phase: "results",
        score,
        endTime: new Date()
      }));

      // Generate AI feedback
      generateAIFeedback(score);
    } else {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        phase: "decision"
      }));
    }
  };

  const generateAIFeedback = async (score: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("nauti-intelligence", {
        body: {
          operation: "chat",
          messages: [
            {
              role: "user",
              content: `Gere um feedback detalhado para um treinamento de simulador de incidentes marítimos.
              Cenário: ${state.scenario?.name}
              Pontuação: ${score}%
              Respostas corretas: ${state.answers.filter(a => a.correct).length}/${state.questions.length}
              
              Forneça:
              1. Avaliação geral do desempenho
              2. Pontos fortes identificados
              3. Áreas para melhoria
              4. Recomendações de treinamento adicional
              5. Lições aprendidas`
            }
          ]
        }
      });

      if (data?.content) {
        setAiFeedback(data.content);
      }
    } catch (error) {
      console.error("AI feedback error:", error);
      // Fallback feedback
      setAiFeedback(score >= 70 
        ? "Excelente desempenho! Você demonstrou bom conhecimento dos procedimentos de emergência. Continue praticando para manter suas habilidades afiadas."
        : "Há oportunidades de melhoria. Recomendamos revisar os procedimentos de emergência e realizar simulados adicionais.");
    } finally {
      setLoading(false);
    }
  };

  const restartSimulation = () => {
    setState({
      phase: "selection",
      scenario: null,
      timeline: [],
      questions: [],
      currentQuestionIndex: 0,
      answers: [],
      score: 0,
      startTime: null,
      endTime: null
    });
    setAiFeedback("");
  };

  const currentQuestion = state.questions[state.currentQuestionIndex];

  return (
    <>
      <Helmet>
        <title>Simulador de Incidentes | Nautilus One</title>
        <meta name="description" content="Treinamento interativo de incidentes operacionais com IA" />
      </Helmet>

      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                Simulador de Incidentes
              </h1>
              <p className="text-muted-foreground">
                Treinamento interativo com IA • Cenários reais • Feedback detalhado
              </p>
            </div>
          </div>

          {/* Progress */}
          {state.scenario && state.phase !== "selection" && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{state.scenario.name}</span>
                <Badge variant="outline">
                  {state.phase === "briefing" ? "Briefing" :
                   state.phase === "simulation" ? "Simulação" :
                   state.phase === "decision" ? `Decisão ${state.currentQuestionIndex + 1}/${state.questions.length}` :
                   state.phase === "feedback" ? "Feedback" : "Resultados"}
                </Badge>
              </div>
              <Progress 
                value={
                  state.phase === "briefing" ? 10 :
                  state.phase === "simulation" ? 25 :
                  state.phase === "results" ? 100 :
                  25 + (state.currentQuestionIndex / state.questions.length) * 75
                } 
                className="h-2" 
              />
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Phase: Selection */}
            {state.phase === "selection" && (
              <motion.div
                key="selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Selecione um Cenário</CardTitle>
                    <CardDescription>
                      Escolha um incidente para simular. A IA gerará uma cronologia realista e você tomará decisões críticas.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SCENARIOS.map((scenario) => (
                    <Card
                      key={scenario.id}
                      className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
                      onClick={() => selectScenario(scenario)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-full bg-muted">
                            {scenario.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{scenario.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {scenario.description}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Badge variant={
                                scenario.difficulty === "easy" ? "outline" :
                                scenario.difficulty === "medium" ? "secondary" : "destructive"
                              }>
                                {scenario.difficulty === "easy" ? "Fácil" :
                                 scenario.difficulty === "medium" ? "Médio" : "Difícil"}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {scenario.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Phase: Briefing */}
            {state.phase === "briefing" && state.scenario && (
              <motion.div
                key="briefing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {state.scenario.icon}
                      <div>
                        <CardTitle>{state.scenario.name}</CardTitle>
                        <CardDescription>Briefing do Cenário</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Situação</AlertTitle>
                      <AlertDescription>{state.scenario.description}</AlertDescription>
                    </Alert>

                    <div>
                      <h4 className="font-medium mb-2">Informações do Cenário:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Categoria: <span className="capitalize">{state.scenario.category}</span></li>
                        <li>• Dificuldade: <span className="capitalize">{state.scenario.difficulty === "easy" ? "Fácil" : state.scenario.difficulty === "medium" ? "Médio" : "Difícil"}</span></li>
                        <li>• Duração estimada: {state.scenario.duration}</li>
                        <li>• Decisões a tomar: {state.questions.length}</li>
                      </ul>
                    </div>

                    <Button onClick={startSimulation} className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Simulação
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Phase: Simulation (Timeline) */}
            {state.phase === "simulation" && (
              <motion.div
                key="simulation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Cronologia do Incidente
                    </CardTitle>
                    <CardDescription>
                      Acompanhe os eventos em tempo real e prepare-se para tomar decisões
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {state.timeline.map((event, index) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.5 }}
                            className={`flex gap-4 p-3 rounded-lg ${
                              event.type === "consequence" ? "bg-destructive/10 border border-destructive/30" :
                              event.type === "action" ? "bg-primary/10 border border-primary/30" :
                              "bg-muted"
                            }`}
                          >
                            <div className="font-mono text-sm font-bold text-primary min-w-[50px]">
                              {event.time}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">{event.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                <Users className="h-3 w-3 inline mr-1" />
                                {event.actor}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>

                    <Button onClick={proceedToDecision} className="w-full mt-4">
                      Continuar para Decisões
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Phase: Decision */}
            {state.phase === "decision" && currentQuestion && (
              <motion.div
                key={`decision-${state.currentQuestionIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      Decisão {state.currentQuestionIndex + 1} de {state.questions.length}
                    </CardTitle>
                    <CardDescription>{currentQuestion.context}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-lg font-medium">{currentQuestion.text}</p>

                    <RadioGroup value={selectedAnswer || ""} onValueChange={setSelectedAnswer}>
                      {currentQuestion.options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted cursor-pointer">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id} className="cursor-pointer flex-1">
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    <Button 
                      onClick={submitAnswer} 
                      className="w-full"
                      disabled={!selectedAnswer}
                    >
                      Confirmar Resposta
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Phase: Feedback */}
            {state.phase === "feedback" && currentQuestion && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {state.answers[state.answers.length - 1]?.correct ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      {state.answers[state.answers.length - 1]?.correct ? "Correto!" : "Incorreto"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert className={state.answers[state.answers.length - 1]?.correct ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"}>
                      <AlertDescription>
                        {currentQuestion.options.find(o => o.id === state.answers[state.answers.length - 1]?.answerId)?.feedback}
                      </AlertDescription>
                    </Alert>

                    <Button onClick={nextQuestion} className="w-full">
                      {state.currentQuestionIndex + 1 >= state.questions.length ? "Ver Resultados" : "Próxima Decisão"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Phase: Results */}
            {state.phase === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="p-8 text-center">
                    <Trophy className={`h-16 w-16 mx-auto mb-4 ${
                      state.score >= 80 ? "text-warning" :
                      state.score >= 60 ? "text-info" : "text-muted-foreground"
                    }`} />
                    <h2 className="text-4xl font-bold">{state.score}%</h2>
                    <p className="text-lg text-muted-foreground mt-2">
                      {state.score >= 80 ? "Excelente!" :
                       state.score >= 60 ? "Bom trabalho!" : "Continue praticando!"}
                    </p>
                    <div className="flex justify-center gap-4 mt-4 text-sm">
                      <span className="text-success">
                        <CheckCircle2 className="h-4 w-4 inline mr-1" />
                        {state.answers.filter(a => a.correct).length} corretas
                      </span>
                      <span className="text-destructive">
                        <XCircle className="h-4 w-4 inline mr-1" />
                        {state.answers.filter(a => !a.correct).length} incorretas
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Feedback */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Feedback da IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Gerando análise...</span>
                      </div>
                    ) : (
                      <p className="text-muted-foreground whitespace-pre-wrap">{aiFeedback}</p>
                    )}
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button onClick={restartSimulation} variant="outline" className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Novo Cenário
                  </Button>
                  <Button onClick={() => navigate("/nautilus-command")} className="flex-1">
                    <Ship className="h-4 w-4 mr-2" />
                    Voltar ao Command Center
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
