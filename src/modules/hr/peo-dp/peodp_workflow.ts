/**
 * PEO-DP Workflow Integration
 * Integrates PEO-DP Intelligent System with Smart Workflow
 * Triggers automatic corrective actions for critical events
 */

import { logger } from "@/lib/logger";
import type {
  PEODPEvent,
  PEODPEventType,
  PEODPCorrectiveAction,
  PEODPWorkflowResult,
} from "./types";

export class PEOWorkflow {
  private acoesPredefinidas: Record<PEODPEventType, string>;
  private actionHistory: PEODPWorkflowResult[] = [];

  constructor() {
    this.acoesPredefinidas = {
      "Loss of DP Reference":
        "Verificar sensores de posição e redundância GPS/DGNSS. Ativar backup de referência.",
      "Thruster Fault":
        "Acionar equipe de máquinas e rodar autoteste MMI no propulsor afetado. Verificar logs de manutenção.",
      "UPS Alarm":
        "Checar alimentação do barramento elétrico e integridade de baterias. Verificar sistema de backup.",
      "Manual Override":
        "Confirmar intenção da ação via DPO e registrar justificativa no log. Documentar no ASOG.",
      "Position Drift":
        "Verificar integridade dos sensores de posição. Checar condições ambientais e limites operacionais.",
      "Power Failure":
        "Ativar sistema de emergência. Verificar integridade do sistema elétrico e UPS. Acionar equipe técnica.",
      "System Normal": "Nenhuma ação necessária. Sistema operando normalmente.",
    };
  }

  /**
   * Trigger corrective action for an event
   */
  acionar_acao(evento: PEODPEvent): PEODPWorkflowResult {
    const tipo = evento.evento;

    logger.info(`🔧 Acionando ação corretiva para evento: ${tipo}`, {
      vessel: evento.vesselName,
      timestamp: evento.data,
      severity: evento.severity,
    });

    if (tipo === "System Normal") {
      return {
        success: true,
        message: "Nenhuma ação necessária - Sistema Normal",
        timestamp: new Date().toISOString(),
      };
    }

    const acao = this.acoesPredefinidas[tipo];
    if (!acao) {
      logger.warn(`Evento sem ação automática definida: ${tipo}`);
      return {
        success: false,
        message: "Evento sem ação automática definida",
        timestamp: new Date().toISOString(),
      };
    }

    const result = this.enviar_para_workflow(tipo, acao, evento);
    this.actionHistory.push(result);

    return result;
  }

  /**
   * Send corrective action to Smart Workflow system
   */
  private enviar_para_workflow(
    tipo: PEODPEventType,
    acao: string,
    evento: PEODPEvent
  ): PEODPWorkflowResult {
    const actionId = this.generateActionId();
    const timestamp = new Date().toISOString();

    logger.info("🧾 Enviando ação corretiva para Smart Workflow...", {
      actionId,
      evento: tipo,
      acao,
      timestamp,
    });

    // In production, this would integrate with the actual Smart Workflow API
    // For now, we log and return a success result

    const result: PEODPWorkflowResult = {
      success: true,
      actionId,
      message: `Ação corretiva criada: ${acao}`,
      timestamp,
    };

    logger.info("✅ Ação corretiva enviada com sucesso", {
      actionId,
      evento: tipo,
    });

    return result;
  }

  /**
   * Get corrective action for an event type
   */
  obter_acao(eventType: PEODPEventType): PEODPCorrectiveAction {
    const action = this.acoesPredefinidas[eventType];
    const priority = this.determinePriority(eventType);

    return {
      eventType,
      action,
      priority,
      status: "Pending",
    };
  }

  /**
   * Determine action priority based on event type
   */
  private determinePriority(
    eventType: PEODPEventType
  ): "High" | "Medium" | "Low" {
    const highPriority: PEODPEventType[] = [
      "Loss of DP Reference",
      "Power Failure",
      "Thruster Fault",
    ];

    const mediumPriority: PEODPEventType[] = [
      "UPS Alarm",
      "Position Drift",
      "Manual Override",
    ];

    if (highPriority.includes(eventType)) {
      return "High";
    } else if (mediumPriority.includes(eventType)) {
      return "Medium";
    }

    return "Low";
  }

  /**
   * Get all predefined actions
   */
  obter_todas_acoes(): PEODPCorrectiveAction[] {
    return Object.keys(this.acoesPredefinidas).map((eventType) =>
      this.obter_acao(eventType as PEODPEventType)
    );
  }

  /**
   * Get action history
   */
  get historico_acoes(): PEODPWorkflowResult[] {
    return [...this.actionHistory];
  }

  /**
   * Clear action history
   */
  limpar_historico(): void {
    this.actionHistory = [];
    logger.info("Histórico de ações limpo");
  }

  /**
   * Update predefined action for an event type
   */
  atualizar_acao(eventType: PEODPEventType, newAction: string): void {
    this.acoesPredefinidas[eventType] = newAction;
    logger.info(`Ação atualizada para ${eventType}`, { newAction });
  }

  /**
   * Generate unique action ID
   */
  private generateActionId(): string {
    return `ACTION-${Date.now()}-${crypto.randomUUID().slice(0, 9)}`;
  }

  /**
   * Batch process multiple events
   */
  processar_lote(eventos: PEODPEvent[]): PEODPWorkflowResult[] {
    logger.info(`Processando lote de ${eventos.length} eventos`);

    const results = eventos.map((evento) => this.acionar_acao(evento));

    const successCount = results.filter((r) => r.success).length;
    logger.info(`Lote processado: ${successCount}/${eventos.length} ações bem-sucedidas`);

    return results;
  }

  /**
   * Get statistics about actions triggered
   */
  obter_estatisticas(): {
    total: number;
    sucessos: number;
    falhas: number;
    porTipo: Record<string, number>;
    } {
    const total = this.actionHistory.length;
    const sucessos = this.actionHistory.filter((a) => a.success).length;
    const falhas = total - sucessos;

    // Count by event type would require storing event type in result
    // For now, return basic stats
    const porTipo: Record<string, number> = {};

    return {
      total,
      sucessos,
      falhas,
      porTipo,
    };
  }
}
