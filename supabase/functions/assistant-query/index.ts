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
  "tarefas pendentes": {
    type: "query",
    message: "📋 Consultando tarefas pendentes...\n\nVocê tem 3 tarefas pendentes hoje:\n1. Revisar checklist de segurança\n2. Aprovar relatório de viagem\n3. Atualizar documentos da tripulação",
  },
  "tarefas": {
    type: "query",
    message: "📋 Consultando suas tarefas...",
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
  "documentos recentes": {
    type: "navigation",
    target: "/admin/documents",
    message: "📚 Mostrando documentos recentes...",
  },
  "últimos documentos": {
    type: "navigation",
    target: "/admin/documents",
    message: "📚 Abrindo lista de documentos...",
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
    message: "💡 **Comandos disponíveis:**\n\n🎯 **Navegação:**\n• 'criar checklist' - Criar novo checklist\n• 'alertas' - Ver alertas de preço\n• 'dashboard' - Ir para o painel principal\n• 'documentos' - Acessar documentos\n• 'analytics' - Ver análises\n• 'relatórios' - Acessar relatórios\n\n⚡ **Ações:**\n• 'tarefas pendentes' - Ver suas tarefas\n• 'status do sistema' - Monitorar sistema\n• 'resumir documento' - Resumir com IA\n• 'gerar pdf' - Exportar documentos",
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
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      // Fallback response if no OpenAI key
      return new Response(
        JSON.stringify({
          answer: `Entendi sua pergunta: "${question}"\n\n💡 Para ver os comandos disponíveis, digite "ajuda".\n\nAlguns exemplos do que posso fazer:\n• Criar checklist\n• Mostrar alertas\n• Abrir documentos\n• Ver tarefas pendentes\n• Status do sistema`,
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
