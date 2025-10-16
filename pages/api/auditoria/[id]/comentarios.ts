import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
);

const openai = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id: auditoriaId },
    method,
    body,
  } = req;

  if (typeof auditoriaId !== "string") {
    return res.status(400).json({ error: "ID inválido." });
  }

  if (method === "GET") {
    const { data, error } = await supabase
      .from("auditoria_comentarios")
      .select("id, comentario, created_at, user_id")
      .eq("auditoria_id", auditoriaId)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (method === "POST") {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const userId = user?.id;

    if (authError || !userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    if (!body.comentario || !body.comentario.trim()) {
      return res.status(400).json({ error: "Comentário vazio." });
    }

    const comentario = body.comentario.trim();

    // Inserir comentário original
    const { data: inserted, error } = await supabase
      .from("auditoria_comentarios")
      .insert({
        auditoria_id: auditoriaId,
        comentario,
        user_id: userId,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // 🔁 Gerar resposta técnica com IA
    const iaPrompt = `Você é um auditor técnico baseado nas normas IMCA. Dado o seguinte comentário:
"${comentario}"

Responda tecnicamente.

Avalie se há algum risco ou falha crítica mencionada.

Se houver falha crítica, comece a resposta com: "⚠️ Atenção: "`;

    try {
      const iaResposta = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "Você é um engenheiro auditor da IMCA." },
          { role: "user", content: iaPrompt },
        ],
      });

      const respostaIA = iaResposta.choices?.[0]?.message?.content?.trim();

      if (respostaIA) {
        await supabase.from("auditoria_comentarios").insert({
          auditoria_id: auditoriaId,
          comentario: respostaIA,
          user_id: "ia-auto-responder",
        });
      }
    } catch (aiError) {
      console.error("Erro ao gerar resposta da IA:", aiError);
      // Continue mesmo se a IA falhar, o comentário do usuário foi salvo
    }

    return res.status(201).json({ sucesso: true, comentario: inserted });
  }

  return res.status(405).json({ error: "Método não permitido." });
}
