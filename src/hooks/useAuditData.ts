/**
 * Hook para dados reais de Pacotes de Auditoria
 * ✅ P0: Usa tabelas existentes do Supabase (ai_insights como proxy)
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AuditPackage {
  id: string;
  name: string;
  type: "ANTAQ" | "DPC" | "IMO" | "ISM" | "ISPS" | "MLC" | "ESG" | "ISO";
  status: "ready" | "generating" | "pending" | "incomplete";
  completeness: number;
  documents: number;
  lastGenerated?: Date;
  missingItems: string[];
}

export interface DocumentItem {
  id: string;
  name: string;
  category: string;
  status: "valid" | "expiring" | "expired" | "missing";
  expiryDate?: Date;
  vessel?: string;
}

export function useAuditPackages() {
  return useQuery({
    queryKey: ["audit-packages"],
    queryFn: async (): Promise<AuditPackage[]> => {
      // Use ai_insights as proxy for audit data
      const { data, error } = await supabase
        .from("ai_insights")
        .select("id, title, category, status, confidence, created_at")
        .eq("category", "compliance")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) return [];

      return (data || []).map((insight) => ({
        id: insight.id,
        name: insight.title || "Auditoria",
        type: "ISM" as const,
        status: insight.status === "resolved" ? ("ready" as const) : ("pending" as const),
        completeness: Math.round((insight.confidence || 0) * 100),
        documents: 0,
        lastGenerated: insight.created_at ? new Date(insight.created_at) : undefined,
        missingItems: [],
      }));
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useAuditDocuments() {
  return useQuery({
    queryKey: ["audit-documents"],
    queryFn: async (): Promise<DocumentItem[]> => {
      const { data, error } = await supabase
        .from("maritime_certificates")
        .select("id, certificate_number, expiry_date, status")
        .order("expiry_date", { ascending: true })
        .limit(50);

      if (error) return [];

      return (data || []).map((cert) => ({
        id: cert.id,
        name: cert.certificate_number || "Certificado",
        category: "Certificação",
        status: getExpiryStatus(cert.expiry_date),
        expiryDate: cert.expiry_date ? new Date(cert.expiry_date) : undefined,
      }));
    },
    staleTime: 2 * 60 * 1000,
  });
}

function getExpiryStatus(expiryDate: string | null): DocumentItem["status"] {
  if (!expiryDate) return "missing";
  const expiry = new Date(expiryDate);
  const now = new Date();
  const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return "expired";
  if (days <= 30) return "expiring";
  return "valid";
}
