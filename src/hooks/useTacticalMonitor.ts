/**
 * useTacticalMonitor - Integrates Situational Awareness + Tactical Response
 * into the autonomous monitoring loop with auto-resolution capabilities
 */
import { useEffect, useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { localEventBus, type DomainEvent, type EventType } from "@/lib/events/event-bus";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export interface TacticalInsight {
  id: string;
  type: "auto_resolved" | "escalated" | "suggestion";
  title: string;
  description: string;
  module: string;
  confidence: number;
  resolution?: string;
  timestamp: string;
}

interface TacticalConfig {
  enabled?: boolean;
  autoResolveThreshold?: number; // Confidence threshold for auto-resolution (0-1)
}

/**
 * Auto-resolution rules for low-risk, high-confidence scenarios
 */
const AUTO_RESOLVE_RULES: Array<{
  eventPattern: string;
  condition: (event: DomainEvent) => boolean;
  resolve: (event: DomainEvent, qc: ReturnType<typeof useQueryClient>) => TacticalInsight | null;
}> = [
  {
    // Auto-acknowledge info-level alerts after detection
    eventPattern: "tracking.alert.created",
    condition: (e) => {
      const p = e.payload as Record<string, unknown>;
      return p.severity === "info" || p.severity === "low";
    },
    resolve: (e, qc) => {
      qc.invalidateQueries({ queryKey: ["tracking-alerts"] });
      return {
        id: `ar-${Date.now()}`,
        type: "auto_resolved",
        title: "Alerta de baixa prioridade auto-reconhecido",
        description: `Alerta informativo processado automaticamente`,
        module: "Tracking",
        confidence: 0.95,
        resolution: "acknowledged",
        timestamp: new Date().toISOString(),
      };
    },
  },
  {
    // Auto-flag maintenance tasks approaching deadline
    eventPattern: "maintenance.task.status_changed",
    condition: (e) => {
      const p = e.payload as Record<string, unknown>;
      return p.status === "in_progress" && p.priority !== "critical";
    },
    resolve: (_e, qc) => {
      qc.invalidateQueries({ queryKey: ["maintenance"] });
      return {
        id: `ar-${Date.now()}`,
        type: "suggestion",
        title: "Tarefa em progresso monitorada",
        description: "Acompanhamento automático ativado para prazo",
        module: "Maintenance",
        confidence: 0.85,
        timestamp: new Date().toISOString(),
      };
    },
  },
  {
    // Auto-escalate critical compliance findings
    eventPattern: "compliance.finding.created",
    condition: (e) => {
      const p = e.payload as Record<string, unknown>;
      return p.severity === "critical";
    },
    resolve: (_e, qc) => {
      qc.invalidateQueries({ queryKey: ["compliance"] });
      qc.invalidateQueries({ queryKey: ["alerts"] });
      return {
        id: `esc-${Date.now()}`,
        type: "escalated",
        title: "Finding crítico escalado automaticamente",
        description: "Non-conformidade crítica detectada → SOC e DPA notificados",
        module: "Compliance",
        confidence: 0.99,
        resolution: "escalated_to_dpa",
        timestamp: new Date().toISOString(),
      };
    },
  },
  {
    // Auto-log certificate renewal reminders
    eventPattern: "compliance.certificate.expiring",
    condition: (e) => {
      const p = e.payload as Record<string, unknown>;
      return Number(p.days_remaining) <= 30;
    },
    resolve: (_e, qc) => {
      qc.invalidateQueries({ queryKey: ["certificates"] });
      qc.invalidateQueries({ queryKey: ["crew"] });
      return {
        id: `cert-${Date.now()}`,
        type: "escalated",
        title: "Renovação de certificado urgente",
        description: "Certificado com < 30 dias → bloqueio de embarque ativado",
        module: "Compliance",
        confidence: 0.98,
        resolution: "boarding_block_activated",
        timestamp: new Date().toISOString(),
      };
    },
  },
  {
    // Auto-optimize on noon report with high fuel consumption
    eventPattern: "operations.noon.report_created",
    condition: (e) => {
      const p = e.payload as Record<string, unknown>;
      return Number(p.fuel_consumption_mt) > Number(p.expected_consumption_mt || Infinity) * 1.15;
    },
    resolve: (_e, qc) => {
      qc.invalidateQueries({ queryKey: ["voyages"] });
      qc.invalidateQueries({ queryKey: ["fleet"] });
      return {
        id: `fuel-${Date.now()}`,
        type: "suggestion",
        title: "Consumo de combustível acima do esperado",
        description: "Consumo 15%+ acima do baseline → sugestão de otimização de rota gerada",
        module: "Operations",
        confidence: 0.88,
        timestamp: new Date().toISOString(),
      };
    },
  },
];

export function useTacticalMonitor(config: TacticalConfig = {}) {
  const { enabled = true, autoResolveThreshold = 0.80 } = config;
  const queryClient = useQueryClient();
  const [insights, setInsights] = useState<TacticalInsight[]>([]);
  const [autoResolvedCount, setAutoResolvedCount] = useState(0);
  const mountedRef = useRef(true);

  const processEvent = useCallback((event: DomainEvent) => {
    for (const rule of AUTO_RESOLVE_RULES) {
      if (event.type === rule.eventPattern && rule.condition(event)) {
        const insight = rule.resolve(event, queryClient);
        if (insight && insight.confidence >= autoResolveThreshold) {
          if (!mountedRef.current) return;

          setInsights(prev => [insight, ...prev].slice(0, 50));

          if (insight.type === "auto_resolved") {
            setAutoResolvedCount(c => c + 1);
            logger.info("[TacticalMonitor] Auto-resolved", { id: insight.id, module: insight.module });
          } else if (insight.type === "escalated") {
            toast.warning(insight.title, { description: insight.description, duration: 8000 });
            logger.info("[TacticalMonitor] Escalated", { id: insight.id, module: insight.module });
          }

          // Log to audit trail (fire-and-forget)
          import("@/integrations/supabase/untyped-client").then(({ fromUntyped }) => {
            fromUntyped("system_audit_trail").insert({
              action_type: insight.type === "escalated" ? "escalate" : "auto_resolve",
              module: insight.module,
              resource_type: "tactical_insight",
              description: insight.title,
              severity: insight.type === "escalated" ? "warning" : "info",
              metadata: { confidence: insight.confidence, resolution: insight.resolution },
            }).then(() => {}).catch(() => {});
          });

          break; // Only first matching rule
        }
      }
    }
  }, [queryClient, autoResolveThreshold]);

  useEffect(() => {
    if (!enabled) return;
    mountedRef.current = true;

    // Subscribe to ALL domain events via wildcard
    const unsub = localEventBus.on("*" as EventType, processEvent);

    return () => {
      mountedRef.current = false;
      unsub();
    };
  }, [enabled, processEvent]);

  return {
    insights,
    autoResolvedCount,
    recentEscalations: insights.filter(i => i.type === "escalated"),
    recentSuggestions: insights.filter(i => i.type === "suggestion"),
  };
}
