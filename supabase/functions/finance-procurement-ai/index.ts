/**
 * 💰 Finance & Procurement AI - Edge Function
 * Predictive accounting, smart procurement, cost optimization
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
      case "cash-flow-prediction":
        result = await predictCashFlow(params, supabase, LOVABLE_API_KEY);
        break;
      case "fraud-detection":
        result = await detectFraud(params, supabase, LOVABLE_API_KEY);
        break;
      case "budget-optimization":
        result = await optimizeBudget(params, supabase, LOVABLE_API_KEY);
        break;
      case "supplier-analysis":
        result = await analyzeSuppliers(params, supabase, LOVABLE_API_KEY);
        break;
      case "cost-prediction":
      case "predict_costs":
        result = await predictCosts(params, supabase, LOVABLE_API_KEY);
        break;
      case "invoice-processing":
        result = await processInvoice(params, LOVABLE_API_KEY);
        break;
      case "procurement-strategy":
      case "identify_savings":
        result = await generateProcurementStrategy(params, supabase, LOVABLE_API_KEY);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Finance AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function predictCashFlow(
  params: { horizon?: number; vesselId?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const horizon = params.horizon || 90; // days

  // Get financial data
  const [
    { data: invoices },
    { data: expenses },
    { data: payroll },
  ] = await Promise.all([
    supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("financial_transactions").select("*").order("created_at", { ascending: false }).limit(200),
    supabase.from("crew_payroll").select("*").limit(50),
  ]);

  const prompt = `You are a maritime financial analyst. Predict cash flow for the next ${horizon} days.

FINANCIAL DATA:
- Recent Invoices: ${invoices?.length || 0} records
- Recent Expenses: ${expenses?.length || 0} records  
- Payroll Records: ${payroll?.length || 0} records

INVOICES SAMPLE:
${JSON.stringify(invoices?.slice(0, 10), null, 2)}

EXPENSES SAMPLE:
${JSON.stringify(expenses?.slice(0, 10), null, 2)}

Generate cash flow predictions:

Return JSON:
{
  "summary": "Brief executive summary",
  "predictions": [
    { "date": "YYYY-MM-DD", "inflow": 50000, "outflow": 35000, "balance": 15000, "confidence": 85 }
  ],
  "totalInflow": 500000,
  "totalOutflow": 420000,
  "netCashFlow": 80000,
  "criticalDates": [
    { "date": "YYYY-MM-DD", "event": "Large payment due", "impact": "negative", "amount": 50000 }
  ],
  "recommendations": [
    { "action": "Defer non-critical purchases", "impact": "Save $10,000", "priority": "high" }
  ],
  "riskFactors": ["string"],
  "confidence": 82
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    summary: "Cash flow analysis completed",
    predictions: [],
    totalInflow: 0,
    totalOutflow: 0,
    netCashFlow: 0,
    criticalDates: [],
    recommendations: [],
    riskFactors: [],
    confidence: 50,
  });
}

async function detectFraud(
  params: { transactionId?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const { data: transactions } = await supabase
    .from("financial_transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const prompt = `You are a fraud detection specialist for maritime finance. Analyze these transactions for anomalies.

TRANSACTIONS (${transactions?.length || 0} records):
${JSON.stringify(transactions?.slice(0, 20), null, 2)}

Detect potential fraud patterns:
1. Unusual amounts compared to historical patterns
2. Suspicious timing (after hours, weekends)
3. Duplicate or near-duplicate transactions
4. Unusual vendors or destinations
5. Round number patterns

Return JSON:
{
  "overallRiskScore": 15,
  "flaggedTransactions": [
    {
      "transactionId": "uuid",
      "riskScore": 85,
      "anomalyType": "unusual_amount|duplicate|timing|vendor",
      "description": "string",
      "evidence": ["string"],
      "recommendation": "string"
    }
  ],
  "patterns": [
    { "patternType": "string", "description": "string", "frequency": 3, "severity": "high" }
  ],
  "recommendations": ["string"],
  "confidence": 90
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    overallRiskScore: 10,
    flaggedTransactions: [],
    patterns: [],
    recommendations: ["Continue monitoring transactions"],
    confidence: 75,
  });
}

async function optimizeBudget(
  params: { departmentId?: string; fiscalYear?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const { data: budgets } = await supabase
    .from("financial_transactions")
    .select("*")
    .limit(200);

  const prompt = `You are a maritime budget optimization expert. Analyze spending and suggest optimizations.

SPENDING DATA:
${JSON.stringify(budgets?.slice(0, 30), null, 2)}

Provide budget optimization recommendations:

Return JSON:
{
  "currentSpend": 1500000,
  "optimizedSpend": 1350000,
  "potentialSavings": 150000,
  "savingsPercentage": 10,
  "categories": [
    {
      "name": "Fuel",
      "currentBudget": 500000,
      "recommended": 450000,
      "savings": 50000,
      "strategies": ["Optimize routes", "Bulk purchasing"]
    }
  ],
  "quickWins": [
    { "action": "Renegotiate supplier contracts", "savings": 25000, "effort": "low", "timeline": "30 days" }
  ],
  "longTermInitiatives": [
    { "initiative": "Fleet modernization", "investment": 100000, "roi": "250%", "paybackPeriod": "18 months" }
  ],
  "risks": ["string"],
  "confidence": 85
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    currentSpend: 0,
    optimizedSpend: 0,
    potentialSavings: 0,
    savingsPercentage: 0,
    categories: [],
    quickWins: [],
    longTermInitiatives: [],
    risks: [],
    confidence: 50,
  });
}

async function analyzeSuppliers(
  params: { supplierId?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("*")
    .limit(50);

  const prompt = `You are a procurement analyst. Analyze supplier performance and recommend improvements.

SUPPLIERS (${suppliers?.length || 0}):
${JSON.stringify(suppliers?.slice(0, 20), null, 2)}

Analyze and score suppliers:

Return JSON:
{
  "topSuppliers": [
    {
      "supplierId": "uuid",
      "name": "string",
      "overallScore": 92,
      "scores": {
        "quality": 95,
        "delivery": 90,
        "pricing": 88,
        "reliability": 94
      },
      "strengths": ["string"],
      "weaknesses": ["string"]
    }
  ],
  "atRiskSuppliers": [
    { "supplierId": "uuid", "name": "string", "riskLevel": "high", "issues": ["string"], "recommendation": "string" }
  ],
  "consolidationOpportunities": [
    { "category": "string", "currentSuppliers": 5, "recommendedSuppliers": 2, "savings": 15000 }
  ],
  "negotiationPriorities": [
    { "supplierId": "uuid", "name": "string", "potentialSavings": 20000, "leverage": "string" }
  ],
  "newSupplierRecommendations": ["string"],
  "confidence": 85
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    topSuppliers: [],
    atRiskSuppliers: [],
    consolidationOpportunities: [],
    negotiationPriorities: [],
    newSupplierRecommendations: [],
    confidence: 50,
  });
}

async function predictCosts(
  params: { category?: string; horizon?: number },
  supabase: any,
  apiKey: string
): Promise<any> {
  const horizon = params.horizon || 180;

  const prompt = `You are a maritime cost prediction specialist. Predict operational costs for the next ${horizon} days.

Categories to predict:
- Fuel & Bunker
- Crew Wages
- Maintenance & Repairs
- Insurance
- Port Fees
- Supplies & Provisions

Return JSON:
{
  "totalPredictedCost": 2500000,
  "byCategory": [
    {
      "category": "Fuel & Bunker",
      "predicted": 800000,
      "trend": "increasing",
      "trendPercentage": 5,
      "factors": ["Oil prices rising", "Route changes"],
      "optimizationPotential": 50000
    }
  ],
  "monthlyBreakdown": [
    { "month": "2025-02", "predicted": 420000, "confidence": 85 }
  ],
  "volatilityFactors": [
    { "factor": "Oil prices", "impact": "high", "currentTrend": "increasing" }
  ],
  "recommendations": [
    { "action": "Lock in fuel contracts", "potentialSavings": 30000, "urgency": "high" }
  ],
  "confidence": 80
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    totalPredictedCost: 0,
    byCategory: [],
    monthlyBreakdown: [],
    volatilityFactors: [],
    recommendations: [],
    confidence: 50,
  });
}

async function processInvoice(
  params: { invoiceText?: string; ocrData?: any },
  apiKey: string
): Promise<any> {
  const prompt = `You are an invoice processing specialist. Extract and validate invoice data.

INVOICE DATA:
${params.invoiceText || JSON.stringify(params.ocrData, null, 2) || "No data provided"}

Extract invoice information:

Return JSON:
{
  "invoiceNumber": "string",
  "vendorName": "string",
  "vendorId": "string",
  "invoiceDate": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD",
  "lineItems": [
    { "description": "string", "quantity": 1, "unitPrice": 100, "total": 100, "category": "string" }
  ],
  "subtotal": 1000,
  "taxes": 100,
  "total": 1100,
  "currency": "USD",
  "paymentTerms": "Net 30",
  "purchaseOrderReference": "string",
  "validation": {
    "isValid": true,
    "errors": [],
    "warnings": ["string"],
    "matchesPO": true
  },
  "approvalRecommendation": "auto_approve|manual_review|reject",
  "approvalReason": "string",
  "confidence": 92
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    invoiceNumber: "unknown",
    vendorName: "unknown",
    vendorId: null,
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: null,
    lineItems: [],
    subtotal: 0,
    taxes: 0,
    total: 0,
    currency: "USD",
    paymentTerms: "Net 30",
    purchaseOrderReference: null,
    validation: { isValid: false, errors: ["Could not parse invoice"], warnings: [], matchesPO: false },
    approvalRecommendation: "manual_review",
    approvalReason: "Automatic processing failed",
    confidence: 0,
  });
}

async function generateProcurementStrategy(
  params: { category?: string; budget?: number },
  supabase: any,
  apiKey: string
): Promise<any> {
  const prompt = `You are a maritime procurement strategist. Generate a procurement strategy.

Category: ${params.category || "General"}
Available Budget: ${params.budget ? `$${params.budget}` : "Not specified"}

Create a comprehensive procurement strategy:

Return JSON:
{
  "strategyName": "string",
  "objectives": ["string"],
  "timeline": {
    "phases": [
      { "phase": "Planning", "duration": "2 weeks", "activities": ["string"] }
    ],
    "totalDuration": "3 months"
  },
  "sourcingStrategy": {
    "approach": "competitive_bidding|negotiation|framework_agreement",
    "supplierCriteria": ["string"],
    "evaluationWeights": { "price": 40, "quality": 30, "delivery": 20, "reliability": 10 }
  },
  "riskMitigation": [
    { "risk": "string", "probability": "medium", "mitigation": "string" }
  ],
  "budgetAllocation": [
    { "category": "string", "amount": 50000, "percentage": 25 }
  ],
  "kpis": [
    { "metric": "Cost savings", "target": "10%", "measurement": "string" }
  ],
  "recommendations": ["string"],
  "confidence": 85
}`;

  const response = await callLovableAI(prompt, apiKey);
  return parseJsonResponse(response, {
    strategyName: "Standard Procurement Strategy",
    objectives: ["Optimize costs", "Ensure quality"],
    timeline: { phases: [], totalDuration: "3 months" },
    sourcingStrategy: { approach: "competitive_bidding", supplierCriteria: [], evaluationWeights: {} },
    riskMitigation: [],
    budgetAllocation: [],
    kpis: [],
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
        { role: "system", content: "You are an expert maritime finance and procurement analyst. Always respond with valid JSON." },
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
