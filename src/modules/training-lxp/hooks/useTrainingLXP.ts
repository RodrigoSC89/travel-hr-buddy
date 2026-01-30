/**
 * 🎓 useTrainingLXP Hook
 * AI-powered Learning Experience Platform
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
export interface LearnerProfile {
  learningStyle: { visual: number; auditory: number; kinesthetic: number; reading: number };
  preferredPace: 'slow' | 'medium' | 'fast';
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  strengths: string[];
  challenges: string[];
  optimalStudyTime: string;
}

export interface CurriculumModule {
  order: number;
  title: string;
  type: 'video' | 'reading' | 'interactive' | 'simulation';
  duration: string;
  topics: string[];
  assessment: string;
}

export interface PersonalizedCurriculum {
  title: string;
  objective: string;
  estimatedHours: number;
  modules: CurriculumModule[];
  milestones: Array<{ week: number; target: string }>;
  personalization: {
    focusAreas: string[];
    skipTopics: string[];
    extraResources: string[];
  };
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MicroLesson {
  id: string;
  title: string;
  hook: string;
  concept: string;
  examples: string[];
  application: string;
  quiz: QuizQuestion[];
  xpReward: number;
  badge?: string | null;
  estimatedMinutes: number;
}

export interface GameProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  badges: string[];
  leaderboardPosition: number;
}

export interface VRScenario {
  id: string;
  title: string;
  description: string;
  duration: string;
  environment: {
    location: string;
    visibility?: string;
    conditions?: string;
    hazards: string[];
  };
  objectives: Array<{ id: string; title: string; weight: number }>;
  passingScore: number;
  xpReward: number;
}

export interface AdaptationResult {
  action: 'accelerate' | 'support' | 'maintain';
  reason: string;
  adjustments: Record<string, boolean>;
  message: string;
}

// Hooks
export function useLearnerProfile() {
  return useMutation({
    mutationFn: async ({ learnerId }: { learnerId: string }) => {
      const { data, error } = await supabase.functions.invoke("training-lxp-ai", {
        body: { action: "build-profile", learnerId },
      });
      if (error) throw error;
      return data as LearnerProfile;
    },
    onSuccess: (data) => {
      const topStyle = Object.entries(data.learningStyle)
        .sort(([,a], [,b]) => b - a)[0][0];
      toast.success("🧠 Perfil de Aprendizagem criado", {
        description: `Estilo dominante: ${topStyle} (${data.currentLevel})`,
      });
    },
    onError: (error) => {
      toast.error("Erro ao criar perfil", { description: error.message });
    },
  });
}

export function usePersonalizedCurriculum() {
  return useMutation({
    mutationFn: async ({ learnerId, objective }: { learnerId: string; objective: string }) => {
      const { data, error } = await supabase.functions.invoke("training-lxp-ai", {
        body: { action: "generate-curriculum", learnerId, objective },
      });
      if (error) throw error;
      return data as PersonalizedCurriculum;
    },
    onSuccess: (data) => {
      toast.success("📚 Currículo personalizado criado", {
        description: `${data.modules.length} módulos | ${data.estimatedHours}h estimadas`,
      });
    },
    onError: (error) => {
      toast.error("Erro ao gerar currículo", { description: error.message });
    },
  });
}

export function useMicroLesson() {
  return useMutation({
    mutationFn: async ({ topic }: { topic: string }) => {
      const { data, error } = await supabase.functions.invoke("training-lxp-ai", {
        body: { action: "create-micro-lesson", topic },
      });
      if (error) throw error;
      return data as MicroLesson;
    },
    onSuccess: (data) => {
      toast.success(`🎯 Micro-aula: ${data.title}`, {
        description: `${data.estimatedMinutes} min | ${data.xpReward} XP`,
      });
    },
    onError: (error) => {
      toast.error("Erro ao criar micro-aula", { description: error.message });
    },
  });
}

export function useAdaptContent() {
  return useMutation({
    mutationFn: async (params: {
      learnerId: string;
      moduleId: string;
      score: number;
      timeSpent: number;
      expectedTime: number;
    }) => {
      const { data, error } = await supabase.functions.invoke("training-lxp-ai", {
        body: { action: "adapt-content", ...params },
      });
      if (error) throw error;
      return data as AdaptationResult;
    },
  });
}

export function useGameProgress() {
  return useMutation({
    mutationFn: async ({ learnerId, xpGained, completedLesson }: {
      learnerId: string;
      xpGained: number;
      completedLesson?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("training-lxp-ai", {
        body: { action: "update-progress", learnerId, xpGained, completedLesson },
      });
      if (error) throw error;
      return data as GameProgress;
    },
    onSuccess: (data, variables) => {
      toast.success(`🎮 +${variables.xpGained} XP!`, {
        description: `Level ${data.level} | Streak: ${data.streak} dias`,
      });
    },
  });
}

export function useVRScenario() {
  return useMutation({
    mutationFn: async ({ scenarioType }: { scenarioType: string }) => {
      const { data, error } = await supabase.functions.invoke("training-lxp-ai", {
        body: { action: "get-vr-scenario", scenarioType },
      });
      if (error) throw error;
      return data as VRScenario;
    },
    onSuccess: (data) => {
      toast.success(`🥽 VR: ${data.title}`, {
        description: `${data.duration} | ${data.xpReward} XP`,
      });
    },
  });
}

// Query for training analytics
export function useTrainingAnalytics() {
  return useQuery({
    queryKey: ["training-analytics"],
    queryFn: async () => {
      const { data: courses } = await supabase
        .from("academy_courses")
        .select("*")
        .eq("is_published", true);

      const { data: progress } = await supabase
        .from("academy_progress")
        .select("*");

      const totalCourses = courses?.length || 0;
      const totalEnrollments = progress?.length || 0;
      const avgCompletion = progress?.length 
        ? Math.round(progress.reduce((acc: number, p: any) => acc + (p.progress_percent || 0), 0) / progress.length)
        : 0;

      return {
        totalCourses,
        totalEnrollments,
        avgCompletion,
        activeLearners: new Set(progress?.map((p: any) => p.user_id)).size,
        certificatesIssued: progress?.filter((p: any) => p.certificate_issued).length || 0,
        topCourses: courses?.slice(0, 5).map((c: any) => ({
          id: c.id,
          name: c.course_name,
          enrollments: progress?.filter((p: any) => p.course_id === c.id).length || 0,
        })) || [],
        vrScenarios: [
          { id: "fire-fighting", name: "Fire Fighting", completions: 45 },
          { id: "abandon-ship", name: "Abandon Ship", completions: 38 },
          { id: "medical-emergency", name: "Medical Emergency", completions: 52 },
        ],
      };
    },
  });
}
