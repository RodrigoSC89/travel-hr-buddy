/**
 * PEO-DP Report Generator
 * Generates comprehensive compliance and monitoring reports
 */

import { logger } from "@/lib/logger";
import type { AuditResult, ReportData, DPEvent, MonitoringSession } from "./types";

export class PEODPReport {
  constructor() {
    logger.info("PEO-DP Report Generator initialized");
  }

  /**
   * Generate monitoring session report
   */
  gerar_relatorio_sessao(session: MonitoringSession): ReportData {
    logger.info("Generating session report", {
      session_id: session.id,
      vessel: session.vessel.name
    });

    const eventCounts = this.contarEventosPorTipo(session.events);
    const criticalEvents = session.events.filter(e => e.evento !== "System Normal");
    
    const total_events = session.events.length;
    const normal_events = eventCounts["System Normal"] || 0;
    const compliance_score = total_events > 0 
      ? (normal_events / total_events) * 100 
      : 100;

    const report: ReportData = {
      session_id: session.id,
      vessel_name: session.vessel.name,
      report_date: new Date().toISOString(),
      total_events: total_events,
      critical_events: criticalEvents.length,
      compliance_score: Math.round(compliance_score * 10) / 10,
      recommendations: this.gerarRecomendacoes(session.events),
      events_summary: eventCounts
    };

    this.exibirRelatorio(report, session);

    return report;
  }

  /**
   * Count events by type
   */
  private contarEventosPorTipo(events: DPEvent[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    events.forEach(event => {
      const tipo = event.evento;
      counts[tipo] = (counts[tipo] || 0) + 1;
    });

    return counts;
  }

  /**
   * Generate recommendations based on events
   */
  private gerarRecomendacoes(events: DPEvent[]): string[] {
    const recommendations: string[] = [];
    const eventCounts = this.contarEventosPorTipo(events);

    // Check for recurring issues
    Object.entries(eventCounts).forEach(([tipo, count]) => {
      if (tipo === "System Normal") return;

      if (count >= 3) {
        recommendations.push(
          `⚠️ ${tipo}: Detectado ${count}x - Investigar causa raiz e implementar ação preventiva`
        );
      }
    });

    // Check for critical patterns
    const lossOfReference = eventCounts["Loss of DP Reference"] || 0;
    const thrusterFaults = eventCounts["Thruster Fault"] || 0;
    const upsAlarms = eventCounts["UPS Alarm"] || 0;

    if (lossOfReference > 0) {
      recommendations.push(
        "🔧 Realizar calibração completa dos sensores de posição (GPS/DGNSS)"
      );
    }

    if (thrusterFaults > 1) {
      recommendations.push(
        "🔧 Agendar manutenção preventiva nos propulsores e sistema hidráulico"
      );
    }

    if (upsAlarms > 0) {
      recommendations.push(
        "🔋 Testar autonomia do UPS e substituir baterias se necessário"
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "✅ Sistema operando conforme esperado. Manter rotina de monitoramento."
      );
    }

    return recommendations;
  }

  /**
   * Display report in console
   */
  private exibirRelatorio(report: ReportData, session: MonitoringSession): void {
    console.log("\n" + "═".repeat(70));
    console.log("📊 RELATÓRIO DE MONITORAMENTO PEO-DP");
    console.log("═".repeat(70));
    console.log(`🚢 Embarcação: ${report.vessel_name}`);
    console.log(`🆔 Session ID: ${report.session_id}`);
    console.log(`📅 Data: ${new Date(report.report_date).toLocaleString("pt-BR")}`);
    console.log(`⏱️  Início: ${new Date(session.start_time).toLocaleString("pt-BR")}`);
    console.log(`🔧 Classe DP: ${session.vessel.dp_class}`);
    console.log("─".repeat(70));

    // Statistics
    console.log("\n📈 ESTATÍSTICAS:");
    console.log(`   Total de Eventos: ${report.total_events}`);
    console.log(`   Eventos Críticos: ${report.critical_events}`);
    console.log(`   Score de Conformidade: ${report.compliance_score}%`);

    // Status indicator
    let statusIcon = "✅";
    let statusText = "EXCELENTE";
    if (report.compliance_score < 70) {
      statusIcon = "❌";
      statusText = "CRÍTICO";
    } else if (report.compliance_score < 90) {
      statusIcon = "⚠️";
      statusText = "ATENÇÃO";
    }
    console.log(`   ${statusIcon} Status: ${statusText}`);

    // Event breakdown
    console.log("\n📋 DISTRIBUIÇÃO DE EVENTOS:");
    Object.entries(report.events_summary)
      .sort((a, b) => b[1] - a[1])
      .forEach(([tipo, count]) => {
        const percentage = ((count / report.total_events) * 100).toFixed(1);
        const icon = tipo === "System Normal" ? "✅" : "⚠️";
        console.log(`   ${icon} ${tipo}: ${count} (${percentage}%)`);
      });

    // Recommendations
    if (report.recommendations.length > 0) {
      console.log("\n💡 RECOMENDAÇÕES:");
      report.recommendations.forEach(rec => {
        console.log(`   ${rec}`);
      });
    }

    console.log("\n" + "═".repeat(70) + "\n");
  }

  /**
   * Generate audit comparison report
   */
  gerar_relatorio_comparacao(audits: AuditResult[]): void {
    if (audits.length < 2) {
      logger.warn("Need at least 2 audits for comparison");
      return;
    }

    console.log("\n" + "═".repeat(70));
    console.log("📊 RELATÓRIO COMPARATIVO DE AUDITORIAS");
    console.log("═".repeat(70));

    audits.forEach((audit, index) => {
      console.log(`\n${index + 1}. ${audit.profile} - ${new Date(audit.timestamp).toLocaleDateString("pt-BR")}`);
      console.log(`   Conformidade: ${audit.compliance_percentage.toFixed(1)}%`);
      console.log(`   Status: ${audit.status.toUpperCase()}`);
      console.log(`   Violações: ${audit.non_compliant_rules}`);
    });

    // Calculate trend
    const first = audits[0].compliance_percentage;
    const last = audits[audits.length - 1].compliance_percentage;
    const change = last - first;
    const changeIcon = change > 0 ? "📈" : change < 0 ? "📉" : "➡️";

    console.log("\n" + "─".repeat(70));
    console.log(`${changeIcon} TENDÊNCIA: ${change > 0 ? "Melhorando" : change < 0 ? "Piorando" : "Estável"}`);
    console.log(`   Variação: ${change > 0 ? "+" : ""}${change.toFixed(1)}%`);
    console.log("═".repeat(70) + "\n");

    logger.info("Comparison report generated", {
      audits_count: audits.length,
      trend: change > 0 ? "improving" : change < 0 ? "declining" : "stable"
    });
  }

  /**
   * Export report to JSON
   */
  exportar_json(report: ReportData): string {
    const json = JSON.stringify(report, null, 2);
    logger.info("Report exported to JSON", {
      session_id: report.session_id,
      size: json.length
    });
    return json;
  }

  /**
   * Generate executive summary
   */
  gerar_sumario_executivo(
    audits: AuditResult[],
    sessions: MonitoringSession[]
  ): void {
    console.log("\n" + "═".repeat(70));
    console.log("📊 SUMÁRIO EXECUTIVO - PEO-DP");
    console.log("═".repeat(70));

    // Audit summary
    if (audits.length > 0) {
      const avgCompliance = audits.reduce((sum, a) => sum + a.compliance_percentage, 0) / audits.length;
      const latestAudit = audits[audits.length - 1];

      console.log("\n📋 AUDITORIAS:");
      console.log(`   Total de Auditorias: ${audits.length}`);
      console.log(`   Conformidade Média: ${avgCompliance.toFixed(1)}%`);
      console.log(`   Última Auditoria: ${new Date(latestAudit.timestamp).toLocaleDateString("pt-BR")}`);
      console.log(`   Status Atual: ${latestAudit.status.toUpperCase()}`);
    }

    // Monitoring summary
    if (sessions.length > 0) {
      const totalEvents = sessions.reduce((sum, s) => sum + s.events.length, 0);
      const activeSessions = sessions.filter(s => s.active).length;

      console.log("\n📡 MONITORAMENTO:");
      console.log(`   Sessões de Monitoramento: ${sessions.length}`);
      console.log(`   Sessões Ativas: ${activeSessions}`);
      console.log(`   Total de Eventos: ${totalEvents}`);
    }

    console.log("\n" + "═".repeat(70) + "\n");

    logger.info("Executive summary generated", {
      audits_count: audits.length,
      sessions_count: sessions.length
    });
  }
}
