/**
 * IMCA Audit Service
 * Service layer for managing IMCA DP Technical Audits
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  IMCAAudit,
  IMCAAuditResult,
  GenerateAuditRequest,
  GenerateAuditResponse,
  SaveAuditRequest,
  SaveAuditResponse,
} from '@/types/imca-audit';

// ===========================
// Generate Audit with AI
// ===========================

export async function generateAudit(
  request: GenerateAuditRequest
): Promise<GenerateAuditResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('imca-audit-generator', {
      body: request,
    });

    if (error) {
      console.error('Error generating IMCA audit:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate audit',
        message: 'Erro ao gerar auditoria IMCA. Tente novamente.',
      };
    }

    if (!data || !data.audit) {
      return {
        success: false,
        error: 'Invalid response from server',
        message: 'Resposta inválida do servidor.',
      };
    }

    return {
      success: true,
      audit: data.audit as IMCAAuditResult,
      message: 'Auditoria gerada com sucesso!',
    };
  } catch (err) {
    console.error('Unexpected error generating audit:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      message: 'Erro inesperado ao gerar auditoria.',
    };
  }
}

// ===========================
// Save Audit to Database
// ===========================

export async function saveAudit(request: SaveAuditRequest): Promise<SaveAuditResponse> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return {
        success: false,
        error: 'User not authenticated',
        message: 'Usuário não autenticado.',
      };
    }

    const auditData = {
      ...request.audit_data,
      user_id: userData.user.id,
    };

    const { data, error } = await supabase
      .from('auditorias_imca')
      .insert([auditData])
      .select()
      .single();

    if (error) {
      console.error('Error saving IMCA audit:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erro ao salvar auditoria.',
      };
    }

    return {
      success: true,
      audit_id: data.id,
      message: 'Auditoria salva com sucesso!',
    };
  } catch (err) {
    console.error('Unexpected error saving audit:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      message: 'Erro inesperado ao salvar auditoria.',
    };
  }
}

// ===========================
// Fetch User Audits
// ===========================

export async function fetchUserAudits(): Promise<{
  success: boolean;
  audits?: IMCAAudit[];
  error?: string;
}> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    const { data, error } = await supabase
      .from('auditorias_imca')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching audits:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      audits: data as IMCAAudit[],
    };
  } catch (err) {
    console.error('Unexpected error fetching audits:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// ===========================
// Fetch Single Audit
// ===========================

export async function fetchAuditById(auditId: string): Promise<{
  success: boolean;
  audit?: IMCAAudit;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('auditorias_imca')
      .select('*')
      .eq('id', auditId)
      .single();

    if (error) {
      console.error('Error fetching audit:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      audit: data as IMCAAudit,
    };
  } catch (err) {
    console.error('Unexpected error fetching audit:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// ===========================
// Update Audit
// ===========================

export async function updateAudit(
  auditId: string,
  updates: Partial<IMCAAudit>
): Promise<SaveAuditResponse> {
  try {
    const { data, error } = await supabase
      .from('auditorias_imca')
      .update(updates)
      .eq('id', auditId)
      .select()
      .single();

    if (error) {
      console.error('Error updating audit:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erro ao atualizar auditoria.',
      };
    }

    return {
      success: true,
      audit_id: data.id,
      message: 'Auditoria atualizada com sucesso!',
    };
  } catch (err) {
    console.error('Unexpected error updating audit:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      message: 'Erro inesperado ao atualizar auditoria.',
    };
  }
}

// ===========================
// Delete Audit
// ===========================

export async function deleteAudit(auditId: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const { error } = await supabase.from('auditorias_imca').delete().eq('id', auditId);

    if (error) {
      console.error('Error deleting audit:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erro ao deletar auditoria.',
      };
    }

    return {
      success: true,
      message: 'Auditoria deletada com sucesso!',
    };
  } catch (err) {
    console.error('Unexpected error deleting audit:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      message: 'Erro inesperado ao deletar auditoria.',
    };
  }
}

// ===========================
// Export to Markdown
// ===========================

export function exportAuditToMarkdown(
  audit: IMCAAuditResult,
  context: {
    vessel_name: string;
    dp_class: string;
    location: string;
    audit_date: string;
  }
): string {
  const markdown = `# Auditoria Técnica IMCA - Sistema DP

## Contexto da Auditoria

**Embarcação:** ${context.vessel_name}
**Classe DP:** ${context.dp_class}
**Local:** ${context.location}
**Data:** ${context.audit_date}

---

## Resumo Executivo

${audit.summary}

**Pontuação Geral:** ${audit.overall_score}/100

---

## Conformidade com Normas

${audit.standards_compliance.standards
  .map(
    (std) => `
### ${std.code} - ${std.name}

**Status:** ${std.compliance_level === 'compliant' ? '✅ Conforme' : std.compliance_level === 'partial' ? '⚠️ Parcialmente Conforme' : '❌ Não Conforme'}

${std.findings}
`
  )
  .join('\n')}

---

## Avaliação de Módulos

${audit.modules_evaluation
  .map(
    (module) => `
### ${module.module_name}

**Pontuação:** ${module.score}/100
**Status:** ${module.status === 'adequate' ? '✅ Adequado' : module.status === 'attention' ? '⚠️ Atenção' : '❌ Crítico'}

**Achados:**
${module.findings}

**Recomendações:**
${module.recommendations.map((rec) => `- ${rec}`).join('\n')}
`
  )
  .join('\n')}

---

## Não Conformidades

${audit.non_conformities
  .map(
    (nc) => `
### ${nc.risk_level === 'alto' ? '🔴' : nc.risk_level === 'medio' ? '🟡' : '⚪'} ${nc.title}

**Nível de Risco:** ${nc.risk_level.toUpperCase()}
**Módulo Afetado:** ${nc.affected_module}
**Normas Relacionadas:** ${nc.related_standards.join(', ')}

**Descrição:**
${nc.description}
`
  )
  .join('\n')}

---

## Plano de Ação

${audit.action_plan
  .map(
    (action) => `
### ${action.priority === 'critico' ? '🔥' : action.priority === 'alto' ? '⚡' : action.priority === 'medio' ? '📋' : '📝'} ${action.title}

**Prioridade:** ${action.priority.toUpperCase()}
**Prazo:** ${action.deadline_days} dias
**Responsável:** ${action.responsible || 'A definir'}

**Descrição:**
${action.description}

**Não Conformidades Relacionadas:** ${action.related_non_conformities.join(', ')}
`
  )
  .join('\n')}

---

*Documento gerado automaticamente pelo Sistema de Auditoria IMCA DP*
`;

  return markdown;
}
