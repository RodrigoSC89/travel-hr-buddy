/**
 * MQTT Publisher
 * Provides publish and subscribe functions for DP telemetry
 */

import mqtt from "mqtt";

/**
 * Publish an event to MQTT broker
 */
export const publishEvent = (topic: string, payload: Record<string, unknown>, qos: 0 | 1 | 2 = 1) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  client.on("connect", () => {
    client.publish(topic, JSON.stringify(payload), { qos }, (err) => {
      if (err) {
        console.error(`❌ Failed to publish to ${topic}:`, err);
      } else {
        console.log(`✅ Published to ${topic}:`, payload);
      }
      client.end();
    });
  });
  client.on("error", (err) => {
    console.error("❌ MQTT connection error:", err);
    client.end();
  });
};

/**
 * Subscribe to DP telemetry channel
 */
export const subscribeDP = (callback: (data: Record<string, unknown>) => void) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  
  client.on("connect", () => {
    client.subscribe("nautilus/dp/telemetry", (err) => {
      if (err) {
        console.error("❌ Failed to subscribe to nautilus/dp/telemetry:", err);
      } else {
        console.log("✅ Subscribed to nautilus/dp/telemetry");
      }
    });
  });
  
  client.on("message", (topic, msg) => {
    if (topic === "nautilus/dp/telemetry") {
      try {
        const data = JSON.parse(msg.toString());
        callback(data);
      } catch (err) {
        console.error("❌ Failed to parse MQTT message:", err);
      }
    }
  });
  
  client.on("error", (err) => {
    console.error("❌ MQTT connection error:", err);
  });
  
  return client;
};

/**
 * Subscribe to Forecast updates channel
 */
export const subscribeForecast = (callback: (data: Record<string, unknown>) => void) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  
  client.on("connect", () => {
    client.subscribe("nautilus/forecast/update", (err) => {
      if (err) {
        console.error("❌ Failed to subscribe to nautilus/forecast/update:", err);
      } else {
        console.log("✅ Subscribed to nautilus/forecast/update");
      }
    });
  });
  
  client.on("message", (topic, msg) => {
    if (topic === "nautilus/forecast/update") {
      try {
        const data = JSON.parse(msg.toString());
        callback(data);
      } catch (err) {
        console.error("❌ Failed to parse MQTT message:", err);
      }
    }
  });
  
  client.on("error", (err) => {
    console.error("❌ MQTT connection error:", err);
  });
  
  return () => {
    client.end();
  };
};
