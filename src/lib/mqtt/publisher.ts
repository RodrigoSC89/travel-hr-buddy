// @ts-nocheck
import mqtt from "mqtt";

const MQTT_URL = import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt";
const client = mqtt.connect(MQTT_URL);

/** 📤 Publica um evento genérico MQTT */
export const publishEvent = (topic, payload, qos = 1) => {
  client.publish(topic, JSON.stringify(payload), { qos }, (err) => {
    if (err) console.error(`❌ Erro ao publicar em ${topic}:`, err);
    else console.log(`✅ Publicado em ${topic}:`, payload);
  });
};

/** 📡 Subscreve a um tópico genérico e retorna cleanup */
export const subscribeTopic = (topic, callback) => {
  client.subscribe(topic, (err) => {
    if (err) console.error(`❌ Falha ao subscrever ${topic}:`, err);
    else console.log(`✅ Subscreveu ${topic}`);
  });
  client.on("message", (receivedTopic, message) => {
    if (receivedTopic === topic) {
      try { callback(JSON.parse(message.toString())); }
      catch { callback({ raw: message.toString() }); }
    }
  });
  return { end: () => console.log(`🔄 Cleanup solicitado para ${topic}`) };
};

// 🔹 Canais específicos
export const subscribeDP = (cb) => subscribeTopic("nautilus/dp", cb);
export const subscribeForecast = (cb) => subscribeTopic("nautilus/forecast", cb);
export const subscribeForecastData = (cb) => subscribeTopic("nautilus/forecast/data", cb);
export const subscribeForecastGlobal = (cb) => subscribeTopic("nautilus/forecast/global", cb);
export const subscribeAlerts = (cb) => subscribeTopic("nautilus/alerts", cb);
export const subscribeSystemAlerts = (cb) => subscribeTopic("nautilus/alerts", cb);
export const subscribeDPAlerts = (cb) => subscribeTopic("nautilus/dp/alert", cb);
export const subscribeBridgeStatus = (cb) => subscribeTopic("nautilus/bridgelink/status", cb);
export const subscribeBridgeLinkStatus = (cb) => subscribeTopic("nautilus/bridgelink/status", cb);
export const subscribeControlHub = (cb) => subscribeTopic("nautilus/controlhub/telemetry", cb);
export const subscribeSystemStatus = (cb) => subscribeTopic("nautilus/system/status", cb);

/** 📤 Função de publicação específica */
export const publishForecast = (payload, qos = 1) => publishEvent("nautilus/forecast/global", payload, qos);
