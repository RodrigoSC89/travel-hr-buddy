import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === "POST") {
      const { query, match_threshold = 0.7, match_count = 10 } = await req.json();

      if (!query || typeof query !== "string") {
        return new Response(
          JSON.stringify({ error: "Query text is required" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      if (!openaiApiKey) {
        return new Response(
          JSON.stringify({ error: "OpenAI API key not configured" }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      // Generate embedding using OpenAI
      const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-ada-002",
          input: query,
        }),
      });

      if (!embeddingResponse.ok) {
        const error = await embeddingResponse.text();
        console.error("OpenAI API error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to generate embedding" }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data[0].embedding;

      // Call the match_mmi_jobs function
      const { data: similarJobs, error: matchError } = await supabase.rpc(
        "match_mmi_jobs",
        {
          query_embedding: embedding,
          match_threshold: match_threshold,
          match_count: match_count,
        }
      );

      if (matchError) {
        console.error("Match error:", matchError);
        return new Response(
          JSON.stringify({ error: "Failed to find similar jobs", details: matchError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      return new Response(
        JSON.stringify({
          data: similarJobs || [],
          meta: {
            query,
            match_threshold,
            match_count,
            results_count: similarJobs?.length || 0,
            timestamp: new Date().toISOString(),
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (req.method === "GET") {
      // Return API documentation/status
      return new Response(
        JSON.stringify({
          endpoint: "/mmi-jobs-similar",
          version: "1.0.0",
          description: "Find similar MMI maintenance jobs using AI-powered semantic search",
          methods: {
            POST: {
              description: "Search for similar jobs based on text query",
              body: {
                query: "string (required) - Text description to search for similar jobs",
                match_threshold: "float (optional, default: 0.7) - Minimum similarity threshold (0-1)",
                match_count: "int (optional, default: 10) - Maximum number of results to return"
              },
              example: {
                query: "hydraulic system maintenance",
                match_threshold: 0.7,
                match_count: 5
              }
            }
          },
          status: "operational",
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
