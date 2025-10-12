import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client for database queries
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
  "resumo": {
    type: "action",
    message: "📄 Para criar resumos, acesse a seção de Documentos AI.",
  },
  "documento": {
    type: "navigation",
    target: "/admin/documents/ai",
    message: "📄 Abrindo Documentos AI...",
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
    message: "💡 **Comandos disponíveis:**\n\n🎯 **Navegação:**\n• 'criar checklist' - Criar novo checklist\n• 'alertas' - Ver alertas de preço\n• 'dashboard' - Ir para o painel principal\n• 'documentos' - Acessar documentos\n• 'analytics' - Ver análises\n• 'relatórios' - Acessar relatórios\n\n⚡ **Ações Inteligentes:**\n• 'tarefas pendentes' - Ver suas tarefas (consulta banco de dados)\n• 'documentos recentes' - Listar últimos 5 documentos\n• 'resuma o documento [ID]' - Resumir documento com IA\n• 'status do sistema' - Monitorar sistema\n• 'gerar pdf' - Exportar documentos",
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

    // Initialize Supabase client for this request
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const lower = question.toLowerCase();

    // 🧠 Advanced commands with real database logic
    
    // Command: "tarefas pendentes" - Query real database for unchecked items
    if (lower.includes("tarefas pendentes") || lower.includes("quantas tarefas")) {
      const { count, error } = await supabase
        .from("checklist_items")
        .select("*", { count: "exact", head: true })
        .eq("completed", false);

      if (error) {
        console.error("Error querying tasks:", error);
        return new Response(
          JSON.stringify({
            answer: "⚠️ Erro ao consultar tarefas pendentes.",
            action: "info",
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
          answer: `📋 Você tem **${count || 0}** tarefas pendentes.\n\n[🔍 Ver Tarefas](/admin/checklists)`,
          action: "info",
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Command: "documentos recentes" / "últimos documentos" - Query last 5 documents
    if (lower.includes("últimos documentos") || lower.includes("documentos recentes")) {
      const { data, error } = await supabase
        .from("ai_generated_documents")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error || !data) {
        console.error("Error querying documents:", error);
        return new Response(
          JSON.stringify({
            answer: "⚠️ Erro ao buscar documentos.",
            action: "info",
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
            answer: "📑 Nenhum documento encontrado.\n\n[➕ Criar Documento](/admin/documents/ai)",
            action: "info",
            timestamp: new Date().toISOString(),
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      const list = data
        .map((doc) => {
          const date = new Date(doc.created_at).toLocaleDateString("pt-BR");
          return `📄 [${doc.title}](/admin/documents/view/${doc.id}) — ${date}`;
        })
        .join("\n");

      return new Response(
        JSON.stringify({
          answer: `📑 **Últimos documentos:**\n\n${list}`,
          action: "info",
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Command: "resuma o documento X" - Fetch and summarize document with GPT-4
    if (lower.includes("resuma o documento") || lower.includes("resumir documento")) {
      const idMatch = lower.match(/documento\s+([a-f0-9-]+|\d+)/i);
      const docId = idMatch?.[1];

      if (!docId) {
        return new Response(
          JSON.stringify({
            answer: "❌ Por favor, especifique o ID do documento.\n\nExemplo: 'resuma o documento 123'",
            action: "info",
            timestamp: new Date().toISOString(),
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      const { data: doc, error: docError } = await supabase
        .from("ai_generated_documents")
        .select("id, title, content")
        .eq("id", docId)
        .single();

      if (docError || !doc) {
        console.error("Error fetching document:", docError);
        return new Response(
          JSON.stringify({
            answer: `❌ Documento não encontrado.\n\n[📚 Ver Documentos](/admin/documents)`,
            action: "info",
            timestamp: new Date().toISOString(),
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      // Use OpenAI to summarize the document
      const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
      if (!OPENAI_API_KEY) {
        return new Response(
          JSON.stringify({
            answer: `❌ Serviço de resumo indisponível no momento.`,
            action: "info",
            timestamp: new Date().toISOString(),
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      try {
        const summaryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: "Resuma o conteúdo abaixo de forma clara e objetiva em português brasileiro. Destaque os pontos principais.",
              },
              {
                role: "user",
                content: doc.content,
              },
            ],
            temperature: 0.4,
            max_tokens: 500,
          }),
        });

        if (!summaryResponse.ok) {
          throw new Error(`OpenAI API error: ${summaryResponse.status}`);
        }

        const summaryData = await summaryResponse.json();
        const summary = summaryData.choices[0].message.content;

        return new Response(
          JSON.stringify({
            answer: `📝 **Resumo do documento "${doc.title}":**\n\n${summary}\n\n[📄 Ver Documento Completo](/admin/documents/view/${doc.id})`,
            action: "info",
            timestamp: new Date().toISOString(),
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      } catch (summaryError) {
        console.error("Error generating summary:", summaryError);
        return new Response(
          JSON.stringify({
            answer: `⚠️ Erro ao gerar resumo. Por favor, tente novamente.`,
            action: "info",
            timestamp: new Date().toISOString(),
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
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
    const systemPrompt = `Você é o assistente IA do sistema Nautilus One (Travel HR Buddy).

Você pode executar ações poderosas como:
- Consultar tarefas pendentes no banco de dados
- Listar documentos recentes do sistema
- Resumir documentos específicos com IA
- Criar checklists e gerenciar tarefas
- Navegar entre diferentes módulos

Módulos disponíveis:
- Dashboard: Painel principal com visão geral
- Checklists: Criar e gerenciar checklists de inspeção
- Documentos AI: Gerar, resumir e gerenciar documentos
- Alertas de Preço: Monitorar alertas de preços de viagens
- Analytics: Ver análises e métricas
- Relatórios: Acessar relatórios do sistema
- RH (Recursos Humanos): Gerenciar tripulação e funcionários
- Viagens: Buscar voos, hotéis e reservas
- Sistema Marítimo: Gerenciar frota e navios
- Status do Sistema: Monitor de APIs e integrações

Use markdown para formatar respostas. Você pode criar links clicáveis assim: [Texto do Link](/caminho/url)
Seja conciso, útil e profissional. Use emojis apropriados. Responda em português brasileiro.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    return new Response(
      JSON.stringify({
        answer,
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
