/**
 * PEO-DP Core
 * Núcleo do PEO-DP Inteligente
 * Executa auditoria de conformidade DP baseada em NORMAM-101 e IMCA M 117
 */

import { PEOEngine } from "./peodp_engine";
import { PEOReport } from "./peodp_report";
import { logger } from "@/lib/logger";
import type { PEODPAuditoria } from "@/types/peodp-audit";

export interface PEODPCoreOptions {
  vesselName?: string;
  dpClass?: string;
  autoDownload?: boolean;
  format?: "pdf" | "markdown" | "both";
}

export class PEOdpCore {
  private engine: PEOEngine;
  private report: PEOReport;

  constructor() {
    this.engine = new PEOEngine();
    this.report = new PEOReport();
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
}

// Export singleton instance for easy access
export const peodpCore = new PEOdpCore();
