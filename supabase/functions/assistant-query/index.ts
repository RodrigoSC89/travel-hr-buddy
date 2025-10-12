import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client
function getSupabaseClient(req: Request) {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    }
  );
}

interface CommandAction {
  type: "navigation" | "action" | "query" | "info" | "checklist_creation";
  target?: string;
  message: string;
  createChecklist?: boolean;
  checklistTitle?: string;
}

// Command mapping for the assistant
const commandPatterns: Record<string, CommandAction> = {
  // Checklist creation commands
  "criar checklist para auditoria": {
    type: "checklist_creation",
    message: "✅ Criando checklist de auditoria...",
    createChecklist: true,
    checklistTitle: "Checklist de Auditoria",
  },
  "criar checklist": {
    type: "checklist_creation",
    message: "✅ Criando checklist...",
    createChecklist: true,
    checklistTitle: "Novo Checklist",
  },
  "gerar checklist": {
    type: "checklist_creation",
    message: "✅ Gerando checklist...",
    createChecklist: true,
    checklistTitle: "Novo Checklist",
  },
  // Navigation commands
  "ver checklist": {
    type: "navigation",
    target: "/admin/checklists",
    message: "✅ Navegando para a página de checklists...",
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

// Function to create a checklist
async function createChecklist(
  supabaseClient: any,
  userId: string,
  title: string
): Promise<{ id: string; error?: string }> {
  try {
    const { data, error } = await supabaseClient
      .from("operational_checklists")
      .insert({
        title,
        type: "outro",
        created_by: userId,
        status: "rascunho",
        source_type: "assistant",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating checklist:", error);
      return { id: "", error: error.message };
    }

    return { id: data.id };
  } catch (err) {
    console.error("Exception creating checklist:", err);
    return { id: "", error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// Function to log assistant interaction
async function logInteraction(
  supabaseClient: any,
  userId: string,
  question: string,
  answer: string,
  actionType: string,
  actionTarget: string | undefined,
  executionTimeMs: number,
  error?: string
): Promise<void> {
  try {
    await supabaseClient.from("assistant_logs").insert({
      user_id: userId,
      question,
      answer,
      origin: "assistant",
      action_type: actionType,
      action_target: actionTarget,
      execution_time_ms: executionTimeMs,
      error,
    });
  } catch (err) {
    console.error("Error logging interaction:", err);
    // Don't throw, as we don't want logging failures to break the main flow
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { question } = await req.json();
    
    if (!question || typeof question !== "string") {
      throw new Error("Question is required");
    }

    console.log("Processing assistant query:", question);

    // Initialize Supabase client
    const supabaseClient = getSupabaseClient(req);
    
    // Get user ID
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting user:", userError);
      throw new Error("User not authenticated");
    }

    const userId = user.id;

    // Try to match with predefined commands
    const commandAction = findCommand(question);
    
    if (commandAction) {
      console.log("Command matched:", commandAction);
      let responseMessage = commandAction.message;
      let actionTarget = commandAction.target;

      // Handle checklist creation
      if (commandAction.createChecklist && commandAction.checklistTitle) {
        const { id, error } = await createChecklist(
          supabaseClient,
          userId,
          commandAction.checklistTitle
        );

        if (error) {
          responseMessage = `❌ Erro ao criar checklist: ${error}`;
        } else {
          actionTarget = `/admin/checklists/view/${id}`;
          responseMessage = `✅ Checklist criado com sucesso!\n[📝 Abrir Checklist](${actionTarget})`;
        }
      }

      const executionTime = Date.now() - startTime;

      // Log the interaction
      await logInteraction(
        supabaseClient,
        userId,
        question,
        responseMessage,
        commandAction.type,
        actionTarget,
        executionTime
      );

      return new Response(
        JSON.stringify({
          answer: responseMessage,
          action: commandAction.type,
          target: actionTarget,
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
      const fallbackAnswer = `Entendi sua pergunta: "${question}"\n\n💡 Para ver os comandos disponíveis, digite "ajuda".\n\nAlguns exemplos do que posso fazer:\n• Criar checklist\n• Mostrar alertas\n• Abrir documentos\n• Ver tarefas pendentes\n• Status do sistema`;
      
      const executionTime = Date.now() - startTime;
      
      // Get supabase client for logging
      const supabaseClient = getSupabaseClient(req);
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      
      if (user) {
        await logInteraction(
          supabaseClient,
          user.id,
          question,
          fallbackAnswer,
          "info",
          undefined,
          executionTime
        );
      }

      return new Response(
        JSON.stringify({
          answer: fallbackAnswer,
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
    const systemPrompt = `Você é um assistente IA corporativo para o sistema Travel HR Buddy.
    
Seu papel é ajudar usuários a navegar no sistema e executar tarefas.

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

    const executionTime = Date.now() - startTime;

    // Get supabase client for logging
    const supabaseClient = getSupabaseClient(req);
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    
    if (user) {
      await logInteraction(
        supabaseClient,
        user.id,
        question,
        answer,
        "info",
        undefined,
        executionTime
      );
    }

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
    
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const answerMessage = "❌ Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.";
    
    // Try to log the error
    try {
      const supabaseClient = getSupabaseClient(req);
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      
      if (user) {
        await logInteraction(
          supabaseClient,
          user.id,
          "", // question might not be available if error occurred early
          answerMessage,
          "info",
          undefined,
          executionTime,
          errorMessage
        );
      }
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        answer: answerMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
