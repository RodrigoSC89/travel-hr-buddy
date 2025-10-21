/**
 * MQTT Publisher
 * Communication backbone for BridgeLink Integration Core
 * Provides event publishing and subscription with offline support
 */

import { mqttClient } from "@/utils/mqttClient";

/**
 * Publish an event to a specific MQTT topic
 * @param topic - MQTT topic to publish to
 * @param payload - Data to publish (will be stringified)
 */
export const publishEvent = (topic: string, payload: any): void => {
  if (!mqttClient.isConnected()) {
    mqttClient.connect();
  }
  
  const message = typeof payload === "string" ? payload : JSON.stringify(payload);
  mqttClient.publish(topic, message);
};

/**
 * Subscribe to alert events
 * @param callback - Function to handle incoming alerts
 * @returns MQTT client instance for cleanup
 */
export const subscribeAlerts = (callback: (data: any) => void) => {
  if (!mqttClient.isConnected()) {
    mqttClient.connect();
  }
  
  mqttClient.subscribe("nautilus/alerts", (msg: string) => {
    try {
      const data = JSON.parse(msg);
      callback(data);
    } catch (error) {
      console.error("Failed to parse alert message:", error);
    }
  });
  
  return mqttClient;
};

/**
 * Subscribe to BridgeLink status updates
 * @param callback - Function to handle status updates
 * @returns MQTT client instance for cleanup
 */
export const subscribeBridgeStatus = (callback: (data: any) => void) => {
  if (!mqttClient.isConnected()) {
    mqttClient.connect();
  }
  
  mqttClient.subscribe("nautilus/bridgelink/status", (msg: string) => {
    try {
      const data = JSON.parse(msg);
      callback(data);
    } catch (error) {
      console.error("Failed to parse bridge status message:", error);
      // Provide fallback data on parse error
      callback({ online: false, latency: 0, lastSync: "—" });
    }
  });
  
  return mqttClient;
};

/**
 * Subscribe to forecast telemetry updates
 * @param callback - Function to handle forecast data
 * @returns MQTT client instance for cleanup
 */
export const subscribeForecast = (callback: (data: any) => void) => {
  if (!mqttClient.isConnected()) {
    mqttClient.connect();
  }
  
  mqttClient.subscribe("nautilus/forecast/telemetry", (msg: string) => {
    try {
      const data = JSON.parse(msg);
      callback(data);
    } catch (error) {
      console.error("Failed to parse forecast message:", error);
    }
  });
  
  return mqttClient;
};
