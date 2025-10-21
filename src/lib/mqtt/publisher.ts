// @ts-nocheck
import mqtt from "mqtt";

const MQTT_URL = import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt";

// Cliente MQTT único global
const client = mqtt.connect(MQTT_URL);

/**
 * 📤 Publica um evento em qualquer tópico MQTT
 * @param topic - MQTT topic to publish to
 * @param payload - Data payload to publish
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
 * @param topic - MQTT topic to subscribe to
 * @param callback - Callback function to handle received messages
 * @returns Cleanup function to end the subscription
 */
export const subscribeTopic = (
  topic: string, 
  callback: (data: Record<string, unknown>) => void
) => {
  client.subscribe(topic, (err) => {
    if (err) console.error(`❌ Falha ao subscrever ${topic}:`, err);
    else console.log(`✅ Subscreveu ${topic}`);
  });

  const messageHandler = (receivedTopic: string, message: Buffer) => {
    if (receivedTopic === topic) {
      try {
        callback(JSON.parse(message.toString()));
      } catch {
        callback({ raw: message.toString() });
      }
    }
  };

  client.on("message", messageHandler);

  // Return cleanup function
  return () => {
    client.removeListener("message", messageHandler);
    client.unsubscribe(topic);
  };
};

/**
 * 🔹 Canais específicos - todas retornam função de cleanup
 */
export const subscribeDP = (callback: (data: Record<string, unknown>) => void) => 
  subscribeTopic("nautilus/dp", callback);
export const subscribeForecast = (callback: (data: Record<string, unknown>) => void) => 
  subscribeTopic("nautilus/forecast/update", callback);
export const subscribeForecastGlobal = (callback: (data: Record<string, unknown>) => void) => 
  subscribeTopic("nautilus/forecast/global", callback);
export const subscribeAlerts = (callback: (data: Record<string, unknown>) => void) => 
  subscribeTopic("nautilus/alerts", callback);
export const subscribeBridgeStatus = (callback: (data: Record<string, unknown>) => void) => 
  subscribeTopic("nautilus/bridge/status", callback);
export const subscribeControlHub = (callback: (data: Record<string, unknown>) => void) => 
  subscribeTopic("nautilus/controlhub/telemetry", callback);
