/**
 * PEO-DP Real-Time Monitoring System
 * Monitors DP logs, MMI, and ASOG systems in real-time
 * Detects compliance violations automatically
 */

import { logger } from "@/lib/logger";
import type {
  PEODPEvent,
  PEODPEventType,
  PEODPMonitoringSession,
  PEODPMonitoringStats,
  PEODPSessionReport,
  PEODPEventSeverity,
} from "./types";

export class PEORealTime {
  private limiteTolerancia: number = 3;
  private eventos: PEODPEvent[] = [];
  private currentSession: PEODPMonitoringSession | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private violationCount: number = 0;

  /**
   * Start real-time monitoring for a vessel
   */
  iniciar_monitoramento(vesselName: string, duration?: number): string {
    logger.info("📡 Iniciando monitoramento contínuo de conformidade DP...", {
      vessel: vesselName,
      duration,
    });

    const sessionId = this.generateSessionId();
    this.currentSession = {
      sessionId,
      vesselName,
      startTime: new Date().toISOString(),
      eventos: [],
      violations: 0,
      isActive: true,
    };

    // If duration is specified, auto-stop after that time
    if (duration) {
      setTimeout(() => {
        this.parar_monitoramento();
      }, duration * 1000);
    }

    return sessionId;
  }

  /**
   * Execute a single monitoring cycle
   */
  executar_ciclo(): PEODPEvent | null {
    if (!this.currentSession || !this.currentSession.isActive) {
      logger.warn("Tentativa de executar ciclo sem sessão ativa");
      return null;
    }

    const evento = this.simular_evento_dp();
    this.eventos.push(evento);
    
    if (this.currentSession) {
      this.currentSession.eventos.push(evento);
    }

    this.avaliar_evento(evento);

    return evento;
  }

  /**
   * Start continuous monitoring loop
   */
  iniciar_loop_continuo(intervalSeconds: number = 3): void {
    if (this.monitoringInterval) {
      logger.warn("Loop de monitoramento já está ativo");
      return;
    }

    this.monitoringInterval = setInterval(() => {
      this.executar_ciclo();
    }, intervalSeconds * 1000);

    logger.info("Loop contínuo de monitoramento iniciado", {
      interval: intervalSeconds,
    });
  }

  /**
   * Stop monitoring
   */
  parar_monitoramento(): PEODPSessionReport | null {
    if (!this.currentSession) {
      logger.warn("Nenhuma sessão ativa para parar");
      return null;
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.currentSession.isActive = false;
    this.currentSession.endTime = new Date().toISOString();

    logger.info("📊 Monitoramento finalizado", {
      sessionId: this.currentSession.sessionId,
      totalEvents: this.eventos.length,
      violations: this.violationCount,
    });

    const report = this.gerar_relatorio_sessao();
    
    // Reset for next session
    this.eventos = [];
    this.violationCount = 0;
    
    const sessionReport = report;
    this.currentSession = null;

    return sessionReport;
  }

  /**
   * Simulate DP event (reads from DP logs, MMI, ASOG in production)
   */
  private simular_evento_dp(): PEODPEvent {
    const tipos: PEODPEventType[] = [
      "Loss of DP Reference",
      "Thruster Fault",
      "UPS Alarm",
      "Manual Override",
      "Position Drift",
      "Power Failure",
      "System Normal",
    ];

    // Deterministic rotation based on timestamp
    const tickIndex = Math.floor(Date.now() / 5000) % tipos.length;
    const selectedType: PEODPEventType = tipos[tickIndex];

    const evento: PEODPEvent = {
      evento: selectedType,
      data: new Date().toISOString(),
      timestamp: Date.now(),
      severity: this.determineSeverity(selectedType),
      vesselName: this.currentSession?.vesselName,
      source: "DP_LOG",
    };

    return evento;
  }

  /**
   * Determine event severity
   */
  private determineSeverity(eventType: PEODPEventType): PEODPEventSeverity {
    const severityMap: Record<PEODPEventType, PEODPEventSeverity> = {
      "Loss of DP Reference": "Critical",
      "Thruster Fault": "High",
      "UPS Alarm": "High",
      "Manual Override": "Medium",
      "Position Drift": "Medium",
      "Power Failure": "Critical",
      "System Normal": "Info",
    };

    return severityMap[eventType];
  }

  /**
   * Evaluate event and determine if action is needed
   */
  private avaliar_evento(evento: PEODPEvent): void {
    if (evento.evento === "System Normal") {
      logger.info(`[${evento.data}] ✅ Operação normal.`);
      return;
    }

    logger.warn(`[${evento.data}] ⚠️ Evento detectado: ${evento.evento}`, {
      severity: evento.severity,
      vessel: evento.vesselName,
    });

    this.violationCount++;
    
    if (this.currentSession) {
      this.currentSession.violations++;
    }

    // Check if violation limit exceeded
    if (this.violationCount >= this.limiteTolerancia) {
      logger.error(
        `🚨 Limite de tolerância excedido! ${this.violationCount} violações detectadas`
      );
    }
  }

  /**
   * Generate session report
   */
  gerar_relatorio_sessao(): PEODPSessionReport | null {
    if (!this.currentSession) {
      logger.warn("Nenhuma sessão ativa para gerar relatório");
      return null;
    }

    const statistics = this.calcular_estatisticas();
    const violations = this.eventos.filter((e) => e.evento !== "System Normal");
    const recommendations = this.gerar_recomendacoes_tempo_real(statistics);

    const report: PEODPSessionReport = {
      session: { ...this.currentSession },
      statistics,
      violations,
      recommendations,
      generatedAt: new Date().toISOString(),
    };

    logger.info("📋 Relatório de sessão gerado", {
      totalEvents: statistics.totalEvents,
      violations: violations.length,
    });

    return report;
  }

  /**
   * Calculate monitoring statistics
   */
  private calcular_estatisticas(): PEODPMonitoringStats {
    const eventsByType: Record<PEODPEventType, number> = {
      "Loss of DP Reference": 0,
      "Thruster Fault": 0,
      "UPS Alarm": 0,
      "Manual Override": 0,
      "Position Drift": 0,
      "Power Failure": 0,
      "System Normal": 0,
    };

    this.eventos.forEach((evento) => {
      eventsByType[evento.evento]++;
    });

    const normalEvents = eventsByType["System Normal"];
    const totalEvents = this.eventos.length;
    const criticalEvents = totalEvents - normalEvents;

    const startTime = this.currentSession?.startTime
      ? new Date(this.currentSession.startTime).getTime()
      : Date.now();
    const endTime = this.currentSession?.endTime
      ? new Date(this.currentSession.endTime).getTime()
      : Date.now();
    const duration = Math.floor((endTime - startTime) / 1000);

    return {
      totalEvents,
      criticalEvents,
      normalEvents,
      violationRate: totalEvents > 0 ? (criticalEvents / totalEvents) * 100 : 0,
      eventsByType,
      duration,
    };
  }

  /**
   * Generate real-time recommendations
   */
  private gerar_recomendacoes_tempo_real(stats: PEODPMonitoringStats): string[] {
    const recommendations: string[] = [];

    if (stats.violationRate > 30) {
      recommendations.push(
        "🚨 Taxa de violação crítica (>30%) - Inspeção imediata do sistema DP necessária"
      );
    } else if (stats.violationRate > 15) {
      recommendations.push(
        "⚠️ Taxa de violação elevada (>15%) - Revisão dos procedimentos operacionais recomendada"
      );
    } else if (stats.violationRate > 5) {
      recommendations.push(
        "⚡ Taxa de violação moderada (>5%) - Monitoramento contínuo necessário"
      );
    } else {
      recommendations.push(
        "✅ Taxa de violação aceitável - Manter padrões operacionais atuais"
      );
    }

    // Specific event recommendations
    Object.entries(stats.eventsByType).forEach(([eventType, count]) => {
      if (eventType !== "System Normal" && count > 0) {
        if (count >= 3) {
          recommendations.push(
            `⚠️ ${count} eventos de "${eventType}" detectados - Ação corretiva prioritária`
          );
        } else if (count >= 1) {
          recommendations.push(
            `📋 ${count} evento(s) de "${eventType}" - Investigação recomendada`
          );
        }
      }
    });

    return recommendations;
  }

  /**
   * Get current session
   */
  get sessao_atual(): PEODPMonitoringSession | null {
    return this.currentSession;
  }

  /**
   * Get all events from current session
   */
  get eventos_sessao(): PEODPEvent[] {
    return [...this.eventos];
  }

  /**
   * Get violation count
   */
  get total_violacoes(): number {
    return this.violationCount;
  }

  /**
   * Set tolerance limit
   */
  set limite_tolerancia(value: number) {
    this.limiteTolerancia = value;
    logger.info(`Limite de tolerância atualizado para ${value}`);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `PEODP-${Date.now()}-${crypto.randomUUID().slice(0, 9)}`;
  }
}
