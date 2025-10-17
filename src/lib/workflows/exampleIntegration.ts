/**
 * Example Integration Functions
 * 
 * Utility functions to work with workflow suggestion templates
 * and convert them to SmartWorkflow format
 */

import { workflowSuggestionTemplates, WorkflowSuggestionTemplate } from "./suggestionTemplates";

/**
 * SmartWorkflow format interface
 */
export interface SmartWorkflow {
  name: string;
  description: string;
  status: "draft" | "active" | "archived";
  trigger: string;
  category: string;
  tags: string[];
  steps: unknown[];
  executions: number;
  successRate: number;
  createdAt: Date;
}

/**
 * Convert a workflow suggestion template to SmartWorkflow format
 */
export function convertTemplateToWorkflowFormat(
  template: WorkflowSuggestionTemplate,
  overrides?: Partial<SmartWorkflow>
): SmartWorkflow {
  // Map criticidade to category
  const categoryMap: Record<string, string> = {
    Alta: "safety",
    Média: "maintenance",
    Baixa: "general",
  };

  const workflow: SmartWorkflow = {
    name: template.etapa,
    description: template.conteudo,
    status: "draft",
    trigger: template.tipo_sugestao,
    category: categoryMap[template.criticidade] || "general",
    tags: [
      template.responsavel_sugerido,
      template.criticidade,
      template.origem,
    ],
    steps: [],
    executions: 0,
    successRate: 0,
    createdAt: new Date(),
    ...overrides,
  };

  return workflow;
}

/**
 * Filter templates by criticidade level
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
 */
export function getHighPriorityTemplates(): WorkflowSuggestionTemplate[] {
  return getTemplatesByCriticidade("Alta");
}

/**
 * Filter templates by responsible person
 */
export function getTemplatesByResponsavel(responsavel: string): WorkflowSuggestionTemplate[] {
  const searchTerm = responsavel.toLowerCase();
  return workflowSuggestionTemplates.filter((t) =>
    t.responsavel_sugerido.toLowerCase().includes(searchTerm)
  );
}

/**
 * Filter templates by suggestion type
 */
export function getTemplatesBySuggestionType(type: string): WorkflowSuggestionTemplate[] {
  const searchTerm = type.toLowerCase();
  return workflowSuggestionTemplates.filter((t) =>
    t.tipo_sugestao.toLowerCase().includes(searchTerm)
  );
}

/**
 * Search templates by keyword in etapa or conteudo
 */
export function searchTemplates(keyword: string): WorkflowSuggestionTemplate[] {
  const searchTerm = keyword.toLowerCase();
  return workflowSuggestionTemplates.filter(
    (t) =>
      t.etapa.toLowerCase().includes(searchTerm) ||
      t.conteudo.toLowerCase().includes(searchTerm)
  );
}

/**
 * Create a workflow from a template by index
 */
export function createWorkflowFromTemplate(
  index: number,
  overrides?: Partial<SmartWorkflow>
): SmartWorkflow | null {
  if (index < 0 || index >= workflowSuggestionTemplates.length) {
    return null;
  }
  return convertTemplateToWorkflowFormat(workflowSuggestionTemplates[index], overrides);
}

/**
 * Get all templates in a formatted structure
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
 * Get summary statistics about templates
 */
export function getTemplateSummary(): {
  total: number;
  alta: number;
  media: number;
  baixa: number;
  } {
  return {
    total: workflowSuggestionTemplates.length,
    alta: workflowSuggestionTemplates.filter((t) => t.criticidade === "Alta").length,
    media: workflowSuggestionTemplates.filter((t) => t.criticidade === "Média").length,
    baixa: workflowSuggestionTemplates.filter((t) => t.criticidade === "Baixa").length,
  };
}
