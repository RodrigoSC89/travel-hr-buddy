import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Seeds workflow suggestions based on templates and historical workflows
 */
async function seedSuggestionsForWorkflow(
  supabase: any,
  workflowId: string,
  userId: string
): Promise<void> {
  // Define template-based suggestions
  const suggestions = [
    {
      title: "Análise de Requisitos",
      description: "Revisar e documentar todos os requisitos do projeto",
      status: "pendente",
      position: 1,
      priority: "high",
      tags: ["análise", "documentação"],
    },
    {
      title: "Planejamento Inicial",
      description: "Criar plano de ação detalhado e timeline",
      status: "pendente",
      position: 2,
      priority: "high",
      tags: ["planejamento", "estratégia"],
    },
    {
      title: "Aprovação de Recursos",
      description: "Solicitar e aprovar recursos necessários",
      status: "pendente",
      position: 3,
      priority: "medium",
      tags: ["recursos", "aprovação"],
    },
    {
      title: "Execução",
      description: "Implementar as ações planejadas",
      status: "pendente",
      position: 4,
      priority: "medium",
      tags: ["execução", "implementação"],
    },
    {
      title: "Revisão e Validação",
      description: "Revisar resultados e validar com stakeholders",
      status: "pendente",
      position: 5,
      priority: "high",
      tags: ["revisão", "validação"],
    },
  ];

  // Insert suggestions as workflow steps
  const steps = suggestions.map((suggestion) => ({
    workflow_id: workflowId,
    ...suggestion,
    created_by: userId,
  }));

  const { error } = await supabase
    .from("smart_workflow_steps")
    .insert(steps);

  if (error) {
    console.error("Error seeding suggestions:", error);
    throw error;
  }

  console.log(`Successfully seeded ${suggestions.length} suggestions for workflow ${workflowId}`);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST method
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Supabase client with auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid session" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const body = await req.json();
    const { title, description, category, tags, config } = body;

    // Validate required fields
    if (!title) {
      return new Response(
        JSON.stringify({ error: "Title is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create workflow
    const { data: workflow, error: workflowError } = await supabase
      .from("smart_workflows")
      .insert({
        title,
        description: description || null,
        category: category || null,
        tags: tags || [],
        config: config || {},
        created_by: user.id,
        status: "draft",
      })
      .select()
      .single();

    if (workflowError || !workflow) {
      console.error("Error creating workflow:", workflowError);
      return new Response(
        JSON.stringify({ error: "Erro ao criar workflow" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Seed suggestions for the workflow
    try {
      await seedSuggestionsForWorkflow(supabase, workflow.id, user.id);
    } catch (suggestionError) {
      console.error("Error seeding suggestions:", suggestionError);
      // Don't fail the entire request if suggestions fail
      // The workflow was created successfully
    }

    return new Response(
      JSON.stringify({
        success: true,
        workflow,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
