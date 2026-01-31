/**
 * Alert Manager - Centralized alert dispatch for Slack, Teams, Discord, Email
 * Supports vessel-specific, crew, compliance, equipment, and bunker alerts
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

export type AlertSeverity = "critical" | "warning" | "info" | "success";
export type AlertType = "crew" | "vessel" | "compliance" | "equipment" | "bunker" | "system" | "security";

export interface AlertPayload {
  title: string;
  message: string;
  severity?: AlertSeverity;
  alertType?: AlertType;
  vesselId?: string;
  vesselName?: string;
  source?: string;
  errorType?: string;
  stackTrace?: string;
  details?: Record<string, unknown>;
  actionUrl?: string;
  actionLabel?: string;
  emailTo?: string;
}

export interface AlertResult {
  success: boolean;
  results: {
    slack?: boolean;
    teams?: boolean;
    discord?: boolean;
    email?: boolean;
    internal?: boolean;
  };
  configuredChannels: string[];
  timestamp: string;
}

class AlertManager {
  /**
   * Send alert to all configured channels (Slack, Teams, Discord, Email)
   */
  async sendAlert(payload: AlertPayload): Promise<AlertResult> {
    try {
      const { data, error } = await supabase.functions.invoke("notify-slack", {
        body: {
          title: payload.title,
          message: payload.message,
          severity: payload.severity || "info",
          alertType: payload.alertType || "system",
          vesselId: payload.vesselId,
          vesselName: payload.vesselName,
          source: payload.source,
          errorType: payload.errorType,
          stackTrace: payload.stackTrace,
          details: payload.details,
          actionUrl: payload.actionUrl,
          actionLabel: payload.actionLabel,
          emailTo: payload.emailTo,
        },
      });

      if (error) {
        logger.error("[AlertManager] Error:", error);
        return {
          success: false,
          results: {},
          configuredChannels: [],
          timestamp: new Date().toISOString()
        };
      }

      return data as AlertResult;
    } catch (err) {
      logger.error("[AlertManager] Exception:", err);
      return {
        success: false,
        results: {},
        configuredChannels: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  // ========== CONVENIENCE METHODS ==========

  async sendCriticalAlert(title: string, message: string, options?: Partial<AlertPayload>): Promise<AlertResult> {
    return this.sendAlert({
      title,
      message,
      severity: "critical",
      ...options
    });
  }

  async sendWarning(title: string, message: string, options?: Partial<AlertPayload>): Promise<AlertResult> {
    return this.sendAlert({
      title,
      message,
      severity: "warning",
      ...options
    });
  }

  async sendInfo(title: string, message: string, options?: Partial<AlertPayload>): Promise<AlertResult> {
    return this.sendAlert({
      title,
      message,
      severity: "info",
      ...options
    });
  }

  async sendSuccess(title: string, message: string, options?: Partial<AlertPayload>): Promise<AlertResult> {
    return this.sendAlert({
      title,
      message,
      severity: "success",
      ...options
    });
  }

  // ========== DOMAIN-SPECIFIC ALERTS ==========

  async sendCrewAlert(title: string, message: string, crewDetails?: Record<string, unknown>): Promise<AlertResult> {
    return this.sendAlert({
      title,
      message,
      severity: "warning",
      alertType: "crew",
      details: crewDetails,
      actionUrl: "/crew-management",
      actionLabel: "Ver Tripulação"
    });
  }

  async sendVesselAlert(
    title: string, 
    message: string, 
    vesselId: string, 
    vesselName: string,
    severity: AlertSeverity = "warning"
  ): Promise<AlertResult> {
    return this.sendAlert({
      title,
      message,
      severity,
      alertType: "vessel",
      vesselId,
      vesselName,
      actionUrl: `/vessels/${vesselId}`,
      actionLabel: "Ver Embarcação"
    });
  }

  async sendComplianceAlert(
    title: string, 
    message: string, 
    complianceDetails?: Record<string, unknown>
  ): Promise<AlertResult> {
    return this.sendAlert({
      title,
      message,
      severity: "critical",
      alertType: "compliance",
      details: complianceDetails,
      actionUrl: "/compliance-center",
      actionLabel: "Ver Compliance"
    });
  }

  async sendEquipmentAlert(
    title: string, 
    message: string, 
    equipmentDetails?: Record<string, unknown>
  ): Promise<AlertResult> {
    return this.sendAlert({
      title,
      message,
      severity: "warning",
      alertType: "equipment",
      details: equipmentDetails,
      actionUrl: "/maintenance-manager",
      actionLabel: "Ver Manutenção"
    });
  }

  async sendBunkerSavingsAlert(
    port: string,
    savings: number,
    currentPrice: number,
    fuelType: string
  ): Promise<AlertResult> {
    return this.sendAlert({
      title: `💰 Oportunidade de Economia - $${(savings / 1000).toFixed(1)}k`,
      message: `${port}: ${fuelType.toUpperCase()} a $${currentPrice}/MT. Economia potencial de $${savings.toLocaleString()} em 500MT.`,
      severity: savings > 15000 ? "critical" : "warning",
      alertType: "bunker",
      details: { port, savings, currentPrice, fuelType },
      actionUrl: "/finance-command",
      actionLabel: "Ver Finance Command"
    });
  }

  async sendSecurityAlert(
    title: string, 
    message: string, 
    securityDetails?: Record<string, unknown>
  ): Promise<AlertResult> {
    return this.sendAlert({
      title,
      message,
      severity: "critical",
      alertType: "security",
      details: securityDetails,
      actionUrl: "/security-center",
      actionLabel: "Ver Segurança"
    });
  }

  // ========== DAILY SUMMARY ==========

  async sendDailySummary(
    vesselName: string,
    summary: {
      complianceScore: number;
      crewWellness: string;
      equipmentStatus: string;
      fuelStatus: string;
      alertsCount: number;
      alerts: Array<{ title: string; severity: string }>;
    }
  ): Promise<AlertResult> {
    const alertList = summary.alerts.length > 0
      ? `\n⚠️ ${summary.alerts.length} Issues:\n${summary.alerts.map(a => `• ${a.title}`).join("\n")}`
      : "\n✅ No critical issues";

    return this.sendAlert({
      title: `📊 ${vesselName} - Daily Summary`,
      message: `**Compliance Score:** ${summary.complianceScore}%\n**Crew Wellness:** ${summary.crewWellness}\n**Equipment Status:** ${summary.equipmentStatus}\n**Fuel Status:** ${summary.fuelStatus}${alertList}`,
      severity: summary.alertsCount > 0 ? "warning" : "success",
      alertType: "vessel",
      vesselName,
      details: summary
    });
  }
}

export const alertManager = new AlertManager();
