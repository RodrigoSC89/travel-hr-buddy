// @ts-nocheck
// PATCH 598: Generate Training Quiz Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topic, module, difficulty = 'medium', num_questions = 5, context } = await req.json()

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

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
      const error = await response.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    let result
    try {
      result = JSON.parse(content)
      // Add unique IDs if not present
      result.questions = result.questions.map((q: any, i: number) => ({
        ...q,
        id: q.id || `q-${Date.now()}-${i}`
      }))
    } catch (e) {
      console.error('Failed to parse OpenAI response:', content)
      throw new Error('Invalid response format from AI')
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in generate-training-quiz:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
