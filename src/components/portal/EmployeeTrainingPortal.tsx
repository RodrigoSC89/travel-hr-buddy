/**
 * EmployeeTrainingPortal - Portal de Treinamentos do Funcionário
 * ✅ P0 CORRIGIDO: Dados reais do Supabase
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  GraduationCap,
  BookOpen,
  Clock,
  Award,
  Play,
  CheckCircle2,
  Lock,
  Star,
  Calendar,
  Download,
  AlertCircle
} from "lucide-react";
import { useCrewTrainingData, type Course, type Certificate } from "@/hooks/useCrewTrainingData";

export const EmployeeTrainingPortal: React.FC = () => {
  const { courses, certificates, isLoading } = useCrewTrainingData();
  const [activeTab, setActiveTab] = useState<'courses' | 'certificates'>('courses');

  const completedCourses = courses.filter(c => c.status === 'completed').length;
  const inProgressCourses = courses.filter(c => c.status === 'in_progress').length;
  const totalProgress = courses.length > 0 
    ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length)
    : 0;

  const handleStartCourse = (course: Course) => {
    if (course.status === 'locked') {
      toast.error("Curso bloqueado", { description: "Complete os pré-requisitos primeiro" });
      return;
    }
    toast.success(`Iniciando: ${course.title}`, { description: "Carregando conteúdo do curso..." });
  };

  const handleDownloadCertificate = (cert: Certificate) => {
    toast.success(`Download iniciado`, { description: `Certificado: ${cert.name}` });
  };

  const getStatusColor = (status: Course['status']) => {
    switch (status) {
      case 'completed': return 'bg-success/20 text-success';
      case 'in_progress': return 'bg-info/20 text-info';
      case 'not_started': return 'bg-muted text-muted-foreground';
      case 'locked': return 'bg-warning/20 text-warning';
      default: return '';
    }
  };

  const getCertStatusColor = (status: Certificate['status']) => {
    switch (status) {
      case 'valid': return 'bg-success/20 text-success';
      case 'expiring': return 'bg-warning/20 text-warning';
      case 'expired': return 'bg-destructive/20 text-destructive';
      default: return '';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={`training-skel-${i}`}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-sm text-muted-foreground">Total de Cursos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCourses}</p>
                <p className="text-sm text-muted-foreground">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Play className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressCourses}</p>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Award className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{certificates.length}</p>
                <p className="text-sm text-muted-foreground">Certificados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Progresso Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={totalProgress} className="flex-1" />
            <span className="font-bold text-lg">{totalProgress}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <Button 
          variant={activeTab === 'courses' ? 'default' : 'outline'}
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Cursos
        </Button>
        <Button 
          variant={activeTab === 'certificates' ? 'default' : 'outline'}
          onClick={() => setActiveTab('certificates')}
        >
          <Award className="h-4 w-4 mr-2" />
          Certificados
        </Button>
      </div>

      {activeTab === 'courses' ? (
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {courses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Nenhum curso disponível</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Os cursos serão exibidos quando estiverem disponíveis no sistema.
                  </p>
                </CardContent>
              </Card>
            ) : (
              courses.map(course => (
                <Card key={course.id} className={course.status === 'locked' ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{course.title}</h4>
                          {course.mandatory && (
                            <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {course.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.duration}
                          </span>
                          {course.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              {course.rating}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(course.status)}>
                        {course.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {course.status === 'in_progress' && <Play className="h-3 w-3 mr-1" />}
                        {course.status === 'locked' && <Lock className="h-3 w-3 mr-1" />}
                        {course.status === 'completed' ? 'Concluído' :
                         course.status === 'in_progress' ? 'Em Andamento' :
                         course.status === 'locked' ? 'Bloqueado' : 'Não Iniciado'}
                      </Badge>
                    </div>
                    
                    {course.status !== 'not_started' && course.status !== 'locked' && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progresso</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      {course.deadline && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Prazo: {new Date(course.deadline).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      <Button 
                        size="sm" 
                        variant={course.status === 'completed' ? 'outline' : 'default'}
                        onClick={() => handleStartCourse(course)}
                        disabled={course.status === 'locked'}
                      >
                        {course.status === 'completed' ? 'Revisar' :
                         course.status === 'in_progress' ? 'Continuar' : 'Iniciar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {certificates.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Nenhum certificado encontrado</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Complete cursos para obter certificados.
                  </p>
                </CardContent>
              </Card>
            ) : (
              certificates.map(cert => (
                <Card key={cert.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Award className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{cert.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Emitido: {new Date(cert.issueDate).toLocaleDateString('pt-BR')}
                            {cert.expiryDate && ` | Validade: ${new Date(cert.expiryDate).toLocaleDateString('pt-BR')}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getCertStatusColor(cert.status)}>
                          {cert.status === 'valid' ? 'Válido' :
                           cert.status === 'expiring' ? 'Expirando' : 'Expirado'}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => handleDownloadCertificate(cert)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default EmployeeTrainingPortal;
