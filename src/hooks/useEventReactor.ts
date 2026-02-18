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
  // Maintenance → Compliance: WO completed = notify compliance team
  {
    eventType: 'maintenance.work_order.completed',
    handler: (event, qc) => {
      toast.info("Manutenção concluída", {
        description: `OS finalizada — Compliance notificado automaticamente`,
        action: { label: "Ver Compliance", onClick: () => window.location.href = '/compliance' },
      });
      qc.invalidateQueries({ queryKey: ['compliance'] });
      qc.invalidateQueries({ queryKey: ['related-records'] });
    },
  },
  // Compliance → Risk: Finding created = risk matrix updated
  {
    eventType: 'compliance.finding.created',
    handler: (event, qc) => {
      toast.warning("Nova Não-Conformidade", {
        description: "Risk Matrix atualizada automaticamente",
        action: { label: "Ver Riscos", onClick: () => window.location.href = '/compliance?tab=risk' },
      });
      qc.invalidateQueries({ queryKey: ['risk'] });
      qc.invalidateQueries({ queryKey: ['findings'] });
    },
  },
  // Certificate expiring → Alert + Crew block
  {
    eventType: 'compliance.certificate.expiring',
    handler: (event, qc) => {
      const payload = event.payload as Record<string, unknown>;
      toast.error("Certificado Expirando", {
        description: `${payload.certificate_type ?? 'Certificado'} — ação necessária`,
        duration: 10000,
        action: { label: "Ver Tripulação", onClick: () => window.location.href = '/workbench?tab=people' },
      });
      qc.invalidateQueries({ queryKey: ['crew'] });
      qc.invalidateQueries({ queryKey: ['certificates'] });
      qc.invalidateQueries({ queryKey: ['alerts'] });
    },
  },
  // PO approved → Finance auto-expense
  {
    eventType: 'finance.po.approved',
    handler: (event, qc) => {
      toast.success("PO Aprovada → Financeiro", {
        description: "Lançamento financeiro criado automaticamente",
        action: { label: "Ver Finanças", onClick: () => window.location.href = '/workbench?tab=finance' },
      });
      qc.invalidateQueries({ queryKey: ['finance'] });
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['procurement'] });
    },
  },
  // Voyage completed → P&L calculation
  {
    eventType: 'voyage.completed',
    handler: (event, qc) => {
      toast.success("Viagem Concluída", {
        description: "P&L da viagem calculado e disponível",
        action: { label: "Ver P&L", onClick: () => window.location.href = '/operations?tab=voyage-pnl' },
      });
      qc.invalidateQueries({ queryKey: ['voyages'] });
      qc.invalidateQueries({ queryKey: ['voyage-pnl'] });
      qc.invalidateQueries({ queryKey: ['fleet'] });
    },
  },
  // Tracking alert → notify
  {
    eventType: 'tracking.alert.created',
    handler: (event, qc) => {
      const payload = event.payload as Record<string, unknown>;
      toast.warning("Alerta de Rastreamento", {
        description: String(payload.message ?? 'Novo alerta de posição/geofence'),
        action: { label: "Ver Tracking", onClick: () => window.location.href = '/tracking' },
      });
      qc.invalidateQueries({ queryKey: ['alerts'] });
      qc.invalidateQueries({ queryKey: ['tracking'] });
    },
  },
  // AI suggestion accepted → cross-module action
  {
    eventType: 'ai.suggestion.accepted',
    handler: (event, qc) => {
      toast.success("Sugestão IA Executada", {
        description: "Ação real criada no módulo de destino",
      });
      qc.invalidateQueries({ queryKey: ['ai-suggestions'] });
      qc.invalidateQueries({ queryKey: ['maintenance'] });
      qc.invalidateQueries({ queryKey: ['compliance'] });
    },
  },
  // Rotation published → validate compliance
  {
    eventType: 'people.rotation.published',
    handler: (event, qc) => {
      toast.info("Escala Publicada", {
        description: "Validação MLC/STCW em andamento",
        action: { label: "Ver Tripulação", onClick: () => window.location.href = '/workbench?tab=people' },
      });
      qc.invalidateQueries({ queryKey: ['rotations'] });
      qc.invalidateQueries({ queryKey: ['crew'] });
      qc.invalidateQueries({ queryKey: ['compliance'] });
    },
  },
  // Connectivity degraded → system alert
  {
    eventType: 'tracking.connectivity.degraded',
    handler: (event, qc) => {
      toast.error("Conectividade Degradada", {
        description: "Comunicação satelital com problemas",
        duration: 15000,
      });
      qc.invalidateQueries({ queryKey: ['system-health'] });
      qc.invalidateQueries({ queryKey: ['tracking'] });
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
