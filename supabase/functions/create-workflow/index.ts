import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Template suggestions based on workflow categories
 */
const WORKFLOW_TEMPLATES: Record<string, Array<{
  title: string;
  description: string;
  priority: string;
  position: number;
  tags: string[];
}>> = {
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
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid session" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Only handle POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
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
        JSON.stringify({ error: "Erro ao criar workflow", details: workflowError?.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Seed suggestions based on template
    let template = WORKFLOW_TEMPLATES["default"];
    
    // Try to match based on category or title
    if (category && WORKFLOW_TEMPLATES[category.toLowerCase()]) {
      template = WORKFLOW_TEMPLATES[category.toLowerCase()];
    } else {
      const titleLower = title.toLowerCase();
      if (titleLower.includes("manutenção") || titleLower.includes("manutencao")) {
        template = WORKFLOW_TEMPLATES["manutenção"] || WORKFLOW_TEMPLATES["default"];
      } else if (titleLower.includes("auditoria")) {
        template = WORKFLOW_TEMPLATES["auditoria"] || WORKFLOW_TEMPLATES["default"];
      } else if (titleLower.includes("treinamento")) {
        template = WORKFLOW_TEMPLATES["treinamento"] || WORKFLOW_TEMPLATES["default"];
      } else if (titleLower.includes("projeto")) {
        template = WORKFLOW_TEMPLATES["projeto"] || WORKFLOW_TEMPLATES["default"];
      }
    }

    // Create workflow steps from template (max 5 suggestions)
    const suggestionsToCreate = template.slice(0, 5);
    const stepsToInsert = suggestionsToCreate.map((suggestion) => ({
      workflow_id: workflow.id,
      title: suggestion.title,
      description: suggestion.description,
      status: "pendente",
      position: suggestion.position,
      priority: suggestion.priority,
      assigned_to: user.id,
      created_by: user.id,
      tags: suggestion.tags,
      metadata: {},
    }));

    // Insert workflow steps
    const { data: steps, error: stepsError } = await supabase
      .from("smart_workflow_steps")
      .insert(stepsToInsert)
      .select();

    if (stepsError) {
      console.warn("Error creating workflow steps:", stepsError);
      // Return workflow even if steps failed
      return new Response(
        JSON.stringify({
          success: true,
          workflow,
          suggestions: [],
          warning: "Workflow criado mas falhou ao criar sugestões",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        workflow,
        suggestions: steps || [],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
