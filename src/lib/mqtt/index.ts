/**
 * MQTT Client
 * 
 * Lightweight MQTT client wrapper that connects to configurable brokers
 * and publishes telemetry data to the nautilus/telemetry/# topic hierarchy.
 * 
 * @module MQTTClient
 * @version 1.0.0 (Nautilus v3.3)
 */

import { mqttClient } from "@/utils/mqttClient";

/**
 * Initialize MQTT client with default configuration
 * 
 * @param brokerUrl - Optional MQTT broker URL (defaults to env variable)
 * @returns MQTT client instance
 */
export function initMQTT(brokerUrl?: string) {
  const url = brokerUrl || import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt";
  
  // Connect if not already connected
  if (!mqttClient.isConnected()) {
    mqttClient.connect(url);
  }

  return mqttClient;
}

export { mqttClient };
