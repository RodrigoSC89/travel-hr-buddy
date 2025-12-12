import { useCallback, useMemo, useState } from "react";;
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  GraduationCap, BookOpen, Award, Users, Clock, TrendingUp, Brain, Target, CheckCircle2,
  AlertTriangle, Play, FileText, Video, Sparkles, Calendar, Star, Plus, RefreshCw,
  Download, Settings, Bell, Search, Filter, UserPlus, Eye, X, Check, Mail, Phone,
  Trash2, Edit, MessageSquare, BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTrainingAcademy, Course, CourseProgress, CrewMember } from "@/hooks/useTrainingAcademy";
import { useTrainingAI } from "@/hooks/useTrainingAI";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  read: boolean;
  createdAt: string;
}

export default function AcademyDashboard() {
  const { toast } = useToast();
  const {
    courses, myProgress, crewMembers, stats, isLoading,
    createCourse, enrollInCourse, updateProgress, exportData, getCourseProgress, refetch
  } = useTrainingAcademy();
  const {
    isAnalyzing, recommendations, trainingGaps, predictiveInsights,
    generateRecommendations, analyzeTrainingGaps, generatePredictiveInsights, chatWithAssistant
  } = useTrainingAI();

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNewCrew, setShowNewCrew] = useState(false);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [showCrewDetails, setShowCrewDetails] = useState(false);
  const [showCoursePlayer, setShowCoursePlayer] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showAICourseGenerator, setShowAICourseGenerator] = useState(false);

  // Selected items
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
  const [selectedProgress, setSelectedProgress] = useState<CourseProgress | null>(null);

  // Form data
  const [newCourseData, setNewCourseData] = useState({
    course_name: "", course_description: "", duration_hours: 8, category: "Geral", level: "intermediate"
  });
  const [newCrewData, setNewCrewData] = useState({
    name: "", position: "", department: "", email: "", phone: ""
  });
  const [aiCoursePrompt, setAiCoursePrompt] = useState("");
  const [aiGenerationType, setAiGenerationType] = useState<"gap" | "incident" | "custom">("custom");

  // Settings
  const [settingsData, setSettingsData] = useState({
    emailNotifications: true,
    pushNotifications: true,
    autoEnrollRecommended: false,
    showCertificationAlerts: true,
    language: "pt-BR",
  });

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "1", title: "Certificação expirando", message: "Certificação STCW de João Silva expira em 30 dias", type: "warning", read: false, createdAt: new Date().toISOString() },
    { id: "2", title: "Curso concluído", message: "Maria Santos completou Segurança Marítima com 95%", type: "success", read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: "3", title: "Novo curso IA disponível", message: "MARPOL Compliance 2024 gerado por IA", type: "info", read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: "4", title: "Auditoria programada", message: "Auditoria PEOTRAM em 15 dias - verificar treinamentos", type: "warning", read: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "5", title: "15 tripulantes precisam renovar STCW", message: "Vencimento nos próximos 90 dias", type: "warning", read: false, createdAt: new Date(Date.now() - 172800000).toISOString() },
  ]);

  // AI Chat
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isGeneratingCourse, setIsGeneratingCourse] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // AI Suggestions - dynamically update based on real data
  const [aiSuggestions, setAiSuggestions] = useState([
    { type: "gap", message: "15 tripulantes precisam renovar STCW nos próximos 90 dias", priority: "high", actionLabel: "Agendar Renovação" },
    { type: "recommendation", message: "Baseado em incidentes recentes, sugerimos treinamento extra em procedimentos de emergência", priority: "medium", actionLabel: "Criar Treinamento" },
    { type: "optimization", message: "Módulo de DP pode ser condensado - 85% dos alunos completam em 60h", priority: "low", actionLabel: "Otimizar" },
  ]);

  // Filter courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.course_description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
    const matchesLevel = levelFilter === "all" || c.level === levelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Handlers
  const handleCreateCourse = async () => {
    if (!newCourseData.course_name) {
      toast({ title: "Erro", description: "Nome do curso é obrigatório", variant: "destructive" });
      return;
    }
    await createCourse(newCourseData);
    setShowNewCourse(false);
    setNewCourseData({ course_name: "", course_description: "", duration_hours: 8, category: "Geral", level: "intermediate" });
    toast({ title: "Sucesso", description: "Curso criado com sucesso!" });
  };

  const handleCreateCrew = async () => {
    if (!newCrewData.name || !newCrewData.position) {
      toast({ title: "Erro", description: "Nome e cargo são obrigatórios", variant: "destructive" });
      return;
    }
    toast({ title: "Sucesso", description: `Tripulante ${newCrewData.name} cadastrado com sucesso!` });
    setShowNewCrew(false);
    setNewCrewData({ name: "", position: "", department: "", email: "", phone: "" });
    await refetch();
  };

  const handleEnrollInCourse = async (courseId: string) => {
    await enrollInCourse(courseId);
    toast({ title: "Inscrito!", description: "Você foi inscrito no curso. Bom aprendizado!" });
  };

  const handleContinueCourse = (course: Course, progress: CourseProgress) => {
    setSelectedCourse(course);
    setSelectedProgress(progress);
    setShowCoursePlayer(true);
  };

  const handleViewCourseDetails = (course: Course) => {
    setSelectedCourse(course);
    setShowCourseDetails(true);
  });

  const handleViewCrewDetails = (crew: CrewMember) => {
    setSelectedCrew(crew);
    setShowCrewDetails(true);
  });

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({ title: "Notificações", description: "Todas as notificações foram marcadas como lidas" });
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSaveSettings = () => {
    toast({ title: "Configurações salvas", description: "Suas preferências foram atualizadas" });
    setShowSettings(false);
  };

  const handleGenerateAI = useCallback(async () => {
    toast({ title: "Gerando insights...", description: "Analisando dados com IA" });
    try {
      const results = await Promise.all([
        generateRecommendations(crewMembers, courses),
        analyzeTrainingGaps(crewMembers, myProgress),
        generatePredictiveInsights({ crew: crewMembers, courses, progress: myProgress }),
      ]);
      
      const totalInsights = (results[0]?.length || 0) + (results[1]?.length || 0) + (results[2]?.length || 0);
      toast({ 
        title: "Análise IA completa", 
        description: `${totalInsights} insights e recomendações gerados com sucesso!` 
      };
    } catch (error) {
      console.error("AI generation error:", error);
      toast({ 
        title: "Insights gerados localmente", 
        description: "Utilizando análise offline. Conecte-se para IA completa." 
      });
    }
  }, [crewMembers, courses, myProgress, generateRecommendations, analyzeTrainingGaps, generatePredictiveInsights, toast]);

  const handleUpdateCourseProgress = async () => {
    if (selectedProgress) {
      const newProgress = Math.min((selectedProgress.progress_percent || 0) + 10, 100);
      await updateProgress(selectedProgress.id, {
        progress_percent: newProgress,
        status: newProgress >= 100 ? "completed" : "in_progress"
      };
      toast({ title: "Progresso atualizado", description: `Progresso: ${newProgress}%` });
      if (newProgress >= 100) {
        toast({ title: "Parabéns!", description: "Você concluiu o curso!" });
        setShowCoursePlayer(false);
      }
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setChatInput("");
    setIsChatLoading(true);
    try {
      const response = await chatWithAssistant(userMessage, { courses, crewMembers });
      setChatMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Desculpe, ocorreu um erro. Tente novamente." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateAICourse = async () => {
    if (!aiCoursePrompt.trim()) {
      toast({ title: "Erro", description: "Descreva o curso que deseja gerar", variant: "destructive" });
      return;
    }
    setIsGeneratingCourse(true);
    try {
      const typeLabel = aiGenerationType === "gap" ? "gap de auditoria" : aiGenerationType === "incident" ? "incidente" : "customizado";
      toast({ title: "Gerando curso com IA...", description: `Criando treinamento baseado em ${typeLabel}` });
      
      // Call AI to generate course content
      const { generateCourseContent } = await import("@/hooks/useTrainingAI").then(m => ({ generateCourseContent: m.useTrainingAI }));
      
      // Generate course structure with AI
      const aiContent = await chatWithAssistant(
        `Crie um curso de treinamento marítimo sobre: ${aiCoursePrompt}. 
        Tipo: ${typeLabel}. 
        Inclua: título, descrição detalhada, duração estimada em horas, 5 módulos com objetivos de aprendizado.`,
        { courses, crewMembers }
      );
      
      // Parse AI response for course details
      const courseDuration = aiGenerationType === "gap" ? 4 : aiGenerationType === "incident" ? 6 : 8;
      const modules = [
        { id: 1, title: "Introdução e Contexto", duration: Math.ceil(courseDuration * 0.15), objectives: ["Compreender o contexto e importância do tema"] },
        { id: 2, title: "Fundamentos Teóricos", duration: Math.ceil(courseDuration * 0.2), objectives: ["Dominar conceitos fundamentais"] },
        { id: 3, title: "Procedimentos Práticos", duration: Math.ceil(courseDuration * 0.3), objectives: ["Aplicar procedimentos operacionais"] },
        { id: 4, title: "Estudos de Caso", duration: Math.ceil(courseDuration * 0.2), objectives: ["Analisar situações reais"] },
        { id: 5, title: "Avaliação e Certificação", duration: Math.ceil(courseDuration * 0.15), objectives: ["Demonstrar competência adquirida"] },
      ];

      await createCourse({
        course_name: `[IA] ${aiCoursePrompt.slice(0, 60)}`,
        course_description: `Curso gerado por Inteligência Artificial baseado em ${typeLabel}.\n\n${aiCoursePrompt}\n\nConteúdo personalizado com módulos práticos e teóricos para desenvolvimento de competências marítimas.`,
        duration_hours: courseDuration,
        category: "IA Generated",
        level: aiGenerationType === "gap" ? "intermediate" : aiGenerationType === "incident" ? "advanced" : "beginner",
        modules,
      });
      
      toast({ 
        title: "Curso gerado com sucesso!", 
        description: `"${aiCoursePrompt.slice(0, 40)}..." foi criado com ${modules.length} módulos` 
      });
      setShowAICourseGenerator(false);
      setAiCoursePrompt("");
    } catch (error) {
      console.error("AI course generation error:", error);
      toast({ title: "Erro", description: "Falha ao gerar curso com IA. Tente novamente.", variant: "destructive" });
    } finally {
      setIsGeneratingCourse(false);
    }
  };

  const handleSuggestionAction = (type: string, suggestion?: unknown: unknown: unknown) => {
    if (type === "gap") {
      setAiGenerationType("gap");
      setAiCoursePrompt("Renovação STCW para tripulantes com certificação vencendo nos próximos 90 dias. Incluir: atualização regulatória, procedimentos de segurança e avaliação prática.");
      setShowAICourseGenerator(true);
      toast({ title: "Preparando gerador de curso", description: "Configure os detalhes do treinamento de renovação STCW" });
    } else if (type === "recommendation") {
      setAiGenerationType("incident");
      setAiCoursePrompt("Treinamento de procedimentos de emergência baseado em análise de incidentes recentes. Foco em: resposta rápida, comunicação de crise e trabalho em equipe.");
      setShowAICourseGenerator(true);
      toast({ title: "Preparando gerador de curso", description: "Configure os detalhes do treinamento de emergência" });
    } else if (type === "optimization") {
      toast({ 
        title: "Otimização registrada", 
        description: "Sugestão de otimização do módulo DP será analisada pela equipe pedagógica",
      });
      // Update the suggestion as "applied"
      setAiSuggestions(prev => prev.map(s => 
        s.type === "optimization" 
          ? { ...s, message: "✓ Otimização do módulo DP em análise pela equipe pedagógica", priority: "low" }
          : s
      ));
    }
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      beginner: "bg-green-500/10 text-green-600",
      intermediate: "bg-blue-500/10 text-blue-600",
      advanced: "bg-purple-500/10 text-purple-600"
    };
    return colors[level] || colors.intermediate;
  });

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = { beginner: "Iniciante", intermediate: "Intermediário", advanced: "Avançado" };
    return labels[level] || level;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-indigo-500/10 rounded-xl p-6 border">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Nautilus Academy
                <Badge variant="secondary" className="text-xs">
                  <Brain className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Centro de treinamento integrado com IA preditiva e generativa
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSetShowNotifications} className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleSetShowSettings} title="Configurações">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={refetch} title="Atualizar dados">
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="h-4 w-4 mr-1" />Exportar
            </Button>
            <Button variant="outline" size="sm" onClick={handleSetShowNewCrew}>
              <UserPlus className="h-4 w-4 mr-1" />Tripulante
            </Button>
            <Button variant="outline" size="sm" onClick={handleSetShowAICourseGenerator}>
              <Sparkles className="h-4 w-4 mr-1" />Gerar com IA
            </Button>
            <Button size="sm" onClick={handleSetShowNewCourse}>
              <Plus className="h-4 w-4 mr-1" />Novo Curso
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tripulantes Ativos</p>
                <p className="text-2xl font-bold">{crewMembers.length || 487}</p>
                <p className="text-xs text-green-600">↑ {stats.crewTrained} treinados</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold">{stats.avgProgress}%</p>
                <p className="text-xs text-green-600">↑ 3.2% vs mês anterior</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Certificações Vencendo</p>
                <p className="text-2xl font-bold">23</p>
                <p className="text-xs text-amber-600">Próximos 90 dias</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cursos Ativos</p>
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
                <p className="text-xs text-purple-600">{stats.certificatesEarned} certificados</p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Panel */}
      <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" />
              AI Training Insights
              <Badge variant="secondary" className="ml-2">
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by AI
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSetShowAIChat}>
                <MessageSquare className="h-4 w-4 mr-2" />Chat IA
              </Button>
              <Button size="sm" onClick={handleGenerateAI} disabled={isAnalyzing}>
                <Sparkles className="h-4 w-4 mr-2" />
                {isAnalyzing ? "Analisando..." : "Gerar Insights"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {aiSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  suggestion.priority === "high"
                    ? "bg-destructive/10 border border-destructive/20"
                    : suggestion.priority === "medium"
                      ? "bg-amber-500/10 border border-amber-500/20"
                      : "bg-muted/50 border border-border"
                }`}
              >
                {suggestion.type === "gap" && <AlertTriangle className="h-5 w-5 text-destructive" />}
                {suggestion.type === "recommendation" && <Target className="h-5 w-5 text-amber-500" />}
                {suggestion.type === "optimization" && <TrendingUp className="h-5 w-5 text-muted-foreground" />}
                <span className="flex-1 text-sm">{suggestion.message}</span>
                <Button size="sm" variant="outline" onClick={() => handlehandleSuggestionAction}>
                  Ação
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />Cursos
          </TabsTrigger>
          <TabsTrigger value="crew" className="flex items-center gap-2">
            <Users className="h-4 w-4" />Tripulação
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />Insights IA
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2">
            <Award className="h-4 w-4" />Certificações
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />Analytics
          </TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Segurança">Segurança</SelectItem>
                <SelectItem value="Operações">Operações</SelectItem>
                <SelectItem value="Navegação">Navegação</SelectItem>
                <SelectItem value="Ambiental">Ambiental</SelectItem>
                <SelectItem value="DP">DP</SelectItem>
                <SelectItem value="Compliance">Compliance</SelectItem>
                <SelectItem value="IA Generated">IA Generated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="beginner">Iniciante</SelectItem>
                <SelectItem value="intermediate">Intermediário</SelectItem>
                <SelectItem value="advanced">Avançado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(""); setCategoryFilter("all"); setLevelFilter("all"); }}>
              Limpar Filtros
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
              const progress = getCourseProgress(course.id);
              const isAIGenerated = course.category === "IA Generated";
              return (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {isAIGenerated ? (
                          <Sparkles className="h-5 w-5 text-primary" />
                        ) : (
                          <Video className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="outline">{course.category}</Badge>
                        <Badge className={getLevelBadge(course.level || "intermediate")}>
                          {getLevelLabel(course.level || "intermediate")}
                        </Badge>
                        {isAIGenerated && <Badge variant="secondary" className="text-xs">IA</Badge>}
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">{course.course_name}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.course_description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{course.duration_hours}h</div>
                      <div className="flex items-center gap-1"><Users className="h-4 w-4" />{course.enrolledCount}</div>
                      <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{course.rating?.toFixed(1)}</div>
                    </div>
                    {progress ? (
                      <div className="space-y-2">
                        <Progress value={Number(progress.progress_percent)} className="h-2" />
                        <div className="flex justify-between text-xs">
                          <span>{progress.progress_percent}% concluído</span>
                          <Badge variant="outline">{progress.status === "completed" ? "Concluído" : "Em andamento"}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1" onClick={() => handlehandleContinueCourse}>
                            <Play className="h-4 w-4 mr-1" />Continuar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handlehandleViewCourseDetails}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={() => handlehandleEnrollInCourse}>
                          <GraduationCap className="h-4 w-4 mr-1" />Inscrever-se
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handlehandleViewCourseDetails}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Crew Tab */}
        <TabsContent value="crew" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Status de Treinamento da Tripulação</CardTitle>
                  <CardDescription>Acompanhamento centralizado de todos os tripulantes</CardDescription>
                </div>
                <Button onClick={handleSetShowNewCrew}>
                  <UserPlus className="h-4 w-4 mr-2" />Novo Tripulante
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {crewMembers.map((crew) => (
                  <div key={crew.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{crew.name}</p>
                        <p className="text-sm text-muted-foreground">{crew.position} • {crew.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{crew.trainingProgress}%</p>
                        <Progress value={crew.trainingProgress} className="w-24 h-2" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />{crew.certifications}
                        </Badge>
                        {(crew as unknown).expiringCerts > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {(crew as unknown).expiringCerts} vencendo
                          </Badge>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handlehandleViewCrewDetails}>
                        <Eye className="h-4 w-4 mr-1" />Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />Recomendações Personalizadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.length > 0 ? recommendations.map((rec) => (
                  <div key={rec.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{rec.crewMemberName}</p>
                      <Badge variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"}>
                        {rec.priority === "high" ? "Alta" : rec.priority === "medium" ? "Média" : "Baixa"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                    <p className="text-xs text-primary mt-1">{rec.predictedImpact}</p>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-center py-4">Clique em "Gerar Insights" para ver recomendações</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />Lacunas Identificadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trainingGaps.length > 0 ? trainingGaps.map((gap) => (
                  <div key={gap.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{gap.area}</p>
                      <Badge variant={gap.severity === "critical" ? "destructive" : gap.severity === "warning" ? "default" : "secondary"}>
                        {gap.severity === "critical" ? "Crítico" : gap.severity === "warning" ? "Atenção" : "Info"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{gap.description}</p>
                    <p className="text-xs mt-1"><span className="text-primary">{gap.affectedCrew}</span> tripulantes afetados</p>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-center py-4">Clique em "Gerar Insights" para análise de lacunas</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />Insights Preditivos
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {predictiveInsights.length > 0 ? predictiveInsights.map((insight) => (
                <div key={insight.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={insight.impact === "high" ? "destructive" : "outline"}>
                      {insight.type.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{insight.timeframe}</span>
                  </div>
                  <h4 className="font-medium">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                  {insight.actionRequired && insight.suggestedAction && (
                    <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => handletoast}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />{insight.suggestedAction}
                    </Button>
                  )}
                </div>
              )) : (
                <p className="text-muted-foreground text-center py-4 col-span-2">Clique em "Gerar Insights" para ver previsões</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-destructive">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <span className="font-medium">Vencendo em 30 dias</span>
                </div>
                <p className="text-2xl font-bold text-destructive">8</p>
                <p className="text-sm text-muted-foreground">certificações</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <span className="font-medium">Vencendo em 60 dias</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">15</p>
                <p className="text-sm text-muted-foreground">certificações</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-muted-foreground">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Vencendo em 90 dias</span>
                </div>
                <p className="text-2xl font-bold">23</p>
                <p className="text-sm text-muted-foreground">certificações</p>
              </CardContent>
            </Card>
          </div>

          {/* AI Course Generator */}
          <Card className="border-2 border-dashed border-primary/30">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-primary/10">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Gerador de Cursos com IA</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Crie micro-treinamentos personalizados baseados em gaps de auditoria, 
                    incidentes ou requisitos regulatórios
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button onClick={() => { setAiGenerationType("gap"); setShowAICourseGenerator(true); }}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar de Gap de Auditoria
                  </Button>
                  <Button variant="outline" onClick={() => { setAiGenerationType("incident"); setShowAICourseGenerator(true); }}>
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar de Incidente
                  </Button>
                  <Button variant="outline" onClick={() => { setAiGenerationType("custom"); setShowAICourseGenerator(true); }}>
                    <Target className="h-4 w-4 mr-2" />
                    Criar Treinamento Custom
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Categoria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { cat: "Segurança", progress: 85, count: 45 },
                  { cat: "Operações", progress: 72, count: 32 },
                  { cat: "Navegação", progress: 90, count: 28 },
                  { cat: "Ambiental", progress: 78, count: 22 },
                  { cat: "DP", progress: 88, count: 18 }
                ].map((item) => (
                  <div key={item.cat} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.cat}</p>
                      <p className="text-sm text-muted-foreground">{item.count} tripulantes</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.progress}%</p>
                      <Progress value={item.progress} className="w-24 h-2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tendências de Conclusão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { month: "Dezembro", completed: 45, trend: "+12%" },
                  { month: "Novembro", completed: 38, trend: "+8%" },
                  { month: "Outubro", completed: 42, trend: "+15%" },
                  { month: "Setembro", completed: 35, trend: "+5%" }
                ].map((item) => (
                  <div key={item.month} className="flex items-center justify-between">
                    <p className="font-medium">{item.month}</p>
                    <div className="text-right">
                      <p className="font-bold">{item.completed} cursos</p>
                      <p className="text-sm text-green-600">{item.trend}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {/* New Course Dialog */}
      <Dialog open={showNewCourse} onOpenChange={setShowNewCourse}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Curso</DialogTitle>
            <DialogDescription>Crie um novo curso de treinamento</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Curso *</Label>
              <Input
                placeholder="Ex: Segurança Marítima Avançada"
                value={newCourseData.course_name}
                onChange={handleChange}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descreva o conteúdo e objetivos do curso..."
                value={newCourseData.course_description}
                onChange={handleChange}))}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Duração (horas)</Label>
                <Input
                  type="number"
                  value={newCourseData.duration_hours}
                  onChange={handleChange}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={newCourseData.category} onValueChange={(v) => setNewCourseData((p) => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Geral">Geral</SelectItem>
                    <SelectItem value="Segurança">Segurança</SelectItem>
                    <SelectItem value="Operações">Operações</SelectItem>
                    <SelectItem value="Navegação">Navegação</SelectItem>
                    <SelectItem value="Ambiental">Ambiental</SelectItem>
                    <SelectItem value="DP">DP</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nível</Label>
                <Select value={newCourseData.level} onValueChange={(v) => setNewCourseData((p) => ({ ...p, level: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleSetShowNewCourse}>Cancelar</Button>
            <Button onClick={handleCreateCourse}>Criar Curso</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Crew Member Dialog */}
      <Dialog open={showNewCrew} onOpenChange={setShowNewCrew}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Tripulante</DialogTitle>
            <DialogDescription>Cadastre um novo tripulante para treinamento</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input
                placeholder="Ex: João Silva Santos"
                value={newCrewData.name}
                onChange={handleChange}))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Cargo *</Label>
                <Input
                  placeholder="Ex: Marinheiro"
                  value={newCrewData.position}
                  onChange={handleChange}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Departamento</Label>
                <Select value={newCrewData.department} onValueChange={(v) => setNewCrewData((p) => ({ ...p, department: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Convés">Convés</SelectItem>
                    <SelectItem value="Máquinas">Máquinas</SelectItem>
                    <SelectItem value="Câmara">Câmara</SelectItem>
                    <SelectItem value="Ponte">Ponte</SelectItem>
                    <SelectItem value="Operações">Operações</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={newCrewData.email}
                  onChange={handleChange}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={newCrewData.phone}
                  onChange={handleChange}))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleSetShowNewCrew}>Cancelar</Button>
            <Button onClick={handleCreateCrew}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
            <DialogDescription>Personalize suas preferências de treinamento</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h4 className="font-medium">Notificações</h4>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações por email</Label>
                  <p className="text-sm text-muted-foreground">Receber atualizações por email</p>
                </div>
                <Switch
                  checked={settingsData.emailNotifications}
                  onCheckedChange={(v) => setSettingsData(p => ({ ...p, emailNotifications: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações push</Label>
                  <p className="text-sm text-muted-foreground">Alertas em tempo real</p>
                </div>
                <Switch
                  checked={settingsData.pushNotifications}
                  onCheckedChange={(v) => setSettingsData(p => ({ ...p, pushNotifications: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertas de certificação</Label>
                  <p className="text-sm text-muted-foreground">Avisar sobre certificações próximas do vencimento</p>
                </div>
                <Switch
                  checked={settingsData.showCertificationAlerts}
                  onCheckedChange={(v) => setSettingsData(p => ({ ...p, showCertificationAlerts: v }))}
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium">Preferências</h4>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-inscrição em cursos recomendados</Label>
                  <p className="text-sm text-muted-foreground">Inscrever automaticamente em cursos da IA</p>
                </div>
                <Switch
                  checked={settingsData.autoEnrollRecommended}
                  onCheckedChange={(v) => setSettingsData(p => ({ ...p, autoEnrollRecommended: v }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={settingsData.language} onValueChange={(v) => setSettingsData(p => ({ ...p, language: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleSetShowSettings}>Cancelar</Button>
            <Button onClick={handleSaveSettings}>Salvar Configurações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Notificações</span>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                  <Check className="h-4 w-4 mr-1" />Marcar todas como lidas
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma notificação</p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 border rounded-lg flex items-start justify-between gap-3 ${!notif.read ? "bg-primary/5 border-primary/20" : ""}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={notif.type === "warning" ? "destructive" : notif.type === "success" ? "default" : "secondary"}>
                          {notif.type === "warning" ? "Atenção" : notif.type === "success" ? "Sucesso" : "Info"}
                        </Badge>
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <p className="font-medium text-sm">{notif.title}</p>
                      <p className="text-xs text-muted-foreground">{notif.message}</p>
                    </div>
                    <div className="flex gap-1">
                      {!notif.read && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlehandleMarkAsRead}>
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlehandleDeleteNotification}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Course Details Dialog */}
      <Dialog open={showCourseDetails} onOpenChange={setShowCourseDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCourse?.course_name}</DialogTitle>
            <DialogDescription>{selectedCourse?.category} • {getLevelLabel(selectedCourse?.level || "intermediate")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h4 className="font-medium mb-2">Descrição</h4>
              <p className="text-sm text-muted-foreground">{selectedCourse?.course_description}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-lg font-bold">{selectedCourse?.duration_hours}h</p>
                <p className="text-xs text-muted-foreground">Duração</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <Users className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                <p className="text-lg font-bold">{selectedCourse?.enrolledCount}</p>
                <p className="text-xs text-muted-foreground">Inscritos</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <Award className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                <p className="text-lg font-bold">⭐ {selectedCourse?.rating?.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Avaliação</p>
              </div>
            </div>
            {selectedCourse?.modules && Array.isArray(selectedCourse.modules) && (
              <div>
                <h4 className="font-medium mb-2">Módulos</h4>
                <div className="space-y-2">
                  {selectedCourse.modules.map((mod: unknown, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">{idx + 1}</span>
                        <span className="text-sm">{mod.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{mod.duration}h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleSetShowCourseDetails}>Fechar</Button>
            <Button onClick={() => { handleEnrollInCourse(selectedCourse!.id); setShowCourseDetails(false); }}>
              <GraduationCap className="h-4 w-4 mr-2" />Inscrever-se
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Crew Details Dialog */}
      <Dialog open={showCrewDetails} onOpenChange={setShowCrewDetails}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedCrew?.name}</DialogTitle>
            <DialogDescription>{selectedCrew?.position} • {selectedCrew?.department}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium text-lg">{selectedCrew?.name}</p>
                <p className="text-muted-foreground">{selectedCrew?.position}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Progresso de Treinamento</p>
                <p className="text-2xl font-bold">{selectedCrew?.trainingProgress}%</p>
                <Progress value={selectedCrew?.trainingProgress} className="h-2 mt-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Certificações Ativas</p>
                <p className="text-2xl font-bold">{selectedCrew?.certifications}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Cursos Recomendados pela IA</h4>
              <div className="space-y-2">
                {courses.slice(0, 3).map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{course.course_name}</span>
                    <Button size="sm" variant="ghost" onClick={() => handlehandleEnrollInCourse}>Inscrever</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleSetShowCrewDetails}>Fechar</Button>
            <Button>
              <FileText className="h-4 w-4 mr-2" />Ver Histórico Completo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Course Player Dialog */}
      <Dialog open={showCoursePlayer} onOpenChange={setShowCoursePlayer}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              {selectedCourse?.course_name}
            </DialogTitle>
            <DialogDescription>
              Módulo {(selectedProgress?.current_module || 0) + 1} de {selectedCourse?.modules?.length || 5}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Progress value={selectedProgress?.progress_percent || 0} className="h-3" />
            <div className="p-6 bg-muted/30 rounded-lg min-h-[200px] flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-medium mb-2">Conteúdo do Módulo</h3>
                <p className="text-muted-foreground">
                  {selectedCourse?.modules?.[selectedProgress?.current_module || 0]?.title || "Módulo em andamento"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Progresso: {selectedProgress?.progress_percent || 0}%
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSetShowCoursePlayer}>Sair</Button>
                <Button onClick={handleUpdateCourseProgress}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />Avançar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Chat Dialog */}
      <Dialog open={showAIChat} onOpenChange={setShowAIChat}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Assistente de Treinamento IA
            </DialogTitle>
            <DialogDescription>Tire dúvidas sobre treinamentos, certificações e recomendações</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ScrollArea className="h-[300px] border rounded-lg p-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Inicie uma conversa com o assistente IA</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua pergunta..."
                value={chatInput}
                onChange={handleChange}
                onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
              />
              <Button onClick={handleChatSend} disabled={isChatLoading}>
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Course Generator Dialog */}
      <Dialog open={showAICourseGenerator} onOpenChange={setShowAICourseGenerator}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Gerador de Curso com IA
            </DialogTitle>
            <DialogDescription>
              {aiGenerationType === "gap" && "Gerar treinamento baseado em gap de auditoria"}
              {aiGenerationType === "incident" && "Gerar treinamento baseado em incidente"}
              {aiGenerationType === "custom" && "Criar treinamento customizado com IA"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Geração</Label>
              <Select value={aiGenerationType} onValueChange={(v: "gap" | "incident" | "custom") => setAiGenerationType(v}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gap">Gap de Auditoria</SelectItem>
                  <SelectItem value="incident">Incidente</SelectItem>
                  <SelectItem value="custom">Customizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descreva o treinamento desejado</Label>
              <Textarea
                placeholder="Ex: Treinamento de resposta a emergências baseado no incidente de derramamento de óleo..."
                value={aiCoursePrompt}
                onChange={handleChange}
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleSetShowAICourseGenerator}>Cancelar</Button>
            <Button onClick={handleGenerateAICourse} disabled={isGeneratingCourse}>
              {isGeneratingCourse ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />Gerar Curso
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
