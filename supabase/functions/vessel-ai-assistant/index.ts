// @ts-nocheck
/**
 * Vessel AI Assistant Edge Function
 * Specialized AI with access to vessel data, manuals, and diagnostics
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VesselContext {
  vesselId: string;
  vesselName: string;
  specifications?: Record<string, unknown>;
  recentHistory?: unknown[];
  activeSensors?: unknown[];
}

interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  question: string;
  context: VesselContext;
  conversationHistory?: ConversationMessage[];
}

const SYSTEM_PROMPT = `Você é um assistente IA especializado em embarcações marítimas. 

SUAS CAPACIDADES:
1. Responder perguntas técnicas sobre a embarcação
2. Buscar informações em manuais técnicos
3. Fornecer diagnósticos e recomendações de manutenção
4. Alertar sobre prazos de certificados e inspeções
5. Orientar sobre procedimentos de segurança
6. Interpretar dados de sensores

CONHECIMENTO:
- Convenções IMO (SOLAS, MARPOL, STCW)
- MLC 2006 (Maritime Labour Convention)
- Regulamentações de bandeira
- Procedimentos de manutenção preventiva
- Sistemas de propulsão e navegação
- Equipamentos de salvatagem
- Sistemas elétricos e hidráulicos marítimos

COMPORTAMENTO:
- Seja preciso e técnico quando necessário
- Cite fontes quando disponíveis (manuais, regulamentos)
- Indique níveis de urgência quando apropriado
- Sugira ações preventivas
- Responda em português brasileiro
- Use formatação markdown para clareza

LIMITAÇÕES:
- Não tome decisões operacionais críticas sem supervisão humana
- Sempre recomende consulta a especialistas para situações de emergência
- Indique quando uma informação requer verificação`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { question, context, conversationHistory = [] }: RequestBody = await req.json();

    if (!question) {
      throw new Error("Question is required");
    }

    console.log("[VESSEL-AI] Processing question:", question.substring(0, 100));
    console.log("[VESSEL-AI] Vessel context:", context.vesselId);

    // Build context message
    const contextMessage = buildContextMessage(context);
    
    // Build messages array
    const messages: ConversationMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: contextMessage },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      { role: "user", content: question }
    ];

    // Call Lovable AI Gateway
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") || "",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: messages.filter(m => m.role !== "system").map(m => ({
          role: m.role,
          content: m.content
        })),
        system: messages.filter(m => m.role === "system").map(m => m.content).join("\n\n")
      })
    });

    if (!response.ok) {
      console.log("[VESSEL-AI] API call failed, using fallback");
      return new Response(
        JSON.stringify({
          response: generateFallbackResponse(question, context),
          sources: [],
          confidence: 0.5
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiResponse = data.content?.[0]?.text || "Desculpe, não consegui processar sua pergunta.";

    // Detect relevant sources based on question
    const sources = detectSources(question);

    console.log("[VESSEL-AI] Response generated successfully");

    return new Response(
      JSON.stringify({
        response: aiResponse,
        sources,
        confidence: 0.85,
        model: "claude-sonnet-4-20250514",
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const error = err as Error;
    console.error("[VESSEL-AI] Error:", error.message);
    
    return new Response(
      JSON.stringify({
        response: "Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.",
        error: error.message,
        sources: [],
        confidence: 0
      }),
      { 
        status: 200, // Return 200 to show error message in UI
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

function buildContextMessage(context: VesselContext): string {
  let message = `CONTEXTO DA EMBARCAÇÃO:
- ID: ${context.vesselId}
- Nome: ${context.vesselName}`;

  if (context.specifications) {
    message += `\n- Especificações: ${JSON.stringify(context.specifications)}`;
  }

  if (context.recentHistory && context.recentHistory.length > 0) {
    message += `\n- Eventos recentes: ${context.recentHistory.length} registros disponíveis`;
  }

  if (context.activeSensors && context.activeSensors.length > 0) {
    message += `\n- Sensores ativos: ${context.activeSensors.length} sensores monitorando`;
  }

  return message;
}

function detectSources(question: string): { type: string; title: string; reference?: string }[] {
  const sources = [];
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes("manual") || lowerQuestion.includes("procedimento") || lowerQuestion.includes("como fazer")) {
    sources.push({
      type: "manual",
      title: "Manuais Técnicos",
      reference: "Biblioteca de Manuais"
    });
  }

  if (lowerQuestion.includes("manutenção") || lowerQuestion.includes("manter") || lowerQuestion.includes("preventiva")) {
    sources.push({
      type: "history",
      title: "Histórico de Manutenção",
      reference: "Registros de Serviço"
    });
  }

  if (lowerQuestion.includes("sensor") || lowerQuestion.includes("temperatura") || lowerQuestion.includes("pressão") || lowerQuestion.includes("vibração")) {
    sources.push({
      type: "sensor",
      title: "Dados de Sensores",
      reference: "Telemetria em Tempo Real"
    });
  }

  if (lowerQuestion.includes("peça") || lowerQuestion.includes("parte") || lowerQuestion.includes("componente") || lowerQuestion.includes("sobressalente")) {
    sources.push({
      type: "part",
      title: "Catálogo de Partes",
      reference: "Inventário de Peças"
    });
  }

  // Always include regulations for compliance questions
  if (lowerQuestion.includes("certificado") || lowerQuestion.includes("inspeção") || lowerQuestion.includes("solas") || lowerQuestion.includes("imo")) {
    sources.push({
      type: "manual",
      title: "Regulamentações IMO",
      reference: "SOLAS, MARPOL, MLC"
    });
  }

  return sources;
}

function generateFallbackResponse(question: string, context: VesselContext): string {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes("manutenção")) {
    return `Para informações sobre manutenção da embarcação ${context.vesselName}:

1. **Manutenção Preventiva**: Consulte o plano de manutenção no módulo MMI
2. **Histórico**: Verifique os registros anteriores na timeline
3. **Próximas Ações**: Acesse o calendário de manutenções programadas

Para diagnósticos específicos, recomendo verificar os dados dos sensores e o histórico de ocorrências.`;
  }

  if (lowerQuestion.includes("emergência") || lowerQuestion.includes("segurança")) {
    return `⚠️ **PROCEDIMENTOS DE EMERGÊNCIA**

Para situações de emergência, siga os protocolos estabelecidos:
1. Acione o alarme geral
2. Contate a ponte de comando
3. Siga os procedimentos do SOPEP/SMPEP

📖 Consulte os manuais de segurança disponíveis na biblioteca de documentos.

**Importante**: Em caso de emergência real, priorize a segurança da tripulação e siga as ordens do comandante.`;
  }

  if (lowerQuestion.includes("certificado")) {
    return `Para verificar certificados da embarcação ${context.vesselName}:

1. Acesse o módulo de **Certificados** no menu principal
2. Verifique datas de validade e renovações pendentes
3. Alertas automáticos são enviados 60/30/15 dias antes do vencimento

Certificados principais: Classe, Segurança, Rádio, Poluição, Trabalho Marítimo (MLC).`;
  }

  return `Obrigado pela sua pergunta sobre "${question.substring(0, 50)}...". 

Para uma resposta mais precisa, posso ajudar com:
- **Especificações técnicas** da embarcação
- **Procedimentos de manutenção** e operação
- **Consulta a manuais** técnicos
- **Verificação de certificados** e prazos
- **Análise de sensores** e diagnósticos

Por favor, refine sua pergunta ou escolha uma das opções rápidas acima.`;
}
