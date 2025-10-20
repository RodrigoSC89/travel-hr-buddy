/**
 * PEO-DP Compliance Engine
 * Core evaluation and decision-making engine
 */

import { logger } from "@/lib/logger";
import { PEODPRules } from "./peodp_rules";
import type { AuditResult, RuleViolation } from "./types";

export class PEODPEngine {
  private rulesEngine: PEODPRules;

  constructor() {
    this.rulesEngine = new PEODPRules();
    logger.info("PEO-DP Engine initialized");
  }

  /**
   * Execute compliance audit
   */
  executar_auditoria(
    profileName: string,
    vesselState: Record<string, unknown>
  ): AuditResult {
    logger.info(`Executing compliance audit`, {
      profile: profileName,
      vessel: vesselState.vessel_name || "Unknown"
    });

    const startTime = Date.now();

    try {
      const result = this.rulesEngine.auditProfile(profileName, vesselState);
      const recommendations = this.rulesEngine.getRecommendations(result.violations);

      const auditResult: AuditResult = {
        timestamp: new Date().toISOString(),
        profile: profileName,
        total_rules: result.compliant.length + result.violations.length,
        compliant_rules: result.compliant.length,
        non_compliant_rules: result.violations.length,
        compliance_percentage: result.compliance_percentage,
        status: result.status,
        violations: result.violations,
        recommendations
      };

      const duration = Date.now() - startTime;
      logger.info(`Audit completed in ${duration}ms`, {
        profile: profileName,
        compliance: result.compliance_percentage,
        status: result.status
      });

      this.exibir_resultado_auditoria(auditResult);

      return auditResult;
    } catch (error) {
      logger.error("Audit execution failed", error);
      throw error;
    }
  }

  /**
   * Display audit results in console
   */
  private exibir_resultado_auditoria(result: AuditResult): void {
    console.log("\n" + "═".repeat(70));
    console.log("📋 RESULTADO DA AUDITORIA PEO-DP");
    console.log("═".repeat(70));
    console.log(`📅 Data: ${new Date(result.timestamp).toLocaleString("pt-BR")}`);
    console.log(`📖 Perfil: ${result.profile}`);
    console.log("─".repeat(70));
    
    // Status indicator
    const statusEmoji = {
      green: "✅",
      yellow: "⚠️",
      red: "❌"
    };
    
    console.log(`\n${statusEmoji[result.status]} STATUS: ${result.status.toUpperCase()}`);
    console.log(`📊 Conformidade: ${result.compliance_percentage.toFixed(1)}%`);
    console.log(`✓ Regras Atendidas: ${result.compliant_rules}/${result.total_rules}`);
    console.log(`✗ Violações: ${result.non_compliant_rules}`);

    if (result.violations.length > 0) {
      console.log("\n" + "─".repeat(70));
      console.log("⚠️  VIOLAÇÕES DETECTADAS:");
      console.log("─".repeat(70));
      
      // Group violations by severity
      const critical = result.violations.filter(v => v.severity === "critical");
      const high = result.violations.filter(v => v.severity === "high");
      const medium = result.violations.filter(v => v.severity === "medium");

      if (critical.length > 0) {
        console.log("\n🔴 CRÍTICAS:");
        critical.forEach((v, i) => {
          console.log(`  ${i + 1}. [${v.rule_id}] ${v.category}`);
          console.log(`     ${v.description}`);
        });
      }

      if (high.length > 0) {
        console.log("\n🟠 ALTA PRIORIDADE:");
        high.forEach((v, i) => {
          console.log(`  ${i + 1}. [${v.rule_id}] ${v.category}`);
          console.log(`     ${v.description}`);
        });
      }

      if (medium.length > 0) {
        console.log("\n🟡 MÉDIA PRIORIDADE:");
        medium.forEach((v, i) => {
          console.log(`  ${i + 1}. [${v.rule_id}] ${v.category}`);
        });
      }
    }

    if (result.recommendations.length > 0) {
      console.log("\n" + "─".repeat(70));
      console.log("💡 RECOMENDAÇÕES:");
      console.log("─".repeat(70));
      result.recommendations.forEach(rec => {
        console.log(rec);
      });
    }

    console.log("\n" + "═".repeat(70) + "\n");
  }

  /**
   * Compare two audit results
   */
  comparar_auditorias(anterior: AuditResult, atual: AuditResult): {
    melhoria: boolean;
    diferenca_percentual: number;
    novas_violacoes: number;
    violacoes_resolvidas: number;
  } {
    const diferenca_percentual = atual.compliance_percentage - anterior.compliance_percentage;
    const melhoria = diferenca_percentual >= 0;

    const violacoes_anteriores = new Set(anterior.violations.map(v => v.rule_id));
    const violacoes_atuais = new Set(atual.violations.map(v => v.rule_id));

    const novas_violacoes = Array.from(violacoes_atuais).filter(
      id => !violacoes_anteriores.has(id)
    ).length;

    const violacoes_resolvidas = Array.from(violacoes_anteriores).filter(
      id => !violacoes_atuais.has(id)
    ).length;

    logger.info("Audit comparison completed", {
      melhoria,
      diferenca_percentual,
      novas_violacoes,
      violacoes_resolvidas
    });

    return {
      melhoria,
      diferenca_percentual,
      novas_violacoes,
      violacoes_resolvidas
    };
  }

  /**
   * Get compliance trend
   */
  analisar_tendencia(auditorias: AuditResult[]): {
    tendencia: "melhorando" | "piorando" | "estável";
    media_conformidade: number;
    variacao: number;
  } {
    if (auditorias.length < 2) {
      return {
        tendencia: "estável",
        media_conformidade: auditorias[0]?.compliance_percentage || 0,
        variacao: 0
      };
    }

    const percentuais = auditorias.map(a => a.compliance_percentage);
    const media_conformidade = percentuais.reduce((a, b) => a + b, 0) / percentuais.length;

    // Calculate linear trend
    const primeira = percentuais[0];
    const ultima = percentuais[percentuais.length - 1];
    const variacao = ultima - primeira;

    let tendencia: "melhorando" | "piorando" | "estável";
    if (variacao > 2) {
      tendencia = "melhorando";
    } else if (variacao < -2) {
      tendencia = "piorando";
    } else {
      tendencia = "estável";
    }

    return {
      tendencia,
      media_conformidade,
      variacao
    };
  }

  /**
   * Generate action priority list
   */
  gerar_plano_acao(violations: RuleViolation[]): Array<{
    prioridade: number;
    violacao: RuleViolation;
    prazo_sugerido: string;
  }> {
    const priorityMap = {
      critical: 1,
      high: 2,
      medium: 3,
      low: 4
    };

    const prazoMap = {
      critical: "Imediato (< 24h)",
      high: "Curto prazo (< 7 dias)",
      medium: "Médio prazo (< 30 dias)",
      low: "Longo prazo (< 90 dias)"
    };

    const plano = violations
      .map(v => ({
        prioridade: priorityMap[v.severity],
        violacao: v,
        prazo_sugerido: prazoMap[v.severity]
      }))
      .sort((a, b) => a.prioridade - b.prioridade);

    logger.info(`Action plan generated with ${plano.length} items`);

    return plano;
  }

  /**
   * Get rules engine instance
   */
  getRulesEngine(): PEODPRules {
    return this.rulesEngine;
  }
}
