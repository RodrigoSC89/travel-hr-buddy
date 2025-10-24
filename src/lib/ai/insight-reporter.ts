import { createClient } from "@supabase/supabase-js";
import { initSecureMQTT } from "@/lib/mqtt/secure-client";
import { logger } from "@/lib/logger";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!
);

/**
 * AI Insight Reporter
 * Analisa logs, anomalias e envia alertas via Supabase Functions + MQTT
 */
export class AIInsightReporter {
  private mqttClient = initSecureMQTT();

  /**
   * Report an incident/anomaly
   * @param event - The incident event to report
   */
  async report(event: {
    module: string;
    severity: "info" | "warning" | "critical";
    message: string;
    metadata?: Record<string, unknown>;
  }) {
    const timestamp = new Date().toISOString();

    // Registra no Supabase (função edge para persistência)
    await supabase.functions.invoke("log_incident", {
      body: { ...event, timestamp },
    });

    // Publica notificação MQTT para painel de resposta rápida
    this.mqttClient.publish(
      "nautilus/alerts",
      JSON.stringify({
        ...event,
        timestamp,
        source: "AIInsightReporter",
      })
    );

    logger.info(`🚨 [${event.severity.toUpperCase()}] ${event.module}: ${event.message}`);
  }

  /**
   * @deprecated Use report() instead
   */
  async reportAnomaly(event: {
    module: string;
    severity: "info" | "warning" | "critical";
    message: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.report(event);
  }
}
