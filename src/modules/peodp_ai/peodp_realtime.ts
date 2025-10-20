/**
 * PEO-DP Real-time Monitoring
 * Monitors DP logs, MMI and ASOG in real-time, detecting compliance violations
 */

import { logger } from "@/lib/logger";
import { PEOWorkflow } from "./peodp_workflow";
import type { DPEvent, EventType, MonitoringSession } from "./types";

export class PEORealTime {
  private workflow: PEOWorkflow;
  private limite_tolerancia: number;
  private eventos: DPEvent[];
  private isMonitoring: boolean;
  private monitoringInterval: NodeJS.Timeout | null;
  private session: MonitoringSession | null;

  constructor() {
    this.workflow = new PEOWorkflow();
    this.limite_tolerancia = 3; // máximo de eventos de não conformidade antes de ação automática
    this.eventos = [];
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.session = null;
  }

  /**
   * Start continuous compliance monitoring
   */
  iniciar_monitoramento(vesselName: string = "Vessel Unknown"): void {
    if (this.isMonitoring) {
      logger.warn("Monitoring already active");
      return;
    }

    this.isMonitoring = true;
    this.eventos = [];
    
    this.session = {
      id: `session-${Date.now()}`,
      vessel: {
        name: vesselName,
        imo: "IMO-" + Math.random().toString(36).substr(2, 7).toUpperCase(),
        dp_class: "DP2",
        thrusters: 4,
        generators: 3,
        position_references: 3
      },
      start_time: new Date().toISOString(),
      events: [],
      active: true,
      tolerance_limit: this.limite_tolerancia
    };

    logger.info("📡 Iniciando monitoramento contínuo de conformidade DP...", {
      vessel: vesselName,
      session_id: this.session.id,
      tolerance_limit: this.limite_tolerancia
    });

    console.log("\n" + "═".repeat(60));
    console.log("📡 PEO-DP MONITORAMENTO EM TEMPO REAL");
    console.log("═".repeat(60));
    console.log(`🚢 Embarcação: ${vesselName}`);
    console.log(`🆔 Session ID: ${this.session.id}`);
    console.log(`⚙️  Tolerância: ${this.limite_tolerancia} eventos críticos`);
    console.log("═".repeat(60) + "\n");
  }

  /**
   * Simulate a single monitoring cycle
   */
  executar_ciclo_monitoramento(): DPEvent | null {
    if (!this.isMonitoring) {
      logger.warn("Monitoring not active - call iniciar_monitoramento() first");
      return null;
    }

    const evento = this.simular_evento_dp();
    this.eventos.push(evento);
    
    if (this.session) {
      this.session.events.push(evento);
    }

    this.avaliar_evento(evento);
    
    return evento;
  }

  /**
   * Start automated monitoring with interval
   */
  monitorar_automatico(intervalo_ms: number = 3000): void {
    this.iniciar_monitoramento();
    
    this.monitoringInterval = setInterval(() => {
      this.executar_ciclo_monitoramento();
    }, intervalo_ms);

    logger.info("Monitoring automático ativado", {
      interval_ms: intervalo_ms
    });
  }

  /**
   * Stop monitoring
   */
  parar_monitoramento(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isMonitoring = false;
    
    if (this.session) {
      this.session.active = false;
    }

    logger.info("Monitoring stopped", {
      total_events: this.eventos.length,
      session_id: this.session?.id
    });

    console.log("\n" + "═".repeat(60));
    console.log("🛑 Monitoramento Encerrado");
    console.log("═".repeat(60));
    console.log(`📊 Total de Eventos: ${this.eventos.length}`);
    console.log(`⚠️  Eventos Críticos: ${this.getEventosCriticos().length}`);
    console.log("═".repeat(60) + "\n");
  }

  /**
   * Simulate DP event reading from logs
   */
  private simular_evento_dp(): DPEvent {
    const tipos: EventType[] = [
      "Loss of DP Reference",
      "Thruster Fault",
      "UPS Alarm",
      "Manual Override",
      "System Normal",
      "Position Drift",
      "Power Failure"
    ];

    // Weighted random selection - System Normal is more common
    const weights = [0.05, 0.08, 0.07, 0.05, 0.65, 0.05, 0.05];
    const random = Math.random();
    let cumulative = 0;
    let selectedIndex = 0;

    for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (random <= cumulative) {
            selectedIndex = i;
            break;
        }
    }

    const evento: DPEvent = {
      evento: tipos[selectedIndex],
      data: new Date().toISOString(),
      vessel: this.session?.vessel.name || "Unknown Vessel"
    };

    return evento;
  }

  /**
   * Evaluate event and trigger actions if needed
   */
  private avaliar_evento(evento: DPEvent): void {
    const timestamp = new Date(evento.data).toLocaleString("pt-BR");

    if (evento.evento === "System Normal") {
      console.log(`[${timestamp}] ✅ Operação normal.`);
      logger.debug("System operating normally");
      return;
    }

    // Log non-conformity event
    console.log(`[${timestamp}] ⚠️  Evento detectado: ${evento.evento}`);
    logger.warn(`Evento DP detectado: ${evento.evento}`, {
      evento: evento.evento,
      timestamp: evento.data,
      vessel: evento.vessel
    });

    // Trigger workflow action
    this.workflow.acionar_acao(evento);

    // Check tolerance limit
    const eventosCriticos = this.getEventosCriticos();
    if (eventosCriticos.length >= this.limite_tolerancia) {
      this.notificar_excesso_eventos(eventosCriticos);
    }
  }

  /**
   * Get critical events from current session
   */
  private getEventosCriticos(): DPEvent[] {
    return this.eventos.filter(e => e.evento !== "System Normal");
  }

  /**
   * Notify when critical event threshold is exceeded
   */
  private notificar_excesso_eventos(eventos: DPEvent[]): void {
    console.log("\n" + "⚠️".repeat(30));
    console.log("🚨 ALERTA: Limite de tolerância excedido!");
    console.log(`📊 ${eventos.length} eventos críticos detectados`);
    console.log("⚠️".repeat(30) + "\n");

    logger.error("Tolerance limit exceeded", {
      critical_events: eventos.length,
      limit: this.limite_tolerancia,
      session_id: this.session?.id
    });
  }

  /**
   * Get monitoring statistics
   */
  getEstatisticas(): {
    total: number;
    criticos: number;
    normais: number;
    por_tipo: Record<string, number>;
  } {
    const total = this.eventos.length;
    const criticos = this.getEventosCriticos().length;
    const normais = total - criticos;

    const por_tipo: Record<string, number> = {};
    this.eventos.forEach(e => {
      por_tipo[e.evento] = (por_tipo[e.evento] || 0) + 1;
    });

    return {
      total,
      criticos,
      normais,
      por_tipo
    };
  }

  /**
   * Get current monitoring session
   */
  getSession(): MonitoringSession | null {
    return this.session;
  }

  /**
   * Get all events from current session
   */
  getEventos(): DPEvent[] {
    return [...this.eventos];
  }

  /**
   * Set tolerance limit
   */
  setToleranceLimit(limit: number): void {
    this.limite_tolerancia = limit;
    if (this.session) {
      this.session.tolerance_limit = limit;
    }
    logger.info(`Tolerance limit updated to ${limit}`);
  }
}
