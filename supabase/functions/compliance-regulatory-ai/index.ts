/**
 * 📋 Compliance & Regulatory AI - Edge Function
 * Automated compliance, regulatory tracking, PSC preparation
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let result;

    switch (action) {
      case "compliance-check":
        result = await checkCompliance(params, supabase, LOVABLE_API_KEY);
        break;
      case "regulatory-update":
        result = await trackRegulatoryUpdates(params, LOVABLE_API_KEY);
        break;
      case "psc-preparation":
        result = await preparePSC(params, supabase, LOVABLE_API_KEY);
        break;
      case "certificate-tracking":
        result = await trackCertificates(params, supabase, LOVABLE_API_KEY);
        break;
      case "flag-state-requirements":
        result = await getFlagStateRequirements(params, LOVABLE_API_KEY);
        break;
      case "compliance-calendar":
        result = await generateComplianceCalendar(params, supabase, LOVABLE_API_KEY);
        break;
      case "risk-assessment":
        result = await assessComplianceRisk(params, supabase, LOVABLE_API_KEY);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Compliance AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function checkCompliance(
  params: { vesselId?: string; regulations?: string[] },
  supabase: any,
  apiKey: string
): Promise<any> {
  const { data: vessel } = params.vesselId 
    ? await supabase.from("vessels").select("*").eq("id", params.vesselId).single()
    : { data: null };

  const { data: certificates } = await supabase
    .from("maritime_certificates")
    .select("*")
    .limit(50);

  const regulations = params.regulations || ["SOLAS", "MARPOL", "MLC 2006", "STCW", "ISM", "ISPS"];

  const prompt = `You are a maritime compliance expert. Check compliance status.

VESSEL: ${JSON.stringify(vessel)}
CERTIFICATES: ${JSON.stringify(certificates?.slice(0, 20))}
REGULATIONS TO CHECK: ${regulations.join(", ")}

Perform comprehensive compliance check:

Return JSON:
{
  "overallCompliance": 92,
  "status": "compliant|partially_compliant|non_compliant",
  "regulations": [
    {
      "name": "SOLAS",
      "status": "compliant",
      "score": 95,
      "requirements": [
        { "requirement": "Fire safety equipment", "status": "met", "evidence": "Annual survey completed" }
      ],
      "gaps": [],
      "expirations": []
    }
  ],
  "criticalIssues": [
    { "regulation": "string", "issue": "string", "severity": "critical", "deadline": "2025-03-01" }
  ],
  "upcomingDeadlines": [
    { "item": "Annual safety survey", "deadline": "2025-06-15", "daysRemaining": 135, "regulation": "SOLAS" }
  ],
  "recommendations": [
    { "action": "string", "priority": "high", "regulation": "SOLAS", "deadline": "2025-03-01" }
  ],
  "auditReadiness": {
    "score": 88,
    "strengths": ["string"],
    "weaknesses": ["string"]
  },
  "lastChecked": "2025-01-30",
  "nextReview": "2025-04-30",
  "confidence": 90
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    overallCompliance: 0,
    status: "unknown",
    regulations: [],
    criticalIssues: [],
    upcomingDeadlines: [],
    recommendations: [],
    auditReadiness: { score: 0, strengths: [], weaknesses: [] },
    lastChecked: new Date().toISOString(),
    nextReview: null,
    confidence: 50,
  });
}

async function trackRegulatoryUpdates(
  params: { regulations?: string[]; since?: string },
  apiKey: string
): Promise<any> {
  const prompt = `You are a maritime regulatory intelligence expert. Track regulatory updates.

REGULATIONS: ${(params.regulations || ["SOLAS", "MARPOL", "MLC", "STCW"]).join(", ")}
SINCE: ${params.since || "Last 30 days"}

Provide regulatory update intelligence:

Return JSON:
{
  "updates": [
    {
      "regulation": "MARPOL",
      "amendment": "Annex VI - EEXI and CII requirements",
      "effectiveDate": "2023-01-01",
      "status": "in_force",
      "summary": "string",
      "impactLevel": "high",
      "actions": ["string"],
      "source": "IMO"
    }
  ],
  "upcomingChanges": [
    {
      "regulation": "string",
      "change": "string",
      "proposedDate": "2025-07-01",
      "status": "under_review",
      "probability": 85
    }
  ],
  "industryTrends": [
    { "trend": "Decarbonization", "impact": "high", "timeline": "2025-2030" }
  ],
  "recommendations": [
    { "action": "string", "priority": "high", "deadline": "2025-06-01", "regulation": "string" }
  ],
  "sources": ["IMO", "Flag State", "Classification Society"],
  "lastUpdated": "2025-01-30",
  "confidence": 85
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    updates: [],
    upcomingChanges: [],
    industryTrends: [],
    recommendations: [],
    sources: [],
    lastUpdated: new Date().toISOString(),
    confidence: 50,
  });
}

async function preparePSC(
  params: { vesselId?: string; targetPort?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const { data: vessel } = params.vesselId
    ? await supabase.from("vessels").select("*").eq("id", params.vesselId).single()
    : { data: null };

  const prompt = `You are a Port State Control inspection preparation expert.

VESSEL: ${JSON.stringify(vessel) || "General cargo vessel"}
TARGET PORT: ${params.targetPort || "Rotterdam"}

Prepare for PSC inspection:

Return JSON:
{
  "readinessScore": 85,
  "riskRating": "low|standard|high",
  "priorityChecklist": [
    {
      "area": "Navigation Equipment",
      "priority": "high",
      "items": [
        { "item": "ECDIS functionality", "status": "ready", "notes": "string" }
      ],
      "status": "ready|attention|critical"
    }
  ],
  "documentReview": [
    { "document": "Safety Management Certificate", "status": "valid", "expiry": "2025-12-15", "action": "none" }
  ],
  "crewPreparation": {
    "drillReadiness": 90,
    "documentationComplete": true,
    "trainingGaps": []
  },
  "historicalDeficiencies": [
    { "deficiency": "string", "date": "2024-06-15", "status": "corrected", "recurrenceRisk": "low" }
  ],
  "focusAreas": [
    { "area": "Fire safety", "likelihood": "high", "preparation": ["string"] }
  ],
  "recommendations": [
    { "action": "string", "priority": "critical", "deadline": "Before arrival", "responsible": "Master" }
  ],
  "expectedDuration": "4-6 hours",
  "confidence": 88
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    readinessScore: 0,
    riskRating: "unknown",
    priorityChecklist: [],
    documentReview: [],
    crewPreparation: {},
    historicalDeficiencies: [],
    focusAreas: [],
    recommendations: [],
    expectedDuration: "Unknown",
    confidence: 50,
  });
}

async function trackCertificates(
  params: { vesselId?: string; crewMemberId?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const { data: certificates } = await supabase
    .from("maritime_certificates")
    .select("*")
    .limit(100);

  const prompt = `You are a maritime certificate tracking specialist.

CERTIFICATES: ${JSON.stringify(certificates?.slice(0, 30))}

Provide certificate tracking analysis:

Return JSON:
{
  "summary": {
    "total": 45,
    "valid": 40,
    "expiringSoon": 3,
    "expired": 2
  },
  "certificates": [
    {
      "name": "Safety Management Certificate",
      "type": "vessel",
      "status": "valid",
      "issueDate": "2023-01-15",
      "expiryDate": "2028-01-14",
      "daysRemaining": 1080,
      "issuingAuthority": "DNV",
      "renewalRequired": false,
      "priority": "low"
    }
  ],
  "expiringCertificates": [
    { "name": "string", "expiryDate": "2025-03-15", "daysRemaining": 45, "priority": "high", "action": "string" }
  ],
  "renewalSchedule": [
    { "certificate": "string", "renewalDate": "2025-02-15", "estimatedCost": 5000, "leadTime": "2 weeks" }
  ],
  "complianceGaps": [
    { "certificate": "string", "issue": "string", "severity": "critical", "resolution": "string" }
  ],
  "recommendations": ["string"],
  "estimatedRenewalCost": 25000,
  "confidence": 92
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    summary: { total: 0, valid: 0, expiringSoon: 0, expired: 0 },
    certificates: [],
    expiringCertificates: [],
    renewalSchedule: [],
    complianceGaps: [],
    recommendations: [],
    estimatedRenewalCost: 0,
    confidence: 50,
  });
}

async function getFlagStateRequirements(
  params: { flagState: string; vesselType?: string },
  apiKey: string
): Promise<any> {
  const prompt = `You are a flag state requirements expert.

FLAG STATE: ${params.flagState || "Panama"}
VESSEL TYPE: ${params.vesselType || "General cargo"}

Provide flag state requirements:

Return JSON:
{
  "flagState": "${params.flagState || "Panama"}",
  "requirements": [
    {
      "category": "Registration",
      "items": [
        { "requirement": "string", "mandatory": true, "frequency": "Initial", "fee": 5000 }
      ]
    }
  ],
  "annualRequirements": [
    { "requirement": "Annual tonnage tax", "dueDate": "Anniversary", "estimatedCost": 3000 }
  ],
  "crewRequirements": {
    "minimumManning": 15,
    "nationalityRequirements": "None",
    "certificationRecognition": ["STCW parties"]
  },
  "inspectionRequirements": [
    { "inspection": "Annual survey", "frequency": "Yearly", "authority": "Class society" }
  ],
  "specialRequirements": ["string"],
  "advantages": ["string"],
  "disadvantages": ["string"],
  "costs": {
    "initial": 25000,
    "annual": 15000,
    "currency": "USD"
  },
  "processingTime": "5-10 business days",
  "confidence": 85
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    flagState: params.flagState || "Unknown",
    requirements: [],
    annualRequirements: [],
    crewRequirements: {},
    inspectionRequirements: [],
    specialRequirements: [],
    advantages: [],
    disadvantages: [],
    costs: {},
    processingTime: "Unknown",
    confidence: 50,
  });
}

async function generateComplianceCalendar(
  params: { vesselId?: string; months?: number },
  supabase: any,
  apiKey: string
): Promise<any> {
  const months = params.months || 12;

  const prompt = `You are a compliance calendar specialist. Generate a ${months}-month compliance calendar.

Generate compliance calendar:

Return JSON:
{
  "period": {
    "start": "2025-02-01",
    "end": "2026-01-31",
    "months": ${months}
  },
  "events": [
    {
      "date": "2025-03-15",
      "type": "survey|audit|renewal|training|inspection",
      "title": "Annual Safety Survey",
      "description": "string",
      "regulation": "SOLAS",
      "mandatory": true,
      "estimatedCost": 5000,
      "duration": "1 day",
      "responsible": "Technical Manager",
      "priority": "high"
    }
  ],
  "monthlyOverview": [
    { "month": "2025-02", "eventCount": 3, "criticalEvents": 1, "estimatedCost": 8000 }
  ],
  "upcomingCritical": [
    { "event": "string", "date": "2025-02-28", "daysRemaining": 28, "action": "string" }
  ],
  "annualCost": 75000,
  "recommendations": ["string"],
  "confidence": 88
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    period: {},
    events: [],
    monthlyOverview: [],
    upcomingCritical: [],
    annualCost: 0,
    recommendations: [],
    confidence: 50,
  });
}

async function assessComplianceRisk(
  params: { vesselId?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const prompt = `You are a compliance risk assessment specialist.

Perform compliance risk assessment:

Return JSON:
{
  "overallRiskLevel": "low|medium|high|critical",
  "riskScore": 25,
  "riskCategories": [
    {
      "category": "Regulatory",
      "riskLevel": "low",
      "score": 20,
      "factors": [
        { "factor": "Certificate validity", "risk": "low", "description": "All certificates valid" }
      ],
      "mitigations": ["string"]
    }
  ],
  "topRisks": [
    {
      "risk": "MARPOL Annex VI non-compliance",
      "probability": "medium",
      "impact": "high",
      "riskScore": 65,
      "mitigation": "string",
      "deadline": "2025-06-01"
    }
  ],
  "riskTrend": {
    "direction": "improving|stable|worsening",
    "change": -5,
    "period": "Last 6 months"
  },
  "comparisonToBenchmark": {
    "industryAverage": 35,
    "ourScore": 25,
    "percentile": 75
  },
  "actionPlan": [
    { "action": "string", "priority": "high", "owner": "string", "deadline": "2025-03-01", "status": "pending" }
  ],
  "nextAssessment": "2025-04-01",
  "confidence": 85
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    overallRiskLevel: "unknown",
    riskScore: 0,
    riskCategories: [],
    topRisks: [],
    riskTrend: {},
    comparisonToBenchmark: {},
    actionPlan: [],
    nextAssessment: null,
    confidence: 50,
  });
}

async function callLovableAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are an expert maritime compliance and regulatory specialist. Always respond with valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

function parseJsonResponse(response: string, fallback: any): any {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Parse error:", e);
  }
  return fallback;
}
