import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, BookOpen, Award, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TrainingAcademy = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState([
    {
      id: "1",
      title: "Dynamic Positioning - Nível Avançado",
      category: "DP Operations",
      duration: "40h",
      modules: 12,
      progress: 0,
      enrolled: false,
      certificate_available: false
    },
    {
      id: "2",
      title: "Resposta a Emergências",
      category: "Emergency Response",
      duration: "24h",
      modules: 8,
      progress: 75,
      enrolled: true,
      certificate_available: false
    },
    {
      id: "3",
      title: "SGSO - Sistema de Gestão",
      category: "SGSO Compliance",
      duration: "16h",
      modules: 6,
      progress: 100,
      enrolled: true,
      certificate_available: true
    }
  ]);

  const [certificates, setCertificates] = useState([
    {
      id: "1",
      course: "SGSO - Sistema de Gestão",
      issued_at: "2025-01-10",
      valid_until: "2026-01-10"
    }
  ]);

  const handleEnroll = (courseId: string) => {
    setCourses(courses.map(c => 
      c.id === courseId ? { ...c, enrolled: true, progress: 0 } : c
    ));
    
    toast({
      title: "Inscrição realizada",
      description: "Você foi inscrito no curso com sucesso"
    });
  };

  const handleContinue = (courseId: string) => {
    toast({
      title: "Continuando curso",
      description: "Redirecionando para o módulo atual"
    });
  };

  const handleDownloadCertificate = (certId: string) => {
    toast({
      title: "Baixando certificado",
      description: "PDF será baixado em instantes"
    });
  };

  const enrolledCourses = courses.filter(c => c.enrolled);
  const availableCourses = courses.filter(c => !c.enrolled);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <GraduationCap className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Training Academy</h1>
          <p className="text-muted-foreground">Plataforma completa de capacitação profissional</p>
        </div>
      </div>

      {/* Estatísticas do usuário */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cursos Inscritos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCourses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrolledCourses.filter(c => c.progress === 100).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="my-courses">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-courses">Meus Cursos</TabsTrigger>
          <TabsTrigger value="catalog">Catálogo</TabsTrigger>
          <TabsTrigger value="certificates">Certificados</TabsTrigger>
        </TabsList>

        <TabsContent value="my-courses" className="space-y-4">
          {enrolledCourses.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Você ainda não está inscrito em nenhum curso</p>
                <Button 
                  className="mt-4" 
                  onClick={() => {
                    const catalogTab = document.querySelector('[data-value="catalog"]') as HTMLElement;
                    if (catalogTab) catalogTab.click();
                  }}
                >
                  Explorar Catálogo
                </Button>
              </CardContent>
            </Card>
          ) : (
            enrolledCourses.map((course) => (
              <Card key={course.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {course.modules} módulos
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration}
                        </span>
                        <Badge variant="outline">{course.category}</Badge>
                      </div>
                    </div>
                    {course.certificate_available ? (
                      <Button variant="outline">
                        <Award className="mr-2 h-4 w-4" />
                        Ver Certificado
                      </Button>
                    ) : (
                      <Button onClick={() => handleContinue(course.id)}>
                        Continuar
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="catalog" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <Badge variant="outline" className="w-fit">{course.category}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.modules} módulos
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.duration}
                    </span>
                  </div>
                  <Button onClick={() => handleEnroll(course.id)} className="w-full">
                    Inscrever-se
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          {certificates.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Você ainda não possui certificados</p>
              </CardContent>
            </Card>
          ) : (
            certificates.map((cert) => (
              <Card key={cert.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{cert.course}</h3>
                        <p className="text-sm text-muted-foreground">
                          Emitido em {new Date(cert.issued_at).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Válido até {new Date(cert.valid_until).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => handleDownloadCertificate(cert.id)}>
                      Baixar PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingAcademy;
