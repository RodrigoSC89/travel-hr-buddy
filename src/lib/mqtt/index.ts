/**
 * MQTT Client
 * Lightweight MQTT client for telemetry streaming
 */

import mqtt, { MqttClient } from "mqtt";

import { logger } from "@/lib/logger";
let mqttClientInstance: MqttClient | null = null;

export function initMQTT(): MqttClient | null {
  const url = import.meta.env.VITE_MQTT_URL;
  
  if (!url) {
    console.warn("VITE_MQTT_URL not set, MQTT disabled");
    return null;
  }
  
  if (mqttClientInstance) {
    return mqttClientInstance;
  }
  
  const username = import.meta.env.VITE_MQTT_USER;
  const password = import.meta.env.VITE_MQTT_PASS;
  
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
  
  try {
    mqttClientInstance = mqtt.connect(url, options);
    
    mqttClientInstance.on("connect", () => {
      logger.info("✅ MQTT client connected");
    });
    
    mqttClientInstance.on("error", (error) => {
      console.error("❌ MQTT connection error:", error);
    });
    
    mqttClientInstance.on("offline", () => {
      console.warn("⚠️ MQTT client offline");
    });
    
    return mqttClientInstance;
  } catch (error) {
    console.error("❌ Failed to initialize MQTT client:", error);
    return null;
  }
}
