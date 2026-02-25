/**
 * useAutonomousMonitor v2 - Proactive AI monitoring with cross-module correlation
 * Runs continuous background checks across fleet, compliance, maintenance, and crew
 */
import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export interface ProactiveAlert {
  id: string;
  type: "certificate_expiry" | "maintenance_due" | "compliance_gap" | "crew_fatigue" | "system_anomaly" | "cascading_risk" | "vessel_risk";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  module: string;
  actionUrl?: string;
  timestamp: string;
  dismissed: boolean;
  relatedModules?: string[];
  impactScore?: number;
}

interface MonitorConfig {
  enabled?: boolean;
  intervalMs?: number;
  maxAlerts?: number;
}

export function useAutonomousMonitor(config: MonitorConfig = {}) {
  const {
    enabled = true,
    intervalMs = 5 * 60 * 1000,
    maxAlerts = 25,
  } = config;

  const [alerts, setAlerts] = useState<ProactiveAlert[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const queryClient = useQueryClient();
  const lastCheckRef = useRef<string>("");

  // Check certificate expirations
  const checkCertificates = useCallback(async (): Promise<ProactiveAlert[]> => {
    try {
      const ninetyDays = new Date(Date.now() + 90 * 86400000);
      const { data, error } = await supabase
        .from("crew_certifications")
        .select("id, certification_name, expiry_date, crew_member_id")
        .lt("expiry_date", ninetyDays.toISOString())
        .gt("expiry_date", new Date().toISOString())
        .limit(10);
      if (error || !data) return [];

      return data.map(cert => {
        const daysLeft = Math.ceil((new Date(cert.expiry_date!).getTime() - Date.now()) / 86400000);
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
    } catch { return []; }
  }, []);

  // Check maintenance tasks
  const checkMaintenance = useCallback(async (): Promise<ProactiveAlert[]> => {
    try {
      const { data, error } = await supabase
        .from("maintenance_tasks")
        .select("id, title, due_date, priority, status, vessel_id")
        .in("status", ["pending", "in_progress", "overdue"])
        .lt("due_date", new Date(Date.now() + 7 * 86400000).toISOString())
        .limit(10);
      if (error || !data) return [];

      return data.filter(t => t.due_date).map(task => {
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
    } catch { return []; }
  }, []);

  // Check non-conformities
  const checkNonConformities = useCallback(async (): Promise<ProactiveAlert[]> => {
    try {
      const { data, error } = await supabase
        .from("non_conformities")
        .select("id, description, severity, status, vessel_id")
        .neq("status", "closed")
        .in("severity", ["critical", "major"])
        .limit(5);
      if (error || !data) return [];

      return data.map(nc => ({
        id: `nc-${nc.id}`,
        type: "compliance_gap" as const,
        severity: nc.severity === "critical" ? "critical" as const : "warning" as const,
        title: `NC ${nc.severity}: ${(nc.description || "Não-conformidade aberta").substring(0, 60)}`,
        description: "Requer ação corretiva imediata",
        module: "QHSE",
        actionUrl: "/compliance?tab=qhse",
        timestamp: new Date().toISOString(),
        dismissed: false,
      }));
    } catch { return []; }
  }, []);

  // Cross-module cascading risk detection
  const checkCascadingRisks = useCallback(async (): Promise<ProactiveAlert[]> => {
    try {
      const [maintRes, certRes, ncRes] = await Promise.all([
        supabase.from("maintenance_tasks").select("vessel_id").eq("status", "overdue"),
        supabase.from("crew_certifications").select("crew_member_id").lt("expiry_date", new Date(Date.now() + 30 * 86400000).toISOString()).gt("expiry_date", new Date().toISOString()),
        supabase.from("non_conformities").select("vessel_id").neq("status", "closed").in("severity", ["critical", "major"]),
      ]);

      const overdueCount = (maintRes.data || []).length;
      const expiringCount = (certRes.data || []).length;
      const openNCCount = (ncRes.data || []).length;

      const alerts: ProactiveAlert[] = [];

      // Pattern: Multiple systems under stress
      const riskFactors = [
        { active: overdueCount >= 3, label: `${overdueCount} manutenções atrasadas`, module: "Manutenção" },
        { active: expiringCount >= 2, label: `${expiringCount} certificados expirando`, module: "Compliance" },
        { active: openNCCount >= 2, label: `${openNCCount} NCs abertas`, module: "QHSE" },
      ].filter(f => f.active);

      if (riskFactors.length >= 2) {
        alerts.push({
          id: `cascade-${Date.now()}`,
          type: "cascading_risk",
          severity: riskFactors.length >= 3 ? "critical" : "warning",
          title: `Risco sistêmico: ${riskFactors.length} áreas comprometidas`,
          description: riskFactors.map(f => f.label).join(" + "),
          module: "Cross-Module",
          actionUrl: "/command",
          timestamp: new Date().toISOString(),
          dismissed: false,
          relatedModules: riskFactors.map(f => f.module),
          impactScore: riskFactors.length * 30,
        });
      }

      return alerts;
    } catch { return []; }
  }, []);

  // Run all checks
  const runChecks = useCallback(async () => {
    const checkId = new Date().toISOString();
    if (lastCheckRef.current === checkId) return;
    lastCheckRef.current = checkId;

    try {
      const [certAlerts, maintAlerts, ncAlerts, cascadeAlerts] = await Promise.all([
        checkCertificates(),
        checkMaintenance(),
        checkNonConformities(),
        checkCascadingRisks(),
      ]);

      const newAlerts = [...cascadeAlerts, ...certAlerts, ...maintAlerts, ...ncAlerts]
        .sort((a, b) => {
          const order = { critical: 0, warning: 1, info: 2 };
          return order[a.severity] - order[b.severity];
        })
        .slice(0, maxAlerts);

      setAlerts(prev => {
        const dismissedIds = new Set(prev.filter(a => a.dismissed).map(a => a.id));
        return newAlerts.map(alert => ({
          ...alert,
          dismissed: dismissedIds.has(alert.id),
        }));
      });

      const criticalNew = newAlerts.filter(a => a.severity === "critical");
      if (criticalNew.length > 0) {
        toast.warning(`${criticalNew.length} alerta(s) crítico(s) detectado(s)`, {
          description: criticalNew[0].title,
          action: { label: "Ver", onClick: () => {} },
        });
      }
    } catch (err) {
      logger.warn("[AutonomousMonitor] Check failed", { error: String(err) });
    }
  }, [checkCertificates, checkMaintenance, checkNonConformities, checkCascadingRisks, maxAlerts]);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, dismissed: true } : a));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const timeout = setTimeout(runChecks, 10000);
    intervalRef.current = setInterval(runChecks, intervalMs);
    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, intervalMs, runChecks]);

  const activeAlerts = alerts.filter(a => !a.dismissed);

  return {
    alerts: activeAlerts,
    allAlerts: alerts,
    criticalCount: activeAlerts.filter(a => a.severity === "critical").length,
    warningCount: activeAlerts.filter(a => a.severity === "warning").length,
    totalActive: activeAlerts.length,
    dismissAlert,
    refreshNow: runChecks,
  };
}
