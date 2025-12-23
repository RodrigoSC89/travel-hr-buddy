import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

interface JobsByComponentTrend {
  [componentId: string]: string[]; // Array of YYYY-MM strings
}

interface JobRecord {
  component_id: string;
  completed_date: string;
}

interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

let supabase: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting jobs-forecast-by-component function");

    // Check if Supabase client is available
    if (!supabase) {
      throw new Error("Supabase client not initialized - missing environment variables");
    }

    // Calculate date 180 days ago
    const date180DaysAgo = new Date();
    date180DaysAgo.setDate(date180DaysAgo.getDate() - 180);
    const cutoffDate = date180DaysAgo.toISOString().split('T')[0];

    console.log(`Querying completed jobs since ${cutoffDate}`);

    // Query completed jobs from the last 180 days
    const { data: jobs, error: jobsError } = await supabase
      .from("mmi_jobs")
      .select("component_id, completed_date")
      .eq("status", "completed")
      .gte("completed_date", cutoffDate)
      .not("component_id", "is", null);

    if (jobsError) {
      console.error("Database query error:", jobsError);
      throw new Error(`Database error: ${jobsError.message}`);
    }

    console.log(`Found ${jobs?.length || 0} completed jobs in the last 180 days`);

    // If no jobs found, return early with a message
    if (!jobs || jobs.length === 0) {
      return new Response(
        JSON.stringify({
          forecast: "Não há dados históricos suficientes para gerar uma previsão. Nenhum job foi completado nos últimos 180 dias.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Group jobs by component_id and extract monthly trends
    const trendByComponent: JobsByComponentTrend = {};
    
    (jobs as JobRecord[]).forEach((job) => {
      if (!job.component_id || !job.completed_date) return;
      
      // Extract YYYY-MM format from completed_date
      const month = job.completed_date.slice(0, 7);
      
      if (!trendByComponent[job.component_id]) {
        trendByComponent[job.component_id] = [];
      }
      trendByComponent[job.component_id].push(month);
    });

    console.log(`Grouped data by ${Object.keys(trendByComponent).length} components`);

    // Get Lovable AI API key
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build prompt for AI
    const prompt = `Você é uma IA de manutenção. Abaixo estão os dados de jobs por componente (por mês):

${JSON.stringify(trendByComponent, null, 2)}

Gere uma previsão dos próximos dois meses por componente e indique os mais críticos.`;

    console.log("Calling Lovable AI Gateway for forecast generation");

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Você é uma IA técnica de manutenção embarcada, especializada em previsão por criticidade.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status} - ${errorText}`);
    }

    const data: AIResponse = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from AI Gateway");
    }
    
    const forecast = data.choices[0].message.content;

    console.log("Forecast generated successfully");

    return new Response(
      JSON.stringify({ forecast }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in jobs-forecast-by-component function:", error);
    
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
