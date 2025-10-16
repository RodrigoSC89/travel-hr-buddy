import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AuditoriaMetrica {
  embarcacao: string;
  mes: string;
  falhas_criticas: number;
}

interface EmbarcacaoRisco {
  embarcacao: string;
  total: number;
  por_mes: Record<string, number>;
  risco: "baixo" | "moderado" | "alto";
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

    if (error) {
      console.error("Erro ao buscar métricas de risco:", error);
      return res.status(500).json({ error: error.message });
    }

    // Agrupar dados por embarcação
    const agrupado = (data as AuditoriaMetrica[]).reduce((acc, item) => {
      const { embarcacao, mes, falhas_criticas } = item;
      
      if (!acc[embarcacao]) {
        acc[embarcacao] = {
          embarcacao,
          total: 0,
          por_mes: {},
          risco: "baixo" as const,
        };
      }
      
      acc[embarcacao].total += falhas_criticas;
      acc[embarcacao].por_mes[mes] = falhas_criticas;
      
      // Classificar nível de risco
      if (acc[embarcacao].total >= 5) {
        acc[embarcacao].risco = "alto";
      } else if (acc[embarcacao].total >= 3) {
        acc[embarcacao].risco = "moderado";
      } else {
        acc[embarcacao].risco = "baixo";
      }
      
      return acc;
    }, {} as Record<string, EmbarcacaoRisco>);

    const resposta = Object.values(agrupado);
    return res.status(200).json(resposta);
  } catch (error) {
    console.error("Erro ao processar métricas SGSO:", error);
    return res.status(500).json({ error: "Erro ao processar métricas." });
  }
}
