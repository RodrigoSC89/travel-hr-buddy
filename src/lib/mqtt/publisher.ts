import { initSecureMQTT } from "./secure-client";

/**
 * Publish an event to MQTT broker
 * 
 * @param topic - MQTT topic to publish to
 * @param payload - Data to publish (will be JSON stringified)
 * 
 * @example
 * publishEvent("nautilus/alerts/ack", { id: "alert-123" });
 */
export const publishEvent = (topic: string, payload: unknown): void => {
  try {
    const client = initSecureMQTT();
    const message = JSON.stringify(payload);
    
    client.publish(topic, message, { qos: 1 }, (error) => {
      if (error) {
        console.error(`❌ Failed to publish to ${topic}:`, error);
      } else {
        console.log(`✅ Published to ${topic}:`, payload);
      }
    });
  } catch (error) {
    console.error("❌ Error publishing MQTT event:", error);
  }
};
