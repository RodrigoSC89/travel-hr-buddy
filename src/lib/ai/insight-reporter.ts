import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { initSecureMQTT } from "@/lib/mqtt/secure-client";

const SUPABASE_URL = "https://vnbptmixvwropvanyhdb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
