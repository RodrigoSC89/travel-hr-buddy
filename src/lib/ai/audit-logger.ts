/**
 * AI Audit Logger
 * PATCH 850 - Logging avançado para auditoria regulamentar
 */

import { supabase } from "@/integrations/supabase/client";

export interface AIAuditEntry {
  id?: string;
  organization_id?: string;
  user_id?: string;
  user_name?: string;
  user_role?: string;
  user_permission_level?: string;
  session_id?: string;
  interaction_type?: string;
  module_name?: string;
  user_input: string;
  ai_response?: string;
  model_provider?: string;
  model_version?: string;
  model_parameters?: Record<string, unknown>;
  rag_enabled?: boolean;
  rag_sources?: Array<{ document: string; relevance: number }>;
  rag_source_documents?: string[];
  confidence_score?: number;
  trust_score?: number;
  quality_score?: number;
  requires_approval?: boolean;
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  approval_decision?: "approved" | "rejected" | "modified";
  approval_comments?: string;
  response_time_ms?: number;
  tokens_input?: number;
  tokens_output?: number;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

export interface AuditSearchFilters {
  organization_id?: string;
  user_id?: string;
  module_name?: string;
  interaction_type?: string;
  requires_approval?: boolean;
  approval_decision?: string;
  date_from?: string;
  date_to?: string;
  min_confidence?: number;
  max_confidence?: number;
}

/**
 * Hash function for privacy
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").substring(0, 32);
}

/**
 * Log an AI interaction
 */
export async function logAIInteraction(entry: AIAuditEntry): Promise<string | null> {
  try {
    // Generate hashes for audit trail
    const inputHash = await hashString(entry.user_input);
    const responseHash = entry.ai_response 
      ? await hashString(entry.ai_response)
      : null;

    // Insert using type assertion for new columns not yet in generated types
    const insertData = {
      organization_id: entry.organization_id,
      user_id: entry.user_id,
      user_input: entry.user_input,
      ai_response: entry.ai_response,
      model_provider: entry.model_provider,
      model_version: entry.model_version,
      confidence_score: entry.confidence_score,
      requires_approval: entry.requires_approval,
      response_time_ms: entry.response_time_ms,
      tokens_input: entry.tokens_input,
      tokens_output: entry.tokens_output,
    } as Record<string, unknown>;

    const { data, error } = await supabase
      .from("ai_audit_logs")
      .insert(insertData as any)
      .select("id")
      .single();

    if (error) {
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error("Error logging AI interaction:", error);
    console.error("Error logging AI interaction:", error);
    return null;
  }
}

/**
 * Update audit entry with approval
 */
export async function updateAuditApproval(
  auditId: string,
  approvedBy: string,
  approvedByName: string,
  decision: "approved" | "rejected" | "modified",
  comments?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("ai_audit_logs")
      .update({
        approved_by: approvedBy,
        approved_by_name: approvedByName,
        approved_at: new Date().toISOString(),
        approval_decision: decision,
        approval_comments: comments,
      })
      .eq("id", auditId);

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating audit approval:", error);
    console.error("Error updating audit approval:", error);
    return false;
  }
}

/**
 * Search audit logs
 */
export async function searchAuditLogs(
  filters: AuditSearchFilters,
  limit = 100,
  offset = 0
): Promise<AIAuditEntry[]> {
  try {
    let query = supabase
      .from("ai_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters.organization_id) {
      query = query.eq("organization_id", filters.organization_id);
    }
    if (filters.user_id) {
      query = query.eq("user_id", filters.user_id);
    }
    if (filters.module_name) {
      query = query.eq("module_name", filters.module_name);
    }
    if (filters.interaction_type) {
      query = query.eq("interaction_type", filters.interaction_type);
    }
    if (filters.requires_approval !== undefined) {
      query = query.eq("requires_approval", filters.requires_approval);
    }
    if (filters.approval_decision) {
      query = query.eq("approval_decision", filters.approval_decision);
    }
    if (filters.date_from) {
      query = query.gte("created_at", filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte("created_at", filters.date_to);
    }
    if (filters.min_confidence !== undefined) {
      query = query.gte("confidence_score", filters.min_confidence);
    }
    if (filters.max_confidence !== undefined) {
      query = query.lte("confidence_score", filters.max_confidence);
    }

    const { data, error } = await query;

    if (error) {
      return [];
    }

    return data as unknown as AIAuditEntry[];
  } catch (error) {
    console.error("Error searching audit logs:", error);
    console.error("Error searching audit logs:", error);
    return [];
  }
}

/**
 * Get audit statistics
 */
export async function getAuditStatistics(
  organizationId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<{
  totalInteractions: number;
  avgConfidence: number;
  avgResponseTime: number;
  approvalRate: number;
  ragUsageRate: number;
  byModule: Record<string, number>;
  byModel: Record<string, number>;
}> {
  try {
    let query = supabase
      .from("ai_audit_logs")
      .select("*")
      .eq("organization_id", organizationId);

    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }
    if (dateTo) {
      query = query.lte("created_at", dateTo);
    }

    const { data, error } = await query;

    if (error || !data) {
      return {
        totalInteractions: 0,
        avgConfidence: 0,
        avgResponseTime: 0,
        approvalRate: 0,
        ragUsageRate: 0,
        byModule: {},
        byModel: {},
      };
    }

    const entries = data as unknown as AIAuditEntry[];
    
    // Calculate statistics
    const totalInteractions = entries.length;
    
    const confidenceScores = entries
      .map(e => e.confidence_score)
      .filter((s): s is number => s !== null && s !== undefined);
    const avgConfidence = confidenceScores.length > 0
      ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
      : 0;

    const responseTimes = entries
      .map(e => e.response_time_ms)
      .filter((t): t is number => t !== null && t !== undefined);
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    const requiresApproval = entries.filter(e => e.requires_approval);
    const approved = requiresApproval.filter(e => e.approval_decision === "approved");
    const approvalRate = requiresApproval.length > 0
      ? (approved.length / requiresApproval.length) * 100
      : 100;

    const ragEnabled = entries.filter(e => e.rag_enabled);
    const ragUsageRate = totalInteractions > 0
      ? (ragEnabled.length / totalInteractions) * 100
      : 0;

    // By module
    const byModule: Record<string, number> = {};
    for (const entry of entries) {
      const module = entry.module_name || "unknown";
      byModule[module] = (byModule[module] || 0) + 1;
    }

    // By model
    const byModel: Record<string, number> = {};
    for (const entry of entries) {
      const model = entry.model_version || "unknown";
      byModel[model] = (byModel[model] || 0) + 1;
    }

    return {
      totalInteractions,
      avgConfidence,
      avgResponseTime,
      approvalRate,
      ragUsageRate,
      byModule,
      byModel,
    };
  } catch (error) {
    console.error("Error getting audit statistics:", error);
    console.error("Error getting audit statistics:", error);
    return {
      totalInteractions: 0,
      avgConfidence: 0,
      avgResponseTime: 0,
      approvalRate: 0,
      ragUsageRate: 0,
      byModule: {},
      byModel: {},
    };
  }
}

/**
 * Export audit logs to CSV for regulatory inspection
 */
export function exportAuditLogsCSV(entries: AIAuditEntry[]): string {
  const headers = [
    "Timestamp",
    "User",
    "Role",
    "Module",
    "Input (hash)",
    "Response (hash)",
    "Model",
    "Confidence",
    "RAG Enabled",
    "RAG Sources",
    "Requires Approval",
    "Approved By",
    "Approval Decision",
    "Response Time (ms)",
    "Tokens Used",
  ];

  const rows = entries.map(e => [
    e.created_at || "",
    e.user_name || "",
    e.user_role || "",
    e.module_name || "",
    "[HASH]", // Don't export actual input for privacy
    "[HASH]", // Don't export actual response for privacy
    e.model_version || "",
    e.confidence_score?.toFixed(2) || "",
    e.rag_enabled ? "Yes" : "No",
    e.rag_source_documents?.join("; ") || "",
    e.requires_approval ? "Yes" : "No",
    e.approved_by_name || "",
    e.approval_decision || "",
    e.response_time_ms?.toString() || "",
    ((e.tokens_input || 0) + (e.tokens_output || 0)).toString(),
  ]);

  return [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
}

/**
 * Create audit logger instance for a module
 */
export function createAuditLogger(moduleName: string, organizationId?: string) {
  return {
    log: async (entry: Omit<AIAuditEntry, "module_name" | "organization_id">) => {
      return logAIInteraction({
        ...entry,
        module_name: moduleName,
        organization_id: organizationId,
      });
    },
    updateApproval: updateAuditApproval,
    search: (filters: Omit<AuditSearchFilters, "module_name" | "organization_id">) => {
      return searchAuditLogs({
        ...filters,
        module_name: moduleName,
        organization_id: organizationId,
      });
    },
    getStats: () => {
      if (!organizationId) {
        return Promise.resolve({
          totalInteractions: 0,
          avgConfidence: 0,
          avgResponseTime: 0,
          approvalRate: 0,
          ragUsageRate: 0,
          byModule: {},
          byModel: {},
        });
      }
      return getAuditStatistics(organizationId);
    },
  };
}
