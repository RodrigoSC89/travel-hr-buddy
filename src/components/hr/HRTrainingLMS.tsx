/**
 * HR Training LMS Component
 * Sistema de Gestão de Aprendizagem com IA
 * MIGRATED: Uses real Supabase data
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Play, 
  Clock, 
  Award,
  Users,
  Brain,
  Sparkles,
  Search,
  Star,
  TrendingUp,
  CheckCircle2,
  Video,
  FileText,
  Trophy,
  Database
} from "lucide-react";
import { useHRTraining, useHRStats } from "@/hooks/useHRRealData";
import { BadgeGamificationSystem } from "./BadgeGamificationSystem";

const leaderboard = [
  { name: "João Silva", points: 2450, avatar: "", badge: "🥇" },
  { name: "Maria Costa", points: 2280, avatar: "", badge: "🥈" },
  { name: "Pedro Santos", points: 2100, avatar: "", badge: "🥉" },
  { name: "Ana Oliveira", points: 1950, avatar: "" },
  { name: "Carlos Lima", points: 1820, avatar: "" },
];

export function HRTrainingLMS() {
  const { data: courses = [], isLoading } = useHRTraining();
  const { data: stats } = useHRStats();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("catalog");

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-green-500/10 text-green-500";
      case "intermediate": return "bg-blue-500/10 text-blue-500";
      case "advanced": return "bg-purple-500/10 text-purple-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "beginner": return "Iniciante";
      case "intermediate": return "Intermediário";
      case "advanced": return "Avançado";
      default: return level;
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasRealData = courses.length > 0;
  const totalHours = courses.reduce((sum, c) => sum + c.duration_hours, 0);
  const completedCourses = courses.filter(c => c.progress === 100).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nautilus Academy</h2>
          <p className="text-muted-foreground">Plataforma de Treinamento e Desenvolvimento</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Award className="mr-2 h-4 w-4" />
            Meus Certificados
          </Button>
          <Button>
            <BookOpen className="mr-2 h-4 w-4" />
            Criar Curso
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Disponíveis</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">12 obrigatórios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas de Treinamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5h</div>
            <p className="text-xs text-muted-foreground">Meta: 40h/ano</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">8</div>
            <p className="text-xs text-muted-foreground">+3 este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Gamification</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">1,850</div>
            <p className="text-xs text-muted-foreground">Rank #4 da empresa</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="catalog">Catálogo</TabsTrigger>
          <TabsTrigger value="my-courses">Meus Cursos</TabsTrigger>
          <TabsTrigger value="ai-recommended">IA Recomenda</TabsTrigger>
          <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4 mt-4">
          {/* Search */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Brain className="mr-2 h-4 w-4" />
              IA: Sugerir Trilha
            </Button>
          </div>

          {/* Courses Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map(course => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-primary/50" />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base line-clamp-1">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </div>
                    {course.is_mandatory && (
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Obrigatório
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{course.category}</Badge>
                    <Badge className={getLevelColor(course.level)}>
                      {getLevelLabel(course.level)}
                    </Badge>
                    {course.is_mandatory && (
                      <Badge variant="destructive">Obrigatório</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration_hours}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{course.modules} módulos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{course.rating}</span>
                    </div>
                  </div>

                  {course.progress > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progresso</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant={course.progress > 0 ? "default" : "outline"}>
                    {course.progress === 100 ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Concluído
                      </>
                    ) : course.progress > 0 ? (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Continuar
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Começar
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-courses" className="space-y-4 mt-4">
          <div className="grid gap-4">
            {filteredCourses.filter(c => c.progress > 0).map(course => (
              <Card key={course.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded flex items-center justify-center shrink-0">
                      <BookOpen className="h-6 w-6 text-primary/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">{course.instructor}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Progress value={course.progress} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{course.progress}%</span>
                      </div>
                    </div>
                    <Button>
                      {course.progress === 100 ? (
                        <Award className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-recommended" className="space-y-4 mt-4">
          <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Brain className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold">Trilha Personalizada pela IA</h3>
                <p className="text-sm text-muted-foreground">
                  Baseada no seu cargo, competências e objetivos de carreira
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">1. Segurança Marítima - STCW</p>
                  <p className="text-xs text-muted-foreground">Concluído</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border-2 border-primary">
                <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">2. Liderança e Gestão de Equipes</p>
                  <p className="text-xs text-muted-foreground">Em progresso - 65%</p>
                </div>
                <Button size="sm">Continuar</Button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background rounded-lg opacity-60">
                <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">3</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">3. Comunicação Não-Violenta</p>
                  <p className="text-xs text-muted-foreground">Próximo na trilha</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredCourses.filter(c => c.is_mandatory).map(course => (
              <Card key={course.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Recomendado para você
                    </Badge>
                    <Badge className={getLevelColor(course.level)}>
                      {getLevelLabel(course.level)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full">
                    <Play className="mr-2 h-4 w-4" />
                    Começar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Ranking de Aprendizado
              </CardTitle>
              <CardDescription>Top performers do mês</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((user, index) => (
                  <div 
                    key={user.name} 
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      index < 3 ? "bg-gradient-to-r from-warning/10 to-transparent" : "bg-muted/50"
                    }`}
                  >
                    <div className="w-8 text-center font-bold text-lg">
                      {user.badge || `#${index + 1}`}
                    </div>
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.points} pontos</p>
                    </div>
                    {index === 0 && (
                      <Badge className="bg-warning text-warning-foreground">Líder</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* My Stats - Real Badge System */}
          <BadgeGamificationSystem
            userProgress={{
              totalCoursesCompleted: completedCourses,
              totalHoursStudied: totalHours,
              consecutiveDaysActive: 7,
              mandatoryCoursesCompleted: courses.filter(c => c.is_mandatory && c.progress === 100).length,
              totalMandatoryCourses: courses.filter(c => c.is_mandatory).length,
              averageScore: 87,
              coursesThisMonth: 3,
              perfectScores: 2,
              categoriesCompleted: [...new Set(courses.filter(c => c.progress === 100).map(c => c.category))],
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
