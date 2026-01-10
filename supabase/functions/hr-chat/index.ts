/**
 * HR Chatbot AI - Edge Function
 * Chatbot 24/7 usando Lovable AI Gateway
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, employeeContext, type = 'chat' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // System prompt baseado no contexto do colaborador
    const systemPrompt = `Você é o assistente virtual de RH da Nautilus One, uma plataforma de gestão marítima.

CONTEXTO DO COLABORADOR:
${employeeContext ? `
- Nome: ${employeeContext.name}
- Cargo: ${employeeContext.position}
- Departamento: ${employeeContext.department}
- Data de Admissão: ${employeeContext.hireDate}
- Saldo de Férias: ${employeeContext.vacationDays} dias
- Último Holerite: ${employeeContext.lastPayslip?.month || 'N/A'}
- Salário Líquido: R$ ${employeeContext.lastPayslip?.netSalary?.toFixed(2) || 'N/A'}
` : 'Colaborador não identificado'}

SUAS CAPACIDADES:
1. Responder dúvidas sobre:
   - Holerite e folha de pagamento (INSS, IRRF, FGTS)
   - Férias e licenças
   - Benefícios (VR, VA, Plano de Saúde)
   - Políticas de RH
   - CLT e direitos trabalhistas
   - Treinamentos disponíveis

2. Orientar sobre processos:
   - Como solicitar férias
   - Como enviar atestados
   - Como acessar documentos
   - Como agendar reuniões com RH

3. Ajudar com:
   - Dúvidas sobre descontos
   - Cálculo de horas extras
   - Entendimento do holerite

REGRAS:
- Seja sempre profissional, amigável e objetivo
- Responda em português do Brasil
- Se não souber algo específico, diga que vai verificar com o RH
- Nunca invente informações sobre salários ou benefícios específicos
- Forneça informações úteis baseadas na CLT quando relevante
- Se o colaborador parecer frustrado, ofereça encaminhar para RH humano`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: type === 'stream',
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Streaming response
    if (type === 'stream') {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming response
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";

    return new Response(
      JSON.stringify({ success: true, content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("HR Chat error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
