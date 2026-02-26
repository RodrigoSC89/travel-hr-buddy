/**
 * useExpirationMonitor - Hook de monitoramento proativo de vencimentos
 * Monitora certificados, documentos e manutenções próximas do vencimento
 * Dispara notificações toast e pode criar alertas automáticos no SOC
 */

import { useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface ExpiringItem {
  id: string;
  type: "certificate" | "document" | "maintenance" | "crew_certification";
  name: string;
  expiry_date: string;
  days_remaining: number;
  severity: "info" | "warning" | "critical" | "expired";
  entity_id?: string;
  vessel_name?: string;
}

interface ExpirationMonitorOptions {
  enabled?: boolean;
  notifyUser?: boolean;
  thresholds?: {
    info: number;    // days
    warning: number;
    critical: number;
  };
  checkIntervalMs?: number;
}

const DEFAULT_THRESHOLDS = { info: 90, warning: 30, critical: 7 };

function getSeverity(daysRemaining: number, thresholds = DEFAULT_THRESHOLDS): ExpiringItem["severity"] {
  if (daysRemaining <= 0) return "expired";
  if (daysRemaining <= thresholds.critical) return "critical";
  if (daysRemaining <= thresholds.warning) return "warning";
  return "info";
}

function getDaysRemaining(dateStr: string): number {
  const now = new Date();
  const expiry = new Date(dateStr);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function useExpirationMonitor(options: ExpirationMonitorOptions = {}) {
  const {
    enabled = true,
    notifyUser = true,
    thresholds = DEFAULT_THRESHOLDS,
  } = options;

  const notifiedRef = useRef<Set<string>>(new Set());

  const { data: expiringItems = [], isLoading, refetch } = useQuery({
    queryKey: ["expiration-monitor", thresholds.info],
    queryFn: async (): Promise<ExpiringItem[]> => {
      const items: ExpiringItem[] = [];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + thresholds.info);
      const cutoff = cutoffDate.toISOString();

      // Fetch crew certifications
      try {
        const { data: certs } = await supabase
          .from("crew_certifications")
          .select("id, certification_name, expiry_date, crew_member_id")
          .lte("expiry_date", cutoff)
          .order("expiry_date", { ascending: true })
          .limit(100);

        if (certs) {
          for (const c of certs) {
            if (!c.expiry_date) continue;
            const days = getDaysRemaining(c.expiry_date);
            items.push({
              id: c.id,
              type: "crew_certification",
              name: c.certification_name || "Certificado",
              expiry_date: c.expiry_date,
              days_remaining: days,
              severity: getSeverity(days, thresholds),
              entity_id: c.crew_member_id || undefined,
            });
          }
        }
      } catch (err) {
        logger.warn("[ExpirationMonitor] Error fetching crew certs:", err);
      }

      // Fetch vessel certificates
      try {
        const { data: vCerts } = await supabase
          .from("certificates")
          .select("id, certificate_type, expiry_date, vessel_id")
          .lte("expiry_date", cutoff)
          .order("expiry_date", { ascending: true })
          .limit(100);

        if (vCerts) {
          for (const c of vCerts) {
            if (!c.expiry_date) continue;
            const days = getDaysRemaining(c.expiry_date);
            items.push({
              id: c.id,
              type: "certificate",
              name: c.certificate_type || "Certificado de Embarcação",
              expiry_date: c.expiry_date,
              days_remaining: days,
              severity: getSeverity(days, thresholds),
              entity_id: c.vessel_id || undefined,
            });
          }
        }
      } catch (err) {
        logger.warn("[ExpirationMonitor] Error fetching vessel certs:", err);
      }

      // Fetch overdue maintenance
      try {
        const { data: maint } = await supabase
          .from("maintenance_tasks")
          .select("id, title, due_date, vessel_id")
          .lte("due_date", cutoff)
          .neq("status", "completed")
          .order("due_date", { ascending: true })
          .limit(50);

        if (maint) {
          for (const m of maint) {
            if (!m.due_date) continue;
            const days = getDaysRemaining(m.due_date);
            items.push({
              id: m.id,
              type: "maintenance",
              name: m.title || "Manutenção",
              expiry_date: m.due_date,
              days_remaining: days,
              severity: getSeverity(days, thresholds),
              entity_id: m.vessel_id || undefined,
            });
          }
        }
      } catch (err) {
        logger.warn("[ExpirationMonitor] Error fetching maintenance:", err);
      }

      // Sort by urgency
      items.sort((a, b) => a.days_remaining - b.days_remaining);
      return items;
    },
    enabled,
    staleTime: 1000 * 60 * 10, // 10 min
    refetchInterval: 1000 * 60 * 30, // 30 min auto-refresh
  });

  // Notify user about critical/expired items
  useEffect(() => {
    if (!notifyUser || !expiringItems.length) return;

    const critical = expiringItems.filter(
      (i) => (i.severity === "critical" || i.severity === "expired") && !notifiedRef.current.has(i.id)
    );

    if (critical.length > 0) {
      const expired = critical.filter((i) => i.severity === "expired");
      const aboutToExpire = critical.filter((i) => i.severity === "critical");

      if (expired.length > 0) {
        toast.error(`⚠️ ${expired.length} item(ns) vencido(s)`, {
          description: `${expired[0].name}${expired.length > 1 ? ` e mais ${expired.length - 1}` : ""}`,
          duration: 8000,
        });
      }

      if (aboutToExpire.length > 0) {
        toast.warning(`🔔 ${aboutToExpire.length} vencendo em ${aboutToExpire[0].days_remaining} dias`, {
          description: aboutToExpire[0].name,
          duration: 6000,
        });
      }

      critical.forEach((i) => notifiedRef.current.add(i.id));
    }
  }, [expiringItems, notifyUser]);

  const stats = {
    total: expiringItems.length,
    expired: expiringItems.filter((i) => i.severity === "expired").length,
    critical: expiringItems.filter((i) => i.severity === "critical").length,
    warning: expiringItems.filter((i) => i.severity === "warning").length,
    info: expiringItems.filter((i) => i.severity === "info").length,
  };

  const getByType = useCallback(
    (type: ExpiringItem["type"]) => expiringItems.filter((i) => i.type === type),
    [expiringItems]
  );

  const getBySeverity = useCallback(
    (severity: ExpiringItem["severity"]) => expiringItems.filter((i) => i.severity === severity),
    [expiringItems]
  );

  return {
    items: expiringItems,
    stats,
    isLoading,
    refetch,
    getByType,
    getBySeverity,
  };
}

export type { ExpiringItem, ExpirationMonitorOptions };
