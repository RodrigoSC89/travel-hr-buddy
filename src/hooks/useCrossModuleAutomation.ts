/**
 * Cross-Module Automation Engine
 * Proactive monitoring: Certificate→Alert, Maintenance→Procurement, Stock→Reorder
 */

import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface AutomationAlert {
  id: string;
  type: "certificate_expiry" | "maintenance_overdue" | "stock_critical" | "compliance_gap";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  module: string;
  resourceId: string;
  createdAt: string;
  actionTaken: boolean;
}

export function useCrossModuleAutomation() {
  const queryClient = useQueryClient();

  // Monitor expiring certificates (30-day window)
  const { data: expiringCerts = [] } = useQuery({
    queryKey: ["automation-expiring-certs"],
    queryFn: async () => {
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);

      const { data, error } = await supabase
        .from("maritime_certificates")
        .select("id, certification_type_id, expiry_date, status, crew_member_id, issuing_authority")
        .eq("status", "active")
        .lte("expiry_date", thirtyDays.toISOString())
        .gte("expiry_date", new Date().toISOString())
        .order("expiry_date", { ascending: true })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    staleTime: 300000, // 5 min
  });

  // Monitor overdue maintenance tasks
  const { data: overdueMaintenace = [] } = useQuery({
    queryKey: ["automation-overdue-maintenance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_tasks")
        .select("id, title, priority, status, due_date, vessel_id, component_name")
        .in("status", ["pending", "in_progress"])
        .lt("due_date", new Date().toISOString())
        .order("due_date", { ascending: true })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    staleTime: 300000,
  });

  // Monitor critical medical supplies
  const { data: criticalSupplies = [] } = useQuery({
    queryKey: ["automation-critical-supplies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_supplies")
        .select("id, name, quantity, min_stock, unit")
        .filter("quantity", "lte", "min_stock")
        .order("quantity", { ascending: true })
        .limit(30);

      if (error) {
        // Fallback: fetch all and filter client-side
        const { data: allSupplies } = await supabase
          .from("medical_supplies")
          .select("id, name, quantity, min_stock, unit")
          .order("quantity", { ascending: true })
          .limit(200);

        return (allSupplies || []).filter(s => (s.quantity || 0) <= (s.min_stock || 0));
      }
      return data || [];
    },
    staleTime: 300000,
  });

  // Build automation alerts
  const alerts: AutomationAlert[] = [
    ...expiringCerts.map((c): AutomationAlert => {
      const daysLeft = Math.ceil((new Date(c.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return {
        id: `cert-${c.id}`,
        type: "certificate_expiry",
        severity: daysLeft <= 7 ? "critical" : daysLeft <= 14 ? "warning" : "info",
        title: `Certificado ${c.certification_type_id || "marítimo"} expira em ${daysLeft} dias`,
        description: `Certificado emitido por ${c.issuing_authority || "N/A"} requer renovação`,
        module: "compliance",
        resourceId: c.id,
        createdAt: new Date().toISOString(),
        actionTaken: false,
      };
    }),
    ...overdueMaintenace.map((m): AutomationAlert => ({
      id: `maint-${m.id}`,
      type: "maintenance_overdue",
      severity: m.priority === "critical" ? "critical" : "warning",
      title: `Manutenção atrasada: ${m.title}`,
      description: `Componente: ${m.component_name || "N/A"} - Prioridade: ${m.priority}`,
      module: "maintenance",
      resourceId: m.id,
      createdAt: new Date().toISOString(),
      actionTaken: false,
    })),
    ...criticalSupplies.map((s): AutomationAlert => ({
      id: `supply-${s.id}`,
      type: "stock_critical",
      severity: (s.quantity || 0) <= 0 ? "critical" : "warning",
      title: `Estoque crítico: ${s.name}`,
      description: `Quantidade: ${s.quantity} ${s.unit || "un"} (mínimo: ${s.min_stock})`,
      module: "medical",
      resourceId: s.id,
      createdAt: new Date().toISOString(),
      actionTaken: false,
    })),
  ];

  // Auto-create SOC alert for critical items
  const createSOCAlert = useMutation({
    mutationFn: async (alert: AutomationAlert) => {
      const { data: userData } = await supabase.auth.getUser();
      const { data: orgData } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", userData?.user?.id || "")
        .eq("status", "active")
        .limit(1)
        .single();

      if (!orgData?.organization_id) {
        logger.warn("No organization found for SOC alert");
        return null;
      }

      const { data, error } = await supabase.rpc("create_soc_alert", {
        p_organization_id: orgData.organization_id,
        p_alert_type: alert.type,
        p_severity: alert.severity,
        p_title: alert.title,
        p_message: alert.description,
        p_source_module: alert.module,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Alerta SOC criado automaticamente");
    },
  });

  // Auto-create maintenance WO from overdue inspection
  const autoCreateWorkOrder = useMutation({
    mutationFn: async (input: { title: string; description: string; priority: string; vesselId?: string; componentName?: string }) => {
      const { data, error } = await supabase
        .from("maintenance_tasks")
        .insert({
          title: `[AUTO] ${input.title}`,
          description: input.description,
          priority: input.priority,
          status: "pending",
          vessel_id: input.vesselId || null,
          component_name: input.componentName || "General",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-overdue-maintenance"] });
      toast.success("Ordem de serviço criada automaticamente");
    },
  });

  return {
    alerts,
    criticalCount: alerts.filter(a => a.severity === "critical").length,
    warningCount: alerts.filter(a => a.severity === "warning").length,
    totalAlerts: alerts.length,
    expiringCerts,
    overdueMaintenace,
    criticalSupplies,
    createSOCAlert,
    autoCreateWorkOrder,
  };
}
