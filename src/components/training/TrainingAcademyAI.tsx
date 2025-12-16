/**
 * Training Academy AI - Diferencial vs OLP/Seagull/Videotel
 * - Trilhas adaptativas personalizadas
 * - Tutor IA 24/7
 * - Geração de conteúdo automática
 * - Simulador de cenários
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNautilusAI } from "@/hooks/useNautilusAI";
import { AIModuleEnhancer } from "@/components/ai/AIModuleEnhancer";
import {
  Brain,
  GraduationCap,
  BookOpen,
  Award,
  Target,
  Zap,
  Play,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Sparkles,
  MessageSquare,
  Lightbulb,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface LearningPath {
  id: string;
  title: string;
  description: string;
  modules: number;
  completedModules: number;
  estimatedHours: number;
  priority: "high" | "medium" | "low";
  certifications: string[];
  aiGenerated: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number;
  skills: string[];
}

export function TrainingAcademyAI() {
  const { generate, analyze, suggest, chat, isLoading } = useNautilusAI();
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([
    {
      id: "lp-001",
      title: "Certificação DPO Nível II",
      description: "Trilha completa para certificação de Operador de Posicionamento Dinâmico",
      modules: 12,
      completedModules: 5,
      estimatedHours: 40,
      priority: "high",
      certifications: ["DP Advanced", "STCW"],
      aiGenerated: false
    },
    {
      id: "lp-002",
      title: "SOLAS Safety Training",
      description: "Treinamentos obrigatórios de segurança conforme SOLAS",
      modules: 8,
      completedModules: 8,
      estimatedHours: 24,
      priority: "medium",
      certifications: ["STCW", "BST"],
      aiGenerated: false
    }
  ]);
  const [generatedQuiz, setGeneratedQuiz] = useState<QuizQuestion[]>([]);
  const [tutorResponse, setTutorResponse] = useState<string>("");
  const [tutorQuestion, setTutorQuestion] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const scenarios: SimulationScenario[] = [
    { id: "sim-001", title: "Blackout Recovery DP", description: "Simule a recuperação de um blackout durante operação DP", difficulty: "advanced", duration: 30, skills: ["DP", "Emergency Response"] },
    { id: "sim-002", title: "Anchor Handling Emergency", description: "Gerenciamento de emergência durante operação de ancoragem", difficulty: "intermediate", duration: 20, skills: ["AHTS", "Safety"] },
    { id: "sim-003", title: "Bridge Resource Management", description: "Cenário de BRM com múltiplas situações de decisão", difficulty: "beginner", duration: 15, skills: ["BRM", "Communication"] },
  ];

  const generatePersonalizedPath = async () => {
    try {
      const result = await generate("training", `
        Crie uma trilha de treinamento personalizada para um 2º Oficial que precisa:
        1. Renovar certificação STCW
        2. Obter certificação DP Basic
        3. Melhorar competências em ECDIS
        
        Considere: sequência lógica, pré-requisitos, carga horária realista.
      `);

      const newPath: LearningPath = {
        id: `lp-${Date.now()}`,
        title: "Trilha Personalizada - 2º Oficial",
        description: result?.response?.substring(0, 100) || "Trilha gerada por IA baseada em gaps de competência",
        modules: 10,
        completedModules: 0,
        estimatedHours: 35,
        priority: "high",
        certifications: ["STCW", "DP Basic", "ECDIS"],
        aiGenerated: true
      };

      setLearningPaths(prev => [...prev, newPath]);
      toast.success("Trilha personalizada criada!", {
        description: "IA analisou gaps e criou trilha otimizada"
      });
    } catch (error) {
      toast.error("Erro ao gerar trilha");
    }
  };

  const generateQuiz = async (topic: string) => {
    try {
      const result = await generate("training", `
        Gere 3 questões de múltipla escolha sobre: ${topic}
        
        Para cada questão inclua:
        - Pergunta clara e objetiva
        - 4 opções de resposta
        - Indicação da resposta correta
        - Explicação do porquê está correta
        
        Nível: intermediário a avançado
        Contexto: marítimo/offshore
      `);

      // Simulated quiz generation
      const quiz: QuizQuestion[] = [
        {
          id: "q1",
          question: `Durante uma operação DP, qual é o procedimento correto quando o status ASOG muda de Verde para Amarelo?`,
          options: [
            "Continuar operação normalmente",
            "Reduzir operações e aumentar monitoramento",
            "Parar operação imediatamente",
            "Notificar apenas o DPO"
          ],
          correctAnswer: 1,
          explanation: "No status Amarelo (degradado), deve-se reduzir operações e aumentar o monitoramento, preparando-se para possível evacuação."
        },
        {
          id: "q2",
          question: "Qual a frequência mínima de testes de blackout conforme PEO-DP?",
          options: [
            "Mensalmente",
            "Trimestralmente",
            "Semestralmente",
            "Anualmente"
          ],
          correctAnswer: 2,
          explanation: "Conforme PEO-DP seção 3.5, exercícios de blackout devem ser realizados semestralmente."
        },
        {
          id: "q3",
          question: "O que significa WCF no contexto de operações DP?",
          options: [
            "Weather Condition Factor",
            "Worst Case Failure",
            "Water Current Flow",
            "Watch Captain Function"
          ],
          correctAnswer: 1,
          explanation: "WCF (Worst Case Failure) é a falha mais crítica que pode ocorrer e que o sistema deve suportar mantendo posição."
        }
      ];

      setGeneratedQuiz(quiz);
      toast.success("Quiz gerado pela IA!");
    } catch (error) {
      toast.error("Erro ao gerar quiz");
    }
  };

  const askTutor = async () => {
    if (!tutorQuestion.trim()) return;

    try {
      const result = await chat("training", tutorQuestion);
      setTutorResponse(result?.response || "Desculpe, não consegui processar sua pergunta.");
      setTutorQuestion("");
    } catch (error) {
      toast.error("Erro ao consultar tutor");
    }
  };

  const checkAnswer = (questionId: string, answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const question = generatedQuiz.find(q => q.id === questionId);
    if (question) {
      if (answerIndex === question.correctAnswer) {
        toast.success("Resposta correta! 🎉");
      } else {
        toast.error("Resposta incorreta", {
          description: question.explanation
        });
      }
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "beginner": return "bg-green-500";
      case "intermediate": return "bg-yellow-500";
      case "advanced": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl">
            <GraduationCap className="h-6 w-6 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Academia Nautilus
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500">
                <Sparkles className="h-3 w-3 mr-1" />
                IA Adaptativa
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Trilhas personalizadas • Tutor IA 24/7 • Simulador de cenários
            </p>
          </div>
        </div>
        <Button onClick={generatePersonalizedPath} disabled={isLoading}>
          <Zap className="h-4 w-4 mr-2" />
          Gerar Trilha IA
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{learningPaths.length}</p>
                <p className="text-xs text-muted-foreground">Trilhas Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {learningPaths.reduce((acc, lp) => acc + lp.completedModules, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Módulos Completos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {learningPaths.reduce((acc, lp) => acc + lp.certifications.length, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Certificações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {learningPaths.reduce((acc, lp) => acc + lp.estimatedHours, 0)}h
                </p>
                <p className="text-xs text-muted-foreground">Total de Horas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="paths" className="space-y-4">
        <TabsList>
          <TabsTrigger value="paths">
            <Target className="h-4 w-4 mr-2" />
            Trilhas de Aprendizado
          </TabsTrigger>
          <TabsTrigger value="quiz">
            <FileText className="h-4 w-4 mr-2" />
            Quiz IA
          </TabsTrigger>
          <TabsTrigger value="simulator">
            <Play className="h-4 w-4 mr-2" />
            Simulador
          </TabsTrigger>
          <TabsTrigger value="tutor">
            <Brain className="h-4 w-4 mr-2" />
            Tutor IA 24/7
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paths">
          <div className="space-y-4">
            {learningPaths.map((path) => (
              <Card key={path.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{path.title}</h3>
                        {path.aiGenerated && (
                          <Badge variant="outline" className="bg-purple-500/10 text-purple-500">
                            <Brain className="h-3 w-3 mr-1" />
                            IA
                          </Badge>
                        )}
                        <Badge variant={path.priority === "high" ? "destructive" : path.priority === "medium" ? "secondary" : "outline"}>
                          {path.priority === "high" ? "Alta" : path.priority === "medium" ? "Média" : "Baixa"} prioridade
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{path.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        {path.certifications.map(cert => (
                          <Badge key={cert} variant="secondary" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{path.completedModules}/{path.modules} módulos</span>
                        <span>{path.estimatedHours}h estimadas</span>
                      </div>
                      <Progress
                        value={(path.completedModules / path.modules) * 100}
                        className="h-2"
                      />
                    </div>
                    <Button>
                      <Play className="h-4 w-4 mr-2" />
                      Continuar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quiz">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                Avaliações Geradas por IA
                <Badge className="bg-purple-500">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Adaptativo
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => generateQuiz("Operações DP e ASOG")}>
                    Gerar Quiz: DP/ASOG
                  </Button>
                  <Button variant="outline" onClick={() => generateQuiz("Segurança SOLAS")}>
                    Gerar Quiz: SOLAS
                  </Button>
                  <Button variant="outline" onClick={() => generateQuiz("Navegação ECDIS")}>
                    Gerar Quiz: ECDIS
                  </Button>
                </div>
              </div>

              {generatedQuiz.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Clique em um tema para gerar um quiz personalizado</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-6">
                    {generatedQuiz.map((q, idx) => (
                      <div key={q.id} className="p-4 border rounded-lg">
                        <p className="font-medium mb-4">{idx + 1}. {q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => (
                            <Button
                              key={optIdx}
                              variant={selectedAnswer === optIdx ? (optIdx === q.correctAnswer ? "default" : "destructive") : "outline"}
                              className="w-full justify-start"
                              onClick={() => checkAnswer(q.id, optIdx)}
                            >
                              {String.fromCharCode(65 + optIdx)}. {opt}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulator">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Simulador de Cenários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scenarios.map((scenario) => (
                  <Card key={scenario.id} className="hover:border-primary transition-colors cursor-pointer">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={getDifficultyColor(scenario.difficulty)}>
                          {scenario.difficulty}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {scenario.duration} min
                        </span>
                      </div>
                      <h4 className="font-medium mb-2">{scenario.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                      <div className="flex gap-1 flex-wrap mb-3">
                        {scenario.skills.map(skill => (
                          <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                      <Button className="w-full" size="sm">
                        <Play className="h-3 w-3 mr-1" />
                        Iniciar Simulação
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutor">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                Tutor IA 24/7
                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                  Online
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  value={tutorQuestion}
                  onChange={(e) => setTutorQuestion(e.target.value)}
                  placeholder="Faça qualquer pergunta sobre navegação, DP, segurança, procedimentos..."
                  className="flex-1"
                  rows={3}
                />
                <Button onClick={askTutor} disabled={isLoading}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>

              {tutorResponse && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-600">Tutor IA</span>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {tutorResponse}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">Perguntas sugeridas:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "O que é FMEA em operações DP?",
                    "Como funciona o ASOG?",
                    "Requisitos STCW para DPO",
                    "Procedimento de blackout recovery"
                  ].map((q) => (
                    <Button
                      key={q}
                      variant="outline"
                      size="sm"
                      onClick={() => setTutorQuestion(q)}
                    >
                      <Lightbulb className="h-3 w-3 mr-1" />
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TrainingAcademyAI;
