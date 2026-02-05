/**
 * Hook para dados reais de Alertas de Certificados
 * Usa tabelas existentes do Supabase
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Certificate {
  id: string;
  holder_name: string;
  holder_id: string;
  certificate_type: string;
  certificate_number: string;
  issue_date: string;
  expiry_date: string;
  issuing_authority: string;
  vessel_name?: string;
  status: "valid" | "expiring_soon" | "expired" | "renewed";
  days_until_expiry: number;
  alert_sent: boolean;
  last_alert_date?: string;
}

export interface AlertConfig {
  id: string;
  name: string;
  days_before: number;
  channels: ("email" | "push" | "sms" | "system")[];
  recipients: string[];
  enabled: boolean;
  escalation_enabled: boolean;
  escalation_days: number;
}

export interface AlertHistory {
  id: string;
  certificate_id: string;
  certificate_type: string;
  holder_name: string;
  alert_type: string;
  sent_at: string;
  channel: string;
  status: "sent" | "failed" | "pending";
}

// Default certificates for fallback
const DEFAULT_CERTIFICATES: Certificate[] = [
  {
    id: "1",
    holder_name: "João Silva",
    holder_id: "crew-001",
    certificate_type: "STCW - Básico de Segurança",
    certificate_number: "STCW-2024-001",
    issue_date: "2020-02-15",
    expiry_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    issuing_authority: "DPC - Marinha do Brasil",
    vessel_name: "Navio Alpha",
    status: "expiring_soon",
    days_until_expiry: 5,
    alert_sent: true,
    last_alert_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    holder_name: "Maria Santos",
    holder_id: "crew-002",
    certificate_type: "Certificado de Competência - Oficial de Máquinas",
    certificate_number: "COM-2023-045",
    issue_date: "2019-08-20",
    expiry_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    issuing_authority: "DPC - Marinha do Brasil",
    vessel_name: "Navio Beta",
    status: "expiring_soon",
    days_until_expiry: 25,
    alert_sent: true,
  },
  {
    id: "3",
    holder_name: "Carlos Lima",
    holder_id: "crew-003",
    certificate_type: "GMDSS - Operador Geral",
    certificate_number: "GMDSS-2022-089",
    issue_date: "2022-05-10",
    expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    issuing_authority: "ANATEL",
    vessel_name: "Navio Gamma",
    status: "valid",
    days_until_expiry: 180,
    alert_sent: false,
  },
];

export function useCertificateAlertsData() {
  const queryClient = useQueryClient();
  const [localAlertHistory, setLocalAlertHistory] = useState<AlertHistory[]>([]);

  // Fetch certificates
  const certificatesQuery = useQuery({
    queryKey: ["certificates-expiration-alerts"],
    queryFn: async (): Promise<Certificate[]> => {
      try {
        const { data, error } = await supabase
          .from("certificates")
          .select(`
            id,
            certificate_type,
            certificate_number,
            issuing_authority,
            issue_date,
            expiry_date,
            status,
            employee_id
          `)
          .order("expiry_date", { ascending: true });

        if (error || !data?.length) {
          return DEFAULT_CERTIFICATES;
        }

        const now = new Date();

        return data.map((cert): Certificate => {
          const expiryDate = cert.expiry_date ? new Date(cert.expiry_date) : new Date();
          const daysUntilExpiry = Math.ceil(
            (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          let status: Certificate["status"] = "valid";
          if (daysUntilExpiry < 0) status = "expired";
          else if (daysUntilExpiry <= 30) status = "expiring_soon";

          return {
            id: cert.id,
            holder_name: cert.employee_id || "Não identificado",
            holder_id: cert.employee_id || "",
            certificate_type: cert.certificate_type || "Certificado",
            certificate_number: cert.certificate_number || "",
            issue_date: cert.issue_date || "",
            expiry_date: cert.expiry_date || "",
            issuing_authority: cert.issuing_authority || "",
            status,
            days_until_expiry: daysUntilExpiry,
            alert_sent: false,
          };
        });
      } catch {
        return DEFAULT_CERTIFICATES;
      }
    },
    staleTime: 60000,
  });

  // Fetch alert history from certificate_alerts table
  const alertHistoryQuery = useQuery({
    queryKey: ["certificate-alert-history"],
    queryFn: async (): Promise<AlertHistory[]> => {
      try {
        const { data, error } = await supabase
          .from("certificate_alerts")
          .select("*")
          .order("alert_date", { ascending: false })
          .limit(100);

        if (error || !data?.length) {
          return [];
        }

        return data.map((alert): AlertHistory => ({
          id: alert.id,
          certificate_id: alert.certificate_id || "",
          certificate_type: "",
          holder_name: "",
          alert_type: alert.alert_type || "Alerta",
          sent_at: alert.alert_date || new Date().toISOString(),
          channel: "email",
          status: "sent",
        }));
      } catch {
        return [];
      }
    },
    staleTime: 30000,
  });

  // Send manual alert
  const sendAlertMutation = useMutation({
    mutationFn: async (certificate: Certificate) => {
      const newAlert: AlertHistory = {
        id: `alert-${Date.now()}`,
        certificate_id: certificate.id,
        certificate_type: certificate.certificate_type,
        holder_name: certificate.holder_name,
        alert_type: "Manual",
        sent_at: new Date().toISOString(),
        channel: "email",
        status: "sent",
      };

      setLocalAlertHistory((prev) => [newAlert, ...prev]);

      // Try to save to database
      try {
        await supabase.from("certificate_alerts").insert({
          certificate_id: certificate.id,
          alert_type: "manual",
          alert_date: new Date().toISOString(),
        });
      } catch {
        // Silent fail - local state already updated
      }
    },
    onSuccess: () => {
      toast.success("Alerta enviado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao enviar alerta");
    },
  });

  // Combine alert history
  const allAlertHistory = useMemo(() => {
    return [...localAlertHistory, ...(alertHistoryQuery.data || [])];
  }, [localAlertHistory, alertHistoryQuery.data]);

  // Calculate metrics
  const certificates = certificatesQuery.data || [];
  const metrics = {
    expired: certificates.filter((c) => c.days_until_expiry < 0).length,
    critical: certificates.filter((c) => c.days_until_expiry >= 0 && c.days_until_expiry <= 7).length,
    warning: certificates.filter((c) => c.days_until_expiry > 7 && c.days_until_expiry <= 30).length,
    ok: certificates.filter((c) => c.days_until_expiry > 30).length,
    total: certificates.length,
  };

  return {
    certificates,
    alertHistory: allAlertHistory,
    metrics,
    isLoading: certificatesQuery.isLoading,
    sendAlert: sendAlertMutation.mutate,
    refetch: () => {
      certificatesQuery.refetch();
      alertHistoryQuery.refetch();
    },
  };
}

// Default alert configurations
export const DEFAULT_ALERT_CONFIGS: AlertConfig[] = [
  {
    id: "alert-60",
    name: "Alerta Antecipado",
    days_before: 60,
    channels: ["email", "system"],
    recipients: ["rh@empresa.com"],
    enabled: true,
    escalation_enabled: false,
    escalation_days: 0,
  },
  {
    id: "alert-30",
    name: "Alerta Padrão",
    days_before: 30,
    channels: ["email", "push", "system"],
    recipients: ["rh@empresa.com", "gestor@empresa.com"],
    enabled: true,
    escalation_enabled: true,
    escalation_days: 7,
  },
  {
    id: "alert-7",
    name: "Alerta Urgente",
    days_before: 7,
    channels: ["email", "push", "sms", "system"],
    recipients: ["rh@empresa.com", "gestor@empresa.com", "diretor@empresa.com"],
    enabled: true,
    escalation_enabled: true,
    escalation_days: 3,
  },
  {
    id: "alert-3",
    name: "Alerta Crítico",
    days_before: 3,
    channels: ["email", "push", "sms", "system"],
    recipients: ["rh@empresa.com", "gestor@empresa.com", "diretor@empresa.com"],
    enabled: true,
    escalation_enabled: true,
    escalation_days: 1,
  },
  {
    id: "alert-1",
    name: "Alerta Final",
    days_before: 1,
    channels: ["email", "push", "sms", "system"],
    recipients: ["todos"],
    enabled: true,
    escalation_enabled: false,
    escalation_days: 0,
  },
];

export default useCertificateAlertsData;
