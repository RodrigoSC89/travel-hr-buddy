// @ts-nocheck
/**
 * PATCH 601 - Relatórios Automáticos com IA
 * Automated intelligent reporting engine with LLM-generated summaries
 */

import { supabase } from "@/integrations/supabase/client";

export type ReportType = 'INSPECTION' | 'TASK' | 'RISK' | 'CREW_PERFORMANCE' | 'MONTHLY_CONSOLIDATED' | 'CUSTOM';
export type ExportFormat = 'PDF' | 'JSON' | 'XLSX' | 'CSV' | 'HTML';
export type ScheduleType = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually' | 'on_demand';

export interface ReportTemplate {
  id?: string;
  templateName: string;
  templateType: ReportType;
  description: string;
  templateStructure: Record<string, any>;
  sections: ReportSection[];
  dataSources: string[];
  visualizationConfig: Record<string, any>;
  aiSummaryEnabled: boolean;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'text' | 'table' | 'chart' | 'summary' | 'metrics';
  content?: any;
  dataQuery?: string;
}

export interface GeneratedReport {
  id?: string;
  templateId: string;
  reportTitle: string;
  reportType: ReportType;
  vesselId?: string;
  periodStart?: Date;
  periodEnd?: Date;
  reportData: Record<string, any>;
  aiSummary?: string;
  aiInsights?: string[];
  executiveSummary?: string;
  conclusions?: string[];
  recommendations?: string[];
  status: 'generating' | 'completed' | 'failed' | 'archived';
}

/**
 * Generates an intelligent report using AI
 */
export async function generateIntelligentReport(
  templateId: string,
  vesselId: string | null,
  periodStart: Date,
  periodEnd: Date,
  userId: string
): Promise<string> {
  const startTime = Date.now();
  
  try {
    // Get template
    const { data: template, error: templateError } = await supabase
      .from("report_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (templateError || !template) {
      throw new Error("Template not found");
    }

    // Collect data from various sources
    const reportData = await collectReportData(
      template.data_sources,
      vesselId,
      periodStart,
      periodEnd
    );

    // Generate AI summary if enabled
    let aiSummary = "";
    let aiInsights: string[] = [];
    let executiveSummary = "";
    let conclusions: string[] = [];
    let recommendations: string[] = [];

    if (template.ai_summary_enabled) {
      const aiContent = await generateAISummary(
        template.template_type,
        reportData
      );
      
      aiSummary = aiContent.summary;
      aiInsights = aiContent.insights;
      executiveSummary = aiContent.executiveSummary;
      conclusions = aiContent.conclusions;
      recommendations = aiContent.recommendations;
    }

    // Create report record
    const { data: report, error: reportError } = await supabase
      .from("generated_reports")
      .insert({
        template_id: templateId,
        report_title: `${template.template_name} - ${periodStart.toLocaleDateString()}`,
        report_type: template.template_type,
        vessel_id: vesselId,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        report_data: reportData,
        ai_summary: aiSummary,
        ai_insights: aiInsights,
        executive_summary: executiveSummary,
        conclusions,
        recommendations,
        status: 'completed',
        generation_time_ms: Date.now() - startTime,
        generated_by: userId,
      })
      .select()
      .single();

    if (reportError) {
      throw new Error(`Error creating report: ${reportError.message}`);
    }

    // Log generation
    await supabase.from("report_generation_log").insert({
      report_id: report.id,
      status: 'completed',
      execution_time_ms: Date.now() - startTime,
      data_sources_queried: template.data_sources,
    });

    return report.id;
  } catch (error) {
    console.error("Error generating report:", error);
    
    // Log failure
    await supabase.from("report_generation_log").insert({
      status: 'failed',
      execution_time_ms: Date.now() - startTime,
      error_message: error instanceof Error ? error.message : "Unknown error",
    });
    
    throw error;
  }
}

/**
 * Collects data from various sources for the report
 */
async function collectReportData(
  dataSources: string[],
  vesselId: string | null,
  periodStart: Date,
  periodEnd: Date
): Promise<Record<string, any>> {
  const data: Record<string, any> = {};

  for (const source of dataSources) {
    try {
      switch (source) {
        case 'risk_assessments':
          data.risks = await fetchRiskData(vesselId, periodStart, periodEnd);
          break;
        case 'drill_executions':
          data.drills = await fetchDrillData(vesselId, periodStart, periodEnd);
          break;
        case 'crew_training':
          data.training = await fetchTrainingData(vesselId, periodStart, periodEnd);
          break;
        case 'noncompliance':
          data.noncompliance = await fetchNoncomplianceData(vesselId, periodStart, periodEnd);
          break;
        default:
          console.warn(`Unknown data source: ${source}`);
      }
    } catch (error) {
      console.error(`Error fetching data from ${source}:`, error);
      data[source] = { error: "Failed to fetch data" };
    }
  }

  return data;
}

/**
 * Fetches risk assessment data
 */
async function fetchRiskData(vesselId: string | null, start: Date, end: Date) {
  let query = supabase
    .from("risk_assessments")
    .select("*")
    .gte("assessed_at", start.toISOString())
    .lte("assessed_at", end.toISOString());

  if (vesselId) {
    query = query.eq("vessel_id", vesselId);
  }

  const { data, error } = await query;
  return error ? [] : data;
}

/**
 * Fetches drill execution data
 */
async function fetchDrillData(vesselId: string | null, start: Date, end: Date) {
  let query = supabase
    .from("drill_executions")
    .select("*, drill_scenarios(*)")
    .gte("execution_date", start.toISOString())
    .lte("execution_date", end.toISOString());

  if (vesselId) {
    query = query.eq("vessel_id", vesselId);
  }

  const { data, error } = await query;
  return error ? [] : data;
}

/**
 * Fetches training data
 */
async function fetchTrainingData(vesselId: string | null, start: Date, end: Date) {
  const { data, error } = await supabase
    .from("crew_training_results")
    .select("*, crew_training_quizzes(*)")
    .gte("completed_at", start.toISOString())
    .lte("completed_at", end.toISOString());

  return error ? [] : data;
}

/**
 * Fetches noncompliance data
 */
async function fetchNoncomplianceData(vesselId: string | null, start: Date, end: Date) {
  let query = supabase
    .from("noncompliance_explanations")
    .select("*")
    .gte("generated_at", start.toISOString())
    .lte("generated_at", end.toISOString());

  if (vesselId) {
    query = query.eq("vessel_id", vesselId);
  }

  const { data, error } = await query;
  return error ? [] : data;
}

/**
 * Generates AI summary and insights for the report
 */
async function generateAISummary(
  reportType: string,
  reportData: Record<string, any>
): Promise<{
  summary: string;
  insights: string[];
  executiveSummary: string;
  conclusions: string[];
  recommendations: string[];
}> {
  try {
    const apiKey = (import.meta as any).env.VITE_OPENAI_API_KEY as string;
    
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const prompt = buildReportSummaryPrompt(reportType, reportData);
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a maritime operations analyst who creates comprehensive, insightful reports. You analyze data and provide executive-level summaries with actionable recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return {
      summary: content.summary,
      insights: content.insights,
      executiveSummary: content.executiveSummary,
      conclusions: content.conclusions,
      recommendations: content.recommendations,
    };
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return {
      summary: "AI summary generation failed",
      insights: [],
      executiveSummary: "Error generating executive summary",
      conclusions: [],
      recommendations: [],
    };
  }
}

/**
 * Builds the prompt for AI summary generation
 */
function buildReportSummaryPrompt(reportType: string, data: Record<string, any>): string {
  return `
Analyze this maritime operations data and create a comprehensive report summary:

Report Type: ${reportType}

Data Summary:
${JSON.stringify(data, null, 2)}

Provide:
1. SUMMARY: Overall summary of the data (2-3 paragraphs)
2. INSIGHTS: 5-7 key insights from the data
3. EXECUTIVE_SUMMARY: High-level executive summary (1 paragraph)
4. CONCLUSIONS: 3-5 main conclusions
5. RECOMMENDATIONS: 5-8 actionable recommendations

Format as JSON:
{
  "summary": "...",
  "insights": ["...", "..."],
  "executiveSummary": "...",
  "conclusions": ["...", "..."],
  "recommendations": ["...", "..."]
}
`;
}

/**
 * Exports a report in the specified format
 */
export async function exportReport(
  reportId: string,
  format: ExportFormat,
  userId: string
): Promise<string> {
  try {
    const { data: report, error } = await supabase
      .from("generated_reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (error || !report) {
      throw new Error("Report not found");
    }

    // Record export
    const { data: exportRecord, error: exportError } = await supabase
      .from("report_exports")
      .insert({
        report_id: reportId,
        export_format: format,
        file_size_bytes: JSON.stringify(report).length,
        exported_by: userId,
      })
      .select()
      .single();

    if (exportError) {
      throw exportError;
    }

    return exportRecord.id;
  } catch (error) {
    console.error("Error exporting report:", error);
    throw error;
  }
}

/**
 * Creates a report schedule
 */
export async function createReportSchedule(
  templateId: string,
  scheduleName: string,
  scheduleType: ScheduleType,
  vesselId: string | null,
  recipients: string[],
  deliveryMethod: 'email' | 'dashboard' | 'both',
  exportFormats: ExportFormat[],
  userId: string
): Promise<string> {
  try {
    const nextExecution = calculateNextExecution(scheduleType);

    const { data, error } = await supabase
      .from("report_schedules")
      .insert({
        template_id: templateId,
        schedule_name: scheduleName,
        schedule_type: scheduleType,
        next_execution: nextExecution.toISOString(),
        vessel_id: vesselId,
        recipients,
        delivery_method: deliveryMethod,
        export_formats: exportFormats,
        active: true,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data.id;
  } catch (error) {
    console.error("Error creating report schedule:", error);
    throw error;
  }
}

/**
 * Calculates next execution date based on schedule type
 */
function calculateNextExecution(scheduleType: ScheduleType): Date {
  const now = new Date();
  
  switch (scheduleType) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'biweekly':
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    case 'quarterly':
      return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
    case 'annually':
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    default:
      return now;
  }
}

/**
 * Gets recent reports
 */
export async function getRecentReports(vesselId: string | null, limit = 20) {
  let query = supabase
    .from("generated_reports")
    .select("*")
    .order("generated_at", { ascending: false })
    .limit(limit);

  if (vesselId) {
    query = query.eq("vessel_id", vesselId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Gets active report schedules
 */
export async function getActiveSchedules(vesselId: string | null) {
  let query = supabase
    .from("report_schedules")
    .select("*, report_templates(*)")
    .eq("active", true)
    .order("next_execution", { ascending: true });

  if (vesselId) {
    query = query.eq("vessel_id", vesselId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}
