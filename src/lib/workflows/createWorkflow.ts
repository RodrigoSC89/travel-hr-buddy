import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CreateWorkflowPayload {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  config?: Record<string, unknown>;
}

export interface CreateWorkflowResponse {
  success: boolean;
  workflow: {
    id: string;
    title: string;
    description?: string;
    category?: string;
    tags?: string[];
    config?: Record<string, unknown>;
    status: string;
    created_by: string;
    created_at: string;
    updated_at: string;
  };
}

/**
 * Creates a new workflow using the Supabase Edge Function
 * This automatically seeds initial workflow steps based on templates
 */
export async function createWorkflow(
  payload: CreateWorkflowPayload
): Promise<CreateWorkflowResponse> {
  try {
    // Get the current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error("User not authenticated");
    }

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke("create-workflow", {
      body: payload,
    });

    if (error) {
      console.error("Error creating workflow:", error);
      throw error;
    }

    if (!data || !data.success) {
      throw new Error(data?.error || "Failed to create workflow");
    }

    toast.success("Workflow criado com sucesso!", {
      description: "Sugestões de tarefas foram adicionadas automaticamente.",
    });

    return data;
  } catch (error) {
    console.error("Failed to create workflow:", error);
    toast.error("Erro ao criar workflow", {
      description: error instanceof Error ? error.message : "Erro desconhecido",
    });
    throw error;
  }
}
