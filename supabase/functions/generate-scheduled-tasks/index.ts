// PATCH 597: AI Task Generation Edge Function
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
    const { module, vessel_id, context, historical_data } = await req.json()

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Build prompt for task generation
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

    // Call OpenAI API
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
    console.error('Error in generate-scheduled-tasks:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
