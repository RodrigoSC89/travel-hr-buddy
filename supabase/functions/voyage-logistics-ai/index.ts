/**
 * 🗺️ Voyage & Logistics AI - Edge Function
 * Route optimization, port operations, cargo tracking
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
      case "optimize-route":
        result = await optimizeRoute(params, LOVABLE_API_KEY);
        break;
      case "predict-eta":
        result = await predictETA(params, LOVABLE_API_KEY);
        break;
      case "weather-routing":
        result = await weatherRouting(params, LOVABLE_API_KEY);
        break;
      case "bunker-optimization":
        result = await optimizeBunker(params, LOVABLE_API_KEY);
        break;
      case "cargo-tracking":
        result = await trackCargo(params, supabase, LOVABLE_API_KEY);
        break;
      case "port-operations":
        result = await optimizePortOperations(params, LOVABLE_API_KEY);
        break;
      case "voyage-analysis":
        result = await analyzeVoyage(params, supabase, LOVABLE_API_KEY);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Voyage AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function optimizeRoute(
  params: { origin: string; destination: string; vesselType?: string; cargoWeight?: number },
  apiKey: string
): Promise<any> {
  const prompt = `You are a maritime route optimization expert. Optimize the voyage route.

VOYAGE DETAILS:
- Origin: ${params.origin}
- Destination: ${params.destination}
- Vessel Type: ${params.vesselType || "General cargo"}
- Cargo Weight: ${params.cargoWeight ? `${params.cargoWeight} tons` : "Not specified"}

Consider:
1. Weather conditions and seasonal patterns
2. Ocean currents and prevailing winds
3. Piracy risk zones
4. Emissions regulations (ECA zones)
5. Fuel efficiency
6. Port infrastructure

Return JSON:
{
  "recommendedRoute": {
    "name": "Northern Atlantic Route",
    "waypoints": [
      { "lat": 40.7128, "lng": -74.0060, "name": "New York", "type": "origin" },
      { "lat": 51.5074, "lng": -0.1278, "name": "London", "type": "destination" }
    ],
    "totalDistance": 3450,
    "estimatedDuration": "7 days 14 hours"
  },
  "alternativeRoutes": [
    {
      "name": "string",
      "distance": 3600,
      "duration": "8 days",
      "pros": ["string"],
      "cons": ["string"]
    }
  ],
  "fuelEstimate": {
    "totalConsumption": 450,
    "unit": "metric tons",
    "estimatedCost": 225000,
    "savingsVsAlternative": 15000
  },
  "weatherConsiderations": ["string"],
  "riskAssessment": {
    "overallRisk": "low",
    "piracyRisk": "none",
    "weatherRisk": "medium",
    "navigationRisk": "low"
  },
  "emissionsEstimate": {
    "co2": 1400,
    "sox": 5,
    "nox": 12,
    "unit": "metric tons"
  },
  "recommendations": ["string"],
  "confidence": 88
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    recommendedRoute: { name: "Direct route", waypoints: [], totalDistance: 0, estimatedDuration: "Unknown" },
    alternativeRoutes: [],
    fuelEstimate: { totalConsumption: 0, unit: "metric tons", estimatedCost: 0, savingsVsAlternative: 0 },
    weatherConsiderations: [],
    riskAssessment: { overallRisk: "unknown", piracyRisk: "unknown", weatherRisk: "unknown", navigationRisk: "unknown" },
    emissionsEstimate: { co2: 0, sox: 0, nox: 0, unit: "metric tons" },
    recommendations: [],
    confidence: 50,
  });
}

async function predictETA(
  params: { vesselId?: string; origin: string; destination: string; departureTime?: string },
  apiKey: string
): Promise<any> {
  const prompt = `You are a maritime ETA prediction specialist with 99.5% accuracy. Predict arrival time.

VOYAGE:
- Origin: ${params.origin}
- Destination: ${params.destination}
- Departure: ${params.departureTime || "Now"}

Consider:
1. Historical voyage data
2. Current weather conditions
3. Traffic density
4. Port congestion
5. Vessel speed capabilities

Return JSON:
{
  "predictedETA": "2025-02-15T14:30:00Z",
  "confidence": 95,
  "duration": {
    "days": 7,
    "hours": 14,
    "minutes": 30
  },
  "factors": [
    {
      "factor": "Weather",
      "impact": "+4 hours",
      "description": "Moderate headwinds expected"
    }
  ],
  "delayRisks": [
    {
      "risk": "Port congestion at destination",
      "probability": 25,
      "potentialDelay": "6-12 hours"
    }
  ],
  "milestones": [
    { "location": "string", "estimatedArrival": "2025-02-12T08:00:00Z", "distance": 1500 }
  ],
  "scenarioAnalysis": {
    "bestCase": "2025-02-15T08:00:00Z",
    "mostLikely": "2025-02-15T14:30:00Z",
    "worstCase": "2025-02-16T22:00:00Z"
  },
  "recommendations": ["string"]
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    predictedETA: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    confidence: 50,
    duration: { days: 7, hours: 0, minutes: 0 },
    factors: [],
    delayRisks: [],
    milestones: [],
    scenarioAnalysis: {},
    recommendations: [],
  });
}

async function weatherRouting(
  params: { route?: any; departureWindow?: string },
  apiKey: string
): Promise<any> {
  const prompt = `You are a weather routing specialist. Optimize route based on weather.

ROUTE: ${JSON.stringify(params.route) || "Atlantic crossing"}
DEPARTURE WINDOW: ${params.departureWindow || "Next 7 days"}

Provide weather-optimized routing:

Return JSON:
{
  "optimalDeparture": "2025-02-08T06:00:00Z",
  "weatherWindow": {
    "start": "2025-02-08",
    "end": "2025-02-15",
    "quality": "good"
  },
  "forecast": [
    {
      "date": "2025-02-08",
      "segment": "Day 1",
      "windSpeed": 15,
      "windDirection": "NW",
      "waveHeight": 2.5,
      "visibility": "good",
      "conditions": "Favorable"
    }
  ],
  "routeAdjustments": [
    {
      "waypoint": "Mid-Atlantic",
      "originalCourse": 90,
      "recommendedCourse": 85,
      "reason": "Avoid storm system"
    }
  ],
  "beaufortForecast": [
    { "day": 1, "scale": 4, "description": "Moderate breeze" }
  ],
  "alerts": [
    { "type": "storm", "severity": "warning", "location": "string", "timing": "string" }
  ],
  "fuelImpact": {
    "withOptimization": 420,
    "withoutOptimization": 480,
    "savings": 60,
    "unit": "metric tons"
  },
  "confidence": 85
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    optimalDeparture: new Date().toISOString(),
    weatherWindow: { start: "", end: "", quality: "unknown" },
    forecast: [],
    routeAdjustments: [],
    beaufortForecast: [],
    alerts: [],
    fuelImpact: {},
    confidence: 50,
  });
}

async function optimizeBunker(
  params: { route?: any; currentFuel?: number; fuelType?: string },
  apiKey: string
): Promise<any> {
  const prompt = `You are a bunker optimization specialist. Optimize fuel purchasing strategy.

ROUTE: ${JSON.stringify(params.route) || "Multi-port voyage"}
CURRENT FUEL: ${params.currentFuel ? `${params.currentFuel} MT` : "Not specified"}
FUEL TYPE: ${params.fuelType || "VLSFO"}

Optimize bunker purchases:

Return JSON:
{
  "strategy": "split_purchase",
  "totalRequired": 500,
  "recommendations": [
    {
      "port": "Rotterdam",
      "quantity": 300,
      "pricePerTon": 450,
      "totalCost": 135000,
      "quality": "high",
      "availability": "excellent",
      "timing": "2025-02-10"
    }
  ],
  "priceComparison": [
    { "port": "string", "pricePerTon": 450, "savings": 5000 }
  ],
  "qualityConsiderations": ["string"],
  "hedgingRecommendations": [
    { "instrument": "Forward contract", "quantity": 200, "recommendation": "string" }
  ],
  "totalCost": 225000,
  "savingsVsSpot": 12000,
  "riskFactors": ["string"],
  "confidence": 82
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    strategy: "standard",
    totalRequired: 0,
    recommendations: [],
    priceComparison: [],
    qualityConsiderations: [],
    hedgingRecommendations: [],
    totalCost: 0,
    savingsVsSpot: 0,
    riskFactors: [],
    confidence: 50,
  });
}

async function trackCargo(
  params: { cargoId?: string; vesselId?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const { data: shipments } = await supabase
    .from("shipments")
    .select("*")
    .limit(20);

  const prompt = `You are a cargo tracking specialist. Provide comprehensive cargo status.

CARGO DATA:
${JSON.stringify(shipments?.slice(0, 10), null, 2)}

Provide cargo tracking analysis:

Return JSON:
{
  "cargoStatus": "in_transit",
  "location": {
    "current": "Mid-Atlantic",
    "lat": 40.5,
    "lng": -30.2,
    "lastUpdate": "2025-02-01T10:00:00Z"
  },
  "journey": {
    "origin": "string",
    "destination": "string",
    "progress": 65,
    "distanceRemaining": 1200
  },
  "conditions": {
    "temperature": 22,
    "humidity": 45,
    "status": "optimal"
  },
  "timeline": [
    { "event": "Departed", "location": "Rotterdam", "timestamp": "2025-01-25T08:00:00Z", "status": "completed" }
  ],
  "alerts": [
    { "type": "delay", "severity": "low", "message": "string" }
  ],
  "documents": [
    { "type": "Bill of Lading", "status": "verified", "number": "BOL-2025-001" }
  ],
  "estimatedArrival": "2025-02-05T14:00:00Z",
  "confidence": 90
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    cargoStatus: "unknown",
    location: {},
    journey: {},
    conditions: {},
    timeline: [],
    alerts: [],
    documents: [],
    estimatedArrival: null,
    confidence: 50,
  });
}

async function optimizePortOperations(
  params: { portId?: string; vesselId?: string; operationType?: string },
  apiKey: string
): Promise<any> {
  const prompt = `You are a port operations optimizer. Optimize port call efficiency.

PORT: ${params.portId || "Major container terminal"}
VESSEL: ${params.vesselId || "Container vessel"}
OPERATION: ${params.operationType || "Loading and unloading"}

Optimize port operations:

Return JSON:
{
  "optimizedSchedule": {
    "berthingTime": "2025-02-10T06:00:00Z",
    "operationsStart": "2025-02-10T07:00:00Z",
    "operationsEnd": "2025-02-10T18:00:00Z",
    "departure": "2025-02-10T20:00:00Z",
    "totalPortTime": "14 hours"
  },
  "berthRecommendation": {
    "berth": "Terminal 3, Berth 7",
    "reason": "Optimal crane coverage",
    "alternatives": ["Berth 5", "Berth 8"]
  },
  "resourceAllocation": [
    { "resource": "Gantry cranes", "quantity": 3, "duration": "8 hours" }
  ],
  "cargoSequence": [
    { "operation": "Discharge", "quantity": 500, "unit": "TEU", "duration": "5 hours" }
  ],
  "potentialDelays": [
    { "cause": "Tidal restrictions", "probability": 20, "impact": "2 hours" }
  ],
  "costEstimate": {
    "portCharges": 15000,
    "pilotage": 3000,
    "towage": 4000,
    "total": 22000
  },
  "recommendations": ["string"],
  "confidence": 85
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    optimizedSchedule: {},
    berthRecommendation: {},
    resourceAllocation: [],
    cargoSequence: [],
    potentialDelays: [],
    costEstimate: {},
    recommendations: [],
    confidence: 50,
  });
}

async function analyzeVoyage(
  params: { voyageId?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const prompt = `You are a voyage performance analyst. Analyze voyage efficiency and performance.

Provide comprehensive voyage analysis:

Return JSON:
{
  "performance": {
    "overallScore": 85,
    "fuelEfficiency": 88,
    "scheduleAdherence": 92,
    "safetyScore": 95
  },
  "kpis": [
    { "metric": "Average Speed", "value": 14.5, "unit": "knots", "benchmark": 14.0, "status": "above" }
  ],
  "fuelAnalysis": {
    "actualConsumption": 420,
    "predicted": 450,
    "variance": -30,
    "efficiency": "Above target"
  },
  "delays": [
    { "cause": "Weather", "duration": "4 hours", "impact": "Minor" }
  ],
  "costAnalysis": {
    "totalCost": 250000,
    "budgeted": 260000,
    "variance": -10000,
    "breakdown": {}
  },
  "emissionsReport": {
    "co2": 1350,
    "cii": "B",
    "eeoi": 12.5
  },
  "lessonsLearned": ["string"],
  "recommendations": ["string"],
  "confidence": 88
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    performance: {},
    kpis: [],
    fuelAnalysis: {},
    delays: [],
    costAnalysis: {},
    emissionsReport: {},
    lessonsLearned: [],
    recommendations: [],
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
        { role: "system", content: "You are an expert maritime voyage and logistics specialist. Always respond with valid JSON." },
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
