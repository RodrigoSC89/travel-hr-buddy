import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { generateCSVFromPlans, generatePDFFromPlans, SGSOActionPlan } from "@/lib/sgso/export-utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ExportRequest {
  format: "csv" | "pdf";
  vesselId?: string;
  status?: string;
}

/**
 * Get action plans by vessel or all plans
 */
async function getPlansByVessel(vesselId?: string, status?: string): Promise<SGSOActionPlan[]> {
  let query = supabase
    .from("sgso_action_plans")
    .select(`
      *,
      dp_incidents (
        id,
        title,
        date,
        vessel,
        location,
        root_cause,
        summary
      )
    `)
    .order("created_at", { ascending: false });

  // Filter by vessel if provided
  if (vesselId) {
    query = query.eq("dp_incidents.vessel", vesselId);
  }

  // Filter by status if provided
  if (status) {
    query = query.eq("status_approval", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching action plans:", error);
    throw new Error(`Erro ao buscar planos de ação: ${error.message}`);
  }

  return (data as SGSOActionPlan[]) || [];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { format, vesselId, status }: ExportRequest = req.body;

    if (!format || !["csv", "pdf"].includes(format)) {
      return res.status(400).json({ error: "Formato inválido. Use 'csv' ou 'pdf'" });
    }

    // Get action plans
    const plans = await getPlansByVessel(vesselId, status);

    if (plans.length === 0) {
      return res.status(404).json({ error: "Nenhum plano de ação encontrado" });
    }

    // Generate export based on format
    if (format === "csv") {
      const csv = generateCSVFromPlans(plans);
      const filename = `sgso_action_plans_${new Date().toISOString().split("T")[0]}.csv`;
      
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.status(200).send(csv);
    }

    if (format === "pdf") {
      const pdf = await generatePDFFromPlans(plans);
      const filename = `sgso_action_plans_${new Date().toISOString().split("T")[0]}.pdf`;
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.status(200).send(Buffer.from(pdf));
    }

    return res.status(400).json({ error: "Formato não suportado" });
  } catch (error) {
    console.error("Error in SGSO export endpoint:", error);
    return res.status(500).json({ 
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
