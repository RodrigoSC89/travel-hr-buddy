/**
 * NAUTI ONE — useIntegratedMutation
 * Universal hook that wraps any Supabase mutation with:
 * 1. Automatic event publishing to outbox
 * 2. Audit logging
 * 3. Cross-module cache invalidation
 * 4. Local event bus emission for UI reactivity
 */

import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { publishEvent, type EventType, type DomainEvent } from "@/lib/events/event-bus";
import type { EntityType } from "@/lib/domain/types";
import { toast } from "sonner";

interface IntegratedMutationConfig<TInput, TOutput> {
  /** The actual mutation function */
  mutationFn: (input: TInput) => Promise<TOutput>;
  /** Event type to publish on success */
  eventType: EventType;
  /** Entity type for audit trail */
  entityType: EntityType;
  /** Extract entity ID from the output */
  getEntityId?: (output: TOutput) => string;
  /** Build the event payload from input + output */
  buildPayload?: (input: TInput, output: TOutput) => Record<string, unknown>;
  /** Query keys to invalidate on success (cross-module) */
  invalidateKeys?: string[][];
  /** Success message */
  successMessage?: string;
  /** Error message */
  errorMessage?: string;
  /** Additional mutation options */
  options?: Omit<UseMutationOptions<TOutput, Error, TInput>, 'mutationFn'>;
}

/**
 * Cross-module invalidation map: when an event fires,
 * these query keys get invalidated across the system.
 */
const CROSS_MODULE_INVALIDATIONS: Partial<Record<EventType, string[][]>> = {
  'vessel.created': [['vessels'], ['fleet'], ['dashboard-kpis']],
  'vessel.updated': [['vessels'], ['fleet'], ['dashboard-kpis']],
  'voyage.created': [['voyages'], ['fleet'], ['tracking'], ['dashboard-kpis']],
  'voyage.completed': [['voyages'], ['fleet'], ['finance'], ['voyage-pnl'], ['dashboard-kpis']],
  'maintenance.work_order.created': [['maintenance'], ['work-orders'], ['pms_work_orders'], ['fleet'], ['compliance'], ['dashboard-kpis']],
  'maintenance.work_order.completed': [['maintenance'], ['work-orders'], ['pms_work_orders'], ['compliance'], ['procurement'], ['dashboard-kpis']],
  'maintenance.work_order.status_changed': [['maintenance'], ['work-orders'], ['pms_work_orders'], ['compliance'], ['dashboard-kpis']],
  'maintenance.task.overdue': [['maintenance'], ['alerts'], ['dashboard-kpis']],
  'maintenance.system.created': [['pms_systems'], ['maintenance'], ['fleet']],
  'compliance.audit.created': [['audits'], ['compliance'], ['dashboard-kpis']],
  'compliance.audit.completed': [['audits'], ['compliance'], ['certificates'], ['dashboard-kpis']],
  'compliance.finding.created': [['findings'], ['compliance'], ['risk'], ['audits'], ['dashboard-kpis']],
  'compliance.finding.closed': [['findings'], ['compliance'], ['risk'], ['dashboard-kpis']],
  'compliance.certificate.expiring': [['certificates'], ['crew'], ['alerts'], ['compliance'], ['dashboard-kpis']],
  'compliance.certificate.expired': [['certificates'], ['crew'], ['alerts'], ['compliance'], ['dashboard-kpis']],
  'compliance.gap_analysis.completed': [['ism_gap_analysis'], ['compliance'], ['audits'], ['dashboard-kpis']],
  'compliance.capa.created': [['ism_capa'], ['compliance'], ['findings'], ['dashboard-kpis']],
  'compliance.capa.closed': [['ism_capa'], ['compliance'], ['findings'], ['dashboard-kpis']],
  'finance.invoice.created': [['invoices'], ['finance'], ['dashboard-kpis']],
  'finance.invoice.approved': [['invoices'], ['finance'], ['voyage-pnl'], ['dashboard-kpis']],
  'finance.po.created': [['procurement'], ['finance'], ['suppliers'], ['dashboard-kpis']],
  'finance.po.approved': [['procurement'], ['finance'], ['expenses'], ['contracts'], ['dashboard-kpis']],
  'finance.charter.created': [['charter_parties'], ['finance'], ['voyages'], ['fleet'], ['dashboard-kpis']],
  'finance.charter.status_changed': [['charter_parties'], ['finance'], ['voyages'], ['dashboard-kpis']],
  'finance.ets.record_created': [['eu_ets_tracking'], ['finance'], ['compliance'], ['dashboard-kpis']],
  'people.rotation.published': [['rotations'], ['crew'], ['vessels'], ['dashboard-kpis']],
  'people.certification.expiring': [['certificates'], ['crew'], ['alerts'], ['compliance']],
  'people.medical.fitness_updated': [['medical'], ['crew'], ['compliance']],
  'people.training.completed': [['training'], ['crew'], ['compliance']],
  'people.crew.created': [['crew'], ['crew-scheduler'], ['rotations'], ['vessels'], ['dashboard-kpis']],
  'tracking.alert.created': [['alerts'], ['tracking'], ['fleet'], ['dashboard-kpis']],
  'tracking.connectivity.degraded': [['tracking'], ['system-health'], ['alerts']],
  'document.created': [['documents'], ['entity-documents']],
  'document.linked': [['documents'], ['entity-documents'], ['related-records']],
  'ai.decision.logged': [['ai-decisions'], ['ai-audit']],
  'ai.suggestion.accepted': [['ai-suggestions'], ['maintenance'], ['compliance'], ['finance']],
};

export function useIntegratedMutation<TInput, TOutput>(
  config: IntegratedMutationConfig<TInput, TOutput>
) {
  const queryClient = useQueryClient();

  return useMutation<TOutput, Error, TInput>({
    mutationFn: async (input: TInput) => {
      // 1. Execute the actual mutation
      const result = await config.mutationFn(input);

      // 2. Publish event to outbox (async, non-blocking)
      const payload = config.buildPayload
        ? config.buildPayload(input, result)
        : { input, result };

      const entityId = config.getEntityId?.(result);

      publishEvent({
        type: config.eventType,
        payload,
        sourceEntityType: config.entityType,
        sourceEntityId: entityId,
      }).catch(() => {
        // Event publishing failure shouldn't break the mutation
        console.warn(`[IntegratedMutation] Failed to publish ${config.eventType}`);
      });

      return result;
    },
    onSuccess: (_data: TOutput, _vars: TInput, _ctx: unknown) => {
      // 3. Show success toast
      if (config.successMessage) {
        toast.success(config.successMessage);
      }

      // 4. Invalidate cross-module caches
      const autoKeys = CROSS_MODULE_INVALIDATIONS[config.eventType] ?? [];
      const extraKeys = config.invalidateKeys ?? [];
      const allKeys = [...autoKeys, ...extraKeys];

      for (const key of allKeys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
    onError: (error: Error) => {
      if (config.errorMessage) {
        toast.error(config.errorMessage, { description: error.message });
      }
    },
    ...config.options,
  });
}
