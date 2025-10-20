/**
 * ASOG Review Service
 * Sistema Nautilus One - Module #33/33
 * 
 * Service responsible for auditing vessel operational conditions
 * and verifying adherence to Activity Specific Operating Guidelines (ASOG).
 */

import { logger } from "@/lib/logger";
import type { ASOGLimits, OperationalData, ValidationResult, ASOGReport } from "./types";

/**
 * ASOG Review Service Class
 * Singleton service for ASOG validation operations
 */
export class ASOGService {
  private static instance: ASOGService;
  private asogLimits: ASOGLimits;
  private statusAtual: OperationalData | null;

  private constructor() {
    // Initialize ASOG limits
    this.asogLimits = {
      wind_speed_max: 35, // knots
      thruster_loss_tolerance: 1, // units
      dp_alert_level: "Green",
    };
    this.statusAtual = null;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ASOGService {
    if (!ASOGService.instance) {
      ASOGService.instance = new ASOGService();
    }
    return ASOGService.instance;
  }

  /**
   * Get current ASOG limits
   */
  public getASOGLimits(): ASOGLimits {
    return { ...this.asogLimits };
  }

  /**
   * Update ASOG limits (for configuration purposes)
   */
  public updateASOGLimits(limits: Partial<ASOGLimits>): void {
    this.asogLimits = {
      ...this.asogLimits,
      ...limits,
    };
    logger.info("ASOG limits updated", { limits: this.asogLimits });
  }

  /**
   * Collect operational data
   * In production, this would integrate with real vessel sensors/APIs
   */
  private coletarDadosOperacionais(): OperationalData {
    logger.info("Coletando parâmetros operacionais DP e ambientais...");
    
    // Simulation of data collection (replace with real APIs in production)
    const dados: OperationalData = {
      wind_speed: Math.floor(Math.random() * 50), // Random 0-50 knots for demo
      thrusters_operacionais: Math.floor(Math.random() * 4) + 1, // Random 1-4 operational
      dp_status: ["Green", "Yellow", "Red"][Math.floor(Math.random() * 3)] as OperationalData["dp_status"],
      timestamp: new Date().toISOString(),
    };

    this.statusAtual = dados;
    logger.info("Dados coletados", { dados });
    
    return dados;
  }

  /**
   * Validate operational data against ASOG guidelines
   */
  private validarASOG(dados: OperationalData): ValidationResult {
    logger.info("Validando aderência ao ASOG...");
    
    const resultado: ValidationResult = {
      conformidade: true,
      alertas: [],
    };

    // Check wind speed
    if (dados.wind_speed > this.asogLimits.wind_speed_max) {
      resultado.conformidade = false;
      resultado.alertas.push("⚠️ Velocidade do vento acima do limite ASOG.");
    }

    // Check thruster loss
    const thrusters_perdidos = 4 - dados.thrusters_operacionais;
    if (thrusters_perdidos > this.asogLimits.thruster_loss_tolerance) {
      resultado.conformidade = false;
      resultado.alertas.push("⚠️ Número de thrusters inoperantes excede limite ASOG.");
    }

    // Check DP status
    if (dados.dp_status !== this.asogLimits.dp_alert_level) {
      resultado.conformidade = false;
      resultado.alertas.push("⚠️ Sistema DP fora do nível de alerta ASOG.");
    }

    if (resultado.conformidade) {
      logger.info("Status: CONFORME ao ASOG ✅");
    } else {
      logger.warn("Status: NÃO CONFORME ❌", { alertas: resultado.alertas });
    }

    return resultado;
  }

  /**
   * Generate ASOG review report
   */
  private gerarRelatorio(dados: OperationalData, resultado: ValidationResult): ASOGReport {
    logger.info("Gerando relatório ASOG Review...");
    
    const relatorio: ASOGReport = {
      timestamp: new Date().toISOString(),
      dados_operacionais: dados,
      resultado: resultado,
    };

    logger.info("Relatório ASOG gerado com sucesso.");
    
    return relatorio;
  }

  /**
   * Start ASOG review process
   * Main entry point for the review
   */
  public start(): { dados: OperationalData; resultado: ValidationResult; relatorio: ASOGReport } {
    logger.info("🧭 Iniciando ASOG Review...");
    
    try {
      // Collect operational data
      const dados = this.coletarDadosOperacionais();
      
      // Validate against ASOG
      const resultado = this.validarASOG(dados);
      
      // Generate report
      const relatorio = this.gerarRelatorio(dados, resultado);
      
      return { dados, resultado, relatorio };
    } catch (error) {
      logger.error("Error during ASOG review", error);
      throw error;
    }
  }

  /**
   * Download report as JSON file
   */
  public downloadRelatorio(relatorio: ASOGReport): void {
    try {
      const dataStr = JSON.stringify(relatorio, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `asog_report_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
      
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
      
      logger.info("Relatório ASOG baixado", { filename: exportFileDefaultName });
    } catch (error) {
      logger.error("Error downloading ASOG report", error);
      throw error;
    }
  }

  /**
   * Reset service state
   */
  public reset(): void {
    this.statusAtual = null;
    logger.info("ASOG Service resetado");
  }
}

// Export singleton instance
export const asogService = ASOGService.getInstance();
