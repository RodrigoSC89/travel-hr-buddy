import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentDecision {
  agentName: string;
  recommendation: string;
  confidence: number;
  reasoning: string;
  risks: string[];
  actions: string[];
}

const AGENT_PROMPTS = {
  captain: `You are the CAPTAIN AI Agent for maritime operations. Focus on navigation safety, voyage planning, weather routing, and overall vessel command decisions. Prioritize crew and vessel safety above all.`,
  
  engineer: `You are the CHIEF ENGINEER AI Agent. Focus on machinery health, fuel efficiency, maintenance priorities, and technical reliability. Ensure propulsion and critical systems operate optimally.`,
  
  safety: `You are the SAFETY OFFICER AI Agent. Focus on regulatory compliance (SOLAS, ISM, ISPS), risk assessment, emergency preparedness, and crew safety training. Flag any potential hazards.`,
  
  wellness: `You are the CREW WELLNESS AI Agent. Focus on fatigue management (STCW), mental health indicators, workload distribution, and crew morale. Ensure MLC 2006 compliance for rest hours.`,
  
  navigator: `You are the NAVIGATOR AI Agent. Focus on route optimization, weather analysis, ETA predictions, and fuel-efficient waypoints. Consider piracy zones and traffic separation schemes.`,
  
  economist: `You are the ECONOMIST AI Agent. Focus on operational costs, bunker optimization, port cost analysis, and charter party economics. Maximize voyage profitability.`,
  
  predictor: `You are the PREDICTOR AI Agent. Focus on predictive maintenance, failure probability, spare parts needs, and equipment lifecycle. Prevent unplanned downtime.`,
  
  communicator: `You are the COMMUNICATOR AI Agent. Focus on stakeholder updates, reporting requirements, flag state communications, and emergency broadcasts. Ensure clear information flow.`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { situation, context, requiredAgents = ['captain', 'safety', 'engineer'] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log(`Multi-agent consensus requested for: ${situation}`);
    console.log(`Agents involved: ${requiredAgents.join(', ')}`);

    // Query each agent in parallel
    const agentPromises = requiredAgents.map(async (agentId: string): Promise<AgentDecision> => {
      const agentPrompt = AGENT_PROMPTS[agentId as keyof typeof AGENT_PROMPTS];
      if (!agentPrompt) {
        return {
          agentName: agentId,
          recommendation: "Agent not found",
          confidence: 0,
          reasoning: "Unknown agent type",
          risks: [],
          actions: []
        };
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
            { role: "system", content: `${agentPrompt}\n\nRespond in JSON format with: recommendation (string), confidence (0-100), reasoning (string), risks (array of strings), actions (array of strings).` },
            { role: "user", content: `Situation: ${situation}\n\nContext: ${JSON.stringify(context)}\n\nProvide your expert recommendation.` }
          ],
        }),
      });

      if (!response.ok) {
        return {
          agentName: agentId,
          recommendation: "Error querying agent",
          confidence: 0,
          reasoning: `API error: ${response.status}`,
          risks: [],
          actions: []
        };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      try {
        const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : {};
        return {
          agentName: agentId,
          recommendation: parsed.recommendation || content.slice(0, 200),
          confidence: parsed.confidence || 70,
          reasoning: parsed.reasoning || "",
          risks: parsed.risks || [],
          actions: parsed.actions || []
        };
      } catch {
        return {
          agentName: agentId,
          recommendation: content.slice(0, 200),
          confidence: 70,
          reasoning: content,
          risks: [],
          actions: []
        };
      }
    });

    const agentDecisions = await Promise.all(agentPromises);

    // Calculate consensus
    const avgConfidence = agentDecisions.reduce((sum, d) => sum + d.confidence, 0) / agentDecisions.length;
    const allRisks = [...new Set(agentDecisions.flatMap(d => d.risks))];
    const allActions = [...new Set(agentDecisions.flatMap(d => d.actions))];

    // Generate final consensus using AI
    const consensusResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are the CONSENSUS COORDINATOR. Synthesize multiple AI agent recommendations into a unified decision. Weigh each agent's confidence and expertise. Output a final recommendation with clear action items." },
          { role: "user", content: `Agent Recommendations:\n${JSON.stringify(agentDecisions, null, 2)}\n\nSynthesize into a final consensus decision.` }
        ],
      }),
    });

    let finalConsensus = "Consensus could not be determined";
    if (consensusResponse.ok) {
      const consensusData = await consensusResponse.json();
      finalConsensus = consensusData.choices?.[0]?.message?.content || finalConsensus;
    }

    const result = {
      situation,
      timestamp: new Date().toISOString(),
      agentDecisions,
      consensus: {
        averageConfidence: Math.round(avgConfidence),
        aggregatedRisks: allRisks,
        recommendedActions: allActions,
        finalDecision: finalConsensus
      }
    };

    console.log(`Consensus achieved with ${avgConfidence.toFixed(1)}% average confidence`);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Agent Consensus error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
