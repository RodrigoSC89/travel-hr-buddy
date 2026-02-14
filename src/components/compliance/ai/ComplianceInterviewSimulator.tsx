/**
 * ComplianceInterviewSimulator - AI Auditor Interview Trainer
 * Simulates real auditor questions to prepare crew for ISM/ISPS/PSC inspections
 * Evaluates responses and provides coaching feedback
 */
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Users, Brain, MessageSquare, Loader2, CheckCircle, XCircle,
  AlertTriangle, Mic, MicOff, Target, Award, RotateCcw,
  ChevronRight, Sparkles, BookOpen, Shield, Volume2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { logger } from "@/lib/logger";

interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  expected_topics: string[];
  regulation_ref: string;
}

interface ResponseEvaluation {
  score: number;
  feedback: string;
  covered_topics: string[];
  missed_topics: string[];
  improvement_tips: string[];
  model_answer: string;
}

interface SimulationSession {
  role: string;
  standard: string;
  questions: InterviewQuestion[];
  currentIndex: number;
  answers: Map<string, { response: string; evaluation: ResponseEvaluation }>;
  overallScore: number;
}

interface ComplianceInterviewSimulatorProps {
  moduleId: string;
  moduleName: string;
  standardContext: string;
}

const CREW_ROLES = [
  { value: "master", label: "Comandante / Master" },
  { value: "chief_officer", label: "Imediato / Chief Officer" },
  { value: "chief_engineer", label: "Chefe de Máquinas / Chief Engineer" },
  { value: "safety_officer", label: "Oficial de Segurança / Safety Officer" },
  { value: "sso", label: "Ship Security Officer (SSO)" },
  { value: "dpa", label: "Designated Person Ashore (DPA)" },
  { value: "bosun", label: "Contramestre / Bosun" },
  { value: "deck_officer", label: "Oficial de Náutica" },
  { value: "engineer", label: "Oficial de Máquinas" },
  { value: "rating", label: "Marinheiro / Rating" },
];

const INSPECTION_TYPES = [
  { value: "psc", label: "Port State Control (PSC)" },
  { value: "ism_external", label: "Auditoria Externa ISM" },
  { value: "ism_internal", label: "Auditoria Interna ISM" },
  { value: "isps", label: "Verificação ISPS" },
  { value: "sire", label: "Inspeção SIRE/OCIMF" },
  { value: "cdi", label: "Inspeção CDI" },
  { value: "class", label: "Vistoria de Classe" },
  { value: "flag_state", label: "Inspeção Flag State" },
];

export function ComplianceInterviewSimulator({
  moduleId,
  moduleName,
  standardContext,
}: ComplianceInterviewSimulatorProps) {
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedInspection, setSelectedInspection] = useState("");
  const [questionCount, setQuestionCount] = useState("5");
  const [session, setSession] = useState<SimulationSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Setup speech recognition
  useEffect(() => {
    const w = window as any;
    const SpeechRecognitionAPI = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "pt-BR";
      recognitionRef.current.onresult = (event: any) => {
        let finalText = "";
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript + " ";
          }
        }
        if (finalText) setCurrentAnswer(prev => prev + finalText);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.currentIndex]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Reconhecimento de voz não disponível");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Generate interview questions
  const startSimulation = useCallback(async () => {
    if (!selectedRole || !selectedInspection) {
      toast.error("Selecione a função e o tipo de inspeção");
      return;
    }

    setIsGenerating(true);
    try {
      const roleName = CREW_ROLES.find(r => r.value === selectedRole)?.label || selectedRole;
      const inspectionName = INSPECTION_TYPES.find(t => t.value === selectedInspection)?.label || selectedInspection;

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [
            {
              role: "system",
              content: `Você é um auditor/inspetor marítimo sênior conduzindo uma ${inspectionName}. 
${standardContext}
Gere perguntas REALISTAS que um auditor faria ao ${roleName} durante a inspeção.
Varie a dificuldade. Inclua perguntas práticas, técnicas e de procedimentos.

Responda em JSON:
{
  "questions": [
    {
      "id": "Q1",
      "question": "pergunta que o auditor faria",
      "category": "categoria (ex: Safety, Emergency, Documentation, Operations, Training)",
      "difficulty": "easy|medium|hard",
      "expected_topics": ["tópico1", "tópico2"],
      "regulation_ref": "referência normativa (ex: ISM 8.1, SOLAS III/19)"
    }
  ]
}`,
            },
            {
              role: "user",
              content: `Gere ${questionCount} perguntas para ${roleName} em uma ${inspectionName}. 
Módulo: ${moduleName}. Mix de dificuldades. Perguntas devem ser específicas e técnicas, como um auditor real faria.`,
            },
          ],
        },
      });

      if (error) throw error;

      const responseText = data?.choices?.[0]?.message?.content || "";
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setSession({
          role: roleName,
          standard: inspectionName,
          questions: parsed.questions || [],
          currentIndex: 0,
          answers: new Map(),
          overallScore: 0,
        });
        toast.success("Simulação iniciada!");
      }
    } catch (err) {
      logger.error("[InterviewSimulator]", err);
      toast.error("Erro ao gerar perguntas");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedRole, selectedInspection, questionCount, moduleName, standardContext]);

  // Evaluate answer
  const submitAnswer = useCallback(async () => {
    if (!session || !currentAnswer.trim()) return;

    setIsEvaluating(true);
    const question = session.questions[session.currentIndex];

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [
            {
              role: "system",
              content: `Você é um avaliador de respostas de auditoria marítima. Avalie a resposta do tripulante.

Responda em JSON:
{
  "score": 0-100,
  "feedback": "feedback detalhado sobre a resposta",
  "covered_topics": ["tópicos que o tripulante cobriu"],
  "missed_topics": ["tópicos que faltaram na resposta"],
  "improvement_tips": ["dica de melhoria 1", "dica 2"],
  "model_answer": "resposta modelo ideal que o auditor esperaria"
}`,
            },
            {
              role: "user",
              content: `Pergunta do auditor: "${question.question}"
Função: ${session.role}
Referência normativa: ${question.regulation_ref}
Tópicos esperados: ${question.expected_topics.join(", ")}

Resposta do tripulante: "${currentAnswer}"

Avalie a qualidade e completude da resposta.`,
            },
          ],
        },
      });

      if (error) throw error;

      const responseText = data?.choices?.[0]?.message?.content || "";
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      let evaluation: ResponseEvaluation = {
        score: 50, feedback: responseText, covered_topics: [],
        missed_topics: [], improvement_tips: [], model_answer: "",
      };

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        evaluation = {
          score: parsed.score || 50,
          feedback: parsed.feedback || "",
          covered_topics: parsed.covered_topics || [],
          missed_topics: parsed.missed_topics || [],
          improvement_tips: parsed.improvement_tips || [],
          model_answer: parsed.model_answer || "",
        };
      }

      const newAnswers = new Map(session.answers);
      newAnswers.set(question.id, { response: currentAnswer, evaluation });

      // Calculate overall score
      const scores = Array.from(newAnswers.values()).map(a => a.evaluation.score);
      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

      setSession({
        ...session,
        answers: newAnswers,
        overallScore: avgScore,
      });
      setCurrentAnswer("");
    } catch (err) {
      logger.error("[InterviewSimulator:evaluate]", err);
      toast.error("Erro ao avaliar resposta");
    } finally {
      setIsEvaluating(false);
    }
  }, [session, currentAnswer]);

  const nextQuestion = () => {
    if (session && session.currentIndex < session.questions.length - 1) {
      setSession({ ...session, currentIndex: session.currentIndex + 1 });
      setCurrentAnswer("");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy": return "bg-success/20 text-success";
      case "medium": return "bg-warning/20 text-warning";
      case "hard": return "bg-destructive/20 text-destructive";
      default: return "bg-muted";
    }
  };

  // Active Session View
  if (session) {
    const currentQ = session.questions[session.currentIndex];
    const currentEval = session.answers.get(currentQ?.id);
    const isLastQuestion = session.currentIndex === session.questions.length - 1;
    const allAnswered = session.answers.size === session.questions.length;

    return (
      <div className="space-y-6">
        {/* Session Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Simulação em Andamento</h3>
              <p className="text-sm text-muted-foreground">{session.role} • {session.standard}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">
              Pergunta {session.currentIndex + 1}/{session.questions.length}
            </Badge>
            {session.overallScore > 0 && (
              <Badge className={`${getScoreColor(session.overallScore)} bg-transparent border`}>
                <Award className="h-3 w-3 mr-1" /> Score: {session.overallScore}%
              </Badge>
            )}
            <Button size="sm" variant="outline" onClick={() => setSession(null)} className="gap-1">
              <RotateCcw className="h-3 w-3" /> Nova Simulação
            </Button>
          </div>
        </div>

        {/* Progress */}
        <Progress value={((session.currentIndex + 1) / session.questions.length) * 100} className="h-2" />

        {/* Question */}
        {currentQ && (
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Pergunta do Auditor
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(currentQ.difficulty)}>
                    {currentQ.difficulty === "easy" ? "Fácil" : currentQ.difficulty === "medium" ? "Média" : "Difícil"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{currentQ.regulation_ref}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border">
                <p className="text-base font-medium italic">"{currentQ.question}"</p>
                <p className="text-xs text-muted-foreground mt-2">Categoria: {currentQ.category}</p>
              </div>

              {/* Answer Input */}
              {!currentEval && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Sua Resposta:</p>
                      <Button size="sm" variant={isListening ? "destructive" : "outline"} onClick={toggleListening} className="gap-1">
                        {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                        {isListening ? "Parar" : "Voz"}
                      </Button>
                    </div>
                    <Textarea
                      value={currentAnswer}
                      onChange={e => setCurrentAnswer(e.target.value)}
                      placeholder="Responda como responderia ao auditor..."
                      rows={5}
                    />
                  </div>
                  <Button
                    onClick={submitAnswer}
                    disabled={isEvaluating || !currentAnswer.trim()}
                    className="w-full gap-2"
                  >
                    {isEvaluating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    {isEvaluating ? "Avaliando..." : "Enviar Resposta"}
                  </Button>
                </>
              )}

              {/* Evaluation Result */}
              {currentEval && (
                <div className="space-y-4">
                  {/* Score */}
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-xs text-muted-foreground">Sua Nota</p>
                      <p className={`text-3xl font-bold ${getScoreColor(currentEval.evaluation.score)}`}>
                        {currentEval.evaluation.score}/100
                      </p>
                    </div>
                    <Progress value={currentEval.evaluation.score} className="flex-1 h-3" />
                  </div>

                  {/* Feedback */}
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-sm font-medium flex items-center gap-1 mb-1">
                      <Brain className="h-4 w-4 text-primary" /> Feedback do Avaliador:
                    </p>
                    <p className="text-sm">{currentEval.evaluation.feedback}</p>
                  </div>

                  {/* Topics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-medium text-success mb-1.5 flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Tópicos Cobertos:
                      </p>
                      {currentEval.evaluation.covered_topics.map((t, i) => (
                        <p key={i} className="text-sm text-muted-foreground flex items-center gap-1 ml-1">
                          <ChevronRight className="h-3 w-3" /> {t}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-destructive mb-1.5 flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" /> Tópicos que Faltaram:
                      </p>
                      {currentEval.evaluation.missed_topics.map((t, i) => (
                        <p key={i} className="text-sm text-muted-foreground flex items-center gap-1 ml-1">
                          <ChevronRight className="h-3 w-3" /> {t}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Model Answer */}
                  {currentEval.evaluation.model_answer && (
                    <div className="p-3 rounded-lg bg-success/5 border border-success/10">
                      <p className="text-sm font-medium flex items-center gap-1 mb-1">
                        <BookOpen className="h-3.5 w-3.5 text-success" /> Resposta Modelo:
                      </p>
                      <p className="text-sm">{currentEval.evaluation.model_answer}</p>
                    </div>
                  )}

                  {/* Tips */}
                  {currentEval.evaluation.improvement_tips.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1.5 flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-warning" /> Dicas de Melhoria:
                      </p>
                      {currentEval.evaluation.improvement_tips.map((tip, i) => (
                        <p key={i} className="text-sm text-muted-foreground flex items-center gap-1 ml-1 mb-1">
                          <Target className="h-3 w-3 text-warning" /> {tip}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Next */}
                  {!isLastQuestion ? (
                    <Button onClick={nextQuestion} className="w-full gap-2">
                      Próxima Pergunta <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Card className="bg-gradient-to-r from-primary/10 to-success/10 border-primary/20">
                      <CardContent className="py-6 text-center">
                        <Award className="h-12 w-12 mx-auto mb-3 text-primary" />
                        <p className="text-lg font-bold">Simulação Concluída!</p>
                        <p className={`text-3xl font-bold mt-2 ${getScoreColor(session.overallScore)}`}>
                          Score Final: {session.overallScore}%
                        </p>
                        <Button onClick={() => setSession(null)} className="mt-4 gap-2">
                          <RotateCcw className="h-4 w-4" /> Nova Simulação
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        <div ref={scrollRef} />
      </div>
    );
  }

  // Setup View
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Simulador de Entrevista de Auditoria
            <Badge className="bg-primary/20 text-primary text-xs">Treinamento IA</Badge>
          </h3>
          <p className="text-sm text-muted-foreground">
            Prepare a tripulação para perguntas reais de auditores PSC, ISM, ISPS e SIRE
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configurar Simulação</CardTitle>
          <CardDescription>
            A IA gerará perguntas realistas baseadas na função selecionada e tipo de inspeção
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Função a Bordo *</p>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {CREW_ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Tipo de Inspeção *</p>
              <Select value={selectedInspection} onValueChange={setSelectedInspection}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {INSPECTION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Nº de Perguntas</p>
              <Select value={questionCount} onValueChange={setQuestionCount}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 perguntas</SelectItem>
                  <SelectItem value="5">5 perguntas</SelectItem>
                  <SelectItem value="10">10 perguntas</SelectItem>
                  <SelectItem value="15">15 perguntas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={startSimulation}
            disabled={isGenerating || !selectedRole || !selectedInspection}
            className="w-full gap-2"
            size="lg"
          >
            {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Brain className="h-5 w-5" />}
            {isGenerating ? "Preparando Simulação..." : "Iniciar Simulação de Entrevista"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default ComplianceInterviewSimulator;
