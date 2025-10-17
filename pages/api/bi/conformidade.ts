import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // use service role para acessar todas as auditorias
);

interface ConformidadeData {
  navio: string;
  mes: string;
  conforme: number;
  nao_conforme: number;
  observacao: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { data, error } = await supabase
      .from("auditorias")
      .select("navio, norma, resultado, data");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const agrupado: Record<string, ConformidadeData> = {};

    data?.forEach((a) => {
      const navio = a.navio || "Desconhecido";
      const mes = a.data?.substring(0, 7) || "Sem data";
      const chave = `${navio}::${mes}`;

      if (!agrupado[chave]) {
        agrupado[chave] = {
          navio,
          mes,
          conforme: 0,
          nao_conforme: 0,
          observacao: 0,
        };
      }

      if (a.resultado === "Conforme") agrupado[chave].conforme++;
      else if (a.resultado === "Não Conforme") agrupado[chave].nao_conforme++;
      else if (a.resultado === "Observação") agrupado[chave].observacao++;
    });

    const resultado = Object.values(agrupado);

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Error in conformidade endpoint:", error);
    return res.status(500).json({
      error: "Erro ao gerar dados de conformidade.",
    });
  }
}
