/**
 * Training Command Center - PATCH 900
 * Full CRUD for courses, enrollments, and certifications
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  GraduationCap, BookOpen, Users, Award, Plus, Search, 
  Play, Pause, CheckCircle2, Clock, Edit, Trash2, Eye,
  UserPlus, Calendar, TrendingUp, BarChart3
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  category: "safety" | "technical" | "compliance" | "leadership" | "emergency";
  duration: number; // hours
  status: "draft" | "published" | "archived";
  instructor: string;
  enrolledCount: number;
  completedCount: number;
  passRate: number;
  modules: number;
  isMandatory: boolean;
}

interface Enrollment {
  id: string;
  crewName: string;
  courseId: string;
  courseTitle: string;
  enrolledDate: string;
  dueDate: string;
  progress: number;
  status: "not_started" | "in_progress" | "completed" | "failed" | "overdue";
  score?: number;
}

export const TrainingCommandCenter: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("courses");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [courses, setCourses] = useState<Course[]>([
    {
      id: "CRS-001",
      title: "STCW Basic Safety Training",
      category: "safety",
      duration: 40,
      status: "published",
      instructor: "Capt. James Wilson",
      enrolledCount: 45,
      completedCount: 38,
      passRate: 94,
      modules: 8,
      isMandatory: true
    },
    {
      id: "CRS-002",
      title: "Bridge Resource Management",
      category: "technical",
      duration: 24,
      status: "published",
      instructor: "Capt. Maria Santos",
      enrolledCount: 22,
      completedCount: 18,
      passRate: 89,
      modules: 6,
      isMandatory: false
    },
    {
      id: "CRS-003",
      title: "ISM Code Compliance",
      category: "compliance",
      duration: 16,
      status: "draft",
      instructor: "Dr. Carlos Silva",
      enrolledCount: 0,
      completedCount: 0,
      passRate: 0,
      modules: 4,
      isMandatory: true
    }
  ]);

  const [enrollments, setEnrollments] = useState<Enrollment[]>([
    {
      id: "ENR-001",
      crewName: "João Silva",
      courseId: "CRS-001",
      courseTitle: "STCW Basic Safety Training",
      enrolledDate: "2024-01-15",
      dueDate: "2024-03-15",
      progress: 75,
      status: "in_progress"
    },
    {
      id: "ENR-002",
      crewName: "Maria Santos",
      courseId: "CRS-001",
      courseTitle: "STCW Basic Safety Training",
      enrolledDate: "2024-01-10",
      dueDate: "2024-03-10",
      progress: 100,
      status: "completed",
      score: 92
    },
    {
      id: "ENR-003",
      crewName: "Carlos Oliveira",
      courseId: "CRS-002",
      courseTitle: "Bridge Resource Management",
      enrolledDate: "2024-02-01",
      dueDate: "2024-02-28",
      progress: 30,
      status: "overdue"
    }
  ]);

  const [newCourse, setNewCourse] = useState({
    title: "",
    category: "safety" as Course["category"],
    duration: 8,
    instructor: "",
    modules: 4,
    isMandatory: false
  });

  const [newEnrollment, setNewEnrollment] = useState({
    crewName: "",
    courseId: "",
    dueDate: ""
  });

  const handleCreateCourse = () => {
    if (!newCourse.title || !newCourse.instructor) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    const course: Course = {
      id: `CRS-${String(courses.length + 1).padStart(3, "0")}`,
      ...newCourse,
      status: "draft",
      enrolledCount: 0,
      completedCount: 0,
      passRate: 0
    };

    setCourses([course, ...courses]);
    setShowCourseDialog(false);
    setNewCourse({ title: "", category: "safety", duration: 8, instructor: "", modules: 4, isMandatory: false });
    toast({ title: "Curso Criado", description: `${course.title} criado como rascunho` });
  };

  const handlePublishCourse = (course: Course) => {
    setCourses(courses.map(c => 
      c.id === course.id ? { ...c, status: "published" as const } : c
    ));
    toast({ title: "Curso Publicado", description: `${course.title} está disponível para inscrições` });
  };

  const handleArchiveCourse = (course: Course) => {
    setCourses(courses.map(c => 
      c.id === course.id ? { ...c, status: "archived" as const } : c
    ));
    toast({ title: "Curso Arquivado", description: `${course.title} foi arquivado` });
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
    toast({ title: "Curso Removido", description: "Curso deletado com sucesso" });
  };

  const handleCreateEnrollment = () => {
    if (!newEnrollment.crewName || !newEnrollment.courseId || !newEnrollment.dueDate) {
      toast({ title: "Erro", description: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    const course = courses.find(c => c.id === newEnrollment.courseId);
    if (!course) return;

    const enrollment: Enrollment = {
      id: `ENR-${String(enrollments.length + 1).padStart(3, "0")}`,
      crewName: newEnrollment.crewName,
      courseId: newEnrollment.courseId,
      courseTitle: course.title,
      enrolledDate: new Date().toISOString().split("T")[0],
      dueDate: newEnrollment.dueDate,
      progress: 0,
      status: "not_started"
    };

    setEnrollments([enrollment, ...enrollments]);
    setCourses(courses.map(c => 
      c.id === course.id ? { ...c, enrolledCount: c.enrolledCount + 1 } : c
    ));
    setShowEnrollDialog(false);
    setNewEnrollment({ crewName: "", courseId: "", dueDate: "" });
    toast({ title: "Matrícula Realizada", description: `${enrollment.crewName} matriculado em ${course.title}` });
  };

  const handleStartTraining = (enrollment: Enrollment) => {
    setEnrollments(enrollments.map(e => 
      e.id === enrollment.id ? { ...e, status: "in_progress" as const, progress: 10 } : e
    ));
    toast({ title: "Treinamento Iniciado", description: `${enrollment.crewName} começou o curso` });
  };

  const handleCompleteTraining = (enrollment: Enrollment) => {
    const score = Math.floor(Math.random() * 30) + 70;
    setEnrollments(enrollments.map(e => 
      e.id === enrollment.id ? { ...e, status: "completed" as const, progress: 100, score } : e
    ));
    
    // Update course stats
    setCourses(courses.map(c => 
      c.id === enrollment.courseId ? { 
        ...c, 
        completedCount: c.completedCount + 1,
        passRate: Math.round(((c.completedCount + 1) / c.enrolledCount) * 100)
      } : c
    ));
    
    toast({ title: "Treinamento Concluído", description: `Score: ${score}%` });
  };

  const getCategoryBadge = (category: Course["category"]) => {
    const config = {
      safety: { color: "bg-red-500/20 text-red-400", label: "Segurança" },
      technical: { color: "bg-blue-500/20 text-blue-400", label: "Técnico" },
      compliance: { color: "bg-purple-500/20 text-purple-400", label: "Compliance" },
      leadership: { color: "bg-green-500/20 text-green-400", label: "Liderança" },
      emergency: { color: "bg-orange-500/20 text-orange-400", label: "Emergência" }
    };
    const { color, label } = config[category];
    return <Badge className={color}>{label}</Badge>;
  };

  const getStatusBadge = (status: Course["status"]) => {
    const config = {
      draft: { color: "bg-gray-500/20 text-gray-400", label: "Rascunho" },
      published: { color: "bg-green-500/20 text-green-400", label: "Publicado" },
      archived: { color: "bg-yellow-500/20 text-yellow-400", label: "Arquivado" }
    };
    const { color, label } = config[status];
    return <Badge className={color}>{label}</Badge>;
  };

  const getEnrollmentStatusBadge = (status: Enrollment["status"]) => {
    const config = {
      not_started: { color: "bg-gray-500/20 text-gray-400", label: "Não Iniciado" },
      in_progress: { color: "bg-blue-500/20 text-blue-400", label: "Em Andamento" },
      completed: { color: "bg-green-500/20 text-green-400", label: "Concluído" },
      failed: { color: "bg-red-500/20 text-red-400", label: "Reprovado" },
      overdue: { color: "bg-orange-500/20 text-orange-400", label: "Atrasado" }
    };
    const { color, label } = config[status];
    return <Badge className={color}>{label}</Badge>;
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter(e => 
    e.crewName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(c => c.status === "published").length;
  const totalEnrollments = enrollments.length;
  const completedEnrollments = enrollments.filter(e => e.status === "completed").length;
  const avgProgress = enrollments.reduce((sum, e) => sum + e.progress, 0) / (enrollments.length || 1);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Training Command Center</h1>
            <p className="text-muted-foreground">Gestão de Cursos e Treinamentos</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cursos Ativos</p>
                <p className="text-2xl font-bold">{publishedCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Matrículas</p>
                <p className="text-2xl font-bold">{totalEnrollments}</p>
              </div>
              <Users className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">{completedEnrollments}</p>
              </div>
              <Award className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progresso Médio</p>
                <p className="text-2xl font-bold">{avgProgress.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCourseDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Curso
            </Button>
            <Button variant="outline" onClick={() => setShowEnrollDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Nova Matrícula
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="courses">
                <BookOpen className="h-4 w-4 mr-2" />
                Cursos ({filteredCourses.length})
              </TabsTrigger>
              <TabsTrigger value="enrollments">
                <Users className="h-4 w-4 mr-2" />
                Matrículas ({filteredEnrollments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="mt-4">
              <div className="space-y-3">
                {filteredCourses.map((course) => (
                  <div 
                    key={course.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{course.title}</span>
                          {getCategoryBadge(course.category)}
                          {getStatusBadge(course.status)}
                          {course.isMandatory && <Badge variant="destructive">Obrigatório</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>👤 {course.instructor}</span>
                          <span>⏱️ {course.duration}h</span>
                          <span>📚 {course.modules} módulos</span>
                          <span>👥 {course.enrolledCount} inscritos</span>
                          {course.passRate > 0 && <span>✅ {course.passRate}% aprovação</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {course.status === "draft" && (
                        <Button size="sm" onClick={() => handlePublishCourse(course)}>
                          Publicar
                        </Button>
                      )}
                      {course.status === "published" && (
                        <Button size="sm" variant="outline" onClick={() => handleArchiveCourse(course)}>
                          Arquivar
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="enrollments" className="mt-4">
              <div className="space-y-3">
                {filteredEnrollments.map((enrollment) => (
                  <div 
                    key={enrollment.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{enrollment.crewName}</span>
                          {getEnrollmentStatusBadge(enrollment.status)}
                          {enrollment.score && (
                            <Badge variant="outline">Score: {enrollment.score}%</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>📚 {enrollment.courseTitle}</span>
                          <span>📅 Prazo: {enrollment.dueDate}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Progress value={enrollment.progress} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground w-12">{enrollment.progress}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {enrollment.status === "not_started" && (
                        <Button size="sm" onClick={() => handleStartTraining(enrollment)}>
                          <Play className="h-4 w-4 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      {enrollment.status === "in_progress" && (
                        <Button size="sm" onClick={() => handleCompleteTraining(enrollment)}>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Concluir
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* New Course Dialog */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Curso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título do Curso</Label>
              <Input
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                placeholder="Ex: STCW Basic Safety Training"
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select
                value={newCourse.category}
                onValueChange={(v) => setNewCourse({ ...newCourse, category: v as Course["category"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safety">Segurança</SelectItem>
                  <SelectItem value="technical">Técnico</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="leadership">Liderança</SelectItem>
                  <SelectItem value="emergency">Emergência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Instrutor</Label>
              <Input
                value={newCourse.instructor}
                onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                placeholder="Nome do instrutor"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duração (horas)</Label>
                <Input
                  type="number"
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse({ ...newCourse, duration: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Módulos</Label>
                <Input
                  type="number"
                  value={newCourse.modules}
                  onChange={(e) => setNewCourse({ ...newCourse, modules: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newCourse.isMandatory}
                onChange={(e) => setNewCourse({ ...newCourse, isMandatory: e.target.checked })}
                className="rounded"
              />
              <Label>Curso Obrigatório</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCourseDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCourse}>Criar Curso</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Enrollment Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Matrícula</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do Tripulante</Label>
              <Input
                value={newEnrollment.crewName}
                onChange={(e) => setNewEnrollment({ ...newEnrollment, crewName: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label>Curso</Label>
              <Select
                value={newEnrollment.courseId}
                onValueChange={(v) => setNewEnrollment({ ...newEnrollment, courseId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.filter(c => c.status === "published").map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prazo de Conclusão</Label>
              <Input
                type="date"
                value={newEnrollment.dueDate}
                onChange={(e) => setNewEnrollment({ ...newEnrollment, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnrollDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateEnrollment}>Matricular</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingCommandCenter;
