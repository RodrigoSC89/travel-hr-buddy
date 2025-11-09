// PATCH 601: Generate Report Edge Function
// @ts-nocheck - Deno runtime types not available in VS Code
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  createResponse, 
  EdgeFunctionError, 
  validateRequestBody, 
  handleCORS,
  getEnvVar,
  safeJSONParse,
  log
} from '../_shared/types.ts'

interface GenerateReportRequest {
  template_id?: string
  report_type: 'inspection' | 'risk' | 'tasks' | 'compliance'
  title: string
  period_start?: string
  period_end?: string
  vessel_id?: string
  module?: string
  format?: 'pdf' | 'docx' | 'html'
  parameters?: Record<string, unknown>
}

interface ReportStatistics {
  total_items: number
  critical_items: number
  completed_items: number
}

interface ReportResponse {
  executive_summary: string
  key_findings: string[]
  detailed_analysis: string
  recommendations: string[]
  conclusion: string
  statistics: ReportStatistics
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
  log('info', 'Generate report request received', { requestId })

  try {
    const body = await req.json() as GenerateReportRequest
    validateRequestBody(body as unknown as Record<string, unknown>, ['report_type', 'title'])
    
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
    } = body

    const openaiApiKey = getEnvVar('OPENAI_API_KEY')
    const supabaseUrl = getEnvVar('SUPABASE_URL')
    const supabaseKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Gather data based on report type
    let contextData: Record<string, unknown> = {}
    
    if (report_type === 'inspection') {
      const { data: inspections } = await supabase
        .from('inspections')
        .select('*')
        .gte('created_at', period_start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('created_at', period_end || new Date().toISOString())
      contextData = { inspections }
    } else if (report_type === 'risk') {
      const { data: risks } = await supabase
        .from('risk_operations')
        .select('*')
        .order('risk_score', { ascending: false })
      contextData = { risks }
    } else if (report_type === 'tasks') {
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

    log('info', 'Calling OpenAI API for report generation', { report_type, requestId })

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

    const content = safeJSONParse<ReportResponse>(contentText)

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
      throw new EdgeFunctionError(
        'DATABASE_ERROR',
        `Failed to store report: ${insertError.message}`,
        500,
        { originalError: insertError }
      )
    }

    log('info', 'Report generated and stored successfully', { 
      report_id: report.id,
      report_type,
      requestId 
    })

    return createResponse({
      report_id: report.id,
      content,
    }, undefined, requestId)

  } catch (error) {
    log('error', 'Error in report generation', { 
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

