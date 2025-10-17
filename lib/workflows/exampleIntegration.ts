/**
 * Example Integration Functions for Workflow Templates
 * 
 * Provides utility functions to filter, search, and convert workflow suggestion
 * templates into different formats for use in the application.
 */

import { 
  workflowSuggestionTemplates, 
  WorkflowSuggestionTemplate 
} from "./suggestionTemplates";

/**
 * SmartWorkflow interface matching the application's workflow structure
 */
export interface SmartWorkflow {
  name: string;
  description: string;
  status: "draft" | "active" | "completed";
  trigger: string;
  category: string;
  tags: string[];
  steps: unknown[];
  executions: number;
  successRate: number;
  createdAt: Date;
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
  return workflowSuggestionTemplates.filter(
    (template) => template.criticidade === criticidade
  );
}

/**
 * Get only high priority (Alta criticidade) templates
 */
export function getHighPriorityTemplates(): WorkflowSuggestionTemplate[] {
  return getTemplatesByCriticidade("Alta");
}

/**
 * Filter templates by responsavel (case-insensitive partial match)
 */
export function getTemplatesByResponsavel(
  responsavel: string
): WorkflowSuggestionTemplate[] {
  const searchTerm = responsavel.toLowerCase();
  return workflowSuggestionTemplates.filter((template) =>
    template.responsavel_sugerido.toLowerCase().includes(searchTerm)
  );
}

/**
 * Filter templates by suggestion type (case-insensitive partial match)
 */
export function getTemplatesBySuggestionType(
  tipo: string
): WorkflowSuggestionTemplate[] {
  const searchTerm = tipo.toLowerCase();
  return workflowSuggestionTemplates.filter((template) =>
    template.tipo_sugestao.toLowerCase().includes(searchTerm)
  );
}

/**
 * Search templates by keyword in etapa or conteudo (case-insensitive)
 */
export function searchTemplates(keyword: string): WorkflowSuggestionTemplate[] {
  const searchTerm = keyword.toLowerCase();
  return workflowSuggestionTemplates.filter(
    (template) =>
      template.etapa.toLowerCase().includes(searchTerm) ||
      template.conteudo.toLowerCase().includes(searchTerm)
  );
}

/**
 * Convert a template to SmartWorkflow format
 */
export function convertTemplateToWorkflowFormat(
  template: WorkflowSuggestionTemplate,
  overrides?: Partial<SmartWorkflow>
): SmartWorkflow {
  // Map criticidade to category
  const categoryMap: Record<string, string> = {
    Alta: "safety",
    Média: "maintenance",
    Baixa: "routine",
  };

  return {
    name: template.etapa,
    description: template.conteudo,
    status: "draft",
    trigger: template.tipo_sugestao,
    category: categoryMap[template.criticidade] || "routine",
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
}

/**
 * Create a workflow from a template by index
 */
export function createWorkflowFromTemplate(
  templateIndex: number,
  overrides?: Partial<SmartWorkflow>
): SmartWorkflow | null {
  const template = workflowSuggestionTemplates[templateIndex];
  if (!template) {
    return null;
  }
  return convertTemplateToWorkflowFormat(template, overrides);
}

/**
 * Get all templates in a formatted structure for display
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
 * Get summary statistics of templates
 */
export function getTemplateSummary(): {
  total: number;
  alta: number;
  media: number;
  baixa: number;
  } {
  return {
    total: workflowSuggestionTemplates.length,
    alta: getTemplatesByCriticidade("Alta").length,
    media: getTemplatesByCriticidade("Média").length,
    baixa: getTemplatesByCriticidade("Baixa").length,
  };
}
