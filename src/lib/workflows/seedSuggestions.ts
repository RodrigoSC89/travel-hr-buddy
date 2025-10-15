import { supabase } from "@/integrations/supabase/client";

/**
 * Seeds workflow suggestions based on templates and historical workflows
 * This function creates initial workflow steps based on common patterns
 */
export async function seedSuggestionsForWorkflow(workflowId: string): Promise<void> {
  try {
    // Define template-based suggestions
    const suggestions = [
      {
        title: "Análise de Requisitos",
        description: "Revisar e documentar todos os requisitos do projeto",
        status: "pendente" as const,
        position: 1,
        priority: "high" as const,
        tags: ["análise", "documentação"],
      },
      {
        title: "Planejamento Inicial",
        description: "Criar plano de ação detalhado e timeline",
        status: "pendente" as const,
        position: 2,
        priority: "high" as const,
        tags: ["planejamento", "estratégia"],
      },
      {
        title: "Aprovação de Recursos",
        description: "Solicitar e aprovar recursos necessários",
        status: "pendente" as const,
        position: 3,
        priority: "medium" as const,
        tags: ["recursos", "aprovação"],
      },
      {
        title: "Execução",
        description: "Implementar as ações planejadas",
        status: "pendente" as const,
        position: 4,
        priority: "medium" as const,
        tags: ["execução", "implementação"],
      },
      {
        title: "Revisão e Validação",
        description: "Revisar resultados e validar com stakeholders",
        status: "pendente" as const,
        position: 5,
        priority: "high" as const,
        tags: ["revisão", "validação"],
      },
    ];

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Insert suggestions as workflow steps
    const steps = suggestions.map((suggestion) => ({
      workflow_id: workflowId,
      ...suggestion,
      created_by: user.id,
    }));

    const { error } = await supabase
      .from("smart_workflow_steps")
      .insert(steps);

    if (error) {
      console.error("Error seeding suggestions:", error);
      throw error;
    }

    console.log(`Successfully seeded ${suggestions.length} suggestions for workflow ${workflowId}`);
  } catch (error) {
    console.error("Failed to seed suggestions:", error);
    throw error;
  }
}
