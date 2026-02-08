/**
 * React Query hook for People Intelligence
 * Uses real Supabase tables: crew_members, crew_assignments, crew_certifications
 */
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CrewMemberData {
  id: string;
  name: string;
  rank: string | null;
  position: string;
  vessel: string;
  vesselId: string | null;
  status: "onboard" | "onleave" | "training" | "available";
  nationality: string;
  contractStart: string | null;
  contractEnd: string | null;
  rotationDays: number;
  maxRotation: number;
  mlcCompliant: boolean;
}

export interface CertificationRecord {
  id: string;
  crewName: string;
  certName: string;
  certType: string;
  issueDate: string;
  expiryDate: string | null;
  status: "valid" | "expiring" | "expired";
  daysToExpiry: number;
}

export function useCrewRoster() {
  return useQuery({
    queryKey: ["crew-roster"],
    queryFn: async (): Promise<CrewMemberData[]> => {
      const { data, error } = await supabase
        .from("crew_members")
        .select("*")
        .order("full_name")
        .limit(200);

      if (error) throw error;

      const now = new Date();
      return (data || []).map(m => {
        const contractStart = m.contract_start ? new Date(m.contract_start) : null;
        const rotationDays = contractStart
          ? Math.max(0, Math.floor((now.getTime() - contractStart.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

        return {
          id: m.id,
          name: m.full_name,
          rank: m.rank,
          position: m.position,
          vessel: "—",
          vesselId: m.vessel_id,
          status: mapCrewStatus(m.status),
          nationality: m.nationality,
          contractStart: m.contract_start,
          contractEnd: m.contract_end,
          rotationDays,
          maxRotation: 90,
          mlcCompliant: rotationDays <= 90,
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCrewCertifications() {
  return useQuery({
    queryKey: ["crew-certifications-matrix"],
    queryFn: async (): Promise<CertificationRecord[]> => {
      const { data, error } = await supabase
        .from("crew_certifications")
        .select("*, crew_members(full_name)")
        .order("expiry_date", { ascending: true })
        .limit(200);

      if (error) throw error;

      const now = new Date();
      return (data || []).map((cert: any) => {
        const expiry = cert.expiry_date ? new Date(cert.expiry_date) : null;
        const daysToExpiry = expiry
          ? Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        return {
          id: cert.id,
          crewName: cert.crew_members?.full_name || "N/A",
          certName: cert.certification_name,
          certType: cert.certification_type,
          issueDate: cert.issue_date,
          expiryDate: cert.expiry_date,
          status: daysToExpiry < 0 ? "expired" as const : daysToExpiry < 60 ? "expiring" as const : "valid" as const,
          daysToExpiry,
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function usePeopleAIAnalysis() {
  return useMutation({
    mutationFn: async (context: { summary: string }) => {
      const { data, error } = await supabase.functions.invoke("people-intelligence", {
        body: { action: "ai_analysis", context: context.summary },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => toast.success("Análise AI de tripulação concluída"),
    onError: () => toast.error("Erro ao gerar análise AI de tripulação"),
  });
}

export function usePeopleStats() {
  const rosterQuery = useCrewRoster();
  const certsQuery = useCrewCertifications();

  const crew = rosterQuery.data || [];
  const certs = certsQuery.data || [];

  const totalCrew = crew.length;
  const onboard = crew.filter(c => c.status === "onboard").length;
  const onLeave = crew.filter(c => c.status === "onleave").length;
  const rotationAlerts = crew.filter(c => c.rotationDays > c.maxRotation - 14).length;
  const expiredCerts = certs.filter(c => c.status === "expired").length;
  const expiringCerts = certs.filter(c => c.status === "expiring").length;
  const mlcViolations = crew.filter(c => !c.mlcCompliant).length;

  return {
    crew,
    certifications: certs,
    stats: {
      totalCrew,
      onboard,
      onLeave,
      available: crew.filter(c => c.status === "available").length,
      training: crew.filter(c => c.status === "training").length,
      rotationAlerts,
      expiredCerts,
      expiringCerts,
      mlcViolations,
      stcwCompliance: certs.length > 0
        ? Math.round((certs.filter(c => c.status === "valid").length / certs.length) * 100)
        : 100,
    },
    isLoading: rosterQuery.isLoading || certsQuery.isLoading,
    refetch: () => {
      rosterQuery.refetch();
      certsQuery.refetch();
    },
  };
}

function mapCrewStatus(status: string | null): CrewMemberData["status"] {
  const s = (status || "").toLowerCase();
  if (s.includes("active") || s.includes("onboard") || s.includes("embarked")) return "onboard";
  if (s.includes("leave") || s.includes("vacation") || s.includes("férias") || s.includes("inactive")) return "onleave";
  if (s.includes("train")) return "training";
  return "available";
}
