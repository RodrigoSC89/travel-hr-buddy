import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Anchor,
  Brain,
  GraduationCap,
  Play,
  ClipboardList,
  BookOpen,
  HelpCircle,
  Award,
  Send,
  Bot,
  User,
  Loader2,
  Target,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Compass,
  Navigation,
  Waves,
  Wind,
  Radar,
  Cpu,
  Zap,
  RefreshCw,
  Download,
  Star,
  Bookmark,
  Clock,
  ChevronRight,
  Sparkles,
  MessageSquare,
  FileText,
  History,
} from "lucide-react";

// Types
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
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
}

interface SimulationScenario {
  id: string;
  name: string;
  type: string;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "extreme";
  duration: string;
}

// Academy Modules
const ACADEMY_MODULES: AcademyModule[] = [
  {
    id: "dp-fundamentals",
    name: "Fundamentos de DP",
    category: "fundamentals",
    description: "Princípios básicos de Posicionamento Dinâmico, forças atuantes e modos de controle",
    lessons: 8,
    duration: "4h",
    difficulty: "beginner",
    icon: <Anchor className="h-5 w-5" />,
  },
  {
    id: "sensors-references",
    name: "Sensores e Referências",
    category: "sensors",
    description: "GNSS, DGPS, MRU, giroscópio, anemômetro, sistemas acústicos e laser",
    lessons: 12,
    duration: "6h",
    difficulty: "intermediate",
    icon: <Radar className="h-5 w-5" />,
  },
  {
    id: "thrusters-propulsion",
    name: "Propulsores e Propulsão",
    category: "thrusters",
    description: "Azimuth thrusters, túnel, vetorização de empuxo e eficiência energética",
    lessons: 10,
    duration: "5h",
    difficulty: "intermediate",
    icon: <Navigation className="h-5 w-5" />,
  },
  {
    id: "redundancy-safety",
    name: "Redundância e Segurança",
    category: "redundancy",
    description: "Classes DP, WCFDI, FMEA, CAMO/CAMS, sistemas de fallback",
    lessons: 14,
    duration: "7h",
    difficulty: "advanced",
    icon: <Cpu className="h-5 w-5" />,
  },
  {
    id: "operations-planning",
    name: "Planejamento Operacional",
    category: "operations",
    description: "Análise de footprint, capability plots, janelas operacionais, handover",
    lessons: 10,
    duration: "5h",
    difficulty: "advanced",
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: "emergency-procedures",
    name: "Procedimentos de Emergência",
    category: "emergency",
    description: "Drive-off, drift-off, EDS, blackout recovery, zonas operacionais",
    lessons: 8,
    duration: "4h",
    difficulty: "expert",
    icon: <AlertTriangle className="h-5 w-5" />,
  },
];

// Simulation Scenarios
const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: "dgps-failure",
    name: "Falha de DGPS Principal",
    type: "sensor_failure",
    description: "DGPS principal falha durante operação de offloading com vento de 25 nós",
    difficulty: "medium",
    duration: "15 min",
  },
  {
    id: "thruster-loss",
    name: "Perda de Propulsor Azimuth",
    type: "thruster_failure",
    description: "Propulsor azimuth de popa falha em operação próxima a plataforma",
    difficulty: "hard",
    duration: "20 min",
  },
  {
    id: "power-blackout",
    name: "Blackout Parcial",
    type: "power_loss",
    description: "Perda de um barramento principal com 30% da capacidade de propulsão",
    difficulty: "hard",
    duration: "25 min",
  },
  {
    id: "weather-deterioration",
    name: "Deterioração do Tempo",
    type: "weather",
    description: "Aumento rápido de vento e ondas durante operação de mergulho",
    difficulty: "medium",
    duration: "20 min",
  },
  {
    id: "multi-failure",
    name: "Falhas Múltiplas",
    type: "multi_failure",
    description: "Sequência de falhas: gyro + thruster + comunicação UHF",
    difficulty: "extreme",
    duration: "30 min",
  },
];

// Stats Card Component
const StatCard = ({ icon, label, value, trend, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  color: string;
}) => (
  <Card className={`border-l-4 ${color}`}>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-opacity-10 ${color.replace("border-", "bg-")}`}>
          {icon}
        </div>
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
  const [selectedModule, setSelectedModule] = useState<AcademyModule | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [quizTopic, setQuizTopic] = useState("");
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock stats
  const stats = {
    sessionsCompleted: 24,
    lessonsCompleted: 42,
    simulationsPassed: 18,
    avgScore: 87,
    totalHours: 36,
    proficiencyLevel: "Avançado",
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message to AI
  const sendMessage = async (customMessage?: string) => {
    const messageText = customMessage || inputMessage.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("dp-mentor-ai", {
        body: {
          action: "chat",
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível obter resposta do Mentor DP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate lesson
  const generateLesson = async (module: AcademyModule) => {
    setSelectedModule(module);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("dp-mentor-ai", {
        body: {
          action: "generate_lesson",
          topic: module.name,
          difficulty: module.difficulty,
        },
      });

      if (error) throw error;

      const lessonMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `## 📚 Lição: ${module.name}\n\n${data.content}`,
        timestamp: new Date(),
      };

      setMessages([lessonMessage]);
      setActiveTab("mentor");

      toast({
        title: "Lição Gerada",
        description: `Lição sobre "${module.name}" pronta para estudo!`,
      });
    } catch (error: any) {
      console.error("Erro ao gerar lição:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar a lição",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Start simulation
  const startSimulation = async (scenario: SimulationScenario) => {
    setSelectedScenario(scenario);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("dp-mentor-ai", {
        body: {
          action: "generate_simulation",
          scenarioType: scenario.type,
          difficulty: scenario.difficulty,
          context: {
            conditions: scenario.description,
          },
        },
      });

      if (error) throw error;

      const simMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `## 🎮 Simulação: ${scenario.name}\n\n${data.content}`,
        timestamp: new Date(),
      };

      setMessages([simMessage]);
      setActiveTab("mentor");

      toast({
        title: "Simulação Iniciada",
        description: `Cenário "${scenario.name}" carregado. Boa sorte!`,
      });
    } catch (error: any) {
      console.error("Erro ao iniciar simulação:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível iniciar a simulação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate quiz
  const generateQuiz = async () => {
    if (!quizTopic.trim()) {
      toast({
        title: "Tópico Necessário",
        description: "Informe um tópico para gerar o quiz",
        variant: "destructive",
      });
      return;
    }

    setShowQuizDialog(false);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("dp-mentor-ai", {
        body: {
          action: "generate_quiz",
          quizTopic: quizTopic,
          difficulty: difficulty,
        },
      });

      if (error) throw error;

      const quizMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `## 📝 Quiz: ${quizTopic}\n\n${typeof data.content === "string" ? data.content : JSON.stringify(data.content, null, 2)}`,
        timestamp: new Date(),
      };

      setMessages([quizMessage]);
      setActiveTab("mentor");
      setQuizTopic("");

      toast({
        title: "Quiz Gerado",
        description: `Quiz sobre "${quizTopic}" pronto!`,
      });
    } catch (error: any) {
      console.error("Erro ao gerar quiz:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar o quiz",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick topics for starting conversation
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
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <Compass className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Mentor DP</h1>
                <p className="text-muted-foreground">
                  Sistema de Mentoria em Posicionamento Dinâmico com IA
                </p>
              </div>
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
          <StatCard
            icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
            label="Sessões"
            value={stats.sessionsCompleted.toString()}
            color="border-blue-500"
          />
          <StatCard
            icon={<GraduationCap className="h-5 w-5 text-purple-500" />}
            label="Lições"
            value={stats.lessonsCompleted.toString()}
            trend="+5 esta semana"
            color="border-purple-500"
          />
          <StatCard
            icon={<Play className="h-5 w-5 text-green-500" />}
            label="Simulações"
            value={stats.simulationsPassed.toString()}
            color="border-green-500"
          />
          <StatCard
            icon={<Target className="h-5 w-5 text-amber-500" />}
            label="Pontuação Média"
            value={`${stats.avgScore}%`}
            color="border-amber-500"
          />
          <StatCard
            icon={<Clock className="h-5 w-5 text-cyan-500" />}
            label="Horas de Estudo"
            value={`${stats.totalHours}h`}
            color="border-cyan-500"
          />
          <StatCard
            icon={<Award className="h-5 w-5 text-rose-500" />}
            label="Nível"
            value={stats.proficiencyLevel}
            color="border-rose-500"
          />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto gap-1 p-1">
            <TabsTrigger value="mentor" className="gap-2 py-2">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">Mentor IA</span>
            </TabsTrigger>
            <TabsTrigger value="academy" className="gap-2 py-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Academia</span>
            </TabsTrigger>
            <TabsTrigger value="simulator" className="gap-2 py-2">
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Simulador</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-2 py-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Quizzes</span>
            </TabsTrigger>
            <TabsTrigger value="logbook" className="gap-2 py-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Diário</span>
            </TabsTrigger>
            <TabsTrigger value="repository" className="gap-2 py-2">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Repositório</span>
            </TabsTrigger>
          </TabsList>

          {/* Mentor IA Tab */}
          <TabsContent value="mentor" className="space-y-4">
            <div className="grid lg:grid-cols-4 gap-4">
              {/* Chat Area */}
              <Card className="lg:col-span-3">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
                        <Compass className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Cmte. Ricardo "Mentor" Almeida</CardTitle>
                        <CardDescription>DPO Classe 1 IMCA • 15+ anos de experiência</CardDescription>
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
                          Sou seu mentor virtual em Posicionamento Dinâmico. Pergunte sobre sensores, 
                          operações, emergências, normas ou qualquer aspecto do DP.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                          {quickTopics.map((topic, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              onClick={() => sendMessage(topic)}
                              className="text-xs"
                            >
                              {topic}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 py-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                          >
                            <div
                              className={`p-2 rounded-full h-8 w-8 flex items-center justify-center ${
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-gradient-to-br from-blue-500 to-cyan-500"
                              }`}
                            >
                              {message.role === "user" ? (
                                <User className="h-4 w-4" />
                              ) : (
                                <Compass className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <div
                              className={`flex-1 max-w-[80%] rounded-lg p-4 ${
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                                {message.content}
                              </div>
                              <p className="text-xs opacity-50 mt-2">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
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

                  {/* Input Area */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                        placeholder="Faça uma pergunta sobre DP..."
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button onClick={() => sendMessage()} disabled={isLoading || !inputMessage.trim()}>
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab("academy")}
                    >
                      <GraduationCap className="h-4 w-4 text-purple-500" />
                      Iniciar Lição
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab("simulator")}
                    >
                      <Play className="h-4 w-4 text-green-500" />
                      Nova Simulação
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => setShowQuizDialog(true)}
                    >
                      <ClipboardList className="h-4 w-4 text-amber-500" />
                      Gerar Quiz
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => sendMessage("Avalie minha proficiência atual em DP com base em nosso histórico de conversas")}
                    >
                      <Award className="h-4 w-4 text-rose-500" />
                      Avaliar Proficiência
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Referências</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">IMO</span>
                        <Badge variant="secondary" className="text-xs">MSC/Circ.645</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">IMCA</span>
                        <Badge variant="secondary" className="text-xs">M103, M117, M140</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">MTS</span>
                        <Badge variant="secondary" className="text-xs">DP Guidelines</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Class</span>
                        <Badge variant="secondary" className="text-xs">DNV, ABS, BV</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Academia Tab */}
          <TabsContent value="academy" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Academia DP</h2>
                <p className="text-muted-foreground">Trilha de aprendizado do zero à proficiência</p>
              </div>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACADEMY_MODULES.map((module) => (
                <Card
                  key={module.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => generateLesson(module)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        module.category === "fundamentals" ? "bg-blue-500/10 text-blue-500" :
                        module.category === "sensors" ? "bg-purple-500/10 text-purple-500" :
                        module.category === "thrusters" ? "bg-green-500/10 text-green-500" :
                        module.category === "redundancy" ? "bg-amber-500/10 text-amber-500" :
                        module.category === "operations" ? "bg-cyan-500/10 text-cyan-500" :
                        "bg-red-500/10 text-red-500"
                      }`}>
                        {module.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{module.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          {module.difficulty === "beginner" ? "Iniciante" :
                           module.difficulty === "intermediate" ? "Intermediário" :
                           module.difficulty === "advanced" ? "Avançado" : "Expert"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {module.lessons} lições
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {module.duration}
                      </span>
                    </div>
                    <Progress value={0} className="mt-3 h-1.5" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Simulator Tab */}
          <TabsContent value="simulator" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Simulador Embarcado</h2>
                <p className="text-muted-foreground">Cenários interativos com avaliação de IA</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SIMULATION_SCENARIOS.map((scenario) => (
                <Card
                  key={scenario.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => startSimulation(scenario)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{scenario.name}</CardTitle>
                      <Badge
                        variant={
                          scenario.difficulty === "easy" ? "secondary" :
                          scenario.difficulty === "medium" ? "outline" :
                          scenario.difficulty === "hard" ? "default" :
                          "destructive"
                        }
                      >
                        {scenario.difficulty === "easy" ? "Fácil" :
                         scenario.difficulty === "medium" ? "Médio" :
                         scenario.difficulty === "hard" ? "Difícil" : "Extremo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {scenario.type.replace("_", " ")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {scenario.duration}
                      </span>
                    </div>
                    <Button className="w-full mt-4" size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Simulação
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Avaliações e Quizzes</h2>
                <p className="text-muted-foreground">Teste seus conhecimentos com quizzes adaptativos</p>
              </div>
              <Button onClick={() => setShowQuizDialog(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Novo Quiz
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {["Sensores e Referências", "Procedimentos de Emergência", "Redundância DP"].map((topic, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-base">{topic}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-muted-foreground">10 questões</span>
                      <Badge variant="outline">Intermediário</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setQuizTopic(topic);
                        generateQuiz();
                      }}
                    >
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Iniciar Quiz
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Logbook Tab */}
          <TabsContent value="logbook" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Diário de Bordo Inteligente</h2>
                <p className="text-muted-foreground">Registro automático de aprendizados e insights</p>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Diário
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Seu diário está vazio</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    Comece a interagir com o Mentor DP para que suas dúvidas, simulações e aprendizados 
                    sejam registrados automaticamente aqui.
                  </p>
                  <Button onClick={() => setActiveTab("mentor")}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Iniciar Conversa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Repository Tab */}
          <TabsContent value="repository" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Repositório de Dúvidas</h2>
                <p className="text-muted-foreground">Base de conhecimento pesquisável</p>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Buscar no repositório..." className="w-64" />
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                {
                  question: "Qual a diferença entre DGPS e DGNSS?",
                  category: "Sensores",
                  votes: 45,
                  answers: 3,
                },
                {
                  question: "Como interpretar um capability plot?",
                  category: "Operações",
                  votes: 38,
                  answers: 2,
                },
                {
                  question: "O que é WCFDI e como é aplicado?",
                  category: "Redundância",
                  votes: 32,
                  answers: 4,
                },
              ].map((item, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{item.question}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <Badge variant="secondary">{item.category}</Badge>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {item.votes} votos
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {item.answers} respostas
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
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
              <DialogDescription>
                Informe o tópico e nível de dificuldade para gerar um quiz personalizado
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tópico</label>
                <Input
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  placeholder="Ex: Sensores de referência, Procedimentos de emergência..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Dificuldade</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
              <Button variant="outline" onClick={() => setShowQuizDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={generateQuiz} disabled={!quizTopic.trim()}>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Quiz
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
