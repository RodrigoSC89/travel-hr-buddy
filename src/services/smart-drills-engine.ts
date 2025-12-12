/**
 * PATCH 599 - Drills Inteligentes com LLM
 * Generates intelligent emergency drill scenarios using AI
 * and evaluates crew responses
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Database, Json } from "@/integrations/supabase/types";

export type DrillType = "FIRE" | "ABANDON_SHIP" | "MAN_OVERBOARD" | "COLLISION" | "POLLUTION" | "MEDICAL" | "SECURITY" | "GENERAL";
export type DrillDifficulty = "basic" | "intermediate" | "advanced" | "expert";

export interface DrillScenario {
  id?: string;
  title: string;
  type: DrillType;
  difficulty: DrillDifficulty;
  description: string;
  scenarioDetails: {
    location: string;
    timeOfDay: string;
    weatherConditions: string;
    initialConditions: string;
    challenges: string[];
    expectedDuration: number;
  };
  expectedResponses: ExpectedResponse[];
  evaluationCriteria: EvaluationCriterion[];
}

export interface ExpectedResponse {
  action: string;
  timeframe: string;
  criticalityLevel: "critical" | "high" | "medium" | "low";
  responsibleRole: string;
}

export interface EvaluationCriterion {
  criterion: string;
  weight: number;
  description: string;
}

export interface DrillResponse {
  crewMemberId: string;
  responses: Array<{
    action: string;
    timestamp: string;
    appropriateness: number;
  }>;
  reactionTimeSeconds: number;
  actionsTaken: string[];
  mistakes: string[];
  strengths: string[];
}

export type DrillScheduleFrequency =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "annually";

type ChatMessageRole = "system" | "user";

type DrillScenarioTable = {
  Row: {
    id: string;
    scenario_title: string;
    scenario_type: DrillType;
    difficulty: DrillDifficulty | null;
    description: string;
    scenario_details: Json | null;
    expected_responses: Json | null;
    evaluation_criteria: Json | null;
    duration_minutes: number | null;
    vessel_id: string | null;
    generated_from_failures: Json | null;
    ai_generated: boolean | null;
    created_by: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  Insert: {
    id?: string;
    scenario_title: string;
    scenario_type: DrillType;
    difficulty?: DrillDifficulty;
    description: string;
    scenario_details: Json;
    expected_responses?: Json | null;
    evaluation_criteria?: Json | null;
    duration_minutes?: number | null;
    vessel_id?: string | null;
    generated_from_failures?: Json | null;
    ai_generated?: boolean;
    created_by?: string | null;
  };
  Update: Partial<DrillScenarioTable["Row"]>;
  Relationships: [];
};

type DrillExecutionTable = {
  Row: {
    id: string;
    scenario_id: string | null;
    vessel_id: string;
    execution_date: string;
    participants: Json | null;
    status: "scheduled" | "in_progress" | "completed" | "cancelled" | null;
    actual_duration_minutes: number | null;
    weather_conditions: string | null;
    notes: string | null;
    conducted_by: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  Insert: {
    id?: string;
    scenario_id?: string | null;
    vessel_id: string;
    execution_date?: string;
    participants?: Json | null;
    status?: "scheduled" | "in_progress" | "completed" | "cancelled";
    actual_duration_minutes?: number | null;
    weather_conditions?: string | null;
    notes?: string | null;
    conducted_by?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
  Update: Partial<DrillExecutionTable["Row"]>;
  Relationships: [];
};

type DrillResponseTable = {
  Row: {
    id: string;
    execution_id: string;
    crew_member_id: string;
    responses: Json;
    reaction_time_seconds: number | null;
    actions_taken: Json | null;
    mistakes: Json | null;
    strengths: Json | null;
    overall_score: number | null;
    ai_evaluation: string | null;
    evaluator_notes: string | null;
    evaluated_by: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  Insert: {
    id?: string;
    execution_id: string;
    crew_member_id: string;
    responses: Json;
    reaction_time_seconds?: number | null;
    actions_taken?: Json | null;
    mistakes?: Json | null;
    strengths?: Json | null;
    overall_score?: number | null;
    ai_evaluation?: string | null;
    evaluator_notes?: string | null;
    evaluated_by?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
  Update: Partial<DrillResponseTable["Row"]>;
  Relationships: [];
};

type DrillCorrectiveActionTable = {
  Row: {
    id: string;
    execution_id: string;
    crew_member_id: string | null;
    issue_identified: string;
    recommended_action: string;
    priority: "critical" | "high" | "medium" | "low" | null;
    training_required: boolean | null;
    training_type: string | null;
    deadline: string | null;
    status: "pending" | "in_progress" | "completed" | "cancelled" | null;
    assigned_to: string | null;
    completed_at: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  Insert: {
    id?: string;
    execution_id: string;
    crew_member_id?: string | null;
    issue_identified: string;
    recommended_action: string;
    priority?: "critical" | "high" | "medium" | "low" | null;
    training_required?: boolean | null;
    training_type?: string | null;
    deadline?: string | null;
    status?: "pending" | "in_progress" | "completed" | "cancelled" | null;
    assigned_to?: string | null;
    completed_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
  Update: Partial<DrillCorrectiveActionTable["Row"]>;
  Relationships: [];
};

type DrillScheduleTable = {
  Row: {
    id: string;
    scenario_id: string | null;
    vessel_id: string;
    frequency: DrillScheduleFrequency;
    next_scheduled_date: string;
    last_execution_date: string | null;
    auto_schedule: boolean | null;
    active: boolean | null;
    notification_days_before: number | null;
    created_by: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  Insert: {
    id?: string;
    scenario_id?: string | null;
    vessel_id: string;
    frequency: DrillScheduleFrequency;
    next_scheduled_date: string;
    last_execution_date?: string | null;
    auto_schedule?: boolean | null;
    active?: boolean | null;
    notification_days_before?: number | null;
    created_by?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
  Update: Partial<DrillScheduleTable["Row"]>;
  Relationships: [];
};

type SmartDrillTables = {
  drill_scenarios: DrillScenarioTable;
  drill_executions: DrillExecutionTable;
  drill_responses: DrillResponseTable;
  drill_corrective_actions: DrillCorrectiveActionTable;
  drill_schedule: DrillScheduleTable;
};

type SmartDrillDatabase = Database & {
  public: Database["public"] & {
    Tables: Database["public"]["Tables"] & SmartDrillTables;
  };
};

type DrillScenarioRow = DrillScenarioTable["Row"];
type DrillScenarioInsertPayload = DrillScenarioTable["Insert"];
type DrillExecutionInsertPayload = DrillExecutionTable["Insert"];
type DrillExecutionRow = DrillExecutionTable["Row"];
type DrillResponseInsertPayload = DrillResponseTable["Insert"];
type DrillCorrectiveActionInsertPayload = DrillCorrectiveActionTable["Insert"];
type DrillScheduleInsertPayload = DrillScheduleTable["Insert"];
type DrillScheduleRow = DrillScheduleTable["Row"];

type DrillExecutionWithScenario = DrillExecutionRow & {
  drill_scenarios: DrillScenarioRow | null;
};

type DrillScheduleWithScenario = DrillScheduleRow & {
  drill_scenarios: DrillScenarioRow | null;
};

type ChatMessage = {
  role: ChatMessageRole;
  content: string;
};

type DrillEvaluationResult = {
  score: number;
  evaluation: string;
  mistakes: string[];
  strengths: string[];
};

type CorrectiveActionRecommendation = {
  issue: string;
  action: string;
  priority: "critical" | "high" | "medium" | "low";
  trainingRequired: boolean;
  trainingType: string | null;
};

type OpenAiResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    });
  }>;
};

const smartDrillsClient = supabase as SupabaseClient<SmartDrillDatabase>;
const DEFAULT_SCENARIO_DETAILS: DrillScenario["scenarioDetails"] = {
  location: "",
  timeOfDay: "",
  weatherConditions: "",
  initialConditions: "",
  challenges: [],
  expectedDuration: 30,
};
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

const getOpenAiApiKey = (): string => {
  const apiKey = (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  return apiKey;
};

const requestOpenAiJson = async <T>(
  messages: ChatMessage[],
  {
    temperature,
    maxTokens,
  }: {
    temperature: number;
    maxTokens: number;
  }
): Promise<T> => {
  const response = await fetch(OPENAI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getOpenAiApiKey()}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = (await response.json()) as OpenAiResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI API returned empty content");
  }

  try {
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error("Failed to parse OpenAI response as JSON");
  }
};

const toJson = (value: unknown): Json => value as Json;

const ensureStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  return [];
};

const mapScenarioRowToDomain = (row: DrillScenarioRow): DrillScenario => {
  const parsedDetails = (row.scenario_details as Partial<DrillScenario["scenarioDetails"]> | null) ?? null;
  const mergedDetails: DrillScenario["scenarioDetails"] = {
    ...DEFAULT_SCENARIO_DETAILS,
    ...(parsedDetails ?? {}),
  };

  if (!mergedDetails.expectedDuration) {
    mergedDetails.expectedDuration = row.duration_minutes ?? DEFAULT_SCENARIO_DETAILS.expectedDuration;
  }

  const expectedResponses = Array.isArray(row.expected_responses)
    ? (row.expected_responses as unknown as ExpectedResponse[])
    : [];

  const evaluationCriteria = Array.isArray(row.evaluation_criteria)
    ? (row.evaluation_criteria as unknown as EvaluationCriterion[])
    : [];

  return {
    id: row.id,
    title: row.scenario_title,
    type: row.scenario_type,
    difficulty: row.difficulty ?? "basic",
    description: row.description,
    scenarioDetails: mergedDetails,
    expectedResponses,
    evaluationCriteria,
  };
};

/**
 * Generates an AI-powered drill scenario based on historical failures
 */
export async function generateDrillScenario(
  type: DrillType,
  difficulty: DrillDifficulty,
  vesselId: string,
  historicalFailures: string[] = []
): Promise<DrillScenario> {
  try {
    const prompt = buildDrillScenarioPrompt(type, difficulty, historicalFailures);
    const scenario = await requestOpenAiJson<DrillScenario>(
      [
        {
          role: "system",
          content:
            "You are a maritime safety expert who creates realistic emergency drill scenarios for vessel crew training. Your scenarios are designed to test crew preparedness and identify training gaps.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      { temperature: 0.9, maxTokens: 2500 }
    );

    const payload: DrillScenarioInsertPayload = {
      scenario_title: scenario.title,
      scenario_type: type,
      difficulty,
      description: scenario.description,
      scenario_details: toJson(scenario.scenarioDetails),
      expected_responses: toJson(scenario.expectedResponses),
      evaluation_criteria: toJson(scenario.evaluationCriteria),
      duration_minutes: scenario.scenarioDetails.expectedDuration,
      vessel_id: vesselId,
      generated_from_failures: toJson(historicalFailures),
      ai_generated: true,
    });

    const { data: savedScenario, error } = await smartDrillsClient
      .from("drill_scenarios")
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return mapScenarioRowToDomain(savedScenario);
  } catch (error) {
    logger.error("Error generating drill scenario", error as Error, { drillType: type, difficulty });
    throw error;
  }
}

/**
 * Builds the prompt for drill scenario generation
 */
function buildDrillScenarioPrompt(
  type: DrillType,
  difficulty: DrillDifficulty,
  historicalFailures: string[]
): string {
  const failuresContext = historicalFailures.length > 0 
    ? `\n\nPast failures to address:\n${historicalFailures.map(f => `- ${f}`).join("\n")}`
    : "";

  return `
Create a realistic ${type} emergency drill scenario for a vessel crew.

Difficulty Level: ${difficulty}
${failuresContext}

Generate a comprehensive drill scenario that includes:

1. Realistic situation and context
2. Specific challenges and complications
3. Expected crew responses with timing
4. Evaluation criteria for performance assessment

The scenario should:
- Be realistic and challenging for the difficulty level
- Test multiple aspects of emergency response
- Include time-sensitive elements
- Address past failures if provided
- Be suitable for maritime environment

Format as JSON:
{
  "title": "Brief scenario title",
  "description": "Detailed scenario description",
  "scenarioDetails": {
    "location": "Engine room / Bridge / Deck / etc",
    "timeOfDay": "Morning / Afternoon / Night",
    "weatherConditions": "Weather description",
    "initialConditions": "Starting situation",
    "challenges": ["Challenge 1", "Challenge 2"],
    "expectedDuration": 30
  },
  "expectedResponses": [
    {
      "action": "Action description",
      "timeframe": "Immediate / Within 5 minutes / etc",
      "criticalityLevel": "critical",
      "responsibleRole": "Master / Chief Engineer / etc"
    }
  ],
  "evaluationCriteria": [
    {
      "criterion": "Criterion name",
      "weight": 20,
      "description": "What to evaluate"
    }
  ]
}
`;
}

/**
 * Schedules a drill for execution
 */
export async function scheduleDrill(
  scenarioId: string,
  vesselId: string,
  executionDate: Date,
  participants: string[],
  conductedBy: string
): Promise<string> {
  try {
    const payload: DrillExecutionInsertPayload = {
      scenario_id: scenarioId,
      vessel_id: vesselId,
      execution_date: executionDate.toISOString(),
      participants: toJson(participants),
      status: "scheduled",
      conducted_by: conductedBy,
    });

    const { data, error } = await smartDrillsClient
      .from("drill_executions")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      throw new Error(`Error scheduling drill: ${error.message}`);
    }

    return data.id;
  } catch (error) {
    logger.error("Error scheduling drill", error as Error, { scenarioId, vesselId });
    throw error;
  }
}

/**
 * Records crew member's response during drill
 */
export async function recordDrillResponse(
  executionId: string,
  response: DrillResponse
): Promise<void> {
  try {
    const payload: DrillResponseInsertPayload = {
      execution_id: executionId,
      crew_member_id: response.crewMemberId,
      responses: toJson(response.responses),
      reaction_time_seconds: response.reactionTimeSeconds,
      actions_taken: toJson(response.actionsTaken),
      mistakes: toJson(response.mistakes),
      strengths: toJson(response.strengths),
    });

    const { error } = await smartDrillsClient.from("drill_responses").insert(payload as any);

    if (error) {
      throw new Error(`Error recording drill response: ${error.message}`);
    }
  } catch (error) {
    logger.error("Error recording drill response", error as Error, { executionId });
    throw error;
  }
}

/**
 * Evaluates drill performance using AI
 */
export async function evaluateDrillPerformance(
  executionId: string,
  responses: DrillResponse[]
): Promise<void> {
  try {
    const { data: execution, error } = await smartDrillsClient
      .from("drill_executions")
      .select("*, drill_scenarios(*)")
      .eq("id", executionId)
      .single();

    if (error) {
      throw new Error(`Failed to load drill execution: ${error.message}`);
    }

    if (!execution || !execution.drill_scenarios) {
      throw new Error("Drill execution or associated scenario not found");
    }

    for (const response of responses) {
      const prompt = buildEvaluationPrompt(
        execution.drill_scenarios as any,
        response
      );

      let evaluation: DrillEvaluationResult;
      try {
        evaluation = await requestOpenAiJson<DrillEvaluationResult>(
          [
            {
              role: "system",
              content:
                "You are a maritime safety evaluator who assesses crew emergency drill performance objectively and provides constructive feedback.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          { temperature: 0.7, maxTokens: 1500 }
        );
      } catch (aiError) {
        logger.error("AI evaluation failed for crew member", aiError as Error, { crewMemberId: response.crewMemberId });
        continue;
      }

      const { error: updateError } = await smartDrillsClient
        .from("drill_responses")
        .update({
          overall_score: evaluation.score,
          ai_evaluation: evaluation.evaluation,
          mistakes: toJson(evaluation.mistakes),
          strengths: toJson(evaluation.strengths),
        })
        .eq("execution_id", executionId)
        .eq("crew_member_id", response.crewMemberId);

      if (updateError) {
        logger.error("Failed to persist AI evaluation for crew member", updateError as Error, { crewMemberId: response.crewMemberId, executionId });
      }
    }
  } catch (error) {
    logger.error("Error evaluating drill performance", error as Error, { executionId });
    throw error;
  }
}

/**
 * Builds evaluation prompt
 */
function buildEvaluationPrompt(
  scenario: DrillScenarioRow,
  response: DrillResponse
): string {
  const mappedScenario = mapScenarioRowToDomain(scenario);

  return `
Evaluate this crew member's performance in an emergency drill:

SCENARIO: ${mappedScenario.title}
Expected Responses: ${JSON.stringify(mappedScenario.expectedResponses)}
Evaluation Criteria: ${JSON.stringify(mappedScenario.evaluationCriteria)}

CREW MEMBER PERFORMANCE:
Reaction Time: ${response.reactionTimeSeconds} seconds
Actions Taken: ${response.actionsTaken.join(", ")}
Responses: ${JSON.stringify(response.responses)}

Provide:
1. Overall score (0-100)
2. Evaluation text
3. Specific mistakes identified
4. Strengths demonstrated

Format as JSON:
{
  "score": 85,
  "evaluation": "Detailed evaluation text...",
  "mistakes": ["Mistake 1", "Mistake 2"],
  "strengths": ["Strength 1", "Strength 2"]
}
`;
}

/**
 * Generates corrective action plan based on drill results
 */
export async function generateCorrectiveActionPlan(
  executionId: string
): Promise<void> {
  try {
    const { data: responses, error } = await smartDrillsClient
      .from("drill_responses")
      .select("mistakes")
      .eq("execution_id", executionId);

    if (error) {
      throw new Error(`Failed to load drill responses: ${error.message}`);
    }

    if (!responses || responses.length === 0) {
      return;
    }

    const allMistakes = responses.flatMap((r) => ensureStringArray(r.mistakes));
    const uniqueMistakes = [...new Set(allMistakes)];

    if (uniqueMistakes.length === 0) {
      return;
    }

    const prompt = `
Analyze these mistakes from an emergency drill and create a corrective action plan:

Mistakes identified:
${uniqueMistakes.map((m) => `- ${m}`).join("\n")}

For each critical issue, provide:
1. Issue description
2. Recommended corrective action
3. Priority level
4. Whether training is required
5. Type of training needed

Format as JSON array:
[
  {
    "issue": "Issue description",
    "action": "Recommended action",
    "priority": "critical",
    "trainingRequired": true,
    "trainingType": "Type of training"
  }
]
`;

    const actions = await requestOpenAiJson<CorrectiveActionRecommendation[]>(
      [
        {
          role: "system",
          content: "You are a maritime training coordinator who creates actionable corrective plans.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      { temperature: 0.7, maxTokens: 1500 }
    );

    if (!Array.isArray(actions) || actions.length === 0) {
      return;
    }

    const inserts: DrillCorrectiveActionInsertPayload[] = actions.map((action) => ({
      execution_id: executionId,
      issue_identified: action.issue,
      recommended_action: action.action,
      priority: action.priority,
      training_required: action.trainingRequired,
      training_type: action.trainingType,
    }));

    const { error: insertError } = await smartDrillsClient
      .from("drill_corrective_actions")
      .insert(inserts as any);

    if (insertError) {
      throw new Error(`Failed to store corrective actions: ${insertError.message}`);
    }
  } catch (error) {
    logger.error("Error generating corrective action plan", error as Error, { executionId });
    throw error;
  }
}

/**
 * Sets up automatic drill scheduling
 */
export async function setupDrillSchedule(
  scenarioId: string,
  vesselId: string,
  frequency: DrillScheduleFrequency,
  createdBy: string
): Promise<string> {
  try {
    const nextDate = calculateNextDrillDate(frequency);

    const payload: DrillScheduleInsertPayload = {
      scenario_id: scenarioId,
      vessel_id: vesselId,
      frequency,
      next_scheduled_date: nextDate.toISOString(),
      auto_schedule: true,
      active: true,
      created_by: createdBy,
    });

    const { data, error } = await smartDrillsClient
      .from("drill_schedule")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      throw new Error(`Error setting up schedule: ${error.message}`);
    }

    return data.id;
  } catch (error) {
    logger.error("Error setting up drill schedule", error as Error, { scenarioId, vesselId, frequency });
    throw error;
  }
}

/**
 * Calculates next drill date based on frequency
 */
function calculateNextDrillDate(frequency: DrillScheduleFrequency): Date {
  const now = new Date();
  
  switch (frequency) {
  case "weekly":
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  case "biweekly":
    return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  case "monthly":
    return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  case "quarterly":
    return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
  case "annually":
    return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  default:
    return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
}

/**
 * Gets upcoming drills for a vessel
 */
export async function getUpcomingDrills(
  vesselId: string,
  limit = 10
): Promise<DrillScheduleWithScenario[]> {
  const { data, error } = await smartDrillsClient
    .from("drill_schedule")
    .select("*, drill_scenarios(*)")
    .eq("vessel_id", vesselId)
    .eq("active", true)
    .gte("next_scheduled_date", new Date().toISOString())
    .order("next_scheduled_date", { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as DrillScheduleWithScenario[];
}

/**
 * Gets drill execution history for a vessel
 */
export async function getDrillHistory(
  vesselId: string,
  limit = 20
): Promise<DrillExecutionWithScenario[]> {
  const { data, error } = await smartDrillsClient
    .from("drill_executions")
    .select("*, drill_scenarios(*)")
    .eq("vessel_id", vesselId)
    .order("execution_date", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as DrillExecutionWithScenario[];
}
