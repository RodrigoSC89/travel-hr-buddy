import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  Play,
  BookOpen,
  Users,
  Trophy,
  Clock,
  Star,
  CheckCircle,
  Award,
  FileText,
  Video,
  Headphones,
  Monitor,
  User,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  instructor: string;
  category: string;
  progress?: number;
  type: "video" | "text" | "interactive" | "live";
  certificate: boolean;
}

export const NautilusAcademy: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("courses");

  const courses: Course[] = [
    {
      id: "1",
      title: "Fundamentos do Sistema Nautilus",
      description: "Aprenda os conceitos básicos e navegação inicial no sistema",
      level: "beginner",
      duration: "2h 30min",
      lessons: 12,
      students: 1847,
      rating: 4.9,
      instructor: "Capt. Maria Silva",
      category: "basics",
      progress: 0,
      type: "video",
      certificate: true,
    },
    {
      id: "2",
      title: "Gestão Avançada de Frotas",
      description: "Técnicas avançadas para otimização e gestão de frotas marítimas",
      level: "advanced",
      duration: "4h 15min",
      lessons: 18,
      students: 923,
      rating: 4.8,
      instructor: "Eng. João Santos",
      category: "fleet",
      progress: 65,
      type: "interactive",
      certificate: true,
    },
    {
      id: "3",
      title: "Compliance e Regulamentações Marítimas",
      description: "Normas internacionais e requisitos de compliance",
      level: "intermediate",
      duration: "3h 45min",
      lessons: 15,
      students: 1256,
      rating: 4.7,
      instructor: "Dr. Ana Costa",
      category: "compliance",
      progress: 25,
      type: "text",
      certificate: true,
    },
    {
      id: "4",
      title: "Analytics e Business Intelligence",
      description: "Usando dados para tomada de decisões estratégicas",
      level: "intermediate",
      duration: "5h 20min",
      lessons: 22,
      students: 745,
      rating: 4.9,
      instructor: "Prof. Carlos Mendes",
      category: "analytics",
      progress: 0,
      type: "video",
      certificate: true,
    },
    {
      id: "5",
      title: "Segurança Marítima Digital",
      description: "Protocolos de segurança e gestão de riscos digitais",
      level: "advanced",
      duration: "3h 10min",
      lessons: 14,
      students: 567,
      rating: 4.6,
      instructor: "Sec. Roberto Lima",
      category: "security",
      progress: 0,
      type: "live",
      certificate: true,
    },
    {
      id: "6",
      title: "Automação e IA no Maritmo",
      description: "Implementando soluções de IA e automação",
      level: "advanced",
      duration: "6h 30min",
      lessons: 28,
      students: 432,
      rating: 4.8,
      instructor: "Dr. Patricia Tech",
      category: "ai",
      progress: 0,
      type: "interactive",
      certificate: true,
    },
  ];

  const achievements = [
    { title: "Primeira Certificação", description: "Complete seu primeiro curso", earned: true },
    {
      title: "Especialista em Frotas",
      description: "Complete 3 cursos de gestão de frotas",
      earned: true,
    },
    { title: "Mentor da Comunidade", description: "Ajude 10 outros estudantes", earned: false },
    { title: "Inovador Marítimo", description: "Complete curso avançado de IA", earned: false },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
    case "beginner":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    case "intermediate":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
    case "advanced":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
    case "beginner":
      return "Iniciante";
    case "intermediate":
      return "Intermediário";
    case "advanced":
      return "Avançado";
    default:
      return level;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "video":
      return Video;
    case "text":
      return FileText;
    case "interactive":
      return Monitor;
    case "live":
      return Headphones;
    default:
      return BookOpen;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Academia Nautilus</h1>
          <Badge variant="secondary">Platform de Treinamento</Badge>
        </div>
        <p className="text-muted-foreground">
          Centro de conhecimento e certificação para profissionais marítimos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cursos Disponíveis</p>
                <p className="text-2xl font-bold">127</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estudantes Ativos</p>
                <p className="text-2xl font-bold">12,547</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Certificações</p>
                <p className="text-2xl font-bold">8,923</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Horas de Conteúdo</p>
                <p className="text-2xl font-bold">856h</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">Meus Cursos</TabsTrigger>
          <TabsTrigger value="catalog">Catálogo</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="certificates">Certificados</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cursos em Andamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses
                .filter(course => course.progress && course.progress > 0)
                .map(course => {
                  const TypeIcon = getTypeIcon(course.type);
                  return (
                    <Card key={course.id}>
                      <CardHeader className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <TypeIcon className="w-5 h-5 text-primary" />
                            <div>
                              <CardTitle className="text-base">{course.title}</CardTitle>
                              <p className="text-sm text-muted-foreground">{course.instructor}</p>
                            </div>
                          </div>
                          <Badge className={getLevelColor(course.level)}>
                            {getLevelText(course.level)}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} />
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{course.duration}</span>
                          <span>{course.lessons} aulas</span>
                        </div>

                        <Button className="w-full" size="sm">
                          <Play className="w-4 h-4 mr-2" />
                          Continuar
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="catalog">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Todos os Cursos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => {
                const TypeIcon = getTypeIcon(course.type);
                return (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <TypeIcon className="w-5 h-5 text-primary" />
                          <div>
                            <CardTitle className="text-base">{course.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{course.instructor}</p>
                          </div>
                        </div>
                        <Badge className={getLevelColor(course.level)}>
                          {getLevelText(course.level)}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{course.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{course.students.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{course.duration}</span>
                        <span>{course.lessons} aulas</span>
                      </div>

                      {course.certificate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span>Certificado incluso</span>
                        </div>
                      )}

                      <Button className="w-full" size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar Curso
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Suas Conquistas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <Card
                  key={index}
                  className={
                    achievement.earned ? "border-green-200 bg-green-50/50 dark:bg-green-900/10" : ""
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {achievement.earned ? (
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      ) : (
                        <Trophy className="w-8 h-8 text-muted-foreground" />
                      )}
                      <div>
                        <h4 className="font-medium">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="certificates">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Seus Certificados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses
                .filter(course => course.progress === 100 || course.id === "1")
                .map(course => (
                  <Card
                    key={course.id}
                    className="border-green-200 bg-green-50/50 dark:bg-green-900/10"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Award className="w-8 h-8 text-green-500" />
                        <div>
                          <CardTitle className="text-base">{course.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">Certificado de Conclusão</p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="text-sm">
                        <p>
                          <strong>Instrutor:</strong> {course.instructor}
                        </p>
                        <p>
                          <strong>Data de Conclusão:</strong> 15/01/2024
                        </p>
                        <p>
                          <strong>Validade:</strong> 2 anos
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <FileText className="w-4 h-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <User className="w-4 h-4 mr-2" />
                          Verificar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
