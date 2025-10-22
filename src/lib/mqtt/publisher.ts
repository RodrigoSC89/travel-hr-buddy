// @ts-nocheck
import mqtt from "mqtt";

const URL_ENV = import.meta.env.VITE_MQTT_URL as string | undefined;

// Garante WSS quando a página está em HTTPS
function resolveMqttUrl() {
  if (URL_ENV) return URL_ENV;
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  return isHttps ? "wss://broker.hivemq.com:8884/mqtt" : "ws://broker.hivemq.com:8000/mqtt";
}

// Cliente global único
const client = mqtt.connect(resolveMqttUrl());

// Utilitário comum
export const publishEvent = (topic: string, payload: Record<string, unknown>) => {
  try {
    client.publish(topic, JSON.stringify(payload), { qos: 1 });
  } catch (e) {
    console.error("MQTT publish failed:", e);
  }
};

// Subscribe genérico (retorna cleanup compatível com .end())
export const subscribeTopic = (topic: string, callback: (data: any) => void) => {
  client.subscribe(topic, (err) => err && console.error("MQTT subscribe error:", topic, err));
  const onMessage = (received: string, msg: Uint8Array) => {
    if (received !== topic) return;
    try { callback(JSON.parse(new TextDecoder().decode(msg))); }
    catch { callback({ raw: new TextDecoder().decode(msg) }); }
  };
  client.on("message", onMessage);

  return { end: () => client.off("message", onMessage) }; // no-op p/ compatibilidade
};

// Canais específicos (exporte **uma vez cada**)
export const subscribeDP = (cb: any) => subscribeTopic("nautilus/dp", cb);
export const subscribeForecast = (cb: any) => subscribeTopic("nautilus/forecast", cb);
export const subscribeForecastData = (cb: any) => subscribeTopic("nautilus/forecast/data", cb);
export const subscribeForecastGlobal = (cb: any) => subscribeTopic("nautilus/forecast/global", cb);
export const subscribeAlerts = (cb: any) => subscribeTopic("nautilus/alerts", cb);
export const subscribeSystemAlerts = (cb: any) => subscribeTopic("nautilus/alerts", cb);
export const subscribeDPAlerts = (cb: any) => subscribeTopic("nautilus/alerts/dp", cb);
export const subscribeBridgeStatus = (cb: any) => subscribeTopic("nautilus/bridge/status", cb);
export const subscribeBridgeLinkStatus = (cb: any) => subscribeTopic("nautilus/bridge/link_status", cb);
export const subscribeControlHub = (cb: any) => subscribeTopic("nautilus/controlhub/telemetry", cb);
export const subscribeSystemStatus = (cb: any) => subscribeTopic("nautilus/system/status", cb);

// Função de publicação específica
export const publishForecast = (payload: Record<string, unknown>) => 
  publishEvent("nautilus/forecast/global", payload);
