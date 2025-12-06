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
    const { type, data, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "workflow_suggestions":
        systemPrompt = `Você é um especialista em automação de processos marítimos e operações offshore.
Sugira automações inteligentes e workflows para otimizar operações.
Responda em português com sugestões práticas e acionáveis.
Formato JSON para fácil parsing.`;
        userPrompt = `Sugira 3-5 automações importantes para operações marítimas offshore que aumentem eficiência e reduzam riscos. 
Contexto atual: ${JSON.stringify(data || {})}
Retorne no formato JSON: { "suggestions": [{ "title": "", "description": "", "trigger": "", "actions": [], "impact": "", "priority": "high|medium|low" }] }`;
        break;

      case "report_suggestions":
        systemPrompt = `Você é um especialista em relatórios e analytics para operações marítimas.
Sugira relatórios automatizados importantes para gestão.
Responda em português com sugestões práticas.`;
        userPrompt = `Sugira 3-5 tipos de relatórios automatizados importantes para operações marítimas offshore, com frequência ideal e destinatários típicos.
Retorne no formato JSON: { "suggestions": [{ "title": "", "description": "", "type": "", "schedule": "", "recipients": [], "kpis": [] }] }`;
        break;

      case "optimize_workflow":
        systemPrompt = `Você é um especialista em otimização de processos e automação.
Analise workflows existentes e sugira melhorias.
Responda em português de forma técnica e prática.`;
        userPrompt = `Analise este workflow "${data?.name}" (${data?.description}) e sugira otimizações para melhorar eficiência.
Passos atuais: ${JSON.stringify(data?.steps || [])}
Retorne sugestões de melhoria em formato JSON: { "optimizations": [{ "area": "", "suggestion": "", "impact": "" }], "newSteps": [], "estimatedImprovement": "" }`;
        break;

      case "execute_workflow":
        systemPrompt = `Você é um executor de workflows de automação marítima.
Simule a execução do workflow e retorne os resultados.
Responda em português com log de execução.`;
        userPrompt = `Execute este workflow: "${data?.name}"
Passos: ${JSON.stringify(data?.steps || [])}
Retorne log de execução em formato JSON: { "success": true, "executionLog": [{ "step": "", "status": "", "result": "" }], "summary": "" }`;
        break;

      case "generate_report":
        systemPrompt = `Você é um gerador de relatórios inteligente para operações marítimas.
Gere um relatório executivo com análises e insights.
Responda em português de forma profissional.`;
        userPrompt = `Gere um relatório de ${data?.type || "operações"} para operações marítimas.
Nome: ${data?.name}
Período: Última semana
Retorne um resumo executivo com KPIs e recomendações em formato texto estruturado.`;
        break;

      case "ai_suggestions":
        systemPrompt = `Você é um assistente de IA para operações marítimas que gera insights e sugestões inteligentes.
Analise os dados e forneça sugestões acionáveis.
Responda em português.`;
        userPrompt = `Com base nos dados de operações marítimas, gere 3-5 sugestões inteligentes para melhorar operações, compliance e eficiência.
Retorne no formato JSON: { "suggestions": [{ "id": "", "type": "action|insight|reminder|optimization", "title": "", "description": "", "priority": 1-4, "action_data": {} }] }`;
        break;

      default:
        systemPrompt = `Você é um assistente especializado em automação de operações marítimas.
Ajude com análises, sugestões e otimizações.
Responda em português de forma clara e profissional.`;
        userPrompt = context || "Forneça sugestões de automação para operações marítimas.";
        break;
    }

    console.log(`[automation-ai-copilot] Processing request type: ${type}`);

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorStatus = response.status;
      console.error(`[automation-ai-copilot] AI gateway error: ${errorStatus}`);
      
      if (errorStatus === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded",
          fallback: getFallbackResponse(type)
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (errorStatus === 402) {
        return new Response(JSON.stringify({ 
          error: "Payment required",
          fallback: getFallbackResponse(type)
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // Return fallback for other errors
      return new Response(JSON.stringify({ 
        result: getFallbackResponse(type),
        source: "fallback"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    console.log(`[automation-ai-copilot] Successfully processed request type: ${type}`);

    return new Response(JSON.stringify({ 
      result: content,
      source: "ai" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[automation-ai-copilot] Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      fallback: getFallbackResponse("default")
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getFallbackResponse(type: string): string {
  switch (type) {
    case "workflow_suggestions":
      return JSON.stringify({
        suggestions: [
          {
            title: "Alerta de Manutenção Preventiva",
            description: "Notifica automaticamente quando equipamentos atingem limite de horas",
            trigger: "threshold",
            actions: ["notify", "create_task"],
            impact: "Reduz paradas não planejadas em 30%",
            priority: "high"
          },
          {
            title: "Compliance de Certificados",
            description: "Alerta sobre certificados próximos do vencimento",
            trigger: "schedule",
            actions: ["email", "create_task"],
            impact: "Mantém 100% de conformidade",
            priority: "high"
          },
          {
            title: "Relatório Automático de Performance",
            description: "Gera relatórios semanais de KPIs operacionais",
            trigger: "schedule",
            actions: ["generate_report", "email"],
            impact: "Economiza 4h/semana em relatórios manuais",
            priority: "medium"
          }
        ]
      });
    case "report_suggestions":
      return JSON.stringify({
        suggestions: [
          {
            title: "Relatório de Compliance Semanal",
            description: "Status de certificações e auditorias",
            type: "compliance",
            schedule: "weekly",
            recipients: ["compliance@empresa.com"],
            kpis: ["Certificados válidos", "Auditorias pendentes", "Não conformidades"]
          },
          {
            title: "Status de Manutenção Diário",
            description: "Resumo de ordens de serviço e equipamentos",
            type: "maintenance",
            schedule: "daily",
            recipients: ["operacoes@empresa.com", "manutencao@empresa.com"],
            kpis: ["OS abertas", "OS concluídas", "Equipamentos críticos"]
          }
        ]
      });
    case "ai_suggestions":
      return JSON.stringify({
        suggestions: [
          {
            id: "sug-1",
            type: "action",
            title: "Revisar certificados vencendo",
            description: "3 certificados vencem nos próximos 30 dias",
            priority: 3,
            action_data: { route: "/certifications", action: "review" }
          },
          {
            id: "sug-2",
            type: "optimization",
            title: "Otimizar escala de manutenção",
            description: "Reagendar manutenções para reduzir paradas",
            priority: 2,
            action_data: { route: "/maintenance", action: "optimize" }
          }
        ]
      });
    default:
      return "Sugestões: 1) Alerta automático quando horímetro atinge limite, 2) Notificação de compliance quando certificado expira em 30 dias, 3) Relatório semanal de performance.";
  }
}
