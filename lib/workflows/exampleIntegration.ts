/**
 * Workflow Suggestion Templates Integration Examples
 * 
 * Helper functions to integrate workflow templates with the SmartWorkflow system
 */

import { workflowSuggestionTemplates, WorkflowSuggestionTemplate } from "./suggestionTemplates";

/**
 * SmartWorkflow interface matching the format used in smart-workflow-automation.tsx
 */
export interface SmartWorkflow {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "draft";
  trigger: string;
  steps: any[];
  executions: number;
  successRate: number;
  createdAt: Date;
  lastRun?: Date;
  category: string;
  tags: string[];
}

/**
 * Converts a workflow suggestion template to SmartWorkflow format
 * @param template - The template to convert
 * @param overrides - Optional overrides for workflow properties
 * @returns A SmartWorkflow object
 */
export function convertTemplateToWorkflowFormat(
  template: WorkflowSuggestionTemplate,
  overrides?: Partial<SmartWorkflow>
): SmartWorkflow {
  const timestamp = new Date();
  
  return {
    id: overrides?.id || `template-${Date.now()}`,
    name: template.etapa,
    description: template.conteudo,
    status: overrides?.status || "draft",
    trigger: `Sugestão: ${template.tipo_sugestao}`,
    steps: [],
    executions: 0,
    successRate: 0,
    createdAt: timestamp,
    category: template.criticidade === "Alta" ? "urgent" : "standard",
    tags: [
      template.tipo_sugestao,
      template.criticidade,
      template.responsavel_sugerido,
      "Template",
    ],
    ...overrides,
  };
}

/**
 * Filters templates by criticidade (priority level)
 * @param criticidade - Filter by 'Alta', 'Média', or 'Baixa'
 * @returns Filtered array of templates
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
 * Gets high priority templates (Alta criticidade)
 * @returns Array of high priority templates
 */
export function getHighPriorityTemplates(): WorkflowSuggestionTemplate[] {
  return getTemplatesByCriticidade("Alta");
}

/**
 * Filters templates by responsible party
 * @param responsavel - The responsible party name
 * @returns Filtered array of templates
 */
export function getTemplatesByResponsavel(
  responsavel: string
): WorkflowSuggestionTemplate[] {
  return workflowSuggestionTemplates.filter(
    (template) => template.responsavel_sugerido.toLowerCase().includes(responsavel.toLowerCase())
  );
}

/**
 * Filters templates by suggestion type
 * @param tipo - The suggestion type (e.g., 'Criar tarefa', 'Ajustar prazo')
 * @returns Filtered array of templates
 */
export function getTemplatesBySuggestionType(
  tipo: string
): WorkflowSuggestionTemplate[] {
  return workflowSuggestionTemplates.filter(
    (template) => template.tipo_sugestao.toLowerCase().includes(tipo.toLowerCase())
  );
}

/**
 * Creates a new workflow from a template with custom properties
 * @param templateId - Index of the template to use (0-based)
 * @param customProperties - Custom properties to override
 * @returns A new SmartWorkflow object or null if template not found
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
 * Gets all templates in a formatted structure ready for UI display
 * @returns Array of formatted template objects
 */
export function getAllTemplatesFormatted(): Array<{
  id: number;
  title: string;
  description: string;
  priority: string;
  responsible: string;
  type: string;
  origin: string;
}> {
  return workflowSuggestionTemplates.map((template, index) => ({
    id: index,
    title: template.etapa,
    description: template.conteudo,
    priority: template.criticidade,
    responsible: template.responsavel_sugerido,
    type: template.tipo_sugestao,
    origin: template.origem,
  }));
}

/**
 * Gets a summary of all templates with statistics
 * @returns Object with template statistics
 */
export function getTemplateSummary(): {
  total: number;
  alta: number;
  media: number;
  baixa: number;
  byResponsavel: Record<string, number>;
  byTipo: Record<string, number>;
  } {
  const summary = {
    total: workflowSuggestionTemplates.length,
    alta: 0,
    media: 0,
    baixa: 0,
    byResponsavel: {} as Record<string, number>,
    byTipo: {} as Record<string, number>,
  };

  workflowSuggestionTemplates.forEach((template) => {
    // Count by criticidade
    if (template.criticidade === "Alta") summary.alta++;
    if (template.criticidade === "Média") summary.media++;
    if (template.criticidade === "Baixa") summary.baixa++;

    // Count by responsavel
    const responsavel = template.responsavel_sugerido;
    summary.byResponsavel[responsavel] = (summary.byResponsavel[responsavel] || 0) + 1;

    // Count by tipo
    const tipo = template.tipo_sugestao;
    summary.byTipo[tipo] = (summary.byTipo[tipo] || 0) + 1;
  });

  return summary;
}

/**
 * Searches templates by keyword in etapa or conteudo
 * @param keyword - Search keyword
 * @returns Array of matching templates
 */
export function searchTemplates(keyword: string): WorkflowSuggestionTemplate[] {
  const lowerKeyword = keyword.toLowerCase();
  return workflowSuggestionTemplates.filter(
    (template) =>
      template.etapa.toLowerCase().includes(lowerKeyword) ||
      template.conteudo.toLowerCase().includes(lowerKeyword)
  );
}
