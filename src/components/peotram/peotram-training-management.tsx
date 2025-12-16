import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Users,
  Calendar,
  Award,
  CheckCircle,
  Clock,
  PlayCircle,
  Download,
  Plus,
  Target,
  TrendingUp,
  FileText,
  Video,
  Headphones
} from "lucide-react";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  type: "video" | "documento" | "presencial" | "simulacao";
  duration: number; // em minutos
  difficulty: "basico" | "intermediario" | "avancado";
  peotramElements: string[];
  prerequisites: string[];
  status: "disponivel" | "em_progresso" | "concluido" | "bloqueado";
  progress: number;
  completionDate?: string;
  certificateAvailable: boolean;
}

interface TrainingPath {
  id: string;
  title: string;
  description: string;
  targetRole: string;
  modules: string[];
  estimatedHours: number;
  completionRate: number;
  enrolled: number;
}

interface TrainingSession {
  id: string;
  title: string;
  instructor: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  status: "agendado" | "em_andamento" | "concluido" | "cancelado";
  type: "presencial" | "virtual";
}

export const PeotramTrainingManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("modules");

  const getDemoModules = (): TrainingModule[] => [
    {
      id: "MOD_001",
      title: "Fundamentos do PEOTRAM",
      description: "Introdução aos conceitos básicos do Programa de Excelência Operacional",
      type: "video",
      duration: 45,
      difficulty: "basico",
      peotramElements: ["ELEMENTO_01"],
      prerequisites: [],
      status: "concluido",
      progress: 100,
      completionDate: "2024-12-15",
      certificateAvailable: true
    },
    {
      id: "MOD_002",
      title: "Gestão de Riscos Operacionais",
      description: "Identificação, avaliação e mitigação de riscos no ambiente marítimo",
      type: "video",
      duration: 90,
      difficulty: "intermediario",
      peotramElements: ["ELEMENTO_02", "ELEMENTO_03"],
      prerequisites: ["MOD_001"],
      status: "em_progresso",
      progress: 60,
      certificateAvailable: false
    },
    {
      id: "MOD_003",
      title: "Auditoria PEOTRAM - Prática",
      description: "Simulação prática de processo de auditoria PEOTRAM",
      type: "simulacao",
      duration: 120,
      difficulty: "avancado",
      peotramElements: ["ELEMENTO_01", "ELEMENTO_02", "ELEMENTO_03"],
      prerequisites: ["MOD_001", "MOD_002"],
      status: "bloqueado",
      progress: 0,
      certificateAvailable: true
    }
  ];

  const getDemoPaths = (): TrainingPath[] => [
    {
      id: "PATH_001",
      title: "Auditor PEOTRAM Certificado",
      description: "Trilha completa para certificação como auditor PEOTRAM",
      targetRole: "Auditor",
      modules: ["MOD_001", "MOD_002", "MOD_003", "MOD_004", "MOD_005"],
      estimatedHours: 40,
      completionRate: 45,
      enrolled: 12
    },
    {
      id: "PATH_002",
      title: "Gestor de Segurança Marítima",
      description: "Formação para gestores de segurança em operações marítimas",
      targetRole: "Gestor",
      modules: ["MOD_001", "MOD_002", "MOD_006", "MOD_007"],
      estimatedHours: 25,
      completionRate: 78,
      enrolled: 8
    }
  ];

  const getDemoSessions = (): TrainingSession[] => [
    {
      id: "SESS_001",
      title: "Workshop: Implementação PEOTRAM",
      instructor: "Dr. Carlos Eduardo",
      date: "2024-12-28",
      time: "09:00",
      duration: 480,
      location: "Auditório Principal",
      maxParticipants: 20,
      currentParticipants: 15,
      status: "agendado",
      type: "presencial"
    },
    {
      id: "SESS_002",
      title: "Webinar: Novas Diretrizes PEOTRAM 2025",
      instructor: "Dra. Marina Santos",
      date: "2025-01-05",
      time: "14:00",
      duration: 90,
      location: "Online",
      maxParticipants: 100,
      currentParticipants: 67,
      status: "agendado",
      type: "virtual"
    }
  ];

  const [modules] = useState<TrainingModule[]>(getDemoModules());
  const [paths] = useState<TrainingPath[]>(getDemoPaths());
  const [sessions] = useState<TrainingSession[]>(getDemoSessions());

  const getStatusColor = (status: string) => {
    switch (status) {
    case "concluido": return "bg-success/20 text-success border-success/30";
    case "em_progresso": return "bg-info/20 text-info border-info/30";
    case "disponivel": return "bg-primary/20 text-primary border-primary/30";
    case "bloqueado": return "bg-muted/20 text-muted-foreground border-muted/30";
    default: return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
    case "concluido": return "Concluído";
    case "em_progresso": return "Em Progresso";
    case "disponivel": return "Disponível";
    case "bloqueado": return "Bloqueado";
    default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "video": return <Video className="w-4 h-4" />;
    case "documento": return <FileText className="w-4 h-4" />;
    case "presencial": return <Users className="w-4 h-4" />;
    case "simulacao": return <Target className="w-4 h-4" />;
    default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
    case "basico": return "bg-success/20 text-success";
    case "intermediario": return "bg-warning/20 text-warning";
    case "avancado": return "bg-destructive/20 text-destructive";
    default: return "bg-muted/20 text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Treinamentos PEOTRAM</h2>
          <p className="text-muted-foreground">
            Sistema de capacitação e certificação PEOTRAM
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Treinamento
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-muted/50">
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Módulos
          </TabsTrigger>
          <TabsTrigger value="paths" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Trilhas
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Sessões
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Certificados
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <Card
                key={module.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-card to-accent/5"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(module.type)}
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                    </div>
                    <Badge variant="outline" className={getStatusColor(module.status)}>
                      {getStatusLabel(module.status)}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">{module.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {module.duration} min
                    </span>
                    <Badge className={getDifficultyColor(module.difficulty)}>
                      {module.difficulty}
                    </Badge>
                  </div>

                  {module.status === "em_progresso" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{module.progress}%</span>
                      </div>
                      <Progress value={module.progress} className="h-2" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Elementos PEOTRAM:</div>
                    <div className="flex flex-wrap gap-1">
                      {module.peotramElements.map((element) => (
                        <Badge key={element} variant="secondary" className="text-xs">
                          {element}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {module.status === "disponivel" && (
                      <Button size="sm" className="flex-1">
                        <PlayCircle className="w-3 h-3 mr-1" />
                        Iniciar
                      </Button>
                    )}
                    {module.status === "em_progresso" && (
                      <Button size="sm" className="flex-1">
                        <PlayCircle className="w-3 h-3 mr-1" />
                        Continuar
                      </Button>
                    )}
                    {module.status === "concluido" && module.certificateAvailable && (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="w-3 h-3 mr-1" />
                        Certificado
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="paths" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paths.map((path) => (
              <Card
                key={path.id}
                className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-accent/5"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{path.title}</CardTitle>
                    <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                      {path.targetRole}
                    </Badge>
                  </div>
                  <CardDescription>{path.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{path.estimatedHours}h estimadas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{path.enrolled} inscritos</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Conclusão</span>
                      <span className="font-medium">{path.completionRate}%</span>
                    </div>
                    <Progress value={path.completionRate} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Módulos ({path.modules.length}):</div>
                    <div className="flex flex-wrap gap-1">
                      {path.modules.slice(0, 3).map((moduleId) => (
                        <Badge key={moduleId} variant="secondary" className="text-xs">
                          {moduleId}
                        </Badge>
                      ))}
                      {path.modules.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{path.modules.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <PlayCircle className="w-3 h-3 mr-1" />
                      Começar Trilha
                    </Button>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-accent/5"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    <Badge variant="outline" className={getStatusColor(session.status)}>
                      {session.type === "virtual" ? "Virtual" : "Presencial"}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {session.instructor.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {session.instructor}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{session.date} às {session.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{Math.floor(session.duration / 60)}h {session.duration % 60}min</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Vagas Ocupadas</span>
                      <span>{session.currentParticipants}/{session.maxParticipants}</span>
                    </div>
                    <Progress 
                      value={(session.currentParticipants / session.maxParticipants) * 100} 
                      className="h-2" 
                    />
                  </div>

                  <div className="text-sm">
                    <strong>Local:</strong> {session.location}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      Inscrever-se
                    </Button>
                    <Button variant="outline" size="sm">
                      Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="text-center">
                <Award className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>Auditor PEOTRAM Nível I</CardTitle>
                <CardDescription>Certificação em auditoria básica PEOTRAM</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Badge className="bg-success/20 text-success">Obtido</Badge>
                <div className="text-sm text-muted-foreground">
                  Emitido em: 15/12/2024
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-3 h-3 mr-1" />
                  Baixar Certificado
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <CardHeader className="text-center">
                <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <CardTitle>Gestor de Riscos Marítimos</CardTitle>
                <CardDescription>Especialização em gestão de riscos</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Badge variant="outline" className="bg-warning/20 text-warning">Em Progresso</Badge>
                <Progress value={75} className="h-2" />
                <div className="text-sm text-muted-foreground">
                  75% concluído
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Módulos Concluídos</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15</div>
                <p className="text-xs text-muted-foreground">
                  +3 este mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Horas de Treinamento</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">
                  Total acumulado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">89%</div>
                <p className="text-xs text-muted-foreground">
                  Acima da meta
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Certificados Obtidos</CardTitle>
                <Award className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">3</div>
                <p className="text-xs text-muted-foreground">
                  2 em progresso
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};