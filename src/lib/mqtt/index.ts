/**
 * MQTT Client Initialization
 * Lightweight MQTT client wrapper for Nautilus telemetry
 * Part of Nautilus One v3.3 - Performance Telemetry Module
 */

import mqtt, { MqttClient } from "mqtt";

/**
 * Initialize MQTT connection with configurable broker
 * 
 * @param brokerUrl - Optional broker URL (defaults to env variable or public broker)
 * @returns MQTT client instance or null on failure
 */
export function initMQTT(brokerUrl?: string): MqttClient | null {
  const broker =
    brokerUrl ||
    import.meta.env.VITE_MQTT_URL ||
    "wss://broker.hivemq.com:8884/mqtt";

  try {
    const client = mqtt.connect(broker, {
      clientId: `nautilus-${Math.random().toString(16).slice(2)}`,
      reconnectPeriod: 3000,
      connectTimeout: 4000,
    });

    client.on("connect", () => {
      console.info("🛰️ Conectado ao broker MQTT Nautilus");
      client.subscribe("nautilus/telemetry/#", (err) => {
        if (err) {
          console.warn("⚠️ Erro ao subscrever tópicos MQTT:", err);
        }
      });
    });

    client.on("error", (err) => {
      console.warn("⚠️ Erro MQTT:", err.message);
    });

    client.on("reconnect", () => {
      console.log("🔄 Reconectando MQTT...");
    });

    client.on("offline", () => {
      console.log("📡 MQTT offline");
    });

    return client;
  } catch (error) {
    console.error("❌ Falha na inicialização do MQTT:", error);
    return null;
  }
}
