import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CVParseRequest {
  cv_text: string;
  job_opening_id?: string;
  candidate_name?: string;
  candidate_email?: string;
}

interface ParsedCV {
  full_name: string;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  experience_years: number;
  current_employer: string | null;
  position_applied: string | null;
  rank: string | null;
  certifications: Array<{
    name: string;
    expiry: string | null;
    issuer: string | null;
    number: string | null;
  }>;
  training_records: Array<{
    course: string;
    date: string | null;
    institution: string | null;
  }>;
  skills: string[];
  languages: Array<{ language: string; level: string }>;
  sea_experience: Array<{
    vessel_name: string;
    vessel_type: string;
    rank: string;
    period: string;
    company: string | null;
  }>;
  ai_strengths: string[];
  ai_weaknesses: string[];
  ai_recommendation: string;
  match_score: number;
  confidence: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cv_text, job_opening_id, candidate_name, candidate_email } = await req.json() as CVParseRequest;

    if (!cv_text || cv_text.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "CV text is required and must be at least 50 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get job requirements if job_opening_id provided
    let jobRequirements = "";
    if (job_opening_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: job } = await supabase
        .from("job_openings")
        .select("*")
        .eq("id", job_opening_id)
        .single();
      
      if (job) {
        jobRequirements = `
JOB REQUIREMENTS FOR MATCHING:
- Position: ${job.title}
- Rank: ${job.rank}
- Required Certifications: ${JSON.stringify(job.required_certifications)}
- Minimum Experience: ${job.min_experience_years} years
- Required Skills: ${JSON.stringify(job.required_skills)}
- Description: ${job.description || "N/A"}
`;
      }
    }

    const systemPrompt = `You are an expert Maritime HR CV Parser specialized in analyzing seafarer CVs and resumes.

Your task is to extract structured information from maritime professional CVs with high accuracy.

IMPORTANT MARITIME CERTIFICATIONS TO LOOK FOR:
- STCW (Standards of Training, Certification and Watchkeeping)
- COC (Certificate of Competency) - with endorsements
- GMDSS (Global Maritime Distress and Safety System)
- Medical Fitness Certificate
- Security Awareness Training
- Ship Security Officer (SSO)
- Designated Security Duties (DSD)
- Basic Safety Training (BST)
- Advanced Firefighting
- Medical First Aid / Medical Care
- Survival Craft and Rescue Boats
- Oil/Chemical/Gas Tanker endorsements
- Dynamic Positioning (DP) certificates
- HUET (Helicopter Underwater Escape Training)

RANKS TO RECOGNIZE:
- Deck: Master, Chief Officer, 2nd Officer, 3rd Officer, Deck Cadet, Bosun, AB, OS
- Engine: Chief Engineer, 2nd Engineer, 3rd Engineer, 4th Engineer, ETO, Motorman, Wiper, Fitter
- Catering: Chief Cook, Cook, Messman, Steward
- Others: Radio Officer, Electrician

${jobRequirements}

OUTPUT FORMAT: Return ONLY valid JSON matching this exact structure:
{
  "full_name": "string",
  "email": "string or null",
  "phone": "string or null",
  "nationality": "string or null",
  "experience_years": number,
  "current_employer": "string or null",
  "position_applied": "string or null",
  "rank": "string or null",
  "certifications": [{"name": "string", "expiry": "YYYY-MM-DD or null", "issuer": "string or null", "number": "string or null"}],
  "training_records": [{"course": "string", "date": "YYYY-MM-DD or null", "institution": "string or null"}],
  "skills": ["string"],
  "languages": [{"language": "string", "level": "string"}],
  "sea_experience": [{"vessel_name": "string", "vessel_type": "string", "rank": "string", "period": "string", "company": "string or null"}],
  "ai_strengths": ["string - 3-5 key strengths"],
  "ai_weaknesses": ["string - areas for improvement"],
  "ai_recommendation": "string - hiring recommendation",
  "match_score": number (0-100 based on job requirements if provided, or general employability),
  "confidence": number (0-100 - confidence in extraction accuracy)
}`;

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
          { role: "user", content: `Parse this CV and extract all relevant information:\n\n${cv_text}` }
        ],
        temperature: 0.1,  // Low temperature for consistent extraction
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
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from AI");
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    let parsedCV: ParsedCV;
    try {
      parsedCV = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      throw new Error("Failed to parse CV data from AI response");
    }

    // Override with provided data if available
    if (candidate_name) {
      parsedCV.full_name = candidate_name;
    }
    if (candidate_email) {
      parsedCV.email = candidate_email;
    }

    // Store in database if we have authorization
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get user's organization
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("organization_id")
            .eq("id", user.id)
            .single();

          if (profile?.organization_id) {
            const { data: candidate, error: insertError } = await supabase
              .from("recruitment_candidates")
              .insert({
                organization_id: profile.organization_id,
                full_name: parsedCV.full_name,
                email: parsedCV.email,
                phone: parsedCV.phone,
                nationality: parsedCV.nationality,
                position_applied: parsedCV.position_applied,
                rank: parsedCV.rank,
                experience_years: parsedCV.experience_years,
                current_employer: parsedCV.current_employer,
                certifications: parsedCV.certifications,
                training_records: parsedCV.training_records,
                cv_parsed_text: cv_text.substring(0, 10000),
                cv_parse_confidence: parsedCV.confidence,
                ai_match_score: parsedCV.match_score,
                ai_strengths: parsedCV.ai_strengths,
                ai_weaknesses: parsedCV.ai_weaknesses,
                ai_recommendation: parsedCV.ai_recommendation,
                pipeline_stage: "new",
                source: "cv_parser"
              })
              .select()
              .single();

            if (!insertError && candidate) {
              parsedCV = { ...parsedCV, candidate_id: candidate.id } as any;
            }
          }
        }
      } catch (dbError) {
        console.error("Database storage error:", dbError);
        // Continue without storing - parsing still succeeded
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        parsed_cv: parsedCV,
        tokens_used: aiResponse.usage?.total_tokens || 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("CV Parser error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});