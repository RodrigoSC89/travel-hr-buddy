// PATCH 599: Generate Drill Evaluation Edge Function
// TYPE SAFETY FIX: Removed @ts-nocheck, added proper TypeScript types
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { 
  createResponse, 
  EdgeFunctionError, 
  validateRequestBody, 
  corsHeaders,
  handleCORS,
  getEnvVar,
  safeJSONParse,
  log
} from '../_shared/types.ts'

/**
 * Request body structure for drill evaluation
 */
interface DrillEvaluationRequest {
  drill_id: string
  responses: Record<string, unknown>
  observations?: string
}

/**
 * Detailed analysis structure
 */
interface DetailedAnalysis {
  response_time: string
  communication: string
  coordination: string
  equipment_use: string
  safety_protocols: string
}

/**
 * Response structure from OpenAI
 */
interface DrillEvaluationResponse {
  overall_score: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  corrective_plan: string
  detailed_analysis: DetailedAnalysis
}

/**
 * OpenAI API response structure
 */
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

const withCorsHeaders = (response: Response): Response => {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCORS()
  }

  const requestId = crypto.randomUUID()
  log('info', 'Drill evaluation request received', { requestId })

  try {
    // Parse and validate request body
  const body = await req.json() as DrillEvaluationRequest
  validateRequestBody(body as Record<string, unknown>, ['drill_id', 'responses'])
    
    const { drill_id, responses, observations } = body

    // Get OpenAI API key with validation
    const openaiApiKey = getEnvVar('OPENAI_API_KEY')

    const prompt = `You are an expert maritime safety evaluator. Analyze the drill performance and provide comprehensive feedback.

Drill ID: ${drill_id}
Crew Responses: ${JSON.stringify(responses)}
Observations: ${observations || 'None provided'}

Analyze the drill performance and provide:
1. An overall score (0-100)
2. Key strengths demonstrated
3. Weaknesses or areas for improvement
4. Specific recommendations for future training
5. A detailed corrective action plan
6. Detailed analysis with metrics

Return your response in JSON format:
{
  "overall_score": 85,
  "strengths": ["Strength 1", "Strength 2", ...],
  "weaknesses": ["Weakness 1", "Weakness 2", ...],
  "recommendations": ["Recommendation 1", "Recommendation 2", ...],
  "corrective_plan": "Detailed step-by-step corrective action plan",
  "detailed_analysis": {
    "response_time": "Analysis of response times",
    "communication": "Communication effectiveness",
    "coordination": "Team coordination assessment",
    "equipment_use": "Equipment usage evaluation",
    "safety_protocols": "Safety protocol adherence"
  }
}`

    log('info', 'Calling OpenAI API for drill evaluation', { drill_id, requestId })

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
            content: 'You are an expert maritime safety evaluator with deep knowledge of emergency procedures and crew performance assessment.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500,
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

    const result = safeJSONParse<DrillEvaluationResponse>(content)
    
    log('info', 'Drill evaluation completed successfully', { 
      drill_id, 
      score: result.overall_score,
      requestId 
    })

  return withCorsHeaders(createResponse<DrillEvaluationResponse>(result, undefined, requestId))

  } catch (error) {
    log('error', 'Error in drill evaluation', { 
      error: error instanceof Error ? error.message : String(error),
      requestId
    })

    if (error instanceof EdgeFunctionError) {
      return withCorsHeaders(createResponse(undefined, error, requestId))
    }

    return withCorsHeaders(
      createResponse(
        undefined,
        new EdgeFunctionError(
          'INTERNAL_ERROR',
          error instanceof Error ? error.message : 'An unexpected error occurred',
          500,
          { originalError: String(error) }
        ),
        requestId
      )
    )
  }
})

