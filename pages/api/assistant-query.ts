import type { NextApiRequest, NextApiResponse } from "./next-types";
import { OpenAI } from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize Supabase client for logging
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);

// Helper function to log assistant interactions
async function logAssistantInteraction(
  userId: string | null,
  question: string,
  answer: string,
  origin: string = "assistant"
) {
  if (!userId || !process.env.VITE_SUPABASE_URL) return;
  
  try {
    await supabase.from("assistant_logs").insert({
      user_id: userId,
      question,
      answer,
      origin,
    });
  } catch (error) {
    console.error("Failed to log assistant interaction:", error);
    // Don't throw - logging failures shouldn't break the main functionality
  }
}

// Helper function to extract user ID from JWT token
function extractUserId(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  
  try {
    const token = authHeader.substring(7);
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    return payload.sub || null;
  } catch {
    return null;
  }
}

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
    message: "💡 **Comandos disponíveis:**\n\n🎯 **Navegação:**\n• 'criar checklist' - Criar novo checklist\n• 'alertas' - Ver alertas de preço\n• 'dashboard' - Ir para o painel principal\n• 'documentos' - Acessar documentos\n• 'analytics' - Ver análises\n• 'relatórios' - Acessar relatórios\n\n⚡ **Consultas em tempo real:**\n• 'quantas tarefas pendentes' - Ver contagem real de tarefas\n• 'documentos recentes' - Listar últimos 5 documentos\n• 'status do sistema' - Monitorar sistema\n• 'resumir documento' - Resumir com IA",
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { question } = req.body;
  if (!question || typeof question !== "string")
    return res.status(400).json({ error: "Pergunta inválida" });

  // Extract user ID for logging
  const userId = extractUserId(req.headers.authorization);

  try {
    // Note: This Next.js API route is a fallback. The main implementation uses Supabase Edge Functions
    // which have direct database access. This route would need Supabase client setup for real queries.
    // For now, it provides simulated responses and delegates to OpenAI.

    // Try to match with predefined commands first
    const commandAction = findCommand(question);
    
    if (commandAction) {
      const answer = commandAction.message;
      
      // Log the interaction
      await logAssistantInteraction(userId, question, answer);
      
      return res.status(200).json({
        answer,
        action: commandAction.type,
        target: commandAction.target,
      });
    }

    // If no command matched and OpenAI is available, use it
    if (process.env.OPENAI_API_KEY) {
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

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.4,
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: question,
          },
        ],
      });

      const raw = response.choices[0].message.content || "Desculpe, não entendi.";
      let enhanced = raw;

      // Add contextual links based on question content
      if (/checklist/i.test(question)) {
        enhanced += "\n\n👉 <a href=\"/admin/checklists/new\" class=\"text-blue-600 underline\">Criar Checklist Agora</a>";
      } else if (/documento/i.test(question)) {
        enhanced += "\n\n📄 <a href=\"/admin/documents\" class=\"text-blue-600 underline\">Ver Documentos</a>";
      } else if (/alertas?/i.test(question)) {
        enhanced += "\n\n🚨 <a href=\"/admin/alerts\" class=\"text-blue-600 underline\">Ver Alertas</a>";
      }

      // Log the interaction
      await logAssistantInteraction(userId, question, enhanced);

      return res.status(200).json({ answer: enhanced, action: "info" });
    }

    // Fallback if no OpenAI key
    const fallbackAnswer = `Entendi sua pergunta: "${question}"\n\n💡 Para ver os comandos disponíveis, digite "ajuda".\n\nAlguns exemplos do que posso fazer:\n• Criar checklist\n• Mostrar alertas\n• Abrir documentos\n• Ver quantas tarefas pendentes você tem (requer Supabase)\n• Listar documentos recentes (requer Supabase)`;
    
    // Log the interaction
    await logAssistantInteraction(userId, question, fallbackAnswer);
    
    return res.status(200).json({
      answer: fallbackAnswer,
      action: "info",
    });

  } catch (err) {
    console.error("Erro ao processar pergunta:", err);
    const errorAnswer = "Erro ao processar pergunta";
    
    // Try to log the error too
    await logAssistantInteraction(userId, question, errorAnswer);
    
    return res.status(500).json({ error: errorAnswer });
  }
}
