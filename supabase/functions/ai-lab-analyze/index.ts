/**
 * PATCH 1003 - AI Lab Analyze
 * Edge function for AI-powered data analysis using Lovable AI Gateway
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisRequest {
  type: "summarize" | "analyze" | "extract" | "predict" | "insights" | "custom";
  data: string;
  dataType: "json" | "csv" | "text" | "table";
  customPrompt?: string;
  options?: {
    language?: string;
    format?: "markdown" | "json" | "html";
    maxLength?: number;
  };
}

const ANALYSIS_PROMPTS: Record<string, string> = {
  summarize: `You are a data analyst. Summarize the following data concisely, highlighting the most important points and patterns. Provide a clear executive summary.`,
  analyze: `You are a data analyst. Perform a comprehensive analysis of the following data. Identify trends, patterns, anomalies, and key metrics. Provide actionable insights.`,
  extract: `You are a data extraction specialist. Extract and structure the key information from the following data. Organize it in a clear, structured format.`,
  predict: `You are a predictive analyst. Based on the following data, identify trends and make predictions about future outcomes. Include confidence levels and assumptions.`,
  insights: `You are a business intelligence expert. Generate actionable insights from the following data. Focus on opportunities, risks, and recommendations.`,
  custom: `You are an AI assistant. Analyze the following data according to the user's specific request.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { type, data, dataType, customPrompt, options }: AnalysisRequest = await req.json();

    if (!data) {
      return new Response(
        JSON.stringify({ error: "Data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = type === "custom" && customPrompt 
      ? `${ANALYSIS_PROMPTS.custom}\n\nUser's request: ${customPrompt}`
      : ANALYSIS_PROMPTS[type] || ANALYSIS_PROMPTS.analyze;

    const formatInstruction = options?.format === "json" 
      ? "Respond in valid JSON format."
      : options?.format === "html"
      ? "Respond in HTML format with proper tags."
      : "Respond in Markdown format.";

    const languageInstruction = options?.language 
      ? `Respond in ${options.language}.`
      : "Respond in Portuguese (Brazil).";

    const userPrompt = `
${languageInstruction}
${formatInstruction}

Data Type: ${dataType}
Data:
${data}
`;

    console.log(`[AILab] Processing ${type} analysis for ${dataType} data`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: options?.maxLength || 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    // Log the analysis
    await supabase.from("ai_logs").insert({
      service: "ai-lab-analyze",
      status: "success",
      prompt_hash: `${type}-${Date.now()}`,
      prompt_length: userPrompt.length,
      response_length: content.length,
      model: "google/gemini-2.5-flash",
      tokens_used: aiResponse.usage?.total_tokens || 0,
    });

    console.log(`[AILab] Analysis complete: ${content.length} chars`);

    return new Response(
      JSON.stringify({
        success: true,
        type,
        result: content,
        metadata: {
          dataType,
          format: options?.format || "markdown",
          tokens: aiResponse.usage?.total_tokens || 0,
          model: "google/gemini-2.5-flash",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[AILab] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
