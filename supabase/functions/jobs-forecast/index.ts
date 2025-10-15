import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JobsForecastRequest {
  trend: Array<{
    month: string;
    jobsCompleted: number;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trend }: JobsForecastRequest = await req.json();
    
    if (!trend || !Array.isArray(trend)) {
      return new Response(
        JSON.stringify({ error: "Trend data is required and must be an array" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    console.log("Generating jobs forecast for trend data:", trend);

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
            content: "Você é uma IA de manutenção preditiva. Analise tendências mensais de jobs finalizados para prever picos futuros e sugerir ações."
          },
          {
            role: "user",
            content: `Aqui estão os dados dos últimos meses:
${JSON.stringify(trend, null, 2)}

Gere uma previsão para os próximos 2 meses e recomende ações técnicas preventivas.`
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

    const data = await response.json();
    const forecast = data.choices[0].message.content;

    console.log("Jobs forecast generated successfully");

    return new Response(
      JSON.stringify({ forecast }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (err: unknown) {
    console.error("Error generating jobs forecast:", err);
    return new Response(
      JSON.stringify({ 
        error: err instanceof Error ? err.message : "Erro ao gerar previsão com IA."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
