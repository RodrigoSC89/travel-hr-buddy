import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  TrendingUp
} from "lucide-react";

interface Certificate {
  id: string;
  certificate_number: string;
  issued_date: string;
  expiry_date?: string;
  is_valid: boolean;
  final_score: number;
  courses: {
    title: string;
    category: string;
  };
}

interface CourseEnrollment {
  id: string;
  status: string;
  overall_progress: number;
  enrolled_at: string;
  courses: {
    title: string;
    description: string;
    duration_hours: number;
  };
}

export default function EmployeePortalTraining() {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // Fetch user certificates
  const { data: certificates = [] } = useQuery<Certificate[]>({
    queryKey: ["user-certificates", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certifications")
        .select("*, courses(title, category)")
        .eq("user_id", user?.id)
        .eq("is_valid", true)
        .order("issued_date", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Fetch active enrollments
  const { data: enrollments = [] } = useQuery<CourseEnrollment[]>({
    queryKey: ["user-enrollments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_enrollments")
        .select("*, courses(title, description, duration_hours)")
        .eq("user_id", user?.id)
        .in("status", ["enrolled", "in_progress"])
        .order("enrolled_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty_level: string;
    duration_hours: number;
    is_published: boolean;
  }

  // Fetch available courses
  const { data: availableCourses = [] } = useQuery<Course[]>({
    queryKey: ["available-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleEnroll = async (courseId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("course_enrollments")
      .insert({
        user_id: user.id,
        course_id: courseId,
        status: "enrolled"
      });

    if (error) {
      toast({
        title: "Erro na matrícula",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Matrícula realizada",
        description: "Você foi matriculado no curso com sucesso"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          Meus Treinamentos
        </h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe seu progresso e certificações
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {certificates.length}
            </div>
            <p className="text-xs text-muted-foreground">ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {enrollments.length}
            </div>
            <p className="text-xs text-muted-foreground">cursos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {enrollments.length > 0 
                ? Math.round(enrollments.reduce((sum, e) => sum + e.overall_progress, 0) / enrollments.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">média</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Courses */}
      {enrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cursos em Andamento</CardTitle>
            <CardDescription>
              Continue de onde parou
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold">{enrollment.courses.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {enrollment.courses.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{enrollment.status}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {enrollment.courses.duration_hours}h
                        </span>
                      </div>
                    </div>
                    <Button size="sm">Continuar</Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{enrollment.overall_progress}%</span>
                    </div>
                    <Progress value={enrollment.overall_progress} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificates */}
      <Card>
        <CardHeader>
          <CardTitle>Meus Certificados</CardTitle>
          <CardDescription>
            Certificados conquistados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {certificates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Você ainda não possui certificados. Complete um curso para receber seu primeiro certificado!
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {certificates.map((cert) => (
                <Card key={cert.id} className="border-2 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Award className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h4 className="font-semibold">{cert.courses.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Válido
                          </Badge>
                          <Badge variant="outline">{cert.courses.category}</Badge>
                        </div>
                        <div className="text-sm space-y-1 text-muted-foreground">
                          <p>Nº: {cert.certificate_number}</p>
                          <p>Emitido: {new Date(cert.issued_date).toLocaleDateString()}</p>
                          {cert.expiry_date && (
                            <p>Válido até: {new Date(cert.expiry_date).toLocaleDateString()}</p>
                          )}
                          <p>Nota Final: {cert.final_score}%</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Baixar Certificado
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Cursos Disponíveis</CardTitle>
          <CardDescription>
            Explore novos cursos e expanda seus conhecimentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableCourses.map((course) => (
              <Card key={course.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold">{course.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{course.category}</Badge>
                      <Badge variant="outline">{course.difficulty_level}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {course.duration_hours}h
                      </span>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => handleEnroll(course.id)}
                    >
                      Matricular-se
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
