// ✅ API para processar comandos do Assistente IA
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { question } = await req.json();

  if (!question || typeof question !== "string") {
    return NextResponse.json({ answer: "❌ Pergunta inválida" }, { status: 400 });
  }

  // Prompt com contexto de comandos que o assistente entende
  const systemPrompt = `
Você é o assistente do sistema Nautilus One. Responda de forma clara e útil.
Você pode realizar ações como:

- Criar um novo checklist
- Resumir documentos
- Mostrar status do sistema
- Buscar tarefas pendentes
- Listar documentos recentes
- Gerar PDF com resumo
- Redirecionar para rotas internas do painel

Se o comando for reconhecido, explique a ação e simule o resultado.
`;

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
    temperature: 0.4,
  });

  const answer = chatCompletion.choices[0].message.content;
  return NextResponse.json({ answer });
}
