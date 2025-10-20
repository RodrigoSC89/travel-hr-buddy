/**
 * PEO-DP Core Module
 * Main orchestration and menu system for PEO-DP Intelligent System
 */

import { logger } from "@/lib/logger";
import { PEODPEngine } from "./peodp_engine";
import { PEORealTime } from "./peodp_realtime";
import { PEODPReport } from "./peodp_report";
import type { AuditResult, MonitoringSession } from "./types";

export class PEOdpCore {
  private engine: PEODPEngine;
  private realtime: PEORealTime;
  private report: PEODPReport;
  private auditorias: AuditResult[];
  private sessoes: MonitoringSession[];

  constructor() {
    this.engine = new PEODPEngine();
    this.realtime = new PEORealTime();
    this.report = new PEODPReport();
    this.auditorias = [];
    this.sessoes = [];
    
    logger.info("PEO-DP Core initialized");
    this.exibirBanner();
  }

  /**
   * Display system banner
   */
  private exibirBanner(): void {
    console.log("\n" + "═".repeat(70));
    console.log("    🧭 PEO-DP INTELIGENTE - Sistema de Conformidade DP");
    console.log("    Versão 2.0 - Monitoramento em Tempo Real");
    console.log("═".repeat(70) + "\n");
  }

  /**
   * Display main menu
   */
  menu(): void {
    console.log("🧭 PEO-DP Inteligente – Escolha o modo de operação:\n");
    console.log("1. 🧩 Auditoria Manual");
    console.log("2. 📡 Monitoramento Vivo (tempo real)");
    console.log("3. 📊 Relatórios e Análises");
    console.log("4. ⚙️  Configurações");
    console.log("5. ❌ Sair\n");
  }

  /**
   * Start manual audit
   */
  iniciar_auditoria(
    profileName: string = "NORMAM-101",
    vesselState?: Record<string, unknown>
  ): AuditResult {
    logger.info("Starting manual audit", {
      profile: profileName
    });

    console.log("\n🧩 Iniciando Auditoria Manual...\n");

    const defaultVesselState = {
      vessel_name: "PSV Atlantic Explorer",
      dp_class: "DP2",
      thrusters_operational: 4,
      generators_operational: 3,
      position_references: 3,
      dpo_certified: true,
      fmea_updated: true,
      annual_trials_completed: false,
      ...vesselState
    };

    const result = this.engine.executar_auditoria(profileName, defaultVesselState);
    this.auditorias.push(result);

    return result;
  }

  /**
   * Start real-time monitoring
   */
  iniciar_monitoramento_tempo_real(
    vesselName: string = "PSV Atlantic Explorer",
    duracao_segundos?: number
  ): void {
    logger.info("Starting real-time monitoring", {
      vessel: vesselName,
      duration: duracao_segundos
    });

    this.realtime.iniciar_monitoramento(vesselName);

    if (duracao_segundos) {
      // Run for specified duration
      const ciclos = Math.floor(duracao_segundos / 3);
      for (let i = 0; i < ciclos; i++) {
        this.realtime.executar_ciclo_monitoramento();
      }
      this.parar_monitoramento();
    }
  }

  /**
   * Execute single monitoring cycle
   */
  executar_ciclo(): void {
    this.realtime.executar_ciclo_monitoramento();
  }

  /**
   * Stop monitoring and generate report
   */
  parar_monitoramento(): MonitoringSession | null {
    this.realtime.parar_monitoramento();
    
    const session = this.realtime.getSession();
    if (session) {
      this.sessoes.push(session);
      this.report.gerar_relatorio_sessao(session);
      return session;
    }

    return null;
  }

  /**
   * Show reports menu
   */
  menu_relatorios(): void {
    console.log("\n📊 Relatórios e Análises\n");
    console.log("1. 📈 Relatório de Sessão de Monitoramento");
    console.log("2. 📋 Comparação de Auditorias");
    console.log("3. 📊 Sumário Executivo");
    console.log("4. 📤 Exportar Dados (JSON)");
    console.log("5. ⬅️  Voltar\n");
  }

  /**
   * Generate session report
   */
  gerar_relatorio_sessao(sessionId?: string): void {
    let session: MonitoringSession | null = null;

    if (sessionId) {
      session = this.sessoes.find(s => s.id === sessionId) || null;
    } else {
      session = this.sessoes[this.sessoes.length - 1] || null;
    }

    if (!session) {
      console.log("❌ Nenhuma sessão de monitoramento disponível");
      logger.warn("No monitoring sessions available");
      return;
    }

    this.report.gerar_relatorio_sessao(session);
  }

  /**
   * Generate audit comparison report
   */
  gerar_relatorio_comparacao(): void {
    if (this.auditorias.length < 2) {
      console.log("❌ São necessárias pelo menos 2 auditorias para comparação");
      logger.warn("Not enough audits for comparison");
      return;
    }

    this.report.gerar_relatorio_comparacao(this.auditorias);
  }

  /**
   * Generate executive summary
   */
  gerar_sumario_executivo(): void {
    this.report.gerar_sumario_executivo(this.auditorias, this.sessoes);
  }

  /**
   * Configuration menu
   */
  menu_configuracoes(): void {
    console.log("\n⚙️  Configurações\n");
    console.log("1. 🔧 Ajustar Limite de Tolerância");
    console.log("2. 📋 Listar Perfis de Conformidade");
    console.log("3. 🚢 Configurar Embarcação");
    console.log("4. ⬅️  Voltar\n");
  }

  /**
   * Set tolerance limit
   */
  configurar_tolerancia(limite: number): void {
    this.realtime.setToleranceLimit(limite);
    console.log(`✅ Limite de tolerância ajustado para ${limite} eventos`);
    logger.info(`Tolerance limit set to ${limite}`);
  }

  /**
   * List available compliance profiles
   */
  listar_perfis(): void {
    const profiles = this.engine.getRulesEngine().getAllProfiles();
    
    console.log("\n📋 Perfis de Conformidade Disponíveis:\n");
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.profile_name}`);
      console.log(`   Autoridade: ${profile.authority}`);
      console.log(`   Versão: ${profile.version}`);
      console.log(`   Regras: ${profile.rules.length}`);
      console.log(`   ${profile.description}\n`);
    });
  }

  /**
   * Get monitoring statistics
   */
  obter_estatisticas(): void {
    const stats = this.realtime.getEstatisticas();
    
    console.log("\n📊 Estatísticas de Monitoramento:\n");
    console.log(`   Total de Eventos: ${stats.total}`);
    console.log(`   Eventos Críticos: ${stats.criticos}`);
    console.log(`   Eventos Normais: ${stats.normais}`);
    console.log("\n   Distribuição por Tipo:");
    
    Object.entries(stats.por_tipo).forEach(([tipo, count]) => {
      const percentage = ((count / stats.total) * 100).toFixed(1);
      console.log(`      ${tipo}: ${count} (${percentage}%)`);
    });
    
    console.log("");
  }

  /**
   * Get all audits
   */
  getAuditorias(): AuditResult[] {
    return [...this.auditorias];
  }

  /**
   * Get all monitoring sessions
   */
  getSessoes(): MonitoringSession[] {
    return [...this.sessoes];
  }

  /**
   * Get engine instance
   */
  getEngine(): PEODPEngine {
    return this.engine;
  }

  /**
   * Get realtime instance
   */
  getRealtime(): PEORealTime {
    return this.realtime;
  }

  /**
   * Get report instance
   */
  getReport(): PEODPReport {
    return this.report;
  }

  /**
   * Demo mode - runs a complete workflow
   */
  executar_demo(): void {
    console.log("\n🎬 Executando demonstração completa do PEO-DP...\n");
    
    // Step 1: Manual audit
    console.log("📍 Passo 1: Executando auditoria manual...");
    this.iniciar_auditoria("NORMAM-101");
    
    // Step 2: Real-time monitoring
    console.log("\n📍 Passo 2: Iniciando monitoramento em tempo real...");
    this.iniciar_monitoramento_tempo_real("PSV Atlantic Explorer", 15);
    
    // Step 3: Generate reports
    console.log("\n📍 Passo 3: Gerando relatórios...");
    this.gerar_sumario_executivo();
    
    console.log("\n✅ Demonstração concluída!\n");
  }
}
