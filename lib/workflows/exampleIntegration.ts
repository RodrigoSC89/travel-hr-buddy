/**
 * Example Integration Functions for Workflow Suggestion Templates
 * 
 * Helper functions to integrate workflow suggestion templates
 * with existing workflow systems.
 */

import { workflowSuggestionTemplates, WorkflowSuggestionTemplate } from "./suggestionTemplates";

/**
 * SmartWorkflow format interface for conversion
 */
export interface SmartWorkflow {
  id?: string;
  name: string;
  description: string;
  status?: "active" | "inactive" | "draft";
  trigger?: string;
  category?: string;
  tags?: string[];
  steps?: unknown[];
  executions?: number;
  successRate?: number;
  createdAt?: Date;
  lastRun?: Date;
}

/**
 * Template summary statistics
 */
export interface TemplateSummary {
  total: number;
  alta: number;
  media: number;
  baixa: number;
}

/**
 * Filter templates by criticality level
 * @param criticidade - Optional criticality level to filter by
 * @returns Filtered array of templates
 */
export function getTemplatesByCriticidade(
  criticidade?: "Alta" | "Média" | "Baixa"
): WorkflowSuggestionTemplate[] {
  if (!criticidade) {
    return workflowSuggestionTemplates;
  }
  return workflowSuggestionTemplates.filter((t) => t.criticidade === criticidade);
}

/**
 * Get only high priority (Alta criticidade) templates
 * @returns Array of high priority templates
 */
export function getHighPriorityTemplates(): WorkflowSuggestionTemplate[] {
  return getTemplatesByCriticidade("Alta");
}

/**
 * Filter templates by responsible party
 * @param responsavel - Name of the responsible party
 * @returns Filtered array of templates
 */
export function getTemplatesByResponsavel(responsavel: string): WorkflowSuggestionTemplate[] {
  return workflowSuggestionTemplates.filter(
    (t) => t.responsavel_sugerido.toLowerCase().includes(responsavel.toLowerCase())
  );
}

/**
 * Filter templates by suggestion type
 * @param tipo - Type of suggestion
 * @returns Filtered array of templates
 */
export function getTemplatesBySuggestionType(tipo: string): WorkflowSuggestionTemplate[] {
  return workflowSuggestionTemplates.filter(
    (t) => t.tipo_sugestao.toLowerCase().includes(tipo.toLowerCase())
  );
}

/**
 * Search templates by keyword in etapa or conteudo
 * @param keyword - Search keyword
 * @returns Filtered array of templates matching the keyword
 */
export function searchTemplates(keyword: string): WorkflowSuggestionTemplate[] {
  const lowerKeyword = keyword.toLowerCase();
  return workflowSuggestionTemplates.filter(
    (t) =>
      t.etapa.toLowerCase().includes(lowerKeyword) ||
      t.conteudo.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * Convert a template to SmartWorkflow format
 * @param template - The template to convert
 * @param overrides - Optional property overrides
 * @returns SmartWorkflow object
 */
export function convertTemplateToWorkflowFormat(
  template: WorkflowSuggestionTemplate,
  overrides?: Partial<SmartWorkflow>
): SmartWorkflow {
  return {
    name: template.etapa,
    description: template.conteudo,
    status: "draft",
    trigger: template.tipo_sugestao,
    category: template.criticidade === "Alta" ? "safety" : "maintenance",
    tags: [template.responsavel_sugerido, template.criticidade, template.origem],
    steps: [],
    executions: 0,
    successRate: 0,
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a workflow from a template by index
 * @param templateId - Index of the template (0-based)
 * @param customProperties - Custom properties to add to the workflow
 * @returns SmartWorkflow object or null if template not found
 */
export function createWorkflowFromTemplate(
  templateId: number,
  customProperties?: Partial<SmartWorkflow>
): SmartWorkflow | null {
  const template = workflowSuggestionTemplates[templateId];
  if (!template) {
    return null;
  }
  return convertTemplateToWorkflowFormat(template, customProperties);
}

/**
 * Get all templates formatted for UI display
 * @returns Array of formatted template objects
 */
export function getAllTemplatesFormatted(): Array<{
  id: number;
  title: string;
  description: string;
  priority: string;
  responsible: string;
  type: string;
  source: string;
}> {
  return workflowSuggestionTemplates.map((template, index) => ({
    id: index,
    title: template.etapa,
    description: template.conteudo,
    priority: template.criticidade,
    responsible: template.responsavel_sugerido,
    type: template.tipo_sugestao,
    source: template.origem,
  }));
}

/**
 * Get template summary statistics
 * @returns Summary object with counts by criticality
 */
export function getTemplateSummary(): TemplateSummary {
  const summary: TemplateSummary = {
    total: workflowSuggestionTemplates.length,
    alta: 0,
    media: 0,
    baixa: 0,
  };

  workflowSuggestionTemplates.forEach((template) => {
    switch (template.criticidade) {
    case "Alta":
      summary.alta++;
      break;
    case "Média":
      summary.media++;
      break;
    case "Baixa":
      summary.baixa++;
      break;
    }
  });

  return summary;
}
