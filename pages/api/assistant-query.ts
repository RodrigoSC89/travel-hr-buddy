import type { NextApiRequest, NextApiResponse } from "./next-types";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

  try {
    // Note: This Next.js API route is a fallback. The main implementation uses Supabase Edge Functions
    // which have direct database access. This route would need Supabase client setup for real queries.
    // For now, it provides simulated responses and delegates to OpenAI.

    // Try to match with predefined commands first
    const commandAction = findCommand(question);
    
    if (commandAction) {
      return res.status(200).json({
        answer: commandAction.message,
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
      return res.status(200).json({ answer, action: "info" });
    }

    // Fallback if no OpenAI key
    return res.status(200).json({
      answer: `Entendi sua pergunta: "${question}"\n\n💡 Para ver os comandos disponíveis, digite "ajuda".\n\nAlguns exemplos do que posso fazer:\n• Criar checklist\n• Mostrar alertas\n• Abrir documentos\n• Ver quantas tarefas pendentes você tem (requer Supabase)\n• Listar documentos recentes (requer Supabase)`,
      action: "info",
    });

  } catch (err) {
    console.error("Erro ao processar pergunta:", err);
    return res.status(500).json({ error: "Erro ao processar pergunta" });
  }
}
