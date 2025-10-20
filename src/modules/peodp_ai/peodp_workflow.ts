/**
 * PEO-DP Workflow Integration
 * Triggers automatic corrective actions in Smart Workflow based on detected events
 */

import { logger } from "@/lib/logger";
import type { DPEvent, EventType, WorkflowAction } from "./types";

export class PEOWorkflow {
  private acoes_predefinidas: Record<EventType, string>;

  constructor() {
    this.acoes_predefinidas = {
      "Loss of DP Reference": "Verificar sensores de posição e redundância GPS/DGNSS. Ativar sensores backup imediatamente.",
      "Thruster Fault": "Acionar equipe de máquinas e rodar autoteste MMI no propulsor afetado. Verificar pressão hidráulica.",
      "UPS Alarm": "Checar alimentação do barramento elétrico e integridade de baterias. Testar autonomia do sistema.",
      "Manual Override": "Confirmar intenção da ação via DPO e registrar justificativa no log. Obter aprovação antes de proceder.",
      "System Normal": "Continuar monitoramento de rotina. Nenhuma ação corretiva necessária.",
      "Position Drift": "Verificar capability plot e condições ambientais. Avaliar necessidade de mudança de posição ou ajuste de thrust allocation.",
      "Power Failure": "Acionar geradores de emergência e verificar sistema de distribuição elétrica. Priorizar sistemas críticos de DP."
    };
  }

  /**
   * Trigger corrective action for a detected event
   */
  acionar_acao(evento: DPEvent): WorkflowAction | null {
    const tipo = evento.evento;
    
    if (!(tipo in this.acoes_predefinidas)) {
      logger.warn(`Evento sem ação automática definida: ${tipo}`);
      return null;
    }

    const acao = this.acoes_predefinidas[tipo];
    
    logger.info(`Ação corretiva acionada para evento: ${tipo}`, {
      evento: tipo,
      acao
    });

    const workflowAction: WorkflowAction = {
      tipo,
      acao,
      timestamp: new Date(),
      status: "pending"
    };

    this.enviar_para_workflow(tipo, acao);
    
    return workflowAction;
  }

  /**
   * Send action to Smart Workflow system
   */
  private enviar_para_workflow(tipo: EventType, acao: string): void {
    const timestamp = new Date().toISOString();
    
    logger.info("🧾 Enviando ação corretiva para Smart Workflow...", {
      evento: tipo,
      acao,
      timestamp
    });

    // In production, this would integrate with the actual Smart Workflow API
    // For now, we log the action
    console.log("─────────────────────────────────────────");
    console.log("🧾 SMART WORKFLOW - Ação Corretiva");
    console.log("─────────────────────────────────────────");
    console.log(`📅 Timestamp: ${timestamp}`);
    console.log(`⚠️  Evento: ${tipo}`);
    console.log(`🔧 Ação: ${acao}`);
    console.log("─────────────────────────────────────────\n");
  }

  /**
   * Get predefined action for an event type
   */
  getAction(eventType: EventType): string | undefined {
    return this.acoes_predefinidas[eventType];
  }

  /**
   * Add or update a predefined action
   */
  setAction(eventType: EventType, action: string): void {
    this.acoes_predefinidas[eventType] = action;
    logger.info(`Ação atualizada para evento: ${eventType}`, { action });
  }

  /**
   * Get all predefined actions
   */
  getAllActions(): Record<EventType, string> {
    return { ...this.acoes_predefinidas };
  }

  /**
   * Create action plan for multiple events
   */
  createActionPlan(events: DPEvent[]): WorkflowAction[] {
    const actions: WorkflowAction[] = [];
    
    events.forEach(event => {
      const action = this.acionar_acao(event);
      if (action) {
        actions.push(action);
      }
    });

    logger.info(`Plano de ação criado`, {
      total_events: events.length,
      actions_created: actions.length
    });

    return actions;
  }

  /**
   * Prioritize actions based on severity
   */
  prioritizeActions(actions: WorkflowAction[]): WorkflowAction[] {
    const priority: Record<EventType, number> = {
      "Loss of DP Reference": 1,
      "Power Failure": 1,
      "Thruster Fault": 2,
      "UPS Alarm": 2,
      "Position Drift": 3,
      "Manual Override": 4,
      "System Normal": 5
    };

    return actions.sort((a, b) => {
      const priorityA = priority[a.tipo] || 999;
      const priorityB = priority[b.tipo] || 999;
      return priorityA - priorityB;
    });
  }
}
