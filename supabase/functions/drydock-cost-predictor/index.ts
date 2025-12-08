import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DrydockPredictionRequest {
  vessel_id: string;
  vessel_type: string;
  vessel_age_years: number;
  dwt: number;
  last_drydock_date: string;
  hull_condition_score: number;
  shipyard_location: string;
  work_scope: string[];
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: DrydockPredictionRequest = await req.json();

    // Base cost calculation factors
    const baseCostPerDWT = 0.8; // USD per DWT
    const ageFactor = 1 + (requestData.vessel_age_years * 0.02); // 2% increase per year of age
    const conditionFactor = 2 - (requestData.hull_condition_score / 10); // Lower condition = higher cost
    
    // Work scope cost factors
    const workScopeCosts: Record<string, number> = {
      hull_cleaning: 15000,
      hull_painting: 80000,
      propeller_polishing: 25000,
      propeller_repair: 120000,
      rudder_inspection: 20000,
      sea_chest_cleaning: 35000,
      anode_replacement: 45000,
      tailshaft_survey: 60000,
      valve_overhaul: 40000,
      tank_coating: 150000,
      ballast_tank_repair: 200000,
      class_renewal_survey: 50000,
    };

    // Location cost multipliers
    const locationMultipliers: Record<string, number> = {
      china: 0.7,
      singapore: 1.0,
      dubai: 0.85,
      europe: 1.3,
      usa: 1.4,
      brazil: 0.9,
      korea: 0.95,
      japan: 1.1,
    };

    // Calculate base cost
    let estimatedCost = requestData.dwt * baseCostPerDWT * ageFactor * conditionFactor;

    // Add work scope costs
    for (const scope of requestData.work_scope) {
      estimatedCost += workScopeCosts[scope] || 30000;
    }

    // Apply location multiplier
    const locationKey = requestData.shipyard_location.toLowerCase().replace(/\s+/g, '_');
    const locationMult = locationMultipliers[locationKey] || 1.0;
    estimatedCost *= locationMult;

    // Calculate duration estimate (days)
    const baseDuration = 14; // Base drydock duration
    const scopeDuration = requestData.work_scope.length * 2;
    const conditionDuration = Math.max(0, (5 - requestData.hull_condition_score / 2));
    const estimatedDuration = Math.ceil(baseDuration + scopeDuration + conditionDuration);

    // Generate AI recommendations
    const systemPrompt = `You are a maritime drydock cost analyst. Analyze the vessel data and provide cost optimization recommendations in JSON format.`;
    
    const userPrompt = `Analyze this drydock request:
    - Vessel Type: ${requestData.vessel_type}
    - DWT: ${requestData.dwt}
    - Age: ${requestData.vessel_age_years} years
    - Hull Condition: ${requestData.hull_condition_score}/10
    - Shipyard Location: ${requestData.shipyard_location}
    - Work Scope: ${requestData.work_scope.join(', ')}
    - Estimated Cost: $${Math.round(estimatedCost).toLocaleString()}
    - Estimated Duration: ${estimatedDuration} days
    
    Provide 3-5 cost optimization recommendations.`;

    // Call AI for recommendations
    let recommendations: string[] = [];
    try {
      const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") || "",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 500,
          messages: [
            { role: "user", content: userPrompt }
          ],
          system: systemPrompt,
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const content = aiData.content?.[0]?.text || "";
        // Parse recommendations from AI response
        recommendations = content.split('\n').filter((line: string) => 
          line.trim().startsWith('-') || line.trim().match(/^\d\./)
        ).slice(0, 5);
      }
    } catch (e) {
      console.error("AI recommendation error:", e);
      recommendations = [
        "Consider grouping multiple vessels for bulk discount",
        "Schedule during off-peak season for better rates",
        "Request competitive quotes from multiple shipyards",
        "Optimize work scope based on actual inspection findings",
        "Consider regional shipyards for cost savings",
      ];
    }

    const response = {
      estimated_cost: Math.round(estimatedCost),
      estimated_duration_days: estimatedDuration,
      cost_breakdown: {
        base_cost: Math.round(requestData.dwt * baseCostPerDWT),
        age_adjustment: Math.round(requestData.dwt * baseCostPerDWT * (ageFactor - 1)),
        condition_adjustment: Math.round(requestData.dwt * baseCostPerDWT * (conditionFactor - 1)),
        work_scope_cost: requestData.work_scope.reduce((sum, scope) => 
          sum + (workScopeCosts[scope] || 30000), 0),
        location_adjustment: Math.round(estimatedCost * (locationMult - 1) / locationMult),
      },
      confidence_level: requestData.hull_condition_score >= 7 ? "high" : 
                        requestData.hull_condition_score >= 5 ? "medium" : "low",
      recommendations,
      optimal_timing: {
        recommended_period: "Q1 2025",
        reason: "Lower shipyard utilization typically reduces costs by 10-15%",
      },
      comparable_quotes: [
        { shipyard: "Singapore", estimated: Math.round(estimatedCost * 1.0), currency: "USD" },
        { shipyard: "China", estimated: Math.round(estimatedCost * 0.7), currency: "USD" },
        { shipyard: "Dubai", estimated: Math.round(estimatedCost * 0.85), currency: "USD" },
      ],
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const err = error as Error;
    console.error("Drydock cost prediction error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
