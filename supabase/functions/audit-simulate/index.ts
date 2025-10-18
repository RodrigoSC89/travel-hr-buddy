import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Audit type standards mapping
const AUDIT_STANDARDS = {
  "Petrobras PEO-DP": {
    name: "Petrobras PEO-DP",
    description: "Dynamic Positioning Operations Requirements",
    categories: ["DP System", "Operations", "Training", "Trials", "Documentation"]
  },
  "IBAMA SGSO": {
    name: "IBAMA SGSO",
    description: "Safety and Environmental Management System",
    categories: ["Policy", "Organization", "Hazard ID", "Operations", "Emergency Response"]
  },
  "IMO ISM Code": {
    name: "IMO ISM Code",
    description: "International Safety Management Code",
    categories: ["Policy", "Management", "Resources", "Operations", "Monitoring", "Maintenance"]
  },
  "IMO MODU Code": {
    name: "IMO MODU Code",
    description: "Mobile Offshore Drilling Units Code",
    categories: ["General", "Stability", "Fire Safety", "Life-Saving", "Communications"]
  },
  "ISO 9001": {
    name: "ISO 9001",
    description: "Quality Management Systems",
    categories: ["Context", "Leadership", "Planning", "Support", "Operation", "Performance", "Improvement"]
  },
  "ISO 14001": {
    name: "ISO 14001",
    description: "Environmental Management Systems",
    categories: ["Context", "Leadership", "Planning", "Support", "Operation", "Performance", "Improvement"]
  },
  "ISO 45001": {
    name: "ISO 45001",
    description: "Occupational Health and Safety Management",
    categories: ["Context", "Leadership", "Planning", "Support", "Operation", "Performance", "Improvement"]
  },
  "IMCA": {
    name: "IMCA",
    description: "International Marine Contractors Association Standards",
    categories: ["DP Operations", "Design Philosophy", "FMEA", "Trials", "Personnel"]
  }
};

function generatePrompt(auditType: string, vesselData: any): string {
  const standard = AUDIT_STANDARDS[auditType as keyof typeof AUDIT_STANDARDS];
  
  return `You are an expert technical auditor conducting a comprehensive ${auditType} audit for a maritime vessel.

**Vessel Information:**
- Vessel Name: ${vesselData.name || 'N/A'}
- Type: ${vesselData.vessel_type || 'N/A'}
- Flag State: ${vesselData.flag_state || 'N/A'}
- IMO Number: ${vesselData.imo_number || 'N/A'}

${vesselData.incidents ? `**Recent Incidents (last 90 days):**
${vesselData.incidents.map((inc: any) => `- ${inc.type}: ${inc.description} (Severity: ${inc.severity})`).join('\n')}
` : ''}

${vesselData.practices ? `**Safety Practices:**
${vesselData.practices.map((p: any) => `- ${p.name}: Status ${p.status}`).join('\n')}
` : ''}

**Audit Standard:**
${standard.name} - ${standard.description}

**Categories to Evaluate:**
${standard.categories.map(c => `- ${c}`).join('\n')}

Generate a comprehensive audit report in JSON format with the following structure:

{
  "conformities": [
    {
      "clause": "clause reference",
      "description": "what is compliant"
    }
  ],
  "non_conformities": [
    {
      "clause": "clause reference",
      "description": "what is non-compliant",
      "severity": "critical|major|minor|observation",
      "recommendation": "how to fix it"
    }
  ],
  "scores": [
    {
      "norm": "category name",
      "score": 85,
      "maxScore": 100
    }
  ],
  "technical_report": "detailed technical analysis (2-3 paragraphs)",
  "action_plan": [
    "prioritized action item 1",
    "prioritized action item 2",
    ...
  ]
}

Requirements:
- Identify 5-15 conformities (compliant items)
- Identify 3-10 non-conformities with appropriate severity levels
- Provide scores for each category (0-100)
- Generate a comprehensive technical report
- Create 5-12 prioritized action items
- All text should be in Portuguese (Brazil)
- Be realistic and based on international maritime standards
- Consider the vessel's incident history and safety practices

Return ONLY the JSON object, no other text.`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vessel_id, audit_type } = await req.json();

    if (!audit_type) {
      throw new Error("audit_type is required");
    }

    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get current user and organization
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Get user's organization
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!profile?.organization_id) {
      throw new Error("User organization not found");
    }

    // Fetch vessel data if vessel_id provided
    let vesselData: any = { name: "General Fleet" };
    
    if (vessel_id) {
      const { data: vessel, error: vesselError } = await supabaseClient
        .from("vessels")
        .select("*")
        .eq("id", vessel_id)
        .single();

      if (vesselError) {
        console.warn("Vessel not found:", vesselError);
      } else {
        vesselData = vessel;

        // Fetch recent incidents
        const { data: incidents } = await supabaseClient
          .from("safety_incidents")
          .select("*")
          .eq("vessel_id", vessel_id)
          .gte("incident_date", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
          .order("incident_date", { ascending: false })
          .limit(10);

        vesselData.incidents = incidents || [];

        // Fetch safety practices
        const { data: practices } = await supabaseClient
          .from("sgso_practices")
          .select("*")
          .eq("vessel_id", vessel_id)
          .limit(20);

        vesselData.practices = practices || [];
      }
    }

    // Generate audit using OpenAI
    const prompt = generatePrompt(audit_type, vesselData);

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert maritime auditor with deep knowledge of international standards and regulations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const openaiData = await openaiResponse.json();
    const auditResult = JSON.parse(openaiData.choices[0].message.content);

    // Save audit result to database
    const { data: savedAudit, error: saveError } = await supabaseClient
      .from("audit_simulations")
      .insert({
        organization_id: profile.organization_id,
        vessel_id: vessel_id || null,
        audit_type: audit_type,
        conformities: auditResult.conformities,
        non_conformities: auditResult.non_conformities,
        scores: auditResult.scores,
        technical_report: auditResult.technical_report,
        action_plan: auditResult.action_plan,
        created_by: user.id,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving audit:", saveError);
      throw new Error(`Failed to save audit: ${saveError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: savedAudit,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in audit-simulate:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
