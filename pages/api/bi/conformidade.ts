import { createClient } from "@/lib/supabase/server";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API endpoint to retrieve compliance statistics by vessel and month
 * from IMCA Technical Audits
 * 
 * Returns:
 * [
 *   {
 *     "navio": "Ocean Star",
 *     "mes": "2025-09",
 *     "conforme": 12,
 *     "nao_conforme": 3,
 *     "observacao": 1
 *   }
 * ]
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

    if (!auditorias || auditorias.length === 0) {
      // Return sample data when no audits exist
      return res.status(200).json([
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
        {
          navio: "Ocean Star",
          mes: "2025-08",
          conforme: 10,
          nao_conforme: 4,
          observacao: 2,
        },
      ]);
    }

    // Process auditorias to extract compliance data
    interface ComplianceEntry {
      navio: string;
      mes: string;
      conforme: number;
      nao_conforme: number;
      observacao: number;
    }
    const complianceMap = new Map<string, ComplianceEntry>();

    auditorias.forEach((audit) => {
      // Extract vessel name from title or metadata
      const vesselName = extractVesselName(audit.title, audit.metadata);
      
      // Extract month from audit_date
      const month = audit.audit_date 
        ? formatMonth(audit.audit_date) 
        : formatMonth(new Date().toISOString());

      // Extract compliance counts from findings
      const compliance = extractComplianceData(audit.findings);

      // Create unique key for vessel+month
      const key = `${vesselName}-${month}`;

      if (complianceMap.has(key)) {
        // Aggregate if multiple audits for same vessel/month
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

    // Convert map to array and sort by month descending
    const complianceData = Array.from(complianceMap.values()).sort(
      (a, b) => b.mes.localeCompare(a.mes)
    );

    return res.status(200).json(complianceData);
  } catch (error: unknown) {
    console.error("Error in conformidade endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: errorMessage });
  }
}

/**
 * Extract vessel name from audit title or metadata
 */
function extractVesselName(title: string, metadata: Record<string, unknown> | null): string {
  // Try to extract from metadata first
  if (metadata && typeof metadata.vessel === "string") {
    return metadata.vessel;
  }
  
  // Try to extract from title (common patterns)
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

  // Default vessel name if extraction fails
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
 * Expected structure: { conforme: number, nao_conforme: number, observacao: number }
 * or array of finding items with status property
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

  // If findings has direct counts
  if (typeof findingsObj.conforme === "number") {
    return {
      conforme: findingsObj.conforme || 0,
      nao_conforme: (findingsObj.nao_conforme as number) || (findingsObj.naoConforme as number) || 0,
      observacao: (findingsObj.observacao as number) || (findingsObj.observation as number) || 0,
    };
  }

  // If findings is an array of items
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

  // If findings is an object with items
  if (findingsObj.items && Array.isArray(findingsObj.items)) {
    return extractComplianceData(findingsObj.items);
  }

  return { conforme: 0, nao_conforme: 0, observacao: 0 };
}
