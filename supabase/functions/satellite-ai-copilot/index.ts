/**
 * Satellite AI Copilot Edge Function
 * Provides AI-powered satellite tracking analysis
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SatelliteData {
  name: string;
  orbit_type: string;
  altitude_km: number;
  latitude: number;
  longitude: number;
  status: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, satellites, selectedSatellite } = await req.json();

    console.log("Satellite AI Copilot request:", { message, satelliteCount: satellites?.length });

    // Build context from satellite data
    const satelliteContext = satellites?.map((s: SatelliteData) => 
      `- ${s.name}: ${s.orbit_type} orbit, ${s.altitude_km.toFixed(0)}km altitude, position (${s.latitude.toFixed(2)}°, ${s.longitude.toFixed(2)}°), status: ${s.status}`
    ).join('\n') || 'No satellites available';

    const selectedContext = selectedSatellite 
      ? `\n\nCurrently selected satellite: ${selectedSatellite.name} (NORAD ID: ${selectedSatellite.norad_id}, ${selectedSatellite.orbit_type} orbit, ${selectedSatellite.altitude_km.toFixed(0)}km altitude, operated by ${selectedSatellite.country}, purpose: ${selectedSatellite.purpose})`
      : '';

    const systemPrompt = `Você é um especialista em rastreamento de satélites e operações espaciais. Você tem acesso a dados em tempo real de satélites em órbita.

DADOS ATUAIS DOS SATÉLITES MONITORADOS:
${satelliteContext}
${selectedContext}

SUAS CAPACIDADES:
- Analisar posições e trajetórias orbitais
- Calcular cobertura e área de visibilidade
- Prever próximas passagens sobre localizações específicas
- Avaliar riscos de colisão e conjunções
- Fornecer informações técnicas sobre satélites
- Explicar parâmetros orbitais (período, inclinação, altitude)

REGRAS:
- Responda sempre em português brasileiro
- Use formatação markdown para melhor legibilidade
- Forneça dados numéricos precisos quando disponíveis
- Seja técnico mas acessível
- Para previsões de passagens, considere a localização mencionada
- Inclua emojis relevantes para melhor visualização

Responda à pergunta do usuário de forma útil e informativa.`;

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua solicitação.";

    console.log("Satellite AI Copilot response generated successfully");

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Satellite AI Copilot error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({ 
        error: "Erro ao processar solicitação",
        message: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
