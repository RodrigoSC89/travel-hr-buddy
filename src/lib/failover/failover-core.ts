import mqtt from "mqtt";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

const HEARTBEAT_TOPIC = "nautilus/system/heartbeat";
const STATUS_TOPIC = "nautilus/system/status";

let lastHeartbeat = Date.now();
let connected = false;

export function initFailoverSystem() {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");

  client.on("connect", () => {
    connected = true;
    logger.info("✅ MQTT conectado ao Failover Core");
    client.subscribe(HEARTBEAT_TOPIC);
    client.publish(STATUS_TOPIC, JSON.stringify({ status: "online", timestamp: Date.now() }));
  });

  client.on("message", (topic, message) => {
    if (topic === HEARTBEAT_TOPIC) lastHeartbeat = Date.now();
  });

  // Watchdog interno
  setInterval(async () => {
    const diff = Date.now() - lastHeartbeat;
    if (diff > 8000) {
      logger.warn("⚠️ Falha detectada! Último heartbeat há", diff / 1000, "segundos.");
      // Tabela failover_events não existe - comentado para evitar erros 404
      // await (supabase as any).from("failover_events").insert({
      //   event: "Loss of Heartbeat",
      //   timestamp: new Date().toISOString(),
      //   module: "DP-Sync",
      // });
      client.publish(STATUS_TOPIC, JSON.stringify({ status: "failover", timestamp: Date.now() }));
      executeRecovery(client);
    }
  }, 5000);
}

async function executeRecovery(client: any) {
  logger.info("🔁 Executando protocolo de failover...");
  try {
    client.publish("nautilus/system/recovery", JSON.stringify({ action: "restart-dp-module" }));
    // Tabela failover_events não existe - comentado para evitar erros 404
    // await (supabase as any).from("failover_events").insert({
    //   event: "Failover Executed",
    //   timestamp: new Date().toISOString(),
    //   module: "DP-Sync",
    // });
  } catch (err) {
    logger.error("❌ Falha ao executar recuperação:", err);
  }
}
