// @ts-nocheck
// PATCH 599: Generate Drill Evaluation Edge Function
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
    const { drill_id, responses, observations } = await req.json()

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

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
      const error = await response.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    let result
    try {
      result = JSON.parse(content)
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
    console.error('Error in generate-drill-evaluation:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
