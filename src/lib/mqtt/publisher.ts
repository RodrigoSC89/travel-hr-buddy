// @ts-nocheck
import mqtt from "mqtt";

function getMqttUrl() {
  const url = import.meta.env.VITE_MQTT_URL;
  if (url) return url;
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  return isHttps ? "wss://broker.hivemq.com:8884/mqtt" : "ws://broker.hivemq.com:8000/mqtt";
}

const client = mqtt.connect(getMqttUrl());

export const publishEvent = (topic, payload) => {
  try {
    client.publish(topic, JSON.stringify(payload), { qos: 1 });
  } catch (err) {
    console.error("MQTT Publish Error:", err);
  }
};

export const subscribeTopic = (topic, callback) => {
  client.subscribe(topic, (err) => err && console.error("MQTT Subscribe Error:", topic, err));
  const onMessage = (t, msg) => {
    if (t !== topic) return;
    try {
      callback(JSON.parse(msg.toString()));
    } catch {
      callback({ raw: msg.toString() });
    }
  };
  client.on("message", onMessage);
  return { end: () => client.off("message", onMessage) };
};

// Channels
export const subscribeDP = (cb) => subscribeTopic("nautilus/dp", cb);
export const subscribeForecast = (cb) => subscribeTopic("nautilus/forecast", cb);
export const subscribeForecastData = (cb) => subscribeTopic("nautilus/forecast/data", cb);
export const subscribeForecastGlobal = (cb) => subscribeTopic("nautilus/forecast/global", cb);
export const subscribeSystemAlerts = (cb) => subscribeTopic("nautilus/alerts", cb);
export const subscribeDPAlerts = (cb) => subscribeTopic("nautilus/dp/alert", cb);
export const subscribeAlerts = (cb) => subscribeTopic("nautilus/alerts", cb);
export const subscribeBridgeStatus = (cb) => subscribeTopic("nautilus/bridge/status", cb);
export const subscribeBridgeLinkStatus = (cb) => subscribeTopic("nautilus/bridge/link_status", cb);
export const subscribeControlHub = (cb) => subscribeTopic("nautilus/controlhub/telemetry", cb);
export const subscribeSystemStatus = (cb) => subscribeTopic("nautilus/system/status", cb);

export const publishForecast = (payload, qos = 1) => publishEvent("nautilus/forecast/global", payload, qos);
