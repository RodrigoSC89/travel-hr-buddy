/**
 * Workflow Suggestions Seeder
 * 
 * Helper function to seed initial workflow suggestions based on templates and historical data
 */

import { supabase } from "@/integrations/supabase/client";
import type {
  SeedSuggestionsOptions,
  SeedSuggestionsResult,
  WorkflowSuggestion,
} from "@/types/workflow";

/**
 * Template suggestions based on workflow categories
 */
const WORKFLOW_TEMPLATES: Record<string, WorkflowSuggestion[]> = {
  "default": [
    {
      title: "Planejamento inicial",
      description: "Definir escopo e objetivos do workflow",
      priority: "high",
      position: 0,
      tags: ["planejamento"],
    },
    {
      title: "Análise de requisitos",
      description: "Levantar requisitos e necessidades",
      priority: "high",
      position: 1,
      tags: ["análise"],
    },
    {
      title: "Execução",
      description: "Realizar as atividades planejadas",
      priority: "medium",
      position: 2,
      tags: ["execução"],
    },
    {
      title: "Revisão e validação",
      description: "Validar resultados e fazer ajustes",
      priority: "medium",
      position: 3,
      tags: ["revisão"],
    },
    {
      title: "Conclusão",
      description: "Finalizar e documentar resultados",
      priority: "low",
      position: 4,
      tags: ["conclusão"],
    },
  ],
  "manutenção": [
    {
      title: "Inspeção inicial",
      description: "Avaliar condições e necessidades de manutenção",
      priority: "high",
      position: 0,
      tags: ["manutenção", "inspeção"],
    },
    {
      title: "Planejamento de recursos",
      description: "Definir materiais, ferramentas e equipe necessários",
      priority: "high",
      position: 1,
      tags: ["manutenção", "planejamento"],
    },
    {
      title: "Execução da manutenção",
      description: "Realizar procedimentos de manutenção",
      priority: "medium",
      position: 2,
      tags: ["manutenção", "execução"],
    },
    {
      title: "Testes e validação",
      description: "Testar equipamento após manutenção",
      priority: "high",
      position: 3,
      tags: ["manutenção", "teste"],
    },
    {
      title: "Documentação",
      description: "Registrar serviços realizados e resultados",
      priority: "medium",
      position: 4,
      tags: ["manutenção", "documentação"],
    },
  ],
  "auditoria": [
    {
      title: "Preparação da auditoria",
      description: "Reunir documentação e preparar checklist",
      priority: "high",
      position: 0,
      tags: ["auditoria", "preparação"],
    },
    {
      title: "Auditoria inicial",
      description: "Realizar primeira avaliação",
      priority: "high",
      position: 1,
      tags: ["auditoria", "avaliação"],
    },
    {
      title: "Identificação de não conformidades",
      description: "Documentar problemas encontrados",
      priority: "high",
      position: 2,
      tags: ["auditoria", "não-conformidade"],
    },
    {
      title: "Plano de ação corretiva",
      description: "Definir ações para correção",
      priority: "medium",
      position: 3,
      tags: ["auditoria", "ação-corretiva"],
    },
    {
      title: "Verificação final",
      description: "Validar implementação das correções",
      priority: "medium",
      position: 4,
      tags: ["auditoria", "verificação"],
    },
  ],
  "treinamento": [
    {
      title: "Levantamento de necessidades",
      description: "Identificar gaps de conhecimento e skills",
      priority: "high",
      position: 0,
      tags: ["treinamento", "análise"],
    },
    {
      title: "Planejamento do treinamento",
      description: "Definir conteúdo, cronograma e recursos",
      priority: "high",
      position: 1,
      tags: ["treinamento", "planejamento"],
    },
    {
      title: "Execução do treinamento",
      description: "Realizar sessões de treinamento",
      priority: "medium",
      position: 2,
      tags: ["treinamento", "execução"],
    },
    {
      title: "Avaliação de aprendizado",
      description: "Aplicar testes e avaliar conhecimento",
      priority: "medium",
      position: 3,
      tags: ["treinamento", "avaliação"],
    },
    {
      title: "Feedback e melhoria contínua",
      description: "Coletar feedback e ajustar programa",
      priority: "low",
      position: 4,
      tags: ["treinamento", "feedback"],
    },
  ],
  "projeto": [
    {
      title: "Kickoff do projeto",
      description: "Reunir equipe e alinhar objetivos",
      priority: "high",
      position: 0,
      tags: ["projeto", "kickoff"],
    },
    {
      title: "Definição de escopo",
      description: "Detalhar entregas e limitações",
      priority: "high",
      position: 1,
      tags: ["projeto", "escopo"],
    },
    {
      title: "Desenvolvimento/Implementação",
      description: "Executar atividades do projeto",
      priority: "medium",
      position: 2,
      tags: ["projeto", "desenvolvimento"],
    },
    {
      title: "Controle de qualidade",
      description: "Validar qualidade das entregas",
      priority: "medium",
      position: 3,
      tags: ["projeto", "qualidade"],
    },
    {
      title: "Encerramento",
      description: "Entregar projeto e fazer retrospectiva",
      priority: "low",
      position: 4,
      tags: ["projeto", "encerramento"],
    },
  ],
};

/**
 * Seeds workflow suggestions based on templates and historical data
 * @param options - Configuration options for seeding suggestions
 * @returns Result with created workflow steps
 */
export async function seedSuggestionsForWorkflow(
  options: SeedSuggestionsOptions
): Promise<SeedSuggestionsResult> {
  try {
    const { workflowId, workflowTitle, category, maxSuggestions = 5 } = options;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        suggestions: [],
        error: "User not authenticated",
      };
    }

    // Select template based on category or workflow title
    let template = WORKFLOW_TEMPLATES["default"];
    
    // Check if category matches a template
    if (category && WORKFLOW_TEMPLATES[category.toLowerCase()]) {
      template = WORKFLOW_TEMPLATES[category.toLowerCase()];
    } else {
      // Try to match based on workflow title keywords
      const titleLower = workflowTitle.toLowerCase();
      if (titleLower.includes("manutenção") || titleLower.includes("manutencao")) {
        template = WORKFLOW_TEMPLATES["manutenção"];
      } else if (titleLower.includes("auditoria")) {
        template = WORKFLOW_TEMPLATES["auditoria"];
      } else if (titleLower.includes("treinamento")) {
        template = WORKFLOW_TEMPLATES["treinamento"];
      } else if (titleLower.includes("projeto")) {
        template = WORKFLOW_TEMPLATES["projeto"];
      }
    }

    // Limit suggestions to maxSuggestions
    const suggestionsToCreate = template.slice(0, maxSuggestions);

    // Create workflow steps from suggestions
    const stepsToInsert = suggestionsToCreate.map((suggestion) => ({
      workflow_id: workflowId,
      title: suggestion.title,
      description: suggestion.description,
      status: "pendente" as const,
      position: suggestion.position,
      priority: suggestion.priority,
      assigned_to: user.id,
      created_by: user.id,
      tags: suggestion.tags,
      metadata: {},
    }));

    // Insert steps into database
    const { data, error } = await supabase
      .from("smart_workflow_steps")
      .insert(stepsToInsert)
      .select();

    if (error) {
      console.error("Error creating workflow steps:", error);
      return {
        success: false,
        suggestions: [],
        error: error.message,
      };
    }

    return {
      success: true,
      suggestions: data || [],
    };
  } catch (error) {
    console.error("Unexpected error in seedSuggestionsForWorkflow:", error);
    return {
      success: false,
      suggestions: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Gets available workflow templates
 * @returns List of available template names
 */
export function getAvailableTemplates(): string[] {
  return Object.keys(WORKFLOW_TEMPLATES);
}

/**
 * Gets template suggestions without creating them
 * @param templateName - Name of the template
 * @returns Template suggestions
 */
export function getTemplateSuggestions(templateName: string): WorkflowSuggestion[] {
  return WORKFLOW_TEMPLATES[templateName.toLowerCase()] || WORKFLOW_TEMPLATES["default"];
}
