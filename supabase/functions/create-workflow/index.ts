import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WorkflowCreateRequest {
  title: string;
  created_by: string;
  description?: string;
  category?: string;
  tags?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body: WorkflowCreateRequest = await req.json();
    const { title, created_by, description, category, tags } = body;

    if (!title) {
      return new Response(
        JSON.stringify({ error: "Title is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (!created_by) {
      return new Response(
        JSON.stringify({ error: "created_by is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Creating workflow with title:", title);

    // Insert workflow into smart_workflows table
    const { data: workflow, error: workflowError } = await supabase
      .from("smart_workflows")
      .insert({
        title,
        created_by,
        description,
        category,
        tags,
        status: "draft",
      })
      .select()
      .single();

    if (workflowError || !workflow) {
      console.error("Error creating workflow:", workflowError);
      return new Response(
        JSON.stringify({ 
          error: "Erro ao criar workflow", 
          details: workflowError?.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Workflow created successfully:", workflow.id);

    // Call seedSuggestionsForWorkflow helper
    // This would ideally be a separate function, but for now we'll inline basic suggestion seeding
    console.log("Seeding AI suggestions for workflow:", workflow.id);

    // Create some initial AI suggestions based on workflow title/category
    const suggestions = [
      {
        workflow_id: workflow.id,
        etapa: "Planejamento",
        tipo_sugestao: "Tarefa",
        conteudo: `Definir escopo e objetivos do workflow: ${title}`,
        criticidade: "high",
        responsavel_sugerido: "Gerente de Projeto",
        origem: "Copilot",
        created_by,
        status: "pending",
      },
      {
        workflow_id: workflow.id,
        etapa: "Execução",
        tipo_sugestao: "Checklist",
        conteudo: "Revisar e aprovar documentação necessária",
        criticidade: "medium",
        responsavel_sugerido: "Coordenador",
        origem: "Copilot",
        created_by,
        status: "pending",
      },
      {
        workflow_id: workflow.id,
        etapa: "Validação",
        tipo_sugestao: "Review",
        conteudo: "Validar resultados e KPIs do workflow",
        criticidade: "high",
        responsavel_sugerido: "Supervisor",
        origem: "Copilot",
        created_by,
        status: "pending",
      },
    ];

    const { error: suggestionsError } = await supabase
      .from("workflow_ai_suggestions")
      .insert(suggestions);

    if (suggestionsError) {
      console.error("Error seeding suggestions:", suggestionsError);
      // Don't fail the whole request if suggestions fail
    } else {
      console.log("AI suggestions seeded successfully");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        workflow,
        message: "Workflow automático criado com sucesso!",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in create-workflow function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
