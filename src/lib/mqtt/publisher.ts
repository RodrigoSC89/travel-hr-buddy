/**
 * MQTT Publisher - Unified MQTT subscription handlers
 * 
 * Provides subscription functions for:
 * - Forecast data (meteo-oceânica)
 * - DP Intelligence data (dynamic positioning)
 * - System alerts
 * 
 * @module mqtt/publisher
 */

import mqtt from "mqtt";

/**
 * Subscribe to forecast updates
 * @param callback - Function to call when forecast data is received
 * @returns MQTT client instance
 */
export const subscribeForecast = (callback: (data: any) => void) => {
  const mqttUrl = import.meta.env.VITE_MQTT_URL || "ws://localhost:8883";
  const client = mqtt.connect(mqttUrl);
  
  client.on("connect", () => {
    console.log("📡 Connected to MQTT broker (Forecast)");
    client.subscribe("nautilus/forecast");
  });
  
  client.on("message", (topic, message) => {
    if (topic === "nautilus/forecast") {
      try {
        const data = JSON.parse(message.toString());
        callback(data);
      } catch (error) {
        console.error("Error parsing forecast message:", error);
      }
    }
  });
  
  client.on("error", (error) => {
    console.error("MQTT Forecast connection error:", error);
  });
  
  return client;
};

/**
 * Subscribe to DP Intelligence updates
 * @param callback - Function to call when DP data is received
 * @returns MQTT client instance
 */
export const subscribeDP = (callback: (data: any) => void) => {
  const mqttUrl = import.meta.env.VITE_MQTT_URL || "ws://localhost:8883";
  const client = mqtt.connect(mqttUrl);
  
  client.on("connect", () => {
    console.log("📡 Connected to MQTT broker (DP Intelligence)");
    client.subscribe("nautilus/dp");
  });
  
  client.on("message", (topic, message) => {
    if (topic === "nautilus/dp") {
      try {
        const data = JSON.parse(message.toString());
        callback(data);
      } catch (error) {
        console.error("Error parsing DP message:", error);
      }
    }
  });
  
  client.on("error", (error) => {
    console.error("MQTT DP connection error:", error);
  });
  
  return client;
};

/**
 * Subscribe to system alerts
 * Canal de alertas unificado
 * @param callback - Function to call when alert is received
 * @returns MQTT client instance
 */
export const subscribeAlerts = (callback: (data: any) => void) => {
  const mqttUrl = import.meta.env.VITE_MQTT_URL || "ws://localhost:8883";
  const client = mqtt.connect(mqttUrl);
  
  client.on("connect", () => {
    console.log("📡 Connected to MQTT broker (Alerts)");
    client.subscribe("nautilus/alerts");
  });
  
  client.on("message", (topic, message) => {
    if (topic === "nautilus/alerts") {
      try {
        const data = JSON.parse(message.toString());
        callback(data);
      } catch (error) {
        console.error("Error parsing alert message:", error);
      }
    }
  });
  
  client.on("error", (error) => {
    console.error("MQTT Alerts connection error:", error);
  });
  
  return client;
};
