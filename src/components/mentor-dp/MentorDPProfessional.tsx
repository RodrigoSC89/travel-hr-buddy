import { useCallback, useMemo, useEffect, useRef, useState } from "react";;
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Anchor, Brain, GraduationCap, Play, ClipboardList, BookOpen, HelpCircle, Award, Send, Bot, User, Loader2,
  Target, BarChart3, AlertTriangle, CheckCircle, TrendingUp, Compass, Navigation, Waves, Wind, Radar, Cpu,
  Zap, RefreshCw, Download, Star, Bookmark, Clock, ChevronRight, Sparkles, MessageSquare, FileText, History,
  Plus, Search, ThumbsUp, Eye, Trash2, Edit
} from "lucide-react";
import ReactMarkdown from "react-markdown";

// Types
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "chat" | "lesson" | "simulation" | "quiz";
}

interface AcademyModule {
  id: string;
  name: string;
  category: string;
  description: string;
  lessons: number;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  icon: React.ReactNode;
  progress?: number;
}

interface SimulationScenario {
  id: string;
  name: string;
  type: string;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "extreme";
  duration: string;
  isCustom?: boolean;
}

interface QuizItem {
  id: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  completedAt?: Date;
  score?: number;
}

interface LogEntry {
  id: string;
  type: "chat" | "lesson" | "simulation" | "quiz";
  title: string;
  summary: string;
  timestamp: Date;
  data?: unknown;
}

interface RepositoryQuestion {
  id: string;
  question: string;
  category: string;
  votes: number;
  answers: number;
  answer?: string;
}

// Default Academy Modules
const DEFAULT_ACADEMY_MODULES: AcademyModule[] = [
  { id: "dp-fundamentals", name: "Fundamentos de DP", category: "fundamentals", description: "Princípios básicos de Posicionamento Dinâmico, forças atuantes e modos de controle", lessons: 8, duration: "4h", difficulty: "beginner", icon: <Anchor className="h-5 w-5" /> },
  { id: "sensors-references", name: "Sensores e Referências", category: "sensors", description: "GNSS, DGPS, MRU, giroscópio, anemômetro, sistemas acústicos e laser", lessons: 12, duration: "6h", difficulty: "intermediate", icon: <Radar className="h-5 w-5" /> },
  { id: "thrusters-propulsion", name: "Propulsores e Propulsão", category: "thrusters", description: "Azimuth thrusters, túnel, vetorização de empuxo e eficiência energética", lessons: 10, duration: "5h", difficulty: "intermediate", icon: <Navigation className="h-5 w-5" /> },
  { id: "redundancy-safety", name: "Redundância e Segurança", category: "redundancy", description: "Classes DP, WCFDI, FMEA, CAMO/CAMS, sistemas de fallback", lessons: 14, duration: "7h", difficulty: "advanced", icon: <Cpu className="h-5 w-5" /> },
  { id: "operations-planning", name: "Planejamento Operacional", category: "operations", description: "Análise de footprint, capability plots, janelas operacionais, handover", lessons: 10, duration: "5h", difficulty: "advanced", icon: <Target className="h-5 w-5" /> },
  { id: "emergency-procedures", name: "Procedimentos de Emergência", category: "emergency", description: "Drive-off, drift-off, EDS, blackout recovery, zonas operacionais", lessons: 8, duration: "4h", difficulty: "expert", icon: <AlertTriangle className="h-5 w-5" /> },
];

// Default Simulation Scenarios
const DEFAULT_SIMULATION_SCENARIOS: SimulationScenario[] = [
  { id: "dgps-failure", name: "Falha de DGPS Principal", type: "sensor_failure", description: "DGPS principal falha durante operação de offloading com vento de 25 nós", difficulty: "medium", duration: "15 min" },
  { id: "thruster-loss", name: "Perda de Propulsor Azimuth", type: "thruster_failure", description: "Propulsor azimuth de popa falha em operação próxima a plataforma", difficulty: "hard", duration: "20 min" },
  { id: "power-blackout", name: "Blackout Parcial", type: "power_loss", description: "Perda de um barramento principal com 30% da capacidade de propulsão", difficulty: "hard", duration: "25 min" },
  { id: "weather-deterioration", name: "Deterioração do Tempo", type: "weather", description: "Aumento rápido de vento e ondas durante operação de mergulho", difficulty: "medium", duration: "20 min" },
  { id: "multi-failure", name: "Falhas Múltiplas", type: "multi_failure", description: "Sequência de falhas: gyro + thruster + comunicação UHF", difficulty: "extreme", duration: "30 min" },
];

// Default Repository Questions
const DEFAULT_REPOSITORY_QUESTIONS: RepositoryQuestion[] = [
  { id: "q1", question: "Qual a diferença entre DGPS e DGNSS?", category: "Sensores", votes: 45, answers: 3 },
  { id: "q2", question: "Como interpretar um capability plot?", category: "Operações", votes: 38, answers: 2 },
  { id: "q3", question: "O que é WCFDI e como é aplicado?", category: "Redundância", votes: 32, answers: 4 },
  { id: "q4", question: "Quais são os procedimentos de drive-off?", category: "Emergência", votes: 28, answers: 2 },
  { id: "q5", question: "Como funciona o sistema CAMO/CAMS?", category: "Redundância", votes: 25, answers: 1 },
];

// Stats Card Component
const StatCard = ({ icon, label, value, trend, color }: { icon: React.ReactNode; label: string; value: string; trend?: string; color: string; }) => (
  <Card className={`border-l-4 ${color}`}>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && <p className="text-xs text-green-500 flex items-center gap-1 mt-1"><TrendingUp className="h-3 w-3" />{trend}</p>}
        </div>
        <div className={`p-3 rounded-full bg-opacity-10 ${color.replace("border-", "bg-")}`}>{icon}</div>
      </div>
    </CardContent>
  </Card>
);

export default function MentorDPProfessional() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("mentor");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Academy state
  const [academyModules, setAcademyModules] = useState<AcademyModule[]>(DEFAULT_ACADEMY_MODULES);
  const [showNewModuleDialog, setShowNewModuleDialog] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [newModuleDescription, setNewModuleDescription] = useState("");
  const [newModuleDifficulty, setNewModuleDifficulty] = useState("intermediate");

  // Simulator state
  const [scenarios, setScenarios] = useState<SimulationScenario[]>(DEFAULT_SIMULATION_SCENARIOS);
  const [showNewScenarioDialog, setShowNewScenarioDialog] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");
  const [newScenarioDescription, setNewScenarioDescription] = useState("");
  const [newScenarioType, setNewScenarioType] = useState("sensor_failure");
  const [newScenarioDifficulty, setNewScenarioDifficulty] = useState("medium");
  const [activeSimulation, setActiveSimulation] = useState<SimulationScenario | null>(null);

  // Quiz state
  const [quizTopic, setQuizTopic] = useState("");
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizItem[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<unknown>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});

  // Logbook state
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);

  // Repository state
  const [repositoryQuestions, setRepositoryQuestions] = useState<RepositoryQuestion[]>(DEFAULT_REPOSITORY_QUESTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<RepositoryQuestion | null>(null);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [showNewQuestionDialog, setShowNewQuestionDialog] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionCategory, setNewQuestionCategory] = useState("Sensores");

  // Stats
  const [stats, setStats] = useState({
    sessionsCompleted: logEntries.filter(e => e.type === "chat").length,
    lessonsCompleted: logEntries.filter(e => e.type === "lesson").length,
    simulationsPassed: logEntries.filter(e => e.type === "simulation").length,
    avgScore: 87,
    totalHours: 36,
    proficiencyLevel: "Avançado",
  });

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update stats when log entries change
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      sessionsCompleted: logEntries.filter(e => e.type === "chat").length + 24,
      lessonsCompleted: logEntries.filter(e => e.type === "lesson").length + 42,
      simulationsPassed: logEntries.filter(e => e.type === "simulation").length + 18,
    }));
  }, [logEntries]);

  // Add log entry helper
  const addLogEntry = useCallback((type: LogEntry["type"], title: string, summary: string, data?: unknown: unknown: unknown) => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      type,
      title,
      summary,
      timestamp: new Date(),
      data,
    };
    setLogEntries(prev => [entry, ...prev]);
  }, []);

  // Call AI Edge Function with enhanced error handling
  const callMentorAI = async (action: string, params: unknown = {}): Promise<any> => {
    
    try {
      const response = await fetch("https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/dp-mentor-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE",
        },
        body: JSON.stringify({ action, ...params }),
      };

      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 429) {
          throw new Error("Limite de requisições excedido. Aguarde alguns minutos e tente novamente.");
        }
        if (response.status === 402) {
          throw new Error("Créditos de IA insuficientes. Adicione créditos ao workspace.");
        }
        throw new Error(`Erro ${response.status}: ${errorText || "Falha na comunicação com o Mentor DP"}`);
      }

      const data = await response.json();

      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error: SupabaseError | null) {
      console.error("[MentorDP] callMentorAI error:", error);
      console.error("[MentorDP] callMentorAI error:", error);
      throw error;
    }
  };

  // Send chat message
  const sendMessage = async (customMessage?: string) => {
    const messageText = customMessage || inputMessage.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: messageText, timestamp: new Date(), type: "chat" };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const data = await callMentorAI("chat", {
        messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
      };

      const assistantMessage: Message = { id: crypto.randomUUID(), role: "assistant", content: data.content, timestamp: new Date(), type: "chat" };
      setMessages(prev => [...prev, assistantMessage]);
      addLogEntry("chat", "Conversa com Mentor", messageText.substring(0, 100) + "...");
    } catch (error: SupabaseError | null) {
      toast({ title: "Erro", description: error.message || "Não foi possível obter resposta", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate lesson
  const generateLesson = async (module: AcademyModule) => {
    setIsLoading(true);
    try {
      const data = await callMentorAI("generate_lesson", { topic: module.name, difficulty: module.difficulty });
      
      const lessonMessage: Message = { id: crypto.randomUUID(), role: "assistant", content: `## 📚 Lição: ${module.name}\n\n${data.content}`, timestamp: new Date(), type: "lesson" };
      setMessages([lessonMessage]);
      setActiveTab("mentor");
      addLogEntry("lesson", `Lição: ${module.name}`, module.description);
      
      // Update module progress
      setAcademyModules(prev => prev.map(m => m.id === module.id ? { ...m, progress: Math.min((m.progress || 0) + 25, 100) } : m));
      
      toast({ title: "Lição Gerada", description: `Lição sobre "${module.name}" pronta!` });
    } catch (error: SupabaseError | null) {
      toast({ title: "Erro", description: error.message || "Não foi possível gerar a lição", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Start simulation
  const startSimulation = async (scenario: SimulationScenario) => {
    setIsLoading(true);
    setActiveSimulation(scenario);
    try {
      const data = await callMentorAI("generate_simulation", {
        scenarioType: scenario.type,
        difficulty: scenario.difficulty,
        context: { conditions: scenario.description },
      };

      const simMessage: Message = { id: crypto.randomUUID(), role: "assistant", content: `## 🎮 Simulação: ${scenario.name}\n\n${data.content}`, timestamp: new Date(), type: "simulation" };
      setMessages([simMessage]);
      setActiveTab("mentor");
      addLogEntry("simulation", `Simulação: ${scenario.name}`, scenario.description);
      
      toast({ title: "Simulação Iniciada", description: `Cenário "${scenario.name}" carregado!` });
    } catch (error: SupabaseError | null) {
      toast({ title: "Erro", description: error.message || "Não foi possível iniciar a simulação", variant: "destructive" });
      setActiveSimulation(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate quiz
  const generateQuiz = async (topic?: string) => {
    const quizTopicToUse = topic || quizTopic.trim();
    if (!quizTopicToUse) {
      toast({ title: "Tópico Necessário", description: "Informe um tópico para gerar o quiz", variant: "destructive" });
      return;
    }

    setShowQuizDialog(false);
    setIsLoading(true);
    
    try {
      const data = await callMentorAI("generate_quiz", { quizTopic: quizTopicToUse, difficulty });

      // Parse quiz content
      let quizContent = data.content;
      if (typeof quizContent === "string") {
        try {
          const jsonMatch = quizContent.match(/```json\n?([\s\S]*?)\n?```/) || quizContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            quizContent = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          }
        } catch (e) {
        }
      }

      if (quizContent?.questions && Array.isArray(quizContent.questions)) {
        setActiveQuiz({ ...quizContent, topic: quizTopicToUse });
        setQuizAnswers({});
        
        const quizItem: QuizItem = { id: crypto.randomUUID(), topic: quizTopicToUse, difficulty, questionCount: quizContent.questions.length };
        setQuizHistory(prev => [quizItem, ...prev]);
        addLogEntry("quiz", `Quiz: ${quizTopicToUse}`, `${quizContent.questions.length} questões`);
      } else {
        // Display as text
        const quizMessage: Message = { id: crypto.randomUUID(), role: "assistant", content: `## 📝 Quiz: ${quizTopicToUse}\n\n${typeof quizContent === "string" ? quizContent : JSON.stringify(quizContent, null, 2)}`, timestamp: new Date(), type: "quiz" };
        setMessages([quizMessage]);
        setActiveTab("mentor");
      }

      toast({ title: "Quiz Gerado", description: `Quiz sobre "${quizTopicToUse}" pronto!` });
      setQuizTopic("");
    } catch (error: SupabaseError | null) {
      toast({ title: "Erro", description: error.message || "Não foi possível gerar o quiz", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Submit quiz answers
  const submitQuiz = () => {
    if (!activeQuiz) return;
    
    let correctCount = 0;
    activeQuiz.questions.forEach((q: unknown: unknown: unknown, idx: number) => {
      if (quizAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    };

    const score = Math.round((correctCount / activeQuiz.questions.length) * 100);
    
    toast({
      title: score >= 70 ? "Parabéns!" : "Continue Estudando",
      description: `Você acertou ${correctCount} de ${activeQuiz.questions.length} questões (${score}%)`,
      variant: score >= 70 ? "default" : "destructive",
    });

    // Update quiz history with score
    setQuizHistory(prev => prev.map((q, i) => i === 0 ? { ...q, score, completedAt: new Date() } : q));
    setActiveQuiz(null);
    setQuizAnswers({});
  };

  // Create new module
  const createNewModule = () => {
    if (!newModuleName.trim()) {
      toast({ title: "Erro", description: "Nome do módulo é obrigatório", variant: "destructive" });
      return;
    }

    const newModule: AcademyModule = {
      id: crypto.randomUUID(),
      name: newModuleName,
      description: newModuleDescription || "Módulo personalizado",
      category: "custom",
      lessons: 5,
      duration: "3h",
      difficulty: newModuleDifficulty as unknown,
      icon: <BookOpen className="h-5 w-5" />,
      progress: 0,
    };

    setAcademyModules(prev => [...prev, newModule]);
    setShowNewModuleDialog(false);
    setNewModuleName("");
    setNewModuleDescription("");
    toast({ title: "Módulo Criado", description: `Trilha "${newModuleName}" adicionada!` });
  };

  // Create new scenario
  const createNewScenario = () => {
    if (!newScenarioName.trim()) {
      toast({ title: "Erro", description: "Nome do cenário é obrigatório", variant: "destructive" });
      return;
    }

    const newScenario: SimulationScenario = {
      id: crypto.randomUUID(),
      name: newScenarioName,
      description: newScenarioDescription || "Cenário personalizado",
      type: newScenarioType,
      difficulty: newScenarioDifficulty as unknown,
      duration: "20 min",
      isCustom: true,
    };

    setScenarios(prev => [...prev, newScenario]);
    setShowNewScenarioDialog(false);
    setNewScenarioName("");
    setNewScenarioDescription("");
    toast({ title: "Cenário Criado", description: `Simulação "${newScenarioName}" adicionada!` });
  };

  // Answer repository question
  const answerQuestion = async (question: RepositoryQuestion) => {
    setIsLoading(true);
    try {
      const data = await callMentorAI("chat", {
        messages: [{ role: "user", content: question.question }],
      };

      setRepositoryQuestions(prev => prev.map(q => q.id === question.id ? { ...q, answer: data.content, answers: q.answers + 1 } : q));
      setSelectedQuestion({ ...question, answer: data.content });
      toast({ title: "Resposta Gerada", description: "A IA respondeu sua pergunta!" });
    } catch (error: SupabaseError | null) {
      toast({ title: "Erro", description: error.message || "Não foi possível gerar resposta", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Add new question to repository
  const addNewQuestion = () => {
    if (!newQuestion.trim()) {
      toast({ title: "Erro", description: "Digite sua pergunta", variant: "destructive" });
      return;
    }

    const question: RepositoryQuestion = {
      id: crypto.randomUUID(),
      question: newQuestion,
      category: newQuestionCategory,
      votes: 0,
      answers: 0,
    };

    setRepositoryQuestions(prev => [question, ...prev]);
    setShowNewQuestionDialog(false);
    setNewQuestion("");
    toast({ title: "Pergunta Adicionada", description: "Sua pergunta foi adicionada ao repositório!" });
  };

  // Vote on question
  const voteQuestion = (id: string) => {
    setRepositoryQuestions(prev => prev.map(q => q.id === id ? { ...q, votes: q.votes + 1 } : q));
  };

  // Export logbook
  const exportLogbook = () => {
    if (logEntries.length === 0) {
      toast({ title: "Diário Vazio", description: "Não há registros para exportar", variant: "destructive" });
      return;
    }

    const content = logEntries.map(entry => 
      `[${entry.timestamp.toLocaleString()}] ${entry.type.toUpperCase()}: ${entry.title}\n${entry.summary}\n---`
    ).join("\n\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diario-dp-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Exportado", description: "Diário exportado com sucesso!" });
  };

  // Filter modules by difficulty
  const filteredModules = academyModules.filter(m => 
    filterDifficulty === "all" || m.difficulty === filterDifficulty
  );

  // Filter repository questions
  const filteredQuestions = repositoryQuestions.filter(q =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Quick topics
  const quickTopics = [
    "O que é Posicionamento Dinâmico?",
    "Explique as classes DP0, DP1, DP2 e DP3",
    "Como funciona o DGPS no DP?",
    "O que é WCFDI?",
    "Procedimentos de drive-off",
    "Como interpretar um capability plot?",
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <Compass className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Mentor DP</h1>
              <p className="text-muted-foreground">Sistema de Mentoria em Posicionamento Dinâmico com IA</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1.5 gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              IA Generativa + Preditiva
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              {stats.proficiencyLevel}
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={<MessageSquare className="h-5 w-5 text-blue-500" />} label="Sessões" value={stats.sessionsCompleted.toString()} color="border-blue-500" />
          <StatCard icon={<GraduationCap className="h-5 w-5 text-purple-500" />} label="Lições" value={stats.lessonsCompleted.toString()} trend="+5 esta semana" color="border-purple-500" />
          <StatCard icon={<Play className="h-5 w-5 text-green-500" />} label="Simulações" value={stats.simulationsPassed.toString()} color="border-green-500" />
          <StatCard icon={<Target className="h-5 w-5 text-amber-500" />} label="Pontuação Média" value={`${stats.avgScore}%`} color="border-amber-500" />
          <StatCard icon={<Clock className="h-5 w-5 text-cyan-500" />} label="Horas de Estudo" value={`${stats.totalHours}h`} color="border-cyan-500" />
          <StatCard icon={<Award className="h-5 w-5 text-rose-500" />} label="Nível" value={stats.proficiencyLevel} color="border-rose-500" />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto gap-1 p-1">
            <TabsTrigger value="mentor" className="gap-2 py-2"><Bot className="h-4 w-4" /><span className="hidden sm:inline">Mentor IA</span></TabsTrigger>
            <TabsTrigger value="academy" className="gap-2 py-2"><GraduationCap className="h-4 w-4" /><span className="hidden sm:inline">Academia</span></TabsTrigger>
            <TabsTrigger value="simulator" className="gap-2 py-2"><Play className="h-4 w-4" /><span className="hidden sm:inline">Simulador</span></TabsTrigger>
            <TabsTrigger value="quiz" className="gap-2 py-2"><ClipboardList className="h-4 w-4" /><span className="hidden sm:inline">Quizzes</span></TabsTrigger>
            <TabsTrigger value="logbook" className="gap-2 py-2"><BookOpen className="h-4 w-4" /><span className="hidden sm:inline">Diário</span></TabsTrigger>
            <TabsTrigger value="repository" className="gap-2 py-2"><HelpCircle className="h-4 w-4" /><span className="hidden sm:inline">Repositório</span></TabsTrigger>
          </TabsList>

          {/* Mentor IA Tab */}
          <TabsContent value="mentor" className="space-y-4">
            <div className="grid lg:grid-cols-4 gap-4">
              <Card className="lg:col-span-3">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
                        <Compass className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Cmte. Ricardo "Mentor" Almeida</CardTitle>
                        <CardDescription>DPO Classe 1 IMCA • 18+ anos de experiência</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      Online
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px] px-4">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                        <div className="p-4 rounded-full bg-blue-500/10 mb-4">
                          <Brain className="h-12 w-12 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Bem-vindo ao Mentor DP</h3>
                        <p className="text-muted-foreground max-w-md mb-4">
                          Sou seu mentor virtual em Posicionamento Dinâmico. Pergunte sobre sensores, operações, emergências, normas ou qualquer aspecto do DP.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                          {quickTopics.map((topic, i) => (
                            <Button key={i} variant="outline" size="sm" onClick={() => handlesendMessage} className="text-xs">
                              {topic}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 py-4">
                        {messages.map((message) => (
                          <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                            <div className={`p-2 rounded-full h-8 w-8 flex items-center justify-center ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-gradient-to-br from-blue-500 to-cyan-500"}`}>
                              {message.role === "user" ? <User className="h-4 w-4" /> : <Compass className="h-4 w-4 text-white" />}
                            </div>
                            <div className={`flex-1 max-w-[80%] rounded-lg p-4 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              </div>
                              <p className="text-xs opacity-50 mt-2">{message.timestamp.toLocaleTimeString()}</p>
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex gap-3">
                            <div className="p-2 rounded-full h-8 w-8 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500">
                              <Compass className="h-4 w-4 text-white" />
                            </div>
                            <div className="bg-muted rounded-lg p-4">
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input value={inputMessage} onChange={handleChange} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()} placeholder="Faça uma pergunta sobre DP..." disabled={isLoading} className="flex-1" />
                      <Button onClick={() => sendMessage()} disabled={isLoading || !inputMessage.trim()}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Ações Rápidas</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={handleSetActiveTab}><GraduationCap className="h-4 w-4 text-purple-500" />Iniciar Lição</Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={handleSetActiveTab}><Play className="h-4 w-4 text-green-500" />Nova Simulação</Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={handleSetShowQuizDialog}><ClipboardList className="h-4 w-4 text-amber-500" />Gerar Quiz</Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => handlesendMessage}><Award className="h-4 w-4 text-rose-500" />Avaliar Proficiência</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Referências</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between"><span className="text-muted-foreground">IMO</span><Badge variant="secondary" className="text-xs">MSC/Circ.645</Badge></div>
                      <div className="flex items-center justify-between"><span className="text-muted-foreground">IMCA</span><Badge variant="secondary" className="text-xs">M103, M117, M140</Badge></div>
                      <div className="flex items-center justify-between"><span className="text-muted-foreground">MTS</span><Badge variant="secondary" className="text-xs">DP Guidelines</Badge></div>
                      <div className="flex items-center justify-between"><span className="text-muted-foreground">Class</span><Badge variant="secondary" className="text-xs">DNV, ABS, BV</Badge></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Academia Tab */}
          <TabsContent value="academy" className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-semibold">Academia DP</h2>
                <p className="text-muted-foreground">Trilha de aprendizado do zero à proficiência</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Filtrar por nível" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os níveis</SelectItem>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSetShowNewModuleDialog}><Plus className="h-4 w-4 mr-2" />Nova Trilha</Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModules.map((module) => (
                <Card key={module.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        module.category === "fundamentals" ? "bg-blue-500/10 text-blue-500" :
                          module.category === "sensors" ? "bg-purple-500/10 text-purple-500" :
                            module.category === "thrusters" ? "bg-green-500/10 text-green-500" :
                              module.category === "redundancy" ? "bg-amber-500/10 text-amber-500" :
                                module.category === "operations" ? "bg-cyan-500/10 text-cyan-500" :
                                  module.category === "emergency" ? "bg-red-500/10 text-red-500" :
                                    "bg-gray-500/10 text-gray-500"
                      }`}>
                        {module.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{module.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          {module.difficulty === "beginner" ? "Iniciante" : module.difficulty === "intermediate" ? "Intermediário" : module.difficulty === "advanced" ? "Avançado" : "Expert"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{module.lessons} lições</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{module.duration}</span>
                    </div>
                    <Progress value={module.progress || 0} className="h-1.5 mb-3" />
                    <Button className="w-full" size="sm" onClick={() => handlegenerateLesson} disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      {(module.progress || 0) > 0 ? "Continuar" : "Iniciar Lição"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Simulator Tab */}
          <TabsContent value="simulator" className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-semibold">Simulador Embarcado</h2>
                <p className="text-muted-foreground">Cenários interativos com avaliação de IA</p>
              </div>
              <Button onClick={handleSetShowNewScenarioDialog}><Plus className="h-4 w-4 mr-2" />Novo Cenário</Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map((scenario) => (
                <Card key={scenario.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{scenario.name}</CardTitle>
                      <Badge variant={scenario.difficulty === "easy" ? "secondary" : scenario.difficulty === "medium" ? "outline" : scenario.difficulty === "hard" ? "default" : "destructive"}>
                        {scenario.difficulty === "easy" ? "Fácil" : scenario.difficulty === "medium" ? "Médio" : scenario.difficulty === "hard" ? "Difícil" : "Extremo"}
                      </Badge>
                    </div>
                    {scenario.isCustom && <Badge variant="secondary" className="mt-1 text-xs">Personalizado</Badge>}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{scenario.type.replace("_", " ")}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{scenario.duration}</span>
                    </div>
                    <Button className="w-full" size="sm" onClick={() => handlestartSimulation} disabled={isLoading}>
                      {isLoading && activeSimulation?.id === scenario.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      Iniciar Simulação
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz" className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-semibold">Avaliações e Quizzes</h2>
                <p className="text-muted-foreground">Teste seus conhecimentos com quizzes adaptativos</p>
              </div>
              <Button onClick={handleSetShowQuizDialog}><Sparkles className="h-4 w-4 mr-2" />Gerar Novo Quiz</Button>
            </div>

            {activeQuiz ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Quiz: {activeQuiz.topic}
                  </CardTitle>
                  <CardDescription>{activeQuiz.questions.length} questões • {activeQuiz.quiz?.passingScore || 70}% para aprovação</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {activeQuiz.questions.map((q: unknown, idx: number) => (
                    <div key={idx} className="space-y-3 p-4 bg-muted/50 rounded-lg">
                      <p className="font-medium">{idx + 1}. {q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((opt: unknown, optIdx: number) => (
                          <label key={optIdx} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${quizAnswers[idx] === (opt.key || String.fromCharCode(97 + optIdx)) ? "bg-primary/10 border border-primary" : "bg-background hover:bg-muted"}`}>
                            <input type="radio" name={`q${idx}`} value={opt.key || String.fromCharCode(97 + optIdx)} checked={quizAnswers[idx] === (opt.key || String.fromCharCode(97 + optIdx))} onChange={handleChange}))} className="sr-only" />
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${quizAnswers[idx] === (opt.key || String.fromCharCode(97 + optIdx)) ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                              {quizAnswers[idx] === (opt.key || String.fromCharCode(97 + optIdx)) && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                            </div>
                            <span className="text-sm">{typeof opt === "string" ? opt : opt.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => { setActiveQuiz(null); setQuizAnswers({}); }}>Cancelar</Button>
                    <Button onClick={submitQuiz} disabled={Object.keys(quizAnswers).length < activeQuiz.questions.length}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Enviar Respostas ({Object.keys(quizAnswers).length}/{activeQuiz.questions.length})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid md:grid-cols-3 gap-4">
                  {["Sensores e Referências", "Procedimentos de Emergência", "Redundância DP", "Fundamentos de DP", "Operações DP", "Manutenção de Sistemas"].map((topic, i) => (
                    <Card key={i}>
                      <CardHeader><CardTitle className="text-base">{topic}</CardTitle></CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="text-muted-foreground">10 questões</span>
                          <Badge variant="outline">Intermediário</Badge>
                        </div>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => handlegenerateQuiz} disabled={isLoading}>
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ClipboardList className="h-4 w-4 mr-2" />}
                          Iniciar Quiz
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {quizHistory.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Histórico de Quizzes</h3>
                    <div className="space-y-2">
                      {quizHistory.map((quiz) => (
                        <Card key={quiz.id}>
                          <CardContent className="p-4 flex items-center justify-between">
                            <div>
                              <p className="font-medium">{quiz.topic}</p>
                              <p className="text-sm text-muted-foreground">{quiz.questionCount} questões • {quiz.difficulty}</p>
                            </div>
                            <div className="text-right">
                              {quiz.score !== undefined ? (
                                <Badge variant={quiz.score >= 70 ? "default" : "destructive"}>{quiz.score}%</Badge>
                              ) : (
                                <Badge variant="secondary">Pendente</Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Logbook Tab */}
          <TabsContent value="logbook" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Diário de Bordo Inteligente</h2>
                <p className="text-muted-foreground">Registro automático de aprendizados e insights</p>
              </div>
              <Button variant="outline" onClick={exportLogbook}><Download className="h-4 w-4 mr-2" />Exportar Diário</Button>
            </div>

            <Card>
              <CardContent className="p-6">
                {logEntries.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Seu diário está vazio</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      Comece a interagir com o Mentor DP para que suas dúvidas, simulações e aprendizados sejam registrados automaticamente aqui.
                    </p>
                    <Button onClick={handleSetActiveTab}><MessageSquare className="h-4 w-4 mr-2" />Iniciar Conversa</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {logEntries.map((entry) => (
                      <div key={entry.id} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className={`p-2 rounded-lg ${
                          entry.type === "chat" ? "bg-blue-500/10 text-blue-500" :
                            entry.type === "lesson" ? "bg-purple-500/10 text-purple-500" :
                              entry.type === "simulation" ? "bg-green-500/10 text-green-500" :
                                "bg-amber-500/10 text-amber-500"
                        }`}>
                          {entry.type === "chat" ? <MessageSquare className="h-4 w-4" /> :
                            entry.type === "lesson" ? <GraduationCap className="h-4 w-4" /> :
                              entry.type === "simulation" ? <Play className="h-4 w-4" /> :
                                <ClipboardList className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{entry.title}</h4>
                            <span className="text-xs text-muted-foreground">{entry.timestamp.toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{entry.summary}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Repository Tab */}
          <TabsContent value="repository" className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-semibold">Repositório de Dúvidas</h2>
                <p className="text-muted-foreground">Base de conhecimento pesquisável</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar no repositório..." className="w-64 pl-10" value={searchQuery} onChange={handleChange} />
                </div>
                <Button onClick={handleSetShowNewQuestionDialog}><Plus className="h-4 w-4 mr-2" />Nova Pergunta</Button>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredQuestions.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedQuestion(item); setShowQuestionDialog(true); }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{item.question}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <Badge variant="secondary">{item.category}</Badge>
                          <span className="flex items-center gap-1"><Star className="h-3 w-3" />{item.votes} votos</span>
                          <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{item.answers} respostas</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); voteQuestion(item.id); }}><ThumbsUp className="h-4 w-4" /></Button>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quiz Generation Dialog */}
        <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerar Novo Quiz</DialogTitle>
              <DialogDescription>Informe o tópico e nível de dificuldade para gerar um quiz personalizado</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tópico</label>
                <Input value={quizTopic} onChange={handleChange} placeholder="Ex: Sensores de referência, Procedimentos de emergência..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Dificuldade</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleSetShowQuizDialog}>Cancelar</Button>
              <Button onClick={() => generateQuiz()} disabled={!quizTopic.trim() || isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Gerar Quiz
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Module Dialog */}
        <Dialog open={showNewModuleDialog} onOpenChange={setShowNewModuleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Trilha de Aprendizado</DialogTitle>
              <DialogDescription>Crie uma nova trilha personalizada</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome da Trilha</label>
                <Input value={newModuleName} onChange={handleChange} placeholder="Ex: Operações em Waters Profundas..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <Textarea value={newModuleDescription} onChange={handleChange} placeholder="Descreva os objetivos desta trilha..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Dificuldade</label>
                <Select value={newModuleDifficulty} onValueChange={setNewModuleDifficulty}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleSetShowNewModuleDialog}>Cancelar</Button>
              <Button onClick={createNewModule}><Plus className="h-4 w-4 mr-2" />Criar Trilha</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Scenario Dialog */}
        <Dialog open={showNewScenarioDialog} onOpenChange={setShowNewScenarioDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Cenário de Simulação</DialogTitle>
              <DialogDescription>Crie um novo cenário de falha para praticar</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Cenário</label>
                <Input value={newScenarioName} onChange={handleChange} placeholder="Ex: Falha de Gyro durante manobra..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <Textarea value={newScenarioDescription} onChange={handleChange} placeholder="Descreva as condições e o cenário..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Falha</label>
                <Select value={newScenarioType} onValueChange={setNewScenarioType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sensor_failure">Falha de Sensor</SelectItem>
                    <SelectItem value="thruster_failure">Falha de Propulsor</SelectItem>
                    <SelectItem value="power_loss">Perda de Energia</SelectItem>
                    <SelectItem value="weather">Deterioração do Tempo</SelectItem>
                    <SelectItem value="multi_failure">Falhas Múltiplas</SelectItem>
                    <SelectItem value="communication">Falha de Comunicação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Dificuldade</label>
                <Select value={newScenarioDifficulty} onValueChange={setNewScenarioDifficulty}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                    <SelectItem value="extreme">Extremo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleSetShowNewScenarioDialog}>Cancelar</Button>
              <Button onClick={createNewScenario}><Plus className="h-4 w-4 mr-2" />Criar Cenário</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Question Dialog */}
        <Dialog open={showNewQuestionDialog} onOpenChange={setShowNewQuestionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Pergunta</DialogTitle>
              <DialogDescription>Adicione uma pergunta ao repositório de dúvidas</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sua Pergunta</label>
                <Textarea value={newQuestion} onChange={handleChange} placeholder="Digite sua pergunta sobre DP..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select value={newQuestionCategory} onValueChange={setNewQuestionCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sensores">Sensores</SelectItem>
                    <SelectItem value="Propulsão">Propulsão</SelectItem>
                    <SelectItem value="Redundância">Redundância</SelectItem>
                    <SelectItem value="Operações">Operações</SelectItem>
                    <SelectItem value="Emergência">Emergência</SelectItem>
                    <SelectItem value="Normas">Normas e Regulamentos</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleSetShowNewQuestionDialog}>Cancelar</Button>
              <Button onClick={addNewQuestion}><Plus className="h-4 w-4 mr-2" />Adicionar Pergunta</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Question Detail Dialog */}
        <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedQuestion?.question}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{selectedQuestion?.category}</Badge>
                <span className="text-sm text-muted-foreground">{selectedQuestion?.votes} votos • {selectedQuestion?.answers} respostas</span>
              </div>
            </DialogHeader>
            <div className="py-4">
              {selectedQuestion?.answer ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{selectedQuestion.answer}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">Esta pergunta ainda não foi respondida.</p>
                  <Button onClick={() => selectedQuestion && answerQuestion(selectedQuestion} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Gerar Resposta com IA
                  </Button>
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => selectedQuestion && voteQuestion(selectedQuestion.id}>
                <ThumbsUp className="h-4 w-4 mr-2" />
                Útil ({selectedQuestion?.votes})
              </Button>
              <Button variant="outline" onClick={handleSetShowQuestionDialog}>Fechar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
