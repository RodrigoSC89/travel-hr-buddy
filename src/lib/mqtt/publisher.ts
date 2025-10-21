/**
 * MQTT Publisher
 * Helper functions for publishing and subscribing to MQTT topics
 * Used by Forecast Global and ControlHub modules
 */

import mqtt from "mqtt";

/**
 * Publish an event to an MQTT topic
 * @param topic - MQTT topic to publish to
 * @param payload - Payload to publish (will be JSON stringified)
 */
export const publishEvent = (topic: string, payload: any) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  client.on("connect", () => {
    client.publish(topic, JSON.stringify(payload), { qos: 1 });
    client.end();
  });
};

/**
 * Subscribe to forecast updates from the Forecast Global module
 * Returns an MQTT client that can be used to unsubscribe
 * @param callback - Function to call when a message is received
 * @returns MQTT client instance
 */
export const subscribeForecast = (callback: (msg: any) => void) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  
  client.on("connect", () => {
    client.subscribe("nautilus/forecast/update");
  });
  
  client.on("message", (_, msg) => {
    try {
      const parsedMsg = JSON.parse(msg.toString());
      callback(parsedMsg);
    } catch (error) {
      console.error("Error parsing MQTT message:", error);
    }
  });
  
  return client;
};
