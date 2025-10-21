// @ts-nocheck
import mqtt from "mqtt";
import { supabase } from "@/integrations/supabase/client";

const HEARTBEAT_TOPIC = "nautilus/system/heartbeat";
const STATUS_TOPIC = "nautilus/system/status";

let lastHeartbeat = Date.now();
let connected = false;

export function initFailoverSystem() {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL);

  client.on("connect", () => {
    connected = true;
    console.log("✅ MQTT conectado ao Failover Core");
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
      console.warn("⚠️ Falha detectada! Último heartbeat há", diff / 1000, "segundos.");
      await supabase.from("failover_events").insert({
        event: "Loss of Heartbeat",
        timestamp: new Date().toISOString(),
        module: "DP-Sync",
      });
      client.publish(STATUS_TOPIC, JSON.stringify({ status: "failover", timestamp: Date.now() }));
      executeRecovery(client);
    }
  }, 5000);
}

async function executeRecovery(client) {
  console.log("🔁 Executando protocolo de failover...");
  try {
    client.publish("nautilus/system/recovery", JSON.stringify({ action: "restart-dp-module" }));
    await supabase.from("failover_events").insert({
      event: "Failover Executed",
      timestamp: new Date().toISOString(),
      module: "DP-Sync",
    });
  } catch (err) {
    console.error("❌ Falha ao executar recuperação:", err);
  }
}
