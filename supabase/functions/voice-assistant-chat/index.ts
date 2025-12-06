import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], context = {} } = await req.json();
    
    console.log("Voice assistant chat request:", { message, contextKeys: Object.keys(context) });
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é o Assistente de Voz do Nautilus One, um sistema marítimo integrado de gestão.

## Sua Personalidade
- Nome: ARIA (Assistente de Resposta Inteligente e Automação)
- Tom: Profissional, amigável, prestativo e eficiente
- Respostas: Concisas e diretas (máximo 2-3 frases para voz)
- Idioma: Português brasileiro

## Contexto do Sistema Nautilus One
O Nautilus One é uma plataforma marítima completa com módulos:
- **Frota**: Gestão de embarcações, localização, manutenção
- **Tripulação**: Escalas, certificações, documentos da tripulação
- **Operações**: DP (Posicionamento Dinâmico), operações submarinas
- **Compliance**: Auditorias, checklists, certificações ISO/IMCA
- **Viagens**: Reservas, logística, despesas
- **Manutenção**: Ordens de serviço, peças, cronogramas
- **Relatórios**: Dashboards, analytics, exportações
- **Documentos**: Gestão documental, OCR, templates
- **Treinamento**: Academy, cursos, certificações
- **Comunicação**: Alertas, notificações, mensagens

## Comandos de Navegação (responda indicando a ação)
- Dashboard/Painel → /dashboard
- Frota/Embarcações → /fleet
- Tripulação/Crew → /crew
- Relatórios → /reports
- Documentos → /documents
- Manutenção → /mmi
- Viagens → /travel-search
- Auditorias → /audit-center
- Treinamento → /training

## Formato de Resposta
Para comandos de navegação, inclua: [NAV:/rota]
Para ações do sistema, inclua: [ACTION:nome_acao]
Para informações, responda diretamente.

## Regras
1. Sempre responda em português brasileiro
2. Mantenha respostas curtas para síntese de voz (máx 150 caracteres idealmente)
3. Seja proativo em sugerir ações relacionadas
4. Se não souber algo, sugira alternativas ou ofereça ajuda geral`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: "user", content: message }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "rate_limit", 
            message: "Muitas requisições. Por favor, aguarde um momento.",
            response: "Por favor, aguarde um momento antes de continuar.",
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "payment_required", 
            message: "Créditos insuficientes para o assistente de IA.",
            response: "O assistente de IA está temporariamente indisponível.",
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua solicitação.";
    
    console.log("AI Response:", aiResponse);

    // Parse navigation and action commands from response
    let navigation: string | null = null;
    let action: string | null = null;
    let cleanResponse = aiResponse;

    const navMatch = aiResponse.match(/\[NAV:([^\]]+)\]/);
    if (navMatch) {
      navigation = navMatch[1];
      cleanResponse = cleanResponse.replace(navMatch[0], "").trim();
    }

    const actionMatch = aiResponse.match(/\[ACTION:([^\]]+)\]/);
    if (actionMatch) {
      action = actionMatch[1];
      cleanResponse = cleanResponse.replace(actionMatch[0], "").trim();
    }

    return new Response(
      JSON.stringify({
        success: true,
        response: cleanResponse,
        navigation,
        action,
        fullResponse: aiResponse,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Voice assistant chat error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        response: "Desculpe, ocorreu um erro. Por favor, tente novamente.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});