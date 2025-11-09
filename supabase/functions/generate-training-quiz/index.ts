// PATCH 598: Generate Training Quiz Edge Function
// @ts-nocheck - Deno runtime types not available in VS Code
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
interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: string
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface TrainingQuizRequest {
  topic: string
  module: string
  difficulty?: 'easy' | 'medium' | 'hard'
  num_questions?: number
  context?: string
}

interface TrainingQuizResponse {
  questions: QuizQuestion[]
  estimated_duration_minutes: number
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
    const body = safeJSONParse<TrainingQuizRequest>(await req.text())
    validateRequestBody(body as unknown as Record<string, unknown>, ['topic', 'module'])

    const { 
      topic, 
      module, 
      difficulty = 'medium', 
      num_questions = 5, 
      context 
    } = body

    const openaiApiKey = getEnvVar('OPENAI_API_KEY')

    const prompt = `You are an expert maritime training instructor. Generate a quiz for crew training.

Topic: ${topic}
Module: ${module}
Difficulty: ${difficulty}
Number of Questions: ${num_questions}
Context: ${context || 'N/A'}

Generate ${num_questions} multiple-choice questions that test understanding of ${topic} in the context of ${module}.

Requirements:
- Questions should be clear and unambiguous
- Each question should have 4 options
- Provide explanations for why the correct answer is right
- Match the difficulty level: ${difficulty}
- Questions should be practical and relevant to maritime operations

Return your response in JSON format:
{
  "questions": [
    {
      "id": "unique-id",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "The correct option text",
      "explanation": "Why this is the correct answer",
      "difficulty": "${difficulty}"
    }
  ],
  "estimated_duration_minutes": 15
}`

    log('info', 'Calling OpenAI API for quiz generation', { 
      topic, 
      module, 
      num_questions, 
      requestId 
    })

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
            content: 'You are an expert maritime training instructor who creates effective assessment questions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
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
    const contentText = data.choices[0]?.message?.content

    if (!contentText) {
      throw new EdgeFunctionError(
        'INVALID_RESPONSE',
        'OpenAI API returned empty response',
        502
      )
    }

    const result = safeJSONParse<TrainingQuizResponse>(contentText)

    // Add unique IDs if not present
    result.questions = result.questions.map((q, i) => ({
      ...q,
      id: q.id || `q-${Date.now()}-${i}`
    }))

    log('info', 'Quiz generated successfully', { 
      question_count: result.questions.length,
      topic,
      module,
      requestId 
    })

    return createResponse(result, undefined, requestId)

  } catch (error) {
    log('error', 'Error in quiz generation', { 
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

