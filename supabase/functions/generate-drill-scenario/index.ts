// PATCH 599: Generate Drill Scenario Edge Function
// TYPE SAFETY FIX: Removed @ts-nocheck, added proper TypeScript types
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { 
  createResponse, 
  EdgeFunctionError, 
  validateRequestBody, 
  handleCORS,
  getEnvVar,
  safeJSONParse,
  log
} from '../_shared/types.ts'

interface DrillScenarioRequest {
  drill_type: string
  vessel_id?: string
  context?: string
  difficulty?: 'basic' | 'intermediate' | 'advanced' | 'expert'
}

interface DrillScenarioResponse {
  title: string
  description: string
  scenario: string
  objectives: string[]
  duration_minutes: number
  roles_involved: string[]
  equipment_needed: string[]
  success_criteria: string[]
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return handleCORS()
  }

  const requestId = crypto.randomUUID()
  log('info', 'Drill scenario request received', { requestId })

  try {
    const body = await req.json() as DrillScenarioRequest
    validateRequestBody(body as unknown as Record<string, unknown>, ['drill_type'])
    
    const { drill_type, vessel_id, context, difficulty = 'intermediate' } = body

    const openaiApiKey = getEnvVar('OPENAI_API_KEY')

    const prompt = `You are an expert maritime safety training coordinator. Generate a realistic emergency drill scenario.

Drill Type: ${drill_type}
Difficulty: ${difficulty}
Vessel ID: ${vessel_id || 'General'}
Context: ${context || 'Standard maritime operations'}

Create a comprehensive drill scenario that includes:
1. A compelling and realistic title
2. A detailed description
3. The complete scenario with specific details
4. Clear learning objectives (3-5)
5. Duration estimate in minutes
6. Roles involved
7. Equipment needed
8. Success criteria for evaluation

Return your response in JSON format:
{
  "title": "Drill title",
  "description": "Brief description",
  "scenario": "Detailed scenario description with specifics about time, location, conditions, etc.",
  "objectives": ["Objective 1", "Objective 2", ...],
  "duration_minutes": 60,
  "roles_involved": ["Role 1", "Role 2", ...],
  "equipment_needed": ["Equipment 1", "Equipment 2", ...],
  "success_criteria": ["Criterion 1", "Criterion 2", ...]
}`

    log('info', 'Calling OpenAI API for drill scenario', { drill_type, requestId })

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in maritime safety and emergency procedures. Create realistic, practical drill scenarios.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      log('error', 'OpenAI API error', { status: response.status, error: errorText, requestId })
      throw new EdgeFunctionError(
        'OPENAI_API_ERROR',
        `OpenAI API returned ${response.status}: ${response.statusText}`,
        502,
        { originalError: errorText }
      )
    }

    const data = safeJSONParse<OpenAIResponse>(await response.text())
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new EdgeFunctionError(
        'INVALID_RESPONSE',
        'OpenAI API returned empty response',
        502
      )
    }

    const result = safeJSONParse<DrillScenarioResponse>(content)
    
    log('info', 'Drill scenario generated successfully', { 
      drill_type, 
      title: result.title,
      requestId 
    })

    return createResponse<DrillScenarioResponse>(result, undefined, requestId)

  } catch (error) {
    log('error', 'Error in drill scenario generation', { 
      error: error instanceof Error ? error.message : String(error),
      requestId
    })

    if (error instanceof EdgeFunctionError) {
      return createResponse(undefined, error, requestId)
    }

    return createResponse(
      undefined,
      new EdgeFunctionError(
        'INTERNAL_ERROR',
        error instanceof Error ? error.message : 'An unexpected error occurred',
        500,
        { originalError: String(error) }
      ),
      requestId
    )
  }
})

