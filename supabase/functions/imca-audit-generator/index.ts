import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// IMCA standards reference
const IMCA_STANDARDS = [
  "IMCA M103 - Guidelines for the Design and Operation of Dynamically Positioned Vessels",
  "IMCA M117 - The Training and Experience of Key DP Personnel",
  "IMCA M190 - Guidance on Failure Modes and Effects Analyses (FMEAs)",
  "IMCA M166 - Guidance on Simultaneous Operations (SIMOPS)",
  "IMCA M109 - Specification for DP Capability Plots",
  "IMCA M220 - Guidance on DP Electrical Power and Control Systems",
  "IMCA M140 - Specification for DP Operations",
  "MSF 182 - Marine Safety Forum DP Operations",
  "MTS DP - Vessel Design Philosophy Guidelines",
  "IMO MSC.1/Circ.1580 - Guidelines for Vessels with Dynamic Positioning Systems"
];

// DP system modules to evaluate
const DP_MODULES = [
  "DP Control System",
  "Propulsion System",
  "Power Generation System",
  "Position Reference Sensors",
  "Environmental Sensors",
  "Communications & Alarms",
  "Personnel Competence",
  "FMEA & Trials",
  "Annual DP Trials",
  "Documentation & Records",
  "Planned Maintenance System",
  "Capability Plots",
  "Operational Planning"
];

function generatePrompt(input: any): string {
  return `You are an expert IMCA DP (Dynamic Positioning) technical auditor conducting a comprehensive audit of a DP vessel.

**Vessel Information:**
- Vessel Name: ${input.vesselName}
- DP Class: ${input.dpClass}
- Location: ${input.location}
- Audit Objective: ${input.auditObjective}

${input.operationalData?.incidentDetails ? `**Incident Details:**\n${input.operationalData.incidentDetails}\n` : ''}
${input.operationalData?.environmentalConditions ? `**Environmental Conditions:**\n${input.operationalData.environmentalConditions}\n` : ''}
${input.operationalData?.systemStatus ? `**System Status:**\n${input.operationalData.systemStatus}\n` : ''}
${input.operationalData?.crewQualifications ? `**Crew Qualifications:**\n${input.operationalData.crewQualifications}\n` : ''}
${input.operationalData?.maintenanceHistory ? `**Maintenance History:**\n${input.operationalData.maintenanceHistory}\n` : ''}

**Standards to Apply:**
${IMCA_STANDARDS.map(s => `- ${s}`).join('\n')}

**Modules to Evaluate:**
${DP_MODULES.map(m => `- ${m}`).join('\n')}

Generate a comprehensive IMCA DP Technical Audit Report in Portuguese that includes:

1. **Overall Score** (0-100) based on compliance with international standards
2. **Standards Applied**: List all 10 standards
3. **Module Evaluations**: For each of the 13 modules, provide:
   - Score (0-100)
   - Compliance Status (Compliant/Partial/Non-Compliant)
   - Key findings (2-3 points)
   - Recommendations (2-3 points)
4. **Non-Conformities**: Identify 3-8 specific non-conformities with:
   - Module affected
   - Risk level (Alto/Médio/Baixo)
   - Standard violated
   - Finding description
   - Recommendation
5. **Action Plan**: Create 5-12 prioritized action items with:
   - Priority (Crítico/Alto/Médio/Baixo)
   - Description
   - Responsible party (e.g., DPO, Chief Engineer, Onshore Engineering)
   - Related non-conformity
6. **Summary**: 2-3 paragraph executive summary
7. **Conclusion**: Final assessment and key recommendations

Return ONLY a valid JSON object with this exact structure (NO markdown, NO code blocks, NO explanations):
{
  "overallScore": <number>,
  "standards": [{"code": "<code>", "name": "<name>", "description": "<desc>"}, ...],
  "moduleEvaluations": [{"moduleName": "<name>", "score": <number>, "complianceStatus": "<status>", "findings": ["<finding>", ...], "recommendations": ["<rec>", ...]}, ...],
  "nonConformities": [{"id": "<uuid>", "module": "<module>", "description": "<desc>", "riskLevel": "<level>", "standard": "<standard>", "finding": "<finding>", "recommendation": "<rec>"}, ...],
  "actionPlan": [{"id": "<uuid>", "priority": "<priority>", "description": "<desc>", "responsibleParty": "<party>", "relatedNonConformity": "<nc-id>"}, ...],
  "summary": "<summary>",
  "conclusion": "<conclusion>"
}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const input = await req.json();

    const prompt = generatePrompt(input);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert IMCA DP technical auditor. You always respond with valid JSON only, no markdown or code blocks."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${JSON.stringify(data)}`);
    }

    let auditData;
    try {
      const content = data.choices[0].message.content.trim();
      // Remove markdown code blocks if present
      const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      auditData = JSON.parse(jsonContent);
    } catch (e) {
      console.error("Failed to parse AI response:", data.choices[0].message.content);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Build the full report
    const report = {
      id: crypto.randomUUID(),
      vesselName: input.vesselName,
      dpClass: input.dpClass,
      location: input.location,
      auditObjective: input.auditObjective,
      auditDate: new Date().toISOString(),
      overallScore: auditData.overallScore,
      standards: auditData.standards,
      moduleEvaluations: auditData.moduleEvaluations,
      nonConformities: auditData.nonConformities,
      actionPlan: auditData.actionPlan.map((action: any) => {
        // Calculate deadline based on priority
        const daysMap: Record<string, number> = {
          "Crítico": 7,
          "Alto": 30,
          "Médio": 90,
          "Baixo": 180,
        };
        const days = daysMap[action.priority] || 30;
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + days);
        
        return {
          ...action,
          deadline: deadline.toISOString(),
        };
      }),
      operationalData: input.operationalData,
      summary: auditData.summary,
      conclusion: auditData.conclusion,
    };

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in imca-audit-generator:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
