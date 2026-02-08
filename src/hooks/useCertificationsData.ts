/**
 * Hook para dados reais de certificações STCW
 * Substitui mockCerts do CertificationsSection
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CertificationEntry {
  id: string;
  name: string;
  cert: string;
  issue: string;
  expiry: string;
  status: "valid" | "expiring" | "expired";
}

export function useCertificationsData() {
  return useQuery({
    queryKey: ["stcw-certifications"],
    queryFn: async (): Promise<CertificationEntry[]> => {
      const { data, error } = await supabase
        .from("certificates")
        .select("id, certificate_type, certificate_number, issue_date, expiry_date, status, employee_id")
        .order("expiry_date", { ascending: true })
        .limit(50);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const now = new Date();
      const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      return data.map((c) => {
        const expiryDate = c.expiry_date ? new Date(c.expiry_date) : null;
        let status: "valid" | "expiring" | "expired" = "valid";
        if (expiryDate) {
          if (expiryDate < now) status = "expired";
          else if (expiryDate < thirtyDays) status = "expiring";
        }

        return {
          id: c.id,
          name: c.employee_id || "Tripulante",
          cert: c.certificate_type || c.certificate_number || "Certificado",
          issue: c.issue_date
            ? new Date(c.issue_date).toLocaleDateString("pt-BR")
            : "N/A",
          expiry: c.expiry_date
            ? new Date(c.expiry_date).toLocaleDateString("pt-BR")
            : "N/A",
          status,
        };
      });
    },
  });
}
