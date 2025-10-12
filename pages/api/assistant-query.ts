import type { NextApiRequest, NextApiResponse } from "./next-types";
import { OpenAI } from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize Supabase client for logging
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);

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
  "documento": {
    type: "navigation",
    target: "/admin/documents/ai",
    message: "📄 Abrindo Documentos AI...",
  },
  "tarefas pendentes": {
    type: "query",
    message: "📋 Consultando tarefas pendentes...\n\nVocê tem 3 tarefas pendentes hoje:\n1. Revisar checklist de segurança\n2. Aprovar relatório de viagem\n3. Atualizar documentos da tripulação",
  },
  "alertas": {
    type: "navigation",
    target: "/price-alerts",
    message: "🔔 Abrindo página de alertas de preço...",
  },
  "status do sistema": {
    type: "navigation",
    target: "/admin/api-status",
    message: "📊 Abrindo monitor de status do sistema...",
  },
  "documentos recentes": {
    type: "navigation",
    target: "/admin/documents",
    message: "📚 Mostrando documentos recentes...",
  },
  "dashboard": {
    type: "navigation",
    target: "/dashboard",
    message: "📊 Navegando para o dashboard principal...",
  },
  "analytics": {
    type: "navigation",
    target: "/analytics",
    message: "📈 Abrindo página de analytics...",
  },
  "relatórios": {
    type: "navigation",
    target: "/reports",
    message: "📊 Abrindo página de relatórios...",
  },
  "ajuda": {
    type: "info",
    message: "💡 **Comandos disponíveis:**\n\n🎯 **Navegação:**\n• 'criar checklist' - Criar novo checklist\n• 'alertas' - Ver alertas de preço\n• 'dashboard' - Ir para o painel principal\n• 'documentos' - Acessar documentos\n• 'analytics' - Ver análises\n• 'relatórios' - Acessar relatórios\n\n⚡ **Ações:**\n• 'tarefas pendentes' - Ver suas tarefas\n• 'status do sistema' - Monitorar sistema\n• 'resumir documento' - Resumir com IA",
  },
};

function findCommand(question: string): CommandAction | null {
  const lowerQuestion = question.toLowerCase().trim();
  
  for (const [pattern, action] of Object.entries(commandPatterns)) {
    if (lowerQuestion.includes(pattern)) {
      return action;
    }
  }
  
  return null;
}

async function logInteraction(userId: string | null, question: string, answer: string) {
  try {
    await supabase.from("assistant_logs").insert({
      user_id: userId,
      question,
      answer,
      origin: "assistant",
    });
  } catch (error) {
    console.error("Error logging assistant interaction:", error);
    // Don't throw - logging should not break the main functionality
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { question } = req.body;
  if (!question || typeof question !== "string")
    return res.status(400).json({ error: "Pergunta inválida" });

  // Try to get user ID from authorization header
  const authHeader = req.headers.authorization;
  let userId: string | null = null;
  
  if (authHeader) {
    try {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    } catch (error) {
      console.warn("Could not extract user from token:", error);
    }
  }

  try {
    // Try to match with predefined commands first
    const commandAction = findCommand(question);
    
    if (commandAction) {
      const answer = commandAction.message;
      
      // Log the interaction
      await logInteraction(userId, question, answer);
      
      return res.status(200).json({
        answer,
        action: commandAction.type,
        target: commandAction.target,
      });
    }

    // If no command matched and OpenAI is available, use it
    if (process.env.OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Você é um assistente IA corporativo para o sistema Travel HR Buddy.
            
Seu papel é ajudar usuários a navegar no sistema e executar tarefas.

Módulos disponíveis:
- Dashboard: Painel principal com visão geral
- Checklists: Criar e gerenciar checklists de inspeção
- Documentos AI: Gerar, resumir e gerenciar documentos
- Alertas de Preço: Monitorar alertas de preços de viagens
- Analytics: Ver análises e métricas
- Relatórios: Acessar relatórios do sistema

Seja conciso, útil e profissional. Use emojis apropriados. Responda em português brasileiro.`,
          },
          {
            role: "user",
            content: question,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const answer = response.choices[0].message.content || "";
      
      // Log the interaction
      await logInteraction(userId, question, answer);
      
      return res.status(200).json({ answer, action: "info" });
    }

    // Fallback if no OpenAI key
    const answer = `Entendi sua pergunta: "${question}"\n\n💡 Para ver os comandos disponíveis, digite "ajuda".\n\nAlguns exemplos do que posso fazer:\n• Criar checklist\n• Mostrar alertas\n• Abrir documentos\n• Ver tarefas pendentes`;
    
    // Log the interaction
    await logInteraction(userId, question, answer);
    
    return res.status(200).json({
      answer,
      action: "info",
    });

  } catch (err) {
    console.error("Erro ao processar pergunta:", err);
    return res.status(500).json({ error: "Erro ao processar pergunta" });
  }
}
