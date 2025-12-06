import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { telemetry, analysisType } = await req.json();
    
    console.log("DP Intelligence Analysis request:", { analysisType, telemetry });

    const systemPrompt = `Você é o DPO AI Advisor, um sistema especialista em Dynamic Positioning (DP) para embarcações offshore. Você tem profundo conhecimento em:

- Sistemas de posicionamento dinâmico (DP1, DP2, DP3)
- Manutenção preventiva e preditiva de thrusters
- Análise de gyro drift e reference systems
- Gerenciamento de energia e power management
- Protocolos de segurança DP da IMO
- Normas IMCA M 117 e M 140
- Análise de capability plots
- Gerenciamento de redundância

Forneça análises técnicas precisas, recomendações de segurança e insights operacionais baseados nos dados de telemetria.`;

    let userPrompt = "";

    switch (analysisType) {
      case "full":
        userPrompt = `Analise os seguintes dados de telemetria DP e forneça um relatório completo:

DADOS DE TELEMETRIA:
- Thrusters Ativos: ${telemetry.activeThrusters}/${telemetry.totalThrusters}
- Potência Total: ${telemetry.totalPower} MW
- Heading: ${telemetry.heading}°
- Gyro Drift: ${telemetry.gyroDrift}°/min
- Bus A Status: ${telemetry.busA}
- Bus B Status: ${telemetry.busB}
- DP Confidence: ${telemetry.confidence}%
- Wind Speed: ${telemetry.windSpeed || 'N/A'} knots
- Current: ${telemetry.current || 'N/A'} knots
- Wave Height: ${telemetry.waveHeight || 'N/A'} m

Forneça:
1. STATUS GERAL: Avaliação do estado atual do sistema DP
2. ANÁLISE DE THRUSTERS: Performance e recomendações
3. ANÁLISE DE SENSORES: Qualidade das referências e gyros
4. AMBIENTE: Impacto das condições ambientais
5. ALERTAS: Qualquer anomalia ou preocupação
6. RECOMENDAÇÕES: Ações sugeridas para operação segura`;
        break;

      case "predictive":
        userPrompt = `Baseado nos dados de telemetria DP, realize análise preditiva:

DADOS ATUAIS:
- Thrusters: ${telemetry.activeThrusters}/${telemetry.totalThrusters}
- Potência: ${telemetry.totalPower} MW
- Gyro Drift: ${telemetry.gyroDrift}°/min
- DP Confidence: ${telemetry.confidence}%

Forneça:
1. PREVISÃO DE FALHAS: Probabilidade de falhas nas próximas 24h
2. MANUTENÇÃO PREVENTIVA: Componentes que precisam de atenção
3. OTIMIZAÇÃO: Sugestões para melhorar eficiência
4. TENDÊNCIAS: Padrões identificados nos dados`;
        break;

      case "emergency":
        userPrompt = `ALERTA DE EMERGÊNCIA DP - Análise urgente necessária:

SITUAÇÃO:
- Thrusters Ativos: ${telemetry.activeThrusters}/${telemetry.totalThrusters}
- Status Bus A: ${telemetry.busA}
- Status Bus B: ${telemetry.busB}
- DP Confidence: ${telemetry.confidence}%
- Alerta: ${telemetry.alertMessage || 'Sistema degradado'}

Forneça IMEDIATAMENTE:
1. AÇÃO IMEDIATA: O que fazer agora
2. AVALIAÇÃO DE RISCO: Nível de criticidade
3. CONTINGÊNCIA: Plano de backup
4. COMUNICAÇÕES: O que reportar e para quem`;
        break;

      case "optimization":
        userPrompt = `Análise de otimização de consumo energético DP:

DADOS DE ENERGIA:
- Potência Total: ${telemetry.totalPower} MW
- Thrusters Ativos: ${telemetry.activeThrusters}
- Condições Ambientais: Vento ${telemetry.windSpeed || 15} knots

Forneça:
1. EFICIÊNCIA ATUAL: Avaliação do consumo
2. OTIMIZAÇÃO: Como reduzir consumo mantendo segurança
3. ECONOMIA PROJETADA: Estimativa de redução
4. CONFIGURAÇÃO IDEAL: Setup recomendado para as condições`;
        break;

      default:
        userPrompt = `Faça uma análise rápida do status DP:
Thrusters: ${telemetry.activeThrusters}/${telemetry.totalThrusters}
Potência: ${telemetry.totalPower} MW
Confidence: ${telemetry.confidence}%

Forneça um resumo de 3-4 linhas sobre o status operacional.`;
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
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded", 
          message: "Muitas requisições. Tente novamente em alguns segundos." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Payment required", 
          message: "Créditos insuficientes. Adicione créditos ao workspace." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log("DP Intelligence Analysis completed successfully");

    return new Response(JSON.stringify({
      success: true,
      analysis,
      analysisType,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in DP Intelligence AI:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Erro na análise DP Intelligence. Tente novamente."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
