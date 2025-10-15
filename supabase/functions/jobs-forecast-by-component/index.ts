import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get OpenAI API key
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    console.log("Fetching completed jobs from the last 180 days...");

    // Fetch completed jobs from the last 180 days
    const { data, error } = await supabase
      .from("mmi_jobs")
      .select("component_id, completed_date")
      .eq("status", "completed")
      .gte("completed_date", new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString().split('T')[0])
      .not("component_id", "is", null)
      .not("completed_date", "is", null);

    if (error) {
      console.error("Database error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Found ${data?.length || 0} completed jobs`);

    // Group jobs by component_id and extract months
    const trendByComponent: Record<string, string[]> = {};
    (data || []).forEach((job: any) => {
      const month = job.completed_date.slice(0, 7); // Extract YYYY-MM format
      if (!trendByComponent[job.component_id]) {
        trendByComponent[job.component_id] = [];
      }
      trendByComponent[job.component_id].push(month);
    });

    console.log(`Grouped jobs by ${Object.keys(trendByComponent).length} components`);

    // Prepare prompt for OpenAI
    const prompt = `Você é uma IA de manutenção. Abaixo estão os dados de jobs por componente (por mês):

${JSON.stringify(trendByComponent, null, 2)}

Gere uma previsão dos próximos dois meses por componente e indique os mais críticos.`;

    console.log("Calling OpenAI API for forecast...");

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é uma IA técnica de manutenção embarcada, especializada em previsão por criticidade."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const completion = await response.json();
    const forecast = completion.choices[0].message.content;

    console.log("Forecast generated successfully");

    return new Response(
      JSON.stringify({ forecast }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error("Error in jobs-forecast-by-component:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
