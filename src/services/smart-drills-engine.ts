/**
 * PATCH 599 - Drills Inteligentes com LLM
 * Generates intelligent emergency drill scenarios using AI
 * and evaluates crew responses
 */

import { supabase } from "@/integrations/supabase/client";

export type DrillType = 'FIRE' | 'ABANDON_SHIP' | 'MAN_OVERBOARD' | 'COLLISION' | 'POLLUTION' | 'MEDICAL' | 'SECURITY' | 'GENERAL';
export type DrillDifficulty = 'basic' | 'intermediate' | 'advanced' | 'expert';

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
  criticalityLevel: 'critical' | 'high' | 'medium' | 'low';
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
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const prompt = buildDrillScenarioPrompt(type, difficulty, historicalFailures);
    
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
            content: "You are a maritime safety expert who creates realistic emergency drill scenarios for vessel crew training. Your scenarios are designed to test crew preparedness and identify training gaps."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const scenario = JSON.parse(data.choices[0].message.content);

    // Store scenario in database
    const { data: savedScenario, error } = await supabase
      .from("drill_scenarios")
      .insert({
        scenario_title: scenario.title,
        scenario_type: type,
        difficulty,
        description: scenario.description,
        scenario_details: scenario.scenarioDetails,
        expected_responses: scenario.expectedResponses,
        evaluation_criteria: scenario.evaluationCriteria,
        duration_minutes: scenario.scenarioDetails.expectedDuration,
        vessel_id: vesselId,
        generated_from_failures: historicalFailures,
        ai_generated: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      id: savedScenario.id,
      ...scenario
    };
  } catch (error) {
    console.error("Error generating drill scenario:", error);
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
    ? `\n\nPast failures to address:\n${historicalFailures.map(f => `- ${f}`).join('\n')}`
    : '';

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
    const { data, error } = await supabase
      .from("drill_executions")
      .insert({
        scenario_id: scenarioId,
        vessel_id: vesselId,
        execution_date: executionDate.toISOString(),
        participants,
        status: 'scheduled',
        conducted_by: conductedBy,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error scheduling drill: ${error.message}`);
    }

    return data.id;
  } catch (error) {
    console.error("Error scheduling drill:", error);
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
    await supabase.from("drill_responses").insert({
      execution_id: executionId,
      crew_member_id: response.crewMemberId,
      responses: response.responses,
      reaction_time_seconds: response.reactionTimeSeconds,
      actions_taken: response.actionsTaken,
      mistakes: response.mistakes,
      strengths: response.strengths,
    });
  } catch (error) {
    console.error("Error recording drill response:", error);
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
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Get drill scenario
    const { data: execution } = await supabase
      .from("drill_executions")
      .select("*, drill_scenarios(*)")
      .eq("id", executionId)
      .single();

    if (!execution) {
      throw new Error("Drill execution not found");
    }

    // Evaluate each response
    for (const response of responses) {
      const prompt = buildEvaluationPrompt(execution.drill_scenarios, response);
      
      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
              content: "You are a maritime safety evaluator who assesses crew emergency drill performance objectively and provides constructive feedback."
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

      if (!aiResponse.ok) {
        console.error("AI evaluation failed for crew member:", response.crewMemberId);
        continue;
      }

      const evaluationData = await aiResponse.json();
      const evaluation = JSON.parse(evaluationData.choices[0].message.content);

      // Update response with AI evaluation
      await supabase
        .from("drill_responses")
        .update({
          overall_score: evaluation.score,
          ai_evaluation: evaluation.evaluation,
          mistakes: evaluation.mistakes,
          strengths: evaluation.strengths,
        })
        .eq("execution_id", executionId)
        .eq("crew_member_id", response.crewMemberId);
    }
  } catch (error) {
    console.error("Error evaluating drill performance:", error);
    throw error;
  }
}

/**
 * Builds evaluation prompt
 */
function buildEvaluationPrompt(scenario: any, response: DrillResponse): string {
  return `
Evaluate this crew member's performance in an emergency drill:

SCENARIO: ${scenario.scenario_title}
Expected Responses: ${JSON.stringify(scenario.expected_responses)}
Evaluation Criteria: ${JSON.stringify(scenario.evaluation_criteria)}

CREW MEMBER PERFORMANCE:
Reaction Time: ${response.reactionTimeSeconds} seconds
Actions Taken: ${response.actionsTaken.join(', ')}
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
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Get all responses for the drill
    const { data: responses } = await supabase
      .from("drill_responses")
      .select("*")
      .eq("execution_id", executionId);

    if (!responses || responses.length === 0) {
      return;
    }

    // Analyze all mistakes
    const allMistakes = responses.flatMap(r => r.mistakes || []);
    const uniqueMistakes = [...new Set(allMistakes)];

    const prompt = `
Analyze these mistakes from an emergency drill and create a corrective action plan:

Mistakes identified:
${uniqueMistakes.map(m => `- ${m}`).join('\n')}

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
            content: "You are a maritime training coordinator who creates actionable corrective plans."
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
    const actions = JSON.parse(data.choices[0].message.content);

    // Store corrective actions
    for (const action of actions) {
      await supabase.from("drill_corrective_actions").insert({
        execution_id: executionId,
        issue_identified: action.issue,
        recommended_action: action.action,
        priority: action.priority,
        training_required: action.trainingRequired,
        training_type: action.trainingType,
      });
    }
  } catch (error) {
    console.error("Error generating corrective action plan:", error);
    throw error;
  }
}

/**
 * Sets up automatic drill scheduling
 */
export async function setupDrillSchedule(
  scenarioId: string,
  vesselId: string,
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually',
  createdBy: string
): Promise<string> {
  try {
    const nextDate = calculateNextDrillDate(frequency);

    const { data, error } = await supabase
      .from("drill_schedule")
      .insert({
        scenario_id: scenarioId,
        vessel_id: vesselId,
        frequency,
        next_scheduled_date: nextDate.toISOString(),
        auto_schedule: true,
        active: true,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error setting up schedule: ${error.message}`);
    }

    return data.id;
  } catch (error) {
    console.error("Error setting up drill schedule:", error);
    throw error;
  }
}

/**
 * Calculates next drill date based on frequency
 */
function calculateNextDrillDate(frequency: string): Date {
  const now = new Date();
  
  switch (frequency) {
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'biweekly':
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    case 'quarterly':
      return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
    case 'annually':
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    default:
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
}

/**
 * Gets upcoming drills for a vessel
 */
export async function getUpcomingDrills(vesselId: string, limit = 10) {
  const { data, error } = await supabase
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

  return data;
}

/**
 * Gets drill execution history for a vessel
 */
export async function getDrillHistory(vesselId: string, limit = 20) {
  const { data, error } = await supabase
    .from("drill_executions")
    .select("*, drill_scenarios(*)")
    .eq("vessel_id", vesselId)
    .order("execution_date", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}
