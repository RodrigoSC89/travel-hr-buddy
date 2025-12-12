import { useMemo, useState } from "react";;;
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, Search, Play, Clock, Award, BookOpen, 
  Video, FileText, Filter, Star, Users, CheckCircle2, 
  Lock, Sparkles, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CBTCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  stcw_reference: string | null;
  duration_minutes: number;
  passing_score: number;
  is_mandatory: boolean;
  applicable_ranks: string[];
  content_type: string;
  thumbnail_url: string | null;
  language: string;
  validity_months: number | null;
  is_active: boolean;
}

interface CBTProgress {
  id: string;
  course_id: string;
  progress_percent: number;
  status: string;
  score: number | null;
  completed_at: string | null;
}

const categoryLabels: Record<string, string> = {
  stcw_mandatory: "STCW Obrigatório",
  stcw_specialized: "STCW Especializado",
  company_specific: "Específico da Empresa",
  safety: "Segurança",
  technical: "Técnico",
  soft_skills: "Soft Skills",
  compliance: "Compliance",
};

const contentTypeIcons: Record<string, typeof Video> = {
  video: Video,
  scorm: BookOpen,
  interactive: Play,
  document: FileText,
  quiz: Award,
};

const statusColors: Record<string, string> = {
  not_started: "bg-muted text-muted-foreground",
  in_progress: "bg-amber-500/20 text-amber-400",
  completed: "bg-emerald-500/20 text-emerald-400",
  failed: "bg-destructive/20 text-destructive",
  expired: "bg-orange-500/20 text-orange-400",
};

export function CBTLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterMandatory, setFilterMandatory] = useState<string>("all");

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["cbt-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cbt_courses")
        .select("*")
        .eq("is_active", true)
        .order("title");
      if (error) throw error;
      return data as CBTCourse[];
    },
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["cbt-progress"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cbt_progress")
        .select("*");
      if (error) throw error;
      return data as CBTProgress[];
    },
  });

  const getCourseProgress = (courseId: string) => {
    return progress.find(p => p.course_id === courseId);
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "all" || course.category === filterCategory;
      const matchesMandatory = filterMandatory === "all" || 
        (filterMandatory === "mandatory" ? course.is_mandatory : !course.is_mandatory);
      return matchesSearch && matchesCategory && matchesMandatory;
    });
  }, [courses, searchQuery, filterCategory, filterMandatory]);

  // Stats
  const stats = {
    total: courses.length,
    mandatory: courses.filter(c => c.is_mandatory).length,
    completed: progress.filter(p => p.status === "completed").length,
    inProgress: progress.filter(p => p.status === "in_progress").length,
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Biblioteca de Cursos CBT
          </h2>
          <p className="text-muted-foreground mt-1">
            Treinamentos computadorizados e certificações STCW
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Sugestões IA
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Curso
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Cursos</p>
                <p className="text-xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Lock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Obrigatórios</p>
                <p className="text-xl font-bold text-amber-400">{stats.mandatory}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Play className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-xl font-bold text-blue-400">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-xl font-bold text-emerald-400">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar cursos..." 
            className="pl-10 bg-muted/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px] bg-muted/30">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterMandatory} onValueChange={setFilterMandatory}>
          <SelectTrigger className="w-[150px] bg-muted/30">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="mandatory">Obrigatórios</SelectItem>
            <SelectItem value="optional">Opcionais</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      {coursesLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando cursos...</div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum curso encontrado</p>
          <Button variant="link" className="mt-2">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Curso
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => {
            const courseProgress = getCourseProgress(course.id);
            const ContentIcon = contentTypeIcons[course.content_type] || BookOpen;

            return (
              <Card 
                key={course.id} 
                className="border-border/50 bg-card/50 hover:border-primary/50 transition-colors cursor-pointer overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <ContentIcon className="h-16 w-16 text-primary/50" />
                  {course.is_mandatory && (
                    <Badge className="absolute top-3 right-3 bg-amber-500/20 text-amber-400 border-amber-500/30">
                      <Lock className="h-3 w-3 mr-1" />
                      Obrigatório
                    </Badge>
                  )}
                  {courseProgress?.status === "completed" && (
                    <div className="absolute top-3 left-3 bg-emerald-500 text-white p-1.5 rounded-full">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {categoryLabels[course.category] || course.category}
                    </Badge>
                    {course.stcw_reference && (
                      <Badge variant="secondary" className="text-xs">
                        {course.stcw_reference}
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  {course.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {course.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(course.duration_minutes)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      {course.passing_score}% para passar
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {courseProgress && courseProgress.status !== "not_started" && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={cn(
                          "font-medium",
                          statusColors[courseProgress.status]?.split(" ")[1]
                        )}>
                          {courseProgress.status === "completed" ? "Concluído" :
                            courseProgress.status === "in_progress" ? "Em Andamento" :
                              courseProgress.status === "failed" ? "Não Aprovado" : "Expirado"}
                        </span>
                        <span className="text-muted-foreground">{courseProgress.progress_percent}%</span>
                      </div>
                      <Progress value={courseProgress.progress_percent} className="h-1.5" />
                      {courseProgress.score && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Nota: {courseProgress.score}%
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <Button 
                    className="w-full gap-2"
                    variant={courseProgress?.status === "completed" ? "outline" : "default"}
                  >
                    {courseProgress?.status === "completed" ? (
                      <>
                        <Award className="h-4 w-4" />
                        Ver Certificado
                      </>
                    ) : courseProgress?.status === "in_progress" ? (
                      <>
                        <Play className="h-4 w-4" />
                        Continuar
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Iniciar Curso
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
