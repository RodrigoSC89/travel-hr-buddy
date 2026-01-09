import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, sensorData, historicalData, alertThresholds } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "anomaly_detection":
        systemPrompt = `You are an AI expert in maritime vessel sensor analytics and anomaly detection.
        Analyze sensor readings to identify anomalies, predict failures, and recommend preventive actions.
        Consider normal operating ranges for marine equipment: engines, pumps, generators, navigation systems.
        Output JSON with: anomalies (array of {sensorId, severity, description}), predictions (array), recommendations (array).`;
        userPrompt = `Analyze these sensor readings for anomalies:\n${JSON.stringify(sensorData, null, 2)}\n\nHistorical baseline:\n${JSON.stringify(historicalData || {}, null, 2)}`;
        break;

      case "predictive_maintenance":
        systemPrompt = `You are a predictive maintenance AI for maritime vessels.
        Based on sensor trends, predict equipment failures before they occur.
        Consider vibration patterns, temperature trends, pressure fluctuations, and operational hours.
        Output JSON with: predictions (array of {equipment, failureProbability, estimatedTimeToFailure, recommendedAction}), priorityActions (array).`;
        userPrompt = `Predict maintenance needs based on:\n${JSON.stringify(sensorData, null, 2)}`;
        break;

      case "optimize_operations":
        systemPrompt = `You are an operational optimization AI for maritime vessels.
        Analyze sensor data to recommend efficiency improvements for fuel consumption, engine performance, and HVAC systems.
        Output JSON with: currentEfficiency (%), optimizations (array of {area, currentValue, recommendedValue, estimatedSavings}), totalPotentialSavings.`;
        userPrompt = `Optimize operations based on current sensor data:\n${JSON.stringify(sensorData, null, 2)}`;
        break;

      case "generate_alerts":
        systemPrompt = `You are a maritime safety alert AI. Generate actionable alerts based on sensor readings.
        Categorize by severity: critical (immediate action), warning (attention needed), info (monitoring).
        Output JSON with: alerts (array of {id, sensorId, severity, title, description, suggestedAction, timestamp}).`;
        userPrompt = `Generate alerts for these readings:\n${JSON.stringify(sensorData, null, 2)}\n\nThresholds:\n${JSON.stringify(alertThresholds || {}, null, 2)}`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

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
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let result;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : { analysis: content };
    } catch {
      result = { analysis: content };
    }

    console.log(`IoT Analytics [${action}] completed`);

    return new Response(JSON.stringify({ success: true, result, action }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("IoT Analytics error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
