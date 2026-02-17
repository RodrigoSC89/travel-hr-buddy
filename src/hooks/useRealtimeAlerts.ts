/**
 * Realtime Alerts Hook - Supabase Realtime subscriptions
 * Listens to critical tables and triggers toast notifications
 */

import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export function useRealtimeAlerts() {
  useEffect(() => {
    const channel = supabase
      .channel("global-realtime-alerts")
      // Maintenance tasks - new critical/urgent
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "maintenance_tasks" },
        (payload) => {
          const task = payload.new as Record<string, unknown>;
          if (task.priority === "critical" || task.priority === "urgent") {
            toast.warning(`🔧 Nova manutenção ${task.priority}: ${task.title}`, {
              duration: 8000,
            });
          }
        }
      )
      // Non-conformities
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "non_conformities" },
        (payload) => {
          const nc = payload.new as Record<string, unknown>;
          toast.error(`⚠️ Nova NC registrada: ${nc.title || "Não-conformidade"}`, {
            duration: 8000,
          });
        }
      )
      // SOC alerts
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "soc_alerts" },
        (payload) => {
          const alert = payload.new as Record<string, unknown>;
          const icon = alert.severity === "critical" ? "🚨" : alert.severity === "high" ? "⚠️" : "ℹ️";
          toast[alert.severity === "critical" ? "error" : "warning"](
            `${icon} ${alert.title}`,
            { duration: 10000 }
          );
        }
      )
      // Vessel status changes
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "vessels" },
        (payload) => {
          const vessel = payload.new as Record<string, unknown>;
          const old = payload.old as Record<string, unknown>;
          if (vessel.status !== old.status) {
            toast.info(`🚢 ${vessel.name}: status → ${vessel.status}`, {
              duration: 5000,
            });
          }
        }
      )
      // Certificate expiry alerts
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "crew_certifications" },
        (payload) => {
          const cert = payload.new as Record<string, unknown>;
          if (cert.status === "expired") {
            toast.error(`📜 Certificado expirado: ${cert.certificate_type}`, {
              duration: 10000,
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          logger.info("Realtime alerts channel active");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
