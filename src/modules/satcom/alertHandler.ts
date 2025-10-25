/**
 * PATCH 171.0 - Alert Handler
 * Manages user alerts for SATCOM connectivity issues
 * Integrates with toast notifications and system-watchdog
 */

import { logger } from "@/lib/logger";
import type { SatcomConnection } from "./index";
import type { FallbackEvent } from "./linkFallbackManager";

export interface AlertConfig {
  enabled: boolean;
  showConnectionLoss: boolean;
  showFallbackActivation: boolean;
  showRecovery: boolean;
  showDegradation: boolean;
  soundEnabled: boolean;
  persistentAlerts: boolean;
}

export interface SatcomAlert {
  id: string;
  timestamp: Date;
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  message: string;
  connectionId?: string;
  connectionName?: string;
  dismissed: boolean;
  autoDissmissMs?: number;
}

type AlertCallback = (alert: SatcomAlert) => void;

class AlertHandler {
  private config: AlertConfig = {
    enabled: true,
    showConnectionLoss: true,
    showFallbackActivation: true,
    showRecovery: true,
    showDegradation: true,
    soundEnabled: false,
    persistentAlerts: false
  };

  private alerts: SatcomAlert[] = [];
  private maxAlerts = 50;
  private callbacks: AlertCallback[] = [];

  /**
   * Register callback for alert notifications
   */
  onAlert(callback: AlertCallback): () => void {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Create and dispatch alert
   */
  private createAlert(
    severity: SatcomAlert["severity"],
    title: string,
    message: string,
    options: Partial<SatcomAlert> = {}
  ): SatcomAlert {
    const alert: SatcomAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date(),
      severity,
      title,
      message,
      dismissed: false,
      ...options
    };

    // Add to history
    this.alerts.unshift(alert);
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.maxAlerts);
    }

    // Notify callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        logger.error("[Alert Handler] Error in alert callback", error);
      }
    });

    // Play sound if enabled
    if (this.config.soundEnabled && severity === "critical") {
      this.playAlertSound();
    }

    // Log alert
    logger.info(`[Alert Handler] ${severity.toUpperCase()}: ${title}`, {
      message,
      ...options
    });

    return alert;
  }

  /**
   * Alert for connection loss
   */
  alertConnectionLoss(connection: SatcomConnection): void {
    if (!this.config.enabled || !this.config.showConnectionLoss) {
      return;
    }

    this.createAlert(
      "error",
      "Perda de Conectividade",
      `Conexão ${connection.name} (${connection.provider}) foi perdida.`,
      {
        connectionId: connection.id,
        connectionName: connection.name,
        autoDissmissMs: this.config.persistentAlerts ? undefined : 10000
      }
    );
  }

  /**
   * Alert for fallback activation
   */
  alertFallbackActivated(
    primaryConnection: SatcomConnection,
    fallbackConnection: SatcomConnection,
    reason: string
  ): void {
    if (!this.config.enabled || !this.config.showFallbackActivation) {
      return;
    }

    this.createAlert(
      "warning",
      "Fallback Ativado",
      `Sistema alternado de ${primaryConnection.name} para ${fallbackConnection.name}. Motivo: ${reason}`,
      {
        connectionId: fallbackConnection.id,
        connectionName: fallbackConnection.name,
        autoDissmissMs: this.config.persistentAlerts ? undefined : 15000
      }
    );
  }

  /**
   * Alert for successful recovery
   */
  alertRecovery(
    fallbackConnection: SatcomConnection,
    primaryConnection: SatcomConnection
  ): void {
    if (!this.config.enabled || !this.config.showRecovery) {
      return;
    }

    this.createAlert(
      "info",
      "Conexão Restaurada",
      `Sistema retornou para conexão primária ${primaryConnection.name}.`,
      {
        connectionId: primaryConnection.id,
        connectionName: primaryConnection.name,
        autoDissmissMs: 8000
      }
    );
  }

  /**
   * Alert for connection degradation
   */
  alertDegradation(
    connection: SatcomConnection,
    metrics: { latency?: number; packetLoss?: number; signalStrength?: number }
  ): void {
    if (!this.config.enabled || !this.config.showDegradation) {
      return;
    }

    const issues: string[] = [];
    if (metrics.latency && metrics.latency > 1000) {
      issues.push(`latência alta (${metrics.latency.toFixed(0)}ms)`);
    }
    if (metrics.packetLoss && metrics.packetLoss > 5) {
      issues.push(`perda de pacotes (${metrics.packetLoss.toFixed(1)}%)`);
    }
    if (metrics.signalStrength && metrics.signalStrength < 50) {
      issues.push(`sinal fraco (${metrics.signalStrength.toFixed(0)}%)`);
    }

    const issueText = issues.join(", ");

    this.createAlert(
      "warning",
      "Conexão Degradada",
      `${connection.name} está com problemas: ${issueText}.`,
      {
        connectionId: connection.id,
        connectionName: connection.name,
        autoDissmissMs: 12000
      }
    );
  }

  /**
   * Alert for no connections available
   */
  alertNoConnections(): void {
    if (!this.config.enabled) {
      return;
    }

    this.createAlert(
      "critical",
      "Sem Conectividade",
      "Todas as conexões satelitais estão indisponíveis. Sistema operando offline.",
      {
        autoDissmissMs: undefined // Keep until dismissed
      }
    );
  }

  /**
   * Alert for all connections restored
   */
  alertAllConnectionsRestored(): void {
    if (!this.config.enabled) {
      return;
    }

    this.createAlert(
      "info",
      "Conectividade Total Restaurada",
      "Todas as conexões satelitais estão operacionais novamente.",
      {
        autoDissmissMs: 8000
      }
    );
  }

  /**
   * Handle fallback event
   */
  handleFallbackEvent(
    event: FallbackEvent,
    connections: SatcomConnection[]
  ): void {
    const fromConn = connections.find(c => c.name === event.fromConnection);
    const toConn = connections.find(c => c.name === event.toConnection);

    switch (event.type) {
      case "fallback_initiated":
        if (fromConn && toConn && event.success) {
          this.alertFallbackActivated(fromConn, toConn, event.reason);
        }
        break;

      case "recovery_completed":
        if (fromConn && toConn && event.success) {
          this.alertRecovery(fromConn, toConn);
        }
        break;

      case "fallback_completed":
        // Already handled by fallback_initiated
        break;

      case "recovery_initiated":
        // Don't alert on initiation, only on completion
        break;
    }
  }

  /**
   * Dismiss alert
   */
  dismissAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.dismissed = true;
    }
  }

  /**
   * Dismiss all alerts
   */
  dismissAllAlerts(): void {
    this.alerts.forEach(alert => {
      alert.dismissed = true;
    });
  }

  /**
   * Get active (non-dismissed) alerts
   */
  getActiveAlerts(): SatcomAlert[] {
    return this.alerts.filter(a => !a.dismissed);
  }

  /**
   * Get all alerts
   */
  getAllAlerts(): SatcomAlert[] {
    return [...this.alerts];
  }

  /**
   * Clear alert history
   */
  clearHistory(): void {
    this.alerts = [];
    logger.info("[Alert Handler] Alert history cleared");
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<AlertConfig>): void {
    this.config = {
      ...this.config,
      ...updates
    };

    logger.info("[Alert Handler] Configuration updated", updates);
  }

  /**
   * Get current configuration
   */
  getConfig(): AlertConfig {
    return { ...this.config };
  }

  /**
   * Play alert sound (browser-based)
   */
  private playAlertSound(): void {
    try {
      // Create a simple beep using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Hz
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      logger.warn(`[Alert Handler] Could not play alert sound: ${error}`);
    }
  }

  /**
   * Get alert statistics
   */
  getStatistics(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    dismissed: number;
    active: number;
  } {
    const stats = {
      total: this.alerts.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      dismissed: this.alerts.filter(a => a.dismissed).length,
      active: this.alerts.filter(a => !a.dismissed).length
    };

    this.alerts.forEach(alert => {
      // Count by severity
      stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const alertHandler = new AlertHandler();
