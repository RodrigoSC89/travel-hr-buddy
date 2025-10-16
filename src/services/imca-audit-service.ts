// IMCA Audit Service
// Service layer for IMCA DP Technical Audit operations

import { supabase } from "@/integrations/supabase/client";
import type {
  AuditRecord,
  AuditResult,
  GenerateAuditRequest,
  AuditStatus
} from "@/types/imca-audit";

/**
 * Generate a new IMCA audit using AI
 */
export async function generateAudit(request: GenerateAuditRequest): Promise<AuditResult> {
  try {
    const response = await fetch("/functions/v1/imca-audit-generator", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate audit");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error generating audit:", error);
    throw error;
  }
}

/**
 * Save an audit to the database
 */
export async function saveAudit(audit: AuditResult): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const record: Partial<AuditRecord> = {
      user_id: user.id,
      title: `Auditoria IMCA - ${audit.vesselName}`,
      description: audit.auditObjective,
      status: "completed" as AuditStatus,
      audit_date: audit.auditDate,
      score: audit.overallScore,
      findings: audit,
      recommendations: audit.recommendations,
      metadata: {
        vesselName: audit.vesselName,
        dpClass: audit.dpClass,
        location: audit.location,
        generatedAt: audit.generatedAt,
      },
    };

    const { data, error } = await supabase
      .from("auditorias_imca")
      .insert(record)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data.id;
  } catch (error) {
    console.error("Error saving audit:", error);
    throw error;
  }
}

/**
 * Get all audits for the current user
 */
export async function getUserAudits(): Promise<AuditRecord[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching audits:", error);
    throw error;
  }
}

/**
 * Get a specific audit by ID
 */
export async function getAuditById(id: string): Promise<AuditRecord | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching audit:", error);
    throw error;
  }
}

/**
 * Update an existing audit
 */
export async function updateAudit(
  id: string,
  updates: Partial<AuditRecord>
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("auditorias_imca")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error updating audit:", error);
    throw error;
  }
}

/**
 * Delete an audit
 */
export async function deleteAudit(id: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("auditorias_imca")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting audit:", error);
    throw error;
  }
}

/**
 * Export audit to Markdown format
 */
export function exportAuditToMarkdown(audit: AuditResult): void {
  const markdown = formatAuditForMarkdown(audit);
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `auditoria-imca-${audit.vesselName.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format audit as Markdown
 */
function formatAuditForMarkdown(audit: AuditResult): string {
  const lines: string[] = [];
  
  lines.push(`# Auditoria IMCA - ${audit.vesselName}`);
  lines.push("");
  lines.push(`## Dados Gerais`);
  lines.push("");
  lines.push(`- **Embarcação**: ${audit.vesselName}`);
  lines.push(`- **Classe DP**: ${audit.dpClass}`);
  lines.push(`- **Local**: ${audit.location}`);
  lines.push(`- **Data**: ${audit.auditDate}`);
  lines.push(`- **Objetivo**: ${audit.auditObjective}`);
  lines.push(`- **Pontuação Geral**: ${audit.overallScore}/100`);
  lines.push("");
  
  lines.push(`## Normas Avaliadas`);
  lines.push("");
  audit.standards.forEach(std => {
    lines.push(`- **${std.code}**: ${std.title}`);
  });
  lines.push("");
  
  lines.push(`## Módulos Avaliados`);
  lines.push("");
  audit.modules.forEach(mod => {
    lines.push(`### ${mod.name}`);
    lines.push("");
    if (mod.score !== undefined) {
      lines.push(`**Pontuação**: ${mod.score}/100`);
      lines.push("");
    }
    if (mod.conformities && mod.conformities.length > 0) {
      lines.push(`**Conformidades**:`);
      lines.push("");
      mod.conformities.forEach(c => lines.push(`- ${c}`));
      lines.push("");
    }
    if (mod.nonConformities && mod.nonConformities.length > 0) {
      lines.push(`**Não Conformidades**:`);
      lines.push("");
      mod.nonConformities.forEach(nc => lines.push(`- ${nc}`));
      lines.push("");
    }
  });
  
  lines.push(`## Não Conformidades`);
  lines.push("");
  audit.nonConformities.forEach((nc, index) => {
    lines.push(`### ${index + 1}. ${nc.description}`);
    lines.push("");
    lines.push(`- **Módulo**: ${nc.module}`);
    lines.push(`- **Norma**: ${nc.standard}`);
    lines.push(`- **Nível de Risco**: ${nc.riskLevel} ${{ Alto: "🔴", Médio: "🟡", Baixo: "⚪" }[nc.riskLevel]}`);
    lines.push(`- **Recomendação**: ${nc.recommendation}`);
    lines.push("");
  });
  
  lines.push(`## Plano de Ação`);
  lines.push("");
  audit.actionPlan.forEach((action, index) => {
    lines.push(`### ${index + 1}. ${action.description}`);
    lines.push("");
    lines.push(`- **Prioridade**: ${action.priority}`);
    lines.push(`- **Prazo**: ${action.deadline}`);
    if (action.responsible) {
      lines.push(`- **Responsável**: ${action.responsible}`);
    }
    lines.push("");
  });
  
  lines.push(`## Resumo`);
  lines.push("");
  lines.push(audit.summary);
  lines.push("");
  
  lines.push(`## Recomendações`);
  lines.push("");
  audit.recommendations.forEach(rec => {
    lines.push(`- ${rec}`);
  });
  lines.push("");
  
  lines.push(`---`);
  lines.push(`*Gerado em: ${audit.generatedAt}*`);
  
  return lines.join("\n");
}
