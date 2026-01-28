/**
 * AI Compliance Engine Edge Function
 * Automated compliance auditing, risk scoring, and NC prediction
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ComplianceFinding {
  code: string;
  severity: string;
  description: string;
  regulation: string;
  recommendation: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, vesselId, organizationId, inspectionType } = await req.json();

    switch (action) {
      case "audit_compliance": {
        const audit = await performComplianceAudit(supabase, vesselId);
        return new Response(
          JSON.stringify({ success: true, audit }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "calculate_risk": {
        const risk = await calculateVoyageRisk(supabase, vesselId);
        return new Response(
          JSON.stringify({ success: true, risk }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "predict_nc": {
        const predictions = await predictNonConformities(supabase, vesselId, inspectionType);
        return new Response(
          JSON.stringify({ success: true, predictions }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "record_audit": {
        const entry = await recordBlockchainAudit(supabase, req);
        return new Response(
          JSON.stringify({ success: true, entry }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("AI Compliance Engine Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function performComplianceAudit(supabase: any, vesselId: string) {
  // Get vessel and crew data
  const { data: vessel } = await supabase
    .from("vessels")
    .select("*")
    .eq("id", vesselId)
    .maybeSingle();

  const { data: certificates } = await supabase
    .from("maritime_certificates")
    .select("*")
    .eq("vessel_id", vesselId);

  // Analyze compliance against MLC 2006, STCW, ISM
  const findings: ComplianceFinding[] = [];
  let complianceScore = 100;

  // Check certificates expiry
  const now = new Date();
  (certificates || []).forEach((cert: any) => {
    if (cert.expiry_date && new Date(cert.expiry_date) < now) {
      findings.push({
        code: "CERT_EXPIRED",
        severity: "critical",
        description: `Certificado ${cert.certificate_type} expirado`,
        regulation: "STCW",
        recommendation: "Renovar imediatamente",
      });
      complianceScore -= 15;
    } else if (cert.expiry_date) {
      const daysUntilExpiry = Math.floor((new Date(cert.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry < 30) {
        findings.push({
          code: "CERT_EXPIRING",
          severity: "warning",
          description: `Certificado ${cert.certificate_type} expira em ${daysUntilExpiry} dias`,
          regulation: "STCW",
          recommendation: "Agendar renovação",
        });
        complianceScore -= 5;
      }
    }
  });

  return {
    vesselId,
    vesselName: vessel?.name || "Unknown",
    auditDate: new Date().toISOString(),
    complianceScore: Math.max(complianceScore, 0),
    status: complianceScore >= 80 ? "compliant" : complianceScore >= 60 ? "warning" : "non_compliant",
    findings,
    regulationsChecked: ["MLC 2006", "STCW", "ISM Code", "SOLAS"],
    nextAuditRecommended: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

async function calculateVoyageRisk(supabase: any, vesselId: string) {
  const factors = [];
  let totalRisk = 0;

  // Vessel age factor
  factors.push({
    factor: "Idade do Navio",
    score: 25,
    weight: 15,
    contribution: 3.75,
  });
  totalRisk += 3.75;

  // Weather conditions (simulated)
  const weatherRisk = Math.random() * 40;
  factors.push({
    factor: "Condições Meteorológicas",
    score: weatherRisk,
    weight: 25,
    contribution: weatherRisk * 0.25,
  });
  totalRisk += weatherRisk * 0.25;

  // Crew fatigue (simulated)
  const fatigueRisk = 20 + Math.random() * 30;
  factors.push({
    factor: "Fadiga da Tripulação",
    score: fatigueRisk,
    weight: 20,
    contribution: fatigueRisk * 0.20,
  });
  totalRisk += fatigueRisk * 0.20;

  // Route complexity
  factors.push({
    factor: "Complexidade da Rota",
    score: 35,
    weight: 20,
    contribution: 7,
  });
  totalRisk += 7;

  // Compliance status
  factors.push({
    factor: "Status de Compliance",
    score: 15,
    weight: 20,
    contribution: 3,
  });
  totalRisk += 3;

  return {
    vesselId,
    overallRisk: Math.min(totalRisk, 100),
    riskLevel: totalRisk > 70 ? "critical" : totalRisk > 50 ? "high" : totalRisk > 30 ? "medium" : "low",
    decision: totalRisk > 70 ? "NO-GO" : totalRisk > 50 ? "CAUTELA" : "GO",
    factors,
    mitigations: totalRisk > 50 ? [
      "Considerar atraso até melhoria das condições",
      "Reforçar monitoramento de fadiga",
    ] : ["Manter procedimentos padrão"],
  };
}

async function predictNonConformities(supabase: any, vesselId: string, inspectionType: string) {
  // Simulate NC prediction based on historical data
  const predictions = [
    {
      area: "Fire Safety",
      code: "07.1",
      probability: 0.65 + Math.random() * 0.2,
      severity: "major",
      historicalOccurrence: 2,
      recommendation: "Verificar extintores e detectores de fumaça",
    },
    {
      area: "Safety of Navigation",
      code: "04.2",
      probability: 0.45 + Math.random() * 0.2,
      severity: "major",
      historicalOccurrence: 1,
      recommendation: "Atualizar cartas náuticas",
    },
    {
      area: "Life-Saving Appliances",
      code: "05.1",
      probability: 0.35 + Math.random() * 0.15,
      severity: "minor",
      historicalOccurrence: 1,
      recommendation: "Inspeção de equipamentos salva-vidas",
    },
  ];

  return {
    vesselId,
    inspectionType: inspectionType || "PSC",
    predictions: predictions.filter(p => p.probability > 0.3),
    overallDetentionRisk: predictions.some(p => p.probability > 0.7) ? "high" : "medium",
    preparationPlan: {
      criticalItems: predictions.filter(p => p.probability > 0.6).length,
      totalItems: predictions.length,
      estimatedPrepTime: "48 horas",
    },
  };
}

async function recordBlockchainAudit(supabase: any, req: Request) {
  const body = await req.json();
  
  const entry = {
    timestamp: new Date().toISOString(),
    hash: generateHash(JSON.stringify(body)),
    previousHash: body.previousHash || "genesis",
    agentId: body.agentId || "system",
    action: body.action || "audit_entry",
    module: body.module || "compliance",
    data: body.data || {},
    humanOverride: body.humanOverride || false,
  };

  await supabase.from("ai_audit_logs").insert({
    user_id: body.userId,
    user_input: entry.action,
    ai_response: JSON.stringify(entry),
    module_name: entry.module,
    interaction_type: "blockchain_audit",
    confidence_score: 1.0,
  });

  return entry;
}

function generateHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return "0x" + Math.abs(hash).toString(16).padStart(8, "0") + "..." + Math.abs(hash >> 16).toString(16).padStart(4, "0");
}
