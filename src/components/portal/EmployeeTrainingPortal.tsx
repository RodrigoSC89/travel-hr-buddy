/**
 * EmployeeTrainingPortal - Portal de Treinamentos do Funcionário
 * Lista de cursos, progresso e certificações
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Download
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'locked';
  mandatory: boolean;
  deadline?: string;
  certificate?: boolean;
  rating?: number;
}

interface Certificate {
  id: string;
  name: string;
  issueDate: string;
  expiryDate?: string;
  status: 'valid' | 'expiring' | 'expired';
}

const MOCK_COURSES: Course[] = [
  {
    id: "1",
    title: "Segurança Marítima Básica - STCW",
    category: "Segurança",
    duration: "8 horas",
    progress: 100,
    status: 'completed',
    mandatory: true,
    certificate: true,
    rating: 4.8
  },
  {
    id: "2",
    title: "Combate a Incêndio Avançado",
    category: "Segurança",
    duration: "16 horas",
    progress: 65,
    status: 'in_progress',
    mandatory: true,
    deadline: "2026-02-15"
  },
  {
    id: "3",
    title: "Primeiros Socorros no Mar",
    category: "Saúde",
    duration: "12 horas",
    progress: 0,
    status: 'not_started',
    mandatory: true,
    deadline: "2026-03-01"
  },
  {
    id: "4",
    title: "Operação de Guindastes",
    category: "Operacional",
    duration: "24 horas",
    progress: 30,
    status: 'in_progress',
    mandatory: false
  },
  {
    id: "5",
    title: "Liderança e Gestão de Equipes",
    category: "Soft Skills",
    duration: "6 horas",
    progress: 0,
    status: 'locked',
    mandatory: false
  },
  {
    id: "6",
    title: "Navegação Eletrônica ECDIS",
    category: "Técnico",
    duration: "20 horas",
    progress: 100,
    status: 'completed',
    mandatory: true,
    certificate: true,
    rating: 4.5
  }
];

const MOCK_CERTIFICATES: Certificate[] = [
  { id: "1", name: "STCW Básico", issueDate: "2025-06-15", expiryDate: "2030-06-15", status: 'valid' },
  { id: "2", name: "Combate a Incêndio", issueDate: "2024-01-20", expiryDate: "2026-01-20", status: 'expiring' },
  { id: "3", name: "ECDIS Operacional", issueDate: "2025-09-10", status: 'valid' },
];

export const EmployeeTrainingPortal: React.FC = () => {
  const [courses] = useState<Course[]>(MOCK_COURSES);
  const [certificates] = useState<Certificate[]>(MOCK_CERTIFICATES);
  const [activeTab, setActiveTab] = useState<'courses' | 'certificates'>('courses');

  const completedCourses = courses.filter(c => c.status === 'completed').length;
  const inProgressCourses = courses.filter(c => c.status === 'in_progress').length;
  const totalProgress = Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length);

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
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'not_started': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      case 'locked': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return '';
    }
  };

  const getCertStatusColor = (status: Certificate['status']) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'expiring': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'expired': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return '';
    }
  };

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
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
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
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Play className="h-5 w-5 text-blue-600" />
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
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Award className="h-5 w-5 text-yellow-600" />
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
            {courses.map(course => (
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
            ))}
          </div>
        </ScrollArea>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {certificates.map(cert => (
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
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default EmployeeTrainingPortal;
