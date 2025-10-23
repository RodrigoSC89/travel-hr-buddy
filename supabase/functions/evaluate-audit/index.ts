/**
 * Evaluate Audit Edge Function
 * PATCH 62.0 - AI-powered audit evaluation using Lovable AI Gateway
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// @ts-ignore: Deno is available in edge runtime
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { checklistData, auditType, auditId, prompt } = await req.json();
    
    console.log(`[evaluate-audit] Starting evaluation for ${auditType} audit ${auditId}`);

    // Get Lovable AI API key from environment
    // @ts-ignore: Deno is available in edge runtime
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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
            content: `You are a maritime compliance expert specializing in IMCA, ISM Code, and ISPS regulations. 
Analyze audit checklists and provide clear, actionable feedback on compliance status, 
critical issues, and recommendations for improvement. Always reference specific regulation sections.
Return your response as valid JSON only, no markdown formatting.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[evaluate-audit] AI gateway error:`, response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log(`[evaluate-audit] AI response received`);

    // Parse JSON response
    let parsedResponse;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      parsedResponse = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error(`[evaluate-audit] Failed to parse AI response:`, content);
      
      // Return structured fallback
      parsedResponse = {
        overall_compliance: 75,
        critical_issues: ["Unable to parse AI response completely"],
        warnings: ["AI response format needs review"],
        recommendations: ["Review audit manually", "Ensure all items are properly marked"],
        next_steps: ["Complete missing checklist items", "Upload evidence documents"],
        summary: "AI evaluation completed with parsing issues. Manual review recommended."
      };
    }

    console.log(`[evaluate-audit] Evaluation completed successfully`);

    return new Response(
      JSON.stringify(parsedResponse),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );

  } catch (error) {
    console.error(`[evaluate-audit] Error:`, error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: "Failed to evaluate audit with AI"
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
