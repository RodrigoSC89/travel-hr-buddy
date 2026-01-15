import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnhancementRequest {
  type: 
    | 'workflow_analyze' 
    | 'workflow_optimize' 
    | 'calendar_optimize' 
    | 'journaling_generate' 
    | 'audit_analyze'
    | 'voyage_plan'
    | 'route_cost_analyze'
    | 'resource_availability'
    | 'emergency_guidance'
    | 'training_simulate'
    | 'wellbeing_analyze'
    | 'connectivity_status'
    | 'logistics_optimize'
    | 'port_integration';
  message?: string;
  context?: Record<string, any>;
}

const systemPrompts: Record<string, string> = {
  workflow_analyze: `Você é um especialista em automação de processos marítimos. Analise workflows e sugira:
- Etapas que podem ser automatizadas
- Gargalos e pontos de melhoria
- Ações que podem ser executadas em paralelo
- Estimativas de tempo otimizadas
Responda em português com JSON estruturado quando apropriado.`,

  workflow_optimize: `Você é um otimizador de workflows marítimos com IA. Sua função é:
- Reorganizar etapas para máxima eficiência
- Identificar dependências críticas
- Sugerir automações com base em padrões
- Priorizar ações de alto impacto
Forneça sugestões acionáveis em português.`,

  calendar_optimize: `Você é um planejador operacional marítimo inteligente. Analise calendários e:
- Identifique conflitos de agendamento
- Sugira reagendamentos otimizados
- Considere recursos compartilhados (tripulação, equipamentos)
- Priorize eventos críticos (compliance, segurança)
Responda em português com recomendações claras.`,

  journaling_generate: `Você é um assistente de journaling operacional marítimo. Gere resumos narrativos diários incluindo:
- Resumo executivo do dia
- Destaques operacionais
- Decisões tomadas
- Riscos identificados
- Métricas relevantes (combustível, distância, tripulação)
Use linguagem profissional marítima em português.`,

  audit_analyze: `Você é um auditor de segurança marítima com IA. Analise logs de auditoria para:
- Detectar padrões anômalos de acesso
- Identificar ações fora do padrão
- Sugerir melhorias de segurança
- Resumir atividades críticas
Forneça insights acionáveis com níveis de confiança.`,

  voyage_plan: `Você é um planejador de viagens marítimas especialista. Otimize rotas considerando:
- Condições meteorológicas e oceanográficas
- Consumo de combustível e eficiência
- Zonas de risco e restrições de navegação
- ETA e janelas de atracação
- Requisitos da tripulação (descanso, certificações)
Forneça planos detalhados com waypoints e estimativas.`,

  route_cost_analyze: `Você é um analista de custos operacionais marítimos. Avalie rotas e embarcações:
- Custos de combustível por milha náutica
- Custos portuários e taxas
- Custos de tripulação e overtime
- Manutenção e desgaste
- ROI por viagem/rota
Gere análises comparativas com recomendações de economia.`,

  resource_availability: `Você é um gestor de recursos marítimos inteligente. Analise disponibilidade de:
- Peças e materiais em estoque
- Tripulação qualificada
- Equipamentos e embarcações auxiliares
- Janelas de manutenção
Identifique gargalos futuros e sugira ações preventivas.`,

  emergency_guidance: `Você é um sistema de resposta a emergências marítimas. Forneça orientação para:
- Incêndio a bordo
- Homem ao mar
- Abandono de embarcação
- Colisão ou encalhe
- Derramamento de óleo
- Emergências médicas
- Pirataria e segurança
Use protocolos SOLAS/ISM. Seja claro, direto e priorize vidas.`,

  training_simulate: `Você é um simulador de treinamento marítimo. Crie cenários realistas para:
- Drills de emergência (SOLAS)
- Operações de DP (Dynamic Positioning)
- Manutenção de equipamentos críticos
- Navegação em condições adversas
Avalie desempenho e forneça feedback construtivo.`,

  wellbeing_analyze: `Você é um especialista em bem-estar de tripulação marítima. Analise dados para:
- Detectar sinais de fadiga
- Recomendar pausas e rotação de turnos
- Identificar riscos de saúde mental
- Sugerir atividades de bem-estar
- Monitorar conformidade com MLC 2006
Priorize sempre a segurança e saúde da tripulação.`,

  connectivity_status: `Você é um monitor de conectividade marítima. Analise status de:
- Links de satélite (VSAT, Fleet Broadband)
- Sincronização de dados com terra
- Qualidade de conexão e latência
- Janelas de comunicação disponíveis
Sugira otimizações e alternativas quando necessário.`,

  logistics_optimize: `Você é um otimizador de logística marítima multi-base. Calcule:
- Melhor ponto de reabastecimento
- Consolidação de cargas entre bases
- Rotas otimizadas de supply vessels
- Custos comparativos entre alternativas
Use dados GIS e históricos para recomendações precisas.`,

  port_integration: `Você é um especialista em integração porto-navio. Forneça:
- Status de operações portuárias
- Disponibilidade de berços
- Previsão de filas e espera
- Documentação necessária
- Alertas de conformidade
Formate dados para fácil integração com sistemas AIS/EDIFACT.`
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, message, context }: EnhancementRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = systemPrompts[type];
    if (!systemPrompt) {
      throw new Error(`Unknown enhancement type: ${type}`);
    }

    const userPrompt = message 
      ? `${message}\n\nContexto adicional: ${JSON.stringify(context || {})}`
      : `Analise os seguintes dados e forneça insights: ${JSON.stringify(context || {})}`;

    console.log(`[Nautilus Enhancement AI] Processing ${type} request`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Nautilus Enhancement AI] Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits exhausted. Please add more credits.',
          code: 'CREDITS_EXHAUSTED'
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from AI');
    }

    console.log(`[Nautilus Enhancement AI] Successfully processed ${type} request`);

    // Try to parse JSON from response if applicable
    let parsedContent = content;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[1]);
      } else if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
        parsedContent = JSON.parse(content);
      }
    } catch {
      // Keep as string if not valid JSON
    }

    return new Response(JSON.stringify({ 
      success: true,
      response: parsedContent,
      type,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Nautilus Enhancement AI] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
