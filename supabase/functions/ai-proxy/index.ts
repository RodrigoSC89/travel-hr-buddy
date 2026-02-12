/**
 * AI Proxy Edge Function
 * Unified proxy for ALL OpenAI API calls - keeps API keys server-side
 * Replaces direct browser-side OpenAI calls across the entire system
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ProxyRequest {
  action: "chat" | "embedding" | "test";
  messages?: Array<{ role: string; content: string }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: string };
  text?: string; // for embeddings
  embedding_model?: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const body: ProxyRequest = await req.json();
    const { action } = body;

    // Use Lovable AI Gateway (preferred) or fallback to OpenAI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    const useGateway = !!LOVABLE_API_KEY;
    const apiKey = LOVABLE_API_KEY || OPENAI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI API key not configured on server", fallback: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const baseUrl = useGateway
      ? "https://ai.gateway.lovable.dev/v1"
      : "https://api.openai.com/v1";

    // === CHAT COMPLETIONS ===
    if (action === "chat") {
      const model = useGateway
        ? "google/gemini-3-flash-preview"
        : (body.model || "gpt-4o-mini");

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: body.messages || [],
          temperature: body.temperature ?? 0.7,
          max_tokens: body.max_tokens ?? 2000,
          ...(body.response_format && { response_format: body.response_format }),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ai-proxy] Chat API error: ${response.status}`, errorText);
        return new Response(
          JSON.stringify({ error: `AI API error: ${response.status}`, fallback: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content ?? null;

      return new Response(
        JSON.stringify({
          content,
          model: data.model,
          usage: data.usage,
          responseTimeMs: Date.now() - startTime,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === EMBEDDINGS ===
    if (action === "embedding") {
      if (!body.text) {
        return new Response(
          JSON.stringify({ error: "Text is required for embeddings" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Embeddings only work with OpenAI directly
      const embeddingKey = OPENAI_API_KEY || LOVABLE_API_KEY;
      const embeddingUrl = OPENAI_API_KEY
        ? "https://api.openai.com/v1/embeddings"
        : `${baseUrl}/embeddings`;

      const response = await fetch(embeddingUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${embeddingKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: body.embedding_model || "text-embedding-3-small",
          input: body.text,
          dimensions: 1536,
        }),
      });

      if (!response.ok) {
        console.error(`[ai-proxy] Embedding API error: ${response.status}`);
        return new Response(
          JSON.stringify({ error: `Embedding API error: ${response.status}`, embedding: null, fallback: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const embedding = data.data?.[0]?.embedding ?? null;

      return new Response(
        JSON.stringify({ embedding, responseTimeMs: Date.now() - startTime }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === TEST CONNECTION ===
    if (action === "test") {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: useGateway ? "google/gemini-3-flash-preview" : "gpt-3.5-turbo",
          messages: [{ role: "user", content: 'Say "OK" if you can read this.' }],
          max_tokens: 10,
        }),
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        return new Response(
          JSON.stringify({
            success: false,
            message: `AI API error: ${response.status}`,
            responseTime,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "AI API connection successful",
          responseTime,
          gateway: useGateway,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[ai-proxy] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        fallback: true,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
