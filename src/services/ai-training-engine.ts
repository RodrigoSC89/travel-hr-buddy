/**
 * PATCH 598 - IA Explicativa: AI Explanatory Engine
 * Transforms technical compliance findings into simple explanations
 * and generates contextual training for crew members
 */

/**
 * AI Training Engine
 * Sistema de treinamento e capacitação com IA
 * 
 * ⚠️ NOTA IMPORTANTE:
 * O schema atual de crew_learning_progress não possui colunas agregadas de quizzes.
 * As métricas de desempenho são armazenadas no campo JSON completed_modules
 * para manter compatibilidade com o Supabase sem exigir novas migrations.
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Database, Json } from "@/integrations/supabase/types";

export interface NoncomplianceFinding {
  id: string;
  type: "MLC" | "PSC" | "LSA_FFA" | "OVID";
  code: string;
  description: string;
  severity: "critical" | "major" | "minor";
  vesselId?: string;
  details?: Record<string, unknown>;
}

export interface ExplanationResult {
  technicalExplanation: string;
  simpleExplanation: string;
  correctiveActions: CorrectiveAction[];
  relatedRegulations: Regulation[];
  learningPoints: string[];
}

export interface CorrectiveAction {
  action: string;
  priority: "critical" | "high" | "medium" | "low";
  estimatedTime: string;
  responsible: string;
}

export interface Regulation {
  code: string;
  title: string;
  summary: string;
  url?: string;
}

type ChatCompletionResponse = {
  choices: Array<{
    message: {
      content: string | null;
    } | null;
  }>;
};

type CrewLearningProgressRow = Database["public"]["Tables"]["crew_learning_progress"]["Row"];
type CrewLearningProgressInsert = Database["public"]["Tables"]["crew_learning_progress"]["Insert"];
type CrewTrainingQuizRow = Database["public"]["Tables"]["crew_training_quizzes"]["Row"];
type CrewTrainingQuizInsert = Database["public"]["Tables"]["crew_training_quizzes"]["Insert"];
type CrewTrainingResultInsert = Database["public"]["Tables"]["crew_training_results"]["Insert"];
type NoncomplianceExplanationInsert = Database["public"]["Tables"]["noncompliance_explanations"]["Insert"];

interface ProgressStats {
  totalQuizzesTaken: number;
  totalQuizzesPassed: number;
  averageScore: number;
}

interface QuizQuestionPayload {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface GeneratedQuizPayload {
  title: string;
  estimatedDuration?: number;
  questions: QuizQuestionPayload[];
}

type StoredQuizQuestion = { correctAnswer: number };

interface UpdateLearningProgressInput {
  crewMemberId: string;
  moduleType: string;
  score: number;
  passed: boolean;
  organizationId: string;
  timeTakenMinutes: number;
}

const DEFAULT_PROGRESS: ProgressStats = {
  totalQuizzesTaken: 0,
  totalQuizzesPassed: 0,
  averageScore: 0,
};

const OPENAI_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

async function getOrganizationIdOrThrow(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Failed to fetch user data: ${error.message}`);
  }

  const organizationId = data.user?.user_metadata?.organization_id;

  if (!organizationId) {
    throw new Error("Organization ID not found for current user");
  }

  return organizationId;
}

function extractProgressStats(payload: Json | null | undefined): ProgressStats {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ...DEFAULT_PROGRESS };
  }

  const stats = payload as Partial<ProgressStats>;

  return {
    totalQuizzesTaken: typeof stats.totalQuizzesTaken === "number" ? stats.totalQuizzesTaken : 0,
    totalQuizzesPassed: typeof stats.totalQuizzesPassed === "number" ? stats.totalQuizzesPassed : 0,
    averageScore: typeof stats.averageScore === "number" ? stats.averageScore : 0,
  };
}

function calculateNextProgress(stats: ProgressStats, score: number, passed: boolean): ProgressStats {
  const totalQuizzesTaken = stats.totalQuizzesTaken + 1;
  const totalQuizzesPassed = stats.totalQuizzesPassed + (passed ? 1 : 0);
  const averageScore = Number(((stats.averageScore * stats.totalQuizzesTaken) + score) / totalQuizzesTaken);

  return {
    totalQuizzesTaken,
    totalQuizzesPassed,
    averageScore: Number(averageScore.toFixed(2)),
  };
}

function determineTrainingLevel(score: number): string {
  if (score >= 90) return "expert";
  if (score >= 80) return "advanced";
  if (score >= 70) return "intermediate";
  return "basic";
}

function parseJsonContent<T>(content: string, context: string): T {
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    logger.error("Failed to parse AI response", error, { context });
    throw new Error(`Failed to parse ${context} response`);
  }
}

function minutesFromSeconds(seconds: number): number {
  return Math.max(1, Math.ceil(seconds / 60));
}

/**
 * Generates AI explanation for a noncompliance finding
 * Uses LLM to transform technical jargon into understandable language
 */
export async function explainNoncomplianceLLM(
  finding: NoncomplianceFinding,
  userId: string
): Promise<ExplanationResult> {
  try {
    const apiKey = (import.meta as { env: Record<string, string | undefined> }).env
      .VITE_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const prompt = buildExplanationPrompt(finding);

    const response = await fetch(OPENAI_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a maritime compliance expert who explains regulations in both technical and simple terms. You help crew members understand compliance issues and learn from mistakes.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("OpenAI API returned empty explanation content");
    }

    const explanation = parseExplanationResponse(content);
    const organizationId = await getOrganizationIdOrThrow();

    const insertPayload: NoncomplianceExplanationInsert = {
      noncompliance_id: finding.id,
      explanation: `${explanation.technicalExplanation}\n\n${explanation.simpleExplanation}`,
      ai_analysis: explanation as unknown as Json,
      severity: finding.severity,
      organization_id: organizationId,
    });

    const { error: dbError } = await supabase
      .from("noncompliance_explanations")
      .insert(insertPayload);

    if (dbError) {
      logger.error("Error storing explanation", dbError, { findingId: finding.id });
    }

    return explanation;
  } catch (error) {
    logger.error("Error generating explanation", error, { findingId: finding.id });
    throw error;
  }
}

/**
 * Builds the prompt for the LLM
 */
function buildExplanationPrompt(finding: NoncomplianceFinding): string {
  return `
Analyze this maritime compliance finding and provide:

Finding Type: ${finding.type}
Code: ${finding.code}
Description: ${finding.description}
Severity: ${finding.severity}

Please provide:
1. TECHNICAL_EXPLANATION: A detailed technical explanation for maritime professionals
2. SIMPLE_EXPLANATION: A clear, simple explanation that any crew member can understand
3. CORRECTIVE_ACTIONS: 3-5 specific actions to resolve this issue (with priority and estimated time)
4. RELATED_REGULATIONS: Relevant maritime regulations and standards
5. LEARNING_POINTS: Key takeaways for crew training

Format your response as JSON:
{
  "technicalExplanation": "...",
  "simpleExplanation": "...",
  "correctiveActions": [
    {"action": "...", "priority": "high", "estimatedTime": "2 hours", "responsible": "Chief Officer"}
  ],
  "relatedRegulations": [
    {"code": "MLC 2006", "title": "...", "summary": "..."}
  ],
  "learningPoints": ["...", "..."]
}
`;
}

/**
 * Parses the LLM response
 */
function parseExplanationResponse(content: string): ExplanationResult {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback: parse manually if not JSON
    return {
      technicalExplanation: extractSection(content, "TECHNICAL_EXPLANATION"),
      simpleExplanation: extractSection(content, "SIMPLE_EXPLANATION"),
      correctiveActions: [],
      relatedRegulations: [],
      learningPoints: [],
    });
  } catch (error) {
    logger.error("Error parsing explanation", error);
    throw new Error("Failed to parse AI explanation");
  }
}

/**
 * Extracts a section from text
 */
function extractSection(text: string, sectionName: string): string {
  const regex = new RegExp(`${sectionName}:?\\s*([\\s\\S]*?)(?=\\n\\n|$)`, "i");
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

/**
 * Generates a training quiz based on crew member errors
 */
export async function generateQuizFromErrors(
  crewMemberId: string,
  errorHistory: NoncomplianceFinding[],
  quizType: "MLC" | "PSC" | "LSA_FFA" | "OVID" | "GENERAL",
  difficulty: "basic" | "intermediate" | "advanced" = "intermediate"
): Promise<string> {
  try {
    const apiKey = (import.meta as { env: Record<string, string | undefined> }).env
      .VITE_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const prompt = buildQuizPrompt(errorHistory, quizType, difficulty);

    const response = await fetch(OPENAI_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a maritime training expert who creates effective quizzes based on crew member mistakes. Your quizzes help crew members learn from their errors.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("OpenAI API returned empty quiz content");
    }

    const quizData = parseJsonContent<GeneratedQuizPayload>(content, "quiz generation");

    if (!Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      throw new Error("Quiz generation returned no questions");
    }

    const organizationId = await getOrganizationIdOrThrow();

    const insertPayload: CrewTrainingQuizInsert = {
      title: quizData.title || `Quiz ${quizType}`,
      description: `Quiz gerado automaticamente para ${quizType}`,
      category: quizType,
      questions: quizData.questions as unknown as Json,
      difficulty,
      time_limit_minutes: quizData.estimatedDuration ?? 15,
      ai_generated: true,
      organization_id: organizationId,
    });

    const { data: quiz, error } = await supabase
      .from("crew_training_quizzes")
      .insert(insertPayload)
      .select()
      .single();

    if (error || !quiz) {
      throw new Error(error?.message || "Failed to store generated quiz");
    }

    return quiz.id;
  } catch (error) {
    logger.error("Error generating quiz", error, { crewMemberId, quizType });
    throw error;
  }
}

/**
 * Builds quiz generation prompt
 */
function buildQuizPrompt(
  errors: NoncomplianceFinding[],
  quizType: string,
  difficulty: string
): string {
  const errorDescriptions = errors.map(e => `- ${e.type}: ${e.description}`).join("\n");
  
  return `
Create a training quiz for maritime crew members based on these past errors:

${errorDescriptions}

Quiz Type: ${quizType}
Difficulty: ${difficulty}

Generate 10 multiple-choice questions that:
1. Test understanding of the regulations violated
2. Focus on practical scenarios similar to the errors
3. Include clear explanations for correct answers
4. Match the difficulty level requested

Format as JSON:
{
  "title": "Quiz title",
  "estimatedDuration": 15,
  "questions": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "..."
    }
  ]
}
`;
}

/**
 * Records quiz results and updates learning progress
 */
export async function recordTrainingResult(
  quizId: string,
  crewMemberId: string,
  answers: { questionIndex: number; selectedAnswer: number }[],
  timeTakenSeconds: number
): Promise<void> {
  try {
    const { data: quiz, error: quizError } = await supabase
      .from("crew_training_quizzes")
      .select("id, questions, category")
      .eq("id", quizId)
      .single();

    if (quizError || !quiz) {
      throw new Error(quizError?.message || "Quiz not found");
    }

    const questions = (quiz.questions as StoredQuizQuestion[]) || [];

    if (questions.length === 0) {
      throw new Error("Quiz has no questions to score");
    }

    const correctAnswers = answers.reduce((total, answer) => {
      const question = questions[answer.questionIndex];
      if (!question) {
        return total;
      }
      return answer.selectedAnswer === question.correctAnswer ? total + 1 : total;
    }, 0);

    const score = (correctAnswers / questions.length) * 100;
    const passed = score >= 70;
    const timeTakenMinutes = minutesFromSeconds(timeTakenSeconds);
    const organizationId = await getOrganizationIdOrThrow();

    const resultPayload: CrewTrainingResultInsert = {
      quiz_id: quizId,
      crew_member_id: crewMemberId,
      score,
      answers: answers as unknown as Json,
      time_taken_minutes: timeTakenMinutes,
      passed,
      organization_id: organizationId,
      completed_at: new Date().toISOString(),
    });

    const { error: insertError } = await supabase
      .from("crew_training_results")
      .insert(resultPayload);

    if (insertError) {
      throw new Error(`Failed to record training result: ${insertError.message}`);
    }

    await updateLearningProgress({
      crewMemberId,
      moduleType: quiz.category || "general",
      score,
      passed,
      organizationId,
      timeTakenMinutes,
    });
  } catch (error) {
    logger.error("Error recording training result", error, { quizId, crewMemberId });
    throw error;
  }
}

/**
 * Updates crew member learning progress
 */
async function updateLearningProgress({
  crewMemberId,
  moduleType,
  score,
  passed,
  organizationId,
  timeTakenMinutes,
}: UpdateLearningProgressInput): Promise<void> {
  try {
    const { data: existing, error } = await supabase
      .from("crew_learning_progress")
      .select("*")
      .eq("crew_member_id", crewMemberId)
      .eq("topic", moduleType)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch learning progress: ${error.message}`);
    }

    const previousStats = extractProgressStats(existing?.completed_modules);
    const nextStats = calculateNextProgress(previousStats, score, passed);
    const timestamp = new Date().toISOString();

    const completedModulesPayload: Json = {
      totalQuizzesTaken: nextStats.totalQuizzesTaken,
      totalQuizzesPassed: nextStats.totalQuizzesPassed,
      averageScore: nextStats.averageScore,
      lastScore: score,
      lastUpdatedAt: timestamp,
    });

    const basePayload: CrewLearningProgressInsert = {
      crew_member_id: crewMemberId,
      organization_id: organizationId,
      topic: moduleType,
      completed_modules: completedModulesPayload,
      progress_percentage: nextStats.averageScore,
      total_time_minutes: (existing?.total_time_minutes ?? 0) + timeTakenMinutes,
      last_activity_at: timestamp,
      current_level: determineTrainingLevel(nextStats.averageScore),
    });

    if (existing) {
      const { error: updateError } = await supabase
        .from("crew_learning_progress")
        .update({
          ...basePayload,
          updated_at: timestamp,
        })
        .eq("id", existing.id);

      if (updateError) {
        throw new Error(`Failed to update learning progress: ${updateError.message}`);
      }
    } else {
      const { error: insertError } = await supabase
        .from("crew_learning_progress")
        .insert({
          ...basePayload,
          created_at: timestamp,
        });

      if (insertError) {
        throw new Error(`Failed to create learning progress: ${insertError.message}`);
      }
    }
  } catch (error) {
    logger.error("Error updating learning progress", error, { crewMemberId, moduleType });
    throw error;
  }
}

/**
 * Gets training progress for a crew member
 */
export async function getTrainingProgress(crewMemberId: string): Promise<CrewLearningProgressRow[]> {
  const { data, error } = await supabase
    .from("crew_learning_progress")
    .select("*")
    .eq("crew_member_id", crewMemberId);

  if (error) {
    throw new Error(`Failed to fetch training progress: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Gets recent explanations for an organization
 */
export async function getRecentExplanations(organizationId?: string, limit = 10) {
  let query = supabase
    .from("noncompliance_explanations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch recent explanations: ${error.message}`);
  }

  return data ?? [];
}
