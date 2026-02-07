import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * M006 - Multi-Modal AI (Vision + Text)
 * Analyzes equipment photos, documents, and maritime imagery
 * Uses Lovable AI Gateway with Gemini Vision
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VisionRequest {
  type: "equipment_inspection" | "document_ocr" | "damage_assessment" | "safety_check";
  imageBase64: string;
  mimeType?: string;
  equipmentId?: string;
  vesselId?: string;
  context?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, imageBase64, mimeType, equipmentId, vesselId, context } =
      (await req.json()) as VisionRequest;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "imageBase64 is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompts: Record<string, string> = {
      equipment_inspection: `Você é um engenheiro naval especialista em inspeções de equipamentos marítimos.
Analise esta imagem de equipamento e forneça em JSON:
{
  "condition": "good|fair|poor|critical",
  "severity": 1-10,
  "findings": [{"description": "...", "location": "...", "urgency": "low|medium|high|critical"}],
  "corrosion_detected": true/false,
  "leak_detected": true/false,
  "wear_level": "none|light|moderate|severe",
  "safety_concerns": ["..."],
  "recommended_actions": ["..."],
  "estimated_repair_hours": number,
  "maintenance_priority": "routine|preventive|corrective|emergency"
}`,
      document_ocr: `Você é um especialista em documentos marítimos.
Extraia TODAS informações desta imagem de documento marítimo em JSON:
{
  "document_type": "certificate|report|logbook|permit|contract|other",
  "title": "...",
  "issuing_authority": "...",
  "issue_date": "YYYY-MM-DD",
  "expiry_date": "YYYY-MM-DD",
  "vessel_name": "...",
  "imo_number": "...",
  "key_fields": [{"field": "...", "value": "..."}],
  "compliance_status": "valid|expiring|expired",
  "extracted_text": "...",
  "confidence": 0.0-1.0
}`,
      damage_assessment: `Você é um perito marítimo especialista em avaliação de danos.
Analise esta imagem de dano/avaria e forneça em JSON:
{
  "damage_type": "structural|mechanical|corrosion|impact|fire|water|electrical",
  "severity": 1-10,
  "affected_area_m2": number,
  "structural_integrity": "intact|compromised|critical",
  "immediate_risk": true/false,
  "root_cause_hypothesis": "...",
  "repair_method": "...",
  "estimated_cost_usd": number,
  "class_notification_required": true/false,
  "operational_impact": "none|minor|major|vessel_detained",
  "photos_needed": ["additional angles needed"],
  "recommendations": ["..."]
}`,
      safety_check: `Você é um oficial de segurança marítima (ISPS/ISM).
Analise esta imagem para riscos de segurança e forneça em JSON:
{
  "safety_score": 1-10,
  "hazards_found": [{"hazard": "...", "risk_level": "low|medium|high|critical", "regulation": "SOLAS/ISM/ISPS ref"}],
  "ppe_compliance": true/false,
  "fire_risks": ["..."],
  "slip_trip_fall_risks": ["..."],
  "housekeeping_score": 1-10,
  "corrective_actions": [{"action": "...", "priority": "immediate|24h|7days|30days"}],
  "regulatory_violations": ["..."],
  "positive_observations": ["..."]
}`,
    };

    const systemPrompt = systemPrompts[type] || systemPrompts.equipment_inspection;
    const userContent = context
      ? `Analise esta imagem. Contexto adicional: ${context}${equipmentId ? `. Equipment ID: ${equipmentId}` : ""}${vesselId ? `. Vessel ID: ${vesselId}` : ""}`
      : `Analise esta imagem completamente.${equipmentId ? ` Equipment ID: ${equipmentId}` : ""}${vesselId ? ` Vessel ID: ${vesselId}` : ""}`;

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
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`,
                },
              },
              { type: "text", text: userContent },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("Vision AI error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Vision AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    // Try to parse JSON from the response
    let analysis: Record<string, unknown> = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      }
    } catch {
      analysis = { raw_analysis: content };
    }

    console.log(`Vision AI [${type}]: Analysis complete`, {
      equipmentId,
      vesselId,
      severity: analysis.severity,
    });

    return new Response(
      JSON.stringify({
        type,
        analysis,
        raw: content,
        model: "gemini-2.5-flash",
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Vision AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
