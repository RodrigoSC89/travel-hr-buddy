import mqtt from "mqtt";

import { logger } from "@/lib/logger";
const MQTT_URL = import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt";

// Cliente MQTT único global
const client = mqtt.connect(MQTT_URL);

/**
 * 📤 Publica um evento em qualquer tópico MQTT
 */
export const publishEvent = (
  topic: string,
  payload: Record<string, unknown>,
  qos: 0 | 1 | 2 = 1
) => {
  client.publish(topic, JSON.stringify(payload), { qos }, (err) => {
    if (err) {
      logger.error(`Erro ao publicar em ${topic}`, err);
    } else {
      logger.info(`✅ Publicado em ${topic}:`, payload);
    }
  });
};

/**
 * 📡 Subscreve genericamente a um tópico MQTT
 */
export const subscribeTopic = (
  topic: string,
  callback: (data: Record<string, unknown>) => void
) => {
  client.subscribe(topic, (err) => {
    if (err) {
      logger.error(`Erro ao subscrever ${topic}`, err);
    } else {
      logger.info(`✅ Subscreveu ${topic}`);
    }
  });

  client.on("message", (receivedTopic, message) => {
    if (receivedTopic === topic) {
      try {
        callback(JSON.parse(message.toString()));
      } catch {
        callback({ raw: message.toString() });
      }
    }
  });

  return client; // permite cleanup seguro
};

/**
 * 🔹 Canais específicos
 */
export const subscribeDP = (callback: (data: Record<string, unknown>) => void) => subscribeTopic("nautilus/dp", callback);
export const subscribeForecast = (callback: (data: Record<string, unknown>) => void) => subscribeTopic("nautilus/forecast", callback);
export const subscribeForecastData = (callback: (data: Record<string, unknown>) => void) => subscribeTopic("nautilus/forecast/data", callback);
export const subscribeForecastGlobal = (callback: (data: Record<string, unknown>) => void) => subscribeTopic("nautilus/forecast/global", callback);
export const subscribeSystemAlerts = (callback: (data: Record<string, unknown>) => void) => subscribeTopic("nautilus/alerts", callback);
export const subscribeDPAlerts = (callback: (data: Record<string, unknown>) => void) => subscribeTopic("nautilus/dp/alert", callback);
export const subscribeBridgeStatus = (callback: (data: Record<string, unknown>) => void) => subscribeTopic("nautilus/bridgelink/status", callback);
export const subscribeBridgeLinkStatus = (callback: (data: Record<string, unknown>) => void) => subscribeTopic("nautilus/bridgelink/status", callback);
export const subscribeControlHub = (callback: (data: Record<string, unknown>) => void) => subscribeTopic("nautilus/controlhub/telemetry", callback);
export const subscribeSystemStatus = (callback: (data: Record<string, unknown>) => void) => subscribeTopic("nautilus/system/status", callback);

/**
 * 📤 Função de publicação específica
 */
export const publishForecast = (
  payload: Record<string, unknown>,
  qos: 0 | 1 | 2 = 1
) => publishEvent("nautilus/forecast/global", payload, qos);
