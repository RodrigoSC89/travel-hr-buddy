// PATCH 599: Generate Drill Scenario Edge Function
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
    const { drill_type, vessel_id, context, difficulty = 'intermediate' } = await req.json()

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

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
    console.error('Error in generate-drill-scenario:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
