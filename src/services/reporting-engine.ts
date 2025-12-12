/**
 * PATCH 601 - Relatórios Automáticos com IA
 * Automated intelligent reporting engine with LLM-generated summaries
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { logger } from "@/lib/logger";

export type ReportType =
	| "INSPECTION"
	| "TASK"
	| "RISK"
	| "CREW_PERFORMANCE"
	| "MONTHLY_CONSOLIDATED"
	| "CUSTOM";
export type ExportFormat = "PDF" | "JSON" | "XLSX" | "CSV" | "HTML";
export type ScheduleType =
	| "daily"
	| "weekly"
	| "biweekly"
	| "monthly"
	| "quarterly"
	| "annually"
	| "on_demand";
type ScheduleDeliveryMethod = "email" | "dashboard" | "both";

export interface ReportSection {
	id: string;
	title: string;
	type: "text" | "table" | "chart" | "summary" | "metrics";
	content?: Record<string, unknown>;
	dataQuery?: string;
}

export interface ReportTemplate {
	id: string;
	templateName: string;
	templateType: ReportType;
	description: string | null;
	templateStructure: Record<string, unknown>;
	sections: ReportSection[];
	dataSources: string[];
	visualizationConfig: Record<string, unknown>;
	aiSummaryEnabled: boolean;
	active: boolean;
	createdBy: string | null;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface GeneratedReport {
	id?: string;
	templateId: string;
	reportTitle: string;
	reportType: ReportType;
	vesselId?: string | null;
	periodStart?: string | null;
	periodEnd?: string | null;
	reportData: Record<string, unknown>;
	aiSummary?: string | null;
	aiInsights?: string[];
	executiveSummary?: string | null;
	conclusions?: string[];
	recommendations?: string[];
	status: "generating" | "completed" | "failed" | "archived";
}

type ReportData = Record<string, unknown>;

type ReportingTables = {
	report_templates: {
		Row: {
			id: string;
			template_name: string;
			template_type: ReportType;
			description: string | null;
			template_structure: Json;
			sections: Json | null;
			data_sources: Json | null;
			visualization_config: Json | null;
			ai_summary_enabled: boolean | null;
			active: boolean | null;
			created_by: string | null;
			created_at: string | null;
			updated_at: string | null;
		};
		Insert: never;
		Update: never;
	};
	generated_reports: {
		Row: {
			id: string;
			template_id: string | null;
			report_title: string;
			report_type: ReportType;
			vessel_id: string | null;
			period_start: string | null;
			period_end: string | null;
			report_data: Json;
			ai_summary: string | null;
			ai_insights: Json | null;
			executive_summary: string | null;
			conclusions: Json | null;
			recommendations: Json | null;
			status: string | null;
			generation_time_ms: number | null;
			generated_by: string | null;
			generated_at: string | null;
			created_at: string | null;
			updated_at: string | null;
		};
		Insert: {
			id?: string;
			template_id: string | null;
			report_title: string;
			report_type: ReportType;
			vessel_id?: string | null;
			period_start?: string | null;
			period_end?: string | null;
			report_data: Json;
			ai_summary?: string | null;
			ai_insights?: Json | null;
			executive_summary?: string | null;
			conclusions?: Json | null;
			recommendations?: Json | null;
			status?: string | null;
			generation_time_ms?: number | null;
			generated_by?: string | null;
			generated_at?: string | null;
			created_at?: string | null;
			updated_at?: string | null;
		};
		Update: never;
	};
	report_generation_log: {
		Row: {
			id: string;
			report_id: string | null;
			schedule_id: string | null;
			status: "started" | "processing" | "completed" | "failed";
			execution_time_ms: number | null;
			error_message: string | null;
			error_details: Json | null;
			data_sources_queried: Json | null;
			ai_tokens_used: number | null;
			created_at: string | null;
		};
		Insert: {
			id?: string;
			report_id?: string | null;
			schedule_id?: string | null;
			status: "started" | "processing" | "completed" | "failed";
			execution_time_ms?: number | null;
			error_message?: string | null;
			error_details?: Json | null;
			data_sources_queried?: Json | null;
			ai_tokens_used?: number | null;
			created_at?: string | null;
		};
		Update: never;
	};
	report_schedules: {
		Row: {
			id: string;
			template_id: string | null;
			schedule_name: string;
			schedule_type: ScheduleType;
			cron_expression: string | null;
			next_execution: string;
			last_execution: string | null;
			vessel_id: string | null;
			recipients: Json | null;
			delivery_method: ScheduleDeliveryMethod | null;
			export_formats: Json | null;
			active: boolean | null;
			auto_archive_days: number | null;
			created_by: string | null;
			created_at: string | null;
			updated_at: string | null;
		};
		Insert: {
			id?: string;
			template_id?: string | null;
			schedule_name: string;
			schedule_type: ScheduleType;
			cron_expression?: string | null;
			next_execution: string;
			last_execution?: string | null;
			vessel_id?: string | null;
			recipients?: Json | null;
			delivery_method?: ScheduleDeliveryMethod | null;
			export_formats?: Json | null;
			active?: boolean | null;
			auto_archive_days?: number | null;
			created_by?: string | null;
			created_at?: string | null;
			updated_at?: string | null;
		};
		Update: Partial<ReportingTables["report_schedules"]["Row"]>;
	};
	report_exports: {
		Row: {
			id: string;
			report_id: string | null;
			export_format: ExportFormat;
			file_path: string | null;
			file_size_bytes: number | null;
			file_hash: string | null;
			export_options: Json | null;
			exported_by: string | null;
			exported_at: string | null;
			downloaded_count: number | null;
			last_downloaded_at: string | null;
			expires_at: string | null;
			created_at: string | null;
		};
		Insert: {
			id?: string;
			report_id?: string | null;
			export_format: ExportFormat;
			file_path?: string | null;
			file_size_bytes?: number | null;
			file_hash?: string | null;
			export_options?: Json | null;
			exported_by?: string | null;
			exported_at?: string | null;
			downloaded_count?: number | null;
			last_downloaded_at?: string | null;
			expires_at?: string | null;
			created_at?: string | null;
		};
		Update: never;
	};
};

type ReportingDatabase = Database & {
	public: Database["public"] & {
		Tables: Database["public"]["Tables"] & ReportingTables;
	};
};

type ReportTemplateRow = ReportingTables["report_templates"]["Row"];
type GeneratedReportRow = ReportingTables["generated_reports"]["Row"];
type GeneratedReportInsert = ReportingTables["generated_reports"]["Insert"];
type ReportScheduleRow = ReportingTables["report_schedules"]["Row"];
type ReportGenerationLogInsert = ReportingTables["report_generation_log"]["Insert"];
type ReportExportInsert = ReportingTables["report_exports"]["Insert"];

type ScheduleWithTemplate = ReportScheduleRow & {
	report_templates?: ReportTemplateRow | null;
};

const reportingClient = supabase as SupabaseClient<ReportingDatabase>;
const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_MAX_TOKENS = 2500;

interface AISummaryContent {
	summary: string;
	insights: string[];
	executiveSummary: string;
	conclusions: string[];
	recommendations: string[];
}

interface OpenAIChatCompletion {
	choices?: Array<{
		message?: {
			content?: string | null;
		} | null;
	}>;
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
    const { data: template, error: templateError } = await reportingClient
      .from("report_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (templateError || !template) {
      throw new Error(templateError?.message ?? "Template not found");
    }

    const typedTemplate = template as ReportTemplateRow;

    const dataSources = extractDataSources(typedTemplate);
    const reportData = await collectReportData(
      dataSources,
      vesselId,
      periodStart,
      periodEnd
    );

    let aiSummary = "";
    let aiInsights: string[] = [];
    let executiveSummary = "";
    let conclusions: string[] = [];
    let recommendations: string[] = [];

    if (typedTemplate.ai_summary_enabled !== false) {
      const aiContent = await generateAISummary(typedTemplate.template_type, reportData);
      aiSummary = aiContent.summary;
      aiInsights = aiContent.insights;
      executiveSummary = aiContent.executiveSummary;
      conclusions = aiContent.conclusions;
      recommendations = aiContent.recommendations;
    }

    const payload: GeneratedReportInsert = {
      template_id: templateId,
      report_title: formatReportTitle(typedTemplate.template_name, periodStart, periodEnd),
      report_type: typedTemplate.template_type,
      vessel_id: vesselId,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      report_data: asJson(reportData),
      ai_summary: aiSummary,
      ai_insights: asJson(aiInsights),
      executive_summary: executiveSummary,
      conclusions: asJson(conclusions),
      recommendations: asJson(recommendations),
      status: "completed",
      generation_time_ms: Date.now() - startTime,
      generated_by: userId,
    };

    const { data: report, error: reportError } = await reportingClient
      .from("generated_reports")
      .insert(payload as any)
      .select("*")
      .single();

    if (reportError || !report) {
      throw new Error(reportError?.message ?? "Error creating report");
    }

    const typedReport = report as GeneratedReportRow;

    await logReportGeneration({
      report_id: typedReport.id,
      status: "completed",
      execution_time_ms: Date.now() - startTime,
      data_sources_queried: asJson(dataSources),
    });

    logger.info("Report generated successfully", {
      reportId: typedReport.id,
      templateId,
      vesselId,
    });

    return typedReport.id;
  } catch (error) {
    logger.error("Error generating report", error, {
      templateId,
      vesselId,
    });

    await logReportGeneration({
      status: "failed",
      execution_time_ms: Date.now() - startTime,
      error_message: error instanceof Error ? error.message : "Unknown error",
      error_details: buildErrorDetails(error),
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
): Promise<ReportData> {
  const data: ReportData = {};

  for (const source of dataSources) {
    try {
      switch (source) {
      case "risk_assessments":
        data.risks = await fetchRiskData(vesselId, periodStart, periodEnd);
        break;
      case "drill_executions":
        data.drills = await fetchDrillData(vesselId, periodStart, periodEnd);
        break;
      case "crew_training":
        data.training = await fetchTrainingData(periodStart, periodEnd);
        break;
      case "noncompliance":
        data.noncompliance = await fetchNoncomplianceData(
          vesselId,
          periodStart,
          periodEnd
        );
        break;
      default:
        logger.warn("Unknown data source for reporting engine", { source });
      }
    } catch (error) {
      logger.error(`Error fetching data from ${source}`, error);
      data[source] = {
        error: "Failed to fetch data",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  return data;
}

async function fetchRiskData(
  vesselId: string | null,
  start: Date,
  end: Date
): Promise<unknown[]> {
  let query = reportingClient
    .from("risk_assessments")
    .select("*")
    .gte("assessed_at", start.toISOString())
    .lte("assessed_at", end.toISOString());

  if (vesselId) {
    query = query.eq("vessel_id", vesselId);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return data ?? [];
}

async function fetchDrillData(
  vesselId: string | null,
  start: Date,
  end: Date
): Promise<unknown[]> {
  let query = reportingClient
    .from("drill_executions")
    .select("*, drill_scenarios(*)")
    .gte("execution_date", start.toISOString())
    .lte("execution_date", end.toISOString());

  if (vesselId) {
    query = query.eq("vessel_id", vesselId);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return data ?? [];
}

async function fetchTrainingData(start: Date, end: Date): Promise<unknown[]> {
  const { data, error } = await reportingClient
    .from("crew_training_results")
    .select("*, crew_training_quizzes(*)")
    .gte("completed_at", start.toISOString())
    .lte("completed_at", end.toISOString());

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function fetchNoncomplianceData(
  vesselId: string | null,
  start: Date,
  end: Date
): Promise<unknown[]> {
  let query = reportingClient
    .from("noncompliance_explanations")
    .select("*")
    .gte("generated_at", start.toISOString())
    .lte("generated_at", end.toISOString());

  if (vesselId) {
    query = query.eq("vessel_id", vesselId);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return data ?? [];
}

/**
 * Generates AI summary and insights for the report
 */
async function generateAISummary(
  reportType: ReportType,
  reportData: ReportData
): Promise<AISummaryContent> {
  try {
    const apiKey = (import.meta as any).env.VITE_OPENAI_API_KEY as string | undefined;

    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content:
							"You are a maritime operations analyst. Analyze the supplied data and produce structured, executive-ready insights.",
          },
          {
            role: "user",
            content: buildReportSummaryPrompt(reportType, reportData),
          },
        ],
        temperature: 0.7,
        max_tokens: OPENAI_MAX_TOKENS,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = (await response.json()) as OpenAIChatCompletion;
    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error("OpenAI response did not include content");
    }

    return parseAiContent(rawContent);
  } catch (error) {
    logger.error("Error generating AI summary", error);
    return {
      summary: "AI summary generation failed",
      insights: [],
      executiveSummary: "Error generating executive summary",
      conclusions: [],
      recommendations: [],
    };
  }
}

function parseAiContent(rawContent: string): AISummaryContent {
  try {
    const parsed = JSON.parse(rawContent);
    return {
      summary: parsed.summary ?? "",
      insights: parsed.insights ?? [],
      executiveSummary: parsed.executiveSummary ?? "",
      conclusions: parsed.conclusions ?? [],
      recommendations: parsed.recommendations ?? [],
    };
  } catch (error) {
    logger.error("Failed to parse AI response", error, { rawContent });
    return {
      summary: "AI summary generation failed",
      insights: [],
      executiveSummary: "Error generating executive summary",
      conclusions: [],
      recommendations: [],
    };
  }
}

function buildReportSummaryPrompt(reportType: string, data: Record<string, unknown>): string {
  return `Analyze this maritime operations data and create a comprehensive report summary:\n\nReport Type: ${reportType}\n\nData Summary:\n${JSON.stringify(
    data,
    null,
    2
  )}\n\nProvide:\n1. SUMMARY: Overall summary of the data (2-3 paragraphs)\n2. INSIGHTS: 5-7 key insights from the data\n3. EXECUTIVE_SUMMARY: High-level executive summary (1 paragraph)\n4. CONCLUSIONS: 3-5 main conclusions\n5. RECOMMENDATIONS: 5-8 actionable recommendations\n\nFormat as JSON with the shape {"summary": string, "insights": string[], "executiveSummary": string, "conclusions": string[], "recommendations": string[]}.`;
}

export interface CreateReportScheduleInput {
	templateId: string;
	scheduleName: string;
	scheduleType: ScheduleType;
	nextExecution: Date;
	cronExpression?: string | null;
	vesselId?: string | null;
	recipients?: string[];
	deliveryMethod?: ScheduleDeliveryMethod;
	exportFormats?: ExportFormat[];
	autoArchiveDays?: number;
	active?: boolean;
}

export async function createReportSchedule(
  input: CreateReportScheduleInput,
  userId: string
): Promise<ScheduleWithTemplate> {
  const payload: ReportingTables["report_schedules"]["Insert"] = {
    template_id: input.templateId,
    schedule_name: input.scheduleName,
    schedule_type: input.scheduleType,
    next_execution: input.nextExecution.toISOString(),
    cron_expression: input.cronExpression ?? null,
    vessel_id: input.vesselId ?? null,
    recipients: asJson(input.recipients ?? []),
    delivery_method: input.deliveryMethod ?? "dashboard",
    export_formats: asJson(input.exportFormats ?? ["PDF"]),
    auto_archive_days: input.autoArchiveDays ?? 90,
    active: input.active ?? true,
    created_by: userId,
  };

  const { data, error } = await reportingClient
    .from("report_schedules")
    .insert(payload as any)
    .select("*, report_templates(*)")
    .single();

  if (error || !data) {
    logger.error("Failed to create report schedule", error, { payload });
    throw new Error(error?.message ?? "Failed to create report schedule");
  }

  return data as ScheduleWithTemplate;
}

export async function listReportSchedules(
  includeTemplates = true
): Promise<ScheduleWithTemplate[]> {
  const columns = includeTemplates ? "*, report_templates(*)" : "*";
  const { data, error } = await reportingClient
    .from("report_schedules")
    .select(columns)
    .order("next_execution", { ascending: true });

  if (error) {
    logger.error("Failed to fetch report schedules", error);
    throw new Error(error.message);
  }

  return (data as ScheduleWithTemplate[]) ?? [];
}

export interface RecordReportExportInput {
	reportId: string;
	exportFormat: ExportFormat;
	exportedBy: string;
	filePath?: string | null;
	fileSizeBytes?: number | null;
	fileHash?: string | null;
	exportOptions?: Record<string, unknown>;
	expiresAt?: Date | null;
}

export async function recordReportExport(
  input: RecordReportExportInput
): Promise<void> {
  const payload: ReportExportInsert = {
    report_id: input.reportId,
    export_format: input.exportFormat,
    file_path: input.filePath ?? null,
    file_size_bytes: input.fileSizeBytes ?? null,
    file_hash: input.fileHash ?? null,
    export_options: asJson(input.exportOptions ?? {}),
    exported_by: input.exportedBy,
    exported_at: new Date().toISOString(),
    expires_at: input.expiresAt?.toISOString() ?? null,
  };

  const { error } = await reportingClient.from("report_exports").insert(payload as any);
  if (error) {
    logger.error("Failed to record report export", error, { input });
    throw new Error(error.message);
  }
}

export async function listGeneratedReports(
  limit = 20
): Promise<GeneratedReportRow[]> {
  const { data, error } = await reportingClient
    .from("generated_reports")
    .select("*")
    .order("generated_at", { ascending: false })
    .limit(limit);

  if (error) {
    logger.error("Failed to fetch generated reports", error);
    throw new Error(error.message);
  }

  return data ?? [];
}

async function logReportGeneration(payload: ReportGenerationLogInsert): Promise<void> {
  const { error } = await reportingClient.from("report_generation_log").insert(payload as any);
  if (error) {
    logger.error("Failed to insert report generation log", error, { payload });
  }
}

function extractDataSources(template: ReportTemplateRow): string[] {
  const raw = template.data_sources;
  if (!raw) {
    return [];
  }

  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === "string");
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch (error) {
      logger.warn("Failed to parse data_sources string: " + raw);
    }
  }

  return [];
}

function formatReportTitle(templateName: string, start: Date, end: Date): string {
  const formatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });
  return `${templateName} — ${formatter.format(start)} a ${formatter.format(end)}`;
}

function buildErrorDetails(error: unknown): Json {
  if (error instanceof Error) {
    return asJson({
      message: error.message,
      stack: error.stack,
    });
  }

  return asJson({ error: String(error) });
}

function asJson<T>(value: T): Json {
  return value as unknown as Json;
}
