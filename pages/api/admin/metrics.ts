import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface MetricsData {
  auditoria_id: string;
  embarcacao: string;
  falhas_criticas: number;
  mes: string;
  data: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Fetch auditorias data from the database
    const { data: auditorias, error } = await supabase
      .from("auditorias_imca")
      .select("id, title, metadata, findings, created_at, audit_date")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform the data into metrics format
    const metricsData: MetricsData[] = auditorias.map((audit) => {
      // Extract vessel name from metadata or use a default
      const embarcacao = audit.metadata?.embarcacao || audit.metadata?.nome_navio || "Não especificado";
      
      // Count critical failures from findings
      let falhas_criticas = 0;
      if (audit.findings && typeof audit.findings === "object") {
        // Count critical issues in findings
        const findings = audit.findings as Record<string, unknown>;
        if (findings.critical) {
          falhas_criticas = Array.isArray(findings.critical) ? findings.critical.length : findings.critical;
        } else if (findings.falhas_criticas) {
          falhas_criticas = findings.falhas_criticas;
        }
      }

      // Format date for temporal evolution
      const dataAudit = audit.audit_date || audit.created_at;
      const date = new Date(dataAudit);
      const mes = date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });

      return {
        auditoria_id: audit.id.substring(0, 8), // Short ID for display
        embarcacao: String(embarcacao),
        falhas_criticas,
        mes,
        data: dataAudit
      };
    });

    res.status(200).json(metricsData);
  } catch (error) {
    console.error("Erro ao buscar métricas:", error);
    res.status(500).json({ error: "Erro ao buscar métricas de risco." });
  }
}
