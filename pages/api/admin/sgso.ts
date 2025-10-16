import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RiskMetric {
  embarcacao: string;
  mes: string;
  falhas_criticas: number;
}

interface AggregatedData {
  embarcacao: string;
  total: number;
  por_mes: Record<string, number>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const { data, error } = await supabase.rpc("auditoria_metricas_risco");

    if (error) return res.status(500).json({ error: error.message });

    const agrupado = data.reduce((acc: Record<string, AggregatedData>, item: RiskMetric) => {
      const { embarcacao, mes, falhas_criticas } = item;
      if (!acc[embarcacao]) {
        acc[embarcacao] = { embarcacao, total: 0, por_mes: {} };
      }
      acc[embarcacao].total += falhas_criticas;
      acc[embarcacao].por_mes[mes] = falhas_criticas;
      return acc;
    }, {});

    const resposta = Object.values(agrupado);
    return res.status(200).json(resposta);
  } catch (error) {
    console.error("Erro ao buscar métricas de risco SGSO:", error);
    return res.status(500).json({ error: "Erro ao buscar métricas de risco." });
  }
}
