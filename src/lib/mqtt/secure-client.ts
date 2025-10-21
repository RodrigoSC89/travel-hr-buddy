import mqtt, { MqttClient } from "mqtt";

let client: MqttClient | null = null;

export function initSecureMQTT(): MqttClient {
  if (client) return client;
  
  const url = import.meta.env.VITE_MQTT_URL;
  if (!url) {
    console.warn("VITE_MQTT_URL not set, MQTT disabled");
    // Return mock client for noop operations when MQTT is not configured
    // @ts-expect-error - mock client for noop publish when MQTT is disabled
    return { 
      publish: () => {}, 
      on: () => {}, 
      end: () => {},
      subscribe: () => {},
      unsubscribe: () => {}
    };
  }
  
  const username = import.meta.env.VITE_MQTT_USERNAME;
  const password = import.meta.env.VITE_MQTT_PASSWORD;
  
  const options: {
    clean: boolean;
    connectTimeout: number;
    reconnectPeriod: number;
    username?: string;
    password?: string;
  } = {
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  };
  
  if (username && password) {
    options.username = username;
    options.password = password;
  }
  
  client = mqtt.connect(url, options);
  
  client.on("connect", () => {
    console.log("✅ Secure MQTT client connected");
  });
  
  client.on("error", (error) => {
    console.error("❌ MQTT connection error:", error);
  });
  
  client.on("offline", () => {
    console.warn("⚠️ MQTT client offline");
  });
  
  return client;
}
