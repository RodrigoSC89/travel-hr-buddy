/**
 * React Query hook for Compliance Intelligence
 * Uses real Supabase tables: compliance_items, crew_certifications
 */
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ComplianceItem {
  id: string;
  title: string;
  item_type: string;
  regulation: string | null;
  status: string | null;
  priority: string | null;
  description: string | null;
  vessel_id: string | null;
  assigned_to: string | null;
  due_date: string | null;
  completed_at: string | null;
  evidence_urls: string[] | null;
  created_at: string | null;
}

export interface CertificateRecord {
  id: string;
  certification_name: string;
  certification_type: string;
  status: string;
  issue_date: string;
  expiry_date: string | null;
  crew_member_id: string;
  days_to_expiry: number;
}

export function useComplianceItems() {
  return useQuery({
    queryKey: ["compliance-items"],
    queryFn: async (): Promise<ComplianceItem[]> => {
      const { data, error } = await supabase
        .from("compliance_items")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as ComplianceItem[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useComplianceCertificates() {
  return useQuery({
    queryKey: ["compliance-certificates"],
    queryFn: async (): Promise<CertificateRecord[]> => {
      const { data, error } = await supabase
        .from("crew_certifications")
        .select("*")
        .order("expiry_date", { ascending: true })
        .limit(200);

      if (error) throw error;

      const now = new Date();
      return (data || []).map((cert) => {
        const expiry = cert.expiry_date ? new Date(cert.expiry_date) : null;
        const daysToExpiry = expiry
          ? Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        return {
          id: cert.id,
          certification_name: cert.certification_name,
          certification_type: cert.certification_type,
          status: daysToExpiry < 0 ? "expired" : daysToExpiry < 30 ? "expiring_soon" : "valid",
          issue_date: cert.issue_date,
          expiry_date: cert.expiry_date,
          crew_member_id: cert.crew_member_id,
          days_to_expiry: daysToExpiry,
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useComplianceAIAnalysis() {
  return useMutation({
    mutationFn: async (context: { auditSummary: string }) => {
      const { data, error } = await supabase.functions.invoke("compliance-intelligence", {
        body: { action: "ai_analysis", context: context.auditSummary },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => toast.success("Análise AI de compliance concluída"),
    onError: () => toast.error("Erro ao gerar análise AI"),
  });
}

export function useComplianceStats() {
  const itemsQuery = useComplianceItems();
  const certsQuery = useComplianceCertificates();

  const items = itemsQuery.data || [];
  const certs = certsQuery.data || [];

  const totalItems = items.length;
  const compliant = items.filter(i => i.status === "compliant" || i.status === "completed").length;
  const nonCompliant = items.filter(i => i.status === "non_compliant" || i.status === "failed").length;
  const pending = items.filter(i => i.status === "pending" || !i.status).length;
  const observations = items.filter(i => i.status === "observation").length;

  const complianceRate = totalItems > 0 ? Math.round((compliant / totalItems) * 100) : 100;

  const expiredCerts = certs.filter(c => c.status === "expired").length;
  const expiringSoon = certs.filter(c => c.status === "expiring_soon").length;
  const certComplianceRate = certs.length > 0
    ? Math.round((certs.filter(c => c.status === "valid").length / certs.length) * 100)
    : 100;

  return {
    items,
    certificates: certs,
    stats: {
      totalItems,
      compliant,
      nonCompliant,
      pending,
      observations,
      complianceRate,
      expiredCerts,
      expiringSoon,
      certComplianceRate,
      totalCerts: certs.length,
    },
    isLoading: itemsQuery.isLoading || certsQuery.isLoading,
    refetch: () => {
      itemsQuery.refetch();
      certsQuery.refetch();
    },
  };
}
