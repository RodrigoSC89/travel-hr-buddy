import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface MetricasRisco {
  auditoria_id: string;
  embarcacao: string;
  mes: string;
  falhas_criticas: number;
}

interface RiscoOperacionalEmbarcacao {
  embarcacao: string;
  total_falhas_criticas: number;
  nivel_risco: "baixo" | "medio" | "alto" | "critico";
  ultimas_auditorias: number;
  meses_com_alertas: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Call the RPC function to get audit metrics
    const { data: metricsData, error: metricsError } = await supabase.rpc(
      "auditoria_metricas_risco"
    );

    if (metricsError) {
      console.error("Error fetching metrics:", metricsError);
      throw metricsError;
    }

    // Aggregate risk data by vessel
    const riscoByEmbarcacao = new Map<string, RiscoOperacionalEmbarcacao>();

    (metricsData as MetricasRisco[]).forEach((metric) => {
      const embarcacao = metric.embarcacao || "Não Especificada";
      
      if (!riscoByEmbarcacao.has(embarcacao)) {
        riscoByEmbarcacao.set(embarcacao, {
          embarcacao,
          total_falhas_criticas: 0,
          nivel_risco: "baixo",
          ultimas_auditorias: 0,
          meses_com_alertas: [],
        });
      }

      const riscoData = riscoByEmbarcacao.get(embarcacao)!;
      riscoData.total_falhas_criticas += metric.falhas_criticas;
      riscoData.ultimas_auditorias += 1;
      
      if (metric.falhas_criticas > 0) {
        riscoData.meses_com_alertas.push(metric.mes);
      }
    });

    // Calculate risk level for each vessel
    const riscoOperacional: RiscoOperacionalEmbarcacao[] = Array.from(
      riscoByEmbarcacao.values()
    ).map((risco) => {
      // Calculate average failures per month
      const avgFalhasPorMes = risco.ultimas_auditorias > 0
        ? risco.total_falhas_criticas / risco.ultimas_auditorias
        : 0;

      // Determine risk level based on average failures per month
      let nivel_risco: "baixo" | "medio" | "alto" | "critico" = "baixo";
      
      if (avgFalhasPorMes > 5) {
        nivel_risco = "critico";
      } else if (avgFalhasPorMes > 3) {
        nivel_risco = "alto";
      } else if (avgFalhasPorMes > 1) {
        nivel_risco = "medio";
      }

      return {
        ...risco,
        nivel_risco,
      };
    });

    // Sort by risk level (critical first) and total failures
    const riscoSorted = riscoOperacional.sort((a, b) => {
      const riskOrder = { critico: 4, alto: 3, medio: 2, baixo: 1 };
      const riskDiff = riskOrder[b.nivel_risco] - riskOrder[a.nivel_risco];
      
      if (riskDiff !== 0) return riskDiff;
      return b.total_falhas_criticas - a.total_falhas_criticas;
    });

    // Calculate summary statistics
    const summary = {
      total_embarcacoes: riscoSorted.length,
      embarcacoes_alto_risco: riscoSorted.filter(
        (r) => r.nivel_risco === "alto" || r.nivel_risco === "critico"
      ).length,
      total_falhas_criticas: riscoSorted.reduce(
        (sum, r) => sum + r.total_falhas_criticas,
        0
      ),
      embarcacoes_criticas: riscoSorted.filter(
        (r) => r.nivel_risco === "critico"
      ).length,
    };

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
      risco_operacional: riscoSorted,
    });
  } catch (error) {
    console.error("Error in SGSO endpoint:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao gerar dados de risco operacional para SGSO.",
    });
  }
}
