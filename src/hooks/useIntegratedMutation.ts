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
  // Feedback & Training
  'feedback.submitted': [['app-metrics'], ['ai_feedback_scores'], ['dashboard-kpis']],
  'training.session.created': [['ai-training-sessions'], ['training'], ['crew'], ['compliance'], ['dashboard-kpis']],
  'training.session.completed': [['ai-training-sessions'], ['training'], ['crew'], ['compliance'], ['certificates'], ['dashboard-kpis']],
  // Communication
  'comms.whatsapp.sent': [['whatsapp-logs'], ['crew'], ['alerts']],
  'comms.whatsapp.batch_sent': [['whatsapp-logs'], ['crew'], ['alerts']],
  // Templates
  'document.template.created': [['document-templates'], ['documents']],
  'document.template.updated': [['document-templates'], ['documents']],
  'document.template.deleted': [['document-templates'], ['documents']],
  // Access Control
  'access.role.changed': [['admin-user-roles'], ['crew'], ['dashboard-kpis']],
  // Tracking resolve/delete
  'tracking.alert.resolved': [['tracking-alerts'], ['alerts'], ['tracking'], ['dashboard-kpis']],
  'tracking.alert.deleted': [['tracking-alerts'], ['alerts'], ['tracking']],
  // PEO-DP
  'peodp.logbook.entry_created': [['peodp-logbook'], ['compliance'], ['peodp'], ['dashboard-kpis']],
  'peodp.logbook.entry_deleted': [['peodp-logbook'], ['compliance'], ['peodp']],
  'peodp.fmea.item_created': [['peodp-fmea'], ['compliance'], ['maintenance'], ['dashboard-kpis']],
  'peodp.fmea.item_updated': [['peodp-fmea'], ['compliance'], ['maintenance']],
  'peodp.fmea.item_deleted': [['peodp-fmea'], ['compliance'], ['maintenance']],
  // Fleet History
  'fleet.history.event_created': [['vessel-history'], ['fleet'], ['vessels'], ['voyages'], ['dashboard-kpis']],
  'fleet.history.event_deleted': [['vessel-history'], ['fleet'], ['vessels']],
  // Maintenance extras
  'maintenance.spare_part.added': [['inventory'], ['spare-parts'], ['maintenance'], ['procurement'], ['dashboard-kpis']],
  'maintenance.running_hours.updated': [['running-hours'], ['maintenance'], ['pms_work_orders'], ['dashboard-kpis']],
  'maintenance.prediction.created': [['ai-predictions'], ['maintenance'], ['alerts'], ['dashboard-kpis']],
  // Compliance extras
  'compliance.class_survey.created': [['class-surveys'], ['compliance'], ['certificates'], ['dashboard-kpis']],
  'compliance.class_survey.updated': [['class-surveys'], ['compliance'], ['certificates']],
  'compliance.class_survey.deleted': [['class-surveys'], ['compliance']],
  'compliance.marpol.entry_created': [['marpol-logs'], ['compliance'], ['waste-management'], ['dashboard-kpis']],
  // Procurement
  'procurement.requisition.created': [['purchase-requisitions'], ['procurement'], ['finance'], ['dashboard-kpis']],
  'procurement.requisition.approved': [['purchase-requisitions'], ['procurement'], ['finance'], ['expenses']],
  // Safety / QHSE
  'safety.jsa.template_created': [['jsa-templates'], ['safety'], ['compliance'], ['dashboard-kpis']],
  'safety.nc.created': [['peotram-nc-actions'], ['compliance'], ['findings'], ['safety'], ['dashboard-kpis']],
  'safety.nc.status_changed': [['peotram-nc-actions'], ['compliance'], ['findings'], ['safety'], ['dashboard-kpis']],
  // Hull Integrity
  'maintenance.hull.inspection_created': [['hull-inspections'], ['maintenance'], ['compliance'], ['fleet'], ['dashboard-kpis']],
  'maintenance.hull.finding_created': [['hull-inspections'], ['maintenance'], ['compliance'], ['findings'], ['dashboard-kpis']],
  // Crew Operations
  'people.crew.assigned': [['crew-pool-planner'], ['crew'], ['vessels'], ['rotations'], ['dashboard-kpis']],
  'people.certification.created': [['crew-certifications-panel'], ['certificates'], ['crew'], ['compliance'], ['dashboard-kpis']],
  'people.certification.deleted': [['crew-certifications-panel'], ['certificates'], ['crew'], ['compliance']],
  // Maintenance Tasks (PMS)
  'maintenance.task.created': [['pms-job-cards'], ['maintenance'], ['work-orders'], ['dashboard-kpis']],
  'maintenance.task.status_changed': [['pms-job-cards'], ['maintenance'], ['work-orders'], ['compliance'], ['dashboard-kpis']],
  // AI Insights
  'ai.insight.read': [['advanced-ai-insights'], ['ai-insights'], ['dashboard-kpis']],
  // Benchmarking
  'peotram.benchmarking.seeded': [['peotram-vessel-scores'], ['compliance'], ['dashboard-kpis']],
  // Alerts (SOC / Telemetry)
  'alert.acknowledged': [['smart-alerts'], ['tracking-alerts'], ['alerts'], ['system-notifications'], ['dashboard-kpis']],
  'alert.resolved': [['smart-alerts'], ['tracking-alerts'], ['alerts'], ['system-notifications'], ['dashboard-kpis']],
  // Notifications
  'notification.read': [['system-notifications'], ['alerts']],
  'notification.all_read': [['system-notifications'], ['alerts']],
  // Security
  'security.finding.fixed': [['security-findings'], ['compliance'], ['alerts'], ['dashboard-kpis']],
  // Recruitment
  'recruitment.stage.changed': [['recruitment-candidatos'], ['recruitment-vagas'], ['crew'], ['dashboard-kpis']],
  // Safety DDS
  'safety.dds.created': [['safety-dds-records'], ['safety'], ['compliance'], ['training'], ['dashboard-kpis']],
  // Voyage Intelligence
  'voyage.route.selected': [['voyage-plans-intelligence'], ['voyages'], ['voyage-pnl'], ['fleet'], ['dashboard-kpis']],
  // Running Hours (IoT)
  'maintenance.sensor_reading.updated': [['running-hours'], ['maintenance'], ['pms_work_orders'], ['tracking-sensors'], ['dashboard-kpis']],
  // Telemetry alert create
  'tracking.telemetry_alert.created': [['tracking-alerts'], ['alerts'], ['smart-alerts'], ['dashboard-kpis']],
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
