// PATCH 598: Generate Training Explanation Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import {
  createResponse,
  EdgeFunctionError,
  validateRequestBody,
  getEnvVar,
  log,
  handleCORS,
  safeJSONParse,
} from '../_shared/types.ts'

// Request/Response Types
interface TrainingExplanationRequest {
  non_conformity: string
  module: string
  context?: string
}

interface TrainingExplanationResponse {
  explanation: string
  key_points: string[]
  corrective_actions: string[]
  related_topics: string[]
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

serve(async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID()
  
  if (req.method === 'OPTIONS') {
    return handleCORS()
  }

  try {
    const body = safeJSONParse<TrainingExplanationRequest>(await req.text())
    validateRequestBody(body as unknown as Record<string, unknown>, ['non_conformity', 'module'])

    const { non_conformity, module, context } = body

    const openaiApiKey = getEnvVar('OPENAI_API_KEY')

    const prompt = `You are an expert maritime training instructor. Explain the following non-conformity in a clear, educational manner.

Non-Conformity: ${non_conformity}
Module: ${module}
Context: ${context || 'N/A'}

Provide:
1. A clear explanation of what went wrong and why it matters
2. Key points that crew members should understand
3. Specific corrective actions that should be taken
4. Related topics they should study to prevent future occurrences

Return your response in JSON format:
{
  "explanation": "Detailed explanation...",
  "key_points": ["Point 1", "Point 2", ...],
  "corrective_actions": ["Action 1", "Action 2", ...],
  "related_topics": ["Topic 1", "Topic 2", ...]
}`

    log('info', 'Calling OpenAI API for training explanation', { module, requestId })

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
            content: 'You are an expert maritime training instructor who provides clear, actionable explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
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
    const contentText = data.choices[0]?.message?.content

    if (!contentText) {
      throw new EdgeFunctionError(
        'INVALID_RESPONSE',
        'OpenAI API returned empty response',
        502
      )
    }

    const result = safeJSONParse<TrainingExplanationResponse>(contentText)

    log('info', 'Training explanation generated successfully', { module, requestId })

    return createResponse(result, undefined, requestId)

  } catch (error) {
    log('error', 'Error in training explanation', { 
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

