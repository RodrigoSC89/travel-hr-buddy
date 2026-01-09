import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, cvText, jobRequirements, candidateData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "parse_cv":
        systemPrompt = `You are an expert maritime HR AI specialized in crew recruitment for the shipping industry.
        Your task is to parse CV/resume text and extract structured data relevant to maritime positions.
        Focus on: certifications (STCW, MLC, COC), sea service experience, vessel types, ranks held, languages, and special skills.
        Return a JSON object with: name, email, phone, currentRank, targetRank, experience (years), certifications (array), 
        vesselTypes (array), languages (array), skills (array), matchScore (0-100), and summary.`;
        userPrompt = `Parse this CV for maritime recruitment:\n\n${cvText}`;
        break;

      case "match_candidate":
        systemPrompt = `You are an AI recruiter for maritime positions. Analyze candidate fit against job requirements.
        Consider: certifications match, experience level, vessel type familiarity, language requirements, and availability.
        Provide a match score (0-100), strengths, gaps, and recommendation.`;
        userPrompt = `Job Requirements:\n${JSON.stringify(jobRequirements)}\n\nCandidate Profile:\n${JSON.stringify(candidateData)}`;
        break;

      case "generate_interview":
        systemPrompt = `You are a maritime HR expert. Generate tailored interview questions for seafarer candidates.
        Focus on technical competence, safety awareness, teamwork, stress management, and regulatory knowledge.
        Return 10 questions categorized by: technical, behavioral, safety, and situational.`;
        userPrompt = `Generate interview questions for:\nPosition: ${candidateData.targetRank}\nVessel Type: ${candidateData.vesselType}\nExperience: ${candidateData.experience} years`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Try to parse JSON from response
    let result;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : { text: content };
    } catch {
      result = { text: content };
    }

    console.log(`AI Recruitment [${action}] completed successfully`);

    return new Response(JSON.stringify({ success: true, result, action }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("AI Recruitment error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
