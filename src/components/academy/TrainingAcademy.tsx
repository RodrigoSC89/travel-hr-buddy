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
import { BookOpen, Award, Clock, Users, TrendingUp, Brain, Plus, RefreshCw, Download, Settings, Bell, Search, Filter, GraduationCap, Target, AlertTriangle, CheckCircle, Play, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTrainingAcademy } from "@/hooks/useTrainingAcademy";
import { useTrainingAI } from "@/hooks/useTrainingAI";

export default function TrainingAcademy() {
  const { toast } = useToast();
  const { courses, myProgress, crewMembers, stats, isLoading, createCourse, enrollInCourse, exportData, getCourseProgress, refetch } = useTrainingAcademy();
  const { isAnalyzing, recommendations, trainingGaps, predictiveInsights, generateRecommendations, analyzeTrainingGaps, generatePredictiveInsights } = useTrainingAI();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [unreadCount, setUnreadCount] = useState(5);
  const [newCourseData, setNewCourseData] = useState({ course_name: "", course_description: "", duration_hours: 8, category: "Geral", level: "intermediate" });

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.course_name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.course_description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
    const matchesLevel = levelFilter === "all" || c.level === levelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleCreateCourse = async () => {
    if (!newCourseData.course_name) {
      toast({ title: "Erro", description: "Nome do curso é obrigatório", variant: "destructive" });
      return;
    }
    await createCourse(newCourseData);
    setShowNewCourse(false);
    setNewCourseData({ course_name: "", course_description: "", duration_hours: 8, category: "Geral", level: "intermediate" });
  };

  const handleGenerateAI = useCallback(async () => {
    await Promise.all([
      generateRecommendations(crewMembers, courses),
      analyzeTrainingGaps(crewMembers, myProgress),
      generatePredictiveInsights({ crew: crewMembers, courses, progress: myProgress }),
    ]);
    toast({ title: "Análise IA completa", description: "Insights e recomendações gerados" });
  }, [crewMembers, courses, myProgress, generateRecommendations, analyzeTrainingGaps, generatePredictiveInsights, toast]);

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = { beginner: "bg-green-500/10 text-green-600", intermediate: "bg-blue-500/10 text-blue-600", advanced: "bg-purple-500/10 text-purple-600" };
    return colors[level] || colors.intermediate;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><RefreshCw className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Academia de Treinamento</h1>
          <p className="text-muted-foreground">Gestão centralizada de treinamentos com IA preditiva e generativa</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setUnreadCount(0); toast({ title: "Notificações lidas" }); }}>
            <Bell className="h-4 w-4 mr-1" />{unreadCount > 0 && <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">{unreadCount}</Badge>}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}><Settings className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={refetch}><RefreshCw className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={exportData}><Download className="h-4 w-4 mr-1" />Exportar</Button>
          <Button size="sm" onClick={() => setShowNewCourse(true)}><Plus className="h-4 w-4 mr-1" />Novo Curso</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total de Cursos</CardTitle></CardHeader><CardContent><div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /><span className="text-2xl font-bold">{stats.totalCourses}</span></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Tripulantes Treinados</CardTitle></CardHeader><CardContent><div className="flex items-center gap-2"><Users className="h-5 w-5 text-blue-500" /><span className="text-2xl font-bold">{stats.crewTrained}</span></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Certificados Emitidos</CardTitle></CardHeader><CardContent><div className="flex items-center gap-2"><Award className="h-5 w-5 text-yellow-500" /><span className="text-2xl font-bold">{stats.certificatesEarned}</span></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Progresso Médio</CardTitle></CardHeader><CardContent><div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-500" /><span className="text-2xl font-bold">{stats.avgProgress}%</span></div></CardContent></Card>
      </div>

      {/* AI Insights Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">IA Preditiva e Generativa</h3>
                <p className="text-sm text-muted-foreground">Análise inteligente de competências, recomendações personalizadas e geração de conteúdo</p>
              </div>
            </div>
            <Button onClick={handleGenerateAI} disabled={isAnalyzing}>
              <Sparkles className="h-4 w-4 mr-2" />{isAnalyzing ? "Analisando..." : "Gerar Insights IA"}
            </Button>
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

        <TabsContent value="courses" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar cursos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="w-[150px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Categoria" /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="Segurança">Segurança</SelectItem><SelectItem value="Operações">Operações</SelectItem><SelectItem value="Navegação">Navegação</SelectItem><SelectItem value="Ambiental">Ambiental</SelectItem></SelectContent></Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Nível" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="beginner">Iniciante</SelectItem><SelectItem value="intermediate">Intermediário</SelectItem><SelectItem value="advanced">Avançado</SelectItem></SelectContent></Select>
            <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(""); setCategoryFilter("all"); setLevelFilter("all"); }}>Limpar</Button>
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
                        <Badge className={getLevelBadge(course.level || "intermediate")}>{course.level}</Badge>
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
                      <div className="space-y-2"><Progress value={Number(progress.progress_percent)} className="h-2" /><div className="flex justify-between text-xs"><span>{progress.progress_percent}% concluído</span><Badge variant="outline">{progress.status}</Badge></div><Button size="sm" className="w-full"><Play className="h-4 w-4 mr-1" />Continuar</Button></div>
                    ) : (
                      <Button size="sm" className="w-full" onClick={() => enrollInCourse(course.id)}><GraduationCap className="h-4 w-4 mr-1" />Inscrever-se</Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="crew" className="space-y-4">
          <Card><CardHeader><CardTitle>Tripulação e Progresso de Treinamento</CardTitle><CardDescription>Acompanhamento centralizado de todos os tripulantes</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {crewMembers.map((crew) => (
                  <div key={crew.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
                      <div><p className="font-medium">{crew.name}</p><p className="text-sm text-muted-foreground">{crew.position} • {crew.department}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right"><p className="text-sm font-medium">{crew.trainingProgress}%</p><Progress value={crew.trainingProgress} className="w-24 h-2" /></div>
                      <Badge variant="outline">{crew.certifications} certificações</Badge>
                      <Button variant="outline" size="sm">Ver Detalhes</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Recomendações Personalizadas</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {recommendations.length > 0 ? recommendations.map((rec) => (
                  <div key={rec.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2"><p className="font-medium">{rec.crewMemberName}</p><Badge variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"}>{rec.priority}</Badge></div>
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                    <p className="text-xs text-primary mt-1">{rec.predictedImpact}</p>
                  </div>
                )) : <p className="text-muted-foreground text-center py-4">Clique em "Gerar Insights IA" para ver recomendações</p>}
              </CardContent>
            </Card>

            <Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Lacunas Identificadas</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {trainingGaps.length > 0 ? trainingGaps.map((gap) => (
                  <div key={gap.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2"><p className="font-medium">{gap.area}</p><Badge variant={gap.severity === "critical" ? "destructive" : gap.severity === "warning" ? "default" : "secondary"}>{gap.severity}</Badge></div>
                    <p className="text-sm text-muted-foreground">{gap.description}</p>
                    <p className="text-xs mt-1"><span className="text-primary">{gap.affectedCrew}</span> tripulantes afetados</p>
                  </div>
                )) : <p className="text-muted-foreground text-center py-4">Clique em "Gerar Insights IA" para análise de lacunas</p>}
              </CardContent>
            </Card>
          </div>

          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />Insights Preditivos</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {predictiveInsights.length > 0 ? predictiveInsights.map((insight) => (
                <div key={insight.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2"><Badge variant={insight.impact === "high" ? "destructive" : "outline"}>{insight.type.replace("_", " ")}</Badge><span className="text-xs text-muted-foreground">{insight.timeframe}</span></div>
                  <h4 className="font-medium">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                  {insight.actionRequired && insight.suggestedAction && <Button size="sm" variant="outline" className="mt-2 w-full"><CheckCircle className="h-4 w-4 mr-1" />{insight.suggestedAction}</Button>}
                </div>
              )) : <p className="text-muted-foreground text-center py-4 col-span-2">Clique em "Gerar Insights IA" para ver previsões</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle>Desempenho por Categoria</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[{ cat: "Segurança", progress: 85, count: 45 }, { cat: "Operações", progress: 72, count: 32 }, { cat: "Navegação", progress: 90, count: 28 }].map((item) => (
                  <div key={item.cat} className="flex items-center justify-between"><div><p className="font-medium">{item.cat}</p><p className="text-sm text-muted-foreground">{item.count} tripulantes</p></div><div className="text-right"><p className="font-bold">{item.progress}%</p><Progress value={item.progress} className="w-24 h-2" /></div></div>
                ))}
              </CardContent>
            </Card>
            <Card><CardHeader><CardTitle>Tendências de Conclusão</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[{ month: "Dezembro", completed: 45, trend: "+12%" }, { month: "Novembro", completed: 38, trend: "+8%" }, { month: "Outubro", completed: 42, trend: "+15%" }].map((item) => (
                  <div key={item.month} className="flex items-center justify-between"><p className="font-medium">{item.month}</p><div className="text-right"><p className="font-bold">{item.completed} cursos</p><p className="text-sm text-green-600">{item.trend}</p></div></div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Course Dialog */}
      <Dialog open={showNewCourse} onOpenChange={setShowNewCourse}>
        <DialogContent><DialogHeader><DialogTitle>Novo Curso</DialogTitle><DialogDescription>Crie um novo curso de treinamento</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Nome do curso" value={newCourseData.course_name} onChange={(e) => setNewCourseData((p) => ({ ...p, course_name: e.target.value }))} />
            <Textarea placeholder="Descrição" value={newCourseData.course_description} onChange={(e) => setNewCourseData((p) => ({ ...p, course_description: e.target.value }))} />
            <div className="grid grid-cols-3 gap-3">
              <Input type="number" placeholder="Horas" value={newCourseData.duration_hours} onChange={(e) => setNewCourseData((p) => ({ ...p, duration_hours: Number(e.target.value) }))} />
              <Select value={newCourseData.category} onValueChange={(v) => setNewCourseData((p) => ({ ...p, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Geral">Geral</SelectItem><SelectItem value="Segurança">Segurança</SelectItem><SelectItem value="Operações">Operações</SelectItem><SelectItem value="Navegação">Navegação</SelectItem></SelectContent></Select>
              <Select value={newCourseData.level} onValueChange={(v) => setNewCourseData((p) => ({ ...p, level: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="beginner">Iniciante</SelectItem><SelectItem value="intermediate">Intermediário</SelectItem><SelectItem value="advanced">Avançado</SelectItem></SelectContent></Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowNewCourse(false)}>Cancelar</Button><Button onClick={handleCreateCourse}>Criar Curso</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent><DialogHeader><DialogTitle>Configurações</DialogTitle></DialogHeader>
          <div className="py-4"><p className="text-muted-foreground">Configurações de notificações e preferências do módulo.</p></div>
          <DialogFooter><Button onClick={() => setShowSettings(false)}>Fechar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
