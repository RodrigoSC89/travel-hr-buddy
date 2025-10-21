import { createClient } from "@supabase/supabase-js";
import { initSecureMQTT } from "@/lib/mqtt/secure-client";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export type IncidentEvent = {
  module: string;
  severity: "info" | "warning" | "critical";
  message: string;
  metadata?: Record<string, unknown>;
};

export class AIInsightReporter {
  private mqtt = initSecureMQTT();

  async report(event: IncidentEvent) {
    const payload = { ...event, timestamp: new Date().toISOString() };
    // 1) Persiste via Edge Function
    await supabase.functions.invoke("log-incident", { body: payload });
    // 2) Notifica via MQTT (tempo real)
    try {
      this.mqtt.publish("nautilus/alerts", JSON.stringify({ ...payload, source: "AIInsightReporter" }));
    } catch (e) {
      console.warn("MQTT publish failed", e);
    }
  }
}
