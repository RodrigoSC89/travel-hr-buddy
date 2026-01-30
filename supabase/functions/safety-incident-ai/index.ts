/**
 * 🚨 Safety & Incident AI - Edge Function
 * Incident reporting, root cause analysis, safety KPIs
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
      case "analyze-incident":
        result = await analyzeIncident(params, LOVABLE_API_KEY);
        break;
      case "root-cause-analysis":
        result = await performRCA(params, LOVABLE_API_KEY);
        break;
      case "safety-kpis":
        result = await calculateSafetyKPIs(params, supabase, LOVABLE_API_KEY);
        break;
      case "near-miss-analysis":
        result = await analyzeNearMisses(params, supabase, LOVABLE_API_KEY);
        break;
      case "risk-matrix":
        result = await generateRiskMatrix(params, supabase, LOVABLE_API_KEY);
        break;
      case "trend-analysis":
        result = await analyzeSafetyTrends(params, supabase, LOVABLE_API_KEY);
        break;
      case "ai-safety-advisor":
        result = await getSafetyAdvice(params, LOVABLE_API_KEY);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Safety AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function analyzeIncident(
  params: { description: string; incidentType?: string; severity?: string; location?: string },
  apiKey: string
): Promise<any> {
  const prompt = `You are a maritime safety incident analyst. Analyze this incident.

INCIDENT REPORT:
Description: ${params.description}
Type: ${params.incidentType || "Not specified"}
Severity: ${params.severity || "Not assessed"}
Location: ${params.location || "Not specified"}

Analyze the incident:

Return JSON:
{
  "classification": {
    "type": "injury|near_miss|damage|environmental|operational",
    "severity": "minor|moderate|serious|major|catastrophic",
    "imcaClass": "0|1|2|3",
    "potentialSeverity": "string"
  },
  "immediateActions": [
    { "action": "string", "priority": "critical|high|medium", "responsible": "string", "deadline": "immediate" }
  ],
  "rootCausesInitial": [
    { "cause": "string", "category": "human|technical|organizational|environmental", "probability": 75 }
  ],
  "contributingFactors": [
    { "factor": "string", "category": "string", "weight": 25 }
  ],
  "recommendations": [
    { "recommendation": "string", "type": "corrective|preventive", "priority": "high", "timeline": "7 days" }
  ],
  "similarIncidents": [
    { "description": "string", "date": "2024-06-15", "lessonsLearned": "string" }
  ],
  "regulatoryReporting": {
    "required": true,
    "authorities": ["Flag State", "IMO"],
    "deadline": "24 hours"
  },
  "investigationPriority": "high",
  "estimatedImpact": {
    "financial": 50000,
    "operational": "Medium",
    "reputational": "Low"
  },
  "confidence": 85
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    classification: {},
    immediateActions: [],
    rootCausesInitial: [],
    contributingFactors: [],
    recommendations: [],
    similarIncidents: [],
    regulatoryReporting: {},
    investigationPriority: "unknown",
    estimatedImpact: {},
    confidence: 50,
  });
}

async function performRCA(
  params: { incidentDescription: string; evidence?: any[] },
  apiKey: string
): Promise<any> {
  const prompt = `You are a root cause analysis expert using 5 Whys and Fishbone methodologies.

INCIDENT: ${params.incidentDescription}
EVIDENCE: ${JSON.stringify(params.evidence || [])}

Perform comprehensive root cause analysis:

Return JSON:
{
  "methodology": ["5 Whys", "Fishbone"],
  "fiveWhys": {
    "problem": "string",
    "whys": [
      { "level": 1, "question": "Why did this happen?", "answer": "string" },
      { "level": 2, "question": "Why?", "answer": "string" },
      { "level": 3, "question": "Why?", "answer": "string" },
      { "level": 4, "question": "Why?", "answer": "string" },
      { "level": 5, "question": "Why?", "answer": "string (root cause)" }
    ],
    "rootCause": "string"
  },
  "fishbone": {
    "effect": "string",
    "categories": [
      {
        "category": "Man (People)",
        "causes": ["Training deficiency", "Fatigue"]
      },
      {
        "category": "Machine (Equipment)",
        "causes": ["Maintenance overdue"]
      },
      {
        "category": "Method (Process)",
        "causes": ["Procedure not followed"]
      },
      {
        "category": "Material",
        "causes": ["Defective spare parts"]
      },
      {
        "category": "Measurement",
        "causes": ["Inadequate monitoring"]
      },
      {
        "category": "Environment",
        "causes": ["Poor lighting", "Weather conditions"]
      }
    ]
  },
  "rootCauses": [
    { "cause": "string", "category": "string", "confidence": 90, "evidence": ["string"] }
  ],
  "correctiveActions": [
    {
      "action": "string",
      "targetRootCause": "string",
      "type": "corrective|preventive",
      "priority": "high",
      "responsible": "string",
      "deadline": "2025-02-28",
      "status": "planned",
      "effectiveness": "high"
    }
  ],
  "preventiveMeasures": [
    { "measure": "string", "scope": "fleet-wide|vessel|department", "implementation": "string" }
  ],
  "lessonsLearned": ["string"],
  "followUpRequired": true,
  "reviewDate": "2025-03-15",
  "confidence": 88
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    methodology: [],
    fiveWhys: {},
    fishbone: {},
    rootCauses: [],
    correctiveActions: [],
    preventiveMeasures: [],
    lessonsLearned: [],
    followUpRequired: false,
    reviewDate: null,
    confidence: 50,
  });
}

async function calculateSafetyKPIs(
  params: { period?: string; vesselId?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const { data: incidents } = await supabase
    .from("dp_incidents")
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(200);

  const prompt = `You are a safety KPI specialist. Calculate maritime safety KPIs.

INCIDENT DATA (${incidents?.length || 0} records):
${JSON.stringify(incidents?.slice(0, 30), null, 2)}

PERIOD: ${params.period || "Last 12 months"}

Calculate safety KPIs:

Return JSON:
{
  "period": "${params.period || "Last 12 months"}",
  "kpis": {
    "ltifr": {
      "value": 0.5,
      "benchmark": 0.8,
      "status": "good",
      "trend": "improving",
      "formula": "Lost Time Injuries x 1,000,000 / Exposure Hours"
    },
    "trir": {
      "value": 1.2,
      "benchmark": 1.5,
      "status": "good",
      "trend": "stable"
    },
    "nearMissRate": {
      "value": 15,
      "benchmark": 10,
      "status": "good",
      "trend": "improving"
    },
    "incidentRate": {
      "value": 2.5,
      "benchmark": 3.0,
      "status": "good",
      "trend": "improving"
    },
    "lostDays": {
      "value": 45,
      "benchmark": 60,
      "status": "good"
    },
    "safetyObservations": {
      "positive": 150,
      "negative": 25,
      "ratio": 6.0
    }
  },
  "incidentsByType": [
    { "type": "Slip/Trip/Fall", "count": 5, "percentage": 25 }
  ],
  "incidentsBySeverity": [
    { "severity": "Minor", "count": 15, "percentage": 75 }
  ],
  "trendAnalysis": {
    "direction": "improving",
    "percentChange": -15,
    "forecast": "Continued improvement expected"
  },
  "benchmarkComparison": {
    "industry": "Above average",
    "percentile": 75
  },
  "recommendations": [
    { "area": "string", "recommendation": "string", "expectedImprovement": "10%" }
  ],
  "nextTargets": {
    "ltifr": 0.4,
    "trir": 1.0
  },
  "confidence": 90
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    period: params.period || "Last 12 months",
    kpis: {},
    incidentsByType: [],
    incidentsBySeverity: [],
    trendAnalysis: {},
    benchmarkComparison: {},
    recommendations: [],
    nextTargets: {},
    confidence: 50,
  });
}

async function analyzeNearMisses(
  params: { period?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const prompt = `You are a near-miss analysis specialist. Analyze near-miss reports.

PERIOD: ${params.period || "Last 6 months"}

Analyze near-misses:

Return JSON:
{
  "totalNearMisses": 45,
  "reportingRate": {
    "current": 15,
    "target": 10,
    "status": "above_target"
  },
  "byCategory": [
    { "category": "Dropped objects", "count": 12, "percentage": 27, "trend": "increasing" }
  ],
  "byLocation": [
    { "location": "Deck", "count": 20, "percentage": 44 }
  ],
  "potentialConsequences": [
    { "consequence": "Serious injury", "count": 8, "percentage": 18 }
  ],
  "rootCausePatterns": [
    { "pattern": "Procedural deviation", "frequency": 15, "percentage": 33 }
  ],
  "preventedIncidents": {
    "estimated": 8,
    "potentialCost": 250000
  },
  "reportingQuality": {
    "score": 75,
    "improvements": ["More detail on contributing factors", "Include photos"]
  },
  "recommendations": [
    { "recommendation": "string", "priority": "high", "area": "string" }
  ],
  "monthlyTrend": [
    { "month": "2025-01", "count": 8, "quality": 80 }
  ],
  "confidence": 85
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    totalNearMisses: 0,
    reportingRate: {},
    byCategory: [],
    byLocation: [],
    potentialConsequences: [],
    rootCausePatterns: [],
    preventedIncidents: {},
    reportingQuality: {},
    recommendations: [],
    monthlyTrend: [],
    confidence: 50,
  });
}

async function generateRiskMatrix(
  params: { vesselId?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const prompt = `You are a risk matrix specialist. Generate a safety risk matrix.

Generate risk matrix:

Return JSON:
{
  "matrix": {
    "rows": ["Catastrophic", "Major", "Serious", "Moderate", "Minor"],
    "columns": ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"],
    "cells": [
      { "row": 0, "col": 4, "riskLevel": "extreme", "color": "red", "value": 25 }
    ]
  },
  "identifiedRisks": [
    {
      "id": "R001",
      "risk": "Fire in engine room",
      "category": "Safety",
      "likelihood": 2,
      "consequence": 4,
      "riskScore": 8,
      "riskLevel": "high",
      "controls": ["Fire detection system", "CO2 suppression"],
      "residualRisk": 4,
      "status": "controlled"
    }
  ],
  "riskDistribution": {
    "extreme": 1,
    "high": 5,
    "medium": 12,
    "low": 25
  },
  "topRisks": [
    { "risk": "string", "score": 20, "trend": "stable", "action": "string" }
  ],
  "mitigationPriorities": [
    { "risk": "string", "currentScore": 15, "targetScore": 5, "actions": ["string"], "deadline": "2025-03-01" }
  ],
  "reviewDate": "2025-03-01",
  "confidence": 88
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    matrix: {},
    identifiedRisks: [],
    riskDistribution: {},
    topRisks: [],
    mitigationPriorities: [],
    reviewDate: null,
    confidence: 50,
  });
}

async function analyzeSafetyTrends(
  params: { period?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const prompt = `You are a safety trend analyst. Analyze safety trends.

PERIOD: ${params.period || "Last 24 months"}

Analyze trends:

Return JSON:
{
  "overallTrend": "improving|stable|worsening",
  "trendScore": 75,
  "monthlyData": [
    { "month": "2025-01", "incidents": 2, "nearMisses": 8, "observations": 25, "score": 82 }
  ],
  "categoryTrends": [
    { "category": "Slips/Trips/Falls", "trend": "decreasing", "changePercent": -25 }
  ],
  "seasonalPatterns": [
    { "pattern": "Higher incidents in winter", "months": ["Dec", "Jan", "Feb"], "recommendation": "string" }
  ],
  "leadingIndicators": [
    { "indicator": "Safety observations", "trend": "increasing", "correlation": "positive" }
  ],
  "laggingIndicators": [
    { "indicator": "Lost time injuries", "trend": "decreasing", "improvement": 30 }
  ],
  "predictions": {
    "next3Months": { "expectedIncidents": 4, "confidence": 75 },
    "next6Months": { "expectedIncidents": 9, "confidence": 60 }
  },
  "recommendations": [
    { "area": "string", "action": "string", "expectedImpact": "string" }
  ],
  "confidence": 82
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    overallTrend: "stable",
    trendScore: 50,
    monthlyData: [],
    categoryTrends: [],
    seasonalPatterns: [],
    leadingIndicators: [],
    laggingIndicators: [],
    predictions: {},
    recommendations: [],
    confidence: 50,
  });
}

async function getSafetyAdvice(
  params: { question: string; context?: string },
  apiKey: string
): Promise<any> {
  const prompt = `You are an AI Safety Advisor for maritime operations.

QUESTION: ${params.question}
CONTEXT: ${params.context || "General maritime safety"}

Provide expert safety advice:

Return JSON:
{
  "advice": "string (comprehensive safety advice)",
  "keyPoints": ["string"],
  "regulations": [
    { "regulation": "SOLAS", "chapter": "III", "relevance": "string" }
  ],
  "bestPractices": ["string"],
  "risks": [
    { "risk": "string", "mitigation": "string" }
  ],
  "references": [
    { "source": "IMO Guidelines", "document": "string", "section": "string" }
  ],
  "trainingRecommendations": ["string"],
  "checklistItems": ["string"],
  "confidence": 90
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    advice: "Please consult your safety officer for specific guidance.",
    keyPoints: [],
    regulations: [],
    bestPractices: [],
    risks: [],
    references: [],
    trainingRecommendations: [],
    checklistItems: [],
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
        { role: "system", content: "You are an expert maritime safety specialist. Always respond with valid JSON." },
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
