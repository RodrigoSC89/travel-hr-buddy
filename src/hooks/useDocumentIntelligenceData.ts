/**
 * Hook: useDocumentIntelligenceData
 * Fetches documents and certificates from Supabase
 * Replaces hardcoded mock data in DocumentIntelligenceHub.tsx
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  category: string;
  vessel: string;
  status: "valid" | "expiring" | "expired" | "pending";
  expiryDate: string;
  lastModified: string;
  aiTags: string[];
  confidence: number;
}

function deriveStatus(expiryDate: string | null): DocumentItem["status"] {
  if (!expiryDate) return "pending";
  const now = Date.now();
  const expiry = new Date(expiryDate).getTime();
  if (expiry < now) return "expired";
  if (expiry - now < 30 * 86400000) return "expiring";
  return "valid";
}

export function useDocumentIntelligenceData() {
  return useQuery({
    queryKey: ["document-intelligence"],
    queryFn: async (): Promise<DocumentItem[]> => {
      // Fetch certificates (no vessel_id on certificates table; linked via employee_id)
      const { data: certs, error: certError } = await supabase
        .from("certificates")
        .select("id, certificate_type, certificate_number, issue_date, expiry_date, status, issuing_authority, employee_id")
        .order("expiry_date", { ascending: true })
        .limit(50);

      if (certError) throw certError;

      // Fetch documents (has vessel_id)
      const { data: docs, error: docError } = await supabase
        .from("documents")
        .select("id, title, document_type, status, created_at, updated_at, vessel_id, expiry_date")
        .order("updated_at", { ascending: false })
        .limit(50);

      if (docError) throw docError;

      // Fetch vessels for names
      const docVesselIds = [...new Set((docs || []).map(d => d.vessel_id).filter(Boolean))] as string[];
      const { data: vessels } = docVesselIds.length > 0
        ? await supabase.from("vessels").select("id, name").in("id", docVesselIds)
        : { data: [] };

      const vesselMap = new Map((vessels || []).map(v => [v.id, v.name]));

      // Map certificates to DocumentItem
      const certItems: DocumentItem[] = (certs || []).map((c) => {
        const certType = c.certificate_type || "Certificado";
        const tags = [certType];
        if (c.issuing_authority) tags.push(c.issuing_authority);

        return {
          id: c.id,
          name: `${certType} ${c.certificate_number || ""}`.trim(),
          type: "Certificado",
          category: "Compliance",
          vessel: "Frota",
          status: deriveStatus(c.expiry_date),
          expiryDate: c.expiry_date || "-",
          lastModified: c.issue_date || new Date().toISOString().slice(0, 10),
          aiTags: tags,
          confidence: 95,
        };
      });

      // Map documents to DocumentItem
      const docItems: DocumentItem[] = (docs || []).map((d) => ({
        id: d.id,
        name: d.title || "Documento sem título",
        type: d.document_type || "Documento",
        category: "Operacional",
        vessel: vesselMap.get(d.vessel_id || "") || "Geral",
        status: d.expiry_date ? deriveStatus(d.expiry_date) : (d.status === "active" ? "valid" : "pending"),
        expiryDate: d.expiry_date || "-",
        lastModified: d.updated_at || d.created_at || new Date().toISOString().slice(0, 10),
        aiTags: [d.document_type || "Documento"],
        confidence: 90,
      }));

      return [...certItems, ...docItems];
    },
    staleTime: 60_000,
  });
}
