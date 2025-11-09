// PATCH 597: AI Task Generation Edge Function
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
interface TaskItem {
  title: string
  description: string
  module: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  due_date: string
  metadata?: Record<string, unknown>
}

interface GenerateTasksRequest {
  module: string
  vessel_id?: string
  context?: string
  historical_data?: unknown[]
}

interface GenerateTasksResponse {
  tasks: TaskItem[]
  confidence: number
  reasoning: string
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
    const body = safeJSONParse<GenerateTasksRequest>(await req.text())
    validateRequestBody(body as unknown as Record<string, unknown>, ['module'])

    const { 
      module, 
      vessel_id, 
      context, 
      historical_data 
    } = body

    const openaiApiKey = getEnvVar('OPENAI_API_KEY')

    const prompt = `You are an AI assistant for maritime operations management. Generate scheduled tasks for the ${module} module.

Context: ${context || 'General operations'}
Vessel ID: ${vessel_id || 'Not specified'}
Historical Data: ${JSON.stringify(historical_data || [])}

Generate 3-5 tasks that are:
1. Specific to the ${module} module (PSC: Port State Control, MLC: Maritime Labour Convention, LSA: Life-Saving Appliances, OVID: Operational Vessel Inspection Database)
2. Prioritized based on compliance requirements and operational needs
3. Scheduled with realistic due dates (within the next 30 days)
4. Include clear descriptions of what needs to be done

Return a JSON array of tasks with the following structure:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Detailed description",
      "module": "${module}",
      "priority": "low|medium|high|critical",
      "due_date": "ISO date string",
      "metadata": {}
    }
  ],
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of why these tasks were generated"
}`

    log('info', 'Calling OpenAI API for task generation', { module, requestId })

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
            content: 'You are an expert in maritime operations and compliance. Generate realistic, actionable tasks for maritime vessels.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
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
    const contentText = data.choices[0]?.message?.content

    if (!contentText) {
      throw new EdgeFunctionError(
        'INVALID_RESPONSE',
        'OpenAI API returned empty response',
        502
      )
    }

    const result = safeJSONParse<GenerateTasksResponse>(contentText)

    log('info', 'Tasks generated successfully', { 
      task_count: result.tasks.length,
      module,
      requestId 
    })

    return createResponse(result, undefined, requestId)

  } catch (error) {
    log('error', 'Error in task generation', { 
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

