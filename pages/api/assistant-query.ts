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
    message: "📄 Para resumir um documento, use: 'resumir documento [ID]'\n\nExemplo: 'resumir documento 550e8400-e29b-41d4-a716-446655440000'\n\nPara ver seus documentos recentes, digite: 'documentos recentes'\n\n⚠️ Nota: Esta funcionalidade requer Supabase Edge Function para acesso ao banco de dados.",
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
    message: "💡 **Comandos disponíveis:**\n\n🎯 **Navegação:**\n• 'criar checklist' - Criar novo checklist\n• 'alertas' - Ver alertas de preço\n• 'dashboard' - Ir para o painel principal\n• 'documentos' - Acessar documentos\n• 'analytics' - Ver análises\n• 'relatórios' - Acessar relatórios\n\n⚡ **Consultas em tempo real:**\n• 'quantas tarefas pendentes' - Ver contagem real de tarefas (requer Supabase)\n• 'documentos recentes' - Listar últimos 5 documentos (requer Supabase)\n• 'resumir documento [ID]' - Gerar resumo com GPT-4 (requer Supabase)\n• 'status do sistema' - Monitorar sistema",
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
      const systemPrompt = `
Você é o assistente do sistema Nautilus One. Seu papel é ajudar o usuário a interagir com o sistema e executar ações reais.
Sempre que possível, adicione links com as rotas reais do painel.

Comandos que você entende:
- Criar checklist → /admin/checklists/new
- Listar últimos documentos → /admin/documents
- Ver status do sistema → /admin/system-monitor
- Ver alertas → /admin/alerts
- Criar documento com IA → /admin/documents/ai
- Gerar PDF com relatório → /admin/reports/export

Seja claro, direto e útil.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        temperature: 0.3,
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

      return res.status(200).json({ answer: enhanced, action: "info" });
    }

    // Fallback if no OpenAI key
    return res.status(200).json({
      answer: `Entendi sua pergunta: "${question}"\n\n💡 Para ver os comandos disponíveis, digite "ajuda".\n\nAlguns exemplos do que posso fazer:\n• Criar checklist\n• Mostrar alertas\n• Abrir documentos\n• Ver quantas tarefas pendentes você tem (requer Supabase)\n• Listar documentos recentes (requer Supabase)\n• Resumir documentos com IA (requer Supabase)`,
      action: "info",
    });

  } catch (err) {
    console.error("Erro ao processar pergunta:", err);
    return res.status(500).json({ error: "Erro ao processar pergunta" });
  }
}
