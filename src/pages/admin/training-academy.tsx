import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Users,
  Award,
  TrendingUp,
  FileVideo,
  Upload,
  Eye,
  CheckCircle2
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  duration_hours: number;
  is_published: boolean;
  is_mandatory: boolean;
  instructor_name: string;
  thumbnail_url?: string;
  created_at: string;
}

interface Enrollment {
  id: string;
  course_id: string;
  user_id: string;
  status: string;
  overall_progress: number;
  enrolled_at: string;
  courses: {
    title: string;
  };
}

export default function TrainingAcademyAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    category: "technical",
    difficulty_level: "beginner",
    duration_hours: 1,
    is_published: false,
    is_mandatory: false,
    instructor_name: ""
  });

  // Fetch courses
  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await (supabase as unknown)
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch enrollments
  const { data: enrollments = [] } = useQuery<Enrollment[]>({
    queryKey: ["course-enrollments"],
    queryFn: async () => {
      const { data, error } = await (supabase as unknown)
        .from("course_enrollments")
        .select("*, courses(title)")
        .order("enrolled_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ["training-stats"],
    queryFn: async () => {
      const [coursesCount, enrollmentsCount, completedCount, certificatesCount] = await Promise.all([
        (supabase as unknown).from("courses").select("id", { count: "exact", head: true }),
        (supabase as unknown).from("course_enrollments").select("id", { count: "exact", head: true }),
        (supabase as unknown).from("course_enrollments").select("id", { count: "exact", head: true }).eq("status", "completed"),
        (supabase as unknown).from("certifications").select("id", { count: "exact", head: true }).eq("is_valid", true)
      ]);

      return {
        total_courses: coursesCount.count || 0,
        total_enrollments: enrollmentsCount.count || 0,
        completed_courses: completedCount.count || 0,
        active_certificates: certificatesCount.count || 0
      };
    }
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: typeof newCourse) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await (supabase as unknown)
        .from("courses")
        .insert({
          ...courseData,
          created_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({
        title: "Curso criado",
        description: "O curso foi criado com sucesso.",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: SupabaseError | null) => {
      toast({
        title: "Erro ao criar curso",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Course> }) => {
      const { data, error } = await (supabase as unknown)
        .from("courses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({
        title: "Curso atualizado",
        description: "O curso foi atualizado com sucesso.",
};
      setEditingCourse(null);
    },
    onError: (error: SupabaseError | null) => {
      toast({
        title: "Erro ao atualizar curso",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await (supabase as unknown)
        .from("courses")
        .delete()
        .eq("id", courseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({
        title: "Curso deletado",
        description: "O curso foi removido com sucesso.",
      });
    },
    onError: (error: SupabaseError | null) => {
      toast({
        title: "Erro ao deletar curso",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setNewCourse({
      title: "",
      description: "",
      category: "technical",
      difficulty_level: "beginner",
      duration_hours: 1,
      is_published: false,
      is_mandatory: false,
      instructor_name: ""
    };
  };

  const handleCreateCourse = () => {
    createCourseMutation.mutate(newCourse);
  };

  const togglePublishStatus = (course: Course) => {
    updateCourseMutation.mutate({
      id: course.id,
      updates: { is_published: !course.is_published }
    };
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm("Tem certeza que deseja deletar este curso?")) {
      deleteCourseMutation.mutate(courseId);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            Training Academy - Administração
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestão completa de cursos, matrículas e certificações
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Curso</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo curso de treinamento
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título do Curso</Label>
                <Input
                  id="title"
                  value={newCourse.title}
                  onChange={handleChange})}
                  placeholder="Ex: Operações DP Avançadas"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={handleChange})}
                  placeholder="Descrição detalhada do curso"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={newCourse.category}
                    onValueChange={(value) => setNewCourse({ ...newCourse, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Técnico</SelectItem>
                      <SelectItem value="safety">Segurança</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="leadership">Liderança</SelectItem>
                      <SelectItem value="operations">Operações</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="difficulty">Nível de Dificuldade</Label>
                  <Select
                    value={newCourse.difficulty_level}
                    onValueChange={(value) => setNewCourse({ ...newCourse, difficulty_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Iniciante</SelectItem>
                      <SelectItem value="intermediate">Intermediário</SelectItem>
                      <SelectItem value="advanced">Avançado</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duração (horas)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newCourse.duration_hours}
                    onChange={handleChange})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="instructor">Instrutor</Label>
                  <Input
                    id="instructor"
                    value={newCourse.instructor_name}
                    onChange={handleChange})}
                    placeholder="Nome do instrutor"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleSetIsCreateDialogOpen}>
                Cancelar
              </Button>
              <Button onClick={handleCreateCourse} disabled={!newCourse.title}>
                Criar Curso
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_courses || 0}</div>
            <p className="text-xs text-muted-foreground">cursos disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matrículas Ativas</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.total_enrollments || 0}
            </div>
            <p className="text-xs text-muted-foreground">usuários matriculados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Concluídos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.completed_courses || 0}
            </div>
            <p className="text-xs text-muted-foreground">finalizados com sucesso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados Emitidos</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.active_certificates || 0}
            </div>
            <p className="text-xs text-muted-foreground">certificados válidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">
            <BookOpen className="w-4 h-4 mr-2" />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="enrollments">
            <Users className="w-4 h-4 mr-2" />
            Matrículas
          </TabsTrigger>
          <TabsTrigger value="certificates">
            <Award className="w-4 h-4 mr-2" />
            Certificados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Cursos</CardTitle>
              <CardDescription>
                Lista de todos os cursos disponíveis na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Carregando cursos...</div>
              ) : courses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum curso cadastrado. Clique em "Novo Curso" para começar.
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{course.title}</h3>
                            {course.is_published ? (
                              <Badge className="bg-green-100 text-green-800">Publicado</Badge>
                            ) : (
                              <Badge variant="outline">Rascunho</Badge>
                            )}
                            {course.is_mandatory && (
                              <Badge className="bg-orange-100 text-orange-800">Obrigatório</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{course.description}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>📚 {course.category}</span>
                            <span>⏱️ {course.duration_hours}h</span>
                            <span>🎓 {course.difficulty_level}</span>
                            {course.instructor_name && <span>👨‍🏫 {course.instructor_name}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handletogglePublishStatus}
                          >
                            {course.is_published ? (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Despublicar
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Publicar
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSetEditingCourse}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlehandleDeleteCourse}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Matrículas dos Usuários</CardTitle>
              <CardDescription>
                Acompanhe o progresso dos usuários nos cursos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma matrícula registrada ainda
                </div>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <h4 className="font-semibold">
                            {enrollment.courses?.title || "Curso não encontrado"}
                          </h4>
                          <div className="flex gap-4 text-sm">
                            <Badge variant={
                              enrollment.status === "completed" ? "default" : "secondary"
                            }>
                              {enrollment.status}
                            </Badge>
                            <span className="text-muted-foreground">
                              Progresso: {enrollment.overall_progress}%
                            </span>
                            <span className="text-muted-foreground">
                              Matriculado em: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificados Emitidos</CardTitle>
              <CardDescription>
                Histórico de certificações dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Funcionalidade de visualização de certificados em desenvolvimento
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
