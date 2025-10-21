/**
 * MQTT Publisher utilities for Nautilus system
 * Provides subscription and publishing capabilities for real-time data
 */

import mqtt from "mqtt";

/**
 * Subscribe to forecast global intelligence data
 * @param callback Function to handle incoming forecast messages
 * @returns MQTT client instance
 */
export const subscribeForecast = (callback: (data: any) => void) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  
  client.on("connect", () => {
    console.log("✅ MQTT connected for forecast subscription");
    client.subscribe("nautilus/forecast/global", (err) => {
      if (err) {
        console.error("❌ Failed to subscribe to forecast topic:", err);
      } else {
        console.log("✅ Subscribed to nautilus/forecast/global");
      }
    });
  });
  
  client.on("message", (topic, message) => {
    if (topic === "nautilus/forecast/global") {
      try {
        const data = JSON.parse(message.toString());
        callback(data);
      } catch (err) {
        console.error("❌ Failed to parse forecast message:", err);
      }
    }
  });
  
  client.on("error", (error) => {
    console.error("❌ MQTT connection error:", error);
  });
  
  return client;
};

/**
 * Publish forecast data to the global topic
 * @param data Forecast data to publish
 */
export const publishForecast = (data: any) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  
  client.on("connect", () => {
    const message = JSON.stringify(data);
    client.publish("nautilus/forecast/global", message, { qos: 1 }, (err) => {
      if (err) {
        console.error("❌ Failed to publish forecast data:", err);
      } else {
        console.log("✅ Forecast data published");
      }
      client.end();
    });
  });
  
  client.on("error", (error) => {
    console.error("❌ MQTT publish error:", error);
    client.end();
  });
};
