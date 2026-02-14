/**
 * Real-time Toast Notifications Hook
 * Automatically shows toast notifications for critical system events
 * Listens to Supabase Realtime for new alerts, incidents, and certificate expirations
 */

import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const SEVERITY_CONFIG = {
  critical: { icon: "🚨", duration: 10000 },
  high: { icon: "⚠️", duration: 8000 },
  medium: { icon: "📋", duration: 5000 },
  low: { icon: "ℹ️", duration: 4000 },
  info: { icon: "ℹ️", duration: 4000 },
} as const;

export function useRealtimeToasts() {
  const { user } = useAuth();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    // Cleanup previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel("global-toasts")
      // SOC Alerts (security incidents, system alerts)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "soc_alerts" },
        (payload) => {
          const severity = payload.new.severity as keyof typeof SEVERITY_CONFIG;
          const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
          
          if (severity === "critical" || severity === "high") {
            toast.error(`${config.icon} ${payload.new.title || "Alerta Crítico"}`, {
              description: payload.new.message || "Novo alerta de segurança requer atenção",
              duration: config.duration,
            });
          } else {
            toast.warning(`${config.icon} ${payload.new.title || "Novo Alerta"}`, {
              description: payload.new.message || "Novo alerta do sistema",
              duration: config.duration,
            });
          }
        }
      )
      // Intelligent notifications (general system notifications)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "intelligent_notifications" },
        (payload) => {
          const priority = payload.new.priority as string;
          if (priority === "critical" || priority === "high") {
            toast.error(`🔔 ${payload.new.title || "Notificação Urgente"}`, {
              description: payload.new.message || "",
              duration: 8000,
            });
          } else {
            toast.info(`🔔 ${payload.new.title || "Nova Notificação"}`, {
              description: payload.new.message || "",
              duration: 5000,
            });
          }
        }
      )
      // Non-conformities (compliance issues)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "non_conformities" },
        (payload) => {
          toast.warning("⚠️ Nova Não-Conformidade Registrada", {
            description: payload.new.description?.substring(0, 100) || "NC requer análise e ação corretiva",
            duration: 7000,
          });
        }
      )
      // Maintenance overdue
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "maintenance_tasks", filter: "status=eq.overdue" },
        (payload) => {
          toast.error("🔧 Manutenção Atrasada", {
            description: `${payload.new.title || "Tarefa"} - requer ação imediata`,
            duration: 8000,
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id]);
}
