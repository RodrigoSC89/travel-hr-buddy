import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, BookOpen, Award, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function TrainingAcademy() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [durationHours, setDurationHours] = useState<number>(1);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["academy-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: myProgress } = useQuery({
    queryKey: ["my-academy-progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("academy_progress")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("academy_courses")
        .insert({
          course_name: courseName,
          course_description: courseDescription,
          duration_hours: durationHours,
          instructor_id: user.id,
          is_published: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academy-courses"] });
      toast({
        title: "Curso criado",
        description: "O curso foi criado com sucesso.",
      });
      setIsDialogOpen(false);
      setCourseName("");
      setCourseDescription("");
      setDurationHours(1);
    },
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("academy_progress")
        .insert({
          course_id: courseId,
          user_id: user.id,
          status: "enrolled",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-academy-progress"] });
      toast({
        title: "Inscrição realizada",
        description: "Você foi inscrito no curso com sucesso.",
      });
    },
  });

  const getCourseProgress = (courseId: string) => {
    return myProgress?.find((p) => p.course_id === courseId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Training Academy</h1>
          <p className="text-muted-foreground mt-2">
            Academia de Treinamento com Tracking de Progresso
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Curso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Curso</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Curso</label>
                <Input
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Ex: Segurança Marítima Avançada"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  placeholder="Descreva os objetivos do curso..."
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Duração (horas)</label>
                <Input
                  type="number"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  min={1}
                />
              </div>
              <Button
                onClick={() => createCourseMutation.mutate()}
                disabled={!courseName || createCourseMutation.isPending}
                className="w-full"
              >
                {createCourseMutation.isPending ? "Criando..." : "Criar Curso"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Carregando cursos...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses?.map((course) => {
            const progress = getCourseProgress(course.id);
            return (
              <Card key={course.id} className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <BookOpen className="h-8 w-8 text-primary" />
                  {progress && (
                    <Badge variant="default">
                      {progress.status}
                    </Badge>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{course.course_name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {course.course_description}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration_hours}h
                  </div>
                  {progress && (
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      {progress.progress_percent}%
                    </div>
                  )}
                </div>
                {progress ? (
                  <div className="space-y-2">
                    <Progress value={Number(progress.progress_percent)} />
                    <Button variant="outline" size="sm" className="w-full">
                      Continuar Curso
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => enrollMutation.mutate(course.id)}
                    disabled={enrollMutation.isPending}
                    size="sm"
                    className="w-full"
                  >
                    Inscrever-se
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
