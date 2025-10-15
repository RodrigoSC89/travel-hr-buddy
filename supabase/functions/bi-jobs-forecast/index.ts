import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JobsForecastRequest {
  trend: any[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trend }: JobsForecastRequest = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Generating jobs forecast based on trend data");

    // Fetch historical jobs data for context
    const historicalData = await collectJobsData(supabase);

    // Generate AI forecast using OpenAI
    const systemPrompt = `Você é um especialista em análise preditiva de manutenção e gestão de jobs. 
Baseado nos dados históricos de tendências de jobs fornecidos, gere uma previsão realista para os próximos 2 meses.

Retorne uma resposta em texto natural (não JSON) com:
1. 📊 Previsão quantitativa de jobs para os próximos 2 meses
2. 📈 Tendências esperadas (aumento/redução/estabilidade)
3. 🧠 Recomendações preventivas específicas e acionáveis
4. ⚠️ Pontos de atenção críticos

Use português brasileiro, seja conciso e específico.`;

    const userPrompt = `Analise os seguintes dados de tendência de jobs e gere uma previsão para os próximos 2 meses:

Dados de tendência fornecidos:
${JSON.stringify(trend, null, 2)}

Dados históricos do sistema:
${JSON.stringify(historicalData, null, 2)}

Gere uma previsão clara e acionável em formato de texto.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const forecast = data.choices[0].message.content;

    // Save forecast to database for tracking
    try {
      // Extract first 200 characters as summary
      const summary = forecast.substring(0, 200).trim() + (forecast.length > 200 ? '...' : '');
      
      const { error: saveError } = await supabase
        .from("ai_jobs_forecasts")
        .insert({
          trend_data: trend,
          forecast: forecast,
          forecast_summary: summary,
          source: 'AI',
          created_by: 'bi-jobs-forecast',
        });

      if (saveError) {
        console.error("Error saving forecast:", saveError);
      }
    } catch (saveError) {
      console.log("Forecasts table not available, skipping save");
    }

    console.log("Jobs forecast generated successfully");

    return new Response(JSON.stringify({ 
      success: true,
      forecast: forecast,
      generatedAt: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating jobs forecast:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function collectJobsData(supabase: any) {
  const data: any = {
    collectedAt: new Date().toISOString()
  };

  try {
    // Get jobs statistics from mmi_jobs table
    const { data: jobs, error: jobsError } = await supabase
      .from("mmi_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!jobsError && jobs) {
      data.totalJobs = jobs.length;
      
      // Analyze jobs by status
      data.jobsByStatus = jobs.reduce((acc: any, job: any) => {
        const status = job.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Analyze jobs by component
      data.jobsByComponent = jobs.reduce((acc: any, job: any) => {
        const component = job.component_id || 'unknown';
        acc[component] = (acc[component] || 0) + 1;
        return acc;
      }, {});

      // Calculate recent trends
      const last30Days = jobs.filter((job: any) => 
        new Date(job.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );
      
      const previous30Days = jobs.filter((job: any) => {
        const date = new Date(job.created_at);
        return date >= new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) && 
               date < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      });

      data.recentTrend = {
        last30Days: last30Days.length,
        previous30Days: previous30Days.length,
        percentageChange: previous30Days.length > 0 
          ? ((last30Days.length - previous30Days.length) / previous30Days.length * 100).toFixed(2)
          : 0
      };
    }

  } catch (error) {
    console.error("Error collecting jobs data:", error);
    // Return mock data structure
    data.mock = true;
    data.totalJobs = 0;
    data.jobsByStatus = {};
    data.jobsByComponent = {};
  }

  return data;
}
