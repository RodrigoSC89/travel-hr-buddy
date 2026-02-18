/**
 * NAUTI ONE — useEventReactor
 * Listens to domain events (local bus + Supabase Realtime) and triggers
 * cross-module side effects automatically.
 * 
 * This is the CLIENT-SIDE complement to the server-side event-dispatcher Edge Function.
 * It handles UI-facing reactions: cache invalidation, toasts, navigation hints.
 */

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { localEventBus, type DomainEvent } from "@/lib/events/event-bus";
import { toast } from "sonner";

interface EventReaction {
  eventType: string;
  handler: (event: DomainEvent, queryClient: ReturnType<typeof useQueryClient>) => void;
}

/**
 * Cross-module reactions: when event X fires, do Y.
 * These are UI-side only — server-side effects happen in the Edge Function.
 */
const REACTIONS: EventReaction[] = [
  // ═══════════════════════════════════════════
  // VESSEL ↔ ALL MODULES
  // ═══════════════════════════════════════════
  {
    eventType: 'vessel.created',
    handler: (_e, qc) => {
      toast.success("Nova Embarcação Registrada", {
        description: "Fleet, Tracking e Compliance atualizados",
      });
      qc.invalidateQueries({ queryKey: ['vessels'] });
      qc.invalidateQueries({ queryKey: ['fleet'] });
      qc.invalidateQueries({ queryKey: ['tracking'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  },
  {
    eventType: 'vessel.updated',
    handler: (_e, qc) => {
      qc.invalidateQueries({ queryKey: ['vessels'] });
      qc.invalidateQueries({ queryKey: ['fleet'] });
      qc.invalidateQueries({ queryKey: ['tracking'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  },

  // ═══════════════════════════════════════════
  // VOYAGE ↔ FINANCE + FLEET + TRACKING
  // ═══════════════════════════════════════════
  {
    eventType: 'voyage.created',
    handler: (event, qc) => {
      toast.info("Viagem Criada", {
        description: "Tracking e Finance notificados",
        action: { label: "Ver Viagens", onClick: () => window.location.href = '/operations' },
      });
      qc.invalidateQueries({ queryKey: ['voyages'] });
      qc.invalidateQueries({ queryKey: ['fleet'] });
      qc.invalidateQueries({ queryKey: ['tracking'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  },
  {
    eventType: 'voyage.completed',
    handler: (_e, qc) => {
      toast.success("Viagem Concluída", {
        description: "P&L calculado → Finance e Fleet atualizados",
        action: { label: "Ver P&L", onClick: () => window.location.href = '/operations?tab=voyage-pnl' },
      });
      qc.invalidateQueries({ queryKey: ['voyages'] });
      qc.invalidateQueries({ queryKey: ['voyage-pnl'] });
      qc.invalidateQueries({ queryKey: ['fleet'] });
      qc.invalidateQueries({ queryKey: ['finance'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  },

  // ═══════════════════════════════════════════
  // MAINTENANCE ↔ COMPLIANCE + PROCUREMENT + FINANCE
  // ═══════════════════════════════════════════
  {
    eventType: 'maintenance.work_order.created',
    handler: (event, qc) => {
      const p = event.payload as Record<string, unknown>;
      toast.info("Nova OS Criada", {
        description: `Prioridade: ${p.priority ?? 'normal'} — Procurement e Compliance notificados`,
        action: { label: "Ver Manutenção", onClick: () => window.location.href = '/maintenance' },
      });
      qc.invalidateQueries({ queryKey: ['maintenance'] });
      qc.invalidateQueries({ queryKey: ['work-orders'] });
      qc.invalidateQueries({ queryKey: ['fleet'] });
      qc.invalidateQueries({ queryKey: ['compliance'] });
      qc.invalidateQueries({ queryKey: ['procurement'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  },
  {
    eventType: 'maintenance.work_order.completed',
    handler: (_e, qc) => {
      toast.info("OS Concluída", {
        description: "Compliance, Procurement e Finance atualizados automaticamente",
        action: { label: "Ver Compliance", onClick: () => window.location.href = '/compliance' },
      });
      qc.invalidateQueries({ queryKey: ['maintenance'] });
      qc.invalidateQueries({ queryKey: ['work-orders'] });
      qc.invalidateQueries({ queryKey: ['compliance'] });
      qc.invalidateQueries({ queryKey: ['procurement'] });
      qc.invalidateQueries({ queryKey: ['finance'] });
      qc.invalidateQueries({ queryKey: ['related-records'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  },
  {
    eventType: 'maintenance.task.overdue',
    handler: (_e, qc) => {
      toast.error("Tarefa de Manutenção Atrasada", {
        description: "Alerta gerado no SOC e Compliance notificado",
        duration: 10000,
      });
      qc.invalidateQueries({ queryKey: ['maintenance'] });
      qc.invalidateQueries({ queryKey: ['alerts'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  },

  // ═══════════════════════════════════════════
  // COMPLIANCE ↔ RISK + CREW + MAINTENANCE
  // ═══════════════════════════════════════════
  {
    eventType: 'compliance.audit.created',
    handler: (_e, qc) => {
      toast.info("Auditoria Criada", {
        description: "Compliance dashboard e KPIs atualizados",
      });
      qc.invalidateQueries({ queryKey: ['audits'] });
      qc.invalidateQueries({ queryKey: ['compliance'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  },
  {
    eventType: 'compliance.audit.completed',
    handler: (_e, qc) => {
      toast.success("Auditoria Concluída", {
        description: "Certificados e Compliance Matrix atualizados",
      });
      qc.invalidateQueries({ queryKey: ['audits'] });
      qc.invalidateQueries({ queryKey: ['compliance'] });
      qc.invalidateQueries({ queryKey: ['certificates'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  },
  {
    eventType: 'compliance.finding.created',
    handler: (_e, qc) => {
      toast.warning("Nova Não-Conformidade", {
        description: "Risk Matrix e Action Items atualizados automaticamente",
        action: { label: "Ver Riscos", onClick: () => window.location.href = '/compliance?tab=risk' },
      });
      qc.invalidateQueries({ queryKey: ['risk'] });
      qc.invalidateQueries({ queryKey: ['findings'] });
      qc.invalidateQueries({ queryKey: ['compliance'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  },
  {
    eventType: 'compliance.finding.closed',
    handler: (_e, qc) => {
      toast.success("Finding Encerrado", {
        description: "Risk Matrix e Compliance Score atualizados",
      });
      qc.invalidateQueries({ queryKey: ['findings'] });
      qc.invalidateQueries({ queryKey: ['compliance'] });
      qc.invalidateQueries({ queryKey: ['risk'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  },
  {
    eventType: 'compliance.certificate.expiring',
    handler: (event, qc) => {
      const p = event.payload as Record<string, unknown>;
      toast.error("Certificado Expirando", {
        description: `${p.certificate_type ?? 'Certificado'} (${p.days_remaining ?? '?'} dias) — Crew e Rotações bloqueados`,
        duration: 10000,
        action: { label: "Ver Tripulação", onClick: () => window.location.href = '/workbench?tab=people' },
      });
      qc.invalidateQueries({ queryKey: ['crew'] });
      qc.invalidateQueries({ queryKey: ['certificates'] });
      qc.invalidateQueries({ queryKey: ['alerts'] });
      qc.invalidateQueries({ queryKey: ['compliance'] });
      qc.invalidateQueries({ queryKey: ['rotations'] });
    },
  },
  {
    eventType: 'compliance.certificate.expired',
    handler: (_e, qc) => {
      toast.error("⚠️ Certificado EXPIRADO", {
        description: "Tripulante bloqueado para embarque. Compliance crítico.",
        duration: 15000,
      });
      qc.invalidateQueries({ queryKey: ['crew'] });
      qc.invalidateQueries({ queryKey: ['certificates'] });
      qc.invalidateQueries({ queryKey: ['alerts'] });
      qc.invalidateQueries({ queryKey: ['compliance'] });
      qc.invalidateQueries({ queryKey: ['rotations'] });
    },
  },

  // ═══════════════════════════════════════════
  // FINANCE ↔ PROCUREMENT + VOYAGE + FLEET
  // ═══════════════════════════════════════════
  {
    eventType: 'finance.invoice.created',
    handler: (_e, qc) => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['finance'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  },
  {
    eventType: 'finance.invoice.approved',
    handler: (_e, qc) => {
      toast.success("Fatura Aprovada", {
        description: "Finance, Voyage P&L e Suppliers atualizados",
      });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['finance'] });
      qc.invalidateQueries({ queryKey: ['voyage-pnl'] });
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  },
  {
    eventType: 'finance.po.created',
    handler: (_e, qc) => {
      qc.invalidateQueries({ queryKey: ['procurement'] });
      qc.invalidateQueries({ queryKey: ['finance'] });
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  },
  {
    eventType: 'finance.po.approved',
    handler: (_e, qc) => {
      toast.success("PO Aprovada → Financeiro", {
        description: "Expense criado, Suppliers e Contracts atualizados",
        action: { label: "Ver Finanças", onClick: () => window.location.href = '/workbench?tab=finance' },
      });
      qc.invalidateQueries({ queryKey: ['finance'] });
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['procurement'] });
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      qc.invalidateQueries({ queryKey: ['contracts'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  },

  // ═══════════════════════════════════════════
  // PEOPLE / CREW ↔ COMPLIANCE + VESSELS + ROTATIONS
  // ═══════════════════════════════════════════
  {
    eventType: 'people.rotation.published',
    handler: (_e, qc) => {
      toast.info("Escala Publicada", {
        description: "Validação MLC/STCW em andamento. Vessels e Compliance notificados.",
        action: { label: "Ver Tripulação", onClick: () => window.location.href = '/workbench?tab=people' },
      });
      qc.invalidateQueries({ queryKey: ['rotations'] });
      qc.invalidateQueries({ queryKey: ['crew'] });
      qc.invalidateQueries({ queryKey: ['vessels'] });
      qc.invalidateQueries({ queryKey: ['compliance'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  },
  {
    eventType: 'people.certification.expiring',
    handler: (_e, qc) => {
      qc.invalidateQueries({ queryKey: ['certificates'] });
      qc.invalidateQueries({ queryKey: ['crew'] });
      qc.invalidateQueries({ queryKey: ['alerts'] });
      qc.invalidateQueries({ queryKey: ['compliance'] });
    },
  },
  {
    eventType: 'people.medical.fitness_updated',
    handler: (_e, qc) => {
      toast.info("Aptidão Médica Atualizada", {
        description: "Crew e Compliance atualizados",
      });
      qc.invalidateQueries({ queryKey: ['medical'] });
      qc.invalidateQueries({ queryKey: ['crew'] });
      qc.invalidateQueries({ queryKey: ['compliance'] });
    },
  },
  {
    eventType: 'people.training.completed',
    handler: (_e, qc) => {
      toast.success("Treinamento Concluído", {
        description: "Competency Matrix e Compliance atualizados",
      });
      qc.invalidateQueries({ queryKey: ['training'] });
      qc.invalidateQueries({ queryKey: ['crew'] });
      qc.invalidateQueries({ queryKey: ['compliance'] });
    },
  },

  // ═══════════════════════════════════════════
  // TRACKING ↔ FLEET + SOC + ALERTS
  // ═══════════════════════════════════════════
  {
    eventType: 'tracking.alert.created',
    handler: (event, qc) => {
      const p = event.payload as Record<string, unknown>;
      toast.warning("Alerta de Rastreamento", {
        description: String(p.message ?? `${p.alert_type ?? 'Alerta'} — severity: ${p.severity ?? 'medium'}`),
        action: { label: "Ver Tracking", onClick: () => window.location.href = '/tracking' },
      });
      qc.invalidateQueries({ queryKey: ['alerts'] });
      qc.invalidateQueries({ queryKey: ['tracking'] });
      qc.invalidateQueries({ queryKey: ['fleet'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  },
  {
    eventType: 'tracking.connectivity.degraded',
    handler: (_e, qc) => {
      toast.error("Conectividade Degradada", {
        description: "Comunicação satelital com problemas — SOC notificado",
        duration: 15000,
      });
      qc.invalidateQueries({ queryKey: ['system-health'] });
      qc.invalidateQueries({ queryKey: ['tracking'] });
      qc.invalidateQueries({ queryKey: ['alerts'] });
    },
  },

  // ═══════════════════════════════════════════
  // DOCUMENTS ↔ ALL MODULES
  // ═══════════════════════════════════════════
  {
    eventType: 'document.created',
    handler: (_e, qc) => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      qc.invalidateQueries({ queryKey: ['entity-documents'] });
    },
  },
  {
    eventType: 'document.linked',
    handler: (_e, qc) => {
      toast.info("Documento Vinculado", {
        description: "Registros relacionados atualizados",
      });
      qc.invalidateQueries({ queryKey: ['documents'] });
      qc.invalidateQueries({ queryKey: ['entity-documents'] });
      qc.invalidateQueries({ queryKey: ['related-records'] });
    },
  },

  // ═══════════════════════════════════════════
  // AI ↔ ALL MODULES (HITL)
  // ═══════════════════════════════════════════
  {
    eventType: 'ai.decision.logged',
    handler: (_e, qc) => {
      qc.invalidateQueries({ queryKey: ['ai-decisions'] });
      qc.invalidateQueries({ queryKey: ['ai-audit'] });
    },
  },
  {
    eventType: 'ai.suggestion.created',
    handler: (_e, qc) => {
      toast.info("Nova Sugestão IA", {
        description: "Ação pendente de aprovação humana (HITL)",
        action: { label: "Ver IA", onClick: () => window.location.href = '/ai-hub' },
      });
      qc.invalidateQueries({ queryKey: ['ai-suggestions'] });
    },
  },
  {
    eventType: 'ai.suggestion.accepted',
    handler: (_e, qc) => {
      toast.success("Sugestão IA Executada", {
        description: "Ação real criada no módulo de destino",
      });
      qc.invalidateQueries({ queryKey: ['ai-suggestions'] });
      qc.invalidateQueries({ queryKey: ['ai-decisions'] });
      qc.invalidateQueries({ queryKey: ['maintenance'] });
      qc.invalidateQueries({ queryKey: ['compliance'] });
      qc.invalidateQueries({ queryKey: ['finance'] });
    },
  },
  {
    eventType: 'ai.suggestion.rejected',
    handler: (_e, qc) => {
      qc.invalidateQueries({ queryKey: ['ai-suggestions'] });
      qc.invalidateQueries({ queryKey: ['ai-decisions'] });
    },
  },

  // ═══════════════════════════════════════════
  // SYSTEM
  // ═══════════════════════════════════════════
  {
    eventType: 'system.integration.error',
    handler: (_e, qc) => {
      toast.error("Erro de Integração", {
        description: "Verifique o painel de saúde do sistema",
        duration: 10000,
      });
      qc.invalidateQueries({ queryKey: ['system-health'] });
    },
  },
  {
    eventType: 'system.health.degraded',
    handler: (_e, qc) => {
      toast.warning("Sistema Degradado", {
        description: "Performance reduzida detectada",
      });
      qc.invalidateQueries({ queryKey: ['system-health'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  },
];

/**
 * Hook that subscribes to the local event bus and Supabase Realtime
 * to trigger cross-module reactions.
 * 
 * Mount ONCE in AuthenticatedLayout.
 */
export function useEventReactor() {
  const queryClient = useQueryClient();
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    // 1. Subscribe to local event bus (in-memory, instant)
    const unsubLocal = localEventBus.on('*', (event: DomainEvent) => {
      for (const reaction of REACTIONS) {
        if (reaction.eventType === event.type) {
          try {
            reaction.handler(event, queryClient);
          } catch (e) {
            console.error(`[EventReactor] Error handling ${event.type}:`, e);
          }
        }
      }
    });

    // 2. Subscribe to Supabase Realtime for event_outbox changes
    const channel = supabase
      .channel('event-reactor')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'event_outbox' },
        (payload) => {
          const row = payload.new as { event_type?: string; payload?: Record<string, unknown> };
          if (!row.event_type) return;

          // Create a domain event from the DB row
          const domainEvent: DomainEvent = {
            type: row.event_type as any,
            payload: row.payload ?? {},
          };

          for (const reaction of REACTIONS) {
            if (reaction.eventType === row.event_type) {
              try {
                reaction.handler(domainEvent, queryClient);
              } catch (e) {
                console.error(`[EventReactor/RT] Error handling ${row.event_type}:`, e);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      unsubLocal();
      supabase.removeChannel(channel);
      mountedRef.current = false;
    };
  }, [queryClient]);
}
