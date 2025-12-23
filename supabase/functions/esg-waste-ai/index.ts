import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ESGRequest {
  type: 'emissions_analysis' | 'waste_classification' | 'compliance_check' | 
        'recommendations' | 'report_generation' | 'predictive_analysis' | 'chat';
  data: Record<string, unknown>;
  context?: string;
}

const getSystemPrompt = (type: string): string => {
  const prompts: Record<string, string> = {
    emissions_analysis: `Você é um especialista em ESG e análise de emissões marítimas.
Analise os dados de emissões fornecidos e forneça:
- Resumo executivo das emissões
- Comparativo com metas IMO 2030/2050
- Cálculo de CII Rating estimado
- Identificação de principais fontes de emissão
- Recomendações de redução específicas
- Projeção de economia potencial
Responda em português brasileiro de forma técnica mas acessível.`,

    waste_classification: `Você é um especialista em gestão de resíduos marítimos conforme MARPOL.
Com base na descrição fornecida, classifique o resíduo:
- Categoria MARPOL (A-I)
- Anexo aplicável (I-VI)
- Requisitos de destinação
- Documentação necessária (MTR, CADRI)
- Procedimentos de armazenamento a bordo
- Alertas de conformidade
Responda em português brasileiro.`,

    compliance_check: `Você é um auditor de compliance ambiental marítimo.
Analise a situação de conformidade e forneça:
- Status de conformidade por regulamento (IMO, EU MRV, DCS)
- Gaps identificados
- Riscos de não-conformidade
- Ações corretivas necessárias
- Prazos regulatórios aplicáveis
- Priorização de ações
Responda em português brasileiro.`,

    recommendations: `Você é um consultor de sustentabilidade marítima.
Com base nos dados fornecidos, gere recomendações:
- Ações de curto prazo (até 3 meses)
- Ações de médio prazo (3-12 meses)
- Ações de longo prazo (1-5 anos)
- Estimativa de investimento
- Potencial de redução de emissões
- ROI ambiental e financeiro
Responda em português brasileiro.`,

    report_generation: `Você é um especialista em relatórios ESG marítimos.
Gere um relatório estruturado contendo:
- Sumário executivo
- Métricas principais (KPIs)
- Análise de tendências
- Benchmarking setorial
- Conclusões e recomendações
- Próximos passos
Formate em markdown para fácil leitura. Responda em português brasileiro.`,

    predictive_analysis: `Você é um analista de dados ambientais marítimos.
Realize análise preditiva dos dados:
- Tendências identificadas
- Projeção para próximos 12 meses
- Fatores de risco
- Cenários otimista/pessimista/realista
- Recomendações baseadas em dados
- Nível de confiança das previsões
Responda em português brasileiro.`,

    chat: `Você é o assistente de IA Nautilus, especializado em ESG e gestão ambiental marítima.
Seu conhecimento inclui:
- Convenções MARPOL (Anexos I-VI)
- Regulamentos IMO de emissões (EEXI, CII, EEDI)
- EU MRV e DCS
- Gestão de resíduos a bordo
- Economia circular marítima
- Melhores práticas de sustentabilidade
Responda de forma clara, técnica e em português brasileiro.`
  };

  return prompts[type] || prompts.chat;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data, context }: ESGRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const systemPrompt = getSystemPrompt(type);
    const userMessage = context 
      ? `Contexto: ${context}\n\nDados: ${JSON.stringify(data, null, 2)}`
      : JSON.stringify(data, null, 2);

    console.log(`[ESG-Waste-AI] Processando requisição tipo: ${type}`);

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
          { role: "user", content: userMessage }
        ],
        stream: false,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ESG-Waste-AI] Erro da API: ${response.status}`, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Limite de requisições excedido. Tente novamente em alguns segundos." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Créditos de IA esgotados. Contate o administrador." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "Sem resposta da IA";

    console.log(`[ESG-Waste-AI] Resposta gerada com sucesso`);

    return new Response(JSON.stringify({ 
      success: true,
      response: content,
      type,
      model: "google/gemini-2.5-flash",
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[ESG-Waste-AI] Erro:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Erro desconhecido",
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
