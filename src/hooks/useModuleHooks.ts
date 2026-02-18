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

// ════════════════════════════════════════════
// PMS (Planned Maintenance System)
// ════════════════════════════════════════════

export function useCreatePMSSystem() {
  return useIntegratedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => PMSService.createSystem(input),
    eventType: "maintenance.system.created",
    entityType: "work_order",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ system_id: out.id, name: out.name, code: out.code }),
    invalidateKeys: [["pms_systems"], ["maintenance"]],
    successMessage: "Sistema PMS adicionado",
    errorMessage: "Erro ao adicionar sistema",
  });
}

export function useCreatePMSWorkOrder() {
  return useIntegratedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => PMSService.createWorkOrder(input),
    eventType: "maintenance.work_order.created",
    entityType: "work_order",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ work_order_id: out.id, wo_number: out.work_order_number, priority: out.priority }),
    invalidateKeys: [["pms_work_orders"], ["maintenance"], ["work-orders"]],
    successMessage: "Work Order criada",
    errorMessage: "Erro ao criar Work Order",
  });
}

export function useUpdatePMSWorkOrderStatus() {
  return useIntegratedMutation<{ id: string; status: string }, any>({
    mutationFn: ({ id, status }) => PMSService.updateWorkOrderStatus(id, status),
    eventType: "maintenance.work_order.status_changed",
    entityType: "work_order",
    getEntityId: (out) => out.id,
    buildPayload: (input) => ({ work_order_id: input.id, status: input.status }),
    invalidateKeys: [["pms_work_orders"], ["maintenance"], ["work-orders"], ["compliance"]],
    successMessage: "Status atualizado",
    errorMessage: "Erro ao atualizar status",
  });
}

// ════════════════════════════════════════════
// CHARTERING
// ════════════════════════════════════════════

export function useCreateCharterParty() {
  return useIntegratedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => CharteringService.createCharterParty(input),
    eventType: "finance.charter.created",
    entityType: "charter_party",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ charter_id: out.id, charter_type: out.charter_type, charterer: out.charterer_name }),
    invalidateKeys: [["charter_parties"], ["finance"], ["voyages"]],
    successMessage: "Charter Party criada",
    errorMessage: "Erro ao criar Charter Party",
  });
}

export function useUpdateCharterStatus() {
  return useIntegratedMutation<{ id: string; status: string }, any>({
    mutationFn: ({ id, status }) => CharteringService.updateStatus(id, status),
    eventType: "finance.charter.status_changed",
    entityType: "charter_party",
    getEntityId: (out) => out.id,
    buildPayload: (input) => ({ charter_id: input.id, status: input.status }),
    invalidateKeys: [["charter_parties"], ["finance"]],
    successMessage: "Status do charter atualizado",
    errorMessage: "Erro ao atualizar status",
  });
}

// ════════════════════════════════════════════
// ISM COMPLIANCE
// ════════════════════════════════════════════

export function useRunISMGapAnalysis() {
  return useIntegratedMutation<{ elementId: string; data: Record<string, unknown> }, any>({
    mutationFn: ({ elementId, data }) => ISMService.runGapAnalysis(elementId, data),
    eventType: "compliance.gap_analysis.completed",
    entityType: "audit",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ gap_id: out.id, score: out.compliance_score, status: out.status }),
    invalidateKeys: [["ism_gap_analysis"], ["compliance"]],
    successMessage: "Avaliação ISM concluída",
    errorMessage: "Erro na avaliação",
  });
}

export function useCreateISMCAPA() {
  return useIntegratedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => ISMService.createCAPA(input),
    eventType: "compliance.capa.created",
    entityType: "capa",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ capa_id: out.id }),
    invalidateKeys: [["ism_capa"], ["compliance"], ["findings"]],
    successMessage: "CAPA criada",
    errorMessage: "Erro ao criar CAPA",
  });
}

export function useUpdateISMCAPAStatus() {
  return useIntegratedMutation<{ id: string; status: string }, any>({
    mutationFn: ({ id, status }) => ISMService.updateCAPAStatus(id, status),
    eventType: "compliance.capa.closed",
    entityType: "capa",
    getEntityId: (out) => out.id,
    buildPayload: (input) => ({ capa_id: input.id, status: input.status }),
    invalidateKeys: [["ism_capa"], ["compliance"]],
    successMessage: "Status CAPA atualizado",
    errorMessage: "Erro ao atualizar CAPA",
  });
}

// ════════════════════════════════════════════
// CREW
// ════════════════════════════════════════════

export function useCreateCrewMember() {
  return useIntegratedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => CrewService.createCrewMember(input),
    eventType: "people.crew.created",
    entityType: "crew_member",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ crew_id: out.id, name: out.full_name, rank: out.rank }),
    invalidateKeys: [["crew"], ["crew-scheduler"], ["rotations"]],
    successMessage: "Tripulante adicionado com sucesso",
    errorMessage: "Erro ao adicionar tripulante",
  });
}

// ════════════════════════════════════════════
// EU ETS / EMISSIONS
// ════════════════════════════════════════════

export function useCreateETSRecord() {
  return useIntegratedMutation<Record<string, unknown>, any>({
    mutationFn: (input) => ETSService.createRecord(input),
    eventType: "finance.ets.record_created",
    entityType: "expense",
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ record_id: out.id, co2: out.total_co2_mt, cost: out.total_cost_eur }),
    invalidateKeys: [["eu_ets_tracking"], ["finance"], ["compliance"]],
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
    entityType: "feedback" as any,
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
      const { data, error } = await supabase
        .from('ai_training_sessions')
        .insert(input as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    eventType: "training.session.created",
    entityType: "training" as any,
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
    entityType: "training" as any,
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
    entityType: "communication" as any,
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
    entityType: "communication" as any,
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
        .update({ role: input.newRole } as any)
        .eq("user_id", input.userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    eventType: "access.role.changed",
    entityType: "user" as any,
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
      const { data, error } = await supabase.from('peodp_logbook_entries')
        .insert(input as any).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "peodp.logbook.entry_created",
    entityType: "logbook_entry" as any,
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
    entityType: "logbook_entry" as any,
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
      const { data, error } = await supabase.from('peodp_fmea_items')
        .insert(input as any).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "peodp.fmea.item_created",
    entityType: "fmea_item" as any,
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
      const { data, error } = await supabase.from('peodp_fmea_items')
        .update(updates as any).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "peodp.fmea.item_updated",
    entityType: "fmea_item" as any,
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
    entityType: "fmea_item" as any,
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
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from('navigation_history')
        .insert(input as any).select().single();
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
  return useIntegratedMutation<Record<string, unknown>, any>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from('inventory_items')
        .insert(input as any).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "maintenance.spare_part.added",
    entityType: "inventory_item" as any,
    getEntityId: (out) => out.id,
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
  return useIntegratedMutation<{ equipmentId: string; hours: number; vesselId?: string }, any>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await (supabase.from as Function)('pms_running_hours_triggers')
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
    entityType: "equipment" as any,
    getEntityId: (out) => out.id,
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
  return useIntegratedMutation<Record<string, unknown>, any>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from('ai_maintenance_predictions')
        .insert(input as any).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "maintenance.prediction.created",
    entityType: "prediction" as any,
    getEntityId: (out) => out.id,
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
  return useIntegratedMutation<Record<string, unknown>, any>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await (supabase.from as Function)('class_surveys')
        .insert(input).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "compliance.class_survey.created",
    entityType: "survey" as any,
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ survey_id: out.id, survey_type: out.survey_type, status: out.status }),
    invalidateKeys: [["class-surveys"], ["compliance"]],
    successMessage: "Vistoria de classe criada",
    errorMessage: "Erro ao criar vistoria",
  });
}

export function useUpdateClassSurvey() {
  return useIntegratedMutation<{ id: string; updates: Record<string, unknown> }, any>({
    mutationFn: async ({ id, updates }) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await (supabase.from as Function)('class_surveys')
        .update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "compliance.class_survey.updated",
    entityType: "survey" as any,
    getEntityId: (out) => out.id,
    buildPayload: (input) => ({ survey_id: input.id }),
    invalidateKeys: [["class-surveys"], ["compliance"]],
    successMessage: "Vistoria atualizada",
    errorMessage: "Erro ao atualizar vistoria",
  });
}

export function useDeleteClassSurvey() {
  return useIntegratedMutation<string, any>({
    mutationFn: async (id) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await (supabase.from as Function)('class_surveys').delete().eq('id', id);
      if (error) throw error;
      return { id };
    },
    eventType: "compliance.class_survey.deleted",
    entityType: "survey" as any,
    getEntityId: (out) => out.id,
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
  return useIntegratedMutation<Record<string, unknown>, any>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from('logs')
        .insert(input as any).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "compliance.marpol.entry_created",
    entityType: "marpol_entry" as any,
    getEntityId: (out) => out.id,
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
  return useIntegratedMutation<Record<string, unknown>, any>({
    mutationFn: async (input) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from('purchase_requisitions')
        .insert(input as any).select().single();
      if (error) throw error;
      return data;
    },
    eventType: "procurement.requisition.created",
    entityType: "purchase_requisition" as any,
    getEntityId: (out) => out.id,
    buildPayload: (_in, out) => ({ pr_id: out.id, pr_number: out.pr_number, status: out.status }),
    invalidateKeys: [["purchase-requisitions"], ["procurement"]],
    successMessage: "Requisição de compra criada",
    errorMessage: "Erro ao criar requisição",
  });
}
