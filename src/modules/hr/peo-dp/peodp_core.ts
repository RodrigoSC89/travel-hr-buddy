/**
 * PEO-DP Core
 * Núcleo do PEO-DP Inteligente
 * Executa auditoria de conformidade DP baseada em NORMAM-101 e IMCA M 117
 * Phase 2: Real-time monitoring and workflow integration
 */

import { PEOEngine } from "./peodp_engine";
import { PEOReport } from "./peodp_report";
import { PEORealTime } from "./peodp_realtime";
import { PEOWorkflow } from "./peodp_workflow";
import { logger } from "@/lib/logger";
import type { PEODPAuditoria } from "@/types/peodp-audit";
import type {
  PEODPMonitoringSession,
  PEODPSessionReport,
  PEODPComparisonReport,
  PEODPExecutiveSummary,
  PEODPEvent,
} from "./types";

export interface PEODPCoreOptions {
  vesselName?: string;
  dpClass?: string;
  autoDownload?: boolean;
  format?: "pdf" | "markdown" | "both";
}

export class PEOdpCore {
  private engine: PEOEngine;
  private report: PEOReport;
  private realtime: PEORealTime;
  private workflow: PEOWorkflow;
  private sessions: PEODPMonitoringSession[] = [];

  constructor() {
    this.engine = new PEOEngine();
    this.report = new PEOReport();
    this.realtime = new PEORealTime();
    this.workflow = new PEOWorkflow();
  }

  /**
   * Inicia auditoria PEO-DP completa
   */
  async iniciarAuditoria(options: PEODPCoreOptions = {}): Promise<PEODPAuditoria> {
    try {
      logger.info("🧭 Iniciando auditoria PEO-DP (NORMAM-101 + IMCA M 117)...", {
        vessel: options.vesselName,
        dpClass: options.dpClass,
      });

      // Executar auditoria
      const resultado = await this.engine.executarAuditoria(
        options.vesselName,
        options.dpClass
      );

      // Gerar recomendações
      const recomendacoes = this.engine.gerarRecomendacoes(resultado);

      logger.info("✅ Auditoria PEO-DP executada com sucesso", {
        score: resultado.score,
        totalItens: resultado.resultado.length,
      });

      // Auto-download se solicitado
      if (options.autoDownload) {
        this.downloadReports(resultado, recomendacoes, options.format || "pdf");
      }

      return resultado;
    } catch (error) {
      logger.error("Erro ao executar auditoria PEO-DP", error);
      throw error;
    }
  }

  /**
   * Gera e faz download dos relatórios
   */
  downloadReports(
    auditoria: PEODPAuditoria,
    recomendacoes: string[],
    format: "pdf" | "markdown" | "both" = "pdf"
  ): void {
    try {
      if (format === "pdf" || format === "both") {
        this.report.downloadRelatorio(auditoria, recomendacoes);
        logger.info("📄 Relatório PDF gerado e baixado");
      }

      if (format === "markdown" || format === "both") {
        const markdown = this.report.gerarMarkdown(auditoria, recomendacoes);
        this.downloadMarkdown(markdown, auditoria.vesselName);
        logger.info("📝 Relatório Markdown gerado e baixado");
      }
    } catch (error) {
      logger.error("Erro ao gerar relatórios", error);
      throw error;
    }
  }

  /**
   * Helper para download de arquivo Markdown
   */
  private downloadMarkdown(content: string, vesselName?: string): void {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PEO_DP_Auditoria_${vesselName || "Report"}_${
      new Date().toISOString().split("T")[0]
    }.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Gera preview do relatório PDF
   */
  async gerarPreview(auditoria: PEODPAuditoria, recomendacoes?: string[]): Promise<string> {
    return this.report.gerarPreview(auditoria, recomendacoes);
  }

  /**
   * Gera relatório em formato Markdown
   */
  gerarMarkdown(auditoria: PEODPAuditoria, recomendacoes?: string[]): string {
    return this.report.gerarMarkdown(auditoria, recomendacoes);
  }

  // ========================================
  // Phase 2: Real-time Monitoring Features
  // ========================================

  /**
   * Start real-time monitoring for a vessel
   */
  iniciar_monitoramento_tempo_real(vesselName: string, duration?: number): string {
    logger.info("🚀 Iniciando monitoramento em tempo real", {
      vessel: vesselName,
      duration,
    });

    const sessionId = this.realtime.iniciar_monitoramento(vesselName, duration);

    logger.info("✅ Sessão de monitoramento iniciada", { sessionId });

    return sessionId;
  }

  /**
   * Execute a monitoring cycle
   */
  executar_ciclo(): PEODPEvent | null {
    const evento = this.realtime.executar_ciclo();

    // Trigger workflow action if needed
    if (evento && evento.evento !== "System Normal") {
      this.workflow.acionar_acao(evento);
    }

    return evento;
  }

  /**
   * Start continuous monitoring loop
   */
  iniciar_loop_continuo(intervalSeconds: number = 3): void {
    this.realtime.iniciar_loop_continuo(intervalSeconds);
  }

  /**
   * Stop monitoring and generate report
   */
  parar_monitoramento(): PEODPSessionReport | null {
    const report = this.realtime.parar_monitoramento();

    if (report && report.session) {
      this.sessions.push(report.session);
    }

    return report;
  }

  /**
   * Generate session report
   */
  gerar_relatorio_sessao(): PEODPSessionReport | null {
    return this.realtime.gerar_relatorio_sessao();
  }

  /**
   * Generate comparison report between sessions
   */
  gerar_relatorio_comparacao(): PEODPComparisonReport {
    const sessions = this.sessions.slice(-5); // Last 5 sessions

    // Calculate trends
    let violationTrend: "Improving" | "Stable" | "Worsening" = "Stable";
    let eventTrend: "Decreasing" | "Stable" | "Increasing" = "Stable";

    if (sessions.length >= 2) {
      const recent = sessions.slice(-2);
      const oldViolations = recent[0].violations;
      const newViolations = recent[1].violations;
      const oldEvents = recent[0].eventos.length;
      const newEvents = recent[1].eventos.length;

      if (newViolations < oldViolations * 0.8) {
        violationTrend = "Improving";
      } else if (newViolations > oldViolations * 1.2) {
        violationTrend = "Worsening";
      }

      if (newEvents < oldEvents * 0.8) {
        eventTrend = "Decreasing";
      } else if (newEvents > oldEvents * 1.2) {
        eventTrend = "Increasing";
      }
    }

    const insights: string[] = [];

    if (violationTrend === "Improving") {
      insights.push("✅ Tendência positiva: Redução de violações detectada");
    } else if (violationTrend === "Worsening") {
      insights.push("⚠️ Tendência negativa: Aumento de violações requer atenção");
    }

    if (eventTrend === "Increasing") {
      insights.push("📈 Aumento na frequência de eventos - Investigar causas");
    } else if (eventTrend === "Decreasing") {
      insights.push("📉 Redução na frequência de eventos - Bom desempenho");
    }

    return {
      sessions,
      trends: {
        violationTrend,
        eventTrend,
      },
      insights,
      generatedAt: new Date().toISOString(),
    });
  }

  /**
   * Generate executive summary
   */
  gerar_sumario_executivo(): PEODPExecutiveSummary {
    const sessions = this.sessions;

    if (sessions.length === 0) {
      logger.warn("Nenhuma sessão disponível para sumário executivo");
      return {
        vesselName: "N/A",
        period: {
          start: new Date().toISOString(),
          end: new Date().toISOString(),
        },
        overallScore: 0,
        totalEvents: 0,
        criticalIncidents: 0,
        complianceStatus: "Critical",
        keyFindings: ["Nenhuma sessão de monitoramento disponível"],
        recommendations: ["Iniciar monitoramento em tempo real"],
        generatedAt: new Date().toISOString(),
      });
    }

    const vesselName = sessions[0].vesselName;
    const startTime = sessions[0].startTime;
    const endTime = sessions[sessions.length - 1].endTime || new Date().toISOString();

    let totalEvents = 0;
    let criticalIncidents = 0;

    sessions.forEach((session) => {
      totalEvents += session.eventos.length;
      criticalIncidents += session.violations;
    });

    const violationRate = totalEvents > 0 ? (criticalIncidents / totalEvents) * 100 : 0;
    const overallScore = Math.max(0, 100 - violationRate);

    let complianceStatus: "Excellent" | "Good" | "Acceptable" | "Critical" = "Acceptable";
    if (overallScore >= 90) complianceStatus = "Excellent";
    else if (overallScore >= 75) complianceStatus = "Good";
    else if (overallScore < 60) complianceStatus = "Critical";

    const keyFindings: string[] = [
      `${sessions.length} sessões de monitoramento completadas`,
      `${totalEvents} eventos totais registrados`,
      `${criticalIncidents} incidentes críticos detectados`,
      `Taxa de violação: ${violationRate.toFixed(2)}%`,
    ];

    const recommendations: string[] = [];
    if (complianceStatus === "Critical") {
      recommendations.push("🚨 Status crítico - Auditoria completa necessária");
      recommendations.push("⚠️ Implementar ações corretivas imediatas");
    } else if (complianceStatus === "Acceptable") {
      recommendations.push("⚡ Melhorar procedimentos operacionais");
      recommendations.push("📋 Revisar treinamento da equipe DP");
    } else {
      recommendations.push("✅ Manter padrões atuais de excelência");
      recommendations.push("📊 Continuar monitoramento regular");
    }

    return {
      vesselName,
      period: {
        start: startTime,
        end: endTime,
      },
      overallScore,
      totalEvents,
      criticalIncidents,
      complianceStatus,
      keyFindings,
      recommendations,
      generatedAt: new Date().toISOString(),
    });
  }

  /**
   * Run complete demonstration workflow
   */
  executar_demo(): void {
    logger.info("🎬 Executando demonstração completa do PEO-DP...");

    // 1. Run compliance audit
    logger.info("\n📋 Etapa 1: Auditoria de Conformidade");
    this.iniciarAuditoria({
      vesselName: "PSV Atlantic Explorer",
      dpClass: "DP2",
    }).then((auditoria) => {
      logger.info(`Compliance Score: ${auditoria.score}%`);

      // 2. Start real-time monitoring
      logger.info("\n📡 Etapa 2: Monitoramento em Tempo Real (30 segundos)");
      this.iniciar_monitoramento_tempo_real("PSV Atlantic Explorer", 30);

      // Simulate some cycles
      const intervalId = setInterval(() => {
        this.executar_ciclo();
      }, 3000);

      // Stop after 30 seconds
      setTimeout(() => {
        clearInterval(intervalId);
        const report = this.parar_monitoramento();

        if (report) {
          logger.info("\n📊 Etapa 3: Relatório de Sessão");
          logger.info(
            `Total de Eventos: ${report.statistics.totalEvents}, Violações: ${report.violations.length}`
          );
        }

        // 3. Generate executive summary
        logger.info("\n📈 Etapa 4: Sumário Executivo");
        const summary = this.gerar_sumario_executivo();
        logger.info(`Status: ${summary.complianceStatus}, Score: ${summary.overallScore}`);

        logger.info("\n✅ Demonstração concluída!");
      }, 30000);
    });
  }

  /**
   * Get current monitoring session
   */
  get sessao_atual(): PEODPMonitoringSession | null {
    return this.realtime.sessao_atual;
  }

  /**
   * Get all completed sessions
   */
  get todas_sessoes(): PEODPMonitoringSession[] {
    return [...this.sessions];
  }

  /**
   * Get workflow instance for direct access
   */
  get workflowManager(): PEOWorkflow {
    return this.workflow;
  }
}

// Export singleton instance for easy access
export const peodpCore = new PEOdpCore();
