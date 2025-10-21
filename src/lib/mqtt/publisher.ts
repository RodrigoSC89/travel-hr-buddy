// @ts-nocheck
import mqtt from "mqtt";

const MQTT_URL = import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt";

// Cliente MQTT único global
const client = mqtt.connect(MQTT_URL);

/**
 * 📤 Publica um evento em qualquer tópico MQTT
 * @param topic - Tópico MQTT
 * @param payload - Dados a serem publicados
 * @param qos - Quality of Service (0: at most once, 1: at least once, 2: exactly once)
 */
export const publishEvent = (
  topic: string,
  payload: Record<string, unknown>,
  qos: 0 | 1 | 2 = 1
) => {
  client.publish(topic, JSON.stringify(payload), { qos }, (err) => {
    if (err) console.error(`❌ Falha ao publicar em ${topic}:`, err);
    else console.log(`✅ Publicado em ${topic}:`, payload);
  });
};

/**
 * 📡 Subscreve genericamente a um tópico MQTT
 */
export const subscribeTopic = (topic: string, callback: (data: Record<string, unknown>) => void) => {
  client.subscribe(topic, (err) => {
    if (err) console.error(`❌ Falha ao subscrever ${topic}:`, err);
    else console.log(`✅ Subscreveu ${topic}`);
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
};

/**
 * 🔹 Canais específicos
 */
export const subscribeDP = (callback) => subscribeTopic("nautilus/dp", callback);
export const subscribeForecast = (callback) => subscribeTopic("nautilus/forecast", callback);
export const subscribeForecastData = (callback) => subscribeTopic("nautilus/forecast/data", callback);
export const subscribeForecastGlobal = (callback) => subscribeTopic("nautilus/forecast/global", callback);
export const subscribeSystemAlerts = (callback) => subscribeTopic("nautilus/alerts", callback);
export const subscribeDPAlerts = (callback) => subscribeTopic("nautilus/dp/alert", callback);
export const subscribeBridgeStatus = (callback) => subscribeTopic("nautilus/bridge/status", callback);
export const subscribeBridgeLinkStatus = (callback) => subscribeTopic("nautilus/bridgelink/status", callback);
export const subscribeControlHub = (callback) => subscribeTopic("nautilus/controlhub/telemetry", callback);
export const subscribeSystemStatus = (callback) => subscribeTopic("nautilus/system/status", callback);

/**
 * 📤 Funções de publicação específicas
 */
export const publishForecast = (payload: Record<string, unknown>, qos: 0 | 1 | 2 = 1) => publishEvent("nautilus/forecast/global", payload, qos);
