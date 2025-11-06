// @ts-nocheck
// PATCH 601: Generate Report Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      template_id, 
      report_type, 
      title, 
      period_start, 
      period_end, 
      vessel_id, 
      module, 
      format = 'pdf',
      parameters 
    } = await req.json()

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Gather data based on report type
    let contextData = {}
    
    if (report_type === 'inspection') {
      // Get inspection data
      const { data: inspections } = await supabase
        .from('inspections')
        .select('*')
        .gte('created_at', period_start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('created_at', period_end || new Date().toISOString())
      contextData = { inspections }
    } else if (report_type === 'risk') {
      // Get risk data
      const { data: risks } = await supabase
        .from('risk_operations')
        .select('*')
        .order('risk_score', { ascending: false })
      contextData = { risks }
    } else if (report_type === 'tasks') {
      // Get task data
      const { data: tasks } = await supabase
        .from('scheduled_tasks')
        .select('*')
        .gte('created_at', period_start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('created_at', period_end || new Date().toISOString())
      contextData = { tasks }
    }

    const prompt = `You are a maritime operations report writer. Generate a comprehensive ${report_type} report.

Report Details:
- Title: ${title}
- Period: ${period_start || 'Last 30 days'} to ${period_end || 'Today'}
- Vessel ID: ${vessel_id || 'All vessels'}
- Module: ${module || 'All modules'}

Data Context:
${JSON.stringify(contextData, null, 2)}

Generate a professional report with the following sections:
1. Executive Summary
2. Key Findings
3. Detailed Analysis
4. Recommendations
5. Conclusion

Return your response in JSON format:
{
  "executive_summary": "Brief overview...",
  "key_findings": ["Finding 1", "Finding 2", ...],
  "detailed_analysis": "Comprehensive analysis...",
  "recommendations": ["Recommendation 1", "Recommendation 2", ...],
  "conclusion": "Final thoughts...",
  "statistics": {
    "total_items": 0,
    "critical_items": 0,
    "completed_items": 0
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
            content: 'You are an expert maritime operations report writer with deep knowledge of industry standards and best practices.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = JSON.parse(data.choices[0].message.content)

    // Store the generated report
    const { data: report, error: insertError } = await supabase
      .from('generated_reports')
      .insert({
        template_id,
        title,
        report_type,
        content,
        format,
        parameters: parameters || {},
        period_start,
        period_end,
        vessel_id,
        module,
        ai_generated: true,
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Failed to store report: ${insertError.message}`)
    }

    return new Response(
      JSON.stringify({
        report_id: report.id,
        content,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in generate-report:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
