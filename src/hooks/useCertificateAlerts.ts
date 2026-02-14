/**
 * Certificate Alerts Hook
 * Monitors expiring certificates and triggers push notifications
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";
import { showWarning, showCriticalAlert } from "@/lib/push-notifications";
import { logger } from "@/lib/logger";

export interface CertificateAlert {
  id: string;
  crewMemberId: string;
  crewName: string;
  certificationName: string;
  expiryDate: string;
  daysUntilExpiry: number;
  severity: "critical" | "warning" | "info";
}

export function useCertificateAlerts(enabled = true) {
  const notifiedRef = useRef<Set<string>>(new Set());

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["certificate-alerts"],
    queryFn: async () => {
      const now = new Date();
      const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from("crew_certifications")
        .select(`
          id,
          crew_member_id,
          certification_name,
          expiry_date,
          status,
          crew_members!crew_certifications_crew_member_id_fkey(full_name)
        `)
        .lte("expiry_date", sixtyDaysFromNow.toISOString())
        .gte("expiry_date", now.toISOString())
        .order("expiry_date", { ascending: true })
        .limit(100);

      if (error) throw error;

      const results: CertificateAlert[] = (data || []).map((cert) => {
        const expiry = new Date(cert.expiry_date!);
        const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const crewData = cert.crew_members as { full_name: string } | null;

        return {
          id: cert.id,
          crewMemberId: cert.crew_member_id || "",
          crewName: crewData?.full_name || "Tripulante",
          certificationName: cert.certification_name || "Certificação",
          expiryDate: cert.expiry_date || "",
          daysUntilExpiry,
          severity: daysUntilExpiry <= 7 ? "critical" : daysUntilExpiry <= 30 ? "warning" : "info",
        };
      });

      return results;
    },
    enabled,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000, // Check every 30 min
  });

  // Trigger push notifications for new alerts
  useEffect(() => {
    if (!alerts?.length) return;

    const criticalAlerts = alerts.filter(
      (a) => a.severity === "critical" && !notifiedRef.current.has(a.id)
    );

    const warningAlerts = alerts.filter(
      (a) => a.severity === "warning" && !notifiedRef.current.has(a.id)
    );

    if (criticalAlerts.length > 0) {
      showCriticalAlert(
        "Certificados Vencendo!",
        `${criticalAlerts.length} certificado(s) vencem em menos de 7 dias`,
        { count: criticalAlerts.length, type: "certificate_expiry" }
      ).catch((e) => logger.error("Failed to show critical alert", { error: e }));

      criticalAlerts.forEach((a) => notifiedRef.current.add(a.id));
    }

    if (warningAlerts.length > 0) {
      showWarning(
        "Certificados Próximos do Vencimento",
        `${warningAlerts.length} certificado(s) vencem nos próximos 30 dias`,
        { count: warningAlerts.length, type: "certificate_warning" }
      ).catch((e) => logger.error("Failed to show warning", { error: e }));

      warningAlerts.forEach((a) => notifiedRef.current.add(a.id));
    }
  }, [alerts]);

  return {
    alerts: alerts || [],
    criticalCount: alerts?.filter((a) => a.severity === "critical").length || 0,
    warningCount: alerts?.filter((a) => a.severity === "warning").length || 0,
    isLoading,
  };
}
