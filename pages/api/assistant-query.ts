import type { NextApiRequest, NextApiResponse } from "./next-types";
import { OpenAI } from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize Supabase client for logging
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

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

// Helper function to extract user ID from JWT token
function getUserIdFromToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  
  try {
    const token = authHeader.substring(7);
    // Decode JWT token (basic decode, not verifying signature)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return payload.sub || null;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

// Helper function to log interaction to database
async function logInteraction(
  userId: string | null,
  question: string,
  answer: string,
  origin: string = "assistant"
): Promise<void> {
  if (!supabase || !userId) {
    console.log("Skipping log: Supabase not configured or no user ID");
    return;
  }

  try {
    const { error } = await supabase.from("assistant_logs").insert({
      user_id: userId,
      question,
      answer,
      origin,
    });

    if (error) {
      console.error("Error logging assistant interaction:", error);
    }
  } catch (err) {
    console.error("Exception while logging interaction:", err);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { question } = req.body;
  if (!question || typeof question !== "string")
    return res.status(400).json({ error: "Pergunta inválida" });

  // Extract user ID from authorization header
  const userId = getUserIdFromToken(req.headers.authorization);

  try {
    // Note: This Next.js API route is a fallback. The main implementation uses Supabase Edge Functions
    // which have direct database access. This route would need Supabase client setup for real queries.
    // For now, it provides simulated responses and delegates to OpenAI.

    // Try to match with predefined commands first
    const commandAction = findCommand(question);
    
    if (commandAction) {
      // Log the interaction
      await logInteraction(userId, question, commandAction.message);
      
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

      // Log the interaction
      await logInteraction(userId, question, enhanced);

      return res.status(200).json({ answer: enhanced, action: "info" });
    }

    // Fallback if no OpenAI key
    const fallbackMessage = `Entendi sua pergunta: "${question}"\n\n💡 Para ver os comandos disponíveis, digite "ajuda".\n\nAlguns exemplos do que posso fazer:\n• Criar checklist\n• Mostrar alertas\n• Abrir documentos\n• Ver quantas tarefas pendentes você tem (requer Supabase)\n• Listar documentos recentes (requer Supabase)`;
    
    // Log the interaction
    await logInteraction(userId, question, fallbackMessage);
    
    return res.status(200).json({
      answer: fallbackMessage,
      action: "info",
    });

  } catch (err) {
    console.error("Erro ao processar pergunta:", err);
    return res.status(500).json({ error: "Erro ao processar pergunta" });
  }
}
