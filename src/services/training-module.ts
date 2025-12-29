/**
 * PATCH 861: Training Module Service - Schema aligned
 * Uses score (DB) mapped to quiz_score (interface)
 */
import { supabase } from "@/integrations/supabase/client";
import type {
  TrainingModule,
  TrainingCompletion,
  GenerateTrainingModuleRequest,
  GenerateTrainingModuleResponse,
  ExportAuditBundleRequest,
  ExportAuditBundleResponse,
  QuizQuestion
} from "../types/training";

// DB row type for training_modules
interface TrainingModuleRow {
  id: string;
  title?: string;
  description?: string;
  content?: string;
  gap_detected?: string;
  training_content?: string;
  norm_reference?: string;
  quiz?: unknown;
  vessel_id?: string;
  audit_id?: string;
  status?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

// DB row type for training_completions  
interface TrainingCompletionRow {
  id: string;
  training_module_id?: string;
  course_id?: string;
  user_id: string;
  vessel_id?: string;
  completion_date?: string;
  completed_at?: string;
  score?: number;
  quiz_answers?: number[];
  passed?: boolean;
  notes?: string;
  created_at?: string;
}

function mapToTrainingModule(row: TrainingModuleRow): TrainingModule {
  return {
    id: row.id,
    title: row.title || '',
    gap_detected: row.gap_detected || row.description || '',
    norm_reference: row.norm_reference || '',
    training_content: row.training_content || row.content || '',
    quiz: (row.quiz || []) as QuizQuestion[],
    vessel_id: row.vessel_id,
    audit_id: row.audit_id,
    status: (row.status as "active" | "archived" | "draft") || "active",
    created_by: row.created_by,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

function mapToTrainingCompletion(row: TrainingCompletionRow): TrainingCompletion {
  return {
    id: row.id,
    training_module_id: row.training_module_id || row.course_id || '',
    user_id: row.user_id,
    vessel_id: row.vessel_id,
    completed_at: row.completed_at || row.completion_date || new Date().toISOString(),
    quiz_score: row.score || 0,
    quiz_answers: row.quiz_answers || [],
    passed: row.passed || false,
    notes: row.notes,
    created_at: row.created_at || new Date().toISOString(),
  };
}

/**
 * Training Module Service
 * Handles operations for micro training modules based on audit gaps
 */

export class TrainingModuleService {
  /**
   * Generate a new training module from an audit gap using AI
   */
  static async generateTrainingModule(
    request: GenerateTrainingModuleRequest
  ): Promise<GenerateTrainingModuleResponse> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Usuário não autenticado");
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-training-module`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao gerar módulo de treinamento");
    }

    return await response.json();
  }

  /**
   * Get all active training modules
   */
  static async getActiveModules(vesselId?: string): Promise<TrainingModule[]> {
    let query = supabase
      .from("training_modules")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (vesselId) {
      query = query.eq("vessel_id", vesselId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar módulos de treinamento: ${error.message}`);
    }

    return data as TrainingModule[];
  }

  /**
   * Get a specific training module by ID
   */
  static async getModuleById(moduleId: string): Promise<TrainingModule | null> {
    const { data, error } = await supabase
      .from("training_modules")
      .select("*")
      .eq("id", moduleId)
      .single();

    if (error) {
      console.error("Error fetching training module:", error);
      return null;
    }

    return data as TrainingModule;
  }

  /**
   * Record a training completion
   */
  static async recordCompletion(
    moduleId: string,
    quizAnswers: number[],
    vesselId?: string,
    notes?: string
  ): Promise<TrainingCompletion> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Usuário não autenticado");
    }

    // Get the module to calculate score
    const module = await this.getModuleById(moduleId);
    if (!module) {
      throw new Error("Módulo de treinamento não encontrado");
    }

    // Calculate score
    let correctAnswers = 0;
    const quizQuestions = module.quiz as QuizQuestion[];
    
    quizQuestions.forEach((question, index) => {
      if (quizAnswers[index] === question.correct_answer) {
        correctAnswers++;
      }
    });

    const score = quizQuestions.length > 0
      ? Math.round((correctAnswers / quizQuestions.length) * 100)
      : 0;
    
    const passed = score >= 70; // 70% is passing grade

    const { data, error } = await supabase
      .from("training_completions")
      .upsert({
        training_module_id: moduleId,
        user_id: session.user.id,
        vessel_id: vesselId,
        quiz_answers: quizAnswers,
        quiz_score: score,
        passed,
        notes,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao registrar conclusão: ${error.message}`);
    }

    return data as TrainingCompletion;
  }

  /**
   * Get training completions for a user
   */
  static async getUserCompletions(
    userId?: string,
    vesselId?: string
  ): Promise<TrainingCompletion[]> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session && !userId) {
      throw new Error("Usuário não autenticado");
    }

    const targetUserId = userId || session?.user.id;

    let query = supabase
      .from("training_completions")
      .select("*")
      .eq("user_id", targetUserId)
      .order("completed_at", { ascending: false });

    if (vesselId) {
      query = query.eq("vessel_id", vesselId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar conclusões: ${error.message}`);
    }

    return data as TrainingCompletion[];
  }

  /**
   * Get completion statistics for a training module
   */
  static async getModuleStatistics(moduleId: string) {
    const { data, error } = await supabase
      .from("training_completions")
      .select("quiz_score, passed")
      .eq("training_module_id", moduleId);

    if (error) {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }

    const completions = data as TrainingCompletion[];
    const totalCompletions = completions.length;
    const passedCount = completions.filter(c => c.passed).length;
    const averageScore = totalCompletions > 0
      ? completions.reduce((sum, c) => sum + c.quiz_score, 0) / totalCompletions
      : 0;

    return {
      total_completions: totalCompletions,
      passed_count: passedCount,
      pass_rate: totalCompletions > 0 ? (passedCount / totalCompletions) * 100 : 0,
      average_score: averageScore
    };
  }

  /**
   * Export audit bundle for external audits (IBAMA, Petrobras, etc.)
   */
  static async exportAuditBundle(
    request: ExportAuditBundleRequest
  ): Promise<ExportAuditBundleResponse> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Usuário não autenticado");
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-audit-bundle`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao exportar bundle de auditoria");
    }

    return await response.json();
  }
}
