/**
 * PATCH 861: Training Module Service - Schema aligned
 * Uses DB field names: score, completion_date, mapped to interface fields
 */
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';
import type {
  TrainingModule,
  TrainingCompletion,
  GenerateTrainingModuleRequest,
  GenerateTrainingModuleResponse,
  ExportAuditBundleRequest,
  ExportAuditBundleResponse,
  QuizQuestion
} from "../types/training";

/**
 * Map DB row to TrainingModule interface
 */
function mapToTrainingModule(row: Record<string, unknown>): TrainingModule {
  return {
    id: String(row.id || ''),
    title: String(row.title || ''),
    gap_detected: String(row.gap_detected || row.description || ''),
    norm_reference: String(row.norm_reference || ''),
    training_content: String(row.training_content || row.content || ''),
    quiz: Array.isArray(row.quiz) ? row.quiz as QuizQuestion[] : [],
    vessel_id: row.vessel_id as string | undefined,
    audit_id: row.audit_id as string | undefined,
    status: (row.status as "active" | "archived" | "draft") || "active",
    created_by: row.created_by as string | undefined,
    created_at: String(row.created_at || new Date().toISOString()),
    updated_at: String(row.updated_at || new Date().toISOString()),
  };
}

/**
 * Map DB row to TrainingCompletion interface
 * DB uses: score, completion_date
 * Interface uses: quiz_score, completed_at
 */
function mapToTrainingCompletion(row: Record<string, unknown>): TrainingCompletion {
  return {
    id: String(row.id || ''),
    training_module_id: String(row.training_module_id || row.course_id || ''),
    user_id: String(row.user_id || ''),
    vessel_id: row.vessel_id as string | undefined,
    completed_at: String(row.completed_at || row.completion_date || new Date().toISOString()),
    quiz_score: Number(row.score || 0),
    quiz_answers: Array.isArray(row.quiz_answers) ? row.quiz_answers as number[] : [],
    passed: Boolean(row.passed),
    notes: row.notes as string | undefined,
    created_at: String(row.created_at || new Date().toISOString()),
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
      `https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/generate-training-module`,
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

    return (data || []).map(row => mapToTrainingModule(row as Record<string, unknown>));
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
      logger.error("Error fetching training module:", error);
      return null;
    }

    return mapToTrainingModule(data as Record<string, unknown>);
  }

  /**
   * Record a training completion
   * Writes to DB fields: score, completion_date
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
    const quizQuestions = module.quiz;
    
    quizQuestions.forEach((question, index) => {
      if (quizAnswers[index] === question.correct_answer) {
        correctAnswers++;
      }
    });

    const score = quizQuestions.length > 0
      ? Math.round((correctAnswers / quizQuestions.length) * 100)
      : 0;
    
    const passed = score >= 70;

    // Use DB column names: score, completion_date
    const { data, error } = await supabase
      .from("training_completions")
      .upsert({
        training_module_id: moduleId,
        user_id: session.user.id,
        vessel_id: vesselId,
        score: score,
        passed,
        metadata: { quiz_answers: quizAnswers, notes },
        completion_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao registrar conclusão: ${error.message}`);
    }

    return mapToTrainingCompletion(data as Record<string, unknown>);
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
    
    if (!targetUserId) {
      throw new Error("ID de usuário não disponível");
    }

    let query = supabase
      .from("training_completions")
      .select("*")
      .eq("user_id", targetUserId)
      .order("completion_date", { ascending: false });

    if (vesselId) {
      query = query.eq("vessel_id", vesselId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar conclusões: ${error.message}`);
    }

    return (data || []).map(row => mapToTrainingCompletion(row as Record<string, unknown>));
  }

  /**
   * Get completion statistics for a training module
   * Uses DB field: score
   */
  static async getModuleStatistics(moduleId: string) {
    const { data, error } = await supabase
      .from("training_completions")
      .select("score, passed")
      .eq("training_module_id", moduleId);

    if (error) {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }

    const completions = (data || []) as Array<{ score: number | null; passed: boolean | null }>;
    const totalCompletions = completions.length;
    const passedCount = completions.filter(c => c.passed).length;
    const averageScore = totalCompletions > 0
      ? completions.reduce((sum, c) => sum + (c.score || 0), 0) / totalCompletions
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
      `https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/export-audit-bundle`,
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