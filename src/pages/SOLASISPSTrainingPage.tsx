/**
 * SOLAS, ISPS & ISM Training - Página dedicada
 * Treinamentos de segurança marítima e compliance
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Shield, BookOpen, Award, Users, Clock, CheckCircle2,
  AlertTriangle, Play, FileText, Download, Target
} from "lucide-react";

// Mock data
const trainingStats = {
  totalCourses: 24,
  completed: 18,
  inProgress: 4,
  pending: 2,
  complianceRate: 92,
  certifiedCrew: 156,
};

const courses = [
  { 
    id: 1, 
    name: "SOLAS Training - Segurança da Vida no Mar", 
    category: "SOLAS",
    duration: "8h",
    mandatory: true,
    status: "completed",
    progress: 100,
    participants: 45
  },
  { 
    id: 2, 
    name: "ISPS Code - Segurança de Navios e Instalações Portuárias", 
    category: "ISPS",
    duration: "6h",
    mandatory: true,
    status: "completed",
    progress: 100,
    participants: 42
  },
  { 
    id: 3, 
    name: "ISM Code - Gestão de Segurança Internacional", 
    category: "ISM",
    duration: "4h",
    mandatory: true,
    status: "in_progress",
    progress: 75,
    participants: 38
  },
  { 
    id: 4, 
    name: "Drill de Abandono - Procedimentos de Emergência", 
    category: "SOLAS",
    duration: "4h",
    mandatory: true,
    status: "in_progress",
    progress: 60,
    participants: 50
  },
  { 
    id: 5, 
    name: "Combate a Incêndio Avançado", 
    category: "SOLAS",
    duration: "8h",
    mandatory: true,
    status: "pending",
    progress: 0,
    participants: 0
  },
  { 
    id: 6, 
    name: "Ship Security Officer (SSO)", 
    category: "ISPS",
    duration: "16h",
    mandatory: false,
    status: "completed",
    progress: 100,
    participants: 12
  },
];

const upcomingTrainings = [
  { name: "Drill de Abandono Q1", date: "2025-02-15", vessel: "MV Atlântico Sul", participants: 25 },
  { name: "Treinamento ISPS Anual", date: "2025-02-20", vessel: "Toda Frota", participants: 150 },
  { name: "Simulado de Incêndio", date: "2025-02-28", vessel: "MV Pacífico Norte", participants: 22 },
];

const certifications = [
  { name: "STCW Basic Safety Training", expiry: "2025-06-15", crew: 156, status: "valid" },
  { name: "Advanced Fire Fighting", expiry: "2025-04-20", crew: 45, status: "expiring_soon" },
  { name: "Survival Craft and Rescue Boats", expiry: "2025-08-10", crew: 156, status: "valid" },
  { name: "Security Awareness Training", expiry: "2025-03-01", crew: 156, status: "expiring_soon" },
];

export default function SOLASISPSTrainingPage() {
  const [selectedTab, setSelectedTab] = useState("courses");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in_progress": return "bg-blue-500";
      case "pending": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Concluído";
      case "in_progress": return "Em Andamento";
      case "pending": return "Pendente";
      default: return status;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "SOLAS": return "bg-destructive/20 text-destructive";
      case "ISPS": return "bg-info/20 text-info";
      case "ISM": return "bg-accent/20 text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-destructive/20 rounded-xl">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              SOLAS, ISPS & ISM Training
              <Badge variant="secondary" className="bg-destructive/20 text-destructive">
                IMO Compliance
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Treinamentos obrigatórios de segurança marítima internacional
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Relatório
          </Button>
          <Button className="gap-2">
            <Play className="h-4 w-4" />
            Novo Treinamento
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cursos</p>
                <p className="text-3xl font-bold">{trainingStats.totalCourses}</p>
              </div>
              <BookOpen className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-3xl font-bold text-success">{trainingStats.completed}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-success/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-3xl font-bold text-info">{trainingStats.inProgress}</p>
              </div>
              <Clock className="h-10 w-10 text-info/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance</p>
                <p className="text-3xl font-bold text-primary">{trainingStats.complianceRate}%</p>
              </div>
              <Target className="h-10 w-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Certificados</p>
                <p className="text-3xl font-bold">{trainingStats.certifiedCrew}</p>
                <p className="text-xs text-muted-foreground">tripulantes</p>
              </div>
              <Award className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="schedule">Cronograma</TabsTrigger>
          <TabsTrigger value="certifications">Certificações</TabsTrigger>
          <TabsTrigger value="drills">Simulados</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Cursos Obrigatórios IMO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{course.name}</h3>
                          {course.mandatory && (
                            <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Badge className={getCategoryColor(course.category)}>{course.category}</Badge>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course.participants} participantes
                          </span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(course.status)}>
                        {getStatusText(course.status)}
                      </Badge>
                    </div>
                    {course.status !== "pending" && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progresso</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} />
                      </div>
                    )}
                    {course.status === "pending" && (
                      <Button size="sm" className="mt-2 gap-2">
                        <Play className="h-4 w-4" />
                        Iniciar Treinamento
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Próximos Treinamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTrainings.map((training, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{training.name}</h3>
                      <p className="text-sm text-muted-foreground">{training.vessel}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{new Date(training.date).toLocaleDateString("pt-BR")}</p>
                      <p className="text-sm text-muted-foreground">{training.participants} participantes</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certificações STCW
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Award className={`h-8 w-8 ${cert.status === "valid" ? "text-green-500" : "text-yellow-500"}`} />
                      <div>
                        <h3 className="font-medium">{cert.name}</h3>
                        <p className="text-sm text-muted-foreground">{cert.crew} tripulantes certificados</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={cert.status === "valid" ? "bg-green-500" : "bg-yellow-500"}>
                        {cert.status === "valid" ? "Válido" : "Expirando"}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Expira: {new Date(cert.expiry).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Simulados de Emergência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { type: "Abandono de Navio", frequency: "Mensal", lastDrill: "2025-01-15", next: "2025-02-15" },
                  { type: "Combate a Incêndio", frequency: "Mensal", lastDrill: "2025-01-20", next: "2025-02-20" },
                  { type: "Homem ao Mar", frequency: "Trimestral", lastDrill: "2024-12-01", next: "2025-03-01" },
                  { type: "Segurança ISPS", frequency: "Trimestral", lastDrill: "2024-11-15", next: "2025-02-15" },
                  { type: "Derramamento de Óleo", frequency: "Semestral", lastDrill: "2024-08-01", next: "2025-02-01" },
                  { type: "Evacuação Médica", frequency: "Trimestral", lastDrill: "2024-12-20", next: "2025-03-20" },
                ].map((drill, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{drill.type}</h3>
                      <Badge variant="outline">{drill.frequency}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Último: {new Date(drill.lastDrill).toLocaleDateString("pt-BR")}</p>
                      <p>Próximo: {new Date(drill.next).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <Button size="sm" variant="outline" className="mt-3 w-full gap-2">
                      <Play className="h-4 w-4" />
                      Agendar Simulado
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
