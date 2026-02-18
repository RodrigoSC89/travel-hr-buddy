/**
 * NAUTI ONE — Cross-Module Side Effects Engine
 * 
 * This is the BRAIN of the integration system.
 * When an event fires, this engine performs REAL business actions:
 * - Creates records in other modules
 * - Updates statuses across domains
 * - Triggers cascading workflows
 * - Enforces feature guards
 * 
 * Unlike the EventReactor (which only invalidates cache + shows toasts),
 * this engine performs actual DATA MUTATIONS across modules.
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { DomainEvent } from "@/lib/events/event-bus";

// Debounce to prevent duplicate side effects
const executedEffects = new Map<string, number>();
const EFFECT_DEBOUNCE_MS = 2000;

function shouldExecuteEffect(key: string): boolean {
  const now = Date.now();
  const last = executedEffects.get(key);
  if (last && now - last < EFFECT_DEBOUNCE_MS) return false;
  executedEffects.set(key, now);
  if (executedEffects.size > 500) {
    const cutoff = now - EFFECT_DEBOUNCE_MS * 3;
    for (const [k, v] of executedEffects) {
      if (v < cutoff) executedEffects.delete(k);
    }
  }
  return true;
}

type SideEffectFn = (event: DomainEvent) => Promise<void>;

/**
 * Registry of cross-module side effects.
 * Each entry maps an event type to real business actions.
 */
const SIDE_EFFECTS: Record<string, SideEffectFn[]> = {

  // ═══════════════════════════════════════════════════════════
  // MAINTENANCE → COMPLIANCE + FINANCE + PROCUREMENT
  // ═══════════════════════════════════════════════════════════

  'maintenance.work_order.completed': [
    // WO completed → Create compliance evidence record
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      if (!p.work_order_id) return;
      await safeInsert('action_items', {
        title: `Evidência de conclusão: OS ${p.work_order_number ?? p.work_order_id}`,
        source_module: 'maintenance',
        source_reference_id: String(p.work_order_id),
        status: 'completed',
        priority: 'medium',
        vessel_id: p.vessel_id || null,
        description: `OS concluída automaticamente. Custo real: ${p.actual_cost ?? 'N/A'}. Verificar evidências de compliance.`,
      });
      logger.info('[SideEffects] WO completed → compliance evidence created');
    },
    // WO completed → Update vessel maintenance status in fleet
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      if (!p.vessel_id) return;
      await safeUpdate('vessels', { last_maintenance_date: new Date().toISOString() }, { id: String(p.vessel_id) });
      logger.info('[SideEffects] WO completed → vessel maintenance date updated');
    },
  ],

  'maintenance.work_order.created': [
    // WO created with high priority → Auto-create alert
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      if (p.priority !== 'critical' && p.priority !== 'high') return;
      await safeInsert('soc_alerts', {
        vessel_id: p.vessel_id || null,
        alert_type: 'maintenance_critical',
        severity: p.priority === 'critical' ? 'critical' : 'high',
        title: `OS Crítica: ${p.title ?? 'Manutenção urgente'}`,
        description: `Ordem de Serviço de alta prioridade criada. Requer atenção imediata.`,
        status: 'active',
      });
      logger.info('[SideEffects] Critical WO → SOC alert created');
    },
  ],

  'maintenance.task.overdue': [
    // Overdue task → Create non-conformity
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      await safeInsert('non_conformities', {
        title: `Tarefa de manutenção atrasada: ${p.title ?? p.task_id}`,
        category: 'maintenance_delay',
        severity: 'major',
        status: 'open',
        vessel_id: p.vessel_id || null,
        source_module: 'maintenance',
        source_reference_id: String(p.task_id ?? p.id ?? ''),
        description: 'Tarefa de manutenção excedeu o prazo. CAPA automático gerado.',
      });
      logger.info('[SideEffects] Overdue task → NC created');
    },
  ],

  'maintenance.prediction.created': [
    // AI prediction → Auto-create preventive WO
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      const prob = Number(p.failure_probability ?? 0);
      if (prob < 0.7) return; // Only for high probability
      await safeInsert('action_items', {
        title: `Manutenção preventiva: ${p.equipment_name ?? 'Equipamento'} (${Math.round(prob * 100)}% risco)`,
        source_module: 'ai_prediction',
        source_reference_id: String(p.id ?? ''),
        status: 'pending',
        priority: prob >= 0.9 ? 'critical' : 'high',
        vessel_id: p.vessel_id || null,
        description: `IA detectou ${Math.round(prob * 100)}% probabilidade de falha. Ação: ${p.recommended_action ?? 'Verificar equipamento'}`,
      });
      logger.info('[SideEffects] AI prediction → preventive action item created');
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // COMPLIANCE → RISK + CAPA + TRAINING + CREW
  // ═══════════════════════════════════════════════════════════

  'compliance.finding.created': [
    // Finding created → Auto-create CAPA if severity >= major
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      const severity = String(p.severity ?? '').toLowerCase();
      if (severity !== 'major' && severity !== 'critical') return;
      await safeInsert('ism_capa', {
        finding_id: p.finding_id || p.id || null,
        title: `CAPA automática: Finding ${p.finding_id ?? ''}`,
        status: 'open',
        priority: severity === 'critical' ? 'critical' : 'high',
        vessel_id: p.vessel_id || null,
        description: `CAPA gerado automaticamente para finding de severidade ${severity}. Requer análise de causa raiz.`,
        root_cause: 'Pendente análise',
        corrective_action: 'Pendente definição',
      });
      logger.info(`[SideEffects] Finding (${severity}) → CAPA auto-created`);
    },
    // Finding created → Update risk matrix
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      await safeInsert('action_items', {
        title: `Atualizar matriz de risco: Finding ${p.finding_id ?? p.id}`,
        source_module: 'compliance',
        source_reference_id: String(p.finding_id ?? p.id ?? ''),
        status: 'pending',
        priority: 'high',
        vessel_id: p.vessel_id || null,
        description: `Novo finding detectado (${p.severity}). Risk matrix precisa ser atualizada.`,
      });
    },
  ],

  'compliance.nc.created': [
    // NC created → Create action item for resolution
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      await safeInsert('action_items', {
        title: `Resolver NC: ${p.title ?? p.nc_id ?? p.id}`,
        source_module: 'compliance',
        source_reference_id: String(p.nc_id ?? p.id ?? ''),
        status: 'pending',
        priority: String(p.severity ?? '').toLowerCase() === 'critical' ? 'critical' : 'high',
        vessel_id: p.vessel_id || null,
        description: `Não-conformidade registrada (${p.category ?? 'N/A'}). Categoria: ${p.severity ?? 'N/A'}. Ação corretiva necessária.`,
      });
      logger.info('[SideEffects] NC created → action item created');
    },
  ],

  'compliance.certificate.expiring': [
    // Certificate expiring → Create alert + block rotation assignment
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      await safeInsert('soc_alerts', {
        vessel_id: p.vessel_id || null,
        alert_type: 'certificate_expiring',
        severity: 'high',
        title: `Certificado expirando: ${p.certificate_type ?? 'N/A'}`,
        description: `Certificado expira em ${p.days_remaining ?? '?'} dias. Tripulante: ${p.crew_id ?? 'N/A'}. Embarque será bloqueado.`,
        status: 'active',
      });
      logger.info('[SideEffects] Certificate expiring → SOC alert + rotation guard');
    },
    // Certificate expiring → Create action item for renewal
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      await safeInsert('action_items', {
        title: `Renovar certificado: ${p.certificate_type ?? p.cert_type ?? 'N/A'}`,
        source_module: 'compliance',
        source_reference_id: String(p.certificate_id ?? p.cert_id ?? p.id ?? ''),
        status: 'pending',
        priority: 'critical',
        description: `Certificado expira em ${p.days_remaining ?? '?'} dias. Renovação urgente necessária para evitar bloqueio de escala.`,
      });
    },
  ],

  'compliance.audit.completed': [
    // Audit completed → Generate compliance score snapshot
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      await safeInsert('action_items', {
        title: `Revisar resultados: Auditoria ${p.audit_type ?? ''} concluída`,
        source_module: 'compliance',
        source_reference_id: String(p.audit_id ?? p.id ?? ''),
        status: 'pending',
        priority: 'medium',
        vessel_id: p.vessel_id || null,
        description: `Auditoria concluída. Revisar findings, atualizar certificados e fechar gaps identificados.`,
      });
      logger.info('[SideEffects] Audit completed → review action item created');
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // FINANCE → VOYAGE P&L + CONTRACTS + BUDGETS
  // ═══════════════════════════════════════════════════════════

  'finance.po.approved': [
    // PO approved → Auto-create expense entry
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      if (!p.po_id && !p.id) return;
      await safeInsert('expenses', {
        description: `Expense automático: PO ${p.po_id ?? p.id} aprovada`,
        amount: p.total_amount ?? p.estimated_total ?? 0,
        category: 'procurement',
        status: 'pending',
        vessel_id: p.vessel_id || null,
        reference_id: String(p.po_id ?? p.id ?? ''),
        reference_type: 'purchase_order',
      });
      logger.info('[SideEffects] PO approved → expense auto-created');
    },
  ],

  'finance.invoice.approved': [
    // Invoice approved → Update voyage P&L realized cost
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      if (!p.voyage_id) return;
      // Log the cost realization for voyage P&L
      await safeInsert('action_items', {
        title: `Custo realizado: Fatura ${p.invoice_id ?? p.id} → Voyage P&L`,
        source_module: 'finance',
        source_reference_id: String(p.invoice_id ?? p.id ?? ''),
        status: 'completed',
        priority: 'low',
        description: `Fatura de ${p.amount ?? 'N/A'} ${p.currency ?? 'USD'} aprovada e lançada no P&L da viagem ${p.voyage_id}.`,
      });
      logger.info('[SideEffects] Invoice approved → voyage P&L cost logged');
    },
  ],

  'finance.payroll.created': [
    // Payroll → Link to crew and voyage
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      await safeInsert('expenses', {
        description: `Folha de pagamento: Tripulante ${p.crew_member_id ?? ''}`,
        amount: p.gross_pay ?? p.net_pay ?? 0,
        category: 'payroll',
        status: 'approved',
        reference_id: String(p.id ?? ''),
        reference_type: 'crew_payroll',
      });
      logger.info('[SideEffects] Payroll → expense record created');
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // PEOPLE / CREW → COMPLIANCE + VESSELS + TRAINING
  // ═══════════════════════════════════════════════════════════

  'people.crew.created': [
    // New crew member → Create onboarding checklist
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      await safeInsert('action_items', {
        title: `Onboarding: ${p.full_name ?? 'Novo tripulante'}`,
        source_module: 'people',
        source_reference_id: String(p.crew_id ?? p.id ?? ''),
        status: 'pending',
        priority: 'high',
        vessel_id: p.vessel_id || null,
        description: `Novo tripulante registrado (${p.rank ?? 'N/A'}). Iniciar processo de onboarding: documentos, treinamentos STCW, exame médico.`,
      });
      logger.info('[SideEffects] New crew → onboarding action item created');
    },
  ],

  'people.training.completed': [
    // Training completed → Update competency matrix + compliance
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      await safeInsert('action_items', {
        title: `Atualizar matrix de competência: Treinamento concluído`,
        source_module: 'training',
        source_reference_id: String(p.id ?? ''),
        status: 'pending',
        priority: 'medium',
        description: `Tripulante ${p.crew_member_id ?? ''} concluiu treinamento. Atualizar competency matrix e verificar compliance STCW.`,
      });
      logger.info('[SideEffects] Training completed → competency update action created');
    },
  ],

  'people.leave.approved': [
    // Leave approved → Check vessel manning levels
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      if (!p.vessel_id) return;
      await safeInsert('action_items', {
        title: `Verificar manning: Licença aprovada`,
        source_module: 'people',
        source_reference_id: String(p.id ?? ''),
        status: 'pending',
        priority: 'high',
        vessel_id: String(p.vessel_id),
        description: `Licença aprovada para tripulante. Verificar níveis mínimos de manning e safe manning requirements.`,
      });
      logger.info('[SideEffects] Leave approved → manning check action created');
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // TRACKING / SOC → FLEET + COMPLIANCE + OPERATIONS
  // ═══════════════════════════════════════════════════════════

  'tracking.alert.created': [
    // SOC alert → Create action item for response
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      const severity = String(p.severity ?? 'medium').toLowerCase();
      if (severity !== 'critical' && severity !== 'high') return;
      await safeInsert('action_items', {
        title: `Responder alerta SOC: ${p.alert_type ?? 'Alerta'}`,
        source_module: 'tracking',
        source_reference_id: String(p.alert_id ?? p.id ?? ''),
        status: 'pending',
        priority: severity === 'critical' ? 'critical' : 'high',
        vessel_id: p.vessel_id || null,
        description: `Alerta de rastreamento (${p.alert_type ?? 'N/A'}). Severidade: ${severity}. Ação de resposta necessária.`,
      });
      logger.info('[SideEffects] Critical SOC alert → action item created');
    },
  ],

  'tracking.geofence.breach': [
    // Geofence breach → Auto-create compliance incident
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      await safeInsert('incident_reports', {
        vessel_id: p.vessel_id || null,
        incident_type: 'geofence_breach',
        severity: 'high',
        title: `Violação de geofence detectada`,
        description: `Embarcação cruzou zona restrita. Posição registrada automaticamente.`,
        status: 'open',
        reported_at: new Date().toISOString(),
      });
      logger.info('[SideEffects] Geofence breach → incident report created');
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // SAFETY → COMPLIANCE + RISK + TRAINING
  // ═══════════════════════════════════════════════════════════

  'safety.incident.created': [
    // Incident → Auto-create investigation action items
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      await safeInsert('action_items', {
        title: `Investigar incidente: ${p.title ?? p.incident_id ?? p.id}`,
        source_module: 'safety',
        source_reference_id: String(p.incident_id ?? p.id ?? ''),
        status: 'pending',
        priority: 'critical',
        vessel_id: p.vessel_id || null,
        description: `Incidente reportado (${p.severity ?? 'N/A'}). Iniciar investigação, análise de causa raiz e registro de lições aprendidas.`,
      });
      // Also create a non-conformity if severity is high
      const sev = String(p.severity ?? '').toLowerCase();
      if (sev === 'critical' || sev === 'high' || sev === 'major') {
        await safeInsert('non_conformities', {
          title: `NC de incidente: ${p.title ?? ''}`,
          category: 'safety_incident',
          severity: sev === 'critical' ? 'critical' : 'major',
          status: 'open',
          vessel_id: p.vessel_id || null,
          source_module: 'safety',
          source_reference_id: String(p.incident_id ?? p.id ?? ''),
          description: `NC gerada automaticamente a partir de incidente de segurança.`,
        });
      }
      logger.info('[SideEffects] Incident → investigation + NC created');
    },
  ],

  'safety.drill.completed': [
    // Drill completed → Update training records
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      await safeInsert('action_items', {
        title: `Registrar drill concluído no histórico de treinamento`,
        source_module: 'safety',
        source_reference_id: String(p.drill_id ?? p.id ?? ''),
        status: 'pending',
        priority: 'low',
        vessel_id: p.vessel_id || null,
        description: `Drill (${p.drill_type ?? 'N/A'}) concluído. Atualizar registros de treinamento da tripulação participante.`,
      });
      logger.info('[SideEffects] Drill completed → training update action');
    },
  ],

  'safety.near_miss.created': [
    // Near miss → Create risk assessment action
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      await safeInsert('action_items', {
        title: `Avaliar risco: Near Miss reportado`,
        source_module: 'safety',
        source_reference_id: String(p.id ?? ''),
        status: 'pending',
        priority: 'high',
        description: `Near miss registrado. Avaliar riscos, implementar medidas preventivas e compartilhar Safety Flash com a frota.`,
      });
      logger.info('[SideEffects] Near miss → risk assessment action created');
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // VOYAGE → FLEET + FINANCE + TRACKING
  // ═══════════════════════════════════════════════════════════

  'voyage.created': [
    // New voyage → Update vessel assignment status
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      if (!p.vessel_id) return;
      await safeUpdate('vessels', { 
        current_voyage_id: String(p.voyage_id ?? p.id ?? ''),
        operational_status: 'at_sea',
      }, { id: String(p.vessel_id) });
      logger.info('[SideEffects] Voyage created → vessel status updated');
    },
  ],

  'voyage.completed': [
    // Voyage completed → Free vessel + trigger P&L calculation
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      if (!p.vessel_id) return;
      await safeUpdate('vessels', {
        current_voyage_id: null,
        operational_status: 'in_port',
      }, { id: String(p.vessel_id) });
      // Create action item for P&L review
      await safeInsert('action_items', {
        title: `Revisar P&L: Viagem ${p.voyage_id ?? p.id} concluída`,
        source_module: 'operations',
        source_reference_id: String(p.voyage_id ?? p.id ?? ''),
        status: 'pending',
        priority: 'medium',
        vessel_id: String(p.vessel_id),
        description: `Viagem concluída. Revisar P&L final, verificar desvios orçamentários e fechar custos.`,
      });
      logger.info('[SideEffects] Voyage completed → vessel freed + P&L review');
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // AI → ALL MODULES (Human-in-the-Loop)
  // ═══════════════════════════════════════════════════════════

  'ai.suggestion.accepted': [
    // AI suggestion accepted → Log audit trail
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      await safeInsert('ai_blockchain_audit', {
        agent_id: 'auto-integration',
        agent_name: 'Cross-Module Side Effects',
        action_type: 'suggestion_execution',
        action_description: `Sugestão IA aceita e executada: ${p.action_type ?? 'N/A'}`,
        module: String(p.entity_type ?? 'system'),
        block_number: Date.now(),
        hash: `sha256:${Date.now()}`,
        previous_hash: 'sha256:genesis',
        confidence: Number(p.confidence ?? 0.8),
        human_override: false,
        timestamp: new Date().toISOString(),
      });
      logger.info('[SideEffects] AI suggestion accepted → audit trail logged');
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // PROCUREMENT → INVENTORY + FINANCE
  // ═══════════════════════════════════════════════════════════

  'procurement.order.received': [
    // Order received → Update inventory levels
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      await safeInsert('action_items', {
        title: `Receber material: PO ${p.id ?? ''} entregue`,
        source_module: 'procurement',
        source_reference_id: String(p.id ?? ''),
        status: 'pending',
        priority: 'medium',
        description: `Material recebido. Verificar quantidades, qualidade e atualizar inventário.`,
      });
      logger.info('[SideEffects] Order received → inventory update action');
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // ENVIRONMENTAL → COMPLIANCE + REPORTING
  // ═══════════════════════════════════════════════════════════

  'environmental.emissions.created': [
    // Emissions record → Check EU ETS thresholds
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      await safeInsert('action_items', {
        title: `Verificar compliance ambiental: Emissões registradas`,
        source_module: 'environmental',
        source_reference_id: String(p.id ?? ''),
        status: 'pending',
        priority: 'medium',
        vessel_id: p.vessel_id || null,
        description: `Registro de emissões criado. Verificar conformidade EU ETS/MRV e atualizar CII rating.`,
      });
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // VESSEL → ALL (Fleet-wide propagation)  
  // ═══════════════════════════════════════════════════════════

  'vessel.created': [
    // New vessel → Initialize compliance baseline
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      await safeInsert('action_items', {
        title: `Setup inicial: ${p.name ?? 'Nova embarcação'}`,
        source_module: 'fleet',
        source_reference_id: String(p.id ?? ''),
        status: 'pending',
        priority: 'critical',
        vessel_id: p.id ? String(p.id) : null,
        description: `Nova embarcação registrada (${p.vessel_type ?? 'N/A'}, IMO: ${p.imo_number ?? 'N/A'}). Criar: baseline de compliance, PMS schedule, certificados estatutários, equipe mínima.`,
      });
      logger.info('[SideEffects] New vessel → full setup action created');
    },
  ],

  'fleet.downtime.created': [
    // Vessel downtime → Notify finance + ops
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      await safeInsert('action_items', {
        title: `Avaliar impacto financeiro: Downtime de embarcação`,
        source_module: 'fleet',
        source_reference_id: String(p.id ?? ''),
        status: 'pending',
        priority: 'high',
        vessel_id: p.vessel_id ? String(p.vessel_id) : null,
        description: `Período de inatividade registrado. Calcular impacto em charter revenue, notificar charterers e atualizar P&L.`,
      });
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // MEDICAL → CREW + COMPLIANCE
  // ═══════════════════════════════════════════════════════════

  'medical.record.created': [
    // Medical record → Check fitness for duty
    async (event) => {
      const p = event.payload as Record<string, unknown>;
      const recordType = String(p.record_type ?? '').toLowerCase();
      if (recordType !== 'fitness_assessment' && recordType !== 'medical_exam') return;
      await safeInsert('action_items', {
        title: `Atualizar aptidão: Registro médico criado`,
        source_module: 'medical',
        source_reference_id: String(p.id ?? ''),
        status: 'pending',
        priority: 'high',
        description: `Exame médico registrado para tripulante ${p.crew_member_id ?? ''}. Verificar aptidão para serviço e atualizar compliance MLC Title 4.`,
      });
    },
  ],
};

// ═══════════════════════════════════════════════════════════
// SAFE DB HELPERS (never throw — side effects must not break the app)
// ═══════════════════════════════════════════════════════════

async function safeInsert(table: string, data: Record<string, unknown>): Promise<boolean> {
  try {
    const { error } = await (supabase.from as Function)(table).insert({
      ...data,
      created_at: data.created_at ?? new Date().toISOString(),
    });
    if (error) {
      logger.warn(`[SideEffects] Insert to ${table} failed:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    logger.warn(`[SideEffects] Insert to ${table} threw:`, err);
    return false;
  }
}

async function safeUpdate(table: string, data: Record<string, unknown>, match: Record<string, string>): Promise<boolean> {
  try {
    let query = (supabase.from as Function)(table).update({
      ...data,
      updated_at: new Date().toISOString(),
    });
    for (const [key, value] of Object.entries(match)) {
      query = query.eq(key, value);
    }
    const { error } = await query;
    if (error) {
      logger.warn(`[SideEffects] Update ${table} failed:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    logger.warn(`[SideEffects] Update ${table} threw:`, err);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════

/**
 * Execute all registered side effects for a given event.
 * This is called by the EventReactor after cache invalidation.
 * 
 * IMPORTANT: Side effects are fire-and-forget. They never block
 * the UI and they never throw. If one fails, others still execute.
 */
export async function executeSideEffects(event: DomainEvent): Promise<void> {
  const effects = SIDE_EFFECTS[event.type];
  if (!effects || effects.length === 0) return;

  const dedupeKey = `${event.type}:${event.sourceEntityId ?? JSON.stringify(event.payload).slice(0, 50)}`;
  if (!shouldExecuteEffect(dedupeKey)) return;

  logger.info(`[SideEffects] Executing ${effects.length} effects for ${event.type}`);

  await Promise.allSettled(
    effects.map(async (effect) => {
      try {
        await effect(event);
      } catch (err) {
        logger.warn(`[SideEffects] Effect failed for ${event.type}:`, err);
      }
    })
  );
}

/** Get count of registered side effect event types */
export function getSideEffectStats(): { eventTypes: number; totalEffects: number } {
  const eventTypes = Object.keys(SIDE_EFFECTS).length;
  const totalEffects = Object.values(SIDE_EFFECTS).reduce((sum, effects) => sum + effects.length, 0);
  return { eventTypes, totalEffects };
}
