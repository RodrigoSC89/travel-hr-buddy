/**
 * Hook para dados reais de Treinamento e Cursos
 * Substitui dados mockados por dados do Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Course {
  id: string;
  name: string;
  description: string;
  category: string;
  duration_hours: number;
  instructor: string;
  is_published: boolean;
  passing_score: number;
  modules: CourseModule[];
  enrollmentCount: number;
  completionRate: number;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  order: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  progress: number;
  status: "not_started" | "in_progress" | "completed" | "failed";
  startedAt: Date | null;
  completedAt: Date | null;
  score: number | null;
  certificateIssued: boolean;
}

export interface TrainingStats {
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  completedEnrollments: number;
  averageCompletionRate: number;
  totalTrainingHours: number;
}

export function useTrainingData(userId?: string) {
  const queryClient = useQueryClient();

  // Fetch courses
  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ["training-courses"],
    queryFn: async (): Promise<Course[]> => {
      const { data, error } = await supabase
        .from("academy_courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map(course => ({
        id: course.id,
        name: course.course_name,
        description: course.course_description || "",
        category: "safety",
        duration_hours: course.duration_hours || 8,
        instructor: "Instrutor",
        is_published: course.is_published || false,
        passing_score: course.passing_score || 70,
        modules: Array.isArray(course.modules) 
          ? (course.modules as Record<string, unknown>[]).map((m, idx) => ({
              id: (m.id as string) || `module-${idx}`,
              title: (m.title as string) || `Módulo ${idx + 1}`,
              description: (m.description as string) || "",
              duration_minutes: (m.duration as number) || 60,
              order: idx + 1,
            }))
          : [],
        enrollmentCount: 0,
        completionRate: 0,
      }));
    },
    staleTime: 60000,
  });

  // Fetch enrollments (progress)
  const { data: enrollments = [], isLoading: loadingEnrollments } = useQuery({
    queryKey: ["training-enrollments", userId],
    queryFn: async (): Promise<Enrollment[]> => {
      let query = supabase
        .from("academy_progress")
        .select(`
          *,
          academy_courses:course_id (course_name)
        `)
        .order("started_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(progress => ({
        id: progress.id,
        userId: progress.user_id || "",
        courseId: progress.course_id || "",
        courseName: (progress.academy_courses as Record<string, unknown> | null)?.course_name as string || "Curso",
        progress: progress.progress_percent || 0,
        status: mapProgressStatus(progress.status),
        startedAt: progress.started_at ? new Date(progress.started_at) : null,
        completedAt: progress.completed_at ? new Date(progress.completed_at) : null,
        score: (progress.assessment_scores as Record<string, unknown> | null)?.final_score as number | null || null,
        certificateIssued: progress.certificate_issued || false,
      }));
    },
    staleTime: 30000,
  });

  // Fetch training modules
  const { data: trainingModules = [] } = useQuery({
    queryKey: ["training-modules-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_modules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("training-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "academy_progress" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["training-enrollments"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Start course enrollment
  const enrollInCourse = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase.from("academy_progress").insert({
        course_id: courseId,
        user_id: userId,
        status: "enrolled",
        progress_percent: 0,
        started_at: new Date().toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-enrollments"] });
    },
  });

  // Update progress
  const updateProgress = useMutation({
    mutationFn: async ({ enrollmentId, progress, moduleId }: { 
      enrollmentId: string; 
      progress: number;
      moduleId?: number;
    }) => {
      const updates: Record<string, unknown> = {
        progress_percent: progress,
        updated_at: new Date().toISOString(),
      };

      if (moduleId !== undefined) {
        updates.current_module = moduleId;
      }

      if (progress >= 100) {
        updates.status = "completed";
        updates.completed_at = new Date().toISOString();
      } else if (progress > 0) {
        updates.status = "in_progress";
      }

      const { error } = await supabase
        .from("academy_progress")
        .update(updates)
        .eq("id", enrollmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-enrollments"] });
    },
  });

  // Calculate stats
  const stats: TrainingStats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter(c => c.is_published).length,
    totalEnrollments: enrollments.length,
    completedEnrollments: enrollments.filter(e => e.status === "completed").length,
    averageCompletionRate: enrollments.length > 0
      ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
      : 0,
    totalTrainingHours: courses.reduce((acc, c) => acc + c.duration_hours, 0),
  };

  return {
    courses,
    enrollments,
    trainingModules,
    stats,
    isLoading: loadingCourses || loadingEnrollments,
    enrollInCourse: enrollInCourse.mutate,
    updateProgress: updateProgress.mutate,
  };
}

function mapProgressStatus(status: string | null): Enrollment["status"] {
  switch (status?.toLowerCase()) {
    case "completed":
      return "completed";
    case "in_progress":
    case "enrolled":
      return "in_progress";
    case "failed":
      return "failed";
    default:
      return "not_started";
  }
}
