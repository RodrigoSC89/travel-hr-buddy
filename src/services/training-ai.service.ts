// PATCH 598: Training AI Service
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import type {
  AITrainingSession,
  AITrainingHistory,
  TrainingLearningPath,
  TrainingStats,
  LLMExplanationRequest,
  LLMExplanationResponse,
  QuizGenerationRequest,
  QuizGenerationResponse,
  QuizQuestion,
} from "@/types/training-ai";

const PASSING_SCORE = 70;
const DEFAULT_HISTORY_INTERACTION_TYPE = "quiz_question";

type TrainingSessionRow = Tables<"ai_training_sessions">;
type TrainingSessionInsert = TablesInsert<"ai_training_sessions">;
type TrainingSessionUpdate = TablesUpdate<"ai_training_sessions">;
type TrainingHistoryRow = Tables<"ai_training_history">;
type TrainingHistoryInsert = TablesInsert<"ai_training_history">;
type LearningPathRow = Tables<"training_learning_paths">;
type LearningPathInsert = TablesInsert<"training_learning_paths">;

type SessionContent = {
  module?: string;
  explanation?: string | null;
  quiz_data?: QuizQuestion[];
  non_conformity_id?: string | null;
  metadata?: Record<string, unknown>;
  passed?: boolean;
};

type HistoryInteractionData = {
  question?: string;
  answer?: string | null;
  correct_answer?: string;
  explanation?: string | null;
  is_correct?: boolean | null;
};

export class TrainingAIService {
  /**
   * Fetch all sessions for a crew member with domain-friendly mapping.
   */
  static async getTrainingSessions(crewMemberId: string): Promise<AITrainingSession[]> {
    const { data, error } = await supabase
      .from("ai_training_sessions")
      .select("*")
      .eq("crew_member_id", crewMemberId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => this.mapSessionRow(row));
  }

  /**
   * Create a new training session (requires organization context).
   */
  static async createTrainingSession(
    session: Partial<AITrainingSession>,
    options: { organizationId: string; sessionType?: string }
  ): Promise<AITrainingSession> {
    const payload = this.buildTrainingSessionInsert(session, options);
    const { data, error } = await supabase
      .from("ai_training_sessions")
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return this.mapSessionRow(data);
  }

  /**
   * Update a training session with safe JSON conversions.
   */
  static async updateTrainingSession(
    id: string,
    updates: Partial<AITrainingSession>
  ): Promise<AITrainingSession> {
    const payload = this.buildTrainingSessionUpdate(updates);

    const { data, error } = await supabase
      .from("ai_training_sessions")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return this.mapSessionRow(data);
  }

  /**
   * Helper to close a session and set pass/fail information.
   */
  static async completeTrainingSession(
    id: string,
    score: number,
    durationMinutes: number
  ): Promise<AITrainingSession> {
    const passed = score >= PASSING_SCORE;
    return this.updateTrainingSession(id, {
      score,
      passed,
      duration_minutes: durationMinutes,
      completed_at: new Date().toISOString(),
    });
  }

  /**
   * Retrieve the interaction history of a session ordered chronologically.
   */
  static async getTrainingHistory(sessionId: string): Promise<AITrainingHistory[]> {
    const { data, error } = await supabase
      .from("ai_training_history")
      .select("*")
      .eq("session_id", sessionId)
      .order("occurred_at", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => this.mapHistoryRow(row));
  }

  /**
   * Store a new training history entry (requires organization context).
   */
  static async addTrainingHistory(
    history: Partial<AITrainingHistory>,
    options: { organizationId: string; interactionType?: string }
  ): Promise<AITrainingHistory> {
    const payload = this.buildTrainingHistoryInsert(history, options);

    const { data, error } = await supabase
      .from("ai_training_history")
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return this.mapHistoryRow(data);
  }

  /**
   * List learning paths for a specific crew member.
   */
  static async getLearningPaths(crewMemberId: string): Promise<TrainingLearningPath[]> {
    const { data, error } = await supabase
      .from("training_learning_paths")
      .select("*")
      .eq("crew_member_id", crewMemberId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => this.mapLearningPathRow(row));
  }

  /**
   * Create a new learning path entry.
   */
  static async createLearningPath(
    path: TrainingLearningPath,
    options: { organizationId: string }
  ): Promise<TrainingLearningPath> {
    const payload = this.buildLearningPathInsert(path, options.organizationId);

    const { data, error } = await supabase
      .from("training_learning_paths")
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return this.mapLearningPathRow(data);
  }

  /**
   * Build training stats locally to avoid RPC mismatches.
   */
  static async getTrainingStats(
    crewMemberId: string,
    options?: { sessions?: AITrainingSession[] }
  ): Promise<TrainingStats> {
    const sessions = options?.sessions ?? (await this.getTrainingSessions(crewMemberId));
    return this.calculateTrainingStats(sessions);
  }

  /**
   * Deterministic calculation of training stats based on existing sessions.
   */
  static calculateTrainingStats(sessions: AITrainingSession[]): TrainingStats {
    if (!sessions.length) {
      return {
        total_sessions: 0,
        completed_sessions: 0,
        average_score: 0,
        pass_rate: 0,
        total_duration_minutes: 0,
        modules_trained: [],
      };
    }

    const completed = sessions.filter((session) => Boolean(session.completed_at));
    const totalDuration = sessions.reduce(
      (sum, session) => sum + (session.duration_minutes ?? 0),
      0
    );
    const averageScore = completed.length
      ? completed.reduce((sum, session) => sum + (session.score ?? 0), 0) / completed.length
      : 0;
    const passRate = completed.length
      ? (completed.filter((session) => session.passed).length / completed.length) * 100
      : 0;
    const modules = Array.from(new Set(sessions.map((session) => session.module).filter(Boolean)));

    return {
      total_sessions: sessions.length,
      completed_sessions: completed.length,
      average_score: Number(averageScore.toFixed(2)),
      pass_rate: Number(passRate.toFixed(2)),
      total_duration_minutes: totalDuration,
      modules_trained: modules,
    };
  }

  /**
   * Invoke the explanation edge function with typed payload.
   */
  static async getLLMExplanation(
    request: LLMExplanationRequest
  ): Promise<LLMExplanationResponse> {
    const { data, error } = await supabase.functions.invoke("generate-training-explanation", {
      body: request,
    });

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Invoke the quiz generation function with typed payload.
   */
  static async generateQuiz(
    request: QuizGenerationRequest
  ): Promise<QuizGenerationResponse> {
    const { data, error } = await supabase.functions.invoke("generate-training-quiz", {
      body: request,
    });

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Export the user training history to CSV using mapped sessions.
   */
  static async exportTrainingHistory(crewMemberId: string): Promise<string> {
    const sessions = await this.getTrainingSessions(crewMemberId);

    let csv = "Session ID,Module,Topic,Score,Passed,Duration (minutes),Created At,Completed At\n";

    sessions.forEach((session) => {
      csv += `${session.id},${session.module},${session.topic},${session.score ?? "N/A"},${session.passed ? "Yes" : "No"},${session.duration_minutes ?? "N/A"},${new Date(session.created_at).toLocaleDateString()},${session.completed_at ? new Date(session.completed_at).toLocaleDateString() : "In Progress"}\n`;
    });

    return csv;
  }

  private static mapSessionRow(row: TrainingSessionRow): AITrainingSession {
    const crewMemberId = this.ensureString(
      row.crew_member_id,
      "Training session is missing crew_member_id"
    );

    const content = (row.content as SessionContent | null) ?? {};
    const llmFeedback = (row.ai_feedback as Record<string, unknown>) ?? {};
    const quizData = Array.isArray(content.quiz_data) ? (content.quiz_data as QuizQuestion[]) : [];
    const metadata: Record<string, unknown> = {
      ...((row.performance_metrics as Record<string, unknown>) ?? {}),
      ...((row.personalization_data as Record<string, unknown>) ?? {}),
      ...((content.metadata as Record<string, unknown>) ?? {}),
      difficulty_level: row.difficulty_level,
      status: row.status,
      session_type: row.session_type,
    };

    const passed =
      typeof content.passed === "boolean"
        ? content.passed
        : Boolean(
          row.completed_at &&
              (row.status === "completed" || (row.final_score ?? 0) >= PASSING_SCORE)
        );

    return {
      id: row.id,
      crew_member_id: crewMemberId,
      non_conformity_id: content.non_conformity_id ?? null,
      module: content.module ?? row.session_type ?? "General",
      topic: row.topic,
      explanation: content.explanation ?? null,
      llm_feedback: llmFeedback,
      quiz_data: quizData,
      score: row.final_score,
      passed,
      duration_minutes: row.duration_minutes,
      created_at: row.created_at ?? new Date().toISOString(),
      completed_at: row.completed_at,
      metadata,
    };
  }

  private static mapHistoryRow(row: TrainingHistoryRow): AITrainingHistory {
    const crewMemberId = this.ensureString(
      row.crew_member_id,
      "Training history is missing crew_member_id"
    );
    const sessionId = this.ensureString(row.session_id, "Training history is missing session_id");

    const interaction = (row.interaction_data as HistoryInteractionData | null) ?? {};

    return {
      id: row.id,
      crew_member_id: crewMemberId,
      session_id: sessionId,
      question: interaction.question ?? "",
      answer: interaction.answer ?? null,
      correct_answer: interaction.correct_answer ?? "",
      is_correct:
        typeof row.correctness === "boolean"
          ? row.correctness
          : typeof interaction.is_correct === "boolean"
            ? interaction.is_correct
            : null,
      explanation: interaction.explanation ?? null,
      timestamp: row.occurred_at ?? row.created_at ?? new Date().toISOString(),
    };
  }

  private static mapLearningPathRow(row: LearningPathRow): TrainingLearningPath {
    const crewMemberId = this.ensureString(
      row.crew_member_id,
      "Learning path is missing crew_member_id"
    );

    const modules = Array.isArray(row.learning_modules)
      ? (row.learning_modules as string[])
      : [];

    const status = (row.status as TrainingLearningPath["status"]) ?? "active";

    return {
      id: row.id,
      crew_member_id: crewMemberId,
      title: row.path_name,
      description: row.path_description,
      modules,
      progress: row.progress_percentage ?? 0,
      status,
      ai_recommended: row.ai_recommended ?? false,
      created_at: row.created_at ?? new Date().toISOString(),
      updated_at: row.updated_at ?? row.created_at ?? new Date().toISOString(),
    };
  }

  private static buildTrainingSessionInsert(
    session: Partial<AITrainingSession>,
    options: { organizationId: string; sessionType?: string }
  ): TrainingSessionInsert {
    const crewMemberId = this.ensureString(
      session.crew_member_id,
      "crew_member_id is required to create training sessions"
    );
    const topic = this.ensureString(session.topic, "topic is required to create training sessions");

    return {
      organization_id: options.organizationId,
      crew_member_id: crewMemberId,
      topic,
      session_type: options.sessionType ?? session.module ?? "general",
      content: this.serializeSessionContent(session) as unknown as Json,
      status: session.completed_at ? (session.passed ? "completed" : "failed") : "in_progress",
      final_score: session.score ?? null,
      duration_minutes: session.duration_minutes ?? null,
      completed_at: session.completed_at ?? null,
      started_at: session.created_at ?? new Date().toISOString(),
      ai_feedback: (session.llm_feedback ?? {}) as unknown as Json,
      performance_metrics: (session.metadata ?? {}) as unknown as Json,
      personalization_data: (session.metadata ?? {}) as unknown as Json,
      progress_percentage: (session.metadata?.progress_percentage as number | undefined) ?? null,
      difficulty_level: (session.metadata?.difficulty_level as string | undefined) ?? null,
    };
  }

  private static buildTrainingSessionUpdate(
    updates: Partial<AITrainingSession>
  ): TrainingSessionUpdate {
    const payload: TrainingSessionUpdate = {};

    if (updates.score !== undefined) {
      payload.final_score = updates.score;
    }
    if (updates.duration_minutes !== undefined) {
      payload.duration_minutes = updates.duration_minutes;
    }
    if (updates.completed_at !== undefined) {
      payload.completed_at = updates.completed_at;
      payload.status = updates.passed ? "completed" : "failed";
    }
    if (updates.llm_feedback !== undefined) {
      payload.ai_feedback = updates.llm_feedback as unknown as Json;
    }
    if (updates.metadata !== undefined) {
      payload.performance_metrics = updates.metadata as unknown as Json;
      payload.personalization_data = updates.metadata as unknown as Json;
    }

    const serializedContent = this.serializeSessionContent(updates);
    if (Object.keys(serializedContent).length) {
      payload.content = serializedContent as unknown as Json;
    }

    return payload;
  }

  private static buildTrainingHistoryInsert(
    history: Partial<AITrainingHistory>,
    options: { organizationId: string; interactionType?: string }
  ): TrainingHistoryInsert {
    const crewMemberId = this.ensureString(
      history.crew_member_id,
      "crew_member_id is required to add training history"
    );
    const sessionId = this.ensureString(
      history.session_id,
      "session_id is required to add training history"
    );

    const interactionData: HistoryInteractionData = this.removeUndefined({
      question: history.question,
      answer: history.answer,
      correct_answer: history.correct_answer,
      explanation: history.explanation,
      is_correct: history.is_correct,
    });

    return {
      organization_id: options.organizationId,
      crew_member_id: crewMemberId,
      session_id: sessionId,
      interaction_type: options.interactionType ?? DEFAULT_HISTORY_INTERACTION_TYPE,
      interaction_data: interactionData,
      correctness: history.is_correct ?? null,
      occurred_at: history.timestamp ?? new Date().toISOString(),
    };
  }

  private static buildLearningPathInsert(
    path: TrainingLearningPath,
    organizationId: string
  ): LearningPathInsert {
    const crewMemberId = this.ensureString(
      path.crew_member_id,
      "crew_member_id is required to create learning paths"
    );

    return {
      organization_id: organizationId,
      crew_member_id: crewMemberId,
      path_name: path.title,
      path_description: path.description,
      learning_modules: path.modules,
      progress_percentage: path.progress,
      status: path.status,
      ai_recommended: path.ai_recommended,
      created_at: path.created_at,
      updated_at: path.updated_at,
    };
  }

  private static serializeSessionContent(
    session: Partial<AITrainingSession>
  ): SessionContent {
    return this.removeUndefined({
      module: session.module,
      explanation: session.explanation ?? undefined,
      quiz_data: session.quiz_data && session.quiz_data.length ? session.quiz_data : undefined,
      non_conformity_id: session.non_conformity_id ?? undefined,
      metadata: session.metadata,
      passed: session.passed,
    });
  }

  private static ensureString(value: string | null | undefined, message: string): string {
    if (!value) {
      throw new Error(message);
    }
    return value;
  }

  private static removeUndefined<T extends Record<string, unknown>>(record: T): T {
    const filteredEntries = Object.entries(record).filter(([, value]) => value !== undefined);
    return Object.fromEntries(filteredEntries) as T;
  }
}
