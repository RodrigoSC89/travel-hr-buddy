/**
 * NAUTI ONE — Pre-built Module Hooks
 * Each hook wraps a domain service operation with useIntegratedMutation,
 * ensuring EVERY mutation flows through: DB → Event Outbox → Audit → Cache Invalidation.
 *
 * Usage in any page: const { mutate } = useCreateVessel();
 */

import { useIntegratedMutation } from "./useIntegratedMutation";
import {
  VesselsService,
  VoyagesService,
  MaintenanceService,
  ComplianceService,
  FinanceService,
  DocumentsService,
  TrackingService,
  PeopleService,
  AIService,
} from "@/services/domain";
import type { EntityType } from "@/lib/domain/types";

// ════════════════════════════════════════════
// VESSELS
// ════════════════════════════════════════════

export function useCreateVessel() {
  return useIntegratedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => VesselsService.create(input),
    eventType: "vessel.created",
    entityType: "vessel",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ vessel_id: out.id, name: out.name, vessel_type: out.vessel_type }),
    invalidateKeys: [["vessels"], ["fleet"]],
    successMessage: "Embarcação criada com sucesso",
    errorMessage: "Erro ao criar embarcação",
  });
}

export function useUpdateVessel() {
  return useIntegratedMutation<{ id: string; updates: Record<string, unknown> }, any>({
    mutationFn: ({ id, updates }) => VesselsService.update(id, updates),
    eventType: "vessel.updated",
    entityType: "vessel",
    getEntityId: (out) => out.id,
    buildPayload: (input, out) => ({ vessel_id: out.id, changes: input.updates }),
    invalidateKeys: [["vessels"], ["fleet"]],
    successMessage: "Embarcação atualizada",
    errorMessage: "Erro ao atualizar embarcação",
  });
}

// ════════════════════════════════════════════
// VOYAGES
// ════════════════════════════════════════════

export function useCreateVoyage() {
  return useIntegratedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => VoyagesService.create(input),
    eventType: "voyage.created",
    entityType: "voyage",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ voyage_id: out.id, vessel_id: out.vessel_id, voyage_number: out.voyage_number }),
    invalidateKeys: [["voyages"]],
    successMessage: "Viagem criada com sucesso",
    errorMessage: "Erro ao criar viagem",
  });
}

export function useCompleteVoyage() {
  return useIntegratedMutation<{ id: string; data: Record<string, unknown> }, any>({
    mutationFn: ({ id, data }) => VoyagesService.complete(id, data),
    eventType: "voyage.completed",
    entityType: "voyage",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ voyage_id: out.id, vessel_id: out.vessel_id }),
    invalidateKeys: [["voyages"], ["voyage-pnl"]],
    successMessage: "Viagem concluída — P&L calculado",
    errorMessage: "Erro ao concluir viagem",
  });
}

// ════════════════════════════════════════════
// MAINTENANCE
// ════════════════════════════════════════════

export function useCreateWorkOrder() {
  return useIntegratedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => MaintenanceService.createWorkOrder(input),
    eventType: "maintenance.work_order.created",
    entityType: "work_order",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ work_order_id: out.id, vessel_id: out.vessel_id, priority: out.priority }),
    invalidateKeys: [["maintenance"], ["work-orders"]],
    successMessage: "Ordem de serviço criada",
    errorMessage: "Erro ao criar OS",
  });
}

export function useCompleteWorkOrder() {
  return useIntegratedMutation<{ id: string; data: Record<string, unknown> }, any>({
    mutationFn: ({ id, data }) => MaintenanceService.completeWorkOrder(id, data),
    eventType: "maintenance.work_order.completed",
    entityType: "work_order",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ work_order_id: out.id, vessel_id: out.vessel_id, actual_cost: out.actual_cost }),
    invalidateKeys: [["maintenance"], ["work-orders"], ["compliance"]],
    successMessage: "OS concluída — Compliance notificado",
    errorMessage: "Erro ao concluir OS",
  });
}

// ════════════════════════════════════════════
// COMPLIANCE
// ════════════════════════════════════════════

export function useCreateFinding() {
  return useIntegratedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => ComplianceService.createFinding(input),
    eventType: "compliance.finding.created",
    entityType: "finding",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ finding_id: out.id, severity: out.severity, category: out.category }),
    invalidateKeys: [["findings"], ["compliance"], ["risk"]],
    successMessage: "Não-conformidade registrada → Risk Matrix atualizada",
    errorMessage: "Erro ao registrar finding",
  });
}

export function useCloseFinding() {
  return useIntegratedMutation<{ id: string; resolution: Record<string, unknown> }, any>({
    mutationFn: ({ id, resolution }) => ComplianceService.closeFinding(id, resolution),
    eventType: "compliance.finding.closed",
    entityType: "finding",
    getEntityId: (out) => out.id,
    buildPayload: (input) => ({ finding_id: input.id }),
    invalidateKeys: [["findings"], ["compliance"], ["risk"]],
    successMessage: "Finding encerrado",
    errorMessage: "Erro ao encerrar finding",
  });
}

// ════════════════════════════════════════════
// FINANCE
// ════════════════════════════════════════════

export function useApproveInvoice() {
  return useIntegratedMutation<string, any>({
    mutationFn: (invoiceId) => FinanceService.approveInvoice(invoiceId),
    eventType: "finance.invoice.approved",
    entityType: "invoice",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ invoice_id: out.id, amount: out.amount, currency: out.currency }),
    invalidateKeys: [["invoices"], ["finance"], ["voyage-pnl"]],
    successMessage: "Fatura aprovada → Financeiro atualizado",
    errorMessage: "Erro ao aprovar fatura",
  });
}

export function useApprovePO() {
  return useIntegratedMutation<string, any>({
    mutationFn: (poId) => FinanceService.approvePO(poId),
    eventType: "finance.po.approved",
    entityType: "purchase_order",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ po_id: out.id, total_amount: out.estimated_total }),
    invalidateKeys: [["procurement"], ["finance"], ["expenses"]],
    successMessage: "PO aprovada → Lançamento financeiro criado",
    errorMessage: "Erro ao aprovar PO",
  });
}

// ════════════════════════════════════════════
// DOCUMENTS
// ════════════════════════════════════════════

export function useLinkDocument() {
  return useIntegratedMutation<
    { documentId: string; entityType: EntityType; entityId: string; purpose?: string; organizationId?: string },
    any
  >({
    mutationFn: (input) => DocumentsService.linkDocument(input),
    eventType: "document.linked",
    entityType: "document",
    getEntityId: (out) => out.id,
    buildPayload: (input) => ({ document_id: input.documentId, entity_type: input.entityType, entity_id: input.entityId }),
    invalidateKeys: [["documents"], ["entity-documents"], ["related-records"]],
    successMessage: "Documento vinculado",
    errorMessage: "Erro ao vincular documento",
  });
}

// ════════════════════════════════════════════
// TRACKING
// ════════════════════════════════════════════

export function useCreateTrackingAlert() {
  return useIntegratedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => TrackingService.createAlert(input),
    eventType: "tracking.alert.created",
    entityType: "alert",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ alert_id: out.id, vessel_id: out.vessel_id, alert_type: out.alert_type, severity: out.severity }),
    invalidateKeys: [["alerts"], ["tracking"]],
    successMessage: "Alerta de rastreamento criado",
    errorMessage: "Erro ao criar alerta",
  });
}

// ════════════════════════════════════════════
// PEOPLE / CREW
// ════════════════════════════════════════════

export function usePublishRotation() {
  return useIntegratedMutation<string, any>({
    mutationFn: (rotationId) => PeopleService.publishRotation(rotationId),
    eventType: "people.rotation.published",
    entityType: "rotation",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ rotation_id: out.id, vessel_id: out.vessel_id }),
    invalidateKeys: [["rotations"], ["crew"]],
    successMessage: "Escala publicada → MLC/STCW validação em andamento",
    errorMessage: "Erro ao publicar escala",
  });
}

// ════════════════════════════════════════════
// AI
// ════════════════════════════════════════════

export function useAcceptAISuggestion() {
  return useIntegratedMutation<string, any>({
    mutationFn: (decisionId) => AIService.acceptSuggestion(decisionId),
    eventType: "ai.suggestion.accepted",
    entityType: "ai_decision",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ suggestion_id: out.id, action_type: out.type }),
    invalidateKeys: [["ai-suggestions"], ["ai-decisions"]],
    successMessage: "Sugestão IA aceita — ação executada",
    errorMessage: "Erro ao aceitar sugestão",
  });
}

export function useRejectAISuggestion() {
  return useIntegratedMutation<{ id: string; reason: string }, any>({
    mutationFn: ({ id, reason }) => AIService.rejectSuggestion(id, reason),
    eventType: "ai.suggestion.rejected",
    entityType: "ai_decision",
    getEntityId: (out) => out.id,
    buildPayload: (input) => ({ suggestion_id: input.id, reason: input.reason }),
    invalidateKeys: [["ai-suggestions"], ["ai-decisions"]],
    successMessage: "Sugestão IA rejeitada",
    errorMessage: "Erro ao rejeitar sugestão",
  });
}
