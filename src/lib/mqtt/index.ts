/**
 * MQTT Client
 * Lightweight MQTT client for telemetry streaming
 */

import mqtt, { MqttClient } from "mqtt";

import { logger } from "@/lib/logger";
let mqttClientInstance: MqttClient | null = null;

export function initMQTT(): MqttClient | null {
  // Safe getter for env vars
  const getEnv = (key: string): string | undefined => {
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[key] as string | undefined;
      }
    } catch {
      return undefined;
    }
    return undefined;
  };

  const url = getEnv('VITE_MQTT_URL');
  
  if (!url) {
    // MQTT is optional - don't spam logs
    return null;
  }
  
  if (mqttClientInstance) {
    return mqttClientInstance;
  }
  
  const username = getEnv('VITE_MQTT_USER');
  const password = getEnv('VITE_MQTT_PASS');
  
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
      logger.error("❌ MQTT connection error", error);
    });
    
    mqttClientInstance.on("offline", () => {
      logger.warn("⚠️ MQTT client offline");
    });
    
    return mqttClientInstance;
  } catch (error) {
    logger.error("❌ Failed to initialize MQTT client", error);
    return null;
  }
}
