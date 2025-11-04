// @ts-nocheck
/**
 * PATCH 598 - IA Explicativa: AI Explanatory Engine
 * Transforms technical compliance findings into simple explanations
 * and generates contextual training for crew members
 */

import { supabase } from "@/integrations/supabase/client";

export interface NoncomplianceFinding {
  id: string;
  type: 'MLC' | 'PSC' | 'LSA_FFA' | 'OVID';
  code: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
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
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: string;
  responsible: string;
}

export interface Regulation {
  code: string;
  title: string;
  summary: string;
  url?: string;
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
    // Call OpenAI API to generate explanations
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const prompt = buildExplanationPrompt(finding);
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a maritime compliance expert who explains regulations in both technical and simple terms. You help crew members understand compliance issues and learn from mistakes."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const explanation = parseExplanationResponse(data.choices[0].message.content);

    // Store explanation in database
    const { error: dbError } = await supabase
      .from("noncompliance_explanations")
      .insert({
        finding_id: finding.id,
        finding_type: finding.type,
        original_finding: finding.description,
        technical_explanation: explanation.technicalExplanation,
        simple_explanation: explanation.simpleExplanation,
        corrective_actions: explanation.correctiveActions,
        related_regulations: explanation.relatedRegulations,
        severity: finding.severity,
        user_id: userId,
        vessel_id: finding.vesselId,
      });

    if (dbError) {
      console.error("Error storing explanation:", dbError);
    }

    return explanation;
  } catch (error) {
    console.error("Error generating explanation:", error);
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
    };
  } catch (error) {
    console.error("Error parsing explanation:", error);
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
  quizType: 'MLC' | 'PSC' | 'LSA_FFA' | 'OVID' | 'GENERAL',
  difficulty: 'basic' | 'intermediate' | 'advanced' = 'intermediate'
): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const prompt = buildQuizPrompt(errorHistory, quizType, difficulty);
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a maritime training expert who creates effective quizzes based on crew member mistakes. Your quizzes help crew members learn from their errors."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const quizData = JSON.parse(data.choices[0].message.content);

    // Store quiz in database
    const { data: quiz, error } = await supabase
      .from("crew_training_quizzes")
      .insert({
        crew_member_id: crewMemberId,
        quiz_title: quizData.title,
        quiz_type: quizType,
        questions: quizData.questions,
        generated_from_errors: errorHistory.map(e => e.id),
        difficulty,
        estimated_duration_minutes: quizData.estimatedDuration || 15,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return quiz.id;
  } catch (error) {
    console.error("Error generating quiz:", error);
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
    // Get quiz data to calculate score
    const { data: quiz } = await supabase
      .from("crew_training_quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    const questions = quiz.questions as Array<{ correctAnswer: number }>;
    const correctAnswers = answers.filter(
      (a, i) => a.selectedAnswer === questions[i].correctAnswer
    ).length;
    
    const score = (correctAnswers / questions.length) * 100;
    const passed = score >= 70;

    // Record result
    await supabase.from("crew_training_results").insert({
      quiz_id: quizId,
      crew_member_id: crewMemberId,
      score,
      answers,
      time_taken_seconds: timeTakenSeconds,
      passed,
    });

    // Update learning progress
    await updateLearningProgress(crewMemberId, quiz.quiz_type, score, passed);
  } catch (error) {
    console.error("Error recording training result:", error);
    throw error;
  }
}

/**
 * Updates crew member learning progress
 */
async function updateLearningProgress(
  crewMemberId: string,
  moduleType: string,
  score: number,
  passed: boolean
): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from("crew_learning_progress")
      .select("*")
      .eq("crew_member_id", crewMemberId)
      .eq("module_type", moduleType)
      .single();

    if (existing) {
      // Update existing progress
      const newTotal = existing.total_quizzes_taken + 1;
      const newPassed = existing.total_quizzes_passed + (passed ? 1 : 0);
      const newAverage = ((existing.average_score * existing.total_quizzes_taken) + score) / newTotal;

      await supabase
        .from("crew_learning_progress")
        .update({
          total_quizzes_taken: newTotal,
          total_quizzes_passed: newPassed,
          average_score: newAverage,
          last_training_date: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      // Create new progress record
      await supabase.from("crew_learning_progress").insert({
        crew_member_id: crewMemberId,
        module_type: moduleType,
        total_quizzes_taken: 1,
        total_quizzes_passed: passed ? 1 : 0,
        average_score: score,
        last_training_date: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error updating learning progress:", error);
    throw error;
  }
}

/**
 * Gets training progress for a crew member
 */
export async function getTrainingProgress(crewMemberId: string) {
  const { data, error } = await supabase
    .from("crew_learning_progress")
    .select("*")
    .eq("crew_member_id", crewMemberId);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Gets recent explanations for a vessel
 */
export async function getRecentExplanations(vesselId: string, limit = 10) {
  const { data, error } = await supabase
    .from("noncompliance_explanations")
    .select("*")
    .eq("vessel_id", vesselId)
    .order("generated_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}
