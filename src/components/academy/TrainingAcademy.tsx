import React, { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, Award, Clock, Users, TrendingUp, Brain, Plus, RefreshCw, Download, Settings, 
  Bell, Search, Filter, GraduationCap, Target, AlertTriangle, CheckCircle, Play, Sparkles,
  UserPlus, Eye, X, Check, Mail, Phone, Calendar, FileText, Trash2, Edit, MessageSquare
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

export default function TrainingAcademy() {
  const { toast } = useToast();
  const { 
    courses, myProgress, crewMembers, stats, isLoading, 
    createCourse, enrollInCourse, updateProgress, exportData, getCourseProgress, refetch 
  } = useTrainingAcademy();
  const { 
    isAnalyzing, isGenerating, recommendations, trainingGaps, predictiveInsights, 
    generateRecommendations, analyzeTrainingGaps, generatePredictiveInsights, 
    generateCourseContent, chatWithAssistant 
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
  
  // Settings
  const [settingsData, setSettingsData] = useState({
    emailNotifications: true,
    pushNotifications: true,
    autoEnrollRecommended: false,
    showCertificationAlerts: true,
    language: "pt-BR",
    darkMode: false,
  });
  
  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "1", title: "Certificação expirando", message: "Certificação STCW de João Silva expira em 30 dias", type: "warning", read: false, createdAt: new Date().toISOString() },
    { id: "2", title: "Curso concluído", message: "Maria Santos completou Segurança Marítima com 95%", type: "success", read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: "3", title: "Novo curso disponível", message: "Navegação Eletrônica Avançada agora disponível", type: "info", read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: "4", title: "Auditoria programada", message: "Auditoria PEOTRAM em 15 dias - verificar treinamentos", type: "warning", read: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "5", title: "Meta atingida", message: "Equipe de Convés atingiu 100% de conformidade", type: "success", read: false, createdAt: new Date(Date.now() - 172800000).toISOString() },
  ]);
  
  // AI Chat
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

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
    // In a real app, this would call an API
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
  };

  const handleViewCrewDetails = (crew: CrewMember) => {
    setSelectedCrew(crew);
    setShowCrewDetails(true);
  };

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
    await Promise.all([
      generateRecommendations(crewMembers, courses),
      analyzeTrainingGaps(crewMembers, myProgress),
      generatePredictiveInsights({ crew: crewMembers, courses, progress: myProgress }),
    ]);
    toast({ title: "Análise IA completa", description: "Insights e recomendações gerados com sucesso!" });
  }, [crewMembers, courses, myProgress, generateRecommendations, analyzeTrainingGaps, generatePredictiveInsights, toast]);

  const handleUpdateCourseProgress = async () => {
    if (selectedProgress) {
      const newProgress = Math.min((selectedProgress.progress_percent || 0) + 10, 100);
      await updateProgress(selectedProgress.id, { 
        progress_percent: newProgress,
        status: newProgress >= 100 ? "completed" : "in_progress"
      });
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
    } catch (err) {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Desculpe, ocorreu um erro. Tente novamente." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = { 
      beginner: "bg-green-500/10 text-green-600", 
      intermediate: "bg-blue-500/10 text-blue-600", 
      advanced: "bg-purple-500/10 text-purple-600" 
    };
    return colors[level] || colors.intermediate;
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = { beginner: "Iniciante", intermediate: "Intermediário", advanced: "Avançado" };
    return labels[level] || level;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Academia de Treinamento</h1>
          <p className="text-muted-foreground">Gestão centralizada de treinamentos com IA preditiva e generativa</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setShowNotifications(true)} className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                {unreadCount}
              </Badge>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-1" />Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowNewCrew(true)}>
            <UserPlus className="h-4 w-4 mr-1" />Tripulante
          </Button>
          <Button size="sm" onClick={() => setShowNewCourse(true)}>
            <Plus className="h-4 w-4 mr-1" />Novo Curso
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Cursos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats.totalCourses}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tripulantes Treinados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{stats.crewTrained}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Certificados Emitidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{stats.certificatesEarned}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Progresso Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{stats.avgProgress}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">IA Preditiva e Generativa</h3>
                <p className="text-sm text-muted-foreground">Análise inteligente de competências, recomendações personalizadas e geração de conteúdo</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAIChat(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />Chat IA
              </Button>
              <Button onClick={handleGenerateAI} disabled={isAnalyzing}>
                <Sparkles className="h-4 w-4 mr-2" />
                {isAnalyzing ? "Analisando..." : "Gerar Insights IA"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="crew">Tripulação</TabsTrigger>
          <TabsTrigger value="ai-insights">Insights IA</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar cursos..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
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
              return (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <BookOpen className="h-8 w-8 text-primary" />
                      <div className="flex gap-1">
                        <Badge variant="outline">{course.category}</Badge>
                        <Badge className={getLevelBadge(course.level || "intermediate")}>
                          {getLevelLabel(course.level || "intermediate")}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">{course.course_name}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.course_description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{course.duration_hours}h</div>
                      <div className="flex items-center gap-1"><Users className="h-4 w-4" />{course.enrolledCount}</div>
                      <div className="flex items-center gap-1"><Award className="h-4 w-4" />⭐ {course.rating?.toFixed(1)}</div>
                    </div>
                    {progress ? (
                      <div className="space-y-2">
                        <Progress value={Number(progress.progress_percent)} className="h-2" />
                        <div className="flex justify-between text-xs">
                          <span>{progress.progress_percent}% concluído</span>
                          <Badge variant="outline">{progress.status === "completed" ? "Concluído" : "Em andamento"}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1" onClick={() => handleContinueCourse(course, progress)}>
                            <Play className="h-4 w-4 mr-1" />Continuar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleViewCourseDetails(course)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={() => handleEnrollInCourse(course.id)}>
                          <GraduationCap className="h-4 w-4 mr-1" />Inscrever-se
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleViewCourseDetails(course)}>
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
                  <CardTitle>Tripulação e Progresso de Treinamento</CardTitle>
                  <CardDescription>Acompanhamento centralizado de todos os tripulantes</CardDescription>
                </div>
                <Button onClick={() => setShowNewCrew(true)}>
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
                      <Badge variant="outline">{crew.certifications} certificações</Badge>
                      <Button variant="outline" size="sm" onClick={() => handleViewCrewDetails(crew)}>
                        <Eye className="h-4 w-4 mr-1" />Ver Detalhes
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
                  <p className="text-muted-foreground text-center py-4">Clique em "Gerar Insights IA" para ver recomendações</p>
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
                  <p className="text-muted-foreground text-center py-4">Clique em "Gerar Insights IA" para análise de lacunas</p>
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
                    <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => toast({ title: "Ação iniciada", description: insight.suggestedAction })}>
                      <CheckCircle className="h-4 w-4 mr-1" />{insight.suggestedAction}
                    </Button>
                  )}
                </div>
              )) : (
                <p className="text-muted-foreground text-center py-4 col-span-2">Clique em "Gerar Insights IA" para ver previsões</p>
              )}
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
                  { cat: "Ambiental", progress: 78, count: 22 }
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
                onChange={(e) => setNewCourseData((p) => ({ ...p, course_name: e.target.value }))} 
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea 
                placeholder="Descreva o conteúdo e objetivos do curso..." 
                value={newCourseData.course_description} 
                onChange={(e) => setNewCourseData((p) => ({ ...p, course_description: e.target.value }))} 
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Duração (horas)</Label>
                <Input 
                  type="number" 
                  value={newCourseData.duration_hours} 
                  onChange={(e) => setNewCourseData((p) => ({ ...p, duration_hours: Number(e.target.value) }))} 
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
            <Button variant="outline" onClick={() => setShowNewCourse(false)}>Cancelar</Button>
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
                onChange={(e) => setNewCrewData((p) => ({ ...p, name: e.target.value }))} 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Cargo *</Label>
                <Input 
                  placeholder="Ex: Marinheiro" 
                  value={newCrewData.position} 
                  onChange={(e) => setNewCrewData((p) => ({ ...p, position: e.target.value }))} 
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
                  onChange={(e) => setNewCrewData((p) => ({ ...p, email: e.target.value }))} 
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input 
                  placeholder="(00) 00000-0000" 
                  value={newCrewData.phone} 
                  onChange={(e) => setNewCrewData((p) => ({ ...p, phone: e.target.value }))} 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCrew(false)}>Cancelar</Button>
            <Button onClick={handleCreateCrew}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
            <DialogDescription>Personalize suas preferências do módulo</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h4 className="font-medium">Notificações</h4>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">Receber alertas por email</p>
                </div>
                <Switch 
                  checked={settingsData.emailNotifications} 
                  onCheckedChange={(v) => setSettingsData(p => ({ ...p, emailNotifications: v }))} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">Alertas em tempo real</p>
                </div>
                <Switch 
                  checked={settingsData.pushNotifications} 
                  onCheckedChange={(v) => setSettingsData(p => ({ ...p, pushNotifications: v }))} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertas de Certificação</Label>
                  <p className="text-sm text-muted-foreground">Avisos de vencimento</p>
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
            <Button variant="outline" onClick={() => setShowSettings(false)}>Cancelar</Button>
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
                    className={`p-3 border rounded-lg flex items-start justify-between gap-3 ${!notif.read ? 'bg-primary/5 border-primary/20' : ''}`}
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMarkAsRead(notif.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteNotification(notif.id)}>
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
                  {selectedCourse.modules.map((mod: any, idx: number) => (
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
            <Button variant="outline" onClick={() => setShowCourseDetails(false)}>Fechar</Button>
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
                    <Button size="sm" variant="ghost">Inscrever</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCrewDetails(false)}>Fechar</Button>
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
                <Button variant="outline" onClick={() => setShowCoursePlayer(false)}>Sair</Button>
                <Button onClick={handleUpdateCourseProgress}>
                  <CheckCircle className="h-4 w-4 mr-2" />Avançar
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
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
              />
              <Button onClick={handleChatSend} disabled={isChatLoading}>
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
