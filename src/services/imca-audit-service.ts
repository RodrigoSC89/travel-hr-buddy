// ===========================
// IMCA Audit Service Layer
// Service functions for IMCA DP Technical Audit System
// ===========================

import { supabase } from "@/integrations/supabase/client";
import type {
  IMCAAuditGeneratorRequest,
  IMCAAuditGeneratorResponse,
  AuditReport,
  SavedAudit,
  AuditBasicData,
  AuditOperationalData
} from "@/types/imca-audit";

/**
 * Generate IMCA audit using AI-powered edge function
 */
export async function generateIMCAAudit(
  request: IMCAAuditGeneratorRequest
): Promise<IMCAAuditGeneratorResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('imca-audit-generator', {
      body: request
    });

    if (error) {
      console.error("Error generating audit:", error);
      return {
        success: false,
        error: error.message || "Failed to generate audit"
      };
    }

    return {
      success: true,
      audit: data.audit
    };
  } catch (error) {
    console.error("Exception generating audit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

/**
 * Save audit to database
 */
export async function saveAudit(audit: AuditReport): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: "User not authenticated"
      };
    }

    const { data, error } = await supabase
      .from('auditorias_imca')
      .insert({
        user_id: user.id,
        title: `Auditoria ${audit.basicData.vesselName} - ${new Date().toLocaleDateString('pt-BR')}`,
        description: audit.basicData.auditObjective,
        status: 'completed',
        audit_date: new Date().toISOString().split('T')[0],
        score: audit.score,
        findings: audit,
        recommendations: audit.correctiveActions.map(action => action.description),
        metadata: {
          dpClass: audit.basicData.dpClass,
          location: audit.basicData.location,
          vessel: audit.basicData.vesselName
        }
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving audit:", error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      id: data.id
    };
  } catch (error) {
    console.error("Exception saving audit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

/**
 * Load saved audits for current user
 */
export async function loadUserAudits(): Promise<{ success: boolean; audits?: SavedAudit[]; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: "User not authenticated"
      };
    }

    const { data, error } = await supabase
      .from('auditorias_imca')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error loading audits:", error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      audits: data
    };
  } catch (error) {
    console.error("Exception loading audits:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

/**
 * Load single audit by ID
 */
export async function loadAuditById(id: string): Promise<{ success: boolean; audit?: SavedAudit; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('auditorias_imca')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error loading audit:", error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      audit: data
    };
  } catch (error) {
    console.error("Exception loading audit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

/**
 * Delete audit by ID
 */
export async function deleteAudit(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('auditorias_imca')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting audit:", error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error("Exception deleting audit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

/**
 * Export audit to Markdown format
 */
export function exportToMarkdown(audit: AuditReport): string {
  const { basicData, operationalData, context, nonConformities, correctiveActions } = audit;

  let markdown = `# Relatório de Auditoria Técnica DP - IMCA\n\n`;
  
  // Basic Data
  markdown += `## Dados Básicos\n\n`;
  markdown += `- **Embarcação:** ${basicData.vesselName}\n`;
  markdown += `- **Classe DP:** ${basicData.dpClass}\n`;
  markdown += `- **Local:** ${basicData.location}\n`;
  markdown += `- **Objetivo:** ${basicData.auditObjective}\n`;
  markdown += `- **Data de Geração:** ${new Date(audit.generatedAt).toLocaleString('pt-BR')}\n\n`;

  // Operational Data (if provided)
  if (operationalData) {
    markdown += `## Dados Operacionais\n\n`;
    if (operationalData.incidentDescription) {
      markdown += `- **Incidente:** ${operationalData.incidentDescription}\n`;
    }
    if (operationalData.environmentalConditions) {
      markdown += `- **Condições Ambientais:** ${operationalData.environmentalConditions}\n`;
    }
    if (operationalData.systemStatus) {
      markdown += `- **Status do Sistema:** ${operationalData.systemStatus}\n`;
    }
    if (operationalData.tamActivation !== undefined) {
      markdown += `- **Ativação TAM:** ${operationalData.tamActivation ? 'Sim' : 'Não'}\n`;
    }
    markdown += `\n`;
  }

  // Context
  markdown += `## Contexto da Auditoria\n\n`;
  markdown += `${context.summary}\n\n`;
  markdown += `### Normas Aplicáveis\n\n`;
  context.applicableStandards.forEach(standard => {
    markdown += `- ${standard}\n`;
  });
  markdown += `\n`;

  // Non-conformities
  markdown += `## Não Conformidades Identificadas\n\n`;
  nonConformities.forEach((nc, index) => {
    const riskEmoji = nc.riskLevel === "Alto" ? "🔴" : nc.riskLevel === "Médio" ? "🟡" : "⚪";
    markdown += `### ${index + 1}. ${nc.module} ${riskEmoji}\n\n`;
    markdown += `- **Norma:** ${nc.standard}\n`;
    markdown += `- **Risco:** ${nc.riskLevel}\n`;
    markdown += `- **Descrição:** ${nc.description}\n`;
    if (nc.evidence) {
      markdown += `- **Evidência:** ${nc.evidence}\n`;
    }
    markdown += `\n`;
  });

  // Corrective Actions
  markdown += `## Plano de Ações Corretivas\n\n`;
  correctiveActions.forEach((action, index) => {
    markdown += `### ${index + 1}. ${action.description}\n\n`;
    markdown += `- **Prioridade:** ${action.priority}\n`;
    markdown += `- **Prazo:** ${action.deadline}\n`;
    if (action.responsible) {
      markdown += `- **Responsável:** ${action.responsible}\n`;
    }
    markdown += `\n`;
  });

  markdown += `---\n\n`;
  markdown += `*Relatório gerado automaticamente pelo Sistema de Auditoria Técnica IMCA*\n`;

  return markdown;
}

/**
 * Download markdown content as file
 */
export function downloadMarkdown(markdown: string, filename: string) {
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
