/// <reference path="../deno-ambient.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WorkflowStep {
  title: string;
  description: string;
  priority: string;
  position: number;
  tags: string[];
}

const WORKFLOW_TEMPLATES: Record<string, WorkflowStep[]> = {
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

interface CreateWorkflowRequest {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  config?: Record<string, unknown>;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { data: userData, error: authError } = await supabase.auth.getUser();

    if (authError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid session" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body: CreateWorkflowRequest = await req.json();
    const { title, description, category, tags, config } = body;

    if (!title) {
      return new Response(
        JSON.stringify({ error: "Title is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: workflow, error: workflowError } = await supabase
      .from("smart_workflows")
      .insert({
        title,
        description: description || null,
        category: category || null,
        tags: tags || [],
        config: config || {},
        created_by: userData.user.id,
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

    let template = WORKFLOW_TEMPLATES["default"];
    
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

    const suggestionsToCreate = template.slice(0, 5);
    const stepsToInsert = suggestionsToCreate.map((suggestion) => ({
      workflow_id: workflow.id,
      title: suggestion.title,
      description: suggestion.description,
      status: "pendente",
      position: suggestion.position,
      priority: suggestion.priority,
      assigned_to: userData.user.id,
      created_by: userData.user.id,
      tags: suggestion.tags,
      metadata: {},
    }));

    const { data: steps, error: stepsError } = await supabase
      .from("smart_workflow_steps")
      .insert(stepsToInsert)
      .select();

    if (stepsError) {
      console.warn("Error creating workflow steps:", stepsError);
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
      JSON.stringify({ error: "Internal server error", details: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
