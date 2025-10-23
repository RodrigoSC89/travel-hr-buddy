/**
 * PEO-DP Engine
 * Motor de inferência que cruza logs DP, FMEA, ASOG e tarefas MMI
 */

import type { PEODPProfile, PEODPAuditoria, PEODPResultadoItem } from "@/types/peodp-audit";
import normam101Data from "./peodp_profiles/normam_101.json";
import imcaM117Data from "./peodp_profiles/imca_m117.json";

export class PEOEngine {
  private normam: PEODPProfile;
  private imca: PEODPProfile;

  constructor() {
    // @ts-expect-error - PATCH 66.0: JSON profiles need proper typing
    this.normam = normam101Data as PEODPProfile;
    // @ts-expect-error - PATCH 66.0: JSON profiles need proper typing
    this.imca = imcaM117Data as PEODPProfile;
  }

  /**
   * Executa auditoria PEO-DP completa
   */
  async executarAuditoria(vesselName?: string, dpClass?: string): Promise<PEODPAuditoria> {
    const auditoria: PEODPAuditoria = {
      data: new Date().toISOString(),
      resultado: [],
      score: 0,
      vesselName,
      dpClass,
      normas: [this.normam.versao, `${this.imca.versao} - ${this.imca.name}`],
    };

    // Verificar requisitos NORMAM-101
    for (const item of this.normam.requisitos) {
      const cumprimento = await this.verificar(item.descricao);
      auditoria.resultado.push({
        item: item.id,
        descricao: item.descricao,
        cumprimento,
      });
    }

    // Verificar requisitos IMCA M117
    for (const item of this.imca.requisitos) {
      const cumprimento = await this.verificar(item.descricao);
      auditoria.resultado.push({
        item: item.id,
        descricao: item.descricao,
        cumprimento,
      });
    }

    // Calcular score geral
    auditoria.score = this.calcularScore(auditoria.resultado);

    return auditoria;
  }

  /**
   * Verifica cumprimento de um requisito específico
   * Em produção, esta função consultaria bancos de dados, logs DP, FMEA, etc.
   */
  private async verificar(descricao: string): Promise<"OK" | "N/A" | "Não Conforme" | "Pendente"> {
    // Lógica placeholder: em produção, consulta bancos e logs DP
    // Aqui simulamos uma verificação baseada em palavras-chave
    
    if (descricao.includes("DP")) {
      return "OK";
    }
    
    if (descricao.includes("certificado") || descricao.includes("certificação")) {
      return "OK";
    }
    
    if (descricao.includes("Registro") || descricao.includes("Relatórios")) {
      return "OK";
    }
    
    if (descricao.includes("Tripulação") || descricao.includes("DPO")) {
      return "OK";
    }
    
    if (descricao.includes("Plano de manutenção") || descricao.includes("Treinamento")) {
      return "OK";
    }
    
    return "N/A";
  }

  /**
   * Calcula score de conformidade (0-100)
   */
  private calcularScore(resultado: PEODPResultadoItem[]): number {
    const total = resultado.length;
    if (total === 0) return 0;

    const ok = resultado.filter((r) => r.cumprimento === "OK").length;
    const parcial = resultado.filter((r) => r.cumprimento === "Pendente").length;
    
    // OK = 1 ponto, Pendente = 0.5 pontos, resto = 0
    const pontos = ok + (parcial * 0.5);
    
    return Math.round((pontos / total) * 100 * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Gera recomendações baseadas nos resultados
   */
  gerarRecomendacoes(auditoria: PEODPAuditoria): string[] {
    const recomendacoes: string[] = [];

    const naoConformes = auditoria.resultado.filter((r) => r.cumprimento === "Não Conforme");
    const pendentes = auditoria.resultado.filter((r) => r.cumprimento === "Pendente");

    if (naoConformes.length > 0) {
      recomendacoes.push(
        `⚠️ ${naoConformes.length} itens em não conformidade requerem ação imediata`
      );
    }

    if (pendentes.length > 0) {
      recomendacoes.push(
        `⏳ ${pendentes.length} itens pendentes precisam de verificação adicional`
      );
    }

    if (auditoria.score < 60) {
      recomendacoes.push("🚨 Score crítico - auditoria completa e ações corretivas urgentes necessárias");
    } else if (auditoria.score < 75) {
      recomendacoes.push("⚠️ Score baixo - revisão dos processos DP recomendada");
    } else if (auditoria.score < 90) {
      recomendacoes.push("✅ Score aceitável - melhorias incrementais sugeridas");
    } else {
      recomendacoes.push("🌟 Excelente conformidade - manter padrões atuais");
    }

    return recomendacoes;
  }
}
