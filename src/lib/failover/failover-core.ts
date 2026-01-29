import mqtt from "mqtt";
import { logger } from "@/lib/logger";

const HEARTBEAT_TOPIC = "nautilus/system/heartbeat";
const STATUS_TOPIC = "nautilus/system/status";

let lastHeartbeat = Date.now();
let connected = false;

export function initFailoverSystem() {
  // Use default public broker - no VITE_ env vars supported
  const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");

  client.on("connect", () => {
    connected = true;
    logger.info("MQTT conectado ao Failover Core");
    client.subscribe(HEARTBEAT_TOPIC);
    client.publish(STATUS_TOPIC, JSON.stringify({ status: "online", timestamp: Date.now() }));
  });

  client.on("message", (topic) => {
    if (topic === HEARTBEAT_TOPIC) lastHeartbeat = Date.now();
  });

  // Watchdog interno
  setInterval(() => {
    const diff = Date.now() - lastHeartbeat;
    if (diff > 8000) {
      logger.warn(`Falha detectada! Último heartbeat há ${diff / 1000} segundos.`);
      client.publish(STATUS_TOPIC, JSON.stringify({ status: "failover", timestamp: Date.now() }));
      executeRecovery(client);
    }
  }, 5000);
  
  return { connected: () => connected };
}

async function executeRecovery(client: mqtt.MqttClient) {
  logger.info("Executando protocolo de failover...");
  try {
    client.publish("nautilus/system/recovery", JSON.stringify({ action: "restart-dp-module" }));
  } catch (err) {
    logger.error("Falha ao executar recuperação", err);
  }
}
