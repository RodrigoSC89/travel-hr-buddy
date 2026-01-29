/**
 * Advanced Training AI v6.0 - REVOLUCIONÁRIO
 * 
 * Diferencial vs Seagull, OLP, Videotel:
 * - Trilhas adaptativas com ML
 * - Simulador de cenários imersivo
 * - Tutor IA 24/7 especializado
 * - Gap analysis automático
 * - Certificação preditiva
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  GraduationCap, 
  BookOpen, 
  Award,
  Target,
  Sparkles,
  Play,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Send,
  Zap,
  RefreshCw,
  Users,
  Star,
  Trophy,
  Gamepad2,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LearningPath {
  id: string;
  title: string;
  description: string;
  modules: number;
  completedModules: number;
  estimatedHours: number;
  certifications: string[];
  aiGenerated: boolean;
  priority: "high" | "medium" | "low";
  dueDate: string;
}

interface CompetencyGap {
  id: string;
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  urgency: "critical" | "high" | "medium" | "low";
  recommendation: string;
  trainingPath: string;
}

interface Simulation {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  duration: number;
  skills: string[];
  completionRate: number;
  avgScore: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AdvancedTrainingAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const learningPaths: LearningPath[] = [
    { id: "1", title: "Certificação DPO Avançado", description: "Trilha completa para certificação de Operador de DP Avançado", modules: 15, completedModules: 8, estimatedHours: 60, certifications: ["DP Advanced", "IMCA", "NI"], aiGenerated: true, priority: "high", dueDate: "2025-03-15" },
    { id: "2", title: "SOLAS Safety Master", description: "Treinamentos obrigatórios de segurança avançada", modules: 12, completedModules: 12, estimatedHours: 40, certifications: ["STCW", "BST", "AFF"], aiGenerated: false, priority: "medium", dueDate: "2025-02-01" },
    { id: "3", title: "Bridge Resource Management", description: "Gestão de recursos de passadiço e comunicação", modules: 8, completedModules: 3, estimatedHours: 24, certifications: ["BRM"], aiGenerated: true, priority: "medium", dueDate: "2025-04-20" },
    { id: "4", title: "ECDIS Operation", description: "Operação avançada de carta eletrônica", modules: 10, completedModules: 6, estimatedHours: 32, certifications: ["ECDIS Generic", "ECDIS Type Specific"], aiGenerated: false, priority: "high", dueDate: "2025-02-28" },
  ];

  const competencyGaps: CompetencyGap[] = [
    { id: "1", skill: "Operação DP em Condições Adversas", currentLevel: 65, requiredLevel: 90, gap: 25, urgency: "critical", recommendation: "Completar módulos avançados de DP e simulações em condições extremas", trainingPath: "Certificação DPO Avançado" },
    { id: "2", skill: "Gestão de Emergências", currentLevel: 78, requiredLevel: 95, gap: 17, urgency: "high", recommendation: "Realizar drill de emergência virtual e estudar casos de incidentes", trainingPath: "SOLAS Safety Master" },
    { id: "3", skill: "Comunicação BRM", currentLevel: 70, requiredLevel: 85, gap: 15, urgency: "medium", recommendation: "Praticar cenários de comunicação em grupo e liderança situacional", trainingPath: "Bridge Resource Management" },
    { id: "4", skill: "Navegação ECDIS Avançada", currentLevel: 75, requiredLevel: 90, gap: 15, urgency: "medium", recommendation: "Focar em overlay de weather routing e integração de sensores", trainingPath: "ECDIS Operation" },
  ];

  const simulations: Simulation[] = [
    { id: "1", title: "Blackout Recovery DP", description: "Simulação de recuperação de blackout durante operação DP crítica", difficulty: "expert", duration: 45, skills: ["DP", "Emergency Response", "Power Management"], completionRate: 72, avgScore: 81 },
    { id: "2", title: "Anchor Handling Emergency", description: "Gerenciamento de emergência durante operação de ancoragem", difficulty: "advanced", duration: 30, skills: ["AHTS", "Safety", "Communication"], completionRate: 85, avgScore: 78 },
    { id: "3", title: "Man Overboard (MOB)", description: "Resposta completa a incidente de homem ao mar", difficulty: "intermediate", duration: 20, skills: ["SAR", "BRM", "Fast Rescue"], completionRate: 94, avgScore: 89 },
    { id: "4", title: "Fire Fighting Advanced", description: "Combate a incêndio em praça de máquinas", difficulty: "advanced", duration: 35, skills: ["Firefighting", "Emergency Response", "Damage Control"], completionRate: 88, avgScore: 84 },
    { id: "5", title: "Collision Avoidance", description: "Cenário complexo de navegação com múltiplos alvos", difficulty: "expert", duration: 40, skills: ["Navigation", "COLREG", "BRM"], completionRate: 76, avgScore: 77 },
  ];

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);

    try {
      // Simulação de resposta do tutor IA
      await new Promise(r => setTimeout(r, 1500));
      
      const responses = [
        "Excelente pergunta! Para a certificação DP Advanced, você precisa completar os módulos de Power Management, Reference Systems e FMEA. Recomendo focar primeiro em Power Management, pois é fundamental para entender os cenários de blackout.",
        "Com base no seu progresso atual, sugiro priorizar a simulação de Blackout Recovery. Sua taxa de acerto em cenários de emergência está em 78%, e este exercício vai ajudar a elevar para o nível requerido de 90%.",
        "Segundo as normas IMCA M109, operadores DP devem demonstrar competência em pelo menos 3 tipos diferentes de embarcações. Vejo que você já tem experiência em PLSV e DSV. Recomendo incluir um módulo de FPSO na sua trilha.",
        "Para renovar sua certificação STCW, você precisa completar o refresher course até 30 dias antes do vencimento. Baseado na data atual, sugiro agendar para a próxima janela disponível em fevereiro.",
      ];

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      toast.error("Erro ao processar pergunta");
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "beginner": return "bg-green-500";
      case "intermediate": return "bg-blue-500";
      case "advanced": return "bg-orange-500";
      case "expert": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical": return "text-red-500";
      case "high": return "text-orange-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  const totalProgress = learningPaths.reduce((acc, lp) => acc + (lp.completedModules / lp.modules) * 100, 0) / learningPaths.length;
  const criticalGaps = competencyGaps.filter(g => g.urgency === "critical" || g.urgency === "high").length;
  const completedSimulations = simulations.filter(s => s.completionRate === 100).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl">
            <GraduationCap className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Academia Nautilus AI
              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500">
                <Sparkles className="h-3 w-3 mr-1" />
                Adaptativo
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Trilhas Personalizadas • Simulador Imersivo • Tutor IA 24/7
            </p>
          </div>
        </div>
        <Button>
          <Zap className="h-4 w-4 mr-2" />
          Gerar Trilha IA
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progresso Geral</p>
                  <p className="text-2xl font-bold text-blue-500">{totalProgress.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">{learningPaths.length} trilhas ativas</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className={`bg-gradient-to-br ${criticalGaps > 0 ? "from-orange-500/10 to-orange-500/5 border-orange-500/20" : "from-green-500/10 to-green-500/5 border-green-500/20"}`}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gaps Críticos</p>
                  <p className={`text-2xl font-bold ${criticalGaps > 0 ? "text-orange-500" : "text-green-500"}`}>{criticalGaps}</p>
                  <p className="text-xs text-muted-foreground mt-1">{criticalGaps > 0 ? "Requer atenção" : "Excelente!"}</p>
                </div>
                <Target className={`h-8 w-8 ${criticalGaps > 0 ? "text-orange-500" : "text-green-500"} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Simulações</p>
                  <p className="text-2xl font-bold text-purple-500">{simulations.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">{completedSimulations} completas</p>
                </div>
                <Gamepad2 className="h-8 w-8 text-purple-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Certificações</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {learningPaths.reduce((acc, lp) => acc + lp.certifications.length, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Em progresso</p>
                </div>
                <Award className="h-8 w-8 text-yellow-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="paths">
            <BookOpen className="h-4 w-4 mr-2" />
            Trilhas
          </TabsTrigger>
          <TabsTrigger value="gaps">
            <Target className="h-4 w-4 mr-2" />
            Gap Analysis
          </TabsTrigger>
          <TabsTrigger value="simulations">
            <Gamepad2 className="h-4 w-4 mr-2" />
            Simulações
          </TabsTrigger>
          <TabsTrigger value="tutor">
            <Brain className="h-4 w-4 mr-2" />
            Tutor IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Paths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Trilhas em Andamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {learningPaths.filter(lp => lp.completedModules < lp.modules).slice(0, 3).map((path) => (
                  <div key={path.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{path.title}</h3>
                        {path.aiGenerated && (
                          <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-500">
                            <Brain className="h-2 w-2 mr-1" />
                            IA
                          </Badge>
                        )}
                      </div>
                      <Badge variant={path.priority === "high" ? "destructive" : "secondary"}>
                        {path.priority}
                      </Badge>
                    </div>
                    <Progress value={(path.completedModules / path.modules) * 100} className="h-2 mb-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{path.completedModules}/{path.modules} módulos</span>
                      <span>Prazo: {path.dueDate}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Priority Gaps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Gaps Prioritários
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {competencyGaps.filter(g => g.urgency === "critical" || g.urgency === "high").map((gap) => (
                  <div key={gap.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">{gap.skill}</h3>
                      <span className={`text-sm font-bold ${getUrgencyColor(gap.urgency)}`}>
                        Gap: {gap.gap}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">Atual: {gap.currentLevel}%</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${gap.currentLevel}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">Meta: {gap.requiredLevel}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{gap.recommendation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="paths" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningPaths.map((path) => (
              <Card key={path.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {path.aiGenerated && (
                        <Badge className="bg-purple-500">
                          <Brain className="h-3 w-3 mr-1" />
                          IA
                        </Badge>
                      )}
                      <Badge variant={path.priority === "high" ? "destructive" : path.priority === "medium" ? "secondary" : "outline"}>
                        {path.priority}
                      </Badge>
                    </div>
                    <Badge variant="outline">{path.estimatedHours}h</Badge>
                  </div>
                  <h3 className="font-semibold mb-1">{path.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{path.description}</p>
                  <div className="flex gap-1 flex-wrap mb-3">
                    {path.certifications.map(cert => (
                      <Badge key={cert} variant="secondary" className="text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                  <Progress value={(path.completedModules / path.modules) * 100} className="h-2 mb-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{path.completedModules}/{path.modules} módulos</span>
                    <Button size="sm">
                      <Play className="h-3 w-3 mr-1" />
                      Continuar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Análise de Competências IA
              </CardTitle>
              <CardDescription>Machine Learning identifica gaps e sugere planos de desenvolvimento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {competencyGaps.map((gap) => (
                <motion.div
                  key={gap.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 border rounded-lg ${gap.urgency === "critical" ? "border-red-500/50 bg-red-500/5" : gap.urgency === "high" ? "border-orange-500/50 bg-orange-500/5" : "border-yellow-500/50 bg-yellow-500/5"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={gap.urgency === "critical" ? "destructive" : gap.urgency === "high" ? "default" : "secondary"}>
                          {gap.urgency.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-bold">Gap: {gap.gap}%</span>
                      </div>
                      <h3 className="font-semibold">{gap.skill}</h3>
                      <div className="flex items-center gap-4 mt-2 mb-3">
                        <div>
                          <span className="text-xs text-muted-foreground">Atual</span>
                          <p className="font-bold text-lg">{gap.currentLevel}%</p>
                        </div>
                        <div className="flex-1">
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${gap.currentLevel}%` }} />
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground">Meta</span>
                          <p className="font-bold text-lg text-primary">{gap.requiredLevel}%</p>
                        </div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="font-medium">Recomendação IA:</span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">{gap.recommendation}</p>
                        <p className="text-xs text-primary mt-2">Trilha sugerida: {gap.trainingPath}</p>
                      </div>
                    </div>
                    <Button size="sm" className="ml-4">
                      <Play className="h-3 w-3 mr-1" />
                      Iniciar
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {simulations.map((sim) => (
              <Card key={sim.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getDifficultyColor(sim.difficulty)}>
                      {sim.difficulty}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{sim.duration} min</span>
                  </div>
                  <h3 className="font-semibold mb-2">{sim.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{sim.description}</p>
                  <div className="flex gap-1 flex-wrap mb-3">
                    {sim.skills.map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{sim.completionRate}% conclusão</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{sim.avgScore} pts</span>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Gamepad2 className="h-4 w-4 mr-2" />
                    Iniciar Simulação
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tutor" className="space-y-4">
          <Card className="h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Tutor IA 24/7
              </CardTitle>
              <CardDescription>Especialista em certificações marítimas, STCW, DP e regulamentações</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Olá! Sou seu Tutor IA especializado em treinamentos marítimos.</p>
                      <p className="text-sm mt-2">Pergunte sobre certificações, trilhas de aprendizado, regulamentações ou qualquer dúvida técnica.</p>
                      <div className="flex flex-wrap gap-2 justify-center mt-4">
                        {["Como renovar STCW?", "Requisitos DP Advanced", "Próximos vencimentos"].map(q => (
                          <Button key={q} size="sm" variant="outline" onClick={() => setChatInput(q)}>
                            {q}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">{msg.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="animate-bounce">●</div>
                          <div className="animate-bounce" style={{ animationDelay: "0.1s" }}>●</div>
                          <div className="animate-bounce" style={{ animationDelay: "0.2s" }}>●</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-2 mt-4">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Pergunte sobre treinamentos, certificações..."
                  onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                  disabled={isLoading}
                />
                <Button onClick={sendChatMessage} disabled={isLoading || !chatInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdvancedTrainingAI;
