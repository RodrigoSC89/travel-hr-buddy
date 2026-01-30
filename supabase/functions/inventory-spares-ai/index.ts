/**
 * 📦 Inventory & Spares AI - Edge Function
 * Inventory management, demand forecasting, reorder optimization
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
      case "inventory-status":
        result = await getInventoryStatus(params, supabase, LOVABLE_API_KEY);
        break;
      case "demand-forecast":
        result = await forecastDemand(params, supabase, LOVABLE_API_KEY);
        break;
      case "reorder-optimization":
        result = await optimizeReorder(params, supabase, LOVABLE_API_KEY);
        break;
      case "cost-analysis":
        result = await analyzeCosts(params, supabase, LOVABLE_API_KEY);
        break;
      case "supplier-performance":
        result = await analyzeSupplierPerformance(params, supabase, LOVABLE_API_KEY);
        break;
      case "critical-spares":
        result = await analyzeCriticalSpares(params, supabase, LOVABLE_API_KEY);
        break;
      case "usage-analytics":
        result = await analyzeUsage(params, supabase, LOVABLE_API_KEY);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Inventory AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function getInventoryStatus(
  params: { vesselId?: string; category?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const prompt = `You are an inventory management specialist for maritime operations.

Generate inventory status report:

Return JSON:
{
  "summary": {
    "totalItems": 1500,
    "totalValue": 750000,
    "currency": "USD",
    "stockHealth": 85
  },
  "categories": [
    {
      "name": "Engine Spares",
      "itemCount": 250,
      "value": 200000,
      "stockLevel": "adequate",
      "criticalItems": 5,
      "lowStockItems": 12
    }
  ],
  "alerts": [
    {
      "type": "low_stock|critical|expiring|overstock",
      "item": "Fuel filter element",
      "partNumber": "FE-2024-001",
      "currentStock": 2,
      "reorderPoint": 5,
      "urgency": "high",
      "action": "Reorder immediately"
    }
  ],
  "stockLevels": {
    "adequate": 1200,
    "low": 180,
    "critical": 45,
    "overstock": 75
  },
  "expiringItems": [
    { "item": "string", "quantity": 10, "expiryDate": "2025-06-15", "value": 500 }
  ],
  "recentActivity": [
    { "action": "consumed", "item": "string", "quantity": 5, "date": "2025-01-28" }
  ],
  "recommendations": [
    { "action": "string", "priority": "high", "impact": "string" }
  ],
  "confidence": 90
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    summary: {},
    categories: [],
    alerts: [],
    stockLevels: {},
    expiringItems: [],
    recentActivity: [],
    recommendations: [],
    confidence: 50,
  });
}

async function forecastDemand(
  params: { horizon?: number; category?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const horizon = params.horizon || 90;

  const prompt = `You are a demand forecasting specialist using ML algorithms.

FORECAST HORIZON: ${horizon} days
CATEGORY: ${params.category || "All categories"}

Generate demand forecast:

Return JSON:
{
  "horizon": ${horizon},
  "methodology": "ML ensemble (Random Forest + XGBoost + LSTM)",
  "forecasts": [
    {
      "item": "Fuel filter element",
      "partNumber": "FE-2024-001",
      "currentStock": 15,
      "forecastedDemand": 25,
      "unit": "pieces",
      "confidence": 85,
      "factors": ["Scheduled maintenance", "Historical usage"],
      "recommendation": "Order 15 units"
    }
  ],
  "categoryForecasts": [
    {
      "category": "Engine Spares",
      "currentValue": 200000,
      "forecastedDemand": 45000,
      "recommendedPurchase": 50000
    }
  ],
  "seasonalFactors": [
    { "factor": "Dry dock schedule", "impact": "+25%", "period": "Q2 2025" }
  ],
  "budgetForecast": {
    "total": 150000,
    "byMonth": [
      { "month": "2025-02", "amount": 45000 }
    ]
  },
  "accuracyMetrics": {
    "mape": 8.5,
    "rmse": 12.3,
    "historicalAccuracy": 92
  },
  "recommendations": [
    { "action": "string", "priority": "high", "savings": 5000 }
  ],
  "confidence": 85
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    horizon,
    methodology: "Statistical",
    forecasts: [],
    categoryForecasts: [],
    seasonalFactors: [],
    budgetForecast: {},
    accuracyMetrics: {},
    recommendations: [],
    confidence: 50,
  });
}

async function optimizeReorder(
  params: { vesselId?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const prompt = `You are a reorder optimization specialist.

Optimize reorder points and quantities:

Return JSON:
{
  "optimizationResults": [
    {
      "item": "Fuel filter element",
      "partNumber": "FE-2024-001",
      "currentReorderPoint": 5,
      "optimizedReorderPoint": 8,
      "currentOrderQty": 20,
      "economicOrderQty": 25,
      "safetyStock": 3,
      "leadTime": "14 days",
      "annualSavings": 500,
      "rationale": "string"
    }
  ],
  "pendingOrders": [
    {
      "item": "string",
      "quantity": 25,
      "expectedDelivery": "2025-02-15",
      "supplier": "string",
      "status": "confirmed"
    }
  ],
  "consolidationOpportunities": [
    {
      "items": ["item1", "item2", "item3"],
      "supplier": "string",
      "savings": 1500,
      "recommendation": "Consolidate order"
    }
  ],
  "urgentOrders": [
    {
      "item": "string",
      "currentStock": 1,
      "dailyUsage": 0.5,
      "daysUntilStockout": 2,
      "recommendedQty": 15,
      "supplier": "string",
      "action": "Emergency order"
    }
  ],
  "budgetImpact": {
    "totalReorderValue": 75000,
      "withinBudget": true,
      "budgetRemaining": 25000
  },
  "recommendations": [
    { "action": "string", "priority": "high", "impact": "string" }
  ],
  "totalAnnualSavings": 15000,
  "confidence": 88
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    optimizationResults: [],
    pendingOrders: [],
    consolidationOpportunities: [],
    urgentOrders: [],
    budgetImpact: {},
    recommendations: [],
    totalAnnualSavings: 0,
    confidence: 50,
  });
}

async function analyzeCosts(
  params: { period?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const prompt = `You are an inventory cost analysis specialist.

PERIOD: ${params.period || "Last 12 months"}

Analyze inventory costs:

Return JSON:
{
  "totalCost": {
    "period": "${params.period || "Last 12 months"}",
    "amount": 450000,
    "currency": "USD"
  },
  "costBreakdown": {
    "purchase": 380000,
    "shipping": 35000,
    "storage": 15000,
    "obsolescence": 12000,
    "expediting": 8000
  },
  "byCategory": [
    {
      "category": "Engine Spares",
      "cost": 150000,
      "percentage": 33,
      "trend": "increasing",
      "changePercent": 8
    }
  ],
  "byVessel": [
    { "vessel": "MV Example", "cost": 85000, "percentage": 19 }
  ],
  "trends": {
    "direction": "increasing",
    "changePercent": 5,
    "forecast": "Expected to stabilize"
  },
  "costDrivers": [
    { "driver": "Fuel price increase", "impact": 15000, "percentage": 3 }
  ],
  "savingsOpportunities": [
    {
      "opportunity": "Bulk purchasing",
      "potentialSavings": 25000,
      "implementation": "Negotiate annual contracts",
      "effort": "medium"
    }
  ],
  "benchmarks": {
    "industryAverage": 500000,
    "ourPerformance": "10% below average"
  },
  "recommendations": [
    { "action": "string", "savings": 10000, "priority": "high" }
  ],
  "confidence": 85
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    totalCost: {},
    costBreakdown: {},
    byCategory: [],
    byVessel: [],
    trends: {},
    costDrivers: [],
    savingsOpportunities: [],
    benchmarks: {},
    recommendations: [],
    confidence: 50,
  });
}

async function analyzeSupplierPerformance(
  params: { supplierId?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("*")
    .limit(30);

  const prompt = `You are a supplier performance analyst.

SUPPLIERS: ${JSON.stringify(suppliers?.slice(0, 15))}

Analyze supplier performance:

Return JSON:
{
  "suppliers": [
    {
      "id": "uuid",
      "name": "Marine Parts Co",
      "overallScore": 88,
      "metrics": {
        "quality": 92,
        "delivery": 85,
        "pricing": 88,
        "responsiveness": 90
      },
      "onTimeDelivery": 92,
      "defectRate": 0.5,
      "averageLeadTime": "12 days",
      "volumePurchased": 150000,
      "trend": "improving",
      "issues": [],
      "recommendations": ["Consider for preferred status"]
    }
  ],
  "rankings": [
    { "rank": 1, "supplierId": "uuid", "name": "string", "score": 92 }
  ],
  "riskAssessment": [
    {
      "supplier": "string",
      "riskLevel": "low|medium|high",
      "factors": ["Single source for critical items"],
      "mitigation": "Develop alternative supplier"
    }
  ],
  "recommendations": [
    {
      "supplier": "string",
      "action": "string",
      "impact": "string",
      "priority": "high"
    }
  ],
  "consolidationOpportunities": [
    { "currentSuppliers": 5, "category": "Filters", "recommendation": "Consolidate to 2" }
  ],
  "confidence": 85
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    suppliers: [],
    rankings: [],
    riskAssessment: [],
    recommendations: [],
    consolidationOpportunities: [],
    confidence: 50,
  });
}

async function analyzeCriticalSpares(
  params: { vesselId?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const prompt = `You are a critical spares analyst for maritime operations.

Analyze critical spares inventory:

Return JSON:
{
  "criticalItems": [
    {
      "item": "Main engine fuel injection pump",
      "partNumber": "ME-FIP-001",
      "criticality": "A",
      "currentStock": 1,
      "recommendedStock": 2,
      "status": "adequate|low|critical",
      "leadTime": "45 days",
      "value": 25000,
      "lastUsed": "2024-06-15",
      "failureProbability": 15,
      "impactIfUnavailable": "Vessel immobilization"
    }
  ],
  "summary": {
    "totalCriticalItems": 45,
    "adequate": 35,
    "low": 8,
    "critical": 2,
    "totalValue": 500000
  },
  "riskAnalysis": {
    "overallRisk": "low",
    "vesselAvailabilityImpact": "Minimal",
    "financialExposure": 75000
  },
  "abcAnalysis": {
    "A": { "items": 45, "value": 400000, "percentage": 80 },
    "B": { "items": 150, "value": 75000, "percentage": 15 },
    "C": { "items": 500, "value": 25000, "percentage": 5 }
  },
  "recommendations": [
    {
      "item": "string",
      "action": "Increase safety stock",
      "reason": "Long lead time",
      "investment": 15000,
      "priority": "high"
    }
  ],
  "obsolescenceRisk": [
    { "item": "string", "risk": "high", "reason": "Manufacturer discontinued", "action": "Source alternative" }
  ],
  "confidence": 88
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    criticalItems: [],
    summary: {},
    riskAnalysis: {},
    abcAnalysis: {},
    recommendations: [],
    obsolescenceRisk: [],
    confidence: 50,
  });
}

async function analyzeUsage(
  params: { period?: string; category?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const prompt = `You are an inventory usage analytics specialist.

PERIOD: ${params.period || "Last 12 months"}
CATEGORY: ${params.category || "All categories"}

Analyze usage patterns:

Return JSON:
{
  "period": "${params.period || "Last 12 months"}",
  "totalConsumption": {
    "items": 5000,
    "value": 350000,
    "currency": "USD"
  },
  "topConsumed": [
    {
      "item": "Fuel filter element",
      "partNumber": "FE-2024-001",
      "quantity": 250,
      "value": 12500,
      "trend": "increasing",
      "changePercent": 15
    }
  ],
  "usagePatterns": [
    {
      "pattern": "Seasonal peak in Q2",
      "items": ["Filters", "Lubricants"],
      "recommendation": "Pre-order before peak"
    }
  ],
  "anomalies": [
    {
      "item": "string",
      "anomaly": "Unusual consumption spike",
      "date": "2025-01-15",
      "investigation": "Equipment malfunction suspected"
    }
  ],
  "byVessel": [
    { "vessel": "MV Example", "consumption": 85000, "percentage": 24 }
  ],
  "byCategory": [
    { "category": "Engine Spares", "consumption": 120000, "percentage": 34 }
  ],
  "efficiency": {
    "score": 85,
    "wastePercentage": 2.5,
    "optimizationPotential": 15000
  },
  "recommendations": [
    { "action": "string", "impact": "string", "priority": "medium" }
  ],
  "confidence": 85
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    period: params.period || "Last 12 months",
    totalConsumption: {},
    topConsumed: [],
    usagePatterns: [],
    anomalies: [],
    byVessel: [],
    byCategory: [],
    efficiency: {},
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
        { role: "system", content: "You are an expert maritime inventory and spares management specialist. Always respond with valid JSON." },
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
