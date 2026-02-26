/**
 * NAUTI ONE — Pre-built Module Hooks
 * Each hook wraps a domain service operation with useIntegratedMutation,
 * ensuring EVERY mutation flows through: DB → Event Outbox → Audit → Cache Invalidation.
 *
 * Usage in any page: const { mutate } = useCreateVessel();
 */

import { useIntegratedMutation } from "./useIntegratedMutation";
import type { Database } from "@/integrations/supabase/types";
import { useAuditedMutation } from "./useAuditedMutation";
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
  PMSService,
  CharteringService,
  ISMService,
  CrewService,
  ETSService,
} from "@/services/domain";
import type { EntityType } from "@/lib/domain/types";

// ════════════════════════════════════════════
// VESSELS
// ════════════════════════════════════════════

export function useCreateVessel() {
  return useAuditedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => VesselsService.create(input),
    eventType: "vessel.created",
    entityType: "vessel",
    module: "fleet",
    actionType: "create",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ vessel_id: out.id, name: out.name, vessel_type: out.vessel_type }),
    invalidateKeys: [["vessels"], ["fleet"], ["dashboard-kpis"]],
    successMessage: "Embarcação criada com sucesso",
    errorMessage: "Erro ao criar embarcação",
  });
}

export function useUpdateVessel() {
  return useAuditedMutation<{ id: string; updates: Record<string, unknown> }, any>({
    mutationFn: ({ id, updates }) => VesselsService.update(id, updates),
    eventType: "vessel.updated",
    entityType: "vessel",
    module: "fleet",
    actionType: "update",
    getEntityId: (out) => out.id,
    getChanges: (input) => Object.fromEntries(Object.entries(input.updates).map(([k, v]) => [k, { old: undefined, new: v }])),
    buildPayload: (input, out) => ({ vessel_id: out.id, changes: input.updates }),
    invalidateKeys: [["vessels"], ["fleet"], ["dashboard-kpis"]],
    successMessage: "Embarcação atualizada",
    errorMessage: "Erro ao atualizar embarcação",
  });
}

// ════════════════════════════════════════════
// VOYAGES
// ════════════════════════════════════════════

export function useCreateVoyage() {
  return useAuditedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => VoyagesService.create(input),
    eventType: "voyage.created",
    entityType: "voyage",
    module: "operations",
    actionType: "create",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ voyage_id: out.id, vessel_id: out.vessel_id, voyage_number: out.voyage_number }),
    invalidateKeys: [["voyages"], ["dashboard-kpis"]],
    successMessage: "Viagem criada com sucesso",
    errorMessage: "Erro ao criar viagem",
  });
}

export function useCompleteVoyage() {
  return useAuditedMutation<{ id: string; data: Record<string, unknown> }, any>({
    mutationFn: ({ id, data }) => VoyagesService.complete(id, data),
    eventType: "voyage.completed",
    entityType: "voyage",
    module: "operations",
    actionType: "update",
    getEntityId: (out) => out.id,
    getDescription: (_in, out) => `Viagem ${out.voyage_number || out.id} concluída`,
    buildPayload: (_in, out) => ({ voyage_id: out.id, vessel_id: out.vessel_id }),
    invalidateKeys: [["voyages"], ["voyage-pnl"], ["dashboard-kpis"]],
    successMessage: "Viagem concluída — P&L calculado",
    errorMessage: "Erro ao concluir viagem",
  });
}

// ════════════════════════════════════════════
// MAINTENANCE
// ════════════════════════════════════════════

export function useCreateWorkOrder() {
  return useAuditedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => MaintenanceService.createWorkOrder(input),
    eventType: "maintenance.work_order.created",
    entityType: "work_order",
    module: "maintenance",
    actionType: "create",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ work_order_id: out.id, vessel_id: out.vessel_id, priority: out.priority }),
    invalidateKeys: [["maintenance"], ["work-orders"], ["dashboard-kpis"]],
    successMessage: "Ordem de serviço criada",
    errorMessage: "Erro ao criar OS",
  });
}

export function useCompleteWorkOrder() {
  return useAuditedMutation<{ id: string; data: Record<string, unknown> }, any>({
    mutationFn: ({ id, data }) => MaintenanceService.completeWorkOrder(id, data),
    eventType: "maintenance.work_order.completed",
    entityType: "work_order",
    module: "maintenance",
    actionType: "update",
    getEntityId: (out) => out.id,
    getDescription: (_in, out) => `Work Order ${out.work_order_number || out.id} concluída`,
    buildPayload: (_in, out) => ({ work_order_id: out.id, vessel_id: out.vessel_id, actual_cost: out.actual_cost }),
    invalidateKeys: [["maintenance"], ["work-orders"], ["compliance"], ["dashboard-kpis"]],
    successMessage: "OS concluída — Compliance notificado",
    errorMessage: "Erro ao concluir OS",
  });
}

// ════════════════════════════════════════════
// COMPLIANCE
// ════════════════════════════════════════════

export function useCreateFinding() {
  return useAuditedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => ComplianceService.createFinding(input),
    eventType: "compliance.finding.created",
    entityType: "finding",
    module: "compliance",
    actionType: "create",
    getEntityId: (out) => out.id,
    getDescription: (_in, out) => `Finding ${out.severity || ''}: ${out.category || 'N/A'}`,
    buildPayload: (_in, out) => ({ finding_id: out.id, severity: out.severity, category: out.category }),
    invalidateKeys: [["findings"], ["compliance"], ["risk"], ["dashboard-kpis"]],
    successMessage: "Não-conformidade registrada → Risk Matrix atualizada",
    errorMessage: "Erro ao registrar finding",
  });
}

export function useCloseFinding() {
  return useAuditedMutation<{ id: string; resolution: Record<string, unknown> }, any>({
    mutationFn: ({ id, resolution }) => ComplianceService.closeFinding(id, resolution),
    eventType: "compliance.finding.closed",
    entityType: "finding",
    module: "compliance",
    actionType: "update",
    getEntityId: (out) => out.id,
    getDescription: (input) => `Finding ${input.id} encerrado`,
    buildPayload: (input) => ({ finding_id: input.id }),
    invalidateKeys: [["findings"], ["compliance"], ["risk"], ["dashboard-kpis"]],
    successMessage: "Finding encerrado",
    errorMessage: "Erro ao encerrar finding",
  });
}

// ════════════════════════════════════════════
// FINANCE
// ════════════════════════════════════════════

export function useApproveInvoice() {
  return useAuditedMutation<string, any>({
    mutationFn: (invoiceId) => FinanceService.approveInvoice(invoiceId),
    eventType: "finance.invoice.approved",
    entityType: "invoice",
    module: "finance",
    actionType: "approve",
    getEntityId: (out) => out.id,
    getDescription: (_in, out) => `Fatura ${out.invoice_number || out.id} aprovada — ${out.currency || 'USD'} ${out.amount || 0}`,
    buildPayload: (_in, out) => ({ invoice_id: out.id, amount: out.amount, currency: out.currency }),
    invalidateKeys: [["invoices"], ["finance"], ["voyage-pnl"], ["dashboard-kpis"]],
    successMessage: "Fatura aprovada → Financeiro atualizado",
    errorMessage: "Erro ao aprovar fatura",
  });
}

export function useApprovePO() {
  return useAuditedMutation<string, any>({
    mutationFn: (poId) => FinanceService.approvePO(poId),
    eventType: "finance.po.approved",
    entityType: "purchase_order",
    module: "finance",
    actionType: "approve",
    getEntityId: (out) => out.id,
    getDescription: (_in, out) => `PO ${out.po_number || out.id} aprovada — total ${out.estimated_total || 0}`,
    buildPayload: (_in, out) => ({ po_id: out.id, total_amount: out.estimated_total }),
    invalidateKeys: [["procurement"], ["finance"], ["expenses"], ["dashboard-kpis"]],
    successMessage: "PO aprovada → Lançamento financeiro criado",
    errorMessage: "Erro ao aprovar PO",
  });
}

// ════════════════════════════════════════════
// DOCUMENTS
// ════════════════════════════════════════════

export function useLinkDocument() {
  return useAuditedMutation<
    { documentId: string; entityType: EntityType; entityId: string; purpose?: string; organizationId?: string },
    any
  >({
    mutationFn: (input) => DocumentsService.linkDocument(input),
    eventType: "document.linked",
    entityType: "document",
    module: "documents",
    actionType: "update",
    getEntityId: (out) => out.id,
    getDescription: (input) => `Documento ${input.documentId} vinculado a ${input.entityType}:${input.entityId}`,
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

// ════════════════════════════════════════════
// PMS (Planned Maintenance System)
// ════════════════════════════════════════════

export function useCreatePMSSystem() {
  return useAuditedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => PMSService.createSystem(input),
    eventType: "maintenance.system.created",
    entityType: "work_order",
    module: "maintenance",
    actionType: "create",
    getEntityId: (out) => out.id,
    getDescription: (_in, out) => `Sistema PMS "${out.name || ''}" (${out.code || ''}) adicionado`,
    buildPayload: (_in, out) => ({ system_id: out.id, name: out.name, code: out.code }),
    invalidateKeys: [["pms_systems"], ["maintenance"], ["dashboard-kpis"]],
    successMessage: "Sistema PMS adicionado",
    errorMessage: "Erro ao adicionar sistema",
  });
}

export function useCreatePMSWorkOrder() {
  return useAuditedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => PMSService.createWorkOrder(input),
    eventType: "maintenance.work_order.created",
    entityType: "work_order",
    module: "maintenance",
    actionType: "create",
    getEntityId: (out) => out.id,
    getDescription: (_in, out) => `WO ${out.work_order_number || out.id} criada — prioridade ${out.priority || 'normal'}`,
    buildPayload: (_in, out) => ({ work_order_id: out.id, wo_number: out.work_order_number, priority: out.priority }),
    invalidateKeys: [["pms_work_orders"], ["maintenance"], ["work-orders"], ["dashboard-kpis"]],
    successMessage: "Work Order criada",
    errorMessage: "Erro ao criar Work Order",
  });
}

export function useUpdatePMSWorkOrderStatus() {
  return useAuditedMutation<{ id: string; status: string }, any>({
    mutationFn: ({ id, status }) => PMSService.updateWorkOrderStatus(id, status),
    eventType: "maintenance.work_order.status_changed",
    entityType: "work_order",
    module: "maintenance",
    actionType: "update",
    getEntityId: (out) => out.id,
    getDescription: (input) => `WO ${input.id} → status: ${input.status}`,
    buildPayload: (input) => ({ work_order_id: input.id, status: input.status }),
    invalidateKeys: [["pms_work_orders"], ["maintenance"], ["work-orders"], ["compliance"], ["dashboard-kpis"]],
    successMessage: "Status atualizado",
    errorMessage: "Erro ao atualizar status",
  });
}

// ════════════════════════════════════════════
// CHARTERING
// ════════════════════════════════════════════

export function useCreateCharterParty() {
  return useAuditedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => CharteringService.createCharterParty(input),
    eventType: "finance.charter.created",
    entityType: "charter_party",
    module: "chartering",
    actionType: "create",
    getEntityId: (out) => out.id,
    getDescription: (_in, out) => `Charter Party ${out.charter_type || ''} — ${out.charterer_name || 'N/A'}`,
    buildPayload: (_in, out) => ({ charter_id: out.id, charter_type: out.charter_type, charterer: out.charterer_name }),
    invalidateKeys: [["charter_parties"], ["finance"], ["voyages"], ["dashboard-kpis"]],
    successMessage: "Charter Party criada",
    errorMessage: "Erro ao criar Charter Party",
  });
}

export function useUpdateCharterStatus() {
  return useAuditedMutation<{ id: string; status: string }, any>({
    mutationFn: ({ id, status }) => CharteringService.updateStatus(id, status),
    eventType: "finance.charter.status_changed",
    entityType: "charter_party",
    module: "chartering",
    actionType: "update",
    getEntityId: (out) => out.id,
    getDescription: (input) => `Charter ${input.id} → ${input.status}`,
    buildPayload: (input) => ({ charter_id: input.id, status: input.status }),
    invalidateKeys: [["charter_parties"], ["finance"], ["dashboard-kpis"]],
    successMessage: "Status do charter atualizado",
    errorMessage: "Erro ao atualizar status",
  });
}

// ════════════════════════════════════════════
// ISM COMPLIANCE
// ════════════════════════════════════════════

export function useRunISMGapAnalysis() {
  return useAuditedMutation<{ elementId: string; data: Record<string, unknown> }, any>({
    mutationFn: ({ elementId, data }) => ISMService.runGapAnalysis(elementId, data),
    eventType: "compliance.gap_analysis.completed",
    entityType: "audit",
    module: "compliance",
    actionType: "create",
    getEntityId: (out) => out.id,
    getDescription: (_in, out) => `Gap Analysis ISM — Score: ${out.compliance_score || 'N/A'}%`,
    buildPayload: (_in, out) => ({ gap_id: out.id, score: out.compliance_score, status: out.status }),
    invalidateKeys: [["ism_gap_analysis"], ["compliance"], ["dashboard-kpis"]],
    successMessage: "Avaliação ISM concluída",
    errorMessage: "Erro na avaliação",
  });
}

export function useCreateISMCAPA() {
  return useAuditedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => ISMService.createCAPA(input),
    eventType: "compliance.capa.created",
    entityType: "capa",
    module: "compliance",
    actionType: "create",
    getEntityId: (out) => out.id,
    getDescription: (_in, out) => `CAPA ${out.id} criada para finding de compliance`,
    buildPayload: (_in, out) => ({ capa_id: out.id }),
    invalidateKeys: [["ism_capa"], ["compliance"], ["findings"], ["dashboard-kpis"]],
    successMessage: "CAPA criada",
    errorMessage: "Erro ao criar CAPA",
  });
}

export function useUpdateISMCAPAStatus() {
  return useAuditedMutation<{ id: string; status: string }, any>({
    mutationFn: ({ id, status }) => ISMService.updateCAPAStatus(id, status),
    eventType: "compliance.capa.closed",
    entityType: "capa",
    module: "compliance",
    actionType: "update",
    getEntityId: (out) => out.id,
    getDescription: (input) => `CAPA ${input.id} → ${input.status}`,
    buildPayload: (input) => ({ capa_id: input.id, status: input.status }),
    invalidateKeys: [["ism_capa"], ["compliance"], ["dashboard-kpis"]],
    successMessage: "Status CAPA atualizado",
    errorMessage: "Erro ao atualizar CAPA",
  });
}

// ════════════════════════════════════════════
// CREW
// ════════════════════════════════════════════

export function useCreateCrewMember() {
  return useAuditedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => CrewService.createCrewMember(input),
    eventType: "people.crew.created",
    entityType: "crew_member",
    module: "crew",
    actionType: "create",
    getEntityId: (out) => out.id,
    getDescription: (_in, out) => `Tripulante ${out.full_name || 'N/A'} (${out.rank || ''}) adicionado`,
    buildPayload: (_in, out) => ({ crew_id: out.id, name: out.full_name, rank: out.rank }),
    invalidateKeys: [["crew"], ["crew-scheduler"], ["rotations"], ["dashboard-kpis"]],
    successMessage: "Tripulante adicionado com sucesso",
    errorMessage: "Erro ao adicionar tripulante",
  });
}

// ════════════════════════════════════════════
// EU ETS / EMISSIONS
// ════════════════════════════════════════════

export function useCreateETSRecord() {
  return useAuditedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => ETSService.createRecord(input),
    eventType: "finance.ets.record_created",
    entityType: "expense",
    module: "emissions",
    actionType: "create",
    getEntityId: (out) => out.id,
    getDescription: (_in, out) => `ETS Record — CO₂: ${out.total_co2_mt || 0}mt, Custo: €${out.total_cost_eur || 0}`,
    buildPayload: (_in, out) => ({ record_id: out.id, co2: out.total_co2_mt, cost: out.total_cost_eur }),
    invalidateKeys: [["eu_ets_tracking"], ["finance"], ["compliance"], ["dashboard-kpis"]],
    successMessage: "Registro ETS criado",
    errorMessage: "Erro ao criar registro ETS",
  });
}

// ════════════════════════════════════════════
// FEEDBACK
// ════════════════════════════════════════════

export function useSubmitFeedback() {
  return useIntegratedMutation<{ type: string; comment: string; score: number }, any>({
    mutationFn: async (input) => {
      const userId = (await (await import("@/integrations/supabase/client")).supabase.auth.getUser()).data.user?.id;
      const { data, error } = await (await import("@/integrations/supabase/client")).supabase
        .from('ai_feedback_scores')
        .insert({
          command_type: input.type,
          command_data: { content: input.comment },
          self_score: input.score,
          feedback_data: { type: input.type, comment: input.comment },
          user_id: userId,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    eventType: "feedback.submitted",
    entityType: "feedback",
    getEntityId: (out) => out.id,
    buildPayload: (input) => ({ type: input.type, score: input.score }),
    invalidateKeys: [["app-metrics"]],
    successMessage: "Feedback enviado!",
    errorMessage: "Erro ao enviar feedback",
  });
}

// ════════════════════════════════════════════
// AI TRAINING
// ════════════════════════════════════════════

export function useCreateTrainingSession() {
  return useIntegratedMutation<Record<string, unknown>, any>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { fromUntyped } = await import("@/integrations/supabase/untyped-client");
      const { data, error } = await fromUntyped('ai_training_sessions')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    eventType: "training.session.created",
    entityType: "training",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ session_id: out.id, topic: out.topic, module: out.session_type }),
    invalidateKeys: [["ai-training-sessions"], ["training"]],
    successMessage: "Sessão de treinamento criada",
    errorMessage: "Erro ao criar sessão",
  });
}

export function useCompleteTrainingSession() {
  return useIntegratedMutation<{ id: string; score: number }, any>({
    mutationFn: async ({ id, score }) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase
        .from('ai_training_sessions')
        .update({
          status: score >= 70 ? 'completed' : 'failed',
          final_score: score,
          completed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    eventType: "training.session.completed",
    entityType: "training",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ session_id: out.id, score: out.final_score, status: out.status }),
    invalidateKeys: [["ai-training-sessions"], ["training"], ["compliance"]],
    successMessage: "Sessão atualizada",
    errorMessage: "Erro ao atualizar sessão",
  });
}

// ════════════════════════════════════════════
// WHATSAPP / COMMUNICATIONS
// ════════════════════════════════════════════

export function useSendWhatsApp() {
  return useIntegratedMutation<{ to: string; message: string }, any>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke("twilio-send-whatsapp", { body: input });
      if (error) throw error;
      return data;
    },
    eventType: "comms.whatsapp.sent",
    entityType: "communication",
    buildPayload: (input) => ({ recipient: input.to }),
    invalidateKeys: [["whatsapp-logs"]],
    successMessage: "Mensagem WhatsApp enviada!",
    errorMessage: "Erro ao enviar WhatsApp",
  });
}

export function useSendWhatsAppBatch() {
  return useIntegratedMutation<{ recipients: string[]; message: string }, any>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const results = await Promise.allSettled(
        input.recipients.map(to => supabase.functions.invoke("twilio-send-whatsapp", { body: { to, message: input.message } }))
      );
      const failed = results.filter(r => r.status === "rejected").length;
      if (failed > 0) throw new Error(`${failed} mensagens falharam`);
      return { sent: input.recipients.length - failed, failed };
    },
    eventType: "comms.whatsapp.batch_sent",
    entityType: "communication",
    buildPayload: (input) => ({ count: input.recipients.length }),
    invalidateKeys: [["whatsapp-logs"]],
    successMessage: "Mensagens enviadas!",
    errorMessage: "Erro no envio em lote",
  });
}

// ════════════════════════════════════════════
// TEMPLATES
// ════════════════════════════════════════════

export function useCreateTemplate() {
  return useIntegratedMutation<{ title: string; content: string; type: string; tags: string[] }, any>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from("ai_document_templates")
        .insert({ title: input.title, content: input.content, template_type: input.type, tags: input.tags })
        .select().single();
      if (error) throw error;
      return data;
    },
    eventType: "document.template.created",
    entityType: "document",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ template_id: out.id, title: out.title }),
    invalidateKeys: [["document-templates"]],
    successMessage: "Template criado com sucesso",
    errorMessage: "Erro ao criar template",
  });
}

export function useUpdateTemplate() {
  return useIntegratedMutation<{ id: string; title: string; content: string; type: string; tags: string[] }, any>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from("ai_document_templates")
        .update({ title: input.title, content: input.content, template_type: input.type, tags: input.tags })
        .eq("id", input.id).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "document.template.updated",
    entityType: "document",
    getEntityId: (out) => out.id,
    buildPayload: (input) => ({ template_id: input.id }),
    invalidateKeys: [["document-templates"]],
    successMessage: "Template atualizado",
    errorMessage: "Erro ao atualizar template",
  });
}

export function useDeleteTemplate() {
  return useIntegratedMutation<string, any>({
    mutationFn: async (id) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from("ai_document_templates").delete().eq("id", id);
      if (error) throw error;
      return { id };
    },
    eventType: "document.template.deleted",
    entityType: "document",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ template_id: out.id }),
    invalidateKeys: [["document-templates"]],
    successMessage: "Template removido",
    errorMessage: "Erro ao remover template",
  });
}

// ════════════════════════════════════════════
// ROLE MANAGEMENT
// ════════════════════════════════════════════

export function useUpdateUserRole() {
  return useIntegratedMutation<{ userId: string; newRole: string }, any>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase
        .from("user_roles")
        .update({ role: input.newRole } as Record<string, unknown>)
        .eq("user_id", input.userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    eventType: "access.role.changed",
    entityType: "user",
    getEntityId: (out) => out.user_id,
    buildPayload: (input) => ({ user_id: input.userId, new_role: input.newRole }),
    invalidateKeys: [["admin-user-roles"]],
    successMessage: "Role atualizado com sucesso",
    errorMessage: "Erro ao atualizar role",
  });
}

// ════════════════════════════════════════════
// TRACKING (Resolve / Delete)
// ════════════════════════════════════════════

export function useResolveTrackingAlert() {
  return useIntegratedMutation<string, any>({
    mutationFn: async (id) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from("tracking_alerts")
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "tracking.alert.resolved",
    entityType: "alert",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ alert_id: out.id }),
    invalidateKeys: [["tracking-alerts"], ["alerts"], ["tracking"]],
    successMessage: "Alerta resolvido",
    errorMessage: "Erro ao resolver alerta",
  });
}

export function useDeleteTrackingAlert() {
  return useIntegratedMutation<string, any>({
    mutationFn: async (id) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from("tracking_alerts").delete().eq("id", id);
      if (error) throw error;
      return { id };
    },
    eventType: "tracking.alert.deleted",
    entityType: "alert",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ alert_id: out.id }),
    invalidateKeys: [["tracking-alerts"], ["alerts"], ["tracking"]],
    successMessage: "Alerta removido",
    errorMessage: "Erro ao remover alerta",
  });
}

// ════════════════════════════════════════════
// PEO-DP LOGBOOK
// ════════════════════════════════════════════

export function useCreateLogbookEntry() {
  return useIntegratedMutation<Record<string, unknown>, any>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { fromUntyped } = await import("@/integrations/supabase/untyped-client");
      const { data, error } = await fromUntyped('peodp_logbook_entries')
        .insert(input).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "peodp.logbook.entry_created",
    entityType: "logbook_entry",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ entry_id: out.id, event_type: out.event_type, severity: out.severity }),
    invalidateKeys: [["peodp-logbook"]],
    successMessage: "Entrada registrada no logbook",
    errorMessage: "Erro ao salvar entrada",
  });
}

export function useDeleteLogbookEntry() {
  return useIntegratedMutation<string, any>({
    mutationFn: async (id) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from('peodp_logbook_entries').delete().eq('id', id);
      if (error) throw error;
      return { id };
    },
    eventType: "peodp.logbook.entry_deleted",
    entityType: "logbook_entry",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ entry_id: out.id }),
    invalidateKeys: [["peodp-logbook"]],
    successMessage: "Entrada removida",
    errorMessage: "Erro ao remover entrada",
  });
}

// ════════════════════════════════════════════
// PEO-DP FMEA
// ════════════════════════════════════════════

export function useCreateFMEAItem() {
  return useIntegratedMutation<Record<string, unknown>, any>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { fromUntyped } = await import("@/integrations/supabase/untyped-client");
      const { data, error } = await fromUntyped('peodp_fmea_items')
        .insert(input).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "peodp.fmea.item_created",
    entityType: "fmea_item",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ item_id: out.id, component: out.component_name, rpn: out.rpn }),
    invalidateKeys: [["peodp-fmea"]],
    successMessage: "Item FMEA adicionado",
    errorMessage: "Erro ao adicionar item FMEA",
  });
}

export function useUpdateFMEAItem() {
  return useIntegratedMutation<{ id: string; updates: Record<string, unknown> }, any>({
    mutationFn: async ({ id, updates }) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { fromUntyped } = await import("@/integrations/supabase/untyped-client");
      const { data, error } = await fromUntyped('peodp_fmea_items')
        .update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "peodp.fmea.item_updated",
    entityType: "fmea_item",
    getEntityId: (out) => out.id,
    buildPayload: (input) => ({ item_id: input.id }),
    invalidateKeys: [["peodp-fmea"]],
    successMessage: "Item FMEA atualizado",
    errorMessage: "Erro ao atualizar item FMEA",
  });
}

export function useDeleteFMEAItem() {
  return useIntegratedMutation<string, any>({
    mutationFn: async (id) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from('peodp_fmea_items').delete().eq('id', id);
      if (error) throw error;
      return { id };
    },
    eventType: "peodp.fmea.item_deleted",
    entityType: "fmea_item",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ item_id: out.id }),
    invalidateKeys: [["peodp-fmea"]],
    successMessage: "Item FMEA removido",
    errorMessage: "Erro ao remover item FMEA",
  });
}

// ════════════════════════════════════════════
// FLEET — VESSEL HISTORY
// ════════════════════════════════════════════

export function useCreateVesselHistoryEvent() {
  return useIntegratedMutation<Record<string, unknown>, any>({
    mutationFn: async (input) => {
      const { fromUntyped } = await import("@/integrations/supabase/untyped-client");
      const { data, error } = await fromUntyped('navigation_history')
        .insert(input).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "fleet.history.event_created",
    entityType: "vessel",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ event_id: out.id, vessel_id: out.vessel_id, event_type: out.event_type }),
    invalidateKeys: [["vessel-history"]],
    successMessage: "Evento registrado no histórico",
    errorMessage: "Erro ao registrar evento",
  });
}

export function useDeleteVesselHistoryEvent() {
  return useIntegratedMutation<string, any>({
    mutationFn: async (id) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from('navigation_history').delete().eq('id', id);
      if (error) throw error;
      return { id };
    },
    eventType: "fleet.history.event_deleted",
    entityType: "vessel",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ event_id: out.id }),
    invalidateKeys: [["vessel-history"]],
    successMessage: "Evento removido",
    errorMessage: "Erro ao remover evento",
  });
}

// ════════════════════════════════════════════
// MAINTENANCE — SPARE PARTS
// ════════════════════════════════════════════

export function useAddSparePart() {
  return useIntegratedMutation<Record<string, unknown>, Record<string, unknown>>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from('inventory_items')
        .insert(input as Database['public']['Tables']['inventory_items']['Insert']).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "maintenance.spare_part.added",
    entityType: "inventory_item",
    getEntityId: (out) => out.id as string,
    buildPayload: (_in, out) => ({ item_id: out.id, name: out.name, quantity: out.quantity }),
    invalidateKeys: [["inventory"], ["spare-parts"]],
    successMessage: "Peça adicionada ao inventário",
    errorMessage: "Erro ao adicionar peça",
  });
}

// ════════════════════════════════════════════
// MAINTENANCE — RUNNING HOURS
// ════════════════════════════════════════════

export function useUpdateRunningHours() {
  return useIntegratedMutation<{ equipmentId: string; hours: number; vesselId?: string }, Record<string, unknown>>({
    mutationFn: async (input) => {
      const { fromUntyped } = await import("@/integrations/supabase/untyped-client");
      const { data, error } = await fromUntyped('pms_running_hours_triggers')
        .insert({
          equipment_id: input.equipmentId,
          current_hours: input.hours,
          vessel_id: input.vesselId,
          recorded_at: new Date().toISOString(),
        }).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "maintenance.running_hours.updated",
    entityType: "equipment",
    getEntityId: (out) => out.id as string,
    buildPayload: (input) => ({ equipment_id: input.equipmentId, hours: input.hours }),
    invalidateKeys: [["running-hours"], ["maintenance"]],
    successMessage: "Horas de funcionamento atualizadas",
    errorMessage: "Erro ao atualizar horas",
  });
}

// ════════════════════════════════════════════
// MAINTENANCE — PREDICTIVE
// ════════════════════════════════════════════

export function useCreateMaintenancePrediction() {
  return useIntegratedMutation<Record<string, unknown>, Record<string, unknown>>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from('ai_maintenance_predictions')
        .insert(input as Database['public']['Tables']['ai_maintenance_predictions']['Insert']).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "maintenance.prediction.created",
    entityType: "prediction",
    getEntityId: (out) => out.id as string,
    buildPayload: (_in, out) => ({ prediction_id: out.id, equipment: out.equipment_name, probability: out.failure_probability }),
    invalidateKeys: [["ai-predictions"], ["maintenance"]],
    successMessage: "Predição de manutenção criada",
    errorMessage: "Erro ao criar predição",
  });
}

// ════════════════════════════════════════════
// COMPLIANCE — CLASS SURVEYS
// ════════════════════════════════════════════

export function useCreateClassSurvey() {
  return useIntegratedMutation<Record<string, unknown>, Record<string, unknown>>({
    mutationFn: async (input) => {
      const { fromUntyped } = await import("@/integrations/supabase/untyped-client");
      const { data, error } = await fromUntyped('class_surveys')
        .insert(input).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "compliance.class_survey.created",
    entityType: "survey",
    getEntityId: (out) => out.id as string,
    buildPayload: (_in, out) => ({ survey_id: out.id, survey_type: out.survey_type, status: out.status }),
    invalidateKeys: [["class-surveys"], ["compliance"]],
    successMessage: "Vistoria de classe criada",
    errorMessage: "Erro ao criar vistoria",
  });
}

export function useUpdateClassSurvey() {
  return useIntegratedMutation<{ id: string; updates: Record<string, unknown> }, Record<string, unknown>>({
    mutationFn: async ({ id, updates }) => {
      const { fromUntyped } = await import("@/integrations/supabase/untyped-client");
      const { data, error } = await fromUntyped('class_surveys')
        .update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "compliance.class_survey.updated",
    entityType: "survey",
    getEntityId: (out) => out.id as string,
    buildPayload: (input) => ({ survey_id: input.id }),
    invalidateKeys: [["class-surveys"], ["compliance"]],
    successMessage: "Vistoria atualizada",
    errorMessage: "Erro ao atualizar vistoria",
  });
}

export function useDeleteClassSurvey() {
  return useIntegratedMutation<string, Record<string, unknown>>({
    mutationFn: async (id) => {
      const { fromUntyped } = await import("@/integrations/supabase/untyped-client");
      const { error } = await fromUntyped('class_surveys').delete().eq('id', id);
      if (error) throw error;
      return { id };
    },
    eventType: "compliance.class_survey.deleted",
    entityType: "survey",
    getEntityId: (out) => out.id as string,
    buildPayload: (_in, out) => ({ survey_id: out.id }),
    invalidateKeys: [["class-surveys"], ["compliance"]],
    successMessage: "Vistoria removida",
    errorMessage: "Erro ao remover vistoria",
  });
}

// ════════════════════════════════════════════
// COMPLIANCE — MARPOL
// ════════════════════════════════════════════

export function useCreateMARPOLEntry() {
  return useIntegratedMutation<Record<string, unknown>, Record<string, unknown>>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from('logs')
        .insert(input as Database['public']['Tables']['logs']['Insert']).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "compliance.marpol.entry_created",
    entityType: "marpol_entry",
    getEntityId: (out) => out.id as string,
    buildPayload: (_in, out) => ({ entry_id: out.id, module: out.module }),
    invalidateKeys: [["marpol-logs"], ["compliance"]],
    successMessage: "Registro MARPOL salvo",
    errorMessage: "Erro ao salvar registro MARPOL",
  });
}

// ════════════════════════════════════════════
// PROCUREMENT — PURCHASE REQUISITIONS
// ════════════════════════════════════════════

export function useCreatePurchaseRequisition() {
  return useIntegratedMutation<Record<string, unknown>, Record<string, unknown>>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from('purchase_requisitions')
        .insert(input as Database['public']['Tables']['purchase_requisitions']['Insert']).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "procurement.requisition.created",
    entityType: "purchase_requisition",
    getEntityId: (out) => out.id as string,
    buildPayload: (_in, out) => ({ pr_id: out.id, pr_number: out.pr_number, status: out.status }),
    invalidateKeys: [["purchase-requisitions"], ["procurement"]],
    successMessage: "Requisição de compra criada",
    errorMessage: "Erro ao criar requisição",
  });
}

// ════════════════════════════════════════════
// SAFETY — JSA TEMPLATES
// ════════════════════════════════════════════

export function useCreateJSATemplate() {
  return useIntegratedMutation<Record<string, unknown>, Record<string, unknown>>({
    mutationFn: async (input) => {
      const { fromUntyped } = await import("@/integrations/supabase/untyped-client");
      const { data, error } = await fromUntyped('jsa_templates').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "safety.jsa.template_created",
    entityType: "document",
    getEntityId: (out) => out.id as string,
    buildPayload: (_in, out) => ({ template_id: out.id, title: out.title, job_type: out.job_type, risk_level: out.risk_level }),
    invalidateKeys: [["jsa-templates"]],
    successMessage: "JSA template criado",
    errorMessage: "Erro ao criar template JSA",
  });
}

// ════════════════════════════════════════════
// SAFETY — PEOTRAM NC ACTION PLAN
// ════════════════════════════════════════════

export function useCreateNC() {
  return useIntegratedMutation<Record<string, unknown>, Record<string, unknown>>({
    mutationFn: async (input) => {
      const { fromUntyped } = await import("@/integrations/supabase/untyped-client");
      const { data, error } = await fromUntyped('peotram_nc_actions').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "safety.nc.created",
    entityType: "finding",
    getEntityId: (out) => out.id as string,
    buildPayload: (_in, out) => ({ nc_id: out.id, nc_number: out.nc_number, priority: out.priority }),
    invalidateKeys: [["peotram-nc-actions"]],
    successMessage: "NC registrada com sucesso",
    errorMessage: "Erro ao registrar NC",
  });
}

export function useUpdateNCStatus() {
  return useIntegratedMutation<{ id: string; status: string; extraUpdates?: Record<string, unknown> }, Record<string, unknown>>({
    mutationFn: async ({ id, status, extraUpdates }) => {
      const { fromUntyped } = await import("@/integrations/supabase/untyped-client");
      const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString(), ...extraUpdates };
      if (status === 'closed') { updates.closed_at = new Date().toISOString().split('T')[0]; updates.percent_complete = 100; }
      const { data, error } = await fromUntyped('peotram_nc_actions').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "safety.nc.status_changed",
    entityType: "finding",
    getEntityId: (out) => out.id as string,
    buildPayload: (input, out) => ({ nc_id: input.id, status: input.status, nc_number: out.nc_number }),
    invalidateKeys: [["peotram-nc-actions"]],
    successMessage: "Status da NC atualizado",
    errorMessage: "Erro ao atualizar NC",
  });
}

// ════════════════════════════════════════════
// HULL INTEGRITY
// ════════════════════════════════════════════

export function useCreateHullInspection() {
  return useIntegratedMutation<Record<string, unknown>, Record<string, unknown>>({
    mutationFn: async (input) => {
      const { fromUntyped } = await import("@/integrations/supabase/untyped-client");
      const { data, error } = await fromUntyped('hull_integrity_records').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "maintenance.hull.inspection_created",
    entityType: "inspection",
    getEntityId: (out) => out.id as string,
    buildPayload: (_in, out) => ({ inspection_id: out.id, zone: out.zone, type: out.inspection_type }),
    invalidateKeys: [["hull-inspections"]],
    successMessage: "Inspeção registrada!",
    errorMessage: "Erro ao registrar inspeção",
  });
}

export function useCreateHullFinding() {
  return useIntegratedMutation<Record<string, unknown>, Record<string, unknown>>({
    mutationFn: async (input) => {
      const { fromUntyped } = await import("@/integrations/supabase/untyped-client");
      const { data, error } = await fromUntyped('hull_integrity_records').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "maintenance.hull.finding_created",
    entityType: "finding",
    getEntityId: (out) => out.id as string,
    buildPayload: (_in, out) => ({ finding_id: out.id, type: out.corrosion_type, severity: out.severity }),
    invalidateKeys: [["hull-inspections"]],
    successMessage: "Achado registrado!",
    errorMessage: "Erro ao registrar achado",
  });
}

// ════════════════════════════════════════════
// CREW — POOL ASSIGNMENT
// ════════════════════════════════════════════

export function useAssignCrewToVessel() {
  return useIntegratedMutation<{ crewId: string; vesselId: string }, Record<string, unknown>>({
    mutationFn: async ({ crewId, vesselId }) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from('crew_members')
        .update({ vessel_id: vesselId, status: 'active', contract_start: new Date().toISOString() } as Database['public']['Tables']['crew_members']['Update'])
        .eq('id', crewId).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "people.crew.assigned",
    entityType: "crew_member",
    getEntityId: (out) => out.id as string,
    buildPayload: (input, out) => ({ crew_id: input.crewId, vessel_id: input.vesselId, name: out.full_name }),
    invalidateKeys: [["crew-pool-planner"], ["crew"]],
    successMessage: "Tripulante designado com sucesso",
    errorMessage: "Erro ao designar tripulante",
  });
}

// ════════════════════════════════════════════
// CREW — CERTIFICATIONS
// ════════════════════════════════════════════

export function useCreateCrewCertification() {
  return useIntegratedMutation<Record<string, unknown>, Record<string, unknown>>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from('maritime_certificates')
        .insert(input as Database['public']['Tables']['maritime_certificates']['Insert']).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "people.certification.created",
    entityType: "certification",
    getEntityId: (out) => out.id as string,
    buildPayload: (_in, out) => ({ cert_id: out.id, type: out.certificate_type, crew_id: out.crew_member_id }),
    invalidateKeys: [["crew-certifications-panel"]],
    successMessage: "Certificação adicionada",
    errorMessage: "Erro ao salvar certificação",
  });
}

export function useDeleteCrewCertification() {
  return useIntegratedMutation<string, Record<string, unknown>>({
    mutationFn: async (id) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from('maritime_certificates').delete().eq('id', id);
      if (error) throw error;
      return { id };
    },
    eventType: "people.certification.deleted",
    entityType: "certification",
    getEntityId: (out) => out.id as string,
    buildPayload: (_in, out) => ({ cert_id: out.id }),
    invalidateKeys: [["crew-certifications-panel"]],
    successMessage: "Certificação removida",
    errorMessage: "Erro ao remover certificação",
  });
}

// ════════════════════════════════════════════
// PMS — MAINTENANCE TASKS (Job Cards)
// ════════════════════════════════════════════

export function useCreateMaintenanceTask() {
  return useAuditedMutation<Record<string, unknown>, Record<string, unknown>>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from('maintenance_tasks')
        .insert(input as Database['public']['Tables']['maintenance_tasks']['Insert']).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "maintenance.task.created",
    entityType: "work_order",
    module: "maintenance",
    actionType: "create",
    getEntityId: (out) => out.id as string,
    getDescription: (_in, out) => `OS criada: ${out.title || out.id}`,
    buildPayload: (_in, out) => ({ task_id: out.id, title: out.title, priority: out.priority }),
    invalidateKeys: [["pms-job-cards"], ["maintenance"], ["dashboard-kpis"]],
    successMessage: "Ordem de serviço criada",
    errorMessage: "Erro ao criar OS",
  });
}

export function useUpdateMaintenanceTaskStatus() {
  return useAuditedMutation<{ id: string; status: string }, Record<string, unknown>>({
    mutationFn: async ({ id, status }) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const updates: Record<string, unknown> = { status };
      if (status === 'completed') updates.completed_date = new Date().toISOString();
      const { data, error } = await supabase.from('maintenance_tasks')
        .update(updates as Database['public']['Tables']['maintenance_tasks']['Update']).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "maintenance.task.status_changed",
    entityType: "work_order",
    module: "maintenance",
    actionType: "update",
    getEntityId: (out) => out.id as string,
    getDescription: (input) => `Status OS alterado para: ${input.status}`,
    getChanges: (input) => ({ status: { old: undefined, new: input.status } }),
    buildPayload: (input) => ({ task_id: input.id, status: input.status }),
    invalidateKeys: [["pms-job-cards"], ["maintenance"], ["dashboard-kpis"]],
    successMessage: "Status atualizado",
    errorMessage: "Erro ao atualizar status",
  });
}

// ════════════════════════════════════════════
// AI — INSIGHTS
// ════════════════════════════════════════════

export function useMarkInsightRead() {
  return useIntegratedMutation<string, Record<string, unknown>>({
    mutationFn: async (id) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from('ai_insights')
        .update({ status: 'read' }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "ai.insight.read",
    entityType: "ai_decision",
    getEntityId: (out) => out.id as string,
    buildPayload: (_in, out) => ({ insight_id: out.id, title: out.title }),
    invalidateKeys: [["advanced-ai-insights"]],
    successMessage: undefined,
    errorMessage: "Erro ao marcar insight",
  });
}

// ════════════════════════════════════════════
// PEOTRAM — BENCHMARKING SEED
// ════════════════════════════════════════════

export function useSeedBenchmarkScores() {
  return useIntegratedMutation<Record<string, unknown>[], Record<string, unknown>>({
    mutationFn: async (rows) => {
      const { fromUntyped } = await import("@/integrations/supabase/untyped-client");
      const { data, error } = await fromUntyped('peotram_vessel_scores').upsert(rows).select();
      if (error) throw error;
      return data;
    },
    eventType: "peotram.benchmarking.seeded",
    entityType: "vessel",
    buildPayload: (_in, out) => ({ count: Array.isArray(out) ? out.length : 0 }),
    invalidateKeys: [["peotram-vessel-scores"]],
    successMessage: "Scores de benchmarking inicializados",
    errorMessage: "Erro ao inicializar scores",
  });
}

// ════════════════════════════════════════════
// ALERTS — ACKNOWLEDGE / RESOLVE (SOC + Telemetry)
// ════════════════════════════════════════════

export function useAcknowledgeAlertIntegrated() {
  return useIntegratedMutation<string, Record<string, unknown>>({
    mutationFn: async (alertId) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from('telemetry_alerts')
        .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
        .eq('id', alertId);
      if (error) {
        const { error: socErr } = await supabase.from('soc_alerts')
          .update({ acknowledged_at: new Date().toISOString(), acknowledged_by: (await supabase.auth.getUser()).data.user?.id })
          .eq('id', alertId);
        if (socErr) throw socErr;
      }
      return { id: alertId };
    },
    eventType: "alert.acknowledged",
    entityType: "alert",
    getEntityId: (out) => out.id as string,
    buildPayload: (_in, out) => ({ alert_id: out.id }),
    invalidateKeys: [["smart-alerts"], ["tracking-alerts"]],
    successMessage: "Alerta reconhecido",
    errorMessage: "Erro ao reconhecer alerta",
  });
}

export function useResolveAlertIntegrated() {
  return useIntegratedMutation<string, Record<string, unknown>>({
    mutationFn: async (alertId) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from('telemetry_alerts')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', alertId);
      if (error) {
        const { error: socErr } = await supabase.from('soc_alerts')
          .update({ resolved_at: new Date().toISOString() })
          .eq('id', alertId);
        if (socErr) throw socErr;
      }
      return { id: alertId };
    },
    eventType: "alert.resolved",
    entityType: "alert",
    getEntityId: (out) => out.id as string,
    buildPayload: (_in, out) => ({ alert_id: out.id }),
    invalidateKeys: [["smart-alerts"], ["tracking-alerts"]],
    successMessage: "Alerta resolvido",
    errorMessage: "Erro ao resolver alerta",
  });
}

// ════════════════════════════════════════════
// NOTIFICATIONS — MARK READ
// ════════════════════════════════════════════

export function useMarkNotificationRead() {
  return useIntegratedMutation<string, Record<string, unknown>>({
    mutationFn: async (notificationId) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from("intelligent_notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId);
      if (error) {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        await supabase.from("soc_alerts")
          .update({ acknowledged_at: new Date().toISOString(), acknowledged_by: userId })
          .eq("id", notificationId);
      }
      return { id: notificationId };
    },
    eventType: "notification.read",
    entityType: "notification",
    getEntityId: (out) => out.id as string,
    buildPayload: (_in, out) => ({ notification_id: out.id }),
    invalidateKeys: [["system-notifications"]],
  });
}

export function useMarkAllNotificationsRead() {
  return useIntegratedMutation<void, Record<string, unknown>>({
    mutationFn: async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const userId = (await supabase.auth.getUser()).data.user?.id;
      await supabase.from("intelligent_notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("is_read", false);
      await supabase.from("soc_alerts")
        .update({ acknowledged_at: new Date().toISOString(), acknowledged_by: userId })
        .is("acknowledged_at", null);
      return { success: true };
    },
    eventType: "notification.all_read",
    entityType: "notification",
    buildPayload: () => ({ all: true }),
    invalidateKeys: [["system-notifications"]],
    successMessage: "Todas notificações lidas",
  });
}

// ════════════════════════════════════════════
// SECURITY — MARK FINDING FIXED
// ════════════════════════════════════════════

export function useFixSecurityFinding() {
  return useIntegratedMutation<string, Record<string, unknown>>({
    mutationFn: async (findingId) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from("telemetry_alerts")
        .update({ acknowledged: true })
        .eq("id", findingId);
      if (error) throw error;
      return { id: findingId };
    },
    eventType: "security.finding.fixed",
    entityType: "finding",
    getEntityId: (out) => out.id as string,
    buildPayload: (_in, out) => ({ finding_id: out.id }),
    invalidateKeys: [["security-findings"]],
    successMessage: "Finding marcado como corrigido",
    errorMessage: "Erro ao atualizar finding",
  });
}

// ════════════════════════════════════════════
// RECRUITMENT — STAGE CHANGE
// ════════════════════════════════════════════

export function useUpdateRecruitmentStage() {
  return useIntegratedMutation<{ candidatoId: string; novaEtapa: string }, Record<string, unknown>>({
    mutationFn: async ({ candidatoId, novaEtapa }) => {
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase.from("logs").insert({
        module: "recruitment",
        level: "info",
        message: `Candidato ${candidatoId} movido para ${novaEtapa}`,
        metadata: { candidato_id: candidatoId, nova_etapa: novaEtapa },
      } as Database['public']['Tables']['logs']['Insert']);
      return { candidatoId, novaEtapa };
    },
    eventType: "recruitment.stage.changed",
    entityType: "crew_member",
    buildPayload: (input) => ({ candidato_id: input.candidatoId, nova_etapa: input.novaEtapa }),
    invalidateKeys: [["recruitment-candidatos"]],
    successMessage: "Etapa atualizada",
    errorMessage: "Erro ao atualizar etapa",
  });
}

// ════════════════════════════════════════════
// SAFETY — DDS (Drill / Dialog)
// ════════════════════════════════════════════

export function useCreateDDS() {
  return useIntegratedMutation<Record<string, unknown>, Record<string, unknown>>({
    mutationFn: async (input) => {
      const { fromUntyped } = await import("@/integrations/supabase/untyped-client");
      const { data, error } = await fromUntyped("drill_records").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "safety.dds.created",
    entityType: "drill",
    getEntityId: (out) => out.id as string,
    buildPayload: (_in, out) => ({ drill_id: out.id, drill_type: out.drill_type }),
    invalidateKeys: [["safety-dds-records"]],
    successMessage: "DDS registrado com sucesso",
    errorMessage: "Erro ao registrar DDS",
  });
}

// ════════════════════════════════════════════
// VOYAGE — ROUTE SELECTION
// ════════════════════════════════════════════

export function useSelectVoyageRoute() {
  return useIntegratedMutation<{ voyageId: string; distance: number; fuel: number; notes: string }, Record<string, unknown>>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from('voyage_plans').update({
        estimated_distance: input.distance,
        estimated_fuel: input.fuel,
        notes: input.notes,
      }).eq('id', input.voyageId).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "voyage.route.selected",
    entityType: "voyage",
    getEntityId: (out) => out.id as string,
    buildPayload: (input) => ({ voyage_id: input.voyageId, distance: input.distance }),
    invalidateKeys: [["voyage-plans-intelligence"], ["voyages"]],
    successMessage: "Rota selecionada e salva no plano de viagem",
    errorMessage: "Erro ao salvar rota",
  });
}

// ════════════════════════════════════════════
// MAINTENANCE — IoT SENSOR READING UPDATE
// ════════════════════════════════════════════

export function useUpdateSensorReading() {
  return useIntegratedMutation<{ sensorId: string; value: number }, Record<string, unknown>>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from('iot_sensors')
        .update({ current_value: input.value, last_reading_at: new Date().toISOString() })
        .eq('id', input.sensorId).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "maintenance.sensor_reading.updated",
    entityType: "equipment",
    getEntityId: (out) => out.id as string,
    buildPayload: (input) => ({ sensor_id: input.sensorId, value: input.value }),
    invalidateKeys: [["running-hours"], ["tracking-sensors"]],
    successMessage: "Leitura atualizada",
    errorMessage: "Erro ao atualizar leitura",
  });
}

// ════════════════════════════════════════════
// TRACKING — CREATE TELEMETRY ALERT
// ════════════════════════════════════════════

export function useCreateTelemetryAlert() {
  return useIntegratedMutation<Record<string, unknown>, Record<string, unknown>>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from('telemetry_alerts')
        .insert(input as Database['public']['Tables']['telemetry_alerts']['Insert']).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "tracking.telemetry_alert.created",
    entityType: "alert",
    getEntityId: (out) => out.id as string,
    buildPayload: (_in, out) => ({ alert_id: out.id, severity: out.severity }),
    invalidateKeys: [["tracking-alerts"]],
    successMessage: "Alerta criado",
    errorMessage: "Erro ao criar alerta",
  });
}
