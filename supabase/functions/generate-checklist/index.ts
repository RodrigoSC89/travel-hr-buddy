import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  corsHeaders,
  callOpenAIWithRetry,
  logAIInteraction,
  extractTokenUsage,
  validateOpenAIResponse,
} from "../_shared/ai-utils.ts";
import { createSupabaseClient, getAuthenticatedUser } from "../_shared/supabase-client.ts";

interface GenerateChecklistRequest {
  prompt: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let supabaseClient: any = null;
  let userId: string | undefined = undefined;

  try {
    // Initialize Supabase client
    supabaseClient = createSupabaseClient(req);
    const user = await getAuthenticatedUser(supabaseClient);
    userId = user?.id;

    // Validate request method
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get and validate request body
    const { prompt }: GenerateChecklistRequest = await req.json();

    if (!prompt || typeof prompt !== "string") {
      await logAIInteraction(supabaseClient, {
        user_id: userId,
        interaction_type: "checklist_generation",
        prompt: prompt || "",
        success: false,
        error_message: "Invalid prompt",
        duration_ms: Date.now() - startTime,
      });

      return new Response(JSON.stringify({ error: "Prompt inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for OpenAI API key
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    console.log(`Generating checklist for prompt: "${prompt}"`);

    // Prepare OpenAI request
    const requestBody = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente que gera checklists objetivos e diretos a partir de uma descrição. Liste entre 5 a 10 tarefas breves. Sem introdução, apenas a lista.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
    };

    // Call OpenAI with retry logic
    const { response: data, duration } = await callOpenAIWithRetry(OPENAI_API_KEY, requestBody);

    // Validate response format
    if (!validateOpenAIResponse(data)) {
      throw new Error("Invalid response format from OpenAI API");
    }

    const text = (data as any).choices[0].message.content || "";

    // Parse the response into individual items
    const items = text
      .split("\n")
      .map((line: string) => line.replace(/^[-*\d.\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 10);

    console.log(`Generated ${items.length} checklist items in ${duration}ms`);

    // Log successful interaction
    await logAIInteraction(supabaseClient, {
      user_id: userId,
      interaction_type: "checklist_generation",
      prompt: prompt,
      response: JSON.stringify({ items }),
      model_used: "gpt-4o-mini",
      tokens_used: extractTokenUsage(data),
      duration_ms: duration,
      success: true,
      metadata: {
        items_count: items.length,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        items,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro ao gerar com IA:", error);

    // Log failed interaction
    if (supabaseClient) {
      await logAIInteraction(supabaseClient, {
        user_id: userId,
        interaction_type: "checklist_generation",
        prompt: "Unknown", // We might not have the prompt at this point
        success: false,
        error_message: error instanceof Error ? error.message : "Unknown error",
        duration_ms: Date.now() - startTime,
      });
    }

    return new Response(
      JSON.stringify({
        error: "Erro ao gerar checklist",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
