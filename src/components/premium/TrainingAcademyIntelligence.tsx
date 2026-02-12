/**
 * Training Academy Intelligence Hub
 * PATCH Sprint 15: Replaced mock data with useTrainingIntelligenceData hook
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCap, Award, Brain, BookOpen, PlayCircle, Target,
  CheckCircle, AlertTriangle, Clock, Users, Calendar, TrendingUp,
  FileText, Star, Zap, BarChart3, Video, Gamepad2, Headphones
} from "lucide-react";
import { toast } from "sonner";
import { useTrainingIntelligenceData } from "@/hooks/useTrainingIntelligenceData";

export default function TrainingAcademyIntelligence() {
  const { data, isLoading } = useTrainingIntelligenceData();
  const courses = data?.courses || [];
  const certTrackers = data?.certTrackers || [];
  const crewProgress = data?.crewProgress || [];
  const lmsMetrics = data?.lmsMetrics || { totalCourses: 0, activeLearners: 0, completionRate: 0, avgScore: 0, certificationsIssued: 0, hoursLearned: 0 };

  const [activeTab, setActiveTab] = useState("courses");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => <Skeleton key={`skel-${n}`} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const expiringCerts = certTrackers.reduce((acc, c) => acc + c.expiring30, 0);
  const expiredCerts = certTrackers.reduce((acc, c) => acc + c.expired, 0);

  const getFormatBadge = (format: string) => {
    switch (format) {
      case "E-Learning": return "bg-info/10 text-info";
      case "Classroom": return "bg-success/10 text-success";
      case "Simulator": return "bg-primary/10 text-primary";
      case "Blended": return "bg-warning/10 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Cursos Ativos</p>
                <p className="text-2xl font-bold">{lmsMetrics.totalCourses}</p>
                <p className="text-xs text-success">{lmsMetrics.activeLearners} learners</p>
              </div>
              <BookOpen className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Taxa Conclusão</p>
                <p className="text-2xl font-bold">{lmsMetrics.completionRate}%</p>
                <Progress value={lmsMetrics.completionRate} className="h-1 mt-1" />
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Certs Expirando</p>
                <p className="text-2xl font-bold">{expiringCerts}</p>
                <p className="text-xs text-warning">Próximos 30 dias</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Certificados Emitidos</p>
                <p className="text-2xl font-bold">{lmsMetrics.certificationsIssued}</p>
                <p className="text-xs text-primary">{lmsMetrics.hoursLearned}h aprendidas</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Certificações
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Progresso
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-info" />
                Catálogo de Cursos
              </CardTitle>
              <CardDescription>Cursos e treinamentos do LMS</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {courses.map(course => (
                    <Card key={course.id} className="border-l-4 border-l-info">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{course.title}</h4>
                            <p className="text-sm text-muted-foreground">{course.category} • {course.duration}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getFormatBadge(course.format)}>{course.format}</Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-warning fill-warning" />
                              <span className="font-medium">{course.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm text-center">
                          <div className="p-2 bg-muted/50 rounded">
                            <p className="text-xs text-muted-foreground">Matriculados</p>
                            <p className="font-bold">{course.enrolled}</p>
                          </div>
                          <div className="p-2 bg-muted/50 rounded">
                            <p className="text-xs text-muted-foreground">Concluídos</p>
                            <p className="font-bold text-success">{course.completed}</p>
                          </div>
                          <div className="p-2 bg-muted/50 rounded">
                            <p className="text-xs text-muted-foreground">Taxa</p>
                            <p className="font-bold">{course.enrolled > 0 ? Math.round(course.completed / course.enrolled * 100) : 0}%</p>
                          </div>
                          <div className="p-2 bg-muted/50 rounded">
                            <p className="text-xs text-muted-foreground">Validade</p>
                            <p className="font-bold">{course.expiry}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <PlayCircle className="h-3 w-3 mr-1" />
                            Iniciar
                          </Button>
                          <Button size="sm" variant="outline">
                            <FileText className="h-3 w-3 mr-1" />
                            Conteúdo
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {courses.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum módulo de treinamento cadastrado.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-success" />
                Certificações da Tripulação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certTrackers.map((cert) => (
                  <div key={cert.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{cert.type}</Badge>
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-muted-foreground">{cert.holders} portadores</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className={cert.expiring30 > 5 ? "text-warning font-bold" : ""}>{cert.expiring30}</p>
                        <p className="text-xs text-muted-foreground">Expirando</p>
                      </div>
                      <div className="text-center">
                        <p className={cert.expired > 0 ? "text-destructive font-bold" : "text-success"}>{cert.expired}</p>
                        <p className="text-xs text-muted-foreground">Expirados</p>
                      </div>
                    </div>
                  </div>
                ))}
                {certTrackers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhuma certificação encontrada.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Progresso Individual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crewProgress.map((crew) => (
                  <div key={crew.name} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{crew.name}</p>
                        <p className="text-sm text-muted-foreground">{crew.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{crew.progress}%</p>
                        <p className="text-xs text-muted-foreground">{crew.courses} cursos • {crew.pending} pendentes</p>
                      </div>
                    </div>
                    <Progress value={crew.progress} className="h-2" />
                  </div>
                ))}
                {crewProgress.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhum progresso registrado.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-info" />
                LMS Analytics Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-info">{lmsMetrics.totalCourses}</p>
                  <p className="text-sm text-muted-foreground">Total Cursos</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-success">{lmsMetrics.completionRate}%</p>
                  <p className="text-sm text-muted-foreground">Taxa Conclusão</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-primary">{lmsMetrics.avgScore}</p>
                  <p className="text-sm text-muted-foreground">Score Médio</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-warning">{expiringCerts + expiredCerts}</p>
                  <p className="text-sm text-muted-foreground">Certs c/ Atenção</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
