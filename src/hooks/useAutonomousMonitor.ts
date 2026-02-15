/**
 * useAutonomousMonitor - Proactive AI monitoring hook
 * Runs continuous background checks and generates smart alerts
 */
import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export interface ProactiveAlert {
  id: string;
  type: "certificate_expiry" | "maintenance_due" | "compliance_gap" | "crew_fatigue" | "system_anomaly";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  module: string;
  actionUrl?: string;
  timestamp: string;
  dismissed: boolean;
}

interface MonitorConfig {
  enabled?: boolean;
  intervalMs?: number;
  maxAlerts?: number;
}

export function useAutonomousMonitor(config: MonitorConfig = {}) {
  const {
    enabled = true,
    intervalMs = 5 * 60 * 1000, // 5 minutes
    maxAlerts = 20,
  } = config;

  const [alerts, setAlerts] = useState<ProactiveAlert[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const queryClient = useQueryClient();
  const lastCheckRef = useRef<string>("");

  // Check certificate expirations
  const checkCertificates = useCallback(async (): Promise<ProactiveAlert[]> => {
    try {
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

      const { data, error } = await supabase
        .from("crew_certifications")
        .select("id, certification_name, expiry_date, crew_member_id")
        .lt("expiry_date", ninetyDaysFromNow.toISOString())
        .gt("expiry_date", new Date().toISOString())
        .limit(10);

      if (error || !data) return [];

      return data.map(cert => {
        const daysLeft = Math.ceil(
          (new Date(cert.expiry_date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return {
          id: `cert-${cert.id}`,
          type: "certificate_expiry" as const,
          severity: daysLeft < 30 ? "critical" as const : daysLeft < 60 ? "warning" as const : "info" as const,
          title: `${cert.certification_name} expira em ${daysLeft} dias`,
          description: `Certificado requer renovação urgente`,
          module: "Compliance",
          actionUrl: "/compliance",
          timestamp: new Date().toISOString(),
          dismissed: false,
        };
      });
    } catch {
      return [];
    }
  }, []);

  // Check maintenance tasks
  const checkMaintenance = useCallback(async (): Promise<ProactiveAlert[]> => {
    try {
      const { data, error } = await supabase
        .from("maintenance_tasks")
        .select("id, title, due_date, priority, status")
        .in("status", ["pending", "in_progress"])
        .lt("due_date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(5);

      if (error || !data) return [];

      return data
        .filter(t => t.due_date)
        .map(task => {
          const overdue = new Date(task.due_date!) < new Date();
          return {
            id: `maint-${task.id}`,
            type: "maintenance_due" as const,
            severity: overdue ? "critical" as const : task.priority === "high" ? "warning" as const : "info" as const,
            title: overdue ? `Manutenção atrasada: ${task.title}` : `Manutenção próxima: ${task.title}`,
            description: overdue ? "Tarefa ultrapassou a data prevista" : "Tarefa se aproxima do prazo",
            module: "Maintenance",
            actionUrl: "/maintenance",
            timestamp: new Date().toISOString(),
            dismissed: false,
          };
        });
    } catch {
      return [];
    }
  }, []);

  // Run all checks
  const runChecks = useCallback(async () => {
    const checkId = new Date().toISOString();
    if (lastCheckRef.current === checkId) return;
    lastCheckRef.current = checkId;

    try {
      const [certAlerts, maintAlerts] = await Promise.all([
        checkCertificates(),
        checkMaintenance(),
      ]);

      const newAlerts = [...certAlerts, ...maintAlerts]
        .sort((a, b) => {
          const severityOrder = { critical: 0, warning: 1, info: 2 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        })
        .slice(0, maxAlerts);

      setAlerts(prev => {
        const existingIds = new Set(prev.filter(a => a.dismissed).map(a => a.id));
        return newAlerts.map(alert => ({
          ...alert,
          dismissed: existingIds.has(alert.id),
        }));
      });

      // Show toast for critical new alerts
      const criticalNew = newAlerts.filter(a => a.severity === "critical");
      if (criticalNew.length > 0) {
        toast.warning(`${criticalNew.length} alerta(s) crítico(s) detectado(s)`, {
          description: criticalNew[0].title,
          action: {
            label: "Ver",
            onClick: () => {
              // Navigate handled by the consumer
            },
          },
        });
      }
    } catch (err) {
      logger.warn("[AutonomousMonitor] Check failed", { error: String(err) });
    }
  }, [checkCertificates, checkMaintenance, maxAlerts]);

  // Dismiss an alert
  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, dismissed: true } : a));
  }, []);

  // Start monitoring
  useEffect(() => {
    if (!enabled) return;

    // Initial check after 10 seconds
    const timeout = setTimeout(runChecks, 10000);

    // Periodic checks
    intervalRef.current = setInterval(runChecks, intervalMs);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, intervalMs, runChecks]);

  const activeAlerts = alerts.filter(a => !a.dismissed);
  const criticalCount = activeAlerts.filter(a => a.severity === "critical").length;
  const warningCount = activeAlerts.filter(a => a.severity === "warning").length;

  return {
    alerts: activeAlerts,
    allAlerts: alerts,
    criticalCount,
    warningCount,
    totalActive: activeAlerts.length,
    dismissAlert,
    refreshNow: runChecks,
  };
}
