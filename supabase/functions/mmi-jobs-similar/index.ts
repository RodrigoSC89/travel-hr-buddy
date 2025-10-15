import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Check for required environment variables
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase configuration not found");
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    let embeddingText = "";
    let querySource = "";
    let matchThreshold = 0.78;
    let matchCount = 5;

    // Handle POST request with query text
    if (req.method === "POST") {
      const body = await req.json();
      const query = body.query;
      
      if (!query || typeof query !== "string") {
        return new Response(
          JSON.stringify({ error: "Missing or invalid 'query' parameter in request body" }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      embeddingText = query.trim();
      querySource = "query";
      matchThreshold = body.match_threshold || 0.78;
      matchCount = body.match_count || 5;
    }
    // Handle GET request with jobId
    else if (req.method === "GET") {
      const url = new URL(req.url);
      const jobId = url.searchParams.get("jobId");

      if (!jobId) {
        return new Response(
          JSON.stringify({ error: "Missing jobId parameter" }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      // Fetch the job from database
      const { data: job, error: jobError } = await supabase
        .from("mmi_jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (jobError || !job) {
        return new Response(
          JSON.stringify({ error: "Job not found" }),
          { 
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      embeddingText = `${job.title} ${job.description || ""}`.trim();
      querySource = jobId;
    }
    else {
      return new Response(
        JSON.stringify({ error: "Method not allowed. Use GET or POST" }),
        { 
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Generate embedding using OpenAI
    const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: embeddingText,
        model: "text-embedding-ada-002"
      }),
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${embeddingResponse.statusText}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    // Call the match_mmi_jobs RPC function to find similar jobs
    const { data: matches, error: matchError } = await supabase.rpc("match_mmi_jobs", {
      query_embedding: embedding,
      match_threshold: matchThreshold,
      match_count: matchCount
    });

    if (matchError) {
      console.error("Error matching jobs:", matchError);
      throw new Error(`Error finding similar jobs: ${matchError.message}`);
    }

    // Filter out the current job from results if querying by jobId
    const filteredMatches = req.method === "GET" 
      ? (matches || []).filter((match: any) => match.id !== querySource)
      : (matches || []);

    const response = req.method === "POST" 
      ? {
          data: filteredMatches,
          meta: {
            query: embeddingText,
            results_count: filteredMatches.length,
            timestamp: new Date().toISOString()
          }
        }
      : {
          success: true,
          job_id: querySource,
          similar_jobs: filteredMatches,
          count: filteredMatches.length
        };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in mmi-jobs-similar function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
