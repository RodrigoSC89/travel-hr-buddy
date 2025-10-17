import { workflowSuggestionTemplates, WorkflowSuggestionTemplate } from "./suggestionTemplates";

export interface SmartWorkflow {
  name: string;
  description: string;
  status: string;
  trigger: string;
  category: string;
  tags: string[];
  steps: any[];
  executions: number;
  successRate: number;
  createdAt: Date;
}

export interface FormattedTemplate {
  id: number;
  title: string;
  description: string;
  priority: string;
  responsible: string;
  type: string;
  source: string;
}

export interface TemplateSummary {
  total: number;
  alta: number;
  media: number;
  baixa: number;
}

/**
 * Convert a WorkflowSuggestionTemplate to SmartWorkflow format
 */
export function convertTemplateToWorkflowFormat(
  template: WorkflowSuggestionTemplate,
  overrides?: Partial<SmartWorkflow>
): SmartWorkflow {
  const category = template.criticidade === "Alta" 
    ? "safety" 
    : template.criticidade === "Média" 
    ? "maintenance" 
    : "other";

  return {
    name: template.etapa,
    description: template.conteudo,
    status: "draft",
    trigger: template.tipo_sugestao,
    category,
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
 * Get templates filtered by criticidade
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
 * Get templates filtered by responsavel (case insensitive partial match)
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
 * Get templates filtered by suggestion type (case insensitive partial match)
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
 * Search templates by keyword in etapa or conteudo (case insensitive)
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
 * Create a workflow from a template by index
 */
export function createWorkflowFromTemplate(
  index: number,
  overrides?: Partial<SmartWorkflow>
): SmartWorkflow | null {
  if (index < 0 || index >= workflowSuggestionTemplates.length) {
    return null;
  }
  const template = workflowSuggestionTemplates[index];
  return convertTemplateToWorkflowFormat(template, overrides);
}

/**
 * Get all templates in a formatted structure
 */
export function getAllTemplatesFormatted(): FormattedTemplate[] {
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
export function getTemplateSummary(): TemplateSummary {
  const alta = workflowSuggestionTemplates.filter(
    (t) => t.criticidade === "Alta"
  ).length;
  const media = workflowSuggestionTemplates.filter(
    (t) => t.criticidade === "Média"
  ).length;
  const baixa = workflowSuggestionTemplates.filter(
    (t) => t.criticidade === "Baixa"
  ).length;

  return {
    total: workflowSuggestionTemplates.length,
    alta,
    media,
    baixa,
  };
}
