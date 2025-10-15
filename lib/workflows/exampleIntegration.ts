/**
 * Example Integration: Using Workflow Suggestion Templates
 * 
 * This file demonstrates how to integrate the workflow suggestion templates
 * with existing workflow components.
 */

import { workflowSuggestionTemplates, WorkflowSuggestionTemplate } from './suggestionTemplates';

/**
 * Example 1: Convert templates to workflow format
 * 
 * This function shows how to adapt suggestion templates
 * to be used with the existing SmartWorkflow component
 */
export function convertTemplateToWorkflowFormat(template: WorkflowSuggestionTemplate) {
  return {
    id: `template-${template.etapa.toLowerCase().replace(/\s+/g, '-')}`,
    name: template.etapa,
    description: template.conteudo,
    category: getCategoryFromResponsavel(template.responsavel_sugerido),
    triggers: [template.tipo_sugestao],
    actions: [template.conteudo],
    estimatedTimeSaved: estimateTimeFromCriticidade(template.criticidade),
    complexity: mapCriticidadeToComplexity(template.criticidade),
    popularity: 0, // New templates start with 0 popularity
  };
}

/**
 * Example 2: Filter templates by criticidade
 */
export function getHighPriorityTemplates(): WorkflowSuggestionTemplate[] {
  return workflowSuggestionTemplates.filter(
    template => template.criticidade === "Alta"
  );
}

/**
 * Example 3: Get templates by responsible party
 */
export function getTemplatesByResponsavel(responsavel: string): WorkflowSuggestionTemplate[] {
  return workflowSuggestionTemplates.filter(
    template => template.responsavel_sugerido === responsavel
  );
}

/**
 * Example 4: Get templates by suggestion type
 */
export function getTemplatesBySuggestionType(tipo: string): WorkflowSuggestionTemplate[] {
  return workflowSuggestionTemplates.filter(
    template => template.tipo_sugestao === tipo
  );
}

/**
 * Example 5: Create new workflow from template
 */
export function createWorkflowFromTemplate(
  template: WorkflowSuggestionTemplate,
  additionalData?: Partial<WorkflowSuggestionTemplate>
): WorkflowSuggestionTemplate {
  return {
    ...template,
    ...additionalData,
    origem: "Template Derivado",
  };
}

// Helper functions
function getCategoryFromResponsavel(responsavel: string): string {
  const categoryMap: Record<string, string> = {
    "Oficial de Náutica": "Operacional",
    "Engenharia Onshore": "Engenharia",
    "Supervisor de DP": "DP",
  };
  return categoryMap[responsavel] || "Geral";
}

function estimateTimeFromCriticidade(criticidade: string): string {
  const timeMap: Record<string, string> = {
    "Alta": "8h/semana",
    "Média": "4h/semana",
    "Baixa": "2h/semana",
  };
  return timeMap[criticidade] || "4h/semana";
}

function mapCriticidadeToComplexity(criticidade: string): "simple" | "medium" | "complex" {
  const complexityMap: Record<string, "simple" | "medium" | "complex"> = {
    "Alta": "complex",
    "Média": "medium",
    "Baixa": "simple",
  };
  return complexityMap[criticidade] || "medium";
}

/**
 * Example 6: Get all templates as a formatted list
 */
export function getAllTemplatesFormatted(): string[] {
  return workflowSuggestionTemplates.map(template => 
    `[${template.criticidade}] ${template.etapa} - ${template.responsavel_sugerido}`
  );
}

/**
 * Example 7: Create a summary of templates by criticidade
 */
export function getTemplateSummary() {
  const summary = {
    total: workflowSuggestionTemplates.length,
    alta: 0,
    media: 0,
    baixa: 0,
  };

  workflowSuggestionTemplates.forEach(template => {
    if (template.criticidade === "Alta") summary.alta++;
    else if (template.criticidade === "Média") summary.media++;
    else if (template.criticidade === "Baixa") summary.baixa++;
  });

  return summary;
}
