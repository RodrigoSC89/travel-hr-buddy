import { createClient } from "@/lib/supabase/server";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API endpoint to export compliance statistics as CSV
 * 
 * Returns CSV file with compliance data by vessel and month
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient();

    // Fetch all auditorias_imca with findings data
    const { data: auditorias, error } = await supabase
      .from("auditorias_imca")
      .select("title, audit_date, findings, metadata")
      .order("audit_date", { ascending: false });

    if (error) {
      console.error("Error fetching auditorias:", error);
      return res.status(500).json({ error: error.message });
    }

    // Process data (same logic as conformidade endpoint)
    interface ComplianceEntry {
      navio: string;
      mes: string;
      conforme: number;
      nao_conforme: number;
      observacao: number;
    }
    let complianceData: ComplianceEntry[] = [];

    if (!auditorias || auditorias.length === 0) {
      // Sample data when no audits exist
      complianceData = [
        {
          navio: "Ocean Star",
          mes: "2025-09",
          conforme: 12,
          nao_conforme: 3,
          observacao: 1,
        },
        {
          navio: "Sea Pioneer",
          mes: "2025-09",
          conforme: 9,
          nao_conforme: 2,
          observacao: 4,
        },
      ];
    } else {
      const complianceMap = new Map<string, ComplianceEntry>();

      auditorias.forEach((audit) => {
        const vesselName = extractVesselName(audit.title, audit.metadata);
        const month = audit.audit_date 
          ? formatMonth(audit.audit_date) 
          : formatMonth(new Date().toISOString());
        const compliance = extractComplianceData(audit.findings);
        const key = `${vesselName}-${month}`;

        if (complianceMap.has(key)) {
          const existing = complianceMap.get(key);
          complianceMap.set(key, {
            navio: vesselName,
            mes: month,
            conforme: existing.conforme + compliance.conforme,
            nao_conforme: existing.nao_conforme + compliance.nao_conforme,
            observacao: existing.observacao + compliance.observacao,
          });
        } else {
          complianceMap.set(key, {
            navio: vesselName,
            mes: month,
            conforme: compliance.conforme,
            nao_conforme: compliance.nao_conforme,
            observacao: compliance.observacao,
          });
        }
      });

      complianceData = Array.from(complianceMap.values()).sort(
        (a, b) => b.mes.localeCompare(a.mes)
      );
    }

    // Convert to CSV
    const csv = convertToCSV(complianceData);

    // Set headers for CSV download
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=relatorio_conformidade.csv");

    return res.status(200).send(csv);
  } catch (error: unknown) {
    console.error("Error in export endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: errorMessage });
  }
}

/**
 * Convert compliance data array to CSV format
 */
function convertToCSV(data: Array<Record<string, unknown>>): string {
  if (data.length === 0) {
    return "Navio,Mês,Conforme,Não Conforme,Observação\n";
  }

  // CSV header
  const header = "Navio,Mês,Conforme,Não Conforme,Observação\n";

  // CSV rows
  const rows = data.map((item) => {
    return [
      escapeCsvValue(item.navio),
      escapeCsvValue(item.mes),
      item.conforme,
      item.nao_conforme,
      item.observacao,
    ].join(",");
  }).join("\n");

  return header + rows;
}

/**
 * Escape CSV values (handle commas, quotes, etc.)
 */
function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, "\"\"")}"`;
  }

  return stringValue;
}

/**
 * Extract vessel name from audit title or metadata
 */
function extractVesselName(title: string, metadata: Record<string, unknown> | null): string {
  if (metadata && typeof metadata.vessel === "string") {
    return metadata.vessel;
  }
  
  const patterns = [
    /(?:vessel|ship|navio|embarcação)[:\s]+([A-Za-z\s]+)/i,
    /^([A-Za-z\s]+)\s*-/,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return "Vessel Unknown";
}

/**
 * Format date to YYYY-MM month string
 */
function formatMonth(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Extract compliance counts from findings JSONB
 */
function extractComplianceData(findings: unknown): {
  conforme: number;
  nao_conforme: number;
  observacao: number;
} {
  if (!findings || typeof findings !== "object") {
    return { conforme: 0, nao_conforme: 0, observacao: 0 };
  }

  const findingsObj = findings as Record<string, unknown>;

  if (typeof findingsObj.conforme === "number") {
    return {
      conforme: findingsObj.conforme || 0,
      nao_conforme: (findingsObj.nao_conforme as number) || (findingsObj.naoConforme as number) || 0,
      observacao: (findingsObj.observacao as number) || (findingsObj.observation as number) || 0,
    };
  }

  if (Array.isArray(findings)) {
    return findings.reduce(
      (acc, item) => {
        if (typeof item !== "object" || !item) return acc;
        const itemObj = item as Record<string, unknown>;
        const status = String(itemObj.status || itemObj.compliance || "").toLowerCase();
        if (status.includes("conform") && !status.includes("não") && !status.includes("nao")) {
          acc.conforme++;
        } else if (status.includes("não") || status.includes("nao") || status.includes("non-conform")) {
          acc.nao_conforme++;
        } else if (status.includes("observ") || status.includes("remark")) {
          acc.observacao++;
        }
        return acc;
      },
      { conforme: 0, nao_conforme: 0, observacao: 0 }
    );
  }

  if (findingsObj.items && Array.isArray(findingsObj.items)) {
    return extractComplianceData(findingsObj.items);
  }

  return { conforme: 0, nao_conforme: 0, observacao: 0 };
}
