import { supabase } from "@/integrations/supabase/client";

export interface WorkflowSuggestion {
  workflow_id: string;
  etapa: string;
  tipo_sugestao: string;
  conteudo: string;
  criticidade: "low" | "medium" | "high" | "urgent";
  responsavel_sugerido: string;
  origem: string;
  created_by: string;
  status: "pending" | "accepted" | "rejected";
}

/**
 * Seeds AI-generated suggestions for a newly created workflow
 * based on historical templates and best practices
 * 
 * @param workflowId - The UUID of the workflow to seed suggestions for
 * @param createdBy - The UUID of the user creating the workflow (optional)
 * @returns Promise<void>
 */
export async function seedSuggestionsForWorkflow(
  workflowId: string, 
  createdBy?: string
): Promise<void> {
  console.log("Seeding suggestions for workflow:", workflowId);

  try {
    // Get workflow details to generate context-aware suggestions
    const { data: workflow, error: workflowError } = await supabase
      .from("smart_workflows")
      .select("*")
      .eq("id", workflowId)
      .single();

    if (workflowError || !workflow) {
      console.error("Error fetching workflow:", workflowError);
      throw new Error("Failed to fetch workflow details");
    }

    // Generate suggestions based on workflow category and title
    const suggestions: Partial<WorkflowSuggestion>[] = [
      {
        workflow_id: workflowId,
        etapa: "Planejamento",
        tipo_sugestao: "Tarefa",
        conteudo: `Definir escopo e objetivos do workflow: ${workflow.title}`,
        criticidade: "high",
        responsavel_sugerido: "Gerente de Projeto",
        origem: "Copilot AI",
        created_by: createdBy || workflow.created_by,
        status: "pending",
      },
      {
        workflow_id: workflowId,
        etapa: "Documentação",
        tipo_sugestao: "Checklist",
        conteudo: "Criar documentação técnica e procedimentos operacionais padrão (SOP)",
        criticidade: "medium",
        responsavel_sugerido: "Analista de Processos",
        origem: "Copilot AI",
        created_by: createdBy || workflow.created_by,
        status: "pending",
      },
      {
        workflow_id: workflowId,
        etapa: "Execução",
        tipo_sugestao: "Review",
        conteudo: "Revisar e aprovar documentação necessária antes da execução",
        criticidade: "medium",
        responsavel_sugerido: "Coordenador",
        origem: "Copilot AI",
        created_by: createdBy || workflow.created_by,
        status: "pending",
      },
      {
        workflow_id: workflowId,
        etapa: "Monitoramento",
        tipo_sugestao: "Tarefa",
        conteudo: "Configurar dashboards e métricas de acompanhamento",
        criticidade: "medium",
        responsavel_sugerido: "Analista de Dados",
        origem: "Copilot AI",
        created_by: createdBy || workflow.created_by,
        status: "pending",
      },
      {
        workflow_id: workflowId,
        etapa: "Validação",
        tipo_sugestao: "Review",
        conteudo: "Validar resultados, KPIs e compliance do workflow",
        criticidade: "high",
        responsavel_sugerido: "Supervisor",
        origem: "Copilot AI",
        created_by: createdBy || workflow.created_by,
        status: "pending",
      },
    ];

    // Add category-specific suggestions if workflow has a category
    if (workflow.category) {
      suggestions.push({
        workflow_id: workflowId,
        etapa: "Planejamento",
        tipo_sugestao: "Tarefa",
        conteudo: `Revisar templates e best practices para categoria: ${workflow.category}`,
        criticidade: "low",
        responsavel_sugerido: "Especialista",
        origem: "Copilot AI",
        created_by: createdBy || workflow.created_by,
        status: "pending",
      });
    }

    // Insert suggestions into database
    const { error: insertError } = await supabase
      .from("workflow_ai_suggestions")
      .insert(suggestions);

    if (insertError) {
      console.error("Error inserting suggestions:", insertError);
      throw new Error("Failed to seed workflow suggestions");
    }

    console.log(`Successfully seeded ${suggestions.length} suggestions for workflow ${workflowId}`);
    
  } catch (error) {
    console.error("Error in seedSuggestionsForWorkflow:", error);
    throw error;
  }
}

/**
 * Fetches all AI suggestions for a given workflow
 * 
 * @param workflowId - The UUID of the workflow
 * @returns Promise with array of suggestions
 */
export async function getWorkflowSuggestions(
  workflowId: string
): Promise<WorkflowSuggestion[]> {
  const { data, error } = await supabase
    .from("workflow_ai_suggestions")
    .select("*")
    .eq("workflow_id", workflowId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching workflow suggestions:", error);
    throw error;
  }

  return data || [];
}

/**
 * Updates the status of a workflow suggestion
 * 
 * @param suggestionId - The UUID of the suggestion
 * @param status - The new status
 * @returns Promise<void>
 */
export async function updateSuggestionStatus(
  suggestionId: string,
  status: "pending" | "accepted" | "rejected"
): Promise<void> {
  const { error } = await supabase
    .from("workflow_ai_suggestions")
    .update({ status })
    .eq("id", suggestionId);

  if (error) {
    console.error("Error updating suggestion status:", error);
    throw error;
  }
}
