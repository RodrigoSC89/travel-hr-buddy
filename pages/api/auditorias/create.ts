import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const { navio, data, norma, itemAuditado, resultado, comentarios } = req.body;

  if (!navio || !data || !norma || !itemAuditado || !resultado) {
    return res.status(400).json({ message: "Campos obrigatórios faltando." });
  }

  const { error } = await supabase.from("auditorias_imca").insert({
    navio,
    data,
    norma,
    item_auditado: itemAuditado,
    resultado,
    comentarios,
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ message: "Auditoria salva com sucesso." });
}
