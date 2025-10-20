/**
 * ASOG Review Service
 * 
 * Singleton service for Activity Specific Operating Guidelines (ASOG) review.
 * Handles operational data collection, validation against ASOG limits,
 * and report generation for Dynamic Positioning operations.
 */

import { logger } from "@/lib/logger";
import type {
  OperationalData,
  ASOGLimits,
  ValidationResult,
  ASOGReport,
  DPAlertLevel,
} from "./types";

/**
 * ASOG Service Class
 * Implements singleton pattern following project conventions
 */
class ASOGService {
  private static instance: ASOGService;
  
  // Default ASOG limits for DP operations
  private limits: ASOGLimits = {
    max_wind_speed: 35,           // Maximum 35 knots
    max_thruster_loss: 1,         // Maximum 1 thruster loss allowed
    required_dp_status: "Green",  // Green status required
  };

  private constructor() {
    logger.info("ASOG Service initialized");
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
   * Get current ASOG limits configuration
   */
  public getLimits(): ASOGLimits {
    return { ...this.limits };
  }

  /**
   * Update ASOG limits configuration
   */
  public setLimits(newLimits: Partial<ASOGLimits>): void {
    this.limits = { ...this.limits, ...newLimits };
    logger.info("ASOG limits updated", { limits: this.limits });
  }

  /**
   * Collect operational data for ASOG review
   * In production, this would integrate with real sensors/systems
   * For now, generates realistic sample data
   */
  private collectOperationalData(): OperationalData {
    // Generate realistic operational data
    const windSpeed = Math.floor(Math.random() * 45); // 0-45 knots
    const thrustersOperational = Math.floor(Math.random() * 4) + 1; // 1-4 thrusters
    const dpStatuses: DPAlertLevel[] = ["Green", "Yellow", "Red"];
    const dpStatus = dpStatuses[Math.floor(Math.random() * dpStatuses.length)];

    const data: OperationalData = {
      wind_speed: windSpeed,
      thrusters_operacionais: thrustersOperational,
      dp_status: dpStatus,
      timestamp: new Date().toISOString(),
    };

    logger.info("Operational data collected", { data });
    return data;
  }

  /**
   * Validate operational data against ASOG limits
   */
  private validateAgainstASOG(data: OperationalData): ValidationResult {
    const alertas: string[] = [];

    // Validate wind speed
    if (data.wind_speed > this.limits.max_wind_speed) {
      alertas.push("⚠️ Velocidade do vento acima do limite ASOG.");
    }

    // Validate thruster operational count
    // Assuming 4 total thrusters (standard DP configuration)
    const totalThrusters = 4;
    const thrustersLost = totalThrusters - data.thrusters_operacionais;
    if (thrustersLost > this.limits.max_thruster_loss) {
      alertas.push("⚠️ Número de thrusters inoperantes excede limite ASOG.");
    }

    // Validate DP status
    if (data.dp_status !== this.limits.required_dp_status) {
      alertas.push("⚠️ Sistema DP fora do nível de alerta ASOG.");
    }

    const resultado: ValidationResult = {
      conformidade: alertas.length === 0,
      alertas,
    };

    logger.info("ASOG validation completed", { resultado });
    return resultado;
  }

  /**
   * Generate ASOG review report
   */
  private generateReport(
    dados: OperationalData,
    resultado: ValidationResult
  ): ASOGReport {
    const report: ASOGReport = {
      timestamp: new Date().toISOString(),
      dados_operacionais: dados,
      resultado,
    };

    logger.info("ASOG report generated", { report });
    return report;
  }

  /**
   * Execute complete ASOG review
   * Returns operational data, validation result, and full report
   */
  public start(): {
    dados: OperationalData;
    resultado: ValidationResult;
    relatorio: ASOGReport;
    } {
    logger.info("Starting ASOG review");

    try {
      const dados = this.collectOperationalData();
      const resultado = this.validateAgainstASOG(dados);
      const relatorio = this.generateReport(dados, resultado);

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
      const jsonString = JSON.stringify(relatorio, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `asog-report-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      logger.info("Report downloaded successfully");
    } catch (error) {
      logger.error("Error downloading report", error);
      throw error;
    }
  }
}

// Export singleton instance
export const asogService = ASOGService.getInstance();
