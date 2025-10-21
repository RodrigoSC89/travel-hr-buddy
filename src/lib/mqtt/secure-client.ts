import mqtt, { MqttClient } from "mqtt";

let client: MqttClient | null = null;

export function initSecureMQTT(): MqttClient {
  if (client) return client;
  const url = import.meta.env.VITE_MQTT_URL;
  if (!url) {
    console.warn("VITE_MQTT_URL not set, MQTT disabled");
    // @ts-ignore - mock client for noop publish
    return { publish: () => {}, on: () => {}, end: () => {} };
  }
  client = mqtt.connect(url, {
    username: import.meta.env.VITE_MQTT_USERNAME,
    password: import.meta.env.VITE_MQTT_PASSWORD,
    reconnectPeriod: 3000,
    clean: true,
  });
  client.on("connect", () => console.info("🔗 MQTT connected"));
  client.on("error", (e) => console.error("MQTT error", e));
  return client!;
}
