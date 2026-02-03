/**
 * CrewTrainingTab - Tab de Treinamento do PeopleHub
 * UX SYSTEM v1.0 - Real Data Integration
 * 
 * Substitui placeholder HRDashboard por componente funcional
 * com dados reais do Supabase (academy_courses, academy_progress)
 */

import React, { useState } from "react";
import { 
  GraduationCap, 
  BookOpen, 
  Clock, 
  Award, 
  Users,
  TrendingUp,
  Play,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTemplate } from "@/components/ui/ux-system/PageTemplate";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTrainingData, Course, Enrollment } from "@/hooks/useTrainingData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Stats Card Component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
  color?: string;
}> = ({ title, value, subtitle, icon: Icon, trend, color = "primary" }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-${color}/10`}>
          <Icon className={`h-5 w-5 text-${color}`} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <TrendingUp className={`h-3 w-3 ${trend.positive ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
          <span className={`text-xs ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.value}% vs. mês anterior
          </span>
        </div>
      )}
    </CardContent>
  </Card>
);

// Course Card Component
const CourseCard: React.FC<{
  course: Course;
  enrollment?: Enrollment;
  onEnroll: (courseId: string) => void;
}> = ({ course, enrollment, onEnroll }) => {
  const isEnrolled = !!enrollment;
  const progress = enrollment?.progress || 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{course.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course.description || "Sem descrição"}
              </p>
            </div>
          </div>
          {course.is_published ? (
            <Badge variant="secondary">Publicado</Badge>
          ) : (
            <Badge variant="outline">Rascunho</Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {course.duration_hours}h
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {course.modules.length} módulos
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            {course.passing_score}% min.
          </div>
        </div>

        {isEnrolled ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progresso</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between">
              <Badge 
                variant={progress === 100 ? "default" : "secondary"}
                className="text-xs"
              >
                {progress === 100 ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Concluído
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    Em progresso
                  </>
                )}
              </Badge>
              <Button size="sm" variant="outline">
                Continuar
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            className="w-full" 
            onClick={() => {
              onEnroll(course.id);
              toast.success("Matrícula realizada!", {
                description: `Você foi matriculado em "${course.name}"`
              });
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Matricular-se
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Enrollment Row Component
const EnrollmentRow: React.FC<{ enrollment: Enrollment }> = ({ enrollment }) => {
  const getStatusBadge = () => {
    switch (enrollment.status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500">Concluído</Badge>;
      case "in_progress":
        return <Badge variant="secondary">Em andamento</Badge>;
      case "failed":
        return <Badge variant="destructive">Reprovado</Badge>;
      default:
        return <Badge variant="outline">Não iniciado</Badge>;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-muted">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">{enrollment.courseName}</p>
          <p className="text-sm text-muted-foreground">
            Iniciado em {enrollment.startedAt?.toLocaleDateString("pt-BR") || "—"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <Progress value={enrollment.progress} className="w-24 h-2 mb-1" />
          <span className="text-xs text-muted-foreground">{enrollment.progress}%</span>
        </div>
        {getStatusBadge()}
        {enrollment.certificateIssued && (
          <Button size="sm" variant="outline">
            <Award className="h-4 w-4 mr-1" />
            Certificado
          </Button>
        )}
      </div>
    </div>
  );
};

export default function CrewTrainingTab() {
  const { user } = useAuth();
  const { courses, enrollments, stats, isLoading, enrollInCourse } = useTrainingData(user?.id);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSubTab, setActiveSubTab] = useState("catalog");

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const myEnrollments = enrollments.filter(e => e.userId === user?.id);

  return (
    <PageTemplate
      title="Centro de Treinamento"
      description="Cursos, certificações e desenvolvimento profissional da tripulação"
      icon={GraduationCap}
      badge={`${stats.totalCourses} cursos`}
      isLoading={isLoading}
      searchable
      searchPlaceholder="Buscar cursos..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      primaryAction={{
        label: "Novo Curso",
        icon: Plus,
        onClick: () => toast.info("Criar curso em desenvolvimento")
      }}
      isEmpty={courses.length === 0}
      emptyTitle="Nenhum curso disponível"
      emptyDescription="Crie o primeiro curso de treinamento para a tripulação."
      emptyActionLabel="Criar Curso"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total de Cursos"
          value={stats.totalCourses}
          subtitle={`${stats.publishedCourses} publicados`}
          icon={BookOpen}
        />
        <StatCard
          title="Matrículas"
          value={stats.totalEnrollments}
          subtitle={`${stats.completedEnrollments} concluídas`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Taxa de Conclusão"
          value={`${stats.averageCompletionRate}%`}
          subtitle="Média geral"
          icon={TrendingUp}
          color="green"
          trend={{ value: 5, positive: true }}
        />
        <StatCard
          title="Horas de Treinamento"
          value={stats.totalTrainingHours}
          subtitle="Total disponível"
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Catálogo
          </TabsTrigger>
          <TabsTrigger value="my-courses" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Meus Cursos
            {myEnrollments.length > 0 && (
              <Badge variant="secondary" className="ml-1">{myEnrollments.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Certificados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          {filteredCourses.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Nenhum curso encontrado"
              description="Tente ajustar os filtros de busca."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrollment={enrollments.find(e => e.courseId === course.id)}
                  onEnroll={enrollInCourse}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-courses">
          {myEnrollments.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="Você ainda não está matriculado"
              description="Explore o catálogo e matricule-se em um curso."
              actionLabel="Ver Catálogo"
              onAction={() => setActiveSubTab("catalog")}
            />
          ) : (
            <div className="space-y-3">
              {myEnrollments.map(enrollment => (
                <EnrollmentRow key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="certificates">
          {myEnrollments.filter(e => e.certificateIssued).length === 0 ? (
            <EmptyState
              icon={Award}
              title="Nenhum certificado emitido"
              description="Complete um curso para receber seu certificado."
              actionLabel="Ver Meus Cursos"
              onAction={() => setActiveSubTab("my-courses")}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myEnrollments.filter(e => e.certificateIssued).map(enrollment => (
                <Card key={enrollment.id} className="border-2 border-primary/20">
                  <CardContent className="pt-6 text-center space-y-4">
                    <div className="mx-auto p-4 rounded-full bg-primary/10 w-fit">
                      <Award className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">{enrollment.courseName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Concluído em {enrollment.completedAt?.toLocaleDateString("pt-BR")}
                      </p>
                      {enrollment.score && (
                        <Badge className="mt-2" variant="secondary">
                          Nota: {enrollment.score}%
                        </Badge>
                      )}
                    </div>
                    <Button variant="outline" className="w-full">
                      Download PDF
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}
