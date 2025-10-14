import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CommandAction {
  type: "navigation" | "action" | "query" | "info";
  target?: string;
  message: string;
}

// Command mapping for the assistant
const commandPatterns: Record<string, CommandAction> = {
  // Navigation commands
  "criar checklist": {
    type: "navigation",
    target: "/admin/checklists",
    message: "✅ Navegando para a página de criação de checklists...",
  },
  "checklist": {
    type: "navigation",
    target: "/admin/checklists",
    message: "✅ Abrindo checklists...",
  },
  "resumir documento": {
    type: "action",
    message: "📄 Para resumir um documento, vá para Documentos AI e use a função 'Resumir com IA'.",
  },
  "resumo": {
    type: "action",
    message: "📄 Para criar resumos, acesse a seção de Documentos AI.",
  },
  "documento": {
    type: "navigation",
    target: "/admin/documents/ai",
    message: "📄 Abrindo Documentos AI...",
  },
  "alertas": {
    type: "navigation",
    target: "/price-alerts",
    message: "🔔 Abrindo página de alertas de preço...",
  },
  "alertas de preço": {
    type: "navigation",
    target: "/price-alerts",
    message: "🔔 Navegando para alertas de preço...",
  },
  "status do sistema": {
    type: "navigation",
    target: "/admin/api-status",
    message: "📊 Abrindo monitor de status do sistema...",
  },
  "sistema": {
    type: "navigation",
    target: "/admin/control-panel",
    message: "⚙️ Abrindo painel de controle do sistema...",
  },
  "gerar pdf": {
    type: "action",
    message: "📄 Para gerar PDF, acesse Documentos AI e use a opção 'Exportar em PDF' após gerar o documento.",
  },
  "dashboard": {
    type: "navigation",
    target: "/dashboard",
    message: "📊 Navegando para o dashboard principal...",
  },
  "painel": {
    type: "navigation",
    target: "/dashboard",
    message: "📊 Abrindo dashboard...",
  },
  "analytics": {
    type: "navigation",
    target: "/analytics",
    message: "📈 Abrindo página de analytics...",
  },
  "análises": {
    type: "navigation",
    target: "/analytics",
    message: "📈 Navegando para análises...",
  },
  "relatórios": {
    type: "navigation",
    target: "/reports",
    message: "📊 Abrindo página de relatórios...",
  },
  "reports": {
    type: "navigation",
    target: "/reports",
    message: "📊 Navegando para relatórios...",
  },
  "ajuda": {
    type: "info",
    message: "💡 **Comandos disponíveis:**\n\n🎯 **Navegação:**\n• 'criar checklist' - Criar novo checklist\n• 'alertas' - Ver alertas de preço\n• 'dashboard' - Ir para o painel principal\n• 'documentos' - Acessar documentos\n• 'analytics' - Ver análises\n• 'relatórios' - Acessar relatórios\n\n⚡ **Consultas em tempo real:**\n• 'quantas tarefas pendentes' - Ver contagem real de tarefas\n• 'documentos recentes' - Listar últimos 5 documentos\n• 'status do sistema' - Monitorar sistema\n• 'resumir documento' - Resumir com IA\n• 'gerar pdf' - Exportar documentos",
  },
  "help": {
    type: "info",
    message: "💡 Digite 'ajuda' para ver a lista de comandos disponíveis.",
  },
};

function findCommand(question: string): CommandAction | null {
  const lowerQuestion = question.toLowerCase().trim();
  
  // Check for exact matches first
  for (const [pattern, action] of Object.entries(commandPatterns)) {
    if (lowerQuestion.includes(pattern)) {
      return action;
    }
  }
  
  return null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();
    
    if (!question || typeof question !== "string") {
      throw new Error("Question is required");
    }

    console.log("Processing assistant query:", question);

    // Get Supabase client with auth
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    const lower = question.toLowerCase();

    // 👉 DP Intelligence queries - Check if question is about DP incidents or IMCA
    const dpKeywords = ["dp", "incidente", "imca", "posicionamento dinâmico", "drive off", "drive-off", 
                        "perda de posição", "thruster", "gyro", "dgps", "peo-dp", "peo dp"];
    const isDPQuery = dpKeywords.some(keyword => lower.includes(keyword));
    
    if (isDPQuery) {
      console.log("DP Intelligence query detected");
      
      // Check if asking for specific incident
      const incidentMatch = question.match(/(?:IMCA|INC)[-\s]?(\d{4}[-\s]?\d{3})/i);
      const incidentId = incidentMatch ? incidentMatch[0].replace(/\s+/g, "-") : null;
      
      try {
        let dpContext = "";
        
        if (incidentId) {
          // Fetch specific incident
          const { data: incident, error: incidentError } = await supabase
            .from("dp_incidents")
            .select("*")
            .eq("incident_id", incidentId)
            .single();
            
          if (!incidentError && incident) {
            dpContext = `
**Incidente encontrado na base de dados:**
- ID: ${incident.incident_id}
- Título: ${incident.title}
- Classe: ${incident.vessel_class}
- Tipo: ${incident.incident_type}
- Severidade: ${incident.severity}
- Causa: ${incident.root_cause || "Em investigação"}
- Normas IMCA: ${incident.imca_standards?.join(", ") || "N/A"}
`;
          }
        } else {
          // Search for related incidents
          const searchTerm = question.replace(/[^\w\s]/gi, ' ').trim();
          const { data: incidents, error: searchError } = await supabase
            .from("dp_incidents")
            .select("incident_id, title, severity, vessel_class")
            .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
            .limit(5);
            
          if (!searchError && incidents && incidents.length > 0) {
            dpContext = `\n**Incidentes relacionados encontrados:**\n` +
              incidents.map(i => `- ${i.incident_id}: ${i.title} (${i.severity})`).join("\n");
          }
        }
        
        // Call OpenAI with DP context
        const dpSystemPrompt = `Você é um especialista em Posicionamento Dinâmico e normas IMCA.
Responda perguntas sobre incidentes DP, causas de falhas, normas IMCA e PEO-DP.
${dpContext}

Forneça respostas técnicas, práticas e orientadas à ação.`;

        const dpResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: dpSystemPrompt },
              { role: "user", content: question },
            ],
            temperature: 0.3,
            max_tokens: 1000,
          }),
        });

        if (dpResponse.ok) {
          const dpData = await dpResponse.json();
          const dpAnswer = dpData.choices[0].message.content;
          
          return new Response(
            JSON.stringify({
              answer: dpAnswer + "\n\n🔗 <a href=\"/peo-dp\" class=\"text-blue-600 underline\">Ver módulo PEO-DP completo</a>",
              action: "dp_intelligence",
              context: "dp_incidents",
              timestamp: new Date().toISOString(),
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        }
      } catch (dpError) {
        console.error("DP Intelligence error:", dpError);
        // Continue to normal flow if DP query fails
      }
    }

    // 👉 Real database queries for pending tasks
    if (lower.includes("quantas tarefas") || lower.includes("tarefas pendentes")) {
      const { count, error } = await supabase
        .from("checklist_items")
        .select("*", { count: "exact", head: true })
        .eq("completed", false);

      if (error) {
        console.error("Error querying tasks:", error);
        return new Response(
          JSON.stringify({
            answer: "⚠️ Erro ao consultar tarefas pendentes.",
            action: "query",
            timestamp: new Date().toISOString(),
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      return new Response(
        JSON.stringify({
          answer: `📋 Você tem ${count || 0} tarefas pendentes.`,
          action: "query",
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // 👉 Real database queries for recent documents
    if (lower.includes("documentos recentes") || lower.includes("últimos documentos")) {
      const { data, error } = await supabase
        .from("documents")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error || !data) {
        console.error("Error querying documents:", error);
        return new Response(
          JSON.stringify({
            answer: "⚠️ Não foi possível buscar os documentos.",
            action: "query",
            timestamp: new Date().toISOString(),
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      if (data.length === 0) {
        return new Response(
          JSON.stringify({
            answer: "📑 Não há documentos cadastrados ainda.",
            action: "query",
            timestamp: new Date().toISOString(),
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      const list = data
        .map((doc) => `📄 ${doc.title} — ${new Date(doc.created_at).toLocaleDateString("pt-BR")}`)
        .join("\n");

      return new Response(
        JSON.stringify({
          answer: `📑 Últimos documentos:\n${list}`,
          action: "query",
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Try to match with predefined commands
    const commandAction = findCommand(question);
    
    if (commandAction) {
      console.log("Command matched:", commandAction);
      return new Response(
        JSON.stringify({
          answer: commandAction.message,
          action: commandAction.type,
          target: commandAction.target,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // If no command matched, use OpenAI for general assistance
    if (!OPENAI_API_KEY) {
      // Fallback response if no OpenAI key
      return new Response(
        JSON.stringify({
          answer: `Entendi sua pergunta: "${question}"\n\n💡 Para ver os comandos disponíveis, digite "ajuda".\n\nAlguns exemplos do que posso fazer:\n• Criar checklist\n• Mostrar alertas\n• Abrir documentos\n• Ver quantas tarefas pendentes você tem\n• Listar documentos recentes`,
          action: "info",
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Use OpenAI for intelligent response
    const systemPrompt = `
Você é o assistente do sistema Nautilus One / Travel HR Buddy.
Responda de forma clara e útil.

Você pode realizar ações como:
- Criar um novo checklist
- Resumir documentos
- Mostrar status do sistema
- Buscar tarefas pendentes
- Listar documentos recentes
- Gerar PDF com resumo
- Redirecionar para rotas internas do painel

Módulos disponíveis no sistema:
1. **Dashboard** (/dashboard) - Visão geral do sistema
2. **Checklists** (/admin/checklists) - Gestão de checklists de inspeção
3. **Documentos** (/admin/documents) - Gestão de documentos
4. **Documentos AI** (/admin/documents/ai) - Geração e análise com IA
5. **Analytics** (/analytics) - Análises e métricas
6. **Relatórios** (/reports) - Relatórios do sistema
7. **Alertas de Preço** (/price-alerts) - Monitoramento de preços
8. **Status da API** (/admin/api-status) - Monitoramento de APIs
9. **Painel de Controle** (/admin/control-panel) - Configurações do sistema
10. **Tripulação** (/crew) - Gestão de tripulação
11. **Reservas** (/reservations) - Sistema de reservas
12. **Comunicação** (/communication) - Centro de comunicação
13. **PEO-DP** (/peo-dp) - Dynamic Positioning Operations Plan
14. **Centro de Inteligência DP** - Análise de incidentes e normas IMCA

🧠 **CENTRO DE INTELIGÊNCIA DP - CAPACIDADES ESPECIAIS**:
Você tem acesso ao Centro de Inteligência DP, que permite:
- Consultar incidentes DP da base de dados (dp_incidents)
- Analisar incidentes com IA (via /api/dp/intel/analyze)
- Buscar informações sobre normas IMCA (M190, M103, M117, M182, etc.)
- Explicar causas de falhas DP e ações preventivas
- Comparar incidentes similares
- Gerar planos de ação baseados em PEO-DP

Quando o usuário fizer perguntas sobre:
- Incidentes DP (ex: "Explique o incidente IMCA-2025-009")
- Normas IMCA (ex: "O que diz a norma M190 sobre Drive Off?")
- Eventos DP (ex: "Quais as causas de perda de posição?")
- Conformidade PEO-DP
- Análise de falhas DP
- Comparações de incidentes

VOCÊ DEVE identificar como tema "DP Intelligence" e fornecer resposta técnica orientada à ação, incluindo:
✅ Resumo técnico
📚 Normas IMCA relacionadas
📌 Causas potenciais
🧠 Recomendações baseadas em IA
📄 Ações corretivas e preventivas

Sempre forneça respostas práticas e direcionadas. Quando relevante, sugira a rota específica do módulo.
Seja claro, direto e útil.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        temperature: 0.4,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const raw = data.choices[0].message.content || "Desculpe, não entendi.";
    let enhanced = raw;

    // Add contextual links based on question content
    if (/checklist/i.test(question)) {
      enhanced += "\n\n👉 <a href=\"/admin/checklists/new\" class=\"text-blue-600 underline\">Criar Checklist Agora</a>";
    } else if (/documento/i.test(question)) {
      enhanced += "\n\n📄 <a href=\"/admin/documents\" class=\"text-blue-600 underline\">Ver Documentos</a>";
    } else if (/alertas?/i.test(question)) {
      enhanced += "\n\n🚨 <a href=\"/admin/alerts\" class=\"text-blue-600 underline\">Ver Alertas</a>";
    }

    return new Response(
      JSON.stringify({
        answer: enhanced,
        action: "info",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error processing assistant query:", error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        answer: "❌ Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
