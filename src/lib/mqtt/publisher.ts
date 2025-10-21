// @ts-nocheck
import mqtt from "mqtt";

const MQTT_URL = import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt";

// Cliente MQTT único global
const client = mqtt.connect(MQTT_URL);

/**
 * Publica um evento em qualquer tópico MQTT
 */
export const publishEvent = (topic: string, payload: Record<string, unknown>) => {
  client.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
    if (err) console.error(`❌ Falha ao publicar em ${topic}:`, err);
    else console.log(`✅ Publicado em ${topic}:`, payload);
  });
};

/**
 * Subscreve genericamente a um tópico MQTT
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

  return client;
};

/**
 * 🔹 Canais específicos
 */
export const subscribeDP = (callback) =>
  subscribeTopic("nautilus/dp", callback);

export const subscribeForecast = (callback) =>
  subscribeTopic("nautilus/forecast", callback);

export const subscribeForecastGlobal = (callback) =>
  subscribeTopic("nautilus/forecast/global", callback);

export const subscribeAlerts = (callback) =>
  subscribeTopic("nautilus/alerts", callback);

export const subscribeBridgeStatus = (callback) =>
  subscribeTopic("nautilus/bridge/status", callback);

export const subscribeControlHub = (callback) =>
  subscribeTopic("nautilus/controlhub/telemetry", callback);

/**
 * Backward compatibility: Publish forecast data to MQTT broker
 */
export const publishForecast = (data: { wind: number; wave: number; temp: number; visibility: number }) => {
  publishEvent("nautilus/forecast/global", data);
};
